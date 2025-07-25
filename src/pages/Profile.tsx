import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Edit3,
  Save,
  X,
  Camera,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Target,
  Users,
  Star,
  Languages,
  Heart,
  Home,
  BookOpen,
  PiggyBank,
  Lightbulb
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'preferences' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    state: user?.culturalProfile?.state || '',
    language: user?.culturalProfile?.language || '',
    religion: user?.culturalProfile?.religion || '',
    familyStructure: user?.culturalProfile?.familyStructure || ''
  });

  const [notifications, setNotifications] = useState({
    goalReminders: true,
    festivalAlerts: true,
    communityUpdates: true,
    schemeNotifications: true,
    weeklyReports: true,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'friends',
    dataSharing: true,
    analyticsTracking: true,
    locationServices: true
  });

  const [knowledgeLevel, setKnowledgeLevel] = useState(user?.financial_knowledge_level || 'beginner');
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);

  const knowledgeLevels = [
    { value: 'beginner', label: 'Beginner', tagline: 'Start your money journey', icon: PiggyBank, color: 'bg-green-500' },
    { value: 'intermediate', label: 'Intermediate', tagline: 'Spend wisely, live better', icon: Lightbulb, color: 'bg-blue-500' },
    { value: 'proficient', label: 'Proficient', tagline: 'Save with purpose', icon: Target, color: 'bg-purple-500' },
    { value: 'advanced', label: 'Advanced', tagline: 'Let your money work for you', icon: TrendingUp, color: 'bg-orange-500' },
    { value: 'expert', label: 'Expert', tagline: 'Be your own financial expert', icon: Star, color: 'bg-red-500' }
  ];

  const handleUpdateKnowledgeLevel = async (newLevel: string) => {
    try {
      setIsUpdatingLevel(true);
      const response = await fetch('/api/users/knowledge-level', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ knowledge_level: newLevel })
      });
      
      if (response.ok) {
        setKnowledgeLevel(newLevel);
        // Update user in auth store
        updateUser({ ...user, financial_knowledge_level: newLevel });
      }
    } catch (error) {
      console.error('Error updating knowledge level:', error);
    } finally {
      setIsUpdatingLevel(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Update profile via API
      const updatedUser = await apiService.updateProfile({
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        culturalProfile: {
          state: editedProfile.state,
          language: editedProfile.language,
          religion: editedProfile.religion,
          familyStructure: editedProfile.familyStructure
        }
      });
      
      // Update local state
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSavings: 388000,
    goalsCompleted: 3,
    communityRank: 42,
    growthScore: user?.growthScore || 750,
    achievementsUnlocked: 8,
    daysActive: 45
  };

  const recentActivity = [
    {
      id: '1',
      type: 'goal_progress',
      title: 'Emergency Fund Goal',
      description: 'Added ₹5,000 to emergency fund',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: '🎯'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Festival Planner',
      description: 'Unlocked for planning Diwali savings',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: '🏆'
    },
    {
      id: '3',
      type: 'community',
      title: 'Joined Learning Circle',
      description: 'Festival Savings Circle',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: '👥'
    }
  ];

  const culturalInsights = [
    {
      title: 'Festival Savings Pattern',
      description: 'You save 40% more during festival seasons, typical for your cultural background',
      icon: '🎉'
    },
    {
      title: 'Community Influence',
      description: 'Your savings behavior aligns with 85% of users from your region',
      icon: '🏘️'
    },
    {
      title: 'Traditional Preferences',
      description: 'You prefer gold and fixed deposits, common in your cultural context',
      icon: '🏆'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
            <p className="text-indigo-100 mb-2">{user?.email}</p>
            <div className="flex items-center space-x-4 text-sm text-indigo-200">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {user?.culturalProfile?.state}
              </div>
              <div className="flex items-center">
                <Languages className="w-4 h-4 mr-1" />
                {user?.culturalProfile?.language}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since March 2024
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.growthScore}</div>
            <div className="text-sm text-indigo-200">Growth Score</div>
            <div className="text-xs text-indigo-300">Gold Level</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{(stats.totalSavings / 100000).toFixed(1)}L</div>
          <div className="text-sm text-gray-600">Total Savings</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.goalsCompleted}</div>
          <div className="text-sm text-gray-600">Goals Completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">#{stats.communityRank}</div>
          <div className="text-sm text-gray-600">Community Rank</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.achievementsUnlocked}</div>
          <div className="text-sm text-gray-600">Achievements</div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'settings', label: 'Settings', icon: Settings },
          { key: 'preferences', label: 'Preferences', icon: Bell },
          { key: 'security', label: 'Security', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      isEditing
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user?.phone}</p>
                    )}
                  </div>

                  {/* Cultural profile fields hidden for now */}
                </div>
              </div>

              {/* Cultural Insights section hidden for now */}
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="text-xl">{activity.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Link Bank Account</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Set New Goal</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Invite Friends</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">App Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Language</h4>
                    <p className="text-sm text-gray-600">Choose your preferred language</p>
                  </div>
                </div>
                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="gu">ગુજરાતી</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Financial Knowledge Level</h4>
                    <p className="text-sm text-gray-600">Update your financial expertise level</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-indigo-600 capitalize">{knowledgeLevel}</span>
              </div>

              {/* Knowledge Level Selection */}
              <div className="py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Choose Your Level</h4>
                <div className="grid grid-cols-1 gap-3">
                  {knowledgeLevels.map((level) => {
                    const IconComponent = level.icon;
                    return (
                      <button
                        key={level.value}
                        onClick={() => handleUpdateKnowledgeLevel(level.value)}
                        disabled={isUpdatingLevel}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          knowledgeLevel === level.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isUpdatingLevel ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${level.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{level.label}</h5>
                            <p className="text-sm text-gray-600">{level.tagline}</p>
                          </div>
                          {knowledgeLevel === level.value && (
                            <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Notifications</h4>
                    <p className="text-sm text-gray-600">Manage your notification preferences</p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  Configure
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Privacy</h4>
                    <p className="text-sm text-gray-600">Control your privacy settings</p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  Manage
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">Help &amp; Support</h4>
                    <p className="text-sm text-gray-600">Get help and contact support</p>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  Contact
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {key === 'goalReminders' && 'Get reminded about your savings goals'}
                      {key === 'festivalAlerts' && 'Receive alerts for upcoming festivals'}
                      {key === 'communityUpdates' && 'Stay updated with community activities'}
                      {key === 'schemeNotifications' && 'Get notified about new government schemes'}
                      {key === 'weeklyReports' && 'Receive weekly progress reports'}
                      {key === 'marketingEmails' && 'Receive promotional emails and offers'}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Account Secured</h4>
                    <p className="text-sm text-green-700">Your account is protected with strong security measures</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Change Password</h4>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>
                </button>

                <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Recommended</span>
                  </div>
                </button>

                <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Login History</h4>
                      <p className="text-sm text-gray-600">View your recent login activity</p>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>
                </button>

                <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Connected Devices</h4>
                      <p className="text-sm text-gray-600">Manage devices with access to your account</p>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;