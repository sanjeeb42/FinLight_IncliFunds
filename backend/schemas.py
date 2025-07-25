from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class RiskTolerance(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class GoalCategory(str, Enum):
    WEDDING = "wedding"
    FESTIVAL = "festival"
    EDUCATION = "education"
    EMERGENCY = "emergency"
    HOUSE = "house"
    BUSINESS = "business"
    RETIREMENT = "retirement"

class ChallengeType(str, Enum):
    SAVINGS = "savings"
    NO_SPEND = "no_spend"
    LEARNING = "learning"
    INVESTMENT = "investment"

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    preferred_language: str = "en"
    state: Optional[str] = None
    cultural_background: Optional[str] = None
    financial_knowledge_level: Optional[str] = "beginner"

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserResponse(UserBase):
    id: int
    language: Optional[str] = "en"
    religion: Optional[str] = None
    onboarding_completed: bool = False
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Financial Profile schemas
class FinancialProfileBase(BaseModel):
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    savings_goal: Optional[float] = None
    risk_tolerance: Optional[RiskTolerance] = None
    investment_preferences: Optional[List[str]] = []
    financial_goals: Optional[List[str]] = []
    occupation: Optional[str] = None
    family_size: Optional[int] = None
    dependents: Optional[int] = None

class FinancialProfileCreate(FinancialProfileBase):
    pass

class FinancialProfileResponse(FinancialProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Voice Assistant schemas
class VoiceQuery(BaseModel):
    query: str
    language: str = "en"
    audio_data: Optional[str] = None  # Base64 encoded audio
    session_id: Optional[str] = None

class VoiceResponse(BaseModel):
    response_text: str
    audio_url: Optional[str] = None
    suggestions: List[str] = []
    action_required: bool = False
    intent: Optional[str] = None
    confidence: Optional[float] = None

# Community schemas
class CommunityCircleBase(BaseModel):
    name: str
    description: Optional[str] = None
    state: Optional[str] = None
    language: str = "en"
    category: Optional[str] = None

class CommunityCircleCreate(CommunityCircleBase):
    pass

class CommunityCircleResponse(CommunityCircleBase):
    id: int
    member_count: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class LearningContentBase(BaseModel):
    title: str
    content: str
    content_type: str  # story, lesson, tip
    language: str = "en"
    state_specific: Optional[str] = None
    cultural_context: Optional[str] = None

class LearningContentCreate(LearningContentBase):
    circle_id: int

class LearningContentResponse(LearningContentBase):
    id: int
    circle_id: int
    created_by: int
    is_approved: bool
    view_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PeerChallengeBase(BaseModel):
    title: str
    description: str
    challenge_type: ChallengeType
    target_amount: Optional[float] = None
    duration_days: int
    start_date: datetime
    end_date: datetime

class PeerChallengeCreate(PeerChallengeBase):
    circle_id: int

class PeerChallengeResponse(PeerChallengeBase):
    id: int
    circle_id: int
    created_by: int
    is_active: bool
    participant_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Government Schemes schemas
class GovernmentSchemeBase(BaseModel):
    name: str
    description: str
    scheme_type: str
    eligibility_criteria: Dict[str, Any]
    benefits: List[str]
    application_process: str
    required_documents: List[str]
    applicable_states: List[str]
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    income_max: Optional[float] = None
    official_website: Optional[str] = None

class GovernmentSchemeResponse(GovernmentSchemeBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class EligibilityCheck(BaseModel):
    scheme_id: int
    user_data: Dict[str, Any]

class EligibilityResponse(BaseModel):
    eligible: bool
    confidence: float
    missing_criteria: List[str] = []
    recommendations: List[str] = []
    next_steps: List[str] = []

# Local Agent schemas
class LocalAgentBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    state: str
    district: str
    specializations: List[str]
    languages_spoken: List[str]
    whatsapp_number: Optional[str] = None

class LocalAgentResponse(LocalAgentBase):
    id: int
    rating: float
    total_reviews: int
    is_verified: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Financial Knowledge Assessment Schemas
class AssessmentQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int
    difficulty_level: str

class AssessmentAnswer(BaseModel):
    question_id: int
    selected_answer: int

class AssessmentSubmission(BaseModel):
    answers: List[AssessmentAnswer]

class AssessmentResult(BaseModel):
    score: int
    total_questions: int
    knowledge_level: str
    level_description: str
    tagline: str

# Savings Goals schemas
class SavingsGoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[datetime] = None
    category: GoalCategory
    cultural_context: Optional[str] = None
    priority: str = "medium"
    auto_contribution: float = 0.0

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalResponse(SavingsGoalBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    progress_percentage: Optional[float] = None
    
    class Config:
        from_attributes = True

class SavingsTransactionBase(BaseModel):
    amount: float
    transaction_type: str  # deposit, withdrawal
    description: Optional[str] = None

class SavingsTransactionCreate(SavingsTransactionBase):
    goal_id: int

class SavingsTransactionResponse(SavingsTransactionBase):
    id: int
    goal_id: int
    transaction_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Financial Score schemas
class FinancialScoreResponse(BaseModel):
    overall_score: int
    savings_score: int
    spending_score: int
    learning_score: int
    community_score: int
    goal_achievement_score: int
    cultural_awareness_score: int
    calculation_date: datetime
    score_breakdown: Dict[str, Any]
    recommendations: List[str]
    achievements: List[str]
    
    class Config:
        from_attributes = True

# Cultural Nudge schemas
class CulturalNudgeBase(BaseModel):
    nudge_type: str
    title: str
    message: str
    cultural_context: Optional[str] = None
    state_specific: Optional[str] = None
    language: str = "en"
    action_suggested: Optional[str] = None
    expires_at: Optional[datetime] = None

class CulturalNudgeResponse(CulturalNudgeBase):
    id: int
    user_id: int
    is_read: bool
    is_acted_upon: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Investment Filter schemas
class InvestmentFilterBase(BaseModel):
    name: str
    filter_type: str
    description: str
    criteria: Dict[str, Any]
    applicable_religions: List[str]
    excluded_sectors: List[str]

class InvestmentFilterResponse(InvestmentFilterBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardData(BaseModel):
    financial_score: FinancialScoreResponse
    active_goals: List[SavingsGoalResponse]
    cultural_nudges: List[CulturalNudgeResponse]
    community_activities: List[Dict[str, Any]]
    recent_transactions: List[SavingsTransactionResponse]
    upcoming_festivals: List[Dict[str, Any]]
    scheme_recommendations: List[GovernmentSchemeResponse]

# Analytics schemas
class UserAnalytics(BaseModel):
    total_savings: float
    monthly_savings_rate: float
    goal_completion_rate: float
    community_engagement_score: int
    learning_progress: Dict[str, Any]
    cultural_activity_participation: int
    
class CommunityAnalytics(BaseModel):
    total_members: int
    active_members: int
    completed_challenges: int
    total_savings_achieved: float
    top_performers: List[Dict[str, Any]]
    engagement_metrics: Dict[str, Any]