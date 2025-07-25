import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Briefcase,
  CreditCard,
  Target,
  Calculator,
  TrendingUp,
  Shield,
  Heart,
  Home,
  Lightbulb,
  CheckCircle,
  X,
  Loader,
  Calendar,
  DollarSign,
  Minus,
  Users,
  Zap,
  TrendingDown,
  Gift,
  Umbrella,
  HelpCircle,
  BarChart3,
  List
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiService } from '../services/api';

interface UserProfile {
  location: string;
  familySize: number;
  dependents: number;
  incomeType: 'Fixed' | 'Daily' | 'Seasonal';
  income: number; // Renamed from monthlyIncome for consistency with demo
  monthlyIncome: number; // Keep for backward compatibility
  monthlyExpenses: number;
  existingLiabilities: number;
  currentSavings?: number;
  primaryGoal: 'education' | 'festive' | 'emergency' | 'investment' | 'retirement';
  // Demo structure fields
  rent: number;
  food: number;
  transport: number;
  utilities: number;
  other: number;
  savings: number;
  monthlySavingGoal: number;
  emis: number;
  expenses?: {
    food: number;
    transport: number;
    utilities: number;
    entertainment: number;
    healthcare: number;
    education: number;
    shopping: number;
    other: number;
  };
}

interface SimulationOption {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  inputs?: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: string;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
}

interface SimulationResult {
  scenario: string;
  impact: {
    monthlyBudget: number;
    savingsImpact: number;
    timeToGoal: string;
    recommendation: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
  aiInsights: string[];
  actionPlan: string[];
}

const ProfileForm: React.FC<{ onSubmit: (profile: UserProfile) => void }> = React.memo(({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    location: '',
    familySize: 1,
    dependents: 0,
    incomeType: 'Fixed',
    monthlyIncome: 0,
    income: 0,
    monthlyExpenses: 0,
    existingLiabilities: 0,
    primaryGoal: 'emergency',
    rent: 0,
    food: 0,
    transport: 0,
    utilities: 0,
    other: 0,
    savings: 0,
    monthlySavingGoal: 0,
    emis: 0,
    expenses: {
      food: 0,
      transport: 0,
      utilities: 0,
      entertainment: 0,
      healthcare: 0,
      education: 0,
      shopping: 0,
      other: 0
    }
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (formData.monthlyIncome && formData.location) {
      const totalExpensesFromBreakdown = (formData.rent || 0) + (formData.food || 0) + (formData.transport || 0) + 
                                        (formData.utilities || 0) + (formData.other || 0) + (formData.emis || 0);
      const totalExpensesFromDetailed = Object.values(formData.expenses || {}).reduce((sum, val) => sum + val, 0);
      
      const profileData = {
        ...formData,
        income: formData.monthlyIncome,
        monthlyExpenses: totalExpensesFromBreakdown > 0 ? totalExpensesFromBreakdown : 
                        totalExpensesFromDetailed > 0 ? totalExpensesFromDetailed : formData.monthlyExpenses
      } as UserProfile;
      
      onSubmit(profileData);
    } else {
      toast.error('Please fill in all required fields');
    }
  }, [formData, onSubmit]);

  const handleExpenseChange = useCallback((category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses!,
        [category]: value
      }
    }));
  }, []);
  
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const totalExpensesFromBreakdown = Object.values(formData.expenses || {}).reduce((sum, val) => sum + val, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <button
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your city/state"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Family Size
              </label>
              <input
                type="number"
                value={formData.familySize}
                onChange={(e) => handleInputChange('familySize', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dependents
              </label>
              <input
                type="number"
                value={formData.dependents}
                onChange={(e) => handleInputChange('dependents', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Income Type
            </label>
            <select
              value={formData.incomeType}
              onChange={(e) => handleInputChange('incomeType', e.target.value as 'Fixed' | 'Daily' | 'Seasonal')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Fixed">Fixed Monthly</option>
              <option value="Daily">Daily Wage</option>
              <option value="Seasonal">Seasonal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Income (₹) *
            </label>
            <input
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handleInputChange('monthlyIncome', value);
                handleInputChange('income', value); // Keep both for compatibility
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter monthly income"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Savings (₹)
            </label>
            <input
              type="number"
              value={formData.savings || 0}
              onChange={(e) => handleInputChange('savings', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your current savings"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Savings Goal (₹)
            </label>
            <input
              type="number"
              value={formData.monthlySavingGoal || 0}
              onChange={(e) => handleInputChange('monthlySavingGoal', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your monthly savings target"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Expenses Breakdown *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Rent/Housing (₹)
                </label>
                <input
                  type="number"
                  value={formData.rent || 0}
                  onChange={(e) => handleInputChange('rent', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Food (₹)
                </label>
                <input
                  type="number"
                  value={formData.food || 0}
                  onChange={(e) => handleInputChange('food', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Transport (₹)
                </label>
                <input
                  type="number"
                  value={formData.transport || 0}
                  onChange={(e) => handleInputChange('transport', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Utilities (₹)
                </label>
                <input
                  type="number"
                  value={formData.utilities || 0}
                  onChange={(e) => handleInputChange('utilities', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  EMIs/Loans (₹)
                </label>
                <input
                  type="number"
                  value={formData.emis || 0}
                  onChange={(e) => handleInputChange('emis', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Other Expenses (₹)
                </label>
                <input
                  type="number"
                  value={formData.other || 0}
                  onChange={(e) => handleInputChange('other', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Expense Breakdown (Optional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'food', label: 'Food & Dining', icon: '🍽️' },
                { key: 'transport', label: 'Transportation', icon: '🚗' },
                { key: 'utilities', label: 'Utilities', icon: '💡' },
                { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
                { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
                { key: 'education', label: 'Education', icon: '📚' },
                { key: 'shopping', label: 'Shopping', icon: '🛒' },
                { key: 'other', label: 'Other', icon: '📝' }
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {icon} {label}
                  </label>
                  <input
                    type="number"
                    value={formData.expenses?.[key as keyof typeof formData.expenses] || 0}
                    onChange={(e) => handleExpenseChange(key, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    min="0"
                    placeholder="₹0"
                  />
                </div>
              ))}
            </div>
            
            {totalExpensesFromBreakdown > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Monthly Expenses:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{totalExpensesFromBreakdown.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This will override the manual expense entry above
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Existing Liabilities (₹)
            </label>
            <input
              type="number"
              value={formData.existingLiabilities}
              onChange={(e) => handleInputChange('existingLiabilities', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Loans, EMIs, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Primary Goal
            </label>
            <select
              value={formData.primaryGoal}
              onChange={(e) => handleInputChange('primaryGoal', e.target.value as UserProfile['primaryGoal'])}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="emergency">Emergency Fund</option>
              <option value="education">Education</option>
              <option value="festive">Festive/Wedding</option>
              <option value="investment">Investment</option>
              <option value="retirement">Retirement</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Profile & Continue
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
});

const FinancialSimulations: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'profile' | 'simulations' | 'results'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<SimulationOption | null>(null);
  const [simulationInput, setSimulationInput] = useState('');
  const [simulationParams, setSimulationParams] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const handleParamChange = useCallback((fieldName: string, value: string) => {
    setSimulationParams(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedSimulation(null);
    setIsDialogOpen(false);
    setSimulationParams({});
    setSimulationInput('');
  }, []);

  const simulationOptions: SimulationOption[] = [
    {
      id: 'monthly-budget',
      title: 'Monthly Budget Forecast',
      description: 'Show me how my money flows this month.',
      category: 'budget',
      icon: 'monthly-budget',
      inputs: []
    },
    {
      id: 'can-i-afford',
      title: 'Can I Afford This?',
      description: 'e.g., Can I buy a new phone?',
      category: 'budget',
      icon: 'can-i-afford',
      inputs: [
        { name: 'expenseName', label: 'Item Name', type: 'text', required: true },
        { name: 'expenseAmount', label: 'One-time Cost (₹)', type: 'number', required: true, min: 0 }
      ]
    },
    {
      id: 'savings-goal',
      title: 'Savings Goal Tracker',
      description: 'e.g., How long to save ₹50,000?',
      category: 'planning',
      icon: 'savings-goal',
      inputs: [
        { name: 'goalAmount', label: 'Goal Amount (₹)', type: 'number', required: true, min: 0 }
      ]
    },
    {
      id: 'expense-reduction',
      title: 'Expense Reduction Impact',
      description: 'e.g., Reduce eating out by ₹1,000?',
      category: 'budget',
      icon: 'expense-reduction',
      inputs: [
        { name: 'reductionAmount', label: 'Monthly Reduction (₹)', type: 'number', required: true, min: 0 }
      ]
    },
    {
      id: 'life-event',
      title: 'Life Event Planner',
      description: 'e.g., What if I have a baby?',
      category: 'planning',
      icon: 'life-event',
      inputs: [
        { name: 'eventName', label: 'Event Name (e.g., Birth of a child)', type: 'text', required: true },
        { name: 'eventCost', label: 'Estimated Monthly Cost (₹)', type: 'number', required: true, min: 0 },
        { name: 'oneTimeCost', label: 'One-time Cost (₹)', type: 'number', required: false, min: 0 }
      ]
    },
    {
      id: 'loan-impact',
      title: 'Loan Impact Estimator',
      description: 'e.g., A microloan of ₹20,000 for 12 months.',
      category: 'debt',
      icon: 'loan-impact',
      inputs: [
        { name: 'loanAmount', label: 'Loan Amount (₹)', type: 'number', required: true, min: 0 },
        { name: 'loanTenure', label: 'Tenure (Months)', type: 'number', required: true, min: 1 },
        { name: 'interestRate', label: 'Annual Interest Rate (%)', type: 'number', required: true, min: 0, max: 100, step: '0.1' }
      ]
    },
    {
      id: 'income-drop',
      title: 'Income Drop Alert',
      description: 'e.g., Income reduced by ₹5,000.',
      category: 'planning',
      icon: 'income-drop',
      inputs: [
        { name: 'incomeReduction', label: 'Monthly Income Reduction (₹)', type: 'number', required: true, min: 0 }
      ]
    },
    {
      id: 'festive-spending',
      title: 'Festive Season Spending',
      description: 'e.g., How will Diwali shopping affect my savings?',
      category: 'planning',
      icon: 'festive-spending',
      inputs: [
        { name: 'festiveCost', label: 'Total Festive Spending (₹)', type: 'number', required: true, min: 0 }
      ]
    },
    {
      id: 'retirement-readiness',
      title: 'Retirement Readiness',
      description: 'e.g., How much to save for retirement?',
      category: 'investment',
      icon: 'retirement-readiness',
      inputs: [
        { name: 'currentAge', label: 'Your Current Age', type: 'number', required: true, min: 18, max: 100 },
        { name: 'retirementAge', label: 'Target Retirement Age', type: 'number', required: true, min: 50, max: 100 },
        { name: 'desiredMonthlyIncome', label: 'Desired Monthly Income post-retirement (₹)', type: 'number', required: true, min: 0 }
      ]
    },
    {
      id: 'weather-impact',
      title: 'Weather/Event Impact',
      description: 'e.g., How will 2 weeks of rain affect my income?',
      category: 'planning',
      icon: 'weather-impact',
      inputs: [
        { name: 'daysLost', label: 'Number of Days with No Income', type: 'number', required: true, min: 0 }
      ]
    },
    {
      id: 'emi-dilemma',
      title: 'EMI vs Saving Dilemma',
      description: 'e.g., Take an EMI or wait and save?',
      category: 'debt',
      icon: 'emi-dilemma',
      inputs: [
        { name: 'itemCost', label: 'Item Cost (₹)', type: 'number', required: true, min: 0 },
        { name: 'downPayment', label: 'Down Payment (if any) (₹)', type: 'number', required: false, min: 0 },
        { name: 'loanTenure', label: 'EMI Tenure (Months)', type: 'number', required: true, min: 1 },
        { name: 'interestRate', label: 'Annual Interest Rate (%)', type: 'number', required: true, min: 0, max: 100, step: '0.1' }
      ]
    },
    {
      id: 'investment-planning',
      title: 'Investment Planning',
      description: 'e.g., Invest ₹2,000/month for 5 years.',
      category: 'investment',
      icon: 'investment-planning',
      inputs: [
        { name: 'monthlyInvestment', label: 'Monthly Investment (₹)', type: 'number', required: true, min: 0 },
        { name: 'investmentYears', label: 'Investment Duration (Years)', type: 'number', required: true, min: 1 },
        { name: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'number', required: true, min: 0, max: 30, step: '0.1' }
      ]
    },
    {
      id: 'best-option',
      title: 'Best Option Selector',
      description: 'e.g., Compare buying a scooter vs. public transport.',
      category: 'planning',
      icon: 'best-option',
      inputs: [
        { name: 'optionOneName', label: 'Option 1 Name', type: 'text', required: true },
        { name: 'optionOneUpfront', label: 'Option 1 Upfront Cost (₹)', type: 'number', required: true, min: 0 },
        { name: 'optionOneMonthly', label: 'Option 1 Monthly Cost (₹)', type: 'number', required: true, min: 0 },
        { name: 'optionTwoName', label: 'Option 2 Name', type: 'text', required: true },
        { name: 'optionTwoUpfront', label: 'Option 2 Upfront Cost (₹)', type: 'number', required: true, min: 0 },
        { name: 'optionTwoMonthly', label: 'Option 2 Monthly Cost (₹)', type: 'number', required: true, min: 0 }
      ]
    }
  ];

  // Icon mapping for simulation options
  const getSimulationIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'monthly-budget': Calendar,
      'can-i-afford': DollarSign,
      'savings-goal': Target,
      'expense-reduction': Minus,
      'life-event': Users,
      'loan-impact': CreditCard,
      'income-drop': TrendingDown,
      'festive-spending': Gift,
      'retirement-readiness': Shield,
      'weather-impact': Umbrella,
      'emi-dilemma': HelpCircle,
      'investment-planning': TrendingUp,
      'best-option': List
    };
    return iconMap[iconName] || Calculator;
  };

  // Local simulation logic from demo
  const runLocalSimulation = (id: string, userProfile: UserProfile, simInputs: Record<string, any>) => {
    const totalExpenses = (userProfile.rent || 0) + (userProfile.food || 0) + (userProfile.transport || 0) + 
                         (userProfile.utilities || 0) + (userProfile.other || 0) + (userProfile.emis || 0);
    const disposableIncome = (userProfile.income || userProfile.monthlyIncome) - totalExpenses;

    switch (id) {
      case 'monthly-budget':
        return { 
          title: "Monthly Budget Breakdown", 
          summary: `You have ₹${disposableIncome.toFixed(2)} left after all expenses.`, 
          color: disposableIncome > 0 ? 'green' : 'red' 
        };
      case 'can-i-afford':
        const canAfford = disposableIncome >= simInputs.expenseAmount;
        return { 
          title: `Affordability Check: ${simInputs.expenseName || 'Item'}`, 
          summary: canAfford ? 
            `Yes, you can afford it. You will have ₹${(disposableIncome - simInputs.expenseAmount).toFixed(2)} remaining this month.` : 
            `Not recommended. This would create a deficit of ₹${(simInputs.expenseAmount - disposableIncome).toFixed(2)}.`, 
          color: canAfford ? 'green' : 'red' 
        };
      case 'savings-goal':
        if ((userProfile.monthlySavingGoal || 0) <= 0) 
          return { title: "Savings Goal", summary: "Your 'Monthly Savings Goal' in your profile is not set. Please update it.", color: 'orange' };
        const monthsToGoal = simInputs.goalAmount / (userProfile.monthlySavingGoal || 1);
        return { 
          title: `Reaching Your ₹${simInputs.goalAmount} Goal`, 
          summary: `It will take you approximately ${Math.ceil(monthsToGoal)} months (about ${(monthsToGoal / 12).toFixed(1)} years) to reach your goal.`, 
          color: 'blue' 
        };
      case 'expense-reduction':
        const newDisposable = disposableIncome + simInputs.reductionAmount;
        return { 
          title: "Expense Reduction Impact", 
          summary: `By reducing expenses by ₹${simInputs.reductionAmount}, your new monthly disposable income will be ₹${newDisposable.toFixed(2)}.`, 
          color: 'green' 
        };
      case 'life-event':
        const newTotalExpensesLifeEvent = totalExpenses + simInputs.eventCost;
        const newDisposableLifeEvent = (userProfile.income || userProfile.monthlyIncome) - newTotalExpensesLifeEvent;
        return { 
          title: `Impact of ${simInputs.eventName || 'Life Event'}`, 
          summary: `This event adds ₹${simInputs.eventCost} to monthly costs. Your new disposable income will be ₹${newDisposableLifeEvent.toFixed(2)}. ${simInputs.oneTimeCost ? `The one-time cost is ₹${simInputs.oneTimeCost}.` : ''}`, 
          color: newDisposableLifeEvent > 0 ? 'blue' : 'red' 
        };
      case 'loan-impact':
        const monthlyInterestRate = (simInputs.interestRate / 100) / 12;
        const emi = simInputs.loanAmount * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, simInputs.loanTenure)) / (Math.pow(1 + monthlyInterestRate, simInputs.loanTenure) - 1) || 0;
        const newDisposableLoan = disposableIncome - emi;
        return { 
          title: "Loan Impact Analysis", 
          summary: `The estimated EMI is ₹${emi.toFixed(2)}. Your disposable income would be ₹${newDisposableLoan.toFixed(2)}.`, 
          color: newDisposableLoan > 0 ? 'green' : 'red' 
        };
      case 'income-drop':
        const newIncome = (userProfile.income || userProfile.monthlyIncome) - simInputs.incomeReduction;
        const newDisposableDrop = newIncome - totalExpenses;
        return { 
          title: "Income Drop Alert", 
          summary: `With a reduced income of ₹${newIncome}, your new disposable income would be ₹${newDisposableDrop.toFixed(2)}.`, 
          color: newDisposableDrop > 0 ? 'blue' : 'red' 
        };
      case 'festive-spending':
        const canCoverFestive = (userProfile.savings || 0) >= simInputs.festiveCost;
        return { 
          title: "Festive Spending Impact", 
          summary: `This spending of ₹${simInputs.festiveCost} will reduce your savings to ₹${((userProfile.savings || 0) - simInputs.festiveCost).toFixed(2)}.`, 
          color: canCoverFestive ? 'blue' : 'orange' 
        };
      case 'retirement-readiness':
        const yearsToRetire = simInputs.retirementAge - simInputs.currentAge;
        if (yearsToRetire <= 0) return { title: "Retirement Readiness", summary: "Retirement age must be in the future.", color: 'orange' };
        const requiredCorpus = simInputs.desiredMonthlyIncome * 12 * 25;
        const monthlyInvestmentNeeded = requiredCorpus / (yearsToRetire * 12);
        return { 
          title: "Retirement Readiness", 
          summary: `To get ₹${simInputs.desiredMonthlyIncome}/month in retirement, you need a corpus of ~₹${requiredCorpus.toFixed(2)}. You should aim to invest ~₹${monthlyInvestmentNeeded.toFixed(2)} monthly.`, 
          color: 'blue' 
        };
      case 'weather-impact':
        const dailyIncome = userProfile.incomeType === 'Daily' ? (userProfile.income || userProfile.monthlyIncome) / 30 : (userProfile.income || userProfile.monthlyIncome) / 22;
        const incomeLost = dailyIncome * simInputs.daysLost;
        return { 
          title: "Weather/Event Impact", 
          summary: `Losing ${simInputs.daysLost} days of work could mean an income loss of approximately ₹${incomeLost.toFixed(2)}.`, 
          color: 'red' 
        };
      case 'emi-dilemma':
        const loanAmountForEmi = simInputs.itemCost - (simInputs.downPayment || 0);
        const monthlyInterestEmi = (simInputs.interestRate / 100) / 12;
        const emiValue = loanAmountForEmi * monthlyInterestEmi * (Math.pow(1 + monthlyInterestEmi, simInputs.loanTenure)) / (Math.pow(1 + monthlyInterestEmi, simInputs.loanTenure) - 1) || 0;
        const monthsToSave = (simInputs.itemCost - (simInputs.downPayment || 0)) / (userProfile.monthlySavingGoal || 1);
        return { 
          title: "EMI vs Saving", 
          summary: `Option 1 (EMI): Pay ₹${emiValue.toFixed(2)} for ${simInputs.loanTenure} months. Option 2 (Save): It would take you ~${Math.ceil(monthsToSave)} months to save for it.`, 
          color: 'blue' 
        };
      case 'investment-planning':
        const P = simInputs.monthlyInvestment;
        const r = (simInputs.expectedReturn / 100) / 12;
        const n = simInputs.investmentYears * 12;
        const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const totalInvested = P * n;
        return { 
          title: "Investment Growth Projection", 
          summary: `Investing ₹${P}/month for ${simInputs.investmentYears} years could grow to ~₹${futureValue.toFixed(2)}. Total amount invested would be ₹${totalInvested.toFixed(2)}.`, 
          color: 'green' 
        };
      case 'best-option':
        const totalCost1 = simInputs.optionOneUpfront + (simInputs.optionOneMonthly * 12);
        const totalCost2 = simInputs.optionTwoUpfront + (simInputs.optionTwoMonthly * 12);
        const cheaperOption = totalCost1 < totalCost2 ? simInputs.optionOneName : simInputs.optionTwoName;
        return { 
          title: "Option Comparison", 
          summary: `Annual cost for ${simInputs.optionOneName}: ₹${totalCost1.toFixed(2)}. For ${simInputs.optionTwoName}: ₹${totalCost2.toFixed(2)}. ${cheaperOption} seems cheaper over a year.`, 
          color: 'blue' 
        };
      default:
        return { title: 'Simulation Result', summary: 'This simulation logic is not yet implemented.', color: 'gray' };
    }
  };

  // Gemini AI integration
  const getGeminiAdvice = async (simulationResult: any, userProfile: UserProfile, inputs: Record<string, any>, simulationTitle: string) => {
    try {
      const prompt = `
        As a friendly and encouraging financial advisor in India, analyze the following scenario for a user and provide brief, actionable advice in 2-3 sentences.
        
        User's Financial Profile:
        - Monthly Income: ₹${userProfile.income || userProfile.monthlyIncome} (${userProfile.incomeType})
        - Total Monthly Expenses: ₹${(userProfile.rent || 0) + (userProfile.food || 0) + (userProfile.transport || 0) + (userProfile.utilities || 0) + (userProfile.other || 0) + (userProfile.emis || 0)}
        - Current Savings: ₹${userProfile.savings || userProfile.currentSavings || 0}
        - Monthly Savings Goal: ₹${userProfile.monthlySavingGoal || 0}

        Simulation Run: "${simulationTitle}"
        User's Input for Simulation: ${JSON.stringify(inputs)}
        
        Simulation Result:
        - Title: ${simulationResult.title}
        - Summary: ${simulationResult.summary}

        Based on this, what is your advice? Keep it simple, positive, and focused on the next step the user can take.
      `;

      // Note: In a real implementation, you would need to add your Gemini API key
      // For now, we'll return a placeholder response
      return "Based on your financial situation, I recommend reviewing your monthly expenses to identify areas where you can optimize spending. Consider setting up an emergency fund if you haven't already, and explore investment options that align with your risk tolerance.";
      
      // Uncomment and configure this section when you have a Gemini API key:
      /*
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        return "AI advice is currently unavailable. Please configure your Gemini API key.";
      }
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return "Sorry, I couldn't generate advice for this scenario. Please try again.";
      }
      */
    } catch (error) {
      console.error("Error fetching AI advice:", error);
      return "There was an error getting AI advice. Please check your connection and try again.";
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access simulations');
      navigate('/login');
      return;
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSimulationProfile();
        if (response.has_profile && response.profile) {
          setUserProfile(response.profile);
          setCurrentStep('simulations');
        } else {
          setShowProfileForm(true);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error('Failed to load profile. Please try again.');
          setShowProfileForm(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, navigate]);

  const handleProfileSubmit = async (profile: UserProfile) => {
    try {
      setLoading(true);
      
      if (!profile.location || !profile.monthlyIncome || !profile.monthlyExpenses) {
        toast.error('Please fill in all required fields.');
        return;
      }
      
      const response = await apiService.saveSimulationProfile(profile);
      if (response.success) {
        setUserProfile(profile);
        setShowProfileForm(false);
        setCurrentStep('simulations');
        toast.success('Profile saved successfully!');
      } else {
        toast.error('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedSimulation || !userProfile) return;

    try {
      setLoading(true);
      
      // Validate required inputs
      const missingFields = selectedSimulation.inputs?.filter(input => 
        input.required && !simulationParams[input.name]
      ) || [];
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }

      // Run local simulation logic
      const localResult = runLocalSimulation(selectedSimulation.id, userProfile, simulationParams);
      
      // Get AI advice
      const aiAdvice = await getGeminiAdvice(localResult, userProfile, simulationParams, selectedSimulation.title);
      
      // Format results to match expected structure
       const riskLevel: 'high' | 'medium' | 'low' = localResult.color === 'red' ? 'high' : localResult.color === 'orange' ? 'medium' : 'low';
       const formattedResults = {
         scenario: selectedSimulation.title,
         impact: {
           monthlyBudget: 0, // This could be calculated based on simulation type
           savingsImpact: 0,
           timeToGoal: "Calculated based on simulation",
           recommendation: localResult.summary,
           riskLevel
         },
         aiInsights: [aiAdvice],
         actionPlan: [
           "Review your current financial situation",
           "Consider the simulation results in your planning",
           "Take action based on the AI recommendations"
         ]
       };
      
      setSimulationResults(formattedResults);
      setCurrentStep('results');
      setIsDialogOpen(false);
      toast.success('Simulation completed successfully!');
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setCurrentStep('simulations');
    setSimulationResults(null);
    setSelectedSimulation(null);
    setSimulationParams({});
  };

  const editProfile = () => {
    setShowProfileForm(true);
    setCurrentStep('profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showProfileForm) {
    return <ProfileForm onSubmit={handleProfileSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Financial Simulations</h1>
          <p className="text-xl text-gray-600">Explore different financial scenarios and make informed decisions</p>
        </motion.div>

        {currentStep === 'simulations' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Profile: {userProfile?.location}</p>
                      <p className="text-sm font-medium">₹{userProfile?.monthlyIncome?.toLocaleString()} monthly income</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={editProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {simulationOptions.map((simulation, index) => {
                const IconComponent = getSimulationIcon(simulation.icon || 'calculator');
                
                return (
                  <motion.div
                    key={simulation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedSimulation(simulation);
                      setIsDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">{simulation.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{simulation.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium capitalize">{simulation.category}</span>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}

        {currentStep === 'results' && simulationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Simulation Results</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={resetSimulation}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Run Another
                  </button>
                  <button
                    onClick={editProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Financial Impact</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Budget Impact:</span>
                      <span className="font-semibold text-gray-900">₹{simulationResults.impact.monthlyBudget?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Savings Impact:</span>
                      <span className="font-semibold text-gray-900">₹{simulationResults.impact.savingsImpact?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time to Goal:</span>
                      <span className="font-semibold text-gray-900">{simulationResults.impact.timeToGoal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        simulationResults.impact.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        simulationResults.impact.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {simulationResults.impact.riskLevel?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Recommendation</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{simulationResults.impact.recommendation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                  </div>
                  <ul className="space-y-3">
                    {simulationResults.aiInsights?.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Target className="w-6 h-6 text-orange-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Action Plan</h3>
                  </div>
                  <ol className="space-y-3">
                    {simulationResults.actionPlan?.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {isDialogOpen && selectedSimulation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSimulation.title}</h2>
                  <button
                    onClick={handleCloseDialog}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">{selectedSimulation.description}</p>

                <div className="space-y-4">
                  {selectedSimulation.inputs?.map((input) => (
                    <div key={input.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {input.label} {input.required && <span className="text-red-500">*</span>}
                      </label>
                      {input.type === 'select' ? (
                        <select
                          value={simulationParams[input.name] || ''}
                          onChange={(e) => handleParamChange(input.name, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={input.required}
                        >
                          <option value="">Select an option</option>
                          {input.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={input.type}
                          value={simulationParams[input.name] || ''}
                          onChange={(e) => handleParamChange(input.name, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={input.placeholder}
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          required={input.required}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleCloseDialog}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runSimulation}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Running...
                      </>
                    ) : (
                      'Run Simulation'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FinancialSimulations;