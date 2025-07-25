import google.generativeai as genai
import json
import math
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import random
from langdetect import detect
import re

from models import (
    User, FinancialProfile, SavingsGoal, GovernmentScheme,
    CulturalNudge, FinancialScore, VoiceInteraction
)
from schemas import EligibilityResponse

# Configure Gemini AI
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

# Cultural and festival data
INDIAN_FESTIVALS = {
    "diwali": {
        "name": "Diwali",
        "months": [10, 11],
        "savings_suggestions": [
            "Start saving for Diwali shopping and decorations",
            "Plan your gold purchases for Dhanteras",
            "Budget for gifts and sweets distribution"
        ]
    },
    "holi": {
        "name": "Holi",
        "months": [3, 4],
        "savings_suggestions": [
            "Save for Holi celebrations and colors",
            "Plan for family gatherings and food expenses"
        ]
    },
    "eid": {
        "name": "Eid",
        "months": [4, 5, 6],
        "savings_suggestions": [
            "Prepare for Eid shopping and celebrations",
            "Save for new clothes and gifts",
            "Plan for charity and zakat contributions"
        ]
    },
    "durga_puja": {
        "name": "Durga Puja",
        "months": [9, 10],
        "savings_suggestions": [
            "Save for Durga Puja celebrations",
            "Plan for new clothes and pandal visits"
        ]
    }
}

STATE_FINANCIAL_PATTERNS = {
    "maharashtra": {
        "common_goals": ["business_investment", "education", "real_estate"],
        "cultural_events": ["ganesh_chaturthi", "gudi_padwa"],
        "investment_preferences": ["mutual_funds", "stocks", "gold"]
    },
    "tamil_nadu": {
        "common_goals": ["education", "gold", "wedding"],
        "cultural_events": ["pongal", "deepavali"],
        "investment_preferences": ["gold", "fixed_deposits", "chit_funds"]
    },
    "kerala": {
        "common_goals": ["education", "house", "gold"],
        "cultural_events": ["onam", "vishu"],
        "investment_preferences": ["gold", "real_estate", "mutual_funds"]
    },
    "punjab": {
        "common_goals": ["agriculture", "wedding", "house"],
        "cultural_events": ["baisakhi", "karva_chauth"],
        "investment_preferences": ["land", "gold", "fixed_deposits"]
    },
    "west_bengal": {
        "common_goals": ["education", "cultural_events", "gold"],
        "cultural_events": ["durga_puja", "kali_puja", "poila_boishakh"],
        "investment_preferences": ["gold", "fixed_deposits", "insurance"]
    }
}

RELIGIOUS_INVESTMENT_FILTERS = {
    "islamic": {
        "excluded_sectors": ["alcohol", "gambling", "pork", "interest_based_banking"],
        "preferred_instruments": ["sukuk", "shariah_compliant_mutual_funds", "gold"],
        "principles": ["no_interest", "no_speculation", "ethical_business"]
    },
    "jain": {
        "excluded_sectors": ["leather", "alcohol", "tobacco", "non_vegetarian_food"],
        "preferred_instruments": ["ethical_mutual_funds", "gold", "real_estate"],
        "principles": ["non_violence", "ethical_business", "sustainable_practices"]
    },
    "sikh": {
        "excluded_sectors": ["tobacco", "alcohol"],
        "preferred_instruments": ["mutual_funds", "gold", "real_estate"],
        "principles": ["honest_earning", "sharing", "ethical_business"]
    }
}

async def process_voice_query(
    query: str,
    language: str,
    user: User,
    db: Session
) -> Dict[str, Any]:
    """Process voice query using AI and return appropriate response."""
    
    # Detect language if not provided
    if language == "auto":
        try:
            language = detect(query)
        except:
            language = "en"
    
    # Detect intent from the query
    intent = detect_intent(query, language)
    
    # Generate response based on intent
    response = await generate_contextual_response(
        query=query,
        intent=intent,
        user=user,
        language=language,
        db=db
    )
    
    # Store interaction in database
    interaction = VoiceInteraction(
        user_id=user.id,
        query_text=query,
        query_language=language,
        response_text=response["text"],
        response_language=language,
        intent_detected=intent["name"],
        confidence_score=intent["confidence"]
    )
    db.add(interaction)
    db.commit()
    
    return response

def detect_intent(query: str, language: str) -> Dict[str, Any]:
    """Detect user intent from voice query."""
    
    # Simple intent detection based on keywords
    # In production, you'd use a more sophisticated NLP model
    
    query_lower = query.lower()
    
    intents = {
        "savings_query": {
            "keywords": ["save", "saving", "savings", "bachana", "bachat"],
            "confidence": 0.0
        },
        "investment_query": {
            "keywords": ["invest", "investment", "nivesh", "lagana"],
            "confidence": 0.0
        },
        "goal_query": {
            "keywords": ["goal", "target", "lakshya", "uddeshya"],
            "confidence": 0.0
        },
        "scheme_query": {
            "keywords": ["scheme", "yojana", "government", "sarkar"],
            "confidence": 0.0
        },
        "wedding_planning": {
            "keywords": ["wedding", "marriage", "shadi", "vivah"],
            "confidence": 0.0
        },
        "festival_planning": {
            "keywords": ["festival", "diwali", "holi", "eid", "tyohar"],
            "confidence": 0.0
        },
        "education_planning": {
            "keywords": ["education", "study", "school", "college", "shiksha"],
            "confidence": 0.0
        }
    }
    
    # Calculate confidence scores
    for intent_name, intent_data in intents.items():
        matches = sum(1 for keyword in intent_data["keywords"] if keyword in query_lower)
        intent_data["confidence"] = matches / len(intent_data["keywords"])
    
    # Find best matching intent
    best_intent = max(intents.items(), key=lambda x: x[1]["confidence"])
    
    return {
        "name": best_intent[0],
        "confidence": best_intent[1]["confidence"],
        "all_intents": intents
    }

async def generate_contextual_response(
    query: str,
    intent: Dict[str, Any],
    user: User,
    language: str,
    db: Session
) -> Dict[str, Any]:
    """Generate contextual response based on user profile and intent."""
    
    # Get user's financial profile
    financial_profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == user.id
    ).first()
    
    # Get user's active goals
    active_goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == user.id,
        SavingsGoal.is_completed == False
    ).all()
    
    intent_name = intent["name"]
    
    if intent_name == "savings_query":
        response = generate_savings_advice(user, financial_profile, language)
    elif intent_name == "investment_query":
        response = generate_investment_advice(user, financial_profile, language)
    elif intent_name == "goal_query":
        response = generate_goal_advice(user, active_goals, language)
    elif intent_name == "scheme_query":
        response = generate_scheme_advice(user, db, language)
    elif intent_name == "wedding_planning":
        response = generate_wedding_advice(user, financial_profile, language)
    elif intent_name == "festival_planning":
        response = generate_festival_advice(user, language)
    elif intent_name == "education_planning":
        response = generate_education_advice(user, financial_profile, language)
    else:
        response = generate_general_advice(user, language)
    
    return response

async def generate_enhanced_contextual_response(
    query: str,
    intent: Dict[str, Any],
    user: User,
    language: str,
    db: Session
) -> Dict[str, Any]:
    """Generate enhanced contextual response with better query analysis."""
    
    # Get user's financial profile
    financial_profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == user.id
    ).first()
    
    # Get user's active goals
    active_goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == user.id,
        SavingsGoal.is_completed == False
    ).all()
    
    # Analyze query for specific keywords and context
    query_lower = query.lower()
    
    # Enhanced intent detection with query analysis
    response = {}
    
    # Greeting detection
    if any(word in query_lower for word in ['hello', 'hi', 'hey', 'namaste', 'namaskar']):
        response = generate_greeting_response(user, language)
    
    # Savings related queries
    elif any(word in query_lower for word in ['save', 'saving', 'savings', 'bachana', 'bachat']):
        if 'how much' in query_lower or 'kitna' in query_lower:
            response = generate_savings_amount_advice(user, financial_profile, language)
        elif 'where' in query_lower or 'kahan' in query_lower:
            response = generate_savings_options_advice(user, language)
        else:
            response = generate_savings_advice(user, financial_profile, language)
    
    # Investment related queries
    elif any(word in query_lower for word in ['invest', 'investment', 'nivesh', 'lagana']):
        if 'mutual fund' in query_lower or 'sip' in query_lower:
            response = generate_mutual_fund_advice(user, language)
        elif 'stock' in query_lower or 'share' in query_lower:
            response = generate_stock_advice(user, language)
        elif 'gold' in query_lower or 'sona' in query_lower:
            response = generate_gold_investment_advice(user, language)
        else:
            response = generate_investment_advice(user, financial_profile, language)
    
    # Goal related queries
    elif any(word in query_lower for word in ['goal', 'target', 'lakshya', 'uddeshya']):
        response = generate_goal_advice(user, active_goals, language)
    
    # Scheme related queries
    elif any(word in query_lower for word in ['scheme', 'yojana', 'government', 'sarkar']):
        response = generate_scheme_advice(user, language)
    
    # Festival and cultural queries
    elif any(word in query_lower for word in ['diwali', 'holi', 'eid', 'festival', 'tyohar']):
        response = generate_festival_advice(user, financial_profile, language)
    
    # Wedding planning
    elif any(word in query_lower for word in ['wedding', 'marriage', 'shadi', 'vivah']):
        response = generate_wedding_advice(user, financial_profile, language)
    
    # Education planning
    elif any(word in query_lower for word in ['education', 'study', 'school', 'college', 'shiksha']):
        response = generate_education_advice(user, financial_profile, language)
    
    # Emergency fund queries
    elif any(word in query_lower for word in ['emergency', 'urgent', 'apatkal']):
        response = generate_emergency_fund_advice(user, financial_profile, language)
    
    # Budget related queries
    elif any(word in query_lower for word in ['budget', 'expense', 'kharcha', 'kharch']):
        response = generate_budget_advice(user, financial_profile, language)
    
    # Default response
    else:
        response = generate_contextual_general_advice(user, query, language)
    
    return response

def generate_savings_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate personalized savings advice."""
    
    if not profile:
        return {
            "text": "Let me help you create a financial profile first to give you personalized savings advice.",
            "suggestions": ["Create financial profile", "Set savings goals"],
            "action_required": True
        }
    
    savings_rate = 0
    if profile.monthly_income and profile.monthly_expenses:
        savings_rate = ((profile.monthly_income - profile.monthly_expenses) / profile.monthly_income) * 100
    
    if savings_rate < 10:
        advice = f"Your current savings rate is {savings_rate:.1f}%. I recommend aiming for at least 20% of your income. Let's start with small steps."
        suggestions = ["Track expenses", "Create budget", "Find areas to cut costs"]
    elif savings_rate < 20:
        advice = f"Good start! Your savings rate is {savings_rate:.1f}%. Let's work on increasing it to 20-30%."
        suggestions = ["Automate savings", "Increase SIP amount", "Review subscriptions"]
    else:
        advice = f"Excellent! Your savings rate of {savings_rate:.1f}% is great. Let's optimize your investments."
        suggestions = ["Diversify investments", "Consider tax-saving options", "Review portfolio"]
    
    # Add cultural context
    if user.state and user.state.lower() in STATE_FINANCIAL_PATTERNS:
        state_data = STATE_FINANCIAL_PATTERNS[user.state.lower()]
        advice += f" Based on {user.state} financial patterns, consider {', '.join(state_data['investment_preferences'][:2])}."
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_investment_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate personalized investment advice."""
    
    if not profile:
        return {
            "text": "I need to understand your financial profile first to suggest suitable investments.",
            "suggestions": ["Complete financial profile", "Risk assessment"],
            "action_required": True
        }
    
    # Filter investments based on religious preferences
    if user.cultural_background:
        cultural_bg = user.cultural_background.lower()
        if cultural_bg in RELIGIOUS_INVESTMENT_FILTERS:
            filter_data = RELIGIOUS_INVESTMENT_FILTERS[cultural_bg]
            advice = f"Based on your {cultural_bg} background, I recommend {', '.join(filter_data['preferred_instruments'][:2])}."
            suggestions = filter_data['preferred_instruments'][:3]
        else:
            advice = "Based on your profile, I recommend a diversified portfolio with mutual funds, gold, and fixed deposits."
            suggestions = ["Mutual funds", "Gold investment", "Fixed deposits"]
    else:
        advice = "I recommend starting with a balanced portfolio based on your risk tolerance."
        suggestions = ["SIP in mutual funds", "Emergency fund", "Tax-saving investments"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_goal_advice(user: User, goals: List[SavingsGoal], language: str) -> Dict[str, Any]:
    """Generate advice about savings goals."""
    
    if not goals:
        return {
            "text": "You don't have any active savings goals. Let's create some based on your priorities!",
            "suggestions": ["Create emergency fund", "Plan for festival", "Wedding savings"],
            "action_required": True
        }
    
    total_target = sum(goal.target_amount for goal in goals)
    total_current = sum(goal.current_amount for goal in goals)
    progress = (total_current / total_target) * 100 if total_target > 0 else 0
    
    advice = f"You have {len(goals)} active goals with {progress:.1f}% overall progress. "
    
    # Find the goal with least progress
    least_progress_goal = min(goals, key=lambda g: (g.current_amount / g.target_amount) if g.target_amount > 0 else 0)
    advice += f"Focus on '{least_progress_goal.title}' which needs more attention."
    
    suggestions = [f"Add to {goal.title}" for goal in goals[:3]]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_scheme_advice(user: User, language: str) -> Dict[str, Any]:
    """Generate government scheme recommendations."""
    
    # Popular government schemes in India
    schemes = [
        "PM Kisan Samman Nidhi",
        "Pradhan Mantri Jan Dhan Yojana",
        "Atal Pension Yojana",
        "Sukanya Samriddhi Yojana",
        "PM Mudra Yojana"
    ]
    
    advice = f"Based on your profile, you might be eligible for government schemes like {schemes[0]} and {schemes[1]}. These schemes offer financial benefits and support."
    suggestions = ["Check eligibility", "Browse all schemes", "Apply online"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_wedding_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate wedding planning financial advice."""
    
    advice = "Wedding planning requires careful budgeting. "
    
    if user.cultural_background:
        if "hindu" in user.cultural_background.lower():
            advice += "Consider gold purchases for Dhanteras, venue booking, and traditional ceremonies."
        elif "muslim" in user.cultural_background.lower():
            advice += "Plan for Nikah ceremony, Walima, and Mahr arrangements."
        elif "sikh" in user.cultural_background.lower():
            advice += "Budget for Anand Karaj ceremony and community feast."
    
    suggestions = ["Create wedding fund", "Gold investment plan", "Venue budget calculator"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_festival_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate festival-specific financial advice."""
    
    current_month = datetime.now().month
    upcoming_festivals = []
    
    for festival_key, festival_data in INDIAN_FESTIVALS.items():
        if current_month in festival_data["months"] or (current_month + 1) in festival_data["months"]:
            upcoming_festivals.append(festival_data)
    
    if upcoming_festivals:
        festival = upcoming_festivals[0]
        advice = f"{festival['name']} is approaching! {festival['savings_suggestions'][0]}"
        suggestions = festival['savings_suggestions'][:3]
    else:
        advice = "Plan ahead for upcoming festivals to avoid financial stress."
        suggestions = ["Create festival fund", "Monthly festival savings", "Budget planner"]
    
    # Add personalized advice based on profile
    if profile and profile.monthly_income:
        festival_budget = profile.monthly_income * 0.05  # 5% of income for festivals
        advice += f" Consider setting aside ₹{festival_budget:,.0f} monthly for festival expenses."
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_education_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate education planning advice."""
    
    advice = "Education is a great investment! "
    
    if profile and profile.dependents and profile.dependents > 0:
        advice += f"With {profile.dependents} dependents, consider starting a Sukanya Samriddhi Yojana or education SIP."
        suggestions = ["Sukanya Samriddhi Yojana", "Education SIP", "Child insurance"]
    else:
        advice += "Consider skill development courses or higher education planning."
        suggestions = ["Skill development fund", "Higher education loan", "Professional courses"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_general_advice(user: User, language: str) -> Dict[str, Any]:
    """Generate general financial advice."""
    
    advice = f"Hello {user.full_name}! I'm here to help with your financial planning. What would you like to know?"
    suggestions = ["Check my savings", "Investment options", "Government schemes", "Set new goal"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_greeting_response(user: User, language: str) -> Dict[str, Any]:
    """Generate greeting response."""
    
    greetings = {
        'hi': f"नमस्ते {user.full_name}! मैं आपका वित्तीय सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        'en': f"Hello {user.full_name}! I'm your financial assistant. How can I help you today?",
        'ta': f"வணக்கம் {user.full_name}! நான் உங்கள் நிதி உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        'te': f"నమస్కారం {user.full_name}! నేను మీ ఆర్థిక సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
        'gu': f"નમસ્તે {user.full_name}! હું તમારો નાણાકીય સહાયક છું. આજે હું તમારી કેવી રીતે મદદ કરી શકું?",
        'mr': f"नमस्कार {user.full_name}! मी तुमचा आर्थिक सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
        'bn': f"নমস্কার {user.full_name}! আমি আপনার আর্থিক সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
        'kn': f"ನಮಸ್ಕಾರ {user.full_name}! ನಾನು ನಿಮ್ಮ ಹಣಕಾಸು ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
    }
    
    advice = greetings.get(language, greetings['en'])
    suggestions = get_language_suggestions(language)
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_savings_amount_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate advice about how much to save."""
    
    if not profile or not profile.monthly_income:
        advice = "To determine how much you should save, I need to know your monthly income. The general rule is to save 20-30% of your income."
        suggestions = ["Update income details", "Create budget plan", "Set savings goal"]
    else:
        recommended_savings = profile.monthly_income * 0.2
        advice = f"Based on your income of ₹{profile.monthly_income:,.0f}, I recommend saving at least ₹{recommended_savings:,.0f} per month (20%). Start with ₹{recommended_savings/2:,.0f} if this seems too much."
        suggestions = ["Set up auto-transfer", "Create SIP", "Track expenses"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_savings_options_advice(user: User, language: str) -> Dict[str, Any]:
    """Generate advice about where to save money."""
    
    advice = "Here are the best places to save your money in India: 1) High-yield savings accounts (3-4% interest), 2) Fixed Deposits (5-7% interest), 3) PPF for long-term (7.1% tax-free), 4) ELSS mutual funds for tax saving, 5) Gold for inflation protection."
    suggestions = ["Compare bank rates", "Open PPF account", "Start SIP", "Buy digital gold"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_mutual_fund_advice(user: User, language: str) -> Dict[str, Any]:
    """Generate mutual fund investment advice."""
    
    advice = "Mutual funds are great for long-term wealth creation! Start with: 1) Large-cap funds for stability, 2) Mid-cap funds for growth, 3) ELSS funds for tax saving. Begin with SIP of ₹1,000-5,000 monthly. Diversify across 3-4 good funds."
    suggestions = ["Start SIP", "Compare fund performance", "Tax-saving funds", "Risk assessment"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_stock_advice(user: User, language: str) -> Dict[str, Any]:
    """Generate stock investment advice."""
    
    advice = "Stock investing requires research and patience. Start with: 1) Blue-chip companies like TCS, Reliance, HDFC Bank, 2) Index funds for diversification, 3) Only invest money you won't need for 5+ years, 4) Never invest borrowed money. Learn before you invest!"
    suggestions = ["Learn stock basics", "Open demat account", "Start with index funds", "Research companies"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_gold_investment_advice(user: User, language: str) -> Dict[str, Any]:
    """Generate gold investment advice."""
    
    advice = "Gold is a traditional Indian investment for inflation protection. Options: 1) Digital gold (convenient, no storage issues), 2) Gold ETFs (traded like stocks), 3) Gold mutual funds, 4) Physical gold (jewelry, coins). Limit to 5-10% of your portfolio."
    suggestions = ["Buy digital gold", "Gold ETF options", "Compare gold schemes", "Festival gold plans"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_emergency_fund_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate emergency fund advice."""
    
    if profile and profile.monthly_expenses:
        emergency_amount = profile.monthly_expenses * 6
        advice = f"Build an emergency fund of ₹{emergency_amount:,.0f} (6 months of expenses). Keep it in: 1) High-yield savings account, 2) Liquid mutual funds, 3) Fixed deposits with premature withdrawal facility. This should be your first financial priority!"
    else:
        advice = "Emergency fund should cover 6 months of your living expenses. Keep it easily accessible in savings account or liquid funds. This protects you from unexpected job loss, medical emergencies, or major repairs."
    
    suggestions = ["Calculate emergency fund", "Open liquid fund", "High-yield savings account", "Set monthly target"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_budget_advice(user: User, profile: FinancialProfile, language: str) -> Dict[str, Any]:
    """Generate budgeting advice."""
    
    advice = "Follow the 50-30-20 rule: 50% for needs (rent, food, utilities), 30% for wants (entertainment, dining out), 20% for savings and investments. Track expenses using apps like Money Manager or ET Money. Review monthly and adjust as needed."
    
    if profile and profile.monthly_income and profile.monthly_expenses:
        expense_ratio = (profile.monthly_expenses / profile.monthly_income) * 100
        if expense_ratio > 80:
            advice += f" Your current expense ratio is {expense_ratio:.1f}% - try to reduce it to 70-80% maximum."
    
    suggestions = ["Download expense tracker", "Categorize expenses", "Set spending limits", "Review subscriptions"]
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def generate_contextual_general_advice(user: User, query: str, language: str) -> Dict[str, Any]:
    """Generate contextual general advice based on query."""
    
    query_lower = query.lower()
    
    if 'help' in query_lower or 'madad' in query_lower:
        advice = f"I'm here to help you with financial planning, {user.full_name}! I can assist with savings, investments, goal planning, government schemes, and more. What specific area would you like guidance on?"
    elif 'money' in query_lower or 'paisa' in query_lower:
        advice = "Money management is about making smart choices. Start with budgeting, build an emergency fund, then invest for your goals. Remember: spend less than you earn, invest the difference wisely!"
    elif 'future' in query_lower or 'bhavishya' in query_lower:
        advice = "Planning for the future is wise! Focus on: 1) Emergency fund, 2) Health insurance, 3) Life insurance, 4) Retirement planning, 5) Children's education. Start early to benefit from compounding!"
    else:
        advice = f"Hello {user.full_name}! I can help you with savings, investments, budgeting, goal planning, and government schemes. What would you like to know about your finances today?"
    
    suggestions = get_language_suggestions(language)
    
    return {
        "text": advice,
        "suggestions": suggestions,
        "action_required": False
    }

def get_language_suggestions(language: str) -> List[str]:
    """Get language-appropriate suggestions based on detected language."""
    
    suggestions_map = {
        'hi': ["मेरी बचत देखें", "निवेश विकल्प", "सरकारी योजनाएं", "नया लक्ष्य सेट करें"],
        'en': ["Check my savings", "Investment options", "Government schemes", "Set new goal"],
        'ta': ["என் சேமிப்பைப் பார்க்கவும்", "முதலீட்டு விருப்பங்கள்", "அரசு திட்டங்கள்", "புதிய இலக்கு அமைக்கவும்"],
        'te': ["నా పొదుపులను చూడండి", "పెట్టుబడి ఎంపికలు", "ప్రభుత్వ పథకాలు", "కొత్త లక్ష్యం సెట్ చేయండి"],
        'gu': ["મારી બચત જુઓ", "રોકાણ વિકલ્પો", "સરકારી યોજનાઓ", "નવું લક્ષ્ય સેટ કરો"],
        'mr': ["माझी बचत पहा", "गुंतवणूक पर्याय", "सरकारी योजना", "नवे ध्येय सेट करा"],
        'bn': ["আমার সঞ্চয় দেখুন", "বিনিয়োগের বিকল্প", "সরকারি প্রকল্প", "নতুন লক্ষ্য সেট করুন"],
        'kn': ["ನನ್ನ ಉಳಿತಾಯವನ್ನು ನೋಡಿ", "ಹೂಡಿಕೆ ಆಯ್ಕೆಗಳು", "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", "ಹೊಸ ಗುರಿ ಹೊಂದಿಸಿ"]
    }
    
    return suggestions_map.get(language, suggestions_map['en'])

async def generate_cultural_nudge(user: User, db: Session) -> List[Dict[str, Any]]:
    """Generate cultural and contextual financial nudges."""
    
    nudges = []
    current_date = datetime.now()
    
    # Festival-based nudges
    current_month = current_date.month
    for festival_key, festival_data in INDIAN_FESTIVALS.items():
        if current_month in festival_data["months"]:
            nudge = {
                "type": "festival",
                "title": f"{festival_data['name']} Planning",
                "message": festival_data['savings_suggestions'][0],
                "cultural_context": festival_key,
                "action": "create_festival_goal"
            }
            nudges.append(nudge)
    
    # State-specific nudges
    if user.state and user.state.lower() in STATE_FINANCIAL_PATTERNS:
        state_data = STATE_FINANCIAL_PATTERNS[user.state.lower()]
        nudge = {
            "type": "state_specific",
            "title": f"{user.state} Financial Tip",
            "message": f"Popular in {user.state}: {', '.join(state_data['investment_preferences'][:2])}",
            "cultural_context": user.state.lower(),
            "action": "explore_investments"
        }
        nudges.append(nudge)
    
    # Seasonal nudges
    if current_month in [3, 4]:  # Tax season
        nudge = {
            "type": "seasonal",
            "title": "Tax Saving Reminder",
            "message": "Don't forget to invest in tax-saving instruments before March 31st!",
            "cultural_context": "tax_season",
            "action": "tax_planning"
        }
        nudges.append(nudge)
    
    return nudges[:3]  # Return top 3 nudges

async def check_scheme_eligibility(
    user: User,
    scheme: GovernmentScheme,
    db: Session
) -> EligibilityResponse:
    """Check user eligibility for a government scheme."""
    
    # Get user's financial profile
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == user.id
    ).first()
    
    eligible = True
    missing_criteria = []
    recommendations = []
    confidence = 1.0
    
    # Check age criteria
    if scheme.age_min or scheme.age_max:
        # For demo purposes, assume user age is derivable from profile
        # In real implementation, you'd have user's date of birth
        user_age = 25  # Placeholder
        
        if scheme.age_min and user_age < scheme.age_min:
            eligible = False
            missing_criteria.append(f"Minimum age requirement: {scheme.age_min}")
            confidence -= 0.3
        
        if scheme.age_max and user_age > scheme.age_max:
            eligible = False
            missing_criteria.append(f"Maximum age limit: {scheme.age_max}")
            confidence -= 0.3
    
    # Check income criteria
    if scheme.income_max and profile and profile.monthly_income:
        annual_income = profile.monthly_income * 12
        if annual_income > scheme.income_max:
            eligible = False
            missing_criteria.append(f"Income should be below ₹{scheme.income_max:,.0f}")
            confidence -= 0.4
    
    # Check state eligibility
    if scheme.applicable_states and user.state:
        if user.state not in scheme.applicable_states:
            eligible = False
            missing_criteria.append(f"Scheme not available in {user.state}")
            confidence -= 0.5
    
    # Generate recommendations
    if not eligible:
        if missing_criteria:
            recommendations.append("Review eligibility criteria and update your profile")
            recommendations.append("Check similar schemes that might be applicable")
    else:
        recommendations.append("You appear eligible! Proceed with application")
        recommendations.append("Gather required documents for application")
    
    next_steps = [
        "Download application form",
        "Contact local agent for assistance",
        "Visit nearest government office"
    ] if eligible else [
        "Update your profile information",
        "Check alternative schemes",
        "Consult with financial advisor"
    ]
    
    return EligibilityResponse(
        eligible=eligible,
        confidence=max(0.0, confidence),
        missing_criteria=missing_criteria,
        recommendations=recommendations,
        next_steps=next_steps
    )

async def calculate_financial_score(user: User, db: Session) -> Dict[str, Any]:
    """Calculate comprehensive financial score for user."""
    
    # Get user data
    profile = db.query(FinancialProfile).filter(
        FinancialProfile.user_id == user.id
    ).first()
    
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == user.id
    ).all()
    
    # Calculate individual scores
    savings_score = calculate_savings_score(profile, goals)
    spending_score = calculate_spending_score(profile)
    learning_score = calculate_learning_score(user, db)
    community_score = calculate_community_score(user, db)
    goal_achievement_score = calculate_goal_achievement_score(goals)
    cultural_awareness_score = calculate_cultural_awareness_score(user, db)
    
    # Calculate overall score (weighted average)
    overall_score = int(
        (savings_score * 0.25) +
        (spending_score * 0.20) +
        (learning_score * 0.15) +
        (community_score * 0.15) +
        (goal_achievement_score * 0.15) +
        (cultural_awareness_score * 0.10)
    )
    
    # Generate recommendations
    recommendations = generate_score_recommendations(
        savings_score, spending_score, learning_score,
        community_score, goal_achievement_score, cultural_awareness_score
    )
    
    # Generate achievements
    achievements = generate_achievements(overall_score, user, db)
    
    return {
        "overall_score": overall_score,
        "savings_score": savings_score,
        "spending_score": spending_score,
        "learning_score": learning_score,
        "community_score": community_score,
        "goal_achievement_score": goal_achievement_score,
        "cultural_awareness_score": cultural_awareness_score,
        "calculation_date": datetime.utcnow(),
        "score_breakdown": {
            "savings": {"score": savings_score, "weight": "25%"},
            "spending": {"score": spending_score, "weight": "20%"},
            "learning": {"score": learning_score, "weight": "15%"},
            "community": {"score": community_score, "weight": "15%"},
            "goals": {"score": goal_achievement_score, "weight": "15%"},
            "cultural": {"score": cultural_awareness_score, "weight": "10%"}
        },
        "recommendations": recommendations,
        "achievements": achievements
    }

def calculate_savings_score(profile: FinancialProfile, goals: List[SavingsGoal]) -> int:
    """Calculate savings score based on savings rate and consistency."""
    if not profile or not profile.monthly_income or not profile.monthly_expenses:
        return 300  # Default score for incomplete profile
    
    savings_rate = ((profile.monthly_income - profile.monthly_expenses) / profile.monthly_income) * 100
    
    if savings_rate >= 30:
        return 900
    elif savings_rate >= 20:
        return 750
    elif savings_rate >= 10:
        return 600
    elif savings_rate >= 5:
        return 450
    else:
        return 300

def calculate_spending_score(profile: FinancialProfile) -> int:
    """Calculate spending score based on expense management."""
    if not profile or not profile.monthly_income or not profile.monthly_expenses:
        return 400
    
    expense_ratio = (profile.monthly_expenses / profile.monthly_income) * 100
    
    if expense_ratio <= 50:
        return 900
    elif expense_ratio <= 70:
        return 750
    elif expense_ratio <= 80:
        return 600
    elif expense_ratio <= 90:
        return 450
    else:
        return 300

def calculate_learning_score(user: User, db: Session) -> int:
    """Calculate learning score based on content engagement."""
    # In a real implementation, you'd track user's learning activities
    # For now, return a random score between 400-800
    return random.randint(400, 800)

def calculate_community_score(user: User, db: Session) -> int:
    """Calculate community engagement score."""
    # In a real implementation, you'd track community participation
    # For now, return a random score between 300-700
    return random.randint(300, 700)

def calculate_goal_achievement_score(goals: List[SavingsGoal]) -> int:
    """Calculate goal achievement score."""
    if not goals:
        return 400
    
    total_progress = 0
    completed_goals = 0
    
    for goal in goals:
        if goal.is_completed:
            completed_goals += 1
            total_progress += 100
        elif goal.target_amount > 0:
            progress = (goal.current_amount / goal.target_amount) * 100
            total_progress += min(progress, 100)
    
    average_progress = total_progress / len(goals) if goals else 0
    
    # Bonus for completed goals
    completion_bonus = (completed_goals / len(goals)) * 200 if goals else 0
    
    score = int((average_progress * 6) + completion_bonus)
    return min(score, 1000)

def calculate_cultural_awareness_score(user: User, db: Session) -> int:
    """Calculate cultural awareness and participation score."""
    score = 500  # Base score
    
    # Bonus for complete cultural profile
    if user.cultural_background:
        score += 100
    if user.state:
        score += 100
    if user.preferred_language != "en":
        score += 100
    
    # In real implementation, track festival savings, cultural event participation
    # For now, add random bonus
    score += random.randint(0, 200)
    
    return min(score, 1000)

def generate_score_recommendations(
    savings_score: int, spending_score: int, learning_score: int,
    community_score: int, goal_score: int, cultural_score: int
) -> List[str]:
    """Generate personalized recommendations based on scores."""
    recommendations = []
    
    if savings_score < 600:
        recommendations.append("Increase your savings rate to at least 20% of income")
    
    if spending_score < 600:
        recommendations.append("Review and optimize your monthly expenses")
    
    if learning_score < 500:
        recommendations.append("Engage more with financial learning content")
    
    if community_score < 500:
        recommendations.append("Join community circles and participate in challenges")
    
    if goal_score < 600:
        recommendations.append("Set clear financial goals and track progress regularly")
    
    if cultural_score < 600:
        recommendations.append("Explore culturally relevant financial products and festivals savings")
    
    return recommendations[:3]  # Return top 3 recommendations

def generate_achievements(overall_score: int, user: User, db: Session) -> List[str]:
    """Generate user achievements based on score and activities."""
    achievements = []
    
    if overall_score >= 800:
        achievements.append("🏆 Financial Champion - Excellent overall score!")
    elif overall_score >= 700:
        achievements.append("🥇 Financial Expert - Great financial management!")
    elif overall_score >= 600:
        achievements.append("🥈 Financial Learner - Good progress on financial goals!")
    
    # Add more specific achievements
    if user.cultural_background:
        achievements.append("🎭 Cultural Awareness - Profile includes cultural preferences")
    
    if user.preferred_language != "en":
        achievements.append("🗣️ Multilingual User - Using native language support")
    
    return achievements

async def generate_ai_financial_advice(user: User, query: str, context: Dict[str, Any]) -> str:
    """Generate AI-powered financial advice using Gemini."""
    
    if not model:
        return "AI service is currently unavailable. Please try again later."
    
    try:
        # Prepare context for AI
        user_context = f"""
        User Profile:
        - Name: {user.full_name}
        - State: {user.state}
        - Cultural Background: {user.cultural_background}
        - Preferred Language: {user.preferred_language}
        
        Financial Context:
        {json.dumps(context, indent=2)}
        
        User Query: {query}
        
        Please provide culturally sensitive financial advice in a conversational tone.
        Consider Indian financial products, festivals, and cultural practices.
        Keep the response concise and actionable.
        """
        
        response = model.generate_content(user_context)
        return response.text
        
    except Exception as e:
        print(f"Error generating AI advice: {e}")
        return "I'm having trouble processing your request right now. Please try again later."

async def generate_ai_cultural_nudge(user: User, financial_data: Dict[str, Any]) -> str:
    """Generate AI-powered cultural nudges using Gemini."""
    
    if not model:
        return "Plan your finances according to upcoming festivals and cultural events."
    
    try:
        prompt = f"""
        Generate a personalized financial nudge for an Indian user:
        
        User Details:
        - State: {user.state}
        - Cultural Background: {user.cultural_background}
        - Current Month: {datetime.now().strftime('%B')}
        
        Financial Data:
        {json.dumps(financial_data, indent=2)}
        
        Create a culturally relevant financial tip considering:
        - Upcoming Indian festivals
        - Regional financial practices
        - Seasonal savings opportunities
        
        Keep it under 100 words and actionable.
        """
        
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Error generating cultural nudge: {e}")
        return "Consider saving for upcoming festivals and cultural celebrations."

async def generate_dynamic_lessons(user: User, level: str, db: Session) -> Dict[str, Any]:
    """Generate dynamic lessons using Gemini AI based on user profile and level."""
    
    if not model:
        # Fallback to static content if AI is unavailable
        return generate_static_lesson_content(level)
    
    try:
        # Get user's financial profile for context
        financial_profile = db.query(FinancialProfile).filter(
            FinancialProfile.user_id == user.id
        ).first()
        
        # Get user's active goals
        active_goals = db.query(SavingsGoal).filter(
            SavingsGoal.user_id == user.id,
            SavingsGoal.is_completed == False
        ).all()
        
        # Prepare user context
        user_context = {
            "name": user.full_name,
            "state": user.state,
            "cultural_background": user.cultural_background,
            "preferred_language": user.preferred_language,
            "level": level,
            "monthly_income": financial_profile.monthly_income if financial_profile else None,
            "monthly_expenses": financial_profile.monthly_expenses if financial_profile else None,
            "dependents": financial_profile.dependents if financial_profile else 0,
            "active_goals": [goal.goal_name for goal in active_goals] if active_goals else [],
            "current_month": datetime.now().strftime('%B'),
            "current_year": datetime.now().year
        }
        
        prompt = f"""
        Generate comprehensive, detailed financial education lessons for an Indian user with the following profile:
        
        User Profile:
        - Name: {user_context['name']}
        - Financial Knowledge Level: {level.title()}
        - State: {user_context['state'] or 'India'}
        - Cultural Background: {user_context['cultural_background'] or 'Indian'}
        - Monthly Income: ₹{user_context['monthly_income'] or 'Not specified'}
        - Dependents: {user_context['dependents']}
        - Active Goals: {', '.join(user_context['active_goals']) if user_context['active_goals'] else 'None set'}
        - Current Month: {user_context['current_month']}
        
        Create 8-10 comprehensive, in-depth lesson topics that are:
        1. Appropriate for {level} level financial knowledge
        2. Relevant to their location ({user_context['state'] or 'India'})
        3. Consider their income level and family situation
        4. Include seasonal/cultural financial planning for {user_context['current_month']}
        5. Address their active financial goals if any
        6. Include multiple educational video recommendations per lesson (use real financial education YouTube video IDs, not placeholder URLs)
        7. Provide extensive, detailed content with real-world examples
        8. Include practical exercises and case studies
        
        IMPORTANT: For video URLs, use actual financial education YouTube videos. Do NOT use placeholder URLs like 'example1' or 'dQw4w9WgXcQ'. Use real educational content URLs.
        
        For each lesson, provide:
        - Title (engaging and specific)
        - Description (detailed 4-5 sentence explanation of comprehensive learning outcomes)
        - Duration (25-45 minutes for thorough learning)
        - Category (specific categories like "Advanced Budgeting", "Investment Strategies", etc.)
        - Detailed Content Sections (5-8 comprehensive sections with extensive explanations)
        - Multiple Video Resources (2-3 relevant educational videos)
        - Practical Examples (real-world scenarios and case studies)
        - Interactive Elements (quizzes, calculators, exercises)
        - Key Takeaways (5-6 actionable insights)
        
        Content Requirements:
        - Each content section should be 200-400 words with detailed explanations
        - Include specific examples relevant to Indian financial context
        - Provide step-by-step guides and practical tips
        - Include real-world case studies and scenarios
        - Add cultural and regional financial considerations
        
        Level Guidelines:
        - Beginner: Comprehensive basics, detailed budgeting, money management fundamentals
        - Intermediate: Advanced saving strategies, debt management, banking products
        - Proficient: Investment basics, insurance planning, tax-saving strategies
        - Advanced: Portfolio management, mutual funds, stock market, advanced tax planning
        - Expert: Wealth creation, retirement planning, complex investment strategies
        
        Indian Financial Context:
        - Detailed coverage of Indian financial products (PPF, ELSS, NSC, FD, RD)
        - Festival and seasonal financial planning strategies
        - Government schemes and benefits
        - Regional banking and investment practices
        - Cultural financial traditions and modern adaptations
        
        Return the response in this exact JSON format:
        {{
            "lessons": [
                {{
                    "title": "Comprehensive Lesson Title",
                    "description": "Detailed 4-5 sentence description explaining comprehensive learning outcomes and practical applications",
                    "duration": 35,
                    "category": "Specific Category Name",
                    "content_sections": [
                        {{
                            "title": "Section Title",
                            "content": "Detailed 200-400 word explanation with examples and practical tips",
                            "examples": ["Real-world example 1", "Practical scenario 2"]
                        }}
                    ],
                    "videos": [
                        {{
                            "url": "https://www.youtube.com/watch?v=WEDIj9JBTC8",
                            "title": "Educational Video Title 1",
                            "description": "What this video covers and key takeaways",
                            "duration": 8
                        }},
                        {{
                            "url": "https://www.youtube.com/watch?v=gFQNPmLKj1k",
                            "title": "Educational Video Title 2",
                            "description": "Additional learning content and practical demonstrations",
                            "duration": 12
                        }}
                    ],
                    "key_takeaways": ["Actionable insight 1", "Practical tip 2", "Important concept 3", "Real-world application 4", "Long-term benefit 5"],
                    "has_interactive": true,
                    "practical_exercise": "Detailed description of hands-on exercise or calculation"
                }}
            ],
            "personalization_note": "Detailed explanation of why these comprehensive lessons are specifically relevant to the user's profile and goals"
        }}
        """
        
        response = model.generate_content(prompt)
        
        # Parse the AI response
        try:
            import json
            lesson_data = json.loads(response.text)
            return lesson_data
        except json.JSONDecodeError:
            # If JSON parsing fails, return fallback content
            return generate_static_lesson_content(level)
            
    except Exception as e:
        print(f"Error generating dynamic lessons: {e}")
        return generate_static_lesson_content(level)

async def generate_additional_lessons(user: User, level: str, completed_lessons: List[str], db: Session) -> Dict[str, Any]:
    """Generate additional advanced lessons when user completes all current lessons."""
    
    if not model:
        return generate_static_lesson_content(level, is_additional=True)
    
    try:
        # Get user context
        financial_profile = db.query(FinancialProfile).filter(
            FinancialProfile.user_id == user.id
        ).first()
        
        completed_topics = ", ".join(completed_lessons) if completed_lessons else "None"
        
        prompt = f"""
        Generate 5-8 COMPREHENSIVE ADVANCED follow-up lessons for a user who has completed these topics: {completed_topics}
        
        User Profile:
        - Financial Knowledge Level: {level.title()}
        - State: {user.state or 'India'}
        - Monthly Income: ₹{financial_profile.monthly_income if financial_profile else 'Not specified'}
        
        Create comprehensive, detailed advanced lessons that:
        1. Build upon previously completed topics with deeper analysis
        2. Introduce more sophisticated concepts for {level} level
        3. Include extensive practical implementation strategies
        4. Focus on complex real-world applications and scenarios
        5. Include multiple educational videos and interactive elements (use real financial education YouTube video IDs, not placeholder URLs)
        6. Provide detailed case studies and examples
        7. Include step-by-step implementation guides
        
        IMPORTANT: For video URLs, use actual financial education YouTube videos. Do NOT use placeholder URLs like 'example1' or 'dQw4w9WgXcQ'. Use real educational content URLs.
        
        Each lesson should have:
        - 30-50 minutes of comprehensive content
        - 5-8 detailed content sections (200-400 words each)
        - 2-3 educational videos with descriptions
        - Advanced practical exercises and calculations
        - Real-world case studies specific to Indian context
        - 5-6 key takeaways with actionable insights
        - Interactive components and assessments
        
        Content Requirements:
        - Each section should provide in-depth analysis and practical guidance
        - Include specific examples from Indian financial markets and products
        - Provide advanced strategies and optimization techniques
        - Include risk analysis and mitigation strategies
        - Add cultural and regional considerations for advanced planning
        
        Return in the same comprehensive JSON format with:
        - title, description (4-5 sentences), duration (30-50 minutes)
        - content_sections array with detailed explanations
        - videos array with multiple educational resources
        - key_takeaways array with actionable insights
        - practical_exercise with detailed implementation steps
        - has_interactive: true
        """
        
        response = model.generate_content(prompt)
        
        try:
            import json
            lesson_data = json.loads(response.text)
            return lesson_data
        except json.JSONDecodeError:
            return generate_static_lesson_content(level, is_additional=True)
            
    except Exception as e:
        print(f"Error generating additional lessons: {e}")
        return generate_static_lesson_content(level, is_additional=True)

def generate_static_lesson_content(level: str, is_additional: bool = False) -> Dict[str, Any]:
    """Generate static lesson content as fallback."""
    
    if is_additional:
        # Advanced follow-up lessons
        advanced_lessons_by_level = {
            "beginner": [
                {
                    "title": "Digital Payment Safety",
                    "description": "Master secure online transactions and digital wallet usage.",
                    "duration": 18,
                    "category": "Digital Finance",
                    "key_points": ["UPI safety", "Fraud prevention", "Secure passwords", "Transaction limits"],
                    "video_url": "https://www.youtube.com/watch?v=8Df06hWmkX0",
                    "video_title": "Digital Payment Security Guide",
                    "has_interactive": True
                },
                {
                    "title": "Building Credit History",
                    "description": "Learn how to build and maintain a good credit score from the beginning.",
                    "duration": 20,
                    "category": "Credit Management",
                    "key_points": ["Credit score basics", "First credit card", "Payment history", "Credit utilization"],
                    "video_url": "https://www.youtube.com/watch?v=VsyLrLC6LXs",
                    "video_title": "Building Your First Credit Score",
                    "has_interactive": True
                }
            ],
            "intermediate": [
                {
                    "title": "Advanced Budgeting Techniques",
                    "description": "Master zero-based budgeting and envelope method for better control.",
                    "duration": 25,
                    "category": "Advanced Budgeting",
                    "key_points": ["Zero-based budgeting", "Envelope method", "Budget tracking apps", "Expense optimization"],
                    "video_url": "https://www.youtube.com/watch?v=sVKQn2R7eys",
                    "video_title": "Advanced Budgeting Strategies",
                    "has_interactive": True
                }
            ]
        }
        return {
            "lessons": advanced_lessons_by_level.get(level, advanced_lessons_by_level["beginner"]),
            "personalization_note": f"Advanced follow-up lessons to deepen your {level} level knowledge."
        }
    
    lessons_by_level = {
        "beginner": [
            {
                "title": "Understanding Money Basics",
                "description": "Learn fundamental concepts about money, income, and expenses in simple terms.",
                "duration": 10,
                "category": "Money Basics",
                "key_points": ["What is money?", "Income vs Expenses", "Needs vs Wants", "Simple budgeting"],
                "video_url": "https://www.youtube.com/watch?v=WEDIj9JBTC8",
                "video_title": "Money Basics for Beginners",
                "has_interactive": True
            },
            {
                "title": "Your First Savings Account",
                "description": "Discover how to open and manage your first bank account safely.",
                "duration": 15,
                "category": "Banking",
                "key_points": ["Choosing a bank", "Account types", "ATM safety", "Mobile banking basics"],
                "video_url": "https://www.youtube.com/watch?v=HQzoZfc3GwQ",
                "video_title": "Opening Your First Bank Account",
                "has_interactive": True
            },
            {
                "title": "Smart Shopping Habits",
                "description": "Learn how to make wise purchasing decisions and avoid overspending.",
                "duration": 12,
                "category": "Spending",
                "key_points": ["Price comparison", "Discount strategies", "Avoiding impulse buys", "Quality vs cost"],
                "video_url": "https://www.youtube.com/watch?v=R2376CwvLZs",
                "video_title": "Smart Shopping Tips",
                "has_interactive": True
            },
            {
                "title": "Understanding Bank Interest",
                "description": "Learn how interest works in savings accounts and loans.",
                "duration": 18,
                "category": "Banking",
                "key_points": ["Simple vs compound interest", "Savings account rates", "Loan interest basics", "Interest calculations"],
                "video_url": "https://www.youtube.com/watch?v=sTAhg_qJcQE",
                "video_title": "Understanding Interest Rates",
                "has_interactive": True
            }
        ],
        "intermediate": [
            {
                "title": "Smart Spending Habits",
                "description": "Develop mindful spending practices and avoid common money traps.",
                "duration": 20,
                "category": "Budgeting",
                "key_points": ["Price comparison", "Avoiding impulse buying", "Seasonal shopping", "Digital payment safety"],
                "video_url": "https://www.youtube.com/watch?v=gvZSpET11ZY",
                "video_title": "Smart Spending Strategies",
                "has_interactive": True
            },
            {
                "title": "Building Your Emergency Fund",
                "description": "Learn why and how to save money for unexpected situations.",
                "duration": 18,
                "category": "Saving",
                "key_points": ["Emergency fund importance", "How much to save", "Where to keep it", "Building gradually"],
                "video_url": "https://www.youtube.com/watch?v=i8YN6LnGk6Q",
                "video_title": "Emergency Fund Planning",
                "has_interactive": True
            },
            {
                "title": "Understanding Credit Cards",
                "description": "Learn responsible credit card usage and avoid debt traps.",
                "duration": 22,
                "category": "Credit Management",
                "key_points": ["Credit card basics", "Interest rates", "Minimum payments", "Reward programs"],
                "video_url": "https://www.youtube.com/watch?v=Vn8aK8QGPjg",
                "video_title": "Credit Card Fundamentals",
                "has_interactive": True
            },
            {
                "title": "Monthly Budget Planning",
                "description": "Create and maintain a realistic monthly budget that works.",
                "duration": 25,
                "category": "Budgeting",
                "key_points": ["50/30/20 rule", "Budget categories", "Tracking expenses", "Budget adjustments"],
                "video_url": "https://www.youtube.com/watch?v=7lHNMGoACdQ",
                "video_title": "Monthly Budget Mastery",
                "has_interactive": True
            },
            {
                "title": "Debt Management Basics",
                "description": "Learn strategies to manage and reduce existing debt effectively.",
                "duration": 20,
                "category": "Debt Management",
                "key_points": ["Debt snowball method", "Debt avalanche", "Consolidation options", "Payment strategies"],
                "video_url": "https://www.youtube.com/watch?v=3dtyOK_kWys",
                "video_title": "Debt Reduction Strategies",
                "has_interactive": True
            }
        ],
        "proficient": [
            {
                "title": "Setting Financial Goals",
                "description": "Master the art of setting and achieving short-term and long-term financial objectives.",
                "duration": 25,
                "category": "Goal Planning",
                "key_points": ["SMART goals", "Prioritizing goals", "Timeline planning", "Progress tracking"],
                "video_url": "https://www.youtube.com/watch?v=1-8QVNwE_Yk",
                "video_title": "Financial Goal Setting Mastery",
                "has_interactive": True
            },
            {
                "title": "Introduction to Insurance",
                "description": "Understand different types of insurance and their importance for financial security.",
                "duration": 22,
                "category": "Risk Management",
                "key_points": ["Life insurance basics", "Health insurance", "Term vs whole life", "Choosing coverage"],
                "video_url": "https://www.youtube.com/watch?v=4YB1P3S2979",
                "video_title": "Insurance Planning Guide",
                "has_interactive": True
            },
            {
                "title": "Investment Fundamentals",
                "description": "Learn the basics of investing and different investment options available.",
                "duration": 30,
                "category": "Investing",
                "key_points": ["Risk vs return", "Investment types", "Diversification", "Time horizon"],
                "video_url": "https://www.youtube.com/watch?v=gFQNPmLKj1k",
                "video_title": "Investment Basics for Beginners",
                "has_interactive": True
            },
            {
                "title": "Tax Planning Basics",
                "description": "Understand tax implications and basic tax-saving strategies.",
                "duration": 28,
                "category": "Tax Planning",
                "key_points": ["Income tax basics", "Deductions", "Tax-saving investments", "Filing returns"],
                "video_url": "https://www.youtube.com/watch?v=Arn7LoODUmA",
                "video_title": "Tax Planning Fundamentals",
                "has_interactive": True
            },
            {
                "title": "Building Wealth Mindset",
                "description": "Develop the right mindset and habits for long-term wealth building.",
                "duration": 24,
                "category": "Wealth Building",
                "key_points": ["Wealth vs income", "Compound interest", "Long-term thinking", "Financial discipline"],
                "video_url": "https://www.youtube.com/watch?v=R7cAdUgeWBQ",
                "video_title": "Wealth Building Psychology",
                "has_interactive": True
            }
        ],
        "advanced": [
            {
                "title": "Mutual Funds Demystified",
                "description": "Learn how mutual funds work and how to start investing through SIPs.",
                "duration": 30,
                "category": "Investing",
                "key_points": ["Types of mutual funds", "SIP benefits", "Risk assessment", "Fund selection"],
                "video_url": "https://www.youtube.com/watch?v=7oUlWGgZCMo",
                "video_title": "Mutual Funds Complete Guide",
                "has_interactive": True
            },
            {
                "title": "Tax Planning Strategies",
                "description": "Discover legal ways to save taxes while building wealth.",
                "duration": 28,
                "category": "Tax Planning",
                "key_points": ["Section 80C investments", "ELSS funds", "Tax-saving FDs", "Planning timeline"],
                "video_url": "https://www.youtube.com/watch?v=6wFsOCX3OKI",
                "video_title": "Advanced Tax Planning",
                "has_interactive": True
            },
            {
                "title": "Stock Market Fundamentals",
                "description": "Understand how stock markets work and basic equity investing.",
                "duration": 35,
                "category": "Stock Investing",
                "key_points": ["Stock market basics", "Company analysis", "Market trends", "Risk management"],
                "video_url": "https://www.youtube.com/watch?v=p7HKvqRI_Bo",
                "video_title": "Stock Market for Beginners",
                "has_interactive": True
            },
            {
                "title": "Real Estate Investment",
                "description": "Learn about real estate as an investment option and REITs.",
                "duration": 32,
                "category": "Real Estate",
                "key_points": ["Property investment", "REITs basics", "Location analysis", "Rental yields"],
                "video_url": "https://www.youtube.com/watch?v=IFAepGOVbTU",
                "video_title": "Real Estate Investment Guide",
                "has_interactive": True
            },
            {
                "title": "Credit Score Optimization",
                "description": "Master advanced strategies to build and maintain excellent credit.",
                "duration": 26,
                "category": "Credit Management",
                "key_points": ["Credit score factors", "Optimization strategies", "Credit monitoring", "Dispute resolution"],
                "video_url": "https://www.youtube.com/watch?v=aIuY_DAHvVo",
                "video_title": "Credit Score Mastery",
                "has_interactive": True
            },
            {
                "title": "Financial Planning Software",
                "description": "Learn to use digital tools for comprehensive financial planning.",
                "duration": 24,
                "category": "Financial Technology",
                "key_points": ["Planning software", "Portfolio tracking", "Goal monitoring", "Automation tools"],
                "video_url": "https://www.youtube.com/watch?v=TUVcZfQe-Kw",
                "video_title": "FinTech Tools for Planning",
                "has_interactive": True
            }
        ],
        "expert": [
            {
                "title": "Retirement Planning Mastery",
                "description": "Create a comprehensive retirement plan that ensures financial independence.",
                "duration": 35,
                "category": "Retirement",
                "key_points": ["Retirement corpus calculation", "PPF and NPS", "Pension planning", "Inflation impact"],
                "video_url": "https://www.youtube.com/watch?v=gvZSpET11ZY",
                "video_title": "Retirement Planning Masterclass",
                "has_interactive": True
            },
            {
                "title": "Advanced Portfolio Management",
                "description": "Learn sophisticated strategies for managing and optimizing your investment portfolio.",
                "duration": 40,
                "category": "Wealth Building",
                "key_points": ["Asset allocation", "Rebalancing", "Risk management", "Performance tracking"],
                "video_url": "https://www.youtube.com/watch?v=uST6StpLdfg",
                "video_title": "Portfolio Management Strategies",
                "has_interactive": True
            },
            {
                "title": "Alternative Investments",
                "description": "Explore advanced investment options like commodities, bonds, and derivatives.",
                "duration": 45,
                "category": "Advanced Investing",
                "key_points": ["Commodity investing", "Bond markets", "Derivatives basics", "Alternative assets"],
                "video_url": "https://www.youtube.com/watch?v=PHe0bXAIuk0",
                "video_title": "Alternative Investment Strategies",
                "has_interactive": True
            },
            {
                "title": "Estate Planning Fundamentals",
                "description": "Learn about wills, trusts, and wealth transfer strategies.",
                "duration": 38,
                "category": "Estate Planning",
                "key_points": ["Will creation", "Trust structures", "Tax implications", "Succession planning"],
                "video_url": "https://www.youtube.com/watch?v=MvgRgEASBd0",
                "video_title": "Estate Planning Guide",
                "has_interactive": True
            },
            {
                "title": "International Investing",
                "description": "Understand global markets and international investment opportunities.",
                "duration": 42,
                "category": "Global Investing",
                "key_points": ["Global diversification", "Currency risks", "International funds", "Tax considerations"],
                "video_url": "https://www.youtube.com/watch?v=hFzaWF0DQfU",
                "video_title": "International Investment Guide",
                "has_interactive": True
            },
            {
                "title": "Financial Independence Strategies",
                "description": "Master the FIRE movement and achieve financial independence.",
                "duration": 50,
                "category": "Financial Independence",
                "key_points": ["FIRE principles", "Passive income", "Expense optimization", "Early retirement"],
                "video_url": "https://www.youtube.com/watch?v=T71ibcZAX3I",
                "video_title": "Financial Independence Roadmap",
                "has_interactive": True
            }
        ]
    }
    
    return {
        "lessons": lessons_by_level.get(level, lessons_by_level["beginner"]),
        "personalization_note": f"These lessons are designed for {level} level learners to build practical financial skills."
    }

async def process_voice_query_with_ai(query: str, user: User, context: Dict[str, Any]) -> Dict[str, Any]:
    """Process voice query using AI for better intent understanding."""
    
    # Detect language from query or use user preference
    detected_language = "en"
    try:
        detected_language = detect(query)
    except:
        detected_language = getattr(user, 'preferred_language', 'en') or "en"
    
    # Language mapping for responses
    language_map = {
        'hi': 'Hindi',
        'en': 'English',
        'ta': 'Tamil',
        'te': 'Telugu',
        'gu': 'Gujarati',
        'mr': 'Marathi',
        'bn': 'Bengali',
        'kn': 'Kannada'
    }
    
    response_language = language_map.get(detected_language, 'English')
    
    # Temporarily using fallback approach due to API quota limits
    # TODO: Uncomment when Gemini API quota is available
    
    # if model:
    #     try:
    #         prompt = f"""
    #         You are FinTwin+, a helpful Indian financial assistant. Analyze this user query and provide personalized financial advice:
    #         
    #         User Query: "{query}"
    #         Response Language: {response_language}
    #         User State: {user.state or 'India'}
    #         Cultural Background: {user.cultural_background or 'Indian'}
    #         
    #         Provide specific advice based on:
    #         - Savings strategies for Indian context
    #         - Investment options suitable for the user
    #         - Government schemes and benefits
    #         - Cultural and festival-specific financial planning
    #         
    #         Format: Use bullet points and **bold** for emphasis. Respond in {response_language}.
    #         """
    #         
    #         response = model.generate_content(prompt)
    #         response_text = response.text.strip()
    #         
    #         suggestions = get_language_suggestions(detected_language)
    #         
    #         return {
    #             "text": response_text,
    #             "text_hindi": response_text if detected_language == 'hi' else None,
    #             "suggestions": suggestions,
    #             "action_required": False,
    #             "language": detected_language
    #         }
    #         
    #     except Exception as e:
    #         print(f"Error processing voice query with AI: {e}")
    
    # Fallback to rule-based processing
    intent = detect_intent(query, detected_language)
    return await generate_enhanced_contextual_response(query, intent, user, detected_language, context.get('db'))

async def run_financial_simulation(
    simulation_type: str,
    user_inputs: Dict[str, Any],
    user_profile: Dict[str, Any],
    db_profile: Any,
    user: User
) -> Dict[str, Any]:
    """Run comprehensive financial simulations using AI reasoning."""
    
    # Get base financial data
    monthly_income = user_profile.get('monthly_income') or (db_profile.monthly_income if db_profile else 50000)
    monthly_expenses = user_profile.get('monthly_expenses') or (db_profile.monthly_expenses if db_profile else 35000)
    current_savings = monthly_income - monthly_expenses
    location = user_profile.get('location') or (db_profile.location if db_profile else user.state or 'India')
    family_size = user_profile.get('family_size', 1)
    income_type = user_profile.get('income_type', 'fixed')
    existing_liabilities = user_profile.get('existing_liabilities', 0)
    
    # Simulation handlers
    simulation_handlers = {
        'monthly_budget_forecast': handle_monthly_budget_forecast,
        'loan_affordability': handle_loan_affordability,
        'savings_goal_tracker': handle_savings_goal_tracker,
        'expense_reduction_impact': handle_expense_reduction_impact,
        'life_event_planning': handle_life_event_planning,
        'loan_impact_estimation': handle_loan_impact_estimation,
        'income_drop_alert': handle_income_drop_alert,
        'festive_season_spending': handle_festive_season_spending,
        'retirement_readiness': handle_retirement_readiness,
        'weather_event_impact': handle_weather_event_impact,
        'emi_vs_saving_dilemma': handle_emi_vs_saving_dilemma,
        'investment_planning': handle_investment_planning,
        'best_option_selector': handle_best_option_selector
    }
    
    handler = simulation_handlers.get(simulation_type)
    if not handler:
        return {"error": "Unknown simulation type"}
    
    # Run the specific simulation
    result = await handler(
        user_inputs=user_inputs,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        current_savings=current_savings,
        location=location,
        family_size=family_size,
        income_type=income_type,
        existing_liabilities=existing_liabilities,
        user=user
    )
    
    return result

async def handle_monthly_budget_forecast(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """📅 Monthly Budget Forecast - Show how money flows this month."""
    
    # Calculate detailed breakdown
    essential_expenses = monthly_expenses * 0.6  # 60% for essentials
    discretionary_expenses = monthly_expenses * 0.4  # 40% for discretionary
    
    # Predict next month based on patterns
    seasonal_factor = 1.0
    if income_type == 'seasonal':
        seasonal_factor = 0.8  # Reduced income in off-season
    elif income_type == 'daily':
        seasonal_factor = 0.9  # Slight variation for daily wage
    
    predicted_income = monthly_income * seasonal_factor
    predicted_expenses = monthly_expenses * 1.05  # 5% inflation
    predicted_savings = predicted_income - predicted_expenses
    
    # Generate AI insights
    insights = []
    if predicted_savings < current_savings:
        insights.append("⚠️ Your savings might decrease next month due to seasonal factors")
    if predicted_expenses > monthly_expenses:
        insights.append("📈 Expenses are expected to rise by 5% due to inflation")
    if family_size > 3:
        insights.append("👨‍👩‍👧‍👦 Consider family-specific budgeting for larger household")
    
    return {
        "title": "Monthly Budget Forecast",
        "current_month": {
            "income": monthly_income,
            "expenses": monthly_expenses,
            "savings": current_savings,
            "savings_rate": round((current_savings / monthly_income) * 100, 1)
        },
        "next_month_prediction": {
            "income": round(predicted_income),
            "expenses": round(predicted_expenses),
            "savings": round(predicted_savings),
            "savings_rate": round((predicted_savings / predicted_income) * 100, 1)
        },
        "expense_breakdown": {
            "essential": round(essential_expenses),
            "discretionary": round(discretionary_expenses)
        },
        "insights": insights,
        "recommendations": [
            "Track daily expenses to improve accuracy",
            "Set up automatic savings transfers",
            "Review and optimize discretionary spending"
        ]
    }

async def handle_loan_affordability(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """💸 Can I Afford This? - Loan affordability analysis."""
    
    loan_amount = user_inputs.get('loan_amount', 100000)
    loan_tenure = user_inputs.get('loan_tenure', 12)  # months
    interest_rate = user_inputs.get('interest_rate', 12)  # annual %
    
    # Calculate EMI
    monthly_rate = interest_rate / (12 * 100)
    emi = loan_amount * monthly_rate * (1 + monthly_rate)**loan_tenure / ((1 + monthly_rate)**loan_tenure - 1)
    
    # Affordability analysis
    available_income = monthly_income - monthly_expenses - existing_liabilities
    debt_to_income_ratio = ((emi + existing_liabilities) / monthly_income) * 100
    
    # Risk assessment
    risk_level = "Low"
    if debt_to_income_ratio > 50:
        risk_level = "High"
    elif debt_to_income_ratio > 30:
        risk_level = "Medium"
    
    can_afford = available_income >= emi and debt_to_income_ratio <= 40
    
    return {
        "title": "Loan Affordability Analysis",
        "loan_details": {
            "amount": loan_amount,
            "tenure_months": loan_tenure,
            "interest_rate": interest_rate,
            "monthly_emi": round(emi)
        },
        "affordability": {
            "can_afford": can_afford,
            "available_income": round(available_income),
            "debt_to_income_ratio": round(debt_to_income_ratio, 1),
            "risk_level": risk_level
        },
        "total_cost": {
            "total_payment": round(emi * loan_tenure),
            "total_interest": round((emi * loan_tenure) - loan_amount)
        },
        "recommendations": [
            f"Keep debt-to-income ratio below 40% (currently {debt_to_income_ratio:.1f}%)",
            "Consider shorter tenure to save on interest" if loan_tenure > 24 else "Current tenure is optimal",
            "Build emergency fund before taking loan" if current_savings < (monthly_expenses * 3) else "Good emergency fund available"
        ]
    }

async def handle_savings_goal_tracker(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """📈 Savings Goal Tracker - Track progress towards financial goals."""
    
    target_amount = user_inputs.get('target_amount', 50000)
    target_date = user_inputs.get('target_date', '2024-12-31')
    current_saved = user_inputs.get('current_saved', 0)
    
    # Calculate timeline
    from datetime import datetime
    target_dt = datetime.strptime(target_date, '%Y-%m-%d')
    months_remaining = max(1, (target_dt - datetime.now()).days // 30)
    
    remaining_amount = target_amount - current_saved
    required_monthly_savings = remaining_amount / months_remaining
    
    # Feasibility analysis
    feasible = required_monthly_savings <= current_savings
    progress_percentage = (current_saved / target_amount) * 100
    
    # Adjust for income type
    if income_type == 'seasonal':
        required_monthly_savings *= 1.2  # 20% buffer for seasonal income
    elif income_type == 'daily':
        required_monthly_savings *= 1.1  # 10% buffer for daily wage
    
    return {
        "title": "Savings Goal Tracker",
        "goal_details": {
            "target_amount": target_amount,
            "current_saved": current_saved,
            "remaining_amount": remaining_amount,
            "target_date": target_date,
            "months_remaining": months_remaining
        },
        "progress": {
            "percentage_complete": round(progress_percentage, 1),
            "required_monthly_savings": round(required_monthly_savings),
            "current_monthly_savings": round(current_savings),
            "feasible": feasible
        },
        "timeline_analysis": {
            "on_track": feasible,
            "suggested_timeline": f"{math.ceil(remaining_amount / current_savings)} months" if current_savings > 0 else "Increase savings first",
            "acceleration_needed": round(required_monthly_savings - current_savings) if not feasible else 0
        },
        "recommendations": [
            "Increase monthly savings" if not feasible else "You're on track!",
            "Consider SIP investments for better returns",
            "Set up automatic transfers to savings account",
            "Review and reduce unnecessary expenses"
        ]
    }

async def handle_expense_reduction_impact(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """📉 Expense Reduction Impact - Analyze impact of reducing expenses."""
    
    reduction_amount = user_inputs.get('reduction_amount', 1000)
    expense_category = user_inputs.get('category', 'dining_out')
    
    # Calculate impact
    new_monthly_expenses = monthly_expenses - reduction_amount
    new_savings = monthly_income - new_monthly_expenses
    additional_savings = new_savings - current_savings
    
    # Annual impact
    annual_savings_increase = additional_savings * 12
    
    # Investment potential
    investment_returns_5yr = annual_savings_increase * 5 * 1.12  # 12% annual return
    investment_returns_10yr = annual_savings_increase * 10 * 1.15  # 15% annual return
    
    return {
        "title": "Expense Reduction Impact",
        "reduction_details": {
            "category": expense_category,
            "monthly_reduction": reduction_amount,
            "new_monthly_expenses": round(new_monthly_expenses),
            "additional_monthly_savings": round(additional_savings)
        },
        "impact_analysis": {
            "monthly_savings_increase": round(additional_savings),
            "annual_savings_increase": round(annual_savings_increase),
            "new_savings_rate": round((new_savings / monthly_income) * 100, 1)
        },
        "long_term_potential": {
            "5_year_investment_value": round(investment_returns_5yr),
            "10_year_investment_value": round(investment_returns_10yr)
        },
        "recommendations": [
            f"Reducing {expense_category} expenses can significantly boost savings",
            "Invest the additional savings for compound growth",
            "Track expenses to identify more reduction opportunities",
            "Consider this as a permanent lifestyle change"
        ]
    }

async def handle_life_event_planning(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """👶 Life Event Planner - Plan for major life events."""
    
    event_type = user_inputs.get('event_type', 'baby')
    timeline_months = user_inputs.get('timeline_months', 12)
    
    # Event cost estimates (in INR)
    event_costs = {
        'baby': {
            'immediate': 50000,  # Delivery, initial supplies
            'monthly_increase': 8000,  # Additional monthly expenses
            'one_time': 25000  # Baby gear, room setup
        },
        'marriage': {
            'immediate': 300000,  # Wedding expenses
            'monthly_increase': 5000,  # Married life adjustments
            'one_time': 100000  # Gifts, honeymoon
        },
        'home_purchase': {
            'immediate': 500000,  # Down payment
            'monthly_increase': 15000,  # EMI increase
            'one_time': 50000  # Registration, moving
        },
        'education': {
            'immediate': 100000,  # Course fees
            'monthly_increase': 3000,  # Study materials, transport
            'one_time': 20000  # Books, equipment
        }
    }
    
    costs = event_costs.get(event_type, event_costs['baby'])
    total_immediate_cost = costs['immediate'] + costs['one_time']
    
    # Calculate preparation needed
    monthly_savings_needed = total_immediate_cost / timeline_months
    can_afford_immediate = current_savings * timeline_months >= total_immediate_cost
    
    # Long-term impact
    new_monthly_expenses = monthly_expenses + costs['monthly_increase']
    new_savings_capacity = monthly_income - new_monthly_expenses
    
    return {
        "title": f"Life Event Planning - {event_type.title()}",
        "event_details": {
            "type": event_type,
            "timeline_months": timeline_months,
            "immediate_costs": costs['immediate'],
            "one_time_costs": costs['one_time'],
            "monthly_increase": costs['monthly_increase']
        },
        "financial_impact": {
            "total_immediate_cost": total_immediate_cost,
            "monthly_savings_needed": round(monthly_savings_needed),
            "can_afford_with_current_savings": can_afford_immediate,
            "new_monthly_expenses": round(new_monthly_expenses),
            "new_savings_capacity": round(new_savings_capacity)
        },
        "preparation_plan": {
            "start_saving_now": round(monthly_savings_needed),
            "emergency_fund_needed": round(new_monthly_expenses * 6),
            "insurance_review_needed": True
        },
        "recommendations": [
            f"Start saving ₹{monthly_savings_needed:,.0f} monthly for {event_type}",
            "Review and increase health/life insurance coverage",
            "Create separate savings account for this goal",
            "Consider reducing discretionary expenses temporarily"
        ]
    }

async def handle_loan_impact_estimation(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """🏦 Loan Impact Estimator - Estimate impact of taking a loan."""
    
    loan_amount = user_inputs.get('loan_amount', 20000)
    loan_tenure = user_inputs.get('loan_tenure', 12)
    loan_type = user_inputs.get('loan_type', 'personal')
    
    # Interest rates by loan type
    interest_rates = {
        'personal': 15,
        'business': 12,
        'education': 10,
        'home': 8.5,
        'vehicle': 9
    }
    
    interest_rate = interest_rates.get(loan_type, 15)
    
    # Calculate EMI
    monthly_rate = interest_rate / (12 * 100)
    emi = loan_amount * monthly_rate * (1 + monthly_rate)**loan_tenure / ((1 + monthly_rate)**loan_tenure - 1)
    
    # Impact analysis
    new_monthly_expenses = monthly_expenses + emi
    new_savings = monthly_income - new_monthly_expenses
    savings_reduction = current_savings - new_savings
    
    # Risk assessment
    debt_burden = ((emi + existing_liabilities) / monthly_income) * 100
    
    return {
        "title": "Loan Impact Estimation",
        "loan_details": {
            "amount": loan_amount,
            "type": loan_type,
            "tenure_months": loan_tenure,
            "interest_rate": interest_rate,
            "monthly_emi": round(emi)
        },
        "financial_impact": {
            "new_monthly_expenses": round(new_monthly_expenses),
            "new_monthly_savings": round(new_savings),
            "savings_reduction": round(savings_reduction),
            "debt_to_income_ratio": round(debt_burden, 1)
        },
        "total_cost": {
            "total_repayment": round(emi * loan_tenure),
            "total_interest": round((emi * loan_tenure) - loan_amount),
            "interest_percentage": round(((emi * loan_tenure) - loan_amount) / loan_amount * 100, 1)
        },
        "risk_assessment": {
            "risk_level": "High" if debt_burden > 50 else "Medium" if debt_burden > 30 else "Low",
            "emergency_fund_impact": "Significant" if new_savings < 5000 else "Moderate",
            "repayment_capacity": "Good" if new_savings > 0 else "Tight"
        },
        "recommendations": [
            "Consider shorter tenure to reduce total interest" if loan_tenure > 24 else "Tenure is reasonable",
            "Maintain emergency fund of 6 months expenses",
            "Avoid taking additional loans during this period",
            "Consider prepayment when possible to save interest"
        ]
    }

async def handle_income_drop_alert(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """🛑 Income Drop Alert - Analyze impact of income reduction."""
    
    income_reduction = user_inputs.get('income_reduction', 5000)
    duration_months = user_inputs.get('duration_months', 3)
    
    new_monthly_income = monthly_income - income_reduction
    new_savings = new_monthly_income - monthly_expenses
    monthly_deficit = abs(new_savings) if new_savings < 0 else 0
    
    # Calculate survival period
    if monthly_deficit > 0:
        survival_months = current_savings / monthly_deficit if current_savings > 0 else 0
    else:
        survival_months = float('inf')
    
    # Emergency actions needed
    emergency_actions = []
    if monthly_deficit > 0:
        emergency_actions.append("Immediate expense reduction required")
    if survival_months < 6:
        emergency_actions.append("Tap into emergency funds")
    if survival_months < 3:
        emergency_actions.append("Seek alternative income sources urgently")
    
    return {
        "title": "Income Drop Impact Analysis",
        "scenario": {
            "income_reduction": income_reduction,
            "new_monthly_income": new_monthly_income,
            "current_expenses": monthly_expenses,
            "duration_months": duration_months
        },
        "impact_analysis": {
            "new_monthly_savings": round(new_savings),
            "monthly_deficit": round(monthly_deficit),
            "total_deficit_period": round(monthly_deficit * duration_months),
            "survival_months": round(survival_months, 1) if survival_months != float('inf') else "Indefinite"
        },
        "emergency_plan": {
            "immediate_actions": emergency_actions,
            "expense_cuts_needed": round(monthly_deficit) if monthly_deficit > 0 else 0,
            "emergency_fund_usage": round(min(current_savings, monthly_deficit * duration_months))
        },
        "recommendations": [
            "Cut non-essential expenses immediately" if monthly_deficit > 0 else "Monitor expenses closely",
            "Explore freelance or part-time opportunities",
            "Negotiate payment deferrals with creditors if needed",
            "Consider temporary lifestyle adjustments",
            "Build larger emergency fund for future"
        ]
    }

async def handle_festive_season_spending(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """🛍️ Festive Season Spending - Plan for festival expenses."""
    
    festival_name = user_inputs.get('festival', 'Diwali')
    planned_spending = user_inputs.get('planned_spending', 15000)
    months_to_festival = user_inputs.get('months_to_festival', 3)
    
    # Festival spending patterns by region and festival
    festival_multipliers = {
        'Diwali': 1.5,
        'Durga Puja': 1.3,
        'Ganesh Chaturthi': 1.2,
        'Eid': 1.1,
        'Christmas': 1.2,
        'Holi': 0.8,
        'Navratri': 1.0
    }
    
    multiplier = festival_multipliers.get(festival_name, 1.0)
    estimated_total_spending = planned_spending * multiplier
    
    # Calculate preparation
    monthly_savings_needed = estimated_total_spending / months_to_festival if months_to_festival > 0 else estimated_total_spending
    can_afford = current_savings >= monthly_savings_needed
    
    # Impact on regular savings
    remaining_savings = current_savings - monthly_savings_needed
    
    return {
        "title": f"Festive Season Planning - {festival_name}",
        "festival_details": {
            "name": festival_name,
            "planned_spending": planned_spending,
            "estimated_total_spending": round(estimated_total_spending),
            "months_to_festival": months_to_festival
        },
        "financial_planning": {
            "monthly_savings_needed": round(monthly_savings_needed),
            "can_afford_with_current_savings": can_afford,
            "remaining_savings_after": round(remaining_savings),
            "impact_on_regular_goals": "Minimal" if remaining_savings > 10000 else "Significant"
        },
        "spending_breakdown": {
            "gifts_and_shopping": round(estimated_total_spending * 0.4),
            "food_and_sweets": round(estimated_total_spending * 0.3),
            "decorations": round(estimated_total_spending * 0.2),
            "miscellaneous": round(estimated_total_spending * 0.1)
        },
        "recommendations": [
            f"Start saving ₹{monthly_savings_needed:,.0f} monthly for {festival_name}",
            "Create a separate festival savings account",
            "Make a detailed shopping list to avoid overspending",
            "Consider homemade gifts and decorations to save money",
            "Look for early bird discounts and offers"
        ]
    }

async def handle_retirement_readiness(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """👴 Retirement Readiness - Plan for retirement."""
    
    current_age = user_inputs.get('current_age', 30)
    retirement_age = user_inputs.get('retirement_age', 60)
    desired_monthly_income = user_inputs.get('desired_monthly_income', monthly_expenses)
    
    years_to_retirement = retirement_age - current_age
    months_to_retirement = years_to_retirement * 12
    
    # Calculate retirement corpus needed (25x annual expenses rule)
    annual_retirement_income = desired_monthly_income * 12
    retirement_corpus_needed = annual_retirement_income * 25
    
    # Calculate monthly SIP needed (assuming 12% annual return)
    monthly_return_rate = 0.12 / 12
    if months_to_retirement > 0:
        monthly_sip_needed = retirement_corpus_needed * monthly_return_rate / ((1 + monthly_return_rate)**months_to_retirement - 1)
    else:
        monthly_sip_needed = retirement_corpus_needed
    
    # Current retirement readiness
    current_retirement_savings = user_inputs.get('current_retirement_savings', 0)
    readiness_percentage = (current_retirement_savings / retirement_corpus_needed) * 100 if retirement_corpus_needed > 0 else 0
    
    return {
        "title": "Retirement Readiness Analysis",
        "retirement_plan": {
            "current_age": current_age,
            "retirement_age": retirement_age,
            "years_to_retirement": years_to_retirement,
            "desired_monthly_income": desired_monthly_income
        },
        "corpus_calculation": {
            "retirement_corpus_needed": round(retirement_corpus_needed),
            "current_retirement_savings": current_retirement_savings,
            "gap_amount": round(retirement_corpus_needed - current_retirement_savings),
            "readiness_percentage": round(readiness_percentage, 1)
        },
        "investment_plan": {
            "monthly_sip_needed": round(monthly_sip_needed),
            "affordable_with_current_savings": monthly_sip_needed <= current_savings,
            "percentage_of_income": round((monthly_sip_needed / monthly_income) * 100, 1)
        },
        "recommendations": [
            f"Start SIP of ₹{monthly_sip_needed:,.0f} monthly for retirement",
            "Invest in equity mutual funds for long-term growth",
            "Consider EPF, PPF, and NPS for tax benefits",
            "Review and increase SIP amount annually",
            "Don't rely solely on traditional savings accounts"
        ]
    }

async def handle_weather_event_impact(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """🌾 Weather/Event Impact - For farmers and daily wage earners."""
    
    event_type = user_inputs.get('event_type', 'rain')
    duration_days = user_inputs.get('duration_days', 14)
    income_impact_percentage = user_inputs.get('income_impact', 80)  # % income loss
    
    # Calculate impact based on income type
    if income_type == 'daily':
        daily_income = monthly_income / 30
        income_loss = daily_income * duration_days * (income_impact_percentage / 100)
    elif income_type == 'seasonal':
        # Seasonal workers might lose entire month's income
        income_loss = monthly_income * (income_impact_percentage / 100)
    else:
        # Fixed income workers might have reduced impact
        income_loss = monthly_income * 0.1 * (income_impact_percentage / 100)
    
    # Additional expenses during event
    additional_expenses = {
        'rain': 2000,  # Waterproofing, transport issues
        'drought': 3000,  # Water purchase, crop loss
        'flood': 5000,  # Evacuation, temporary shelter
        'storm': 4000   # Repairs, emergency supplies
    }
    
    extra_expenses = additional_expenses.get(event_type, 2000)
    total_financial_impact = income_loss + extra_expenses
    
    # Recovery analysis
    months_to_recover = total_financial_impact / current_savings if current_savings > 0 else float('inf')
    
    return {
        "title": f"Weather Impact Analysis - {event_type.title()}",
        "event_details": {
            "type": event_type,
            "duration_days": duration_days,
            "income_impact_percentage": income_impact_percentage,
            "income_type": income_type
        },
        "financial_impact": {
            "income_loss": round(income_loss),
            "additional_expenses": extra_expenses,
            "total_impact": round(total_financial_impact),
            "current_savings": current_savings
        },
        "recovery_analysis": {
            "can_cover_with_savings": current_savings >= total_financial_impact,
            "months_to_recover": round(months_to_recover, 1) if months_to_recover != float('inf') else "Cannot recover with current savings",
            "emergency_fund_adequacy": "Adequate" if current_savings >= total_financial_impact * 2 else "Insufficient"
        },
        "mitigation_strategies": [
            "Build weather-specific emergency fund",
            "Diversify income sources to reduce dependency",
            "Consider weather insurance if available",
            "Join community support groups",
            "Maintain 3-6 months of expenses as emergency fund"
        ],
        "immediate_actions": [
            "Apply for government relief schemes",
            "Contact local NGOs for support",
            "Negotiate with creditors for payment deferrals",
            "Explore temporary alternative income sources"
        ]
    }

async def handle_emi_vs_saving_dilemma(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """🧾 EMI vs Saving Dilemma - Should I take EMI or save to buy?"""
    
    item_cost = user_inputs.get('item_cost', 50000)
    item_type = user_inputs.get('item_type', 'electronics')
    emi_tenure = user_inputs.get('emi_tenure', 12)
    emi_interest_rate = user_inputs.get('interest_rate', 15)
    
    # EMI Option Analysis
    monthly_rate = emi_interest_rate / (12 * 100)
    emi_amount = item_cost * monthly_rate * (1 + monthly_rate)**emi_tenure / ((1 + monthly_rate)**emi_tenure - 1)
    total_emi_cost = emi_amount * emi_tenure
    total_interest = total_emi_cost - item_cost
    
    # Saving Option Analysis
    months_to_save = item_cost / current_savings if current_savings > 0 else float('inf')
    
    # Investment opportunity cost
    if current_savings > 0:
        investment_returns = current_savings * months_to_save * 0.01  # 12% annual return
    else:
        investment_returns = 0
    
    # Depreciation factor for different items
    depreciation_rates = {
        'electronics': 0.15,  # 15% annual depreciation
        'vehicle': 0.10,      # 10% annual depreciation
        'furniture': 0.05,    # 5% annual depreciation
        'appliances': 0.08    # 8% annual depreciation
    }
    
    depreciation_rate = depreciation_rates.get(item_type, 0.10)
    item_value_after_saving = item_cost * (1 - depreciation_rate * (months_to_save / 12))
    
    return {
        "title": "EMI vs Saving Analysis",
        "item_details": {
            "type": item_type,
            "cost": item_cost,
            "emi_tenure": emi_tenure,
            "interest_rate": emi_interest_rate
        },
        "emi_option": {
            "monthly_emi": round(emi_amount),
            "total_cost": round(total_emi_cost),
            "total_interest": round(total_interest),
            "immediate_ownership": True,
            "impact_on_monthly_budget": round((emi_amount / monthly_income) * 100, 1)
        },
        "saving_option": {
            "months_to_save": round(months_to_save, 1) if months_to_save != float('inf') else "Cannot save with current rate",
            "opportunity_cost": round(investment_returns),
            "item_value_when_purchased": round(item_value_after_saving),
            "total_effective_cost": round(item_cost - investment_returns),
            "delayed_ownership": True
        },
        "comparison": {
            "emi_total_cost": round(total_emi_cost),
            "saving_effective_cost": round(item_cost - investment_returns),
            "savings_advantage": round(total_emi_cost - (item_cost - investment_returns)),
            "recommended_option": "Save" if (total_emi_cost > item_cost - investment_returns) else "EMI"
        },
        "recommendations": [
            "Save if you can wait and invest the money" if total_emi_cost > item_cost - investment_returns else "EMI might be better for immediate need",
            "Consider 0% EMI offers if available",
            "Factor in urgency of need",
            "Check for seasonal discounts while saving"
        ]
    }

async def handle_investment_planning(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """💡 Investment Planning - Plan investment strategy."""
    
    investment_amount = user_inputs.get('monthly_investment', 2000)
    investment_duration = user_inputs.get('duration_years', 5)
    risk_tolerance = user_inputs.get('risk_tolerance', 'moderate')
    investment_goal = user_inputs.get('goal', 'wealth_creation')
    
    # Investment options based on risk tolerance
    investment_options = {
        'conservative': {
            'fd': {'allocation': 40, 'return': 6.5},
            'ppf': {'allocation': 30, 'return': 7.1},
            'debt_funds': {'allocation': 30, 'return': 7.5}
        },
        'moderate': {
            'equity_funds': {'allocation': 50, 'return': 12},
            'debt_funds': {'allocation': 30, 'return': 7.5},
            'fd': {'allocation': 20, 'return': 6.5}
        },
        'aggressive': {
            'equity_funds': {'allocation': 70, 'return': 15},
            'small_cap_funds': {'allocation': 20, 'return': 18},
            'debt_funds': {'allocation': 10, 'return': 7.5}
        }
    }
    
    portfolio = investment_options.get(risk_tolerance, investment_options['moderate'])
    
    # Calculate returns
    total_investment = investment_amount * 12 * investment_duration
    weighted_return = sum(option['allocation'] * option['return'] for option in portfolio.values()) / 100
    
    # Future value calculation (SIP)
    monthly_return = weighted_return / (12 * 100)
    months = investment_duration * 12
    future_value = investment_amount * (((1 + monthly_return)**months - 1) / monthly_return) * (1 + monthly_return)
    
    total_returns = future_value - total_investment
    
    return {
        "title": "Investment Planning Strategy",
        "investment_details": {
            "monthly_amount": investment_amount,
            "duration_years": investment_duration,
            "risk_tolerance": risk_tolerance,
            "goal": investment_goal
        },
        "portfolio_allocation": portfolio,
        "projection": {
            "total_investment": round(total_investment),
            "expected_return_rate": round(weighted_return, 1),
            "future_value": round(future_value),
            "total_returns": round(total_returns),
            "return_percentage": round((total_returns / total_investment) * 100, 1)
        },
        "sip_analysis": {
            "monthly_sip": investment_amount,
            "affordable": investment_amount <= current_savings,
            "percentage_of_income": round((investment_amount / monthly_income) * 100, 1)
        },
        "recommendations": [
            f"Start SIP of ₹{investment_amount:,} based on your {risk_tolerance} risk profile",
            "Diversify across asset classes as shown in allocation",
            "Review and rebalance portfolio annually",
            "Increase SIP amount by 10% every year",
            "Stay invested for the full duration for best results"
        ]
    }

async def handle_best_option_selector(user_inputs, monthly_income, monthly_expenses, current_savings, location, family_size, income_type, existing_liabilities, user):
    """📊 Best Option Selector - Compare different financial options."""
    
    option1 = user_inputs.get('option1', {'name': 'Buy Scooter', 'cost': 80000, 'monthly_cost': 3000})
    option2 = user_inputs.get('option2', {'name': 'Public Transport', 'cost': 0, 'monthly_cost': 1500})
    comparison_period = user_inputs.get('comparison_years', 3)
    
    # Calculate total costs over comparison period
    option1_total = option1['cost'] + (option1['monthly_cost'] * 12 * comparison_period)
    option2_total = option2['cost'] + (option2['monthly_cost'] * 12 * comparison_period)
    
    # Additional factors
    option1_benefits = {
        'convenience': 9,
        'time_saving': 8,
        'comfort': 9,
        'flexibility': 10
    }
    
    option2_benefits = {
        'convenience': 6,
        'time_saving': 5,
        'comfort': 6,
        'flexibility': 4
    }
    
    # Financial impact analysis
    option1_monthly_impact = (option1['cost'] / (comparison_period * 12)) + option1['monthly_cost']
    option2_monthly_impact = option2['monthly_cost']
    
    savings_difference = option1_total - option2_total
    
    # Investment opportunity of savings
    if savings_difference > 0:
        monthly_savings = savings_difference / (12 * comparison_period)
        investment_value = monthly_savings * (((1 + 0.01)**36 - 1) / 0.01) * 1.01  # 12% annual return
    else:
        investment_value = 0
    
    return {
        "title": "Best Option Comparison",
        "options": {
            "option1": {
                "name": option1['name'],
                "initial_cost": option1['cost'],
                "monthly_cost": option1['monthly_cost'],
                "total_cost_3_years": round(option1_total)
            },
            "option2": {
                "name": option2['name'],
                "initial_cost": option2['cost'],
                "monthly_cost": option2['monthly_cost'],
                "total_cost_3_years": round(option2_total)
            }
        },
        "financial_analysis": {
            "cost_difference": round(abs(option1_total - option2_total)),
            "cheaper_option": option1['name'] if option1_total < option2_total else option2['name'],
            "monthly_impact_option1": round(option1_monthly_impact),
            "monthly_impact_option2": round(option2_monthly_impact),
            "investment_opportunity": round(investment_value) if investment_value > 0 else 0
        },
        "qualitative_comparison": {
            "option1_benefits": option1_benefits,
            "option2_benefits": option2_benefits,
            "option1_score": sum(option1_benefits.values()),
            "option2_score": sum(option2_benefits.values())
        },
        "recommendation": {
            "financially_better": option1['name'] if option1_total < option2_total else option2['name'],
            "overall_better": "Consider both financial and convenience factors",
            "break_even_period": f"{abs(option1['cost'] - option2['cost']) / abs(option1['monthly_cost'] - option2['monthly_cost']) / 12:.1f} years" if option1['monthly_cost'] != option2['monthly_cost'] else "N/A"
        },
        "recommendations": [
            f"Financially, {option2['name'] if option2_total < option1_total else option1['name']} is better by ₹{abs(option1_total - option2_total):,.0f}",
            "Consider convenience and time value in your decision",
            "Factor in your current financial goals and priorities",
            "Evaluate based on your income stability and emergency fund status"
        ]
    }