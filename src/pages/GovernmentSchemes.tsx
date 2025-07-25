import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  FileText, 
  MapPin, 
  Phone, 
  User, 
  AlertCircle,
  ExternalLink,
  Filter,
  Search,
  Star,
  Calendar,
  Users,
  Award,
  Download,
  Share2
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';

interface GovernmentScheme {
  id: number;
  name: string;
  name_hindi?: string;
  description: string;
  department?: string;
  eligibility?: string[];
  eligibility_criteria?: string[];
  benefits?: string[];
  benefits_hindi?: string[];
  application_deadline?: string;
  max_amount?: number;
  category: string;
  state?: string;
  target_states?: string[];
  state_specific?: boolean;
  is_eligible?: boolean;
  is_active?: boolean;
  application_status?: 'not_applied' | 'applied' | 'approved' | 'rejected';
  documents_required?: string[];
  required_documents?: string[];
  application_process?: string;
  application_url?: string;
  priority?: 'high' | 'medium' | 'low';
  created_at?: string;
  updated_at?: string;
}

interface LocalAgent {
  id: string;
  name: string;
  specialization: string[];
  location: string;
  rating: number;
  experience: number;
  phone: string;
  languages: string[];
  avatar: string;
  successRate: number;
  helpedFamilies: number;
  isVerified: boolean;
}

const GovernmentSchemes: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'schemes' | 'agents' | 'applications'>('schemes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState(user?.culturalProfile?.state || 'All');
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch government schemes from API
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const schemesData = await apiService.getGovernmentSchemes();
        setSchemes(schemesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching government schemes:', err);
        // setError('Failed to load government schemes');
        // Fallback to mock data
        setSchemes(mockSchemes);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  // Mock data as fallback
  const mockSchemes: GovernmentScheme[] = [
    {
      id: 1,
      name: 'PM-KISAN Samman Nidhi',
      name_hindi: 'पीएम-किसान सम्मान निधि',
      description: 'Income support scheme for small and marginal farmers',
      department: 'Ministry of Agriculture & Farmers Welfare',
      eligibility: ['Small & marginal farmers', 'Land ownership required', 'Valid Aadhaar'],
      benefits: ['₹6,000 per year in 3 installments of ₹2,000 each'],
      benefits_hindi: ['प्रति वर्ष ₹6,000, तीन किस्तों में ₹2,000 प्रत्येक'],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_amount: 6000,
      category: 'Agriculture',
      state: 'All States',
      is_eligible: user?.culturalProfile?.incomeSource === 'Agriculture',
      application_status: 'not_applied',
      documents_required: ['Aadhaar Card', 'Bank Account Details', 'Land Records'],
      application_url: 'https://pmkisan.gov.in',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Atal Pension Yojana',
      name_hindi: 'अटल पेंशन योजना',
      description: 'Guaranteed pension scheme for unorganized sector workers',
      department: 'Ministry of Finance',
      eligibility: ['Age 18-40 years', 'Indian citizen', 'Bank account holder'],
      benefits: ['Guaranteed pension of ₹1,000 to ₹5,000 per month'],
      benefits_hindi: ['प्रति माह ₹1,000 से ₹5,000 तक गारंटीशुदा पेंशन'],
      max_amount: 60000,
      category: 'Pension',
      state: 'All States',
      is_eligible: true,
      application_status: 'not_applied',
      documents_required: ['Aadhaar Card', 'Bank Account', 'Mobile Number'],
      application_url: 'https://npscra.nsdl.co.in/atal-pension-yojana.php',
      priority: 'medium'
    }
  ];

  const localAgents: LocalAgent[] = [
    {
      id: '1',
      name: 'Ramesh Patel',
      specialization: ['PM-KISAN', 'Mudra Loans', 'Pension Schemes'],
      location: 'Ahmedabad, Gujarat',
      rating: 4.8,
      experience: 5,
      phone: '+91 98765 43210',
      languages: ['Hindi', 'Gujarati', 'English'],
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Indian%20man%20government%20agent%20professional%20portrait&image_size=square',
      successRate: 92,
      helpedFamilies: 150,
      isVerified: true
    },
    {
      id: '2',
      name: 'Priya Sharma',
      specialization: ['Women Schemes', 'Education Loans', 'Self Help Groups'],
      location: 'Pune, Maharashtra',
      rating: 4.9,
      experience: 7,
      phone: '+91 87654 32109',
      languages: ['Hindi', 'Marathi', 'English'],
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Indian%20woman%20government%20agent%20professional%20portrait&image_size=square',
      successRate: 95,
      helpedFamilies: 200,
      isVerified: true
    },
    {
      id: '3',
      name: 'Suresh Kumar',
      specialization: ['Agriculture Schemes', 'Rural Development', 'Subsidy Applications'],
      location: 'Jaipur, Rajasthan',
      rating: 4.7,
      experience: 8,
      phone: '+91 76543 21098',
      languages: ['Hindi', 'Rajasthani', 'English'],
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Indian%20man%20rural%20development%20agent%20portrait&image_size=square',
      successRate: 88,
      helpedFamilies: 180,
      isVerified: true
    }
  ];

  const categories = ['All', 'Agriculture', 'Pension', 'Business', 'Education', 'Healthcare', 'Housing'];
  const states = ['All', 'Gujarat', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'West Bengal'];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.name_hindi.includes(searchTerm) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesState = selectedState === 'All' || scheme.state === 'All States' || scheme.state === selectedState;
    return matchesSearch && matchesCategory && matchesState;
  });

  const eligibleSchemes = filteredSchemes.filter(scheme => scheme.is_eligible);
  const totalBenefits = eligibleSchemes.reduce((sum, scheme) => sum + scheme.max_amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'applied': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-blue-400 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Building2 className="w-6 h-6 mr-2" />
              Government Schemes
            </h1>
            <p className="text-blue-100 mb-1">
              {user?.culturalProfile?.language === 'Hindi' ? 'सरकारी योजनाएं' : 'Discover benefits you\'re eligible for'}
            </p>
            <p className="text-sm text-blue-200">
              Personalized for {user?.culturalProfile?.state} • {user?.culturalProfile?.language}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">₹{(totalBenefits / 100000).toFixed(1)}L</div>
            <div className="text-sm text-blue-200">Potential Benefits</div>
            <div className="text-xs text-blue-300">{eligibleSchemes.length} schemes eligible</div>
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
              <p className="text-sm text-gray-600">Eligible Schemes</p>
              <p className="text-2xl font-bold text-green-600">{eligibleSchemes.length}</p>
              <p className="text-xs text-gray-500">out of {schemes.length} total</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-blue-600">1</p>
              <p className="text-xs text-gray-500">in progress</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm text-gray-600">Local Agents</p>
              <p className="text-2xl font-bold text-purple-600">{localAgents.length}</p>
              <p className="text-xs text-gray-500">in your area</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">92%</p>
              <p className="text-xs text-gray-500">with agent help</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'schemes', label: 'Available Schemes', labelHindi: 'उपलब्ध योजनाएं' },
          { key: 'agents', label: 'Local Agents', labelHindi: 'स्थानीय एजेंट' },
          { key: 'applications', label: 'My Applications', labelHindi: 'मेरे आवेदन' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
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
              placeholder={user?.culturalProfile?.language === 'Hindi' ? 'योजना खोजें...' : 'Search schemes...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading government schemes...</p>
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
        {activeTab === 'schemes' && (
          <motion.div
            key="schemes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                  getPriorityColor(scheme.priority)
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{scheme.name}</h3>
                      {scheme.is_eligible && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Eligible
                        </span>
                      )}
                      {scheme.application_status && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          getStatusColor(scheme.application_status)
                        }`}>
                          {scheme.application_status.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{scheme.name_hindi}</p>
                    <p className="text-sm text-gray-700 mb-3">{scheme.description}</p>
                    <p className="text-xs text-gray-500 mb-3">{scheme.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₹{(scheme.max_amount / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">Max Benefit</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
                    <p className="text-sm text-gray-700">{scheme.benefits}</p>
                    {user?.culturalProfile?.language === 'Hindi' && (
                      <p className="text-sm text-gray-600 mt-1">{scheme.benefits_hindi}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Eligibility:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {scheme.eligibility.slice(0, 3).map((criteria, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      scheme.category === 'Agriculture' ? 'bg-green-100 text-green-700' :
                      scheme.category === 'Business' ? 'bg-blue-100 text-blue-700' :
                      scheme.category === 'Pension' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {scheme.category}
                    </span>
                    {scheme.application_deadline && (
                      <div className="flex items-center text-red-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">
                          Deadline: {new Date(scheme.application_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Documents
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'agents' && (
          <motion.div
            key="agents"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {localAgents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900">{agent.name}</h3>
                      {agent.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{agent.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{agent.experience} years</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {agent.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {agent.phone}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Specialization:</h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.specialization.map((spec, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-green-600">{agent.successRate}%</div>
                    <div className="text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{agent.helpedFamilies}</div>
                    <div className="text-gray-500">Families Helped</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Contact
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:text-gray-700 hover:border-gray-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'applications' && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track Your Applications</h3>
              <p className="text-gray-600 mb-6">
                Monitor the status of your government scheme applications and get updates
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Pradhan Mantri Mudra Yojana</h4>
                    <p className="text-sm text-gray-600">Applied on: March 15, 2024</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Under Review
                  </span>
                </div>
              </div>
              
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                View All Applications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  );
};

export default GovernmentSchemes;