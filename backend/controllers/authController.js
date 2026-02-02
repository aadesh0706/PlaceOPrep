const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Achievement = require('../models/Achievement');
const fs = require('fs');
const path = require('path');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '7d'
  });
};

// Initialize achievements for new user
const initializeAchievements = async (userId) => {
  const achievements = [
    { type: 'first_steps', name: 'First Steps', description: 'Complete your first interview', target: 1, icon: '🎯' },
    { type: 'getting_started', name: 'Getting Started', description: 'Complete 5 interviews', target: 5, icon: '🚀' },
    { type: 'practice_perfect', name: 'Practice Makes Perfect', description: 'Complete 10 interviews', target: 10, icon: '💪' },
    { type: 'consistency', name: 'Consistency', description: 'Practice 3 days in a row', target: 3, icon: '🔥' },
    { type: 'week_warrior', name: 'Week Warrior', description: 'Practice 7 days in a row', target: 7, icon: '⚡' },
    { type: 'high_performer', name: 'High Performer', description: 'Score 80% or higher', target: 1, icon: '⭐' },
    { type: 'excellence', name: 'Excellence', description: 'Score 90% or higher', target: 1, icon: '🏆' },
    { type: 'technical_master', name: 'Technical Master', description: 'Complete 5 technical rounds', target: 5, icon: '💻' },
    { type: 'communication_expert', name: 'Communication Expert', description: 'Complete 5 HR rounds', target: 5, icon: '🗣️' },
    { type: 'aptitude_ace', name: 'Aptitude Ace', description: 'Complete 5 aptitude rounds', target: 5, icon: '🧠' },
    { type: 'simulation_champion', name: 'Simulation Champion', description: 'Complete a full simulation', target: 1, icon: '🎖️' },
    { type: 'time_warrior', name: 'Time Warrior', description: 'Practice for 10 hours', target: 600, icon: '⏰' }
  ];

  await Achievement.insertMany(achievements.map(ach => ({ ...ach, userId })));
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    // Initialize skills
    await Skill.create({ userId: user._id });

    // Initialize achievements
    await initializeAchievements(user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        gender: user.gender,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        gender: user.gender,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, gender, mobileNumber } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (gender !== undefined) updateData.gender = gender;
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
    
    // Handle file upload
    if (req.file) {
      const currentUser = await User.findById(req.userId);
      
      // Delete old avatar file if it exists and is a local file
      if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', currentUser.avatar);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old avatar:', err);
        });
      }
      
      // Set new avatar URL
      updateData.avatar = `/uploads/profiles/${req.file.filename}`;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/profiles', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
