import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb,
  MapPin,
  ChevronRight,
  Globe,
  Settings,
  User,
  TrendingUp,
  FileText,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [userLocation, setUserLocation] = useState('Maharashtra');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Location detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd use reverse geocoding to get state from coordinates
          // For demo, we'll use Maharashtra as default
          setUserLocation('Karnataka');
        },
        () => {
          setUserLocation('Maharashtra'); // fallback
        }
      );
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-selector') && showLanguageSelector) {
        setShowLanguageSelector(false);
      }
      if (!target.closest('.location-selector') && showLocationSelector) {
        setShowLocationSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelector, showLocationSelector]);
  
  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' }
  ];
  
  const locations = [
    { name: 'Maharashtra', emoji: '🏙️' },
    { name: 'Gujarat', emoji: '🏭' },
    { name: 'Tamil Nadu', emoji: '🏛️' },
    { name: 'Karnataka', emoji: '🌆' },
    { name: 'West Bengal', emoji: '🎭' },
    { name: 'Telangana', emoji: '💻' }
  ];

  const stateInsights = {
    'Maharashtra': {
      English: {
        popular: 'Popular for gold investments and chit funds',
        embrace: 'Embraces digital payments',
        culturalText: 'Tell me about investment habits',
        englishText: 'Tell me about investment habits'
      },
      Hindi: {
        popular: 'सोना निवेश और चिट फंड के लिए लोकप्रिय',
        embrace: 'डिजिटल भुगतान को अपनाता है',
        culturalText: 'राज्य में निवेश की आदतों के बारे में बताएं',
        englishText: 'निवेश की आदतों के बारे में बताएं'
      },
      Marathi: {
        popular: 'सोने गुंतवणूक आणि चिट फंडासाठी लोकप्रिय',
        embrace: 'डिजिटल पेमेंट स्वीकारते',
        culturalText: 'राज्यातील गुंतवणुकीच्या सवयींबद्दल सांगा',
        englishText: 'गुंतवणुकीच्या सवयींबद्दल सांगा'
      },
      Tamil: {
        popular: 'தங்கம் முதலீடு மற்றும் சிட் ஃபண்டுகளுக்கு பிரபலம்',
        embrace: 'டிஜிட்டல் கொடுப்பனவுகளை ஏற்றுக்கொள்கிறது',
        culturalText: 'முதலீட்டு பழக்கவழக்கங்களைப் பற்றி சொல்லுங்கள்',
        englishText: 'முதலீட்டு பழக்கவழக்கங்களைப் பற்றி சொல்லுங்கள்'
      },
      Telugu: {
        popular: 'బంగారం పెట్టుబడులు మరియు చిట్ ఫండ్‌లకు ప్రసిద్ధి',
        embrace: 'డిజిటల్ చెల్లింపులను స్వీకరిస్తుంది',
        culturalText: 'పెట్టుబడి అలవాట్ల గురించి చెప్పండి',
        englishText: 'పెట్టుబడి అలవాట్ల గురించి చెప్పండి'
      },
      Gujarati: {
        popular: 'સોનાના રોકાણ અને ચિટ ફંડ માટે લોકપ્રિય',
        embrace: 'ડિજિટલ પેમેન્ટ અપનાવે છે',
        culturalText: 'રોકાણની આદતો વિશે કહો',
        englishText: 'રોકાણની આદતો વિશે કહો'
      }
    },
    'Gujarat': {
      English: {
        popular: 'Popular for business investments',
        embrace: 'Strong entrepreneurial culture',
        culturalText: 'Tell me about business investments',
        englishText: 'Tell me about business investments'
      },
      Hindi: {
        popular: 'व्यापारिक निवेश के लिए लोकप्रिय',
        embrace: 'मजबूत उद्यमशीलता संस्कृति',
        culturalText: 'व्यापारिक निवेश के बारे में बताएं',
        englishText: 'व्यापारिक निवेश के बारे में बताएं'
      },
      Marathi: {
        popular: 'व्यावसायिक गुंतवणुकीसाठी लोकप्रिय',
        embrace: 'मजबूत उद्योजक संस्कृती',
        culturalText: 'व्यावसायिक गुंतवणुकीबद्दल सांगा',
        englishText: 'व्यावसायिक गुंतवणुकीबद्दल सांगा'
      },
      Tamil: {
        popular: 'வணிக முதலீடுகளுக்கு பிரபலம்',
        embrace: 'வலுவான தொழில்முனைவோர் கலாச்சாரம்',
        culturalText: 'வணிக முதலீடுகளைப் பற்றி சொல்லுங்கள்',
        englishText: 'வணிக முதலீடுகளைப் பற்றி சொல்லுங்கள்'
      },
      Telugu: {
        popular: 'వ్యాపార పెట్టుబడులకు ప్రసిద్ధి',
        embrace: 'బలమైన వ్యవస్థాపక సంస్కృతి',
        culturalText: 'వ్యాపార పెట్టుబడుల గురించి చెప్పండి',
        englishText: 'వ్యాపార పెట్టుబడుల గురించి చెప్పండి'
      },
      Gujarati: {
        popular: 'વ્યાપારિક રોકાણ માટે લોકપ્રિય',
        embrace: 'મજબૂત ઉદ્યોગસાહસિક સંસ્કૃતિ',
        culturalText: 'વ્યાપારિક રોકાણ વિશે કહો',
        englishText: 'વ્યાપારિક રોકાણ વિશે કહો'
      }
    },
    'Tamil Nadu': {
      English: {
        popular: 'Popular for gold and property',
        embrace: 'Traditional saving methods',
        culturalText: 'Tell me about investment habits',
        englishText: 'Tell me about investment habits'
      },
      Hindi: {
        popular: 'सोना और संपत्ति के लिए लोकप्रिय',
        embrace: 'पारंपरिक बचत के तरीके',
        culturalText: 'निवेश की आदतों के बारे में बताएं',
        englishText: 'निवेश की आदतों के बारे में बताएं'
      },
      Marathi: {
        popular: 'सोने आणि मालमत्तेसाठी लोकप्रिय',
        embrace: 'पारंपरिक बचत पद्धती',
        culturalText: 'गुंतवणुकीच्या सवयींबद्दल सांगा',
        englishText: 'गुंतवणुकीच्या सवयींबद्दल सांगा'
      },
      Tamil: {
        popular: 'தங்கம் மற்றும் சொத்துக்களுக்கு பிரபலம்',
        embrace: 'பாரம்பரிய சேமிப்பு முறைகள்',
        culturalText: 'முதலீட்டு பழக்கவழக்கங்களைப் பற்றி சொல்லுங்கள்',
        englishText: 'முதலீட்டு பழக்கவழக்கங்களைப் பற்றி சொல்லுங்கள்'
      },
      Telugu: {
        popular: 'బంగారం మరియు ఆస్తులకు ప్రసిద్ధి',
        embrace: 'సాంప్రదాయ పొదుపు పద్ధతులు',
        culturalText: 'పెట్టుబడి అలవాట్ల గురించి చెప్పండి',
        englishText: 'పెట్టుబడి అలవాట్ల గురించి చెప్పండి'
      },
      Gujarati: {
        popular: 'સોના અને મિલકત માટે લોકપ્રિય',
        embrace: 'પરંપરાગત બચત પદ્ધતિઓ',
        culturalText: 'રોકાણની આદતો વિશે કહો',
        englishText: 'રોકાણની આદતો વિશે કહો'
      }
    },
    'Karnataka': {
      English: {
        popular: 'Tech hub with modern investment trends',
        embrace: 'Digital-first financial approach',
        culturalText: 'Tell me about tech investments',
        englishText: 'Tell me about tech investments'
      },
      Hindi: {
        popular: 'आधुनिक निवेश रुझानों के साथ तकनीकी केंद्र',
        embrace: 'डिजिटल-फर्स्ट वित्तीय दृष्टिकोण',
        culturalText: 'तकनीकी निवेश के बारे में बताएं',
        englishText: 'तकनीकी निवेश के बारे में बताएं'
      },
      Marathi: {
        popular: 'आधुनिक गुंतवणूक ट्रेंडसह तंत्रज्ञान केंद्र',
        embrace: 'डिजिटल-फर्स्ट आर्थिक दृष्टिकोन',
        culturalText: 'तंत्रज्ञान गुंतवणुकीबद्दल सांगा',
        englishText: 'तंत्रज्ञान गुंतवणुकीबद्दल सांगा'
      },
      Tamil: {
        popular: 'நவீன முதலீட்டு போக்குகளுடன் தொழில்நுட்ப மையம்',
        embrace: 'டிஜிட்டல்-முதல் நிதி அணுகுமுறை',
        culturalText: 'தொழில்நுட்ப முதலீடுகளைப் பற்றி சொல்லுங்கள்',
        englishText: 'தொழில்நுட்ப முதலீடுகளைப் பற்றி சொல்லுங்கள்'
      },
      Telugu: {
        popular: 'ఆధునిక పెట్టుబడి ట్రెండ్‌లతో టెక్ హబ్',
        embrace: 'డిజిటల్-ఫస్ట్ ఫైనాన్షియల్ అప్రోచ్',
        culturalText: 'టెక్ పెట్టుబడుల గురించి చెప్పండి',
        englishText: 'టెక్ పెట్టుబడుల గురించి చెప్పండి'
      },
      Gujarati: {
        popular: 'આધુનિક રોકાણ વલણો સાથે ટેક હબ',
        embrace: 'ડિજિટલ-ફર્સ્ટ નાણાકીય અભિગમ',
        culturalText: 'ટેક રોકાણ વિશે કહો',
        englishText: 'ટેક રોકાણ વિશે કહો'
      }
    },
    'West Bengal': {
      English: {
        popular: 'Traditional banking and cultural investments',
        embrace: 'Heritage-focused financial planning',
        culturalText: 'Tell me about cultural investments',
        englishText: 'Tell me about cultural investments'
      },
      Hindi: {
        popular: 'पारंपरिक बैंकिंग और सांस्कृतिक निवेश',
        embrace: 'विरासत-केंद्रित वित्तीय योजना',
        culturalText: 'सांस्कृतिक निवेश के बारे में बताएं',
        englishText: 'सांस्कृतिक निवेश के बारे में बताएं'
      },
      Marathi: {
        popular: 'पारंपरिक बँकिंग आणि सांस्कृतिक गुंतवणूक',
        embrace: 'वारसा-केंद्रित आर्थिक नियोजन',
        culturalText: 'सांस्कृतिक गुंतवणुकीबद्दल सांगा',
        englishText: 'सांस्कृतिक गुंतवणुकीबद्दल सांगा'
      },
      Tamil: {
        popular: 'பாரம்பரிய வங்கி மற்றும் கலாச்சார முதலீடுகள்',
        embrace: 'பாரம்பரிய-மையமான நிதித் திட்டமிடல்',
        culturalText: 'கலாச்சார முதலீடுகளைப் பற்றி சொல்லுங்கள்',
        englishText: 'கலாச்சார முதலீடுகளைப் பற்றி சொல்லுங்கள்'
      },
      Telugu: {
        popular: 'సాంప్రదాయ బ్యాంకింగ్ మరియు సాంస్కృతిక పెట్టుబడులు',
        embrace: 'వారసత్వ-కేంద్రిత ఆర్థిక ప్రణాళిక',
        culturalText: 'సాంస్కృతిక పెట్టుబడుల గురించి చెప్పండి',
        englishText: 'సాంస్కృతిక పెట్టుబడుల గురించి చెప్పండి'
      },
      Gujarati: {
        popular: 'પરંપરાગત બેંકિંગ અને સાંસ્કૃતિક રોકાણ',
        embrace: 'વારસા-કેન્દ્રિત નાણાકીય આયોજન',
        culturalText: 'સાંસ્કૃતિક રોકાણ વિશે કહો',
        englishText: 'સાંસ્કૃતિક રોકાણ વિશે કહો'
      }
    },
    'Telangana': {
      English: {
        popular: 'IT sector growth and startup investments',
        embrace: 'Innovation-driven financial solutions',
        culturalText: 'Tell me about startup investments',
        englishText: 'Tell me about startup investments'
      },
      Hindi: {
        popular: 'आईटी क्षेत्र की वृद्धि और स्टार्टअप निवेश',
        embrace: 'नवाचार-संचालित वित्तीय समाधान',
        culturalText: 'स्टार्टअप निवेश के बारे में बताएं',
        englishText: 'स्टार्टअप निवेश के बारे में बताएं'
      },
      Marathi: {
        popular: 'आयटी क्षेत्राची वाढ आणि स्टार्टअप गुंतवणूक',
        embrace: 'नवाचार-चालित आर्थिक समाधाने',
        culturalText: 'स्टार्टअप गुंतवणुकीबद्दल सांगा',
        englishText: 'स्टार्टअप गुंतवणुकीबद्दल सांगा'
      },
      Tamil: {
        popular: 'ஐடி துறை வளர்ச்சி மற்றும் ஸ்டார்ட்அப் முதலீடுகள்',
        embrace: 'புதுமை-உந்துதல் நிதி தீர்வுகள்',
        culturalText: 'ஸ்டார்ட்அப் முதலீடுகளைப் பற்றி சொல்லுங்கள்',
        englishText: 'ஸ்டார்ட்அப் முதலீடுகளைப் பற்றி சொல்லுங்கள்'
      },
      Telugu: {
        popular: 'ఐటి రంగ వృద్ధి మరియు స్టార్టప్ పెట్టుబడులు',
        embrace: 'ఇన్నోవేషన్-డ్రివెన్ ఫైనాన్షియల్ సొల్యూషన్స్',
        culturalText: 'స్టార్టప్ పెట్టుబడుల గురించి చెప్పండి',
        englishText: 'స్టార్టప్ పెట్టుబడుల గురించి చెప్పండి'
      },
      Gujarati: {
        popular: 'આઈટી ક્ષેત્રની વૃદ્ધિ અને સ્ટાર્ટઅપ રોકાણ',
        embrace: 'નવીનતા-સંચાલિત નાણાકીય ઉકેલો',
        culturalText: 'સ્ટાર્ટઅપ રોકાણ વિશે કહો',
        englishText: 'સ્ટાર્ટઅપ રોકાણ વિશે કહો'
      }
    }
  };
  
  const currentInsight = stateInsights[userLocation]?.[selectedLanguage] || stateInsights['Maharashtra']?.[selectedLanguage] || stateInsights['Maharashtra']['English'];

  // Text-to-speech functionality
  const speakPageContent = () => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    // If already speaking, stop the current speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      // Cancel any existing speech before starting new one
      window.speechSynthesis.cancel();
      
      // Wait a bit to ensure cancellation is complete
      setTimeout(() => {
        const textToSpeak = `
          ${getGreeting()}! ${currentContent.subtitle}
          ${currentContent.actionButtons.map(btn => `${btn.title}: ${btn.description}`).join('. ')}
          ${currentContent.stateInsights} for ${userLocation}: ${currentInsight.popular}. ${currentInsight.embrace}.
        `;

        const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Set language based on selection
        switch (selectedLanguage) {
          case 'Hindi':
            utterance.lang = 'hi-IN';
            break;
          case 'Marathi':
            utterance.lang = 'mr-IN';
            break;
          case 'Tamil':
            utterance.lang = 'ta-IN';
            break;
          case 'Telugu':
            utterance.lang = 'te-IN';
            break;
          case 'Gujarati':
            utterance.lang = 'gu-IN';
            break;
          default:
            utterance.lang = 'en-IN';
        }
        
        utterance.onstart = () => {
          console.log('Speech started successfully');
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log('Speech completed');
          setIsSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech error:', event.error);
          setIsSpeaking(false);
          
          // Handle different error types
          if (event.error === 'canceled') {
            console.log('Speech was canceled by user or system');
          } else if (event.error === 'not-allowed') {
            alert('Speech synthesis permission denied. Please allow microphone access.');
          } else if (event.error === 'network') {
            alert('Network error occurred during speech synthesis.');
          } else {
            alert(`Speech synthesis error: ${event.error}. Please try again.`);
          }
        };
        
        utterance.onpause = () => {
          console.log('Speech paused');
        };
        
        utterance.onresume = () => {
          console.log('Speech resumed');
        };
        
        // Start speech synthesis
        try {
          window.speechSynthesis.speak(utterance);
          console.log('Speech synthesis initiated');
        } catch (speakError) {
          console.error('Error calling speak():', speakError);
          setIsSpeaking(false);
          alert('Failed to start speech synthesis.');
        }
      }, 200); // Increased delay to ensure proper cancellation
      
    } catch (error) {
      console.error('Error in speech synthesis setup:', error);
      setIsSpeaking(false);
      alert('Failed to initialize speech synthesis.');
    }
  };

  // Language content
  const content = {
    English: {
      greeting: {
        morning: 'Good Morning',
        afternoon: 'Good Afternoon',
        evening: 'Good Evening'
      },
      subtitle: 'How can I assist you with your finances?',
      actionButtons: [
        {
          title: 'Get Savings Tips',
          description: 'Personalized advice for your financial goals'
        },
        {
          title: 'View Financial Trends',
          description: 'Market insights and investment opportunities'
        },
        {
          title: 'Explore Investment Options',
          description: 'Discover the best investment plans for you'
        }
      ],
      stateInsights: 'State-wise Insights'
    },
    Hindi: {
      greeting: {
        morning: 'सुप्रभात',
        afternoon: 'नमस्कार',
        evening: 'शुभ संध्या'
      },
      subtitle: 'मैं आपके वित्त में कैसे सहायता कर सकती हूं?',
      actionButtons: [
        {
          title: 'बचत की सलाह पाएं',
          description: 'आपके वित्तीय लक्ष्यों के लिए व्यक्तिगत सलाह'
        },
        {
          title: 'वित्तीय रुझान देखें',
          description: 'बाजार की जानकारी और निवेश के अवसर'
        },
        {
          title: 'निवेश विकल्प खोजें',
          description: 'आपके लिए सबसे अच्छी निवेश योजनाएं खोजें'
        }
      ],
      stateInsights: 'राज्य-वार अंतर्दृष्टि'
    },
    Marathi: {
      greeting: {
        morning: 'सुप्रभात',
        afternoon: 'नमस्कार',
        evening: 'शुभ संध्या'
      },
      subtitle: 'मी तुमच्या आर्थिक बाबतीत कशी मदत करू शकते?',
      actionButtons: [
        {
          title: 'बचतीचे सल्ले मिळवा',
          description: 'तुमच्या आर्थिक उद्दिष्टांसाठी वैयक्तिक सल्ला'
        },
        {
          title: 'आर्थिक ट्रेंड पहा',
          description: 'बाजारातील माहिती आणि गुंतवणुकीच्या संधी'
        },
        {
          title: 'गुंतवणूक पर्याय शोधा',
          description: 'तुमच्यासाठी सर्वोत्तम गुंतवणूक योजना शोधा'
        }
      ],
      stateInsights: 'राज्यनिहाय अंतर्दृष्टी'
    },
    Tamil: {
      greeting: {
        morning: 'காலை வணக்கம்',
        afternoon: 'மதிய வணக்கம்',
        evening: 'மாலை வணக்கம்'
      },
      subtitle: 'உங்கள் நிதி விஷயங்களில் நான் எப்படி உதவ முடியும்?',
      actionButtons: [
        {
          title: 'சேமிப்பு ஆலோசனைகள் பெறுங்கள்',
          description: 'உங்கள் நிதி இலக்குகளுக்கான தனிப்பட்ட ஆலோசனை'
        },
        {
          title: 'நிதி போக்குகளைப் பார்க்கவும்',
          description: 'சந்தை நுண்ணறிவு மற்றும் முதலீட்டு வாய்ப்புகள்'
        },
        {
          title: 'முதலீட்டு விருப்பங்களை ஆராயுங்கள்',
          description: 'உங்களுக்கான சிறந்த முதலீட்டு திட்டங்களைக் கண்டறியுங்கள்'
        }
      ],
      stateInsights: 'மாநில அடிப்படையிலான நுண்ணறிவு'
    },
    Telugu: {
      greeting: {
        morning: 'శుభోదయం',
        afternoon: 'మధ్యాహ్న నమస్కారం',
        evening: 'శుభ సాయంత్రం'
      },
      subtitle: 'మీ ఆర్థిక విషయాలలో నేను ఎలా సహాయం చేయగలను?',
      actionButtons: [
        {
          title: 'పొదుపు చిట్కాలు పొందండి',
          description: 'మీ ఆర్థిక లక్ష్యాలకు వ్యక్తిగత సలహా'
        },
        {
          title: 'ఆర్థిక ట్రెండ్‌లను చూడండి',
          description: 'మార్కెట్ అంతర్దృష్టి మరియు పెట్టుబడి అవకాశాలు'
        },
        {
          title: 'పెట్టుబడి ఎంపికలను అన్వేషించండి',
          description: 'మీకు అత్యుత్తమ పెట్టుబడి ప్రణాళికలను కనుగొనండి'
        }
      ],
      stateInsights: 'రాష్ట్రవారీ అంతర్దృష్టులు'
    },
    Gujarati: {
      greeting: {
        morning: 'સુપ્રભાત',
        afternoon: 'નમસ્તે',
        evening: 'શુભ સાંજ'
      },
      subtitle: 'હું તમારી નાણાકીય બાબતોમાં કેવી રીતે મદદ કરી શકું?',
      actionButtons: [
        {
          title: 'બચત સલાહ મેળવો',
          description: 'તમારા નાણાકીય લક્ષ્યો માટે વ્યક્તિગત સલાહ'
        },
        {
          title: 'નાણાકીય વલણો જુઓ',
          description: 'બજારની સમજ અને રોકાણની તકો'
        },
        {
          title: 'રોકાણ વિકલ્પો શોધો',
          description: 'તમારા માટે શ્રેષ્ઠ રોકાણ યોજનાઓ શોધો'
        }
      ],
      stateInsights: 'રાજ્યવાર અંતર્દૃષ્ટિ'
    }
  };
  
  const currentContent = content[selectedLanguage] || content.English;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return currentContent.greeting.morning;
    if (hour < 17) return currentContent.greeting.afternoon;
    return currentContent.greeting.evening;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Design */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FinLight</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Speaker Icon for Text-to-Speech */}
            <button
              onClick={speakPageContent}
              className={`p-2 rounded-lg transition-colors ${
                isSpeaking 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read page content'}
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </button>
            
            <div className="relative language-selector">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm">{selectedLanguage}</span>
            </button>
            
            {showLanguageSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.name);
                      setShowLanguageSelector(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                  >
                    <span className="text-sm">{lang.name}</span>
                    <span className="text-xs text-gray-500">{lang.native}</span>
                  </button>
                ))}
              </motion.div>
            )}
            </div>
          </div>
        </div>
        
        {/* Avatar and Greeting */}
        <div className="px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getGreeting()}!</h2>
              <p className="text-gray-600">{currentContent.subtitle}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            {currentContent.actionButtons.map((button, index) => (
              <Link
                key={index}
                to="/login"
                className="block w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{button.title}</h3>
                    <p className="text-sm text-gray-600">{button.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
          

          
          {/* State-wise Insights */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              {currentContent.stateInsights}
            </h3>
            
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{userLocation}</h4>
                  <div className="relative location-selector">
                     <button
                       onClick={() => setShowLocationSelector(!showLocationSelector)}
                       className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded-md"
                     >
                       <Settings className="w-3 h-3" />
                       <span>Change</span>
                     </button>
                     
                     {showLocationSelector && (
                       <motion.div
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48"
                       >
                        {locations.map((location) => (
                          <button
                            key={location.name}
                            onClick={() => {
                              setUserLocation(location.name);
                              setShowLocationSelector(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                              userLocation === location.name ? 'bg-orange-50 text-orange-700' : ''
                            }`}
                          >
                            <span className="text-lg">{location.emoji}</span>
                            <span className="text-sm">{location.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{currentInsight.popular}</p>
                <p className="text-sm text-gray-600 mb-3">{currentInsight.embrace}</p>
                
                <Link
                  to="/login"
                  className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentInsight.culturalText}</p>
                      <p className="text-xs text-gray-500">{currentInsight.englishText}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="px-6 pb-8">
          <Link
            to="/login"
            className="block w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center font-semibold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
          >
            Get Started with FinLight
          </Link>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Join thousands building wealth with cultural intelligence
          </p>
        </div>
      </div>
      
      {/* Desktop Fallback Message */}
      <div className="hidden md:block fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl max-w-md mx-4 text-center">
          <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mobile Experience</h2>
          <p className="text-gray-600 mb-4">
            FinLight is optimized for mobile devices. Please view on a mobile device or resize your browser window.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;