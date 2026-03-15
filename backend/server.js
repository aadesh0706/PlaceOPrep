const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const sessionRoutes = require('./routes/sessions');
const questionRoutes = require('./routes/questions');
const achievementRoutes = require('./routes/achievements');
const aptitudeRoutes = require('./routes/aptitude');
const codeExecutionRoutes = require('./routes/codeExecution');
const submissionRoutes = require('./routes/submissions');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';
const PY_ENGINE_URL = process.env.PY_ENGINE_URL || 'http://localhost:8000';

app.set('PY_ENGINE_URL', PY_ENGINE_URL);

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️  Server will continue without MongoDB. Some features may not work.');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/code', codeExecutionRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 PlaceOPrep Backend running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`🤖 AI Engine: ${PY_ENGINE_URL}`);
});