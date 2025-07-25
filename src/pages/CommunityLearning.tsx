import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Star, 
  Award, 
  Clock, 
  MapPin, 
  BookOpen, 
  TrendingUp,
  Heart,
  Share2,
  Play,
  CheckCircle,
  UserPlus,
  Filter,
  Search,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';

interface LearningCircle {
  id: number | string;
  name: string;
  name_hindi?: string;
  description: string;
  members?: number;
  member_count?: number;
  max_members?: number;
  mentor?: {
    name: string;
    avatar: string;
    rating: number;
    expertise: string[];
  };
  category: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  location?: string;
  region?: string;
  next_session?: string;
  tags?: string[];
  is_joined?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MicroLesson {
  id: string;
  title: string;
  title_hindi: string;
  duration: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed_by: number;
  rating: number;
  thumbnail: string;
  is_completed: boolean;
  points: number;
  created_at?: string;
  updated_at?: string;
}

const CommunityLearning: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'circles' | 'lessons' | 'mentors'>('circles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [learningCircles, setLearningCircles] = useState<LearningCircle[]>([]);
  const [microLessons, setMicroLessons] = useState<MicroLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch community circles and lessons from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [circles, lessons] = await Promise.all([
          apiService.getCommunityCircles(),
          // For now, we'll use mock data for lessons since the API might not have this endpoint
          Promise.resolve([])
        ]);
        setLearningCircles(circles);
        // Set mock lessons if API doesn't return any
        if (lessons.length === 0) {
          setMicroLessons(mockMicroLessons);
        } else {
          setMicroLessons(lessons);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching community data:', err);
        // setError('Failed to load community data');
        // Fallback to mock data
        setLearningCircles(mockLearningCircles);
        setMicroLessons(mockMicroLessons);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data as fallback
  const mockLearningCircles: LearningCircle[] = [
    {
      id: '1',
      name: 'Festival Savings Circle',
      name_hindi: 'त्योहार बचत मंडली',
      description: 'Learn to save smartly for festivals and celebrations with culturally-aware strategies',
      members: 24,
      max_members: 30,
      mentor: {
        name: 'Priya Sharma',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Indian%20woman%20financial%20advisor%20professional%20portrait&image_size=square',
        rating: 4.8,
        expertise: ['Festival Planning', 'Cultural Finance', 'Savings']
      },
      category: 'Savings',
      level: 'Beginner',
      language: 'Hindi/English',
      location: 'Maharashtra',
      next_session: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Diwali', 'Festivals', 'Savings', 'Cultural'],
      is_joined: true
    },
    {
      id: '2',
      name: 'Digital Investment Basics',
      name_hindi: 'डिजिटल निवेश मूल बातें',
      description: 'Master digital investment platforms and apps popular in India',
      members: 18,
      max_members: 25,
      mentor: {
        name: 'Rajesh Kumar',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Indian%20man%20financial%20expert%20professional%20portrait&image_size=square',
        rating: 4.9,
        expertise: ['Digital Investing', 'Mutual Funds', 'SIP']
      },
      category: 'Investment',
      level: 'Intermediate',
      language: 'English',
      location: 'Karnataka',
      next_session: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Digital', 'Investment', 'Apps', 'SIP'],
      is_joined: false
    }
  ];

  const mockMicroLessons: MicroLesson[] = [
    {
      id: '1',
      title: 'Understanding SIP in 5 Minutes',
      title_hindi: '5 मिनट में SIP समझें',
      duration: 5,
      category: 'Investment',
      difficulty: 'Easy',
      completed_by: 1250,
      rating: 4.6,
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=SIP%20investment%20concept%20Indian%20rupee%20coins%20growth&image_size=landscape_16_9',
      is_completed: true,
      points: 50
    },
    {
      id: '2',
      title: 'Emergency Fund Calculator',
      title_hindi: 'आपातकालीन फंड कैलकुलेटर',
      duration: 8,
      category: 'Planning',
      difficulty: 'Medium',
      completed_by: 890,
      rating: 4.8,
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Emergency%20fund%20piggy%20bank%20calculator%20financial%20planning&image_size=landscape_16_9',
      is_completed: false,
      points: 75
    },
    {
      id: '3',
      title: 'Gold Investment in India',
      title_hindi: 'भारत में सोना निवेश',
      duration: 12,
      category: 'Investment',
      difficulty: 'Medium',
      completed_by: 2100,
      rating: 4.7,
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Gold%20investment%20digital%20gold%20Indian%20jewelry%20coins&image_size=landscape_16_9',
      is_completed: false,
      points: 100
    }
  ];

  const categories = ['All', 'Savings', 'Investment', 'Planning', 'Insurance', 'Tax'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCircles = learningCircles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.name_hindi.includes(searchTerm) ||
                         circle.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || circle.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || circle.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const filteredLessons = microLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.title_hindi.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const joinCircle = async (circleId: string | number) => {
    try {
      const numericId = typeof circleId === 'string' ? parseInt(circleId, 10) : circleId;
      await apiService.joinCommunityCircle(numericId);
      // Update local state
      setLearningCircles(prev => 
        prev.map(circle => 
          circle.id === circleId 
            ? { ...circle, is_joined: true, members: (circle.members || circle.member_count || 0) + 1 }
            : circle
        )
      );
    } catch (err) {
      console.error('Error joining circle:', err);
      setError('Failed to join circle');
    }
  };

  const startLesson = async (lessonId: string) => {
    try {
      // For now, just mark as completed locally since we don't have a specific API endpoint
      setMicroLessons(prev => 
        prev.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, is_completed: true }
            : lesson
        )
      );
    } catch (err) {
      console.error('Error starting lesson:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Community Learning
            </h1>
            <p className="text-purple-100 mb-1">
              {user?.culturalProfile?.language === 'Hindi' ? 'सामुदायिक शिक्षा' : 'Learn together, grow together'}
            </p>
            <p className="text-sm text-purple-200">
              Connect with mentors and peers from your region
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">1,250</div>
            <div className="text-sm text-purple-200">Learning Points</div>
            <div className="text-xs text-purple-300">Rank: #42 in {user?.culturalProfile?.state}</div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'circles', label: 'Learning Circles', labelHindi: 'शिक्षा मंडली' },
          { key: 'lessons', label: 'Micro Lessons', labelHindi: 'सूक्ष्म पाठ' },
          { key: 'mentors', label: 'Find Mentors', labelHindi: 'गुरु खोजें' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="block text-xs text-gray-500">{tab.labelHindi}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={user?.culturalProfile?.language === 'Hindi' ? 'खोजें...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {activeTab === 'circles' && (
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community data...</p>
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

      {/* Content */}
      {!loading && (
      <AnimatePresence mode="wait">
        {activeTab === 'circles' && (
          <motion.div
            key="circles"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filteredCircles.map((circle) => (
              <div key={circle.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{circle.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{circle.name_hindi}</p>
                    <p className="text-sm text-gray-700 mb-3">{circle.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {circle.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {circle.is_joined && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={circle.mentor.avatar}
                    alt={circle.mentor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{circle.mentor.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{circle.mentor.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{circle.mentor.expertise[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {circle.members}/{circle.max_members} members
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {circle.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(circle.next_session).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    {circle.level}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      circle.category === 'Savings' ? 'bg-green-100 text-green-700' :
                      circle.category === 'Investment' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {circle.category}
                    </span>
                    <span className="text-xs text-gray-500">{circle.language}</span>
                  </div>
                  
                  {circle.is_joined ? (
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </button>
                  ) : (
                    <button
                      onClick={() => joinCircle(circle.id)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'lessons' && (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={lesson.thumbnail}
                    alt={lesson.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <button
                      onClick={() => startLesson(lesson.id)}
                      className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                    >
                      <Play className="w-6 h-6 text-purple-600 ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lesson.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                      lesson.difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black bg-opacity-70 text-white rounded-full text-xs">
                      {lesson.duration} min
                    </span>
                  </div>
                  {lesson.is_completed && (
                    <div className="absolute bottom-3 right-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{lesson.title_hindi}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{lesson.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{lesson.completed_by.toLocaleString()} completed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lesson.category === 'Investment' ? 'bg-blue-100 text-blue-700' :
                      lesson.category === 'Planning' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {lesson.category}
                    </span>
                    <div className="flex items-center text-purple-600">
                      <Award className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">+{lesson.points} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'mentors' && (
          <motion.div
            key="mentors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Find Your Perfect Mentor</h3>
            <p className="text-gray-600 mb-6">
              Connect with experienced financial mentors from your region who understand your cultural context
            </p>
            <button className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors">
              Browse Mentors
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  );
};

export default CommunityLearning;