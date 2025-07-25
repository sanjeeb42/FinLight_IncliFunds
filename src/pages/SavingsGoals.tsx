import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Gift, 
  Award, 
  Plus, 
  Edit3, 
  Trash2,
  IndianRupee,
  PiggyBank,
  Zap,
  Star,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Users,
  Flame
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SavingsGoal {
  id: number;
  name?: string;
  title?: string;
  name_hindi?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  target_date?: string;
  category: string;
  priority?: 'high' | 'medium' | 'low';
  monthly_target?: number;
  is_completed: boolean;
  cultural_context?: string;
  created_at?: string;
  updated_at?: string;
}

interface Achievement {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  points: number;
  icon: string;
  unlockedAt: Date;
  category: string;
}

interface Challenge {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  deadline: Date;
  participants: number;
  isJoined: boolean;
}

const SavingsGoals: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'goals' | 'festivals' | 'achievements' | 'challenges'>('goals');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch savings goals from API
  useEffect(() => {
    const fetchSavingsGoals = async () => {
      try {
        setLoading(true);
        const goals = await apiService.getSavingsGoals();
        setSavingsGoals(goals);
        setError(null);
      } catch (err) {
        console.error('Error fetching savings goals:', err);
        setError('Failed to load savings goals');
      } finally {
        setLoading(false);
      }
    };

    fetchSavingsGoals();
  }, []);

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Goal Setter',
      titleHindi: 'पहला लक्ष्य निर्धारक',
      description: 'Created your first savings goal',
      points: 100,
      icon: '🎯',
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      category: 'milestone'
    },
    {
      id: '2',
      title: 'Festival Planner',
      titleHindi: 'त्योहार योजनाकार',
      description: 'Started saving for Diwali celebrations',
      points: 150,
      icon: '🪔',
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'cultural'
    },
    {
      id: '3',
      title: 'Consistent Saver',
      titleHindi: 'निरंतर बचतकर्ता',
      description: 'Saved money for 30 consecutive days',
      points: 200,
      icon: '💪',
      unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      category: 'habit'
    }
  ];

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'No Spend November',
      titleHindi: 'नो स्पेंड नवंबर',
      description: 'Avoid unnecessary expenses for the entire month',
      target: 30,
      current: 12,
      reward: 500,
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      participants: 1250,
      isJoined: true
    },
    {
      id: '2',
      title: 'Festival Savings Sprint',
      titleHindi: 'त्योहार बचत स्प्रिंट',
      description: 'Save ₹5000 in 2 weeks for upcoming festivals',
      target: 5000,
      current: 2800,
      reward: 300,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      participants: 850,
      isJoined: false
    }
  ];

  const progressData = [
    { month: 'Jan', amount: 5000 },
    { month: 'Feb', amount: 12000 },
    { month: 'Mar', amount: 18000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 32000 },
    { month: 'Jun', amount: 38000 }
  ];

  const categoryData = savingsGoals.reduce((acc, goal) => {
    const existing = acc.find(item => item.name === goal.category);
    if (existing) {
      existing.value += goal.current_amount;
    } else {
      const colors = {
        emergency: '#ef4444',
        festival: '#f97316',
        education: '#3b82f6',
        wedding: '#8b5cf6',
        travel: '#06b6d4',
        investment: '#10b981'
      };
      acc.push({
        name: goal.category,
        value: goal.current_amount,
        color: colors[goal.category] || '#6b7280'
      });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTargets = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const overallProgress = (totalSavings / totalTargets) * 100;
  const growthScore = user?.growthScore || 750;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'festival': return '🎉';
      case 'education': return '📚';
      case 'wedding': return '💒';
      case 'travel': return '✈️';
      case 'investment': return '📈';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-blue-400 bg-blue-50';
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 900) return { level: 'Diamond', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 800) return { level: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 700) return { level: 'Silver', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { level: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-100' };
  };

  const scoreLevel = getScoreLevel(growthScore);

  return (
    <div className="space-y-6">
      {/* Header with Growth Score */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Savings &amp; Goals
            </h1>
            <p className="text-green-100 mb-1">
              {user?.culturalProfile?.language === 'Hindi' ? 'बचत और लक्ष्य' : 'Track your financial journey'}
            </p>
            <p className="text-sm text-green-200">
              Overall Progress: {overallProgress.toFixed(1)}% • {savingsGoals.length} active goals
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-8 h-8 ${scoreLevel.bg} rounded-full flex items-center justify-center`}>
                <Trophy className={`w-5 h-5 ${scoreLevel.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{growthScore}</div>
                <div className="text-sm text-green-200">{scoreLevel.level} Level</div>
              </div>
            </div>
            <div className="text-xs text-green-300">+25 points this week</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Saved</p>
              <p className="text-2xl font-bold text-green-600">₹{(totalSavings / 100000).toFixed(1)}L</p>
              <p className="text-xs text-gray-500">{overallProgress.toFixed(1)}% of target</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Target</p>
              <p className="text-2xl font-bold text-blue-600">₹{(savingsGoals.reduce((sum, goal) => sum + goal.monthly_target, 0) / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500">across all goals</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Next Festival</p>
              <p className="text-2xl font-bold text-orange-600">85</p>
              <p className="text-xs text-gray-500">days to Diwali</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-2xl font-bold text-purple-600">{achievements.length}</p>
              <p className="text-xs text-gray-500">unlocked</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'goals', label: 'My Goals', labelHindi: 'मेरे लक्ष्य' },
          { key: 'festivals', label: 'Festival Planner', labelHindi: 'त्योहार योजनाकार' },
          { key: 'achievements', label: 'Achievements', labelHindi: 'उपलब्धियां' },
          { key: 'challenges', label: 'Challenges', labelHindi: 'चुनौतियां' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="block text-xs text-gray-500">{tab.labelHindi}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {loading && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your savings goals...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && savingsGoals.length === 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <PiggyBank className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Goals Yet</h3>
                <p className="text-gray-600 mb-4">Start your financial journey by creating your first savings goal.</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Create Your First Goal
                </button>
              </div>
            )}

            {!loading && !error && savingsGoals.length > 0 && (
              <>
                {/* Progress Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Savings Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Your Goals</h3>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </button>
              </div>

              {savingsGoals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const deadline = new Date(goal.deadline);
                const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={goal.id}
                    className={`bg-white rounded-xl p-6 shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                      getPriorityColor(goal.priority)
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{getCategoryIcon(goal.category)}</div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{goal.name}</h4>
                          <p className="text-sm text-gray-600">{goal.name_hindi}</p>
                          {goal.cultural_context && (
                            <p className="text-xs text-gray-500 mt-1">{goal.cultural_context}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{(goal.current_amount / 100000).toFixed(1)}L
                        </div>
                        <div className="text-sm text-gray-500">
                          of ₹{(goal.target_amount / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{progress.toFixed(1)}% completed</span>
                        <span>{daysLeft} days left</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Monthly Target:</span>
                        <div className="font-medium">₹{goal.monthly_target.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <div className={`font-medium ${
                          goal.priority === 'high' ? 'text-red-600' :
                          goal.priority === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <div className="font-medium">{goal.category}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Deadline:</span>
                        <div className="font-medium">{deadline.toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        {progress >= 100 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </span>
                        )}
                        {daysLeft <= 30 && progress < 100 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'festivals' && (
          <motion.div
            key="festivals"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Festival Savings Planner</h3>
              <p className="text-gray-600">
                Plan and save for upcoming festivals with culturally-aware recommendations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Diwali 2024',
                  nameHindi: 'दिवाली 2024',
                  date: 'November 1, 2024',
                  daysLeft: 85,
                  recommended: 25000,
                  saved: 18000,
                  icon: '🪔',
                  traditions: ['Decorations', 'Gifts', 'Sweets', 'New Clothes']
                },
                {
                  name: 'Holi 2025',
                  nameHindi: 'होली 2025',
                  date: 'March 14, 2025',
                  daysLeft: 218,
                  recommended: 15000,
                  saved: 0,
                  icon: '🎨',
                  traditions: ['Colors', 'Sweets', 'Celebrations', 'Gifts']
                },
                {
                  name: 'Durga Puja 2024',
                  nameHindi: 'दुर्गा पूजा 2024',
                  date: 'October 9, 2024',
                  daysLeft: 62,
                  recommended: 20000,
                  saved: 5000,
                  icon: '🙏',
                  traditions: ['Pandal', 'Offerings', 'New Clothes', 'Celebrations']
                }
              ].map((festival, index) => {
                const progress = (festival.saved / festival.recommended) * 100;
                return (
                  <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{festival.icon}</div>
                      <h4 className="font-bold text-gray-900">{festival.name}</h4>
                      <p className="text-sm text-gray-600">{festival.nameHindi}</p>
                      <p className="text-xs text-gray-500 mt-1">{festival.date}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>₹{festival.saved.toLocaleString()}</span>
                        <span>₹{festival.recommended.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% saved</p>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Traditions:</h5>
                      <div className="flex flex-wrap gap-1">
                        {festival.traditions.map((tradition, idx) => (
                          <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {tradition}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {festival.daysLeft} days left
                      </div>
                      <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                        Start Saving
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.titleHindi}</p>
                      <p className="text-xs text-gray-500 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-purple-600">+{achievement.points} points</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Community Challenges</h3>
              <div className="space-y-4">
                {challenges.map((challenge) => {
                  const progress = (challenge.current / challenge.target) * 100;
                  const daysLeft = Math.ceil((challenge.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={challenge.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 flex items-center">
                            <Flame className="w-5 h-5 text-red-500 mr-2" />
                            {challenge.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">{challenge.titleHindi}</p>
                          <p className="text-sm text-gray-700">{challenge.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">+{challenge.reward}</div>
                          <div className="text-xs text-gray-500">points reward</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{challenge.current} / {challenge.target}</span>
                          <span>{progress.toFixed(1)}% complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {challenge.participants.toLocaleString()} participants
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {daysLeft} days left
                          </div>
                        </div>
                        
                        {challenge.isJoined ? (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Joined
                          </span>
                        ) : (
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            Join Challenge
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavingsGoals;