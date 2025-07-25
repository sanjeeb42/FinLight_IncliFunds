import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play, 
  Star,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Target,
  BarChart3,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  X,
  Calculator
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

interface LessonContent {
  title: string;
  content: string;
  type: 'text' | 'quiz' | 'interactive' | 'video';
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
  video?: {
    url: string;
    title: string;
    duration?: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Proficient' | 'Advanced' | 'Expert';
  category: string;
  completed: boolean;
  rating: number;
  icon: string;
  content: LessonContent[];
  video_url?: string;
  video_title?: string;
  has_interactive?: boolean;
}

const FinancialLessons: React.FC = () => {
  const { user } = useAuthStore();
  const [levelContent, setLevelContent] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<{[key: string]: number}>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [generatingAdditional, setGeneratingAdditional] = useState(false);
  const [videoProgress, setVideoProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const fetchLevelContent = async () => {
      try {
        setLoading(true);
        const levelContentData = await fetch('/api/users/level-content', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json());
        setLevelContent(levelContentData);
        
        // Check if we have dynamic lessons from AI
        if (levelContentData.content && levelContentData.content.lessons) {
          // Convert AI-generated lessons to our lesson format
          const dynamicLessons = convertAILessonsToFormat(levelContentData.content.lessons, levelContentData.level);
          setLessons(dynamicLessons);
        } else {
          // Fallback to static lessons
          const generatedLessons = generateLessonsForLevel(levelContentData.level);
          setLessons(generatedLessons);
        }
      } catch (error: any) {
        console.error('Error fetching level content:', error);
        // Fallback to beginner lessons
        setLessons(generateLessonsForLevel('Beginner'));
      } finally {
        setLoading(false);
      }
    };

    fetchLevelContent();
  }, []);

  const convertAILessonsToFormat = (aiLessons: any[], level: string): Lesson[] => {
    return aiLessons.map((aiLesson, index) => {
      const content: LessonContent[] = [
        {
          title: 'Lesson Introduction',
          content: aiLesson.description,
          type: 'text' as const
        }
      ];

      // Add comprehensive content sections
      if (aiLesson.content_sections && aiLesson.content_sections.length > 0) {
        aiLesson.content_sections.forEach((section: any) => {
          content.push({
            title: section.title,
            content: section.content + (section.examples ? `\n\n**Examples:**\n• ${section.examples.join('\n• ')}` : ''),
            type: 'text' as const
          });
        });
      }

      // Add multiple video content if available
      if (aiLesson.videos && aiLesson.videos.length > 0) {
        aiLesson.videos.forEach((video: any, videoIndex: number) => {
          content.push({
            title: `Educational Video ${videoIndex + 1}: ${video.title}`,
            content: video.description || `Watch this comprehensive video to deepen your understanding of ${aiLesson.title.toLowerCase()}.`,
            type: 'video' as const,
            video: {
              url: video.url,
              title: video.title,
              duration: video.duration || 10
            }
          });
        });
      } else if (aiLesson.video_url && aiLesson.video_title) {
        // Fallback for old format
        content.push({
          title: 'Educational Video',
          content: `Watch this video to learn more about ${aiLesson.title.toLowerCase()}.`,
          type: 'video' as const,
          video: {
            url: aiLesson.video_url,
            title: aiLesson.video_title,
            duration: Math.floor(aiLesson.duration * 0.3)
          }
        });
      }

      // Add practical exercise if available
      if (aiLesson.practical_exercise) {
        content.push({
          title: 'Practical Exercise',
          content: aiLesson.practical_exercise,
          type: 'interactive' as const
        });
      }

      // Add key takeaways
      if (aiLesson.key_takeaways && aiLesson.key_takeaways.length > 0) {
        content.push({
          title: 'Key Takeaways',
          content: `**Remember these important points:**\n• ${aiLesson.key_takeaways.join('\n• ')}`,
          type: 'text' as const
        });
      } else if (aiLesson.key_points) {
        // Fallback for old format
        content.push({
          title: 'Key Learning Points',
          content: `• ${aiLesson.key_points.join('\n• ')}`,
          type: 'text' as const
        });
      }

      // Add comprehensive quiz
      content.push({
        title: 'Knowledge Assessment',
        content: 'Test your comprehensive understanding of this lesson with this detailed assessment.',
        type: 'quiz' as const,
        quiz: {
          question: `Based on this comprehensive lesson about ${aiLesson.title.toLowerCase()}, what is the most important principle to remember?`,
          options: [
            'Apply the concepts consistently in daily financial decisions',
            'Memorize all the technical terms',
            'Focus only on short-term benefits',
            'Avoid taking any financial risks'
          ],
          correctAnswer: 0
        }
      });

      return {
        id: `ai-${index + 1}`,
        title: aiLesson.title,
        description: aiLesson.description,
        duration: aiLesson.duration || 35,
        difficulty: level.charAt(0).toUpperCase() + level.slice(1) as 'Beginner' | 'Intermediate' | 'Proficient' | 'Advanced' | 'Expert',
        category: aiLesson.category || 'Financial Education',
        completed: false,
        rating: 4.8,
        icon: getCategoryIcon(aiLesson.category),
        content,
        video_url: aiLesson.videos?.[0]?.url || aiLesson.video_url,
        video_title: aiLesson.videos?.[0]?.title || aiLesson.video_title,
        has_interactive: aiLesson.has_interactive || !!aiLesson.practical_exercise
      };
    });
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: {[key: string]: string} = {
      'Money Basics': '💰',
      'Budgeting': '📊',
      'Saving': '🏦',
      'Investing': '📈',
      'Insurance': '🛡️',
      'Tax Planning': '📋',
      'Goal Planning': '🎯',
      'Risk Management': '⚖️',
      'Retirement': '🏖️',
      'Wealth Building': '💎',
      'Cultural Finance': '🎭',
      'Banking': '💳',
      'Smart Spending': '🤔'
    };
    return iconMap[category] || '📚';
  };

  const generateLessonsForLevel = (level: string): Lesson[] => {
    // Normalize level to handle case variations from backend
    const normalizedLevel = level.toLowerCase();
    
    const lessonsByLevel = {
      'beginner': [
        {
          id: '1',
          title: 'Basic Financial Terms',
          description: 'Learn basic financial terms: income, expense, saving',
          duration: 15,
          difficulty: 'Beginner' as const,
          category: 'Money Basics',
          completed: false,
          rating: 4.8,
          icon: '💰',
          content: [
            {
              title: 'Understanding Income',
              content: 'Income is the money you receive from work, business, or investments. It\'s the foundation of your financial life and determines how much you can spend and save.',
              type: 'text'
            },
            {
              title: 'What are Expenses?',
              content: 'Expenses are the money you spend on things you need or want. They include rent, food, transportation, entertainment, and other purchases.',
              type: 'text'
            },
            {
              title: 'The Power of Saving',
              content: 'Saving means keeping some of your income for future use instead of spending it all. Even small amounts saved regularly can grow into significant sums over time.',
              type: 'text'
            },
            {
              title: 'Quick Quiz',
              content: 'Test your understanding of basic financial terms.',
              type: 'quiz',
              quiz: {
                question: 'What is the money you receive from work called?',
                options: ['Expense', 'Income', 'Saving', 'Investment'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '2',
          title: 'Needs vs. Wants',
          description: 'Understand the difference between needs vs. wants',
          duration: 12,
          difficulty: 'Beginner' as const,
          category: 'Money Basics',
          completed: false,
          rating: 4.7,
          icon: '🤔',
          content: [
            {
              title: 'What are Needs?',
              content: 'Needs are things you must have to survive and live safely: food, shelter, clothing, healthcare, and transportation to work.',
              type: 'text'
            },
            {
              title: 'What are Wants?',
              content: 'Wants are things that would be nice to have but aren\'t essential: expensive clothes, dining out, entertainment, luxury items.',
              type: 'text'
            },
            {
              title: 'Making Smart Choices',
              content: 'Before buying something, ask yourself: "Do I need this or do I want this?" Always prioritize needs first, then spend on wants if you have money left over.',
              type: 'text'
            },
            {
              title: 'Needs vs Wants Quiz',
              content: 'Test your understanding of needs and wants.',
              type: 'quiz',
              quiz: {
                question: 'Which of these is a NEED?',
                options: ['Designer shoes', 'Basic food', 'Video games', 'Expensive phone'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '3',
          title: 'Simple Budgeting',
          description: 'Simple budgeting exercises',
          duration: 20,
          difficulty: 'Beginner' as const,
          category: 'Money Basics',
          completed: false,
          rating: 4.9,
          icon: '📊',
          content: [
            {
              title: 'What is a Budget?',
              content: 'A budget is a plan for your money. It helps you decide how much to spend on different things and ensures you don\'t spend more than you earn.',
              type: 'text'
            },
            {
              title: 'Simple Budget Rule',
              content: 'Try the 50-30-20 rule: 50% for needs (rent, food), 30% for wants (entertainment), and 20% for savings. Adjust these percentages based on your situation.',
              type: 'text'
            },
            {
              title: 'Creating Your First Budget',
              content: 'Write down your monthly income, then list all your expenses. Make sure your expenses don\'t exceed your income. If they do, look for areas to cut back.',
              type: 'text'
            },
            {
              title: 'Budget Quiz',
              content: 'Test your budgeting knowledge.',
              type: 'quiz',
              quiz: {
                question: 'In the 50-30-20 rule, what percentage goes to savings?',
                options: ['50%', '30%', '20%', '10%'],
                correctAnswer: 2
              }
            }
          ]
        },
        {
          id: '4',
          title: 'Cash, Bank & Mobile Wallets',
          description: 'Introduction to cash, bank, mobile wallets',
          duration: 18,
          difficulty: 'Beginner' as const,
          category: 'Money Basics',
          completed: false,
          rating: 4.6,
          icon: '💳',
          content: [
            {
              title: 'Cash Money',
              content: 'Cash is physical money - coins and paper bills. It\'s useful for small purchases and places that don\'t accept cards, but it can be lost or stolen.',
              type: 'text'
            },
            {
              title: 'Bank Accounts',
              content: 'Banks keep your money safe and let you access it through ATMs and cards. Savings accounts earn interest, while checking accounts are for daily spending.',
              type: 'text'
            },
            {
              title: 'Mobile Wallets',
              content: 'Mobile wallets like Paytm, PhonePe, and Google Pay let you pay using your phone. They\'re convenient and secure for online and offline purchases.',
              type: 'text'
            },
            {
              title: 'Payment Methods Quiz',
              content: 'Test your knowledge about payment methods.',
              type: 'quiz',
              quiz: {
                question: 'Which payment method earns interest on your money?',
                options: ['Cash', 'Savings account', 'Mobile wallet', 'Credit card'],
                correctAnswer: 1
              }
            }
          ]
        }
      ],
      'intermediate': [
        {
          id: '5',
          title: 'Mindful Spending',
          description: 'Learn about mindful spending',
          duration: 25,
          difficulty: 'Intermediate' as const,
          category: 'Smart Spending',
          completed: false,
          rating: 4.8,
          icon: '🧠',
          content: [
            {
              title: 'What is Mindful Spending?',
              content: 'Mindful spending means being intentional with your money. Before buying anything, pause and think: "Do I really need this? Will it add value to my life?"',
              type: 'text'
            },
            {
              title: 'The 24-Hour Rule',
              content: 'For purchases over ₹1000, wait 24 hours before buying. This helps you avoid impulse purchases and gives you time to consider if you really need the item.',
              type: 'text'
            },
            {
              title: 'Quality over Quantity',
              content: 'Sometimes it\'s better to buy one good quality item that lasts long rather than multiple cheap items that break quickly. Consider the cost per use.',
              type: 'text'
            },
            {
              title: 'Mindful Spending Quiz',
              content: 'Test your mindful spending knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What should you do before making a large purchase?',
                options: ['Buy immediately', 'Wait and think about it', 'Ask friends', 'Check social media'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '6',
          title: 'Regular Saving Habits',
          description: 'Basics of saving regularly',
          duration: 20,
          difficulty: 'Intermediate' as const,
          category: 'Smart Spending',
          completed: false,
          rating: 4.7,
          icon: '🏦',
          content: [
            {
              title: 'Pay Yourself First',
              content: 'As soon as you receive money, save a portion before spending on anything else. Even ₹100 per month adds up to ₹1200 per year plus interest.',
              type: 'text'
            },
            {
              title: 'Automate Your Savings',
              content: 'Set up automatic transfers from your checking to savings account. When saving is automatic, you\'re more likely to stick with it.',
              type: 'text'
            },
            {
              title: 'Start Small, Think Big',
              content: 'Don\'t worry if you can only save small amounts initially. The habit is more important than the amount. You can increase your savings as your income grows.',
              type: 'text'
            },
            {
              title: 'Saving Habits Quiz',
              content: 'Test your knowledge about saving habits.',
              type: 'quiz',
              quiz: {
                question: 'When should you save money from your income?',
                options: ['At the end of the month', 'When you have extra', 'As soon as you receive it', 'Only on special occasions'],
                correctAnswer: 2
              }
            }
          ]
        },
        {
          id: '7',
          title: 'Avoiding Debt Traps',
          description: 'Avoiding debt traps',
          duration: 30,
          difficulty: 'Intermediate' as const,
          category: 'Smart Spending',
          completed: false,
          rating: 4.9,
          icon: '⚠️',
          content: [
            {
              title: 'What are Debt Traps?',
              content: 'Debt traps happen when you borrow money and can\'t pay it back, leading to more borrowing. High-interest loans and credit cards can quickly become unmanageable.',
              type: 'text'
            },
            {
              title: 'Warning Signs',
              content: 'You\'re in a debt trap if you\'re borrowing to pay other debts, only making minimum payments, or your debt payments exceed 40% of your income.',
              type: 'text'
            },
            {
              title: 'How to Avoid Debt Traps',
              content: 'Live within your means, build an emergency fund, avoid unnecessary loans, and always read the fine print before borrowing money.',
              type: 'text'
            },
            {
              title: 'Debt Awareness Quiz',
              content: 'Test your understanding of debt traps.',
              type: 'quiz',
              quiz: {
                question: 'What percentage of income should debt payments not exceed?',
                options: ['20%', '30%', '40%', '50%'],
                correctAnswer: 2
              }
            }
          ]
        },
        {
          id: '8',
          title: 'Smart Shopping',
          description: 'How to compare prices, read offers, avoid scams',
          duration: 25,
          difficulty: 'Intermediate' as const,
          category: 'Smart Spending',
          completed: false,
          rating: 4.6,
          icon: '🛒',
          content: [
            {
              title: 'Price Comparison',
              content: 'Before buying, check prices at different stores or websites. Use price comparison apps and websites to find the best deals.',
              type: 'text'
            },
            {
              title: 'Reading Offers Carefully',
              content: 'Read the fine print of offers. "50% off" might have conditions like minimum purchase amounts or limited time validity.',
              type: 'text'
            },
            {
              title: 'Avoiding Scams',
              content: 'Be wary of deals that seem too good to be true, pressure tactics, and requests for personal information. Shop from trusted sources.',
              type: 'text'
            },
            {
              title: 'Smart Shopping Quiz',
              content: 'Test your smart shopping knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What should you do before making any purchase?',
                options: ['Buy immediately', 'Compare prices', 'Ask friends', 'Check reviews only'],
                correctAnswer: 1
              }
            }
          ]
        }
      ],
      'proficient': [
        {
          id: '9',
          title: 'Short-term Financial Goals',
          description: 'Creating short-term and long-term financial goals',
          duration: 30,
          difficulty: 'Intermediate' as const,
          category: 'Saving & Goals',
          completed: false,
          rating: 4.8,
          icon: '🎯',
          content: [
            {
              title: 'Setting SMART Goals',
              content: 'Financial goals should be Specific, Measurable, Achievable, Relevant, and Time-bound. Instead of "save money," say "save ₹50,000 for vacation in 12 months."',
              type: 'text'
            },
            {
              title: 'Short-term vs Long-term Goals',
              content: 'Short-term goals (1-2 years): emergency fund, vacation, gadgets. Long-term goals (5+ years): house down payment, retirement, children\'s education.',
              type: 'text'
            },
            {
              title: 'Prioritizing Goals',
              content: 'List all your goals and prioritize them. Emergency fund should come first, followed by high-priority goals. Work on 2-3 goals at a time.',
              type: 'text'
            },
            {
              title: 'Goal Setting Quiz',
              content: 'Test your goal-setting knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What should be your first financial goal?',
                options: ['Vacation fund', 'Emergency fund', 'New phone', 'Investment'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '10',
          title: 'Understanding Interest',
          description: 'Understanding interest, compound growth',
          duration: 35,
          difficulty: 'Intermediate' as const,
          category: 'Saving & Goals',
          completed: false,
          rating: 4.9,
          icon: '📈',
          content: [
            {
              title: 'What is Interest?',
              content: 'Interest is money you earn on your savings or pay on loans. When you save, the bank pays you interest. When you borrow, you pay interest to the lender.',
              type: 'text'
            },
            {
              title: 'Simple vs Compound Interest',
              content: 'Simple interest is calculated only on the principal amount. Compound interest is calculated on principal plus previously earned interest - it\'s "interest on interest."',
              type: 'text'
            },
            {
              title: 'The Power of Compounding',
              content: 'Compound interest makes your money grow faster over time. Starting early, even with small amounts, can lead to significant wealth due to compounding.',
              type: 'text'
            },
            {
              title: 'Interest Quiz',
              content: 'Test your understanding of interest.',
              type: 'quiz',
              quiz: {
                question: 'Which type of interest helps your money grow faster?',
                options: ['Simple interest', 'Compound interest', 'Both are same', 'Neither'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '11',
          title: 'Insurance & Emergency Funds',
          description: 'Basics of insurance and emergency funds',
          duration: 25,
          difficulty: 'Intermediate' as const,
          category: 'Saving & Goals',
          completed: false,
          rating: 4.7,
          icon: '🛡️',
          content: [
            {
              title: 'Why Emergency Funds Matter',
              content: 'Emergency funds protect you from unexpected expenses like medical bills, job loss, or major repairs. They prevent you from going into debt during tough times.',
              type: 'text'
            },
            {
              title: 'How Much to Save',
              content: 'Aim for 3-6 months of living expenses in your emergency fund. Start with ₹10,000 as your first milestone, then gradually build up.',
              type: 'text'
            },
            {
              title: 'Basic Insurance Types',
              content: 'Health insurance covers medical expenses, life insurance protects your family, and vehicle insurance is mandatory. Insurance transfers risk from you to the company.',
              type: 'text'
            },
            {
              title: 'Protection Quiz',
              content: 'Test your knowledge about financial protection.',
              type: 'quiz',
              quiz: {
                question: 'How many months of expenses should an emergency fund cover?',
                options: ['1-2 months', '3-6 months', '12 months', '24 months'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '12',
          title: 'Savings Accounts & RDs',
          description: 'Introduction to savings accounts, recurring deposits',
          duration: 20,
          difficulty: 'Intermediate' as const,
          category: 'Saving & Goals',
          completed: false,
          rating: 4.6,
          icon: '🏦',
          content: [
            {
              title: 'Types of Savings Accounts',
              content: 'Regular savings accounts offer basic interest. High-yield savings accounts offer better rates. Choose based on your needs and minimum balance requirements.',
              type: 'text'
            },
            {
              title: 'Recurring Deposits (RDs)',
              content: 'RDs let you save a fixed amount monthly for a specific period. They offer higher interest than savings accounts and help build disciplined saving habits.',
              type: 'text'
            },
            {
              title: 'Choosing the Right Account',
              content: 'Consider interest rates, minimum balance, fees, and accessibility. Online banks often offer higher interest rates than traditional banks.',
              type: 'text'
            },
            {
              title: 'Banking Quiz',
              content: 'Test your banking knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What is the main benefit of a recurring deposit?',
                options: ['Higher interest than savings', 'No minimum balance', 'Instant access to money', 'No documentation needed'],
                correctAnswer: 0
              }
            }
          ]
        }
      ],
      'advanced': [
        {
          id: '13',
          title: 'Investment Fundamentals',
          description: 'Intro to investments: mutual funds, stocks, fixed deposits',
          duration: 40,
          difficulty: 'Advanced' as const,
          category: 'Growing Money',
          completed: false,
          rating: 4.8,
          icon: '📊',
          content: [
            {
              title: 'Why Invest?',
              content: 'Investing helps your money grow faster than inflation. While savings accounts offer 3-4% interest, investments can potentially provide 8-12% returns over the long term.',
              type: 'text'
            },
            {
              title: 'Types of Investments',
              content: 'Fixed Deposits: Safe, guaranteed returns. Mutual Funds: Professional management, diversified. Stocks: Direct company ownership, higher risk and potential returns.',
              type: 'text'
            },
            {
              title: 'Starting Your Investment Journey',
              content: 'Start with SIPs in mutual funds - invest small amounts monthly. Begin with large-cap equity funds or balanced funds for stability.',
              type: 'text'
            },
            {
              title: 'Investment Quiz',
              content: 'Test your investment knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What is a good way for beginners to start investing?',
                options: ['Buy individual stocks', 'SIP in mutual funds', 'Cryptocurrency', 'Real estate'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '14',
          title: 'Risk & Diversification',
          description: 'Understanding risk and diversification',
          duration: 35,
          difficulty: 'Advanced' as const,
          category: 'Growing Money',
          completed: false,
          rating: 4.7,
          icon: '⚖️',
          content: [
            {
              title: 'Understanding Investment Risk',
              content: 'All investments carry risk - the possibility of losing money. Generally, higher potential returns come with higher risk. Your risk tolerance depends on age, goals, and financial situation.',
              type: 'text'
            },
            {
              title: 'The Power of Diversification',
              content: 'Don\'t put all your eggs in one basket. Spread investments across different asset classes, sectors, and companies to reduce risk.',
              type: 'text'
            },
            {
              title: 'Asset Allocation',
              content: 'Young investors can take more risk with 70-80% in equity. As you age, gradually shift to safer investments like bonds and fixed deposits.',
              type: 'text'
            },
            {
              title: 'Risk Management Quiz',
              content: 'Test your risk management knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What does diversification help reduce?',
                options: ['Returns', 'Risk', 'Taxes', 'Time'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '15',
          title: 'Digital Investment Tools',
          description: 'Using digital tools for tracking and investing',
          duration: 30,
          difficulty: 'Advanced' as const,
          category: 'Growing Money',
          completed: false,
          rating: 4.6,
          icon: '📱',
          content: [
            {
              title: 'Investment Apps and Platforms',
              content: 'Use apps like Zerodha, Groww, or Paytm Money for easy investing. They offer low fees, research tools, and user-friendly interfaces.',
              type: 'text'
            },
            {
              title: 'Tracking Your Portfolio',
              content: 'Regularly monitor your investments but don\'t check daily. Monthly or quarterly reviews are sufficient. Focus on long-term performance, not short-term fluctuations.',
              type: 'text'
            },
            {
              title: 'Automated Investing',
              content: 'Set up automatic SIPs and use robo-advisors for hands-off investing. Automation helps maintain discipline and removes emotional decision-making.',
              type: 'text'
            },
            {
              title: 'Digital Tools Quiz',
              content: 'Test your knowledge about digital investment tools.',
              type: 'quiz',
              quiz: {
                question: 'How often should you check your investment portfolio?',
                options: ['Daily', 'Weekly', 'Monthly/Quarterly', 'Yearly'],
                correctAnswer: 2
              }
            }
          ]
        },
        {
          id: '16',
          title: 'Tax Basics & Savings',
          description: 'Tax basics and saving options',
          duration: 45,
          difficulty: 'Advanced' as const,
          category: 'Growing Money',
          completed: false,
          rating: 4.9,
          icon: '📋',
          content: [
            {
              title: 'Understanding Income Tax',
              content: 'Income tax is paid on your earnings. India has tax slabs - higher income means higher tax rates. Understanding tax helps you plan better.',
              type: 'text'
            },
            {
              title: 'Tax-Saving Investments',
              content: 'Section 80C allows ₹1.5 lakh tax deduction for investments in PPF, ELSS mutual funds, life insurance, and home loan principal.',
              type: 'text'
            },
            {
              title: 'Tax-Efficient Investing',
              content: 'Long-term capital gains (>1 year) on equity are tax-free up to ₹1 lakh. SIPs in ELSS funds provide tax benefits plus potential for good returns.',
              type: 'text'
            },
            {
              title: 'Tax Planning Quiz',
              content: 'Test your tax planning knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What is the maximum tax deduction under Section 80C?',
                options: ['₹1 lakh', '₹1.5 lakh', '₹2 lakh', '₹2.5 lakh'],
                correctAnswer: 1
              }
            }
          ]
        }
      ],
      'expert': [
        {
          id: '17',
          title: 'Retirement Planning',
          description: 'Advanced planning: retirement, children\'s education, property',
          duration: 50,
          difficulty: 'Advanced' as const,
          category: 'Financial Mastery',
          completed: false,
          rating: 4.8,
          icon: '🏖️',
          content: [
            {
              title: 'Planning for Retirement',
              content: 'Start retirement planning early. Use the rule of 25 - you need 25 times your annual expenses saved for retirement. A 25-year-old needs to save just ₹5,000/month to retire comfortably.',
              type: 'text'
            },
            {
              title: 'Children\'s Education Fund',
              content: 'Education costs are rising at 10-12% annually. Start a dedicated education fund when your child is born. Use equity mutual funds for long-term education goals.',
              type: 'text'
            },
            {
              title: 'Property Investment',
              content: 'Real estate can be a good long-term investment but requires significant capital. Consider REITs for real estate exposure without buying property directly.',
              type: 'text'
            },
            {
              title: 'Long-term Planning Quiz',
              content: 'Test your long-term planning knowledge.',
              type: 'quiz',
              quiz: {
                question: 'According to the rule of 25, how much should you save for retirement?',
                options: ['10 times annual expenses', '15 times annual expenses', '25 times annual expenses', '50 times annual expenses'],
                correctAnswer: 2
              }
            }
          ]
        },
        {
          id: '18',
          title: 'Credit Scores & Borrowing',
          description: 'Credit scores and responsible borrowing',
          duration: 40,
          difficulty: 'Advanced' as const,
          category: 'Financial Mastery',
          completed: false,
          rating: 4.7,
          icon: '💳',
          content: [
            {
              title: 'Understanding Credit Scores',
              content: 'Credit scores range from 300-900. A score above 750 gets you the best loan rates. It\'s based on payment history, credit utilization, length of credit history, and types of credit.',
              type: 'text'
            },
            {
              title: 'Building Good Credit',
              content: 'Pay all bills on time, keep credit card utilization below 30%, don\'t close old credit cards, and maintain a mix of credit types (cards, loans).',
              type: 'text'
            },
            {
              title: 'Responsible Borrowing',
              content: 'Borrow only what you need and can afford to repay. Compare interest rates, read terms carefully, and have a repayment plan before taking any loan.',
              type: 'text'
            },
            {
              title: 'Credit Management Quiz',
              content: 'Test your credit management knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What credit score is considered excellent?',
                options: ['Above 600', 'Above 700', 'Above 750', 'Above 800'],
                correctAnswer: 2
              }
            }
          ]
        },
        {
          id: '19',
          title: 'Market Trends & Economics',
          description: 'Understanding market trends, inflation, interest rates',
          duration: 45,
          difficulty: 'Advanced' as const,
          category: 'Financial Mastery',
          completed: false,
          rating: 4.6,
          icon: '📈',
          content: [
            {
              title: 'Understanding Inflation',
              content: 'Inflation reduces your money\'s purchasing power over time. If inflation is 6% and your savings earn 4%, you\'re actually losing 2% purchasing power annually.',
              type: 'text'
            },
            {
              title: 'Interest Rate Cycles',
              content: 'Interest rates affect all investments. When rates rise, bond prices fall and loan EMIs increase. When rates fall, it\'s good for borrowers and stock markets.',
              type: 'text'
            },
            {
              title: 'Market Cycles',
              content: 'Markets go through cycles of growth and decline. Stay invested through cycles, don\'t try to time the market. Dollar-cost averaging through SIPs helps manage volatility.',
              type: 'text'
            },
            {
              title: 'Economic Understanding Quiz',
              content: 'Test your economic knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What happens to your money\'s value during inflation?',
                options: ['It increases', 'It decreases', 'It stays same', 'It doubles'],
                correctAnswer: 1
              }
            }
          ]
        },
        {
          id: '20',
          title: 'Wealth Building Strategies',
          description: 'Building wealth with long-term strategies',
          duration: 55,
          difficulty: 'Advanced' as const,
          category: 'Financial Mastery',
          completed: false,
          rating: 4.9,
          icon: '💎',
          content: [
            {
              title: 'The Wealth Building Formula',
              content: 'Wealth = (Income - Expenses) × Time × Investment Returns. Increase income, reduce unnecessary expenses, start early, and invest consistently.',
              type: 'text'
            },
            {
              title: 'Multiple Income Streams',
              content: 'Don\'t rely on just salary. Develop multiple income sources: side business, freelancing, rental income, dividends, and capital gains.',
              type: 'text'
            },
            {
              title: 'Long-term Wealth Strategies',
              content: 'Focus on assets that appreciate over time: equity investments, real estate, and businesses. Avoid lifestyle inflation - don\'t increase spending with every salary hike.',
              type: 'text'
            },
            {
              title: 'Wealth Building Quiz',
              content: 'Test your wealth building knowledge.',
              type: 'quiz',
              quiz: {
                question: 'What is the most important factor in wealth building?',
                options: ['High income', 'Low expenses', 'Starting early', 'All of the above'],
                correctAnswer: 3
              }
            }
          ]
        }
      ]
    };

    // Add default content for lessons that don't have content yet
    const addDefaultContent = (lessons: any[]) => {
      return lessons.map(lesson => {
        if (!lesson.content) {
          return {
            ...lesson,
            content: [
              {
                title: `Introduction to ${lesson.title}`,
                content: lesson.description + ' This lesson will help you understand the key concepts and practical applications.',
                type: 'text'
              },
              {
                title: 'Key Concepts',
                content: `In this section, we'll explore the fundamental principles of ${lesson.category.toLowerCase()}. Understanding these concepts is crucial for your financial journey.`,
                type: 'text'
              },
              {
                title: 'Practical Application',
                content: `Now let's see how you can apply these concepts in real life. We'll provide practical tips and strategies you can implement immediately.`,
                type: 'text'
              },
              {
                title: 'Knowledge Check',
                content: 'Test your understanding of the concepts covered in this lesson.',
                type: 'quiz',
                quiz: {
                  question: `What is the most important aspect of ${lesson.category.toLowerCase()}?`,
                  options: ['Planning ahead', 'Taking action', 'Continuous learning', 'All of the above'],
                  correctAnswer: 3
                }
              }
            ]
          };
        }
        return lesson;
      });
    };

    const levelLessons = lessonsByLevel[normalizedLevel as keyof typeof lessonsByLevel] || lessonsByLevel['beginner'];
    return addDefaultContent(levelLessons);
  };

  const categories = ['All', ...new Set(lessons.map(lesson => lesson.category))];

  const filteredLessons = selectedCategory === 'All' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory);

  const startLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setCurrentStep(0);
      toast.success('Starting lesson...');
    }
  };

  const nextStep = () => {
    if (currentLesson && currentStep < currentLesson.content.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeLesson = async () => {
    if (currentLesson) {
      // Update lesson completion status
      setLessons(prev => 
        prev.map(lesson => 
          lesson.id === currentLesson.id 
            ? { ...lesson, completed: true }
            : lesson
        )
      );
      setLessonProgress(prev => ({
        ...prev,
        [currentLesson.id]: 100
      }));
      
      // Track completed lesson
      const newCompletedLessons = [...completedLessons, currentLesson.id];
      setCompletedLessons(newCompletedLessons);
      
      // Mark lesson as completed in backend
      try {
        await fetch('/api/lessons/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ lesson_id: currentLesson.id })
        });
      } catch (error) {
        console.error('Error marking lesson as completed:', error);
      }
      
      toast.success('Lesson completed! 🎉');
      setCurrentLesson(null);
      setCurrentStep(0);
      
      // Check if all lessons are completed
      const totalLessons = lessons.length;
      const completedCount = newCompletedLessons.length;
      
      if (completedCount >= totalLessons) {
        // Generate additional lessons
        await generateAdditionalLessons();
      }
    }
  };

  const closeLesson = () => {
    setCurrentLesson(null);
    setCurrentStep(0);
  };

  const generateAdditionalLessons = async () => {
    try {
      setGeneratingAdditional(true);
      toast.info('Generating new lessons for you... 🚀');
      
      const response = await fetch('/api/lessons/generate-additional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          completed_lessons: completedLessons.map(id => {
            const lesson = lessons.find(l => l.id === id);
            return lesson ? lesson.title : id;
          })
        })
      });
      
      if (response.ok) {
        const additionalLessonsData = await response.json();
        
        if (additionalLessonsData.lessons && additionalLessonsData.lessons.length > 0) {
          const newLessons = convertAILessonsToFormat(additionalLessonsData.lessons, levelContent?.level || 'intermediate');
          
          // Add new lessons to existing ones
          setLessons(prev => [...prev, ...newLessons]);
          
          toast.success(`${newLessons.length} new advanced lessons generated! 🎓`);
        } else {
          toast.info('No additional lessons available at this time.');
        }
      } else {
        throw new Error('Failed to generate additional lessons');
      }
    } catch (error) {
      console.error('Error generating additional lessons:', error);
      toast.error('Failed to generate new lessons. Please try again later.');
    } finally {
      setGeneratingAdditional(false);
    }
  };

  const handleQuizAnswer = (selectedAnswer: number) => {
    const currentContent = currentLesson?.content[currentStep];
    if (currentContent?.quiz) {
      if (selectedAnswer === currentContent.quiz.correctAnswer) {
        toast.success('Correct! 🎉');
        setTimeout(() => {
          if (currentStep === currentLesson!.content.length - 1) {
            completeLesson();
          } else {
            nextStep();
          }
        }, 1500);
      } else {
        toast.error('Try again!');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Lesson Modal Component
  const LessonModal = () => {
    if (!currentLesson) return null;

    const currentContent = currentLesson.content[currentStep];
    const progress = ((currentStep + 1) / currentLesson.content.length) * 100;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{currentLesson.title}</h2>
              <button
                onClick={closeLesson}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Step {currentStep + 1} of {currentLesson.content.length}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentContent.title}
            </h3>
            
            {currentContent.type === 'text' && (
              <div className="text-gray-700 leading-relaxed space-y-4">
                {currentContent.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    // Handle bold headers
                    return (
                      <h4 key={index} className="font-semibold text-gray-900 text-base mt-6 mb-2">
                        {paragraph.replace(/\*\*/g, '')}
                      </h4>
                    );
                  } else if (paragraph.includes('•')) {
                    // Handle bullet points
                    return (
                      <ul key={index} className="list-disc list-inside space-y-2 ml-4">
                        {paragraph.split('\n').filter(line => line.trim()).map((line, lineIndex) => (
                          <li key={lineIndex} className="text-gray-700">
                            {line.replace('• ', '')}
                          </li>
                        ))}
                      </ul>
                    );
                  } else {
                    // Regular paragraphs
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  }
                })}
              </div>
            )}
            
            {currentContent.type === 'interactive' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Practical Exercise</span>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  {currentContent.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Take your time to work through this exercise. Apply these concepts to your own financial situation.
                  </p>
                </div>
              </div>
            )}
            
            {currentContent.type === 'video' && currentContent.video && (
              <div className="space-y-6">
                {/* Video Description */}
                {currentContent.content && (
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Play className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Video Learning</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {currentContent.content}
                    </p>
                  </div>
                )}
                
                {/* Video Player */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                  {currentContent.video.url.includes('youtube.com') || currentContent.video.url.includes('youtu.be') ? (
                    <iframe
                      src={currentContent.video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title={currentContent.video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentContent.video.url}
                      controls
                      className="w-full h-full object-cover"
                      onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        const progress = (video.currentTime / video.duration) * 100;
                        setVideoProgress(prev => ({
                          ...prev,
                          [currentLesson.id]: progress
                        }));
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{currentContent.video.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {currentContent.video.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {currentContent.video.duration} minutes</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Educational Content</span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      📝 <strong>Learning Tip:</strong> Take notes while watching and pause to reflect on key concepts. You can rewatch sections as needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {currentContent.type === 'quiz' && currentContent.quiz && (
              <div>
                <p className="text-gray-700 mb-4">{currentContent.quiz.question}</p>
                <div className="space-y-2">
                  {currentContent.quiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            {currentStep === currentLesson.content.length - 1 ? (
              currentContent.type !== 'quiz' && (
                <button
                  onClick={completeLesson}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Lesson</span>
                </button>
              )
            ) : (
              currentContent.type !== 'quiz' && (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Education</h1>
            <p className="text-gray-600">Level-based learning for your financial journey</p>
          </div>
        </div>

        {/* Level Badge */}
        {levelContent && (
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">
                  {levelContent.level === 'beginner' && 'Money Basics'}
                  {levelContent.level === 'intermediate' && 'Smart Spending'}
                  {levelContent.level === 'proficient' && 'Saving & Goals'}
                  {levelContent.level === 'advanced' && 'Growing Money'}
                  {levelContent.level === 'expert' && 'Financial Mastery'}
                </h3>
                <p className="text-purple-200 text-sm">
                  {levelContent.level === 'beginner' && 'Start your money journey'}
                  {levelContent.level === 'intermediate' && 'Spend wisely, live better'}
                  {levelContent.level === 'proficient' && 'Save with purpose'}
                  {levelContent.level === 'advanced' && 'Let your money work for you'}
                  {levelContent.level === 'expert' && 'Be your own financial expert'}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{lesson.icon}</span>
              </div>
              {lesson.completed && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">{lesson.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{lesson.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{lesson.rating}</span>
                </div>
                {lesson.content.some(c => c.type === 'video') && (
                  <div className="flex items-center space-x-1">
                    <Play className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-500">Video</span>
                  </div>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {lesson.difficulty}
              </span>
            </div>

            <button
              onClick={() => startLesson(lesson.id)}
              disabled={lesson.completed}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                lesson.completed
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {lesson.completed ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Lesson</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Generating Additional Lessons Indicator */}
      {generatingAdditional && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <div>
              <h3 className="font-bold text-lg">Generating New Lessons</h3>
              <p className="text-purple-200">Creating personalized advanced content just for you...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="font-bold text-lg text-gray-900 mb-4">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-bold text-2xl text-gray-900">{lessons.filter(l => l.completed).length}</p>
            <p className="text-gray-600 text-sm">Completed</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <p className="font-bold text-2xl text-gray-900">{lessons.length}</p>
            <p className="text-gray-600 text-sm">Total Lessons</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="font-bold text-2xl text-gray-900">
              {Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100)}%
            </p>
            <p className="text-gray-600 text-sm">Progress</p>
          </div>
        </div>
      </motion.div>

      {/* Lesson Modal */}
      <LessonModal />
    </div>
  );
};

export default FinancialLessons;