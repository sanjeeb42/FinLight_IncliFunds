import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Globe,
  Building,
  GraduationCap,
  Lightbulb
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [levelContent, setLevelContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevelContent = async () => {
      try {
        setLoading(true);
        const levelContentData = await apiService.getLevelContent();
        setLevelContent(levelContentData);
      } catch (error: any) {
        console.error('Dashboard error:', error);
        toast.error('Failed to load dashboard content');
      } finally {
        setLoading(false);
      }
    };

    fetchLevelContent();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const dashboardOptions = [
    {
      id: 'savvy',
      title: 'Savvy',
      subtitle: '(Virtual Me)',
      icon: User,
      bgColor: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      onClick: () => navigate('/app/simulations')
    },
    {
      id: 'co-grow',
      title: 'Co-Grow',
      subtitle: '',
      icon: Globe,
      bgColor: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      onClick: () => navigate('/app/community')
    },
    {
      id: 'govt-connect',
      title: 'GovtConnect',
      subtitle: '',
      icon: Building,
      bgColor: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      onClick: () => navigate('/app/schemes')
    },
    {
      id: 'fin-ed',
      title: 'Fin.Ed',
      subtitle: '',
      icon: GraduationCap,
      bgColor: 'from-purple-500 to-violet-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      onClick: () => {
        // Navigate to financial education based on user level
        if (levelContent?.level) {
          // toast.success(`Opening ${levelContent.level} level financial lessons!`);
          // Navigate to community learning which has educational content
          navigate('/app/lessons');
        } else {
          toast.info('Financial education feature coming soon!');
          navigate('/app/lessons');
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>

        </div>
      </motion.div>

      {/* Dashboard Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 "
      >
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </motion.div>

      {/* Financial Knowledge Level Badge */}
      {levelContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold capitalize text-white">{levelContent.level} Level</h3>
                <p className="text-indigo-200 text-sm">{levelContent.tagline}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/app/profile')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-sm font-medium transition-all text-white"
            >
              Change
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Dashboard Options */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {dashboardOptions.map((option, index) => {
          const IconComponent = option.icon;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={option.onClick}
              className="bg-white rounded-3xl p-8 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 group shadow-lg border border-gray-200"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  {option.id === 'savvy' && (
                    <div className="w-16 h-16 bg-amber-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                  {option.id === 'co-grow' && (
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🌍</span>
                    </div>
                  )}
                  {option.id === 'govt-connect' && (
                    <div className="w-16 h-16 bg-gray-300 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏛️</span>
                    </div>
                  )}
                  {option.id === 'fin-ed' && (
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center relative">
                      <span className="text-2xl">📚</span>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs">💰</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg text-gray-900">{option.title}</h3>
                  {option.subtitle && (
                    <p className="text-gray-600 text-sm">{option.subtitle}</p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>


    </div>
  );
};

export default Dashboard;