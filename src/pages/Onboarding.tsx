import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, ChevronLeft, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

const onboardingSchema = z.object({
  // Cultural Profile (Optional)
  state: z.string().optional(),
  religion: z.string().optional(),
  language: z.string().optional(),
  familyStructure: z.string().optional(),
  incomeSource: z.string().min(1, 'Please select your income source'),
  
  // Financial Profile
  monthlyIncome: z.number().min(0, 'Please enter your monthly income'),
  monthlyExpenses: z.number().min(0, 'Please enter your monthly expenses'),
  savingsGoal: z.number().min(0, 'Please enter your savings goal'),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  
  // Goals
  primaryGoal: z.string().min(1, 'Please select your primary financial goal'),
  timeframe: z.string().min(1, 'Please select your timeframe'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const religions = [
    'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'
  ];

  const languages = [
    'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
    'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Other'
  ];

  const familyStructures = [
    'Nuclear Family', 'Joint Family', 'Extended Family', 'Single Parent', 'Living Alone'
  ];

  const incomeSources = [
    'Salaried Job', 'Business', 'Agriculture', 'Freelancing', 'Pension', 'Multiple Sources'
  ];

  const financialGoals = [
    'Emergency Fund', 'House Purchase', 'Child Education', 'Marriage/Wedding',
    'Retirement Planning', 'Business Investment', 'Debt Repayment', 'Festival Celebrations'
  ];

  const timeframes = [
    '6 months', '1 year', '2-3 years', '5 years', '10+ years'
  ];

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      toast.info('Voice assistant activated! Speak your preferences.');
    } else {
      toast.info('Voice assistant deactivated.');
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipOnboarding = async () => {
    try {
      // Mark onboarding as completed without profile data
      await completeOnboarding({
        cultural: {
          state: '',
          religion: '',
          language: '',
          familyStructure: '',
          incomeSource: 'Not specified',
        },
        financial: {
          monthlyIncome: 0,
          expenses: 0,
          savingsGoal: 0,
          riskTolerance: 'medium',
        },
        goals: {
          primary: 'Emergency Fund',
          timeframe: '1 year',
        }
      });
    //   toast.success('Welcome to FinTwin+! You can complete your profile anytime.');
      navigate('/app');
    } catch (error) {
      toast.error('Failed to skip onboarding. Please try again.');
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await completeOnboarding({
        cultural: {
          state: data.state || '',
          religion: data.religion || '',
          language: data.language || '',
          familyStructure: data.familyStructure || '',
          incomeSource: data.incomeSource,
        },
        financial: {
          monthlyIncome: data.monthlyIncome,
          expenses: data.monthlyExpenses,
          savingsGoal: data.savingsGoal,
          riskTolerance: data.riskTolerance,
        },
        goals: {
          primary: data.primaryGoal,
          timeframe: data.timeframe,
        }
      });
      toast.success('Profile setup completed! Welcome to your financial journey.');
      navigate('/app');
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cultural Profile</h2>
              <p className="text-gray-600">Help us understand your cultural background (Optional)</p>
              <p className="text-sm text-orange-600 mt-1">आपकी सांस्कृतिक पृष्ठभूमि (वैकल्पिक)</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">💡 You can skip this section and add cultural details later in your profile settings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  {...register('state')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your state (Optional)</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                <select
                  {...register('religion')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.religion ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your religion (Optional)</option>
                  {religions.map((religion) => (
                    <option key={religion} value={religion}>{religion}</option>
                  ))}
                </select>
                {errors.religion && <p className="mt-1 text-sm text-red-600">{errors.religion.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                <select
                  {...register('language')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.language ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your language (Optional)</option>
                  {languages.map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                {errors.language && <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Structure</label>
                <select
                  {...register('familyStructure')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.familyStructure ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select family structure (Optional)</option>
                  {familyStructures.map((structure) => (
                    <option key={structure} value={structure}>{structure}</option>
                  ))}
                </select>
                {errors.familyStructure && <p className="mt-1 text-sm text-red-600">{errors.familyStructure.message}</p>}
              </div>
            </div>
            
            {/* Skip Cultural Profile Button */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors duration-200"
              >
                Skip Cultural Profile & Continue to Income Details
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Income Profile</h2>
              <p className="text-gray-600">Tell us about your income source</p>
              <p className="text-sm text-orange-600 mt-1">आपकी आय का स्रोत</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Income Source</label>
              <select
                {...register('incomeSource')}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.incomeSource ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select income source</option>
                {incomeSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              {errors.incomeSource && <p className="mt-1 text-sm text-red-600">{errors.incomeSource.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income (₹)</label>
                <input
                  {...register('monthlyIncome', { valueAsNumber: true })}
                  type="number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.monthlyIncome ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter monthly income"
                />
                {errors.monthlyIncome && <p className="mt-1 text-sm text-red-600">{errors.monthlyIncome.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Expenses (₹)</label>
                <input
                  {...register('monthlyExpenses', { valueAsNumber: true })}
                  type="number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.monthlyExpenses ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter monthly expenses"
                />
                {errors.monthlyExpenses && <p className="mt-1 text-sm text-red-600">{errors.monthlyExpenses.message}</p>}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Goals</h2>
              <p className="text-gray-600">What are your financial aspirations?</p>
              <p className="text-sm text-orange-600 mt-1">आपके वित्तीय लक्ष्य</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Financial Goal</label>
                <select
                  {...register('primaryGoal')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.primaryGoal ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your primary goal</option>
                  {financialGoals.map((goal) => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
                {errors.primaryGoal && <p className="mt-1 text-sm text-red-600">{errors.primaryGoal.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                <select
                  {...register('timeframe')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.timeframe ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select timeframe</option>
                  {timeframes.map((timeframe) => (
                    <option key={timeframe} value={timeframe}>{timeframe}</option>
                  ))}
                </select>
                {errors.timeframe && <p className="mt-1 text-sm text-red-600">{errors.timeframe.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Savings Goal (₹)</label>
                <input
                  {...register('savingsGoal', { valueAsNumber: true })}
                  type="number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.savingsGoal ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter target amount"
                />
                {errors.savingsGoal && <p className="mt-1 text-sm text-red-600">{errors.savingsGoal.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
                <select
                  {...register('riskTolerance')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.riskTolerance ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select risk tolerance</option>
                  <option value="low">Low - Safe investments</option>
                  <option value="medium">Medium - Balanced approach</option>
                  <option value="high">High - Growth focused</option>
                </select>
                {errors.riskTolerance && <p className="mt-1 text-sm text-red-600">{errors.riskTolerance.message}</p>}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h2>
              <p className="text-gray-600">Review your profile and complete setup</p>
              <p className="text-sm text-orange-600 mt-1">लगभग पूरा हो गया!</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your FinTwin+ Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">State: <span className="font-medium text-gray-900">{watch('state') || 'Not specified'}</span></p>
                  <p className="text-gray-600">Language: <span className="font-medium text-gray-900">{watch('language') || 'Not specified'}</span></p>
                  <p className="text-gray-600">Religion: <span className="font-medium text-gray-900">{watch('religion') || 'Not specified'}</span></p>
                  <p className="text-gray-600">Income Source: <span className="font-medium text-gray-900">{watch('incomeSource')}</span></p>
                </div>
                <div>
                  <p className="text-gray-600">Primary Goal: <span className="font-medium text-gray-900">{watch('primaryGoal')}</span></p>
                  <p className="text-gray-600">Timeframe: <span className="font-medium text-gray-900">{watch('timeframe')}</span></p>
                  <p className="text-gray-600">Risk Level: <span className="font-medium text-gray-900">{watch('riskTolerance')}</span></p>
                  <p className="text-gray-600">Family Structure: <span className="font-medium text-gray-900">{watch('familyStructure') || 'Not specified'}</span></p>
                </div>
              </div>
              {(!watch('state') && !watch('language') && !watch('religion') && !watch('familyStructure')) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">📝 You can add cultural profile details anytime from your profile settings.</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Get personalized financial advice tailored to your goals</li>
                <li>• Join community circles and learn from peers</li>
                <li>• Access government schemes you're eligible for</li>
                <li>• Start earning rewards for financial milestones</li>
                {(watch('state') || watch('language') || watch('religion')) && (
                  <li>• Receive culturally relevant financial insights</li>
                )}
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <button
              onClick={handleSkipOnboarding}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300"
            >
              Skip Setup
            </button>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">F+</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Let's set up your cultural financial profile</p>
          <p className="text-sm text-gray-500 mt-2">You can always complete this later from your profile settings</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          {/* Voice Assistant Button */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isVoiceActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isVoiceActive ? <MicOff size={18} /> : <Mic size={18} />}
              <span className="text-sm font-medium">
                {isVoiceActive ? 'Stop Voice' : 'Voice Help'}
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-all duration-200"
                >
                  <span>Next</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:from-orange-600 hover:to-green-600 transition-all duration-200"
                >
                  <span>Complete Setup</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;