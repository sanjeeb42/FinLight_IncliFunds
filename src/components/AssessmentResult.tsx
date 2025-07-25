import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, BookOpen, TrendingUp, Award, ChevronRight } from 'lucide-react';

interface AssessmentResult {
  score: number;
  total_questions: number;
  knowledge_level: string;
  level_description: string;
  tagline: string;
}

interface AssessmentResultProps {
  result: AssessmentResult;
  onContinue: () => void;
}

const AssessmentResultComponent: React.FC<AssessmentResultProps> = ({ result, onContinue }) => {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return <BookOpen className="text-green-600" size={32} />;
      case 'intermediate':
        return <Star className="text-blue-600" size={32} />;
      case 'proficient':
        return <TrendingUp className="text-purple-600" size={32} />;
      case 'advanced':
        return <Award className="text-orange-600" size={32} />;
      case 'expert':
        return <Trophy className="text-yellow-600" size={32} />;
      default:
        return <BookOpen className="text-green-600" size={32} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'from-green-500 to-emerald-500';
      case 'intermediate':
        return 'from-blue-500 to-cyan-500';
      case 'proficient':
        return 'from-purple-500 to-violet-500';
      case 'advanced':
        return 'from-orange-500 to-red-500';
      case 'expert':
        return 'from-yellow-500 to-amber-500';
      default:
        return 'from-green-500 to-emerald-500';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Money Basics';
      case 'intermediate':
        return 'Smart Spending';
      case 'proficient':
        return 'Saving & Goals';
      case 'advanced':
        return 'Growing Money';
      case 'expert':
        return 'Financial Mastery';
      default:
        return 'Money Basics';
    }
  };

  const scorePercentage = (result.score / result.total_questions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-20 h-20 bg-gradient-to-r ${getLevelColor(result.knowledge_level)} rounded-2xl flex items-center justify-center mx-auto mb-4`}
            >
              {getLevelIcon(result.knowledge_level)}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Assessment Complete!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              Your financial knowledge has been evaluated
            </motion.p>
          </div>

          {/* Score Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {result.score}/{result.total_questions}
                </div>
                <div className="text-sm text-blue-500 font-medium">
                  {Math.round(scorePercentage)}% Score
                </div>
              </div>
            </div>
          </motion.div>

          {/* Knowledge Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`bg-gradient-to-r ${getLevelColor(result.knowledge_level)} rounded-xl p-6 mb-6 text-white`}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                Level: {getLevelName(result.knowledge_level)}
              </h2>
              <p className="text-lg font-medium opacity-90 mb-3">
                "{result.tagline}"
              </p>
              <p className="text-sm opacity-80 leading-relaxed">
                {result.level_description}
              </p>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50 rounded-xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Your dashboard will be customized based on your knowledge level</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You'll receive personalized learning content and recommendations</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>You can change your level anytime from your profile settings</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Track your progress as you advance through different levels</span>
              </li>
            </ul>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <button
              onClick={onContinue}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium text-lg"
            >
              <span>Continue to Dashboard</span>
              <ChevronRight size={20} />
            </button>
          </motion.div>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-gray-500">
              🎉 Great job on completing the assessment! Your financial journey starts now.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentResultComponent;