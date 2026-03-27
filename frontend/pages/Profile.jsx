import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Calendar, Award, Target, Clock, TrendingUp, Edit2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    mobileNumber: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        gender: userData.gender || '',
        mobileNumber: userData.mobileNumber || ''
      });
      if (userData.avatar) {
        const avatarUrl = userData.avatar.startsWith('/uploads/') 
          ? `${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000'}${userData.avatar}`
          : userData.avatar;
        setAvatarPreview(avatarUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.gender) {
        formDataToSend.append('gender', formData.gender);
      }
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      
      const response = await api.put('/auth/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const updatedUser = response.data.user;
      setUser(updatedUser);
      
      if (updatedUser.avatar) {
        const avatarUrl = updatedUser.avatar.startsWith('/uploads/') 
          ? `${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000'}${updatedUser.avatar}`
          : updatedUser.avatar;
        setAvatarPreview(avatarUrl);
      }
      
      setAvatarFile(null);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.name = updatedUser.name;
        userObj.avatar = updatedUser.avatar;
        localStorage.setItem('user', JSON.stringify(userObj));
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      gender: user?.gender || '',
      mobileNumber: user?.mobileNumber || ''
    });
    setAvatarFile(null);
    if (user?.avatar) {
      const avatarUrl = user.avatar.startsWith('/uploads/') 
        ? `${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000'}${user.avatar}`
        : user.avatar;
      setAvatarPreview(avatarUrl);
    } else {
      setAvatarPreview(null);
    }
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 minutes';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`;
    }
    return `${mins} minute${mins > 1 ? 's' : ''}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-red-700 flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 text-green-700 flex items-center space-x-2">
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50">
                    {user?.name || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{user?.email || 'Not set'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                {editing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <div className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50">
                    {user?.gender || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                {editing ? (
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Enter your mobile number"
                  />
                ) : (
                  <div className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{user?.mobileNumber || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                {editing ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={avatarPreview || (user?.avatar ? (user.avatar.startsWith('/uploads/') 
                            ? `${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000'}${user.avatar}`
                            : user.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`)}
                          alt="Preview"
                          className="w-24 h-24 rounded-full border-2 border-purple-500 object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choose Image</span>
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Max size: 5MB. Supported: JPEG, PNG, GIF, WebP</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      {user?.avatar ? 'Profile image uploaded' : 'No profile image'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Total Interviews</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{user?.totalInterviews || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Practice Time</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatTime(user?.practiceTime || 0)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Average Score</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{user?.averageScore?.toFixed(1) || 0}%</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-gray-700">Best Score</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{user?.bestScore?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              <img
                src={avatarPreview || (user?.avatar ? (user.avatar.startsWith('/uploads/') 
                  ? `${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000'}${user.avatar}`
                  : user.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`)}
                alt={user?.name || 'User'}
                className="w-32 h-32 rounded-full border-4 border-purple-500 mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'User'}</h3>
              <p className="text-gray-600 mb-4">{user?.email || 'user@example.com'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Details</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
              {user?.lastPracticeDate && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Last Practice</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(user?.lastPracticeDate)}</p>
                  </div>
                </div>
              )}
              {user?.currentStreak > 0 && (
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Current Streak</p>
                    <p className="text-sm font-semibold text-gray-900">{user.currentStreak} days</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
