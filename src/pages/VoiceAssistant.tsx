import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  MessageCircle,
  Languages,
  HelpCircle,
  Zap,
  LogIn
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  contentHindi?: string;
  timestamp: Date;
  isVoice?: boolean;
}

const VoiceAssistant: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Namaste ${user?.full_name || user?.name}! I'm your financial assistant. How can I help you today?`,
      contentHindi: `नमस्ते ${user?.full_name || user?.name}! मैं आपका वित्तीय सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(user?.culturalProfile?.language || 'English');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ];

  const quickQuestions = [
    {
      en: "How can I save for Diwali?",
      hi: "दिवाली के लिए कैसे बचत करूं?",
      category: "festival"
    },
    {
      en: "What government schemes am I eligible for?",
      hi: "मैं किन सरकारी योजनाओं के लिए पात्र हूं?",
      category: "schemes"
    },
    {
      en: "How to invest in gold digitally?",
      hi: "डिजिटल रूप से सोने में निवेश कैसे करें?",
      category: "investment"
    },
    {
      en: "Create an emergency fund plan",
      hi: "आपातकालीन फंड योजना बनाएं",
      category: "planning"
    }
  ];

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript, true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle different types of speech recognition errors
        let errorMessage = '';
        switch (event.error) {
          case 'network':
            errorMessage = selectedLanguage === 'Hindi' 
              ? 'नेटवर्क कनेक्शन की समस्या। कृपया अपना इंटरनेट कनेक्शन जांचें।'
              : 'Network connection issue. Please check your internet connection.';
            break;
          case 'not-allowed':
            errorMessage = selectedLanguage === 'Hindi'
              ? 'माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन की अनुमति दें।'
              : 'Microphone permission denied. Please allow microphone access in browser settings.';
            break;
          case 'no-speech':
            errorMessage = selectedLanguage === 'Hindi'
              ? 'कोई आवाज़ नहीं सुनाई दी। कृपया फिर से कोशिश करें।'
              : 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = selectedLanguage === 'Hindi'
              ? 'माइक्रोफोन तक पहुंच नहीं हो सकी। कृपया जांचें कि माइक्रोफोन जुड़ा है।'
              : 'Could not access microphone. Please check if microphone is connected.';
            break;
          default:
            errorMessage = selectedLanguage === 'Hindi'
              ? 'आवाज़ पहचान में समस्या। कृपया टाइप करके संदेश भेजें।'
              : 'Speech recognition error. Please try typing your message.';
        }
        
        setSpeechError(errorMessage);
        
        // Clear error after 5 seconds
        setTimeout(() => {
          setSpeechError(null);
        }, 5000);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedLanguage]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      // Clear any previous errors
      setSpeechError(null);
      
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        setSpeechError(
          selectedLanguage === 'Hindi'
            ? 'आवाज़ पहचान शुरू नहीं हो सकी। कृपया फिर से कोशिश करें।'
            : 'Could not start speech recognition. Please try again.'
        );
        
        // Clear error after 3 seconds
        setTimeout(() => {
          setSpeechError(null);
        }, 3000);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string, lang: string = 'en-IN') => {
    if (synthRef.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Language-specific response helper
  const getLanguageResponse = (type: string, language: string): string => {
    const responses: Record<string, Record<string, string>> = {
      greeting: {
        'English': 'Hello! I\'m your financial assistant. How can I help you today?',
        'Hindi': 'नमस्ते! मैं आपका वित्तीय सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?',
        'Tamil': 'வணக்கம்! நான் உங்கள் நிதி உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        'Telugu': 'నమస్కారం! నేను మీ ఆర్థిక సహాయకుడను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?',
        'Gujarati': 'નમસ્તે! હું તમારો નાણાકીય સહાયક છું. આજે હું તમારી કેવી રીતે મદદ કરી શકું?',
        'Marathi': 'नमस्कार! मी तुमचा आर्थिक सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?'
      },
      festival: {
        'English': 'For festivals like Diwali, consider investing in gold through SIP in Gold ETFs. It\'s a traditional and smart investment choice.',
        'Hindi': 'दिवाली जैसे त्योहारों के लिए सोना खरीदना एक अच्छा निवेश हो सकता है। आप SIP के माध्यम से गोल्ड ETF में निवेश कर सकते हैं।',
        'Tamil': 'தீபாவளி போன்ற பண்டிகைகளுக்கு, கோல்ட் ETF களில் SIP மூலம் தங்கத்தில் முதலீடு செய்வதைக் கருத்தில் கொள்ளுங்கள்.',
        'Telugu': 'దీపావళి వంటి పండుగలకు, గోల్డ్ ETF లలో SIP ద్వారా బంగారంలో పెట్టుబడి పెట్టడాన్ని పరిగణించండి.',
        'Gujarati': 'દિવાળી જેવા તહેવારો માટે, ગોલ્ડ ETF માં SIP દ્વારા સોનામાં રોકાણ કરવાનું વિચારો.',
        'Marathi': 'दिवाळी सारख्या सणांसाठी, गोल्ड ETF मध्ये SIP द्वारे सोन्यात गुंतवणूक करण्याचा विचार करा.'
      },
      scheme: {
        'English': 'You can benefit from government schemes like PM Kisan, Sukanya Samriddhi Yojana, and PPF for better savings.',
        'Hindi': 'आप PM Kisan, Sukanya Samriddhi Yojana, और PPF जैसी सरकारी योजनाओं का लाभ उठा सकते हैं।',
        'Tamil': 'PM கிசான், சுகன்யா சம்ரிதி யோஜனா மற்றும் PPF போன்ற அரசு திட்டங்களிலிருந்து நீங்கள் பயனடையலாம்.',
        'Telugu': 'మీరు PM కిసాన్, సుకన్య సమృద్ధి యోజన మరియు PPF వంటి ప్రభుత్వ పథకాల నుండి ప్రయోజనం పొందవచ్చు.',
        'Gujarati': 'તમે PM કિસાન, સુકન્યા સમૃદ્ધિ યોજના અને PPF જેવી સરકારી યોજનાઓનો લાભ લઈ શકો છો.',
        'Marathi': 'तुम्ही PM किसान, सुकन्या समृद्धी योजना आणि PPF सारख्या सरकारी योजनांचा फायदा घेऊ शकता.'
      },
      investment: {
        'English': 'For investments, you can choose Digital Gold, Gold ETFs, Mutual Funds, or SIPs for better returns.',
        'Hindi': 'निवेश के लिए आप Digital Gold, Gold ETF, Mutual Funds, या SIP का चुनाव कर सकते हैं।',
        'Tamil': 'முதலீடுகளுக்கு, நீங்கள் டிஜிட்டல் கோல்ட், கோல்ட் ETF, மியூச்சுவல் ஃபண்ட்ஸ் அல்லது SIP களைத் தேர்வு செய்யலாம்.',
        'Telugu': 'పెట్టుబడుల కోసం, మీరు డిజిటల్ గోల్డ్, గోల్డ్ ETF లు, మ్యూచువల్ ఫండ్స్ లేదా SIP లను ఎంచుకోవచ్చు.',
        'Gujarati': 'રોકાણ માટે, તમે ડિજિટલ ગોલ્ડ, ગોલ્ડ ETF, મ્યુચ્યુઅલ ફંડ અથવા SIP પસંદ કરી શકો છો.',
        'Marathi': 'गुंतवणुकीसाठी, तुम्ही डिजिटल गोल्ड, गोल्ड ETF, म्युच्युअल फंड किंवा SIP निवडू शकता.'
      },
      emergency: {
        'English': 'For emergency fund, keep 6 months of your income in Liquid Funds or high-yield savings accounts.',
        'Hindi': 'आपातकालीन फंड के लिए अपनी 6 महीने की आय का पैसा Liquid Funds या Savings Account में रखें।',
        'Tamil': 'அவசரகால நிதிக்கு, உங்கள் 6 மாத வருமானத்தை லிக்விட் ஃபண்ட்ஸ் அல்லது சேமிப்புக் கணக்குகளில் வைத்திருங்கள்.',
        'Telugu': 'అత్యవసర నిధి కోసం, మీ 6 నెలల ఆదాయాన్ని లిక్విడ్ ఫండ్స్ లేదా సేవింగ్స్ ఖాతాలలో ఉంచండి.',
        'Gujarati': 'કટોકટી ફંડ માટે, તમારી 6 મહિનાની આવકને લિક્વિડ ફંડ અથવા સેવિંગ્સ એકાઉન્ટમાં રાખો.',
        'Marathi': 'आपत्कालीन निधीसाठी, तुमच्या 6 महिन्यांचे उत्पन्न लिक्विड फंड किंवा बचत खात्यात ठेवा.'
      },
      default: {
        'English': 'I\'m here to help with your financial queries. Please ask me anything about savings, investments, or financial planning.',
        'Hindi': 'मैं आपकी वित्तीय सहायता के लिए यहाँ हूँ। कृपया अपना प्रश्न पूछें।',
        'Tamil': 'உங்கள் நிதி கேள்விகளுக்கு உதவ நான் இங்கே இருக்கிறேன். சேமிப்பு, முதலீடு அல்லது நிதித் திட்டமிடல் பற்றி என்னிடம் கேளுங்கள்.',
        'Telugu': 'మీ ఆర్థిక ప్రశ్నలతో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. పొదుపు, పెట్టుబడులు లేదా ఆర్థిక ప్రణాళిక గురించి నన్ను అడగండి.',
        'Gujarati': 'હું તમારા નાણાકીય પ્રશ્નોમાં મદદ કરવા માટે અહીં છું. બચત, રોકાણ અથવા નાણાકીય આયોજન વિશે મને કંઈપણ પૂછો.',
        'Marathi': 'मी तुमच्या आर्थिक प्रश्नांमध्ये मदत करण्यासाठी येथे आहे. बचत, गुंतवणूक किंवा आर्थिक नियोजनाबद्दल मला काहीही विचारा.'
      }
    };
    
    return responses[type]?.[language] || responses[type]?.['English'] || responses['default'][language] || responses['default']['English'];
  };

  const generateResponse = async (userMessage: string): Promise<{ content: string; contentHindi?: string }> => {
    try {
      // Map frontend language names to backend language codes
      const languageMap: Record<string, string> = {
        'English': 'en',
        'Hindi': 'hi',
        'Tamil': 'ta',
        'Telugu': 'te',
        'Gujarati': 'gu',
        'Marathi': 'mr',
        'Bengali': 'bn',
        'Kannada': 'kn'
      };
      
      const languageCode = languageMap[selectedLanguage] || 'en';
      
      // Try to get AI response from backend
      const response = await apiService.getChatResponse({
        message: userMessage,
        language: languageCode,
        user_context: {
          cultural_profile: user?.culturalProfile,
          financial_goals: user?.financialGoals
        }
      });
      
      // Handle different response formats from backend
      let responseText = '';
      if (response.content) {
        responseText = response.content;
      } else if (response.content) {
        responseText = response.content;
      } else {
        responseText = getLanguageResponse('default', selectedLanguage);
      }
      
      return {
        content: responseText,
        contentHindi: selectedLanguage === 'Hindi' ? responseText : response.content_hindi
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to language-specific mock responses based on keywords
      const lowerMessage = userMessage.toLowerCase();
      
      let responseType = 'default';
      
      if (lowerMessage.includes('diwali') || lowerMessage.includes('festival') || lowerMessage.includes('दिवाली') || lowerMessage.includes('त्योहार')) {
        responseType = 'festival';
      } else if (lowerMessage.includes('scheme') || lowerMessage.includes('government') || lowerMessage.includes('योजना') || lowerMessage.includes('सरकार')) {
        responseType = 'scheme';
      } else if (lowerMessage.includes('gold') || lowerMessage.includes('investment') || lowerMessage.includes('सोना') || lowerMessage.includes('निवेश')) {
        responseType = 'investment';
      } else if (lowerMessage.includes('emergency') || lowerMessage.includes('fund') || lowerMessage.includes('आपातकाल') || lowerMessage.includes('फंड')) {
        responseType = 'emergency';
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('नमस्ते') || lowerMessage.includes('नमस्कार')) {
        responseType = 'greeting';
      }
      
      const responseText = getLanguageResponse(responseType, selectedLanguage);
      
      return {
        content: responseText,
        contentHindi: selectedLanguage === 'Hindi' ? responseText : undefined
      };
    }
  };

  const handleSendMessage = async (text: string = inputText, isVoice: boolean = false) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await generateResponse(text);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        contentHindi: response.contentHindi,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak response if user used voice input
      if (isVoice) {
        const textToSpeak = selectedLanguage === 'Hindi' && response.contentHindi 
          ? response.contentHindi 
          : response.content;
        speakText(textToSpeak, selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-IN');
      }
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickQuestion = (question: any) => {
    const text = selectedLanguage === 'Hindi' ? question.hi : question.en;
    handleSendMessage(text);
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-gray-50">
        <div className="text-center p-8">
          <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to use the voice assistant.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Voice Assistant</h1>
              <p className="text-sm text-gray-600">
                {selectedLanguage === 'Hindi' ? 'आवाज़ सहायक' : 'Speak naturally in your language'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.name}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
            <Languages className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {selectedLanguage === 'Hindi' ? 'त्वरित प्रश्न:' : 'Quick Questions:'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
            >
              {selectedLanguage === 'Hindi' ? question.hi : question.en}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm whitespace-pre-line leading-relaxed">
                      {message.content.split('\n').map((line, index) => {
                        // Handle bullet points
                        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                          return (
                            <div key={index} className="flex items-start space-x-2 my-1">
                              <span className="text-blue-500 font-bold mt-0.5">•</span>
                              <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                            </div>
                          );
                        }
                        // Handle numbered lists
                        if (/^\d+\./.test(line.trim())) {
                          return (
                            <div key={index} className="flex items-start space-x-2 my-1">
                              <span className="text-blue-500 font-semibold">{line.match(/^\d+\./)?.[0]}</span>
                              <span>{line.replace(/^\d+\.\s*/, '')}</span>
                            </div>
                          );
                        }
                        // Handle bold text (text between **)
                        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
                        // Handle empty lines
                        if (line.trim() === '') {
                          return <div key={index} className="h-2"></div>;
                        }
                        return (
                          <div key={index} className="my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                        );
                      })}
                    </div>
                    {message.contentHindi && selectedLanguage === 'Hindi' && (
                      <p className="text-sm mt-2 pt-2 border-t border-gray-200 text-gray-600">
                        {message.contentHindi}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.type === 'assistant' && (
                        <button
                          onClick={() => {
                            const textToSpeak = selectedLanguage === 'Hindi' && message.contentHindi 
                              ? message.contentHindi 
                              : message.content;
                            speakText(textToSpeak, selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-IN');
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Play</span>
                        </button>
                      )}
                    </div>
                    {message.isVoice && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Mic className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-500">Voice message</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white text-gray-900 shadow-sm border border-gray-200 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          {/* Voice Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              placeholder={selectedLanguage === 'Hindi' ? 'अपना प्रश्न टाइप करें...' : 'Type your question...'}
              disabled={isProcessing || isListening}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing || isListening}
            className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>

          {/* Speaker Control */}
          <button
            onClick={isSpeaking ? stopSpeaking : () => {}}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isSpeaking
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
        
        {isListening && (
          <div className="mt-2 text-center">
            <p className="text-sm text-blue-600 animate-pulse">
              {selectedLanguage === 'Hindi' ? '🎤 सुन रहा हूं...' : '🎤 Listening...'}
            </p>
          </div>
        )}
        
        {speechError && (
          <div className="mt-2 text-center">
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              ⚠️ {speechError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;