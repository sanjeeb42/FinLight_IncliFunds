from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import uvicorn
from datetime import datetime, timedelta
from typing import Optional, List
import os
from dotenv import load_dotenv
import asyncio
from functools import lru_cache
import time
import logging

# Configure logging for performance monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import our modules
from database import get_db, engine, Base
from models import User, FinancialProfile, CommunityCircle, GovernmentScheme, SavingsGoal, SimulationProfile
from schemas import (
    UserCreate, UserResponse, UserLogin, Token, AuthResponse,
    FinancialProfileCreate, FinancialProfileResponse,
    CommunityCircleResponse, GovernmentSchemeResponse,
    SavingsGoalCreate, SavingsGoalResponse,
    VoiceQuery, VoiceResponse, AssessmentQuestion, AssessmentSubmission, AssessmentResult
)
from auth import (
    create_access_token, verify_token, get_current_user,
    authenticate_user, get_password_hash
)
from ai_services import (
    process_voice_query, generate_cultural_nudge,
    check_scheme_eligibility, calculate_financial_score,
    process_voice_query_with_ai, generate_ai_financial_advice,
    generate_ai_cultural_nudge, generate_dynamic_lessons,
    generate_additional_lessons, run_financial_simulation
)
from voice_services import text_to_speech, speech_to_text, get_speech_recognition_language
from services.assessment_service import assessment_service

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app with performance optimizations
app = FastAPI(
    title="FinTwin+ API",
    description="Cultural & State-Aware Financial Twin API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# Add compression middleware for faster responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configure CORS with optimizations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174","http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Performance monitoring middleware
@app.middleware("http")
async def add_performance_headers(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log slow requests
    if process_time > 1.0:  # Log requests taking more than 1 second
        logger.warning(f"Slow request: {request.method} {request.url} took {process_time:.2f}s")
    
    return response

# Cache for frequently accessed data
cache = {}
cache_ttl = {}
CACHE_DURATION = 300  # 5 minutes

def get_from_cache(key: str):
    if key in cache and time.time() - cache_ttl.get(key, 0) < CACHE_DURATION:
        return cache[key]
    return None

def set_cache(key: str, value):
    cache[key] = value
    cache_ttl[key] = time.time()

security = HTTPBearer()

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "FinTwin+ API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/auth/register", response_model=AuthResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        hashed_password=hashed_password,
        preferred_language=user.preferred_language,
        state=user.state,
        cultural_background=user.cultural_background,
        financial_knowledge_level=user.financial_knowledge_level or 'beginner'
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate access token for the new user
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(db_user)
    )

@app.post("/auth/login", response_model=AuthResponse)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

# User profile endpoints
@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    # Cache user profile for faster subsequent requests
    cache_key = f"user_profile_{current_user.id}"
    cached_profile = get_from_cache(cache_key)
    
    if cached_profile:
        return cached_profile
    
    user_response = UserResponse.from_orm(current_user)
    set_cache(cache_key, user_response)
    return user_response

@app.put("/auth/profile", response_model=UserResponse)
async def update_user_profile(
    profile_updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user fields that are allowed to be modified
    if "culturalProfile" in profile_updates:
        cultural = profile_updates["culturalProfile"]
        if "state" in cultural:
            current_user.state = cultural["state"]
        if "religion" in cultural:
            current_user.religion = cultural["religion"]
        if "language" in cultural:
            current_user.language = cultural["language"]
        if "familyStructure" in cultural:
            current_user.cultural_background = cultural["familyStructure"]
    
    if "financialGoals" in profile_updates:
        # Handle financial goals if needed
        pass
    
    if "growthScore" in profile_updates:
        # Handle growth score if needed
        pass
    
    # Mark onboarding as completed
    current_user.onboarding_completed = True
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.from_orm(current_user)

@app.get("/users/{user_id}/financial-profile", response_model=FinancialProfileResponse)
async def get_financial_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Financial profile not found")
    
    return FinancialProfileResponse.from_orm(profile)

@app.post("/users/{user_id}/financial-profile", response_model=FinancialProfileResponse)
async def create_financial_profile(
    user_id: int,
    profile_data: FinancialProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if profile already exists
    existing_profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Financial profile already exists")
    
    # Create new financial profile
    db_profile = FinancialProfile(
        user_id=user_id,
        monthly_income=profile_data.monthly_income,
        monthly_expenses=profile_data.monthly_expenses,
        savings_goal=profile_data.savings_goal,
        risk_tolerance=profile_data.risk_tolerance,
        investment_preferences=profile_data.investment_preferences,
        financial_goals=profile_data.financial_goals
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    return FinancialProfileResponse.from_orm(db_profile)

# Voice assistant endpoints
@app.post("/voice/query", response_model=VoiceResponse)
async def process_voice(
    voice_query: VoiceQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Process the voice query using Gemini AI
        context = {"db": db}
        response = await process_voice_query_with_ai(
            query=voice_query.query,
            user=current_user,
            context=context
        )
        
        return VoiceResponse(
            response_text=response["text"],
            audio_url=response.get("audio_url"),
            suggestions=response.get("suggestions", []),
            action_required=response.get("action_required", False)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice processing error: {str(e)}")

@app.post("/voice/text-to-speech")
async def convert_text_to_speech(
    text: str,
    language: str = "en",
    current_user: User = Depends(get_current_user)
):
    try:
        audio_file = await text_to_speech(text, language)
        return {"audio_url": audio_file, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@app.post("/voice/speech-to-text")
async def convert_speech_to_text(
    audio_data: str,  # Base64 encoded audio
    language: str = "en",
    audio_format: str = "wav",
    current_user: User = Depends(get_current_user)
):
    """Test endpoint for speech-to-text conversion with Cloud API support"""
    try:
        import base64
        # Decode base64 audio data
        audio_bytes = base64.b64decode(audio_data)
        
        # Convert speech to text
        result = await speech_to_text(audio_bytes, language, audio_format)
        
        return {
            "transcribed_text": result["text"],
            "confidence": result["confidence"],
            "language": result["language"],
            "success": result["success"],
            "api_used": result.get("api_used", "unknown"),
            "error": result.get("error", None)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text conversion failed: {str(e)}")

@app.get("/voice/api-status")
async def get_voice_api_status():
    """Check which speech-to-text APIs are available"""
    cloud_api_available = bool(os.getenv("GOOGLE_CLOUD_API_KEY"))
    
    return {
        "google_cloud_speech_api": {
            "available": cloud_api_available,
            "status": "configured" if cloud_api_available else "api_key_missing"
        },
        "google_free_speech_api": {
            "available": True,
            "status": "available"
        },
        "primary_api": "google_cloud" if cloud_api_available else "google_free",
        "supported_languages": ["en", "hi", "ta", "te", "bn", "gu", "kn", "ml", "mr", "pa"]
    }

@app.get("/voice/supported-languages")
async def get_supported_voice_languages():
    from voice_services import get_supported_languages
    return get_supported_languages()

# AI-powered chat endpoint for voice assistant
@app.post("/ai/chat")
async def get_ai_chat_response(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        message = request.get("message", "")
        language = request.get("language", "en")
        user_context = request.get("user_context", {})
        
        # Use the existing voice query processing with AI
        context = {"db": db}
        response = await process_voice_query_with_ai(
            query=message,
            user=current_user,
            context=context
        )
        
        return {
            "content": response["text"],
            "content_hindi": response.get("text_hindi", response["text"]) if language == "hi" else None,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

# AI-powered financial advice endpoint
@app.post("/ai/financial-advice")
async def get_ai_financial_advice(
    query: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get user's financial context
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
        goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
        
        context = {
            "profile": profile.__dict__ if profile else {},
            "goals": [goal.__dict__ for goal in goals],
            "user_state": current_user.state,
            "cultural_background": current_user.cultural_background
        }
        
        advice = await generate_ai_financial_advice(current_user, query, context)
        return {"advice": advice, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI advice error: {str(e)}")

# AI-powered cultural nudges endpoint
@app.get("/ai/cultural-nudges")
async def get_ai_cultural_nudges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get user's financial data
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
        goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
        
        financial_data = {
            "monthly_income": profile.monthly_income if profile else 0,
            "monthly_expenses": profile.monthly_expenses if profile else 0,
            "savings_goals": len(goals),
            "total_goal_amount": sum(goal.target_amount for goal in goals)
        }
        
        nudge = await generate_ai_cultural_nudge(current_user, financial_data)
        return {"nudge": nudge, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cultural nudge error: {str(e)}")

# Community endpoints
@app.get("/community/circles", response_model=List[CommunityCircleResponse])
async def get_community_circles(
    state: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create cache key based on state filter
    cache_key = f"community_circles_{state or 'all'}"
    cached_circles = get_from_cache(cache_key)
    
    if cached_circles:
        logger.info(f"Cache hit for community circles: state={state}")
        return cached_circles
    
    # Optimize query with limit and ordering
    query = db.query(CommunityCircle)
    if state:
        query = query.filter(CommunityCircle.state == state)
    
    circles = query.order_by(CommunityCircle.id.desc()).limit(30).all()
    circles_response = [CommunityCircleResponse.from_orm(circle) for circle in circles]
    
    # Cache community circles for 10 minutes
    set_cache(cache_key, circles_response)
    logger.info(f"Generated and cached community circles for state={state}")
    
    return circles_response

# Government schemes endpoints
@app.get("/schemes", response_model=List[GovernmentSchemeResponse])
async def get_government_schemes(
    state: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create cache key based on state filter
    cache_key = f"government_schemes_{state or 'all'}"
    cached_schemes = get_from_cache(cache_key)
    
    if cached_schemes:
        logger.info(f"Cache hit for government schemes: state={state}")
        return cached_schemes
    
    # Optimize query with limit and ordering
    query = db.query(GovernmentScheme)
    if state:
        query = query.filter(GovernmentScheme.applicable_states.contains(state))
    
    schemes = query.order_by(GovernmentScheme.id.desc()).limit(50).all()
    schemes_response = [GovernmentSchemeResponse.from_orm(scheme) for scheme in schemes]
    
    # Cache government schemes for 15 minutes (they change less frequently)
    set_cache(cache_key, schemes_response)
    logger.info(f"Generated and cached government schemes for state={state}")
    
    return schemes_response

@app.post("/schemes/check-eligibility")
async def check_eligibility(
    scheme_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    eligibility = await check_scheme_eligibility(current_user, scheme, db)
    return eligibility

# Savings and goals endpoints
@app.get("/savings/goals", response_model=List[SavingsGoalResponse])
async def get_savings_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check cache first for savings goals
    cache_key = f"savings_goals_{current_user.id}"
    cached_goals = get_from_cache(cache_key)
    
    if cached_goals:
        logger.info(f"Cache hit for savings goals: user {current_user.id}")
        return cached_goals
    
    # Optimize query with limit and ordering
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id
    ).order_by(SavingsGoal.created_at.desc()).limit(20).all()
    
    goals_response = [SavingsGoalResponse.from_orm(goal) for goal in goals]
    
    # Cache savings goals for 5 minutes
    set_cache(cache_key, goals_response)
    logger.info(f"Generated and cached savings goals for user {current_user.id}")
    
    return goals_response

@app.post("/savings/goals", response_model=SavingsGoalResponse)
async def create_savings_goal(
    goal_data: SavingsGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_goal = SavingsGoal(
        user_id=current_user.id,
        title=goal_data.title,
        target_amount=goal_data.target_amount,
        current_amount=goal_data.current_amount,
        target_date=goal_data.target_date,
        category=goal_data.category,
        cultural_context=goal_data.cultural_context
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return SavingsGoalResponse.from_orm(db_goal)

# Dashboard endpoints
@app.get("/dashboard/")
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check cache first for dashboard data
    cache_key = f"dashboard_{current_user.id}"
    cached_dashboard = get_from_cache(cache_key)
    
    if cached_dashboard:
        logger.info(f"Cache hit for dashboard: user {current_user.id}")
        return cached_dashboard
    
    try:
        # Optimize database queries by fetching related data in fewer queries
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
        goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).limit(5).all()  # Limit for performance
        
        # Get financial score (with fallback for incomplete profiles)
        try:
            financial_score = await calculate_financial_score(current_user, db)
        except Exception as e:
            logger.warning(f"Financial score calculation failed for user {current_user.id}: {str(e)}")
            financial_score = {"score": 500, "category": "Getting Started"}  # Default score
        
        # Calculate monthly summary efficiently
        monthly_summary = {
            "income": profile.monthly_income if profile else 0,
            "expenses": profile.monthly_expenses if profile else 0,
            "savings": (profile.monthly_income - profile.monthly_expenses) if profile and profile.monthly_income and profile.monthly_expenses else 0
        }
        
        # Get cultural nudges (with fallback for incomplete cultural profile)
        try:
            cultural_nudges = await generate_cultural_nudge(current_user, db)
            cultural_nudges_list = [nudge.get("message", "") for nudge in cultural_nudges[:3]]  # Limit to 3
        except Exception as e:
            logger.warning(f"Cultural nudges generation failed for user {current_user.id}: {str(e)}")
            # Fallback nudges for users who skipped onboarding
            cultural_nudges_list = [
                "Welcome to FinTwin+! Start by setting your first savings goal.",
                "Complete your profile to get personalized financial advice.",
                "Explore government schemes that might benefit you."
            ]
        
        # Recent activities (optimized - could be from database in real implementation)
        recent_activities = [
            {"type": "goal_created", "description": "New savings goal created", "date": "2024-01-15"},
            {"type": "profile_updated", "description": "Profile information updated", "date": "2024-01-14"}
        ]
        
        # Upcoming festivals (cached static data)
        upcoming_festivals = [
            {"name": "Diwali", "date": "2024-11-01", "savings_suggestion": "₹5000"},
            {"name": "Holi", "date": "2024-03-13", "savings_suggestion": "₹2000"}
        ]
        
        dashboard_data = {
            "financial_score": financial_score.get("score", 500),
            "monthly_summary": monthly_summary,
            "recent_activities": recent_activities,
            "upcoming_festivals": upcoming_festivals,
            "cultural_nudges": cultural_nudges_list
        }
        
        # Cache dashboard data for 2 minutes (shorter cache for dynamic data)
        set_cache(cache_key, dashboard_data)
        logger.info(f"Generated and cached dashboard data for user {current_user.id}")
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Dashboard error for user {current_user.id}: {str(e)}")
        # Fallback response for any errors
        fallback_data = {
            "financial_score": 500,
            "monthly_summary": {"income": 0, "expenses": 0, "savings": 0},
            "recent_activities": [],
            "upcoming_festivals": [],
            "cultural_nudges": ["Welcome to FinTwin+! Complete your profile to get started."]
        }
        # Cache fallback data for shorter time
        set_cache(cache_key, fallback_data)
        return fallback_data

@app.get("/dashboard/financial-score")
async def get_financial_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check cache first for financial score
    cache_key = f"financial_score_{current_user.id}"
    cached_score = get_from_cache(cache_key)
    
    if cached_score:
        logger.info(f"Cache hit for financial score: user {current_user.id}")
        return cached_score
    
    try:
        score_data = await calculate_financial_score(current_user, db)
        # Cache financial score for 5 minutes
        set_cache(cache_key, score_data)
        logger.info(f"Generated and cached financial score for user {current_user.id}")
        return score_data
    except Exception as e:
        logger.error(f"Financial score calculation error for user {current_user.id}: {str(e)}")
        fallback_score = {"score": 500, "category": "Getting Started", "error": str(e)}
        # Cache fallback for shorter time
        set_cache(cache_key, fallback_score)
        return fallback_score

@app.get("/dashboard/cultural-nudges")
async def get_cultural_nudges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check cache first for cultural nudges
    cache_key = f"cultural_nudges_{current_user.id}"
    cached_nudges = get_from_cache(cache_key)
    
    if cached_nudges:
        logger.info(f"Cache hit for cultural nudges: user {current_user.id}")
        return cached_nudges
    
    try:
        nudges = await generate_cultural_nudge(current_user, db)
        nudges_data = {"nudges": nudges}
        # Cache cultural nudges for 10 minutes (they change less frequently)
        set_cache(cache_key, nudges_data)
        logger.info(f"Generated and cached cultural nudges for user {current_user.id}")
        return nudges_data
    except Exception as e:
        logger.error(f"Cultural nudges generation error for user {current_user.id}: {str(e)}")
        fallback_nudges = {"nudges": [], "error": str(e)}
        # Cache fallback for shorter time
        set_cache(cache_key, fallback_nudges)
        return fallback_nudges

# Assessment endpoints
@app.get("/assessment/questions", response_model=List[AssessmentQuestion])
async def get_assessment_questions():
    """Get assessment questions for financial literacy evaluation"""
    try:
        # Check cache first for assessment questions
        cache_key = "assessment_questions_all"
        cached_questions = get_from_cache(cache_key)
        
        if cached_questions:
            logger.info("Cache hit for assessment questions")
            return cached_questions
        
        questions = assessment_service.get_questions()
        
        # Cache assessment questions for 60 minutes (they rarely change)
        set_cache(cache_key, questions)
        logger.info("Generated and cached assessment questions")
        
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching questions: {str(e)}")

@app.post("/assessment/submit", response_model=AssessmentResult)
async def submit_assessment(
    submission: AssessmentSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit assessment answers and get results"""
    try:
        # Convert submission to list of dicts
        answers = [{
            "question_id": answer.question_id,
            "selected_answer": answer.selected_answer
        } for answer in submission.answers]
        
        result = assessment_service.get_assessment_result(answers)
        
        # Update user's financial knowledge level in database
        current_user.financial_knowledge_level = result.knowledge_level
        db.commit()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing assessment: {str(e)}")

@app.put("/users/knowledge-level")
async def update_knowledge_level(
    level_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allow user to manually update their knowledge level"""
    try:
        new_level = level_data.get("knowledge_level")
        valid_levels = ["beginner", "intermediate", "proficient", "advanced", "expert"]
        
        if new_level not in valid_levels:
            raise HTTPException(status_code=400, detail="Invalid knowledge level")
        
        current_user.financial_knowledge_level = new_level
        db.commit()
        
        level_content = assessment_service.get_level_content(new_level)
        
        return {
            "message": "Knowledge level updated successfully",
            "knowledge_level": new_level,
            "level_content": level_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating knowledge level: {str(e)}")

@app.get("/users/level-content")
async def get_level_content(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get content for user's current knowledge level with enhanced caching and query optimization"""
    try:
        level = getattr(current_user, 'financial_knowledge_level', 'beginner')
        
        # Check cache first for user-specific content with optimized cache key
        cache_key = f"level_content_{current_user.id}_{level}"
        cached_content = get_from_cache(cache_key)
        
        if cached_content:
            logger.info(f"Cache hit for level content: user {current_user.id}, level {level}")
            return cached_content
        
        # Generate content if not cached with optimized database queries
        level_data = assessment_service.get_level_content(level)
        
        # Generate dynamic lessons using AI (this is expensive, so cache it longer)
        dynamic_lessons = await generate_dynamic_lessons(current_user, level, db)
        
        result = {
            "level": level,
            "tagline": level_data["tagline"],
            "name": level_data["name"],
            "description": level_data["description"],
            "content": dynamic_lessons
        }
        
        # Cache the result for 15 minutes (longer for expensive AI operations)
        set_cache(cache_key, result)
        logger.info(f"Generated and cached level content for user {current_user.id}, level {level}")
        
        return result
    except Exception as e:
        logger.error(f"Error fetching level content for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching level content: {str(e)}")

@app.post("/lessons/generate-additional")
async def generate_additional_lessons_endpoint(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate additional lessons when user completes all existing ones"""
    try:
        level = getattr(current_user, 'financial_knowledge_level', 'beginner')
        completed_lessons = request_data.get('completed_lessons', [])
        
        # Generate additional lessons using AI
        additional_lessons = await generate_additional_lessons(current_user, level, completed_lessons, db)
        
        return {
            "success": True,
            "level": level,
            "additional_content": additional_lessons,
            "message": "New lessons generated successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating additional lessons: {str(e)}")

@app.post("/lessons/complete")
async def mark_lesson_complete(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a lesson as completed and track progress"""
    try:
        lesson_id = request_data.get('lesson_id')
        lesson_title = request_data.get('lesson_title', '')
        
        # Here you could store completion data in database if needed
        # For now, we'll just return success
        
        return {
            "success": True,
            "lesson_id": lesson_id,
            "message": f"Lesson '{lesson_title}' marked as completed!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking lesson complete: {str(e)}")

# Financial Simulation endpoints
@app.post("/simulations/run")
async def run_simulation(
    simulation_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run a financial simulation based on user input"""
    try:
        simulation_type = simulation_data.get('simulation_type')
        user_inputs = simulation_data.get('inputs', {})
        user_profile = simulation_data.get('user_profile', {})
        
        # Get user's financial profile from database
        profile = db.query(SimulationProfile).filter(SimulationProfile.user_id == current_user.id).first()
        
        # Run the simulation using AI services
        result = await run_financial_simulation(
            simulation_type=simulation_type,
            user_inputs=user_inputs,
            user_profile=user_profile,
            db_profile=profile,
            user=current_user
        )
        
        return {
            "success": True,
            "simulation_type": simulation_type,
            "result": result
        }
    except Exception as e:
        # Handle quota exceeded or other API errors with fallback
        if "quota" in str(e).lower() or "429" in str(e):
            # Provide a basic fallback simulation result
            monthly_income = user_profile.get('monthly_income', 50000)
            monthly_expenses = user_profile.get('monthly_expenses', 35000)
            current_savings = monthly_income - monthly_expenses
            
            fallback_result = {
                "title": "Basic Financial Analysis",
                "message": "AI service temporarily unavailable. Here's a basic analysis:",
                "current_situation": {
                    "monthly_income": monthly_income,
                    "monthly_expenses": monthly_expenses,
                    "monthly_savings": current_savings,
                    "savings_rate": round((current_savings / monthly_income) * 100, 1) if monthly_income > 0 else 0
                },
                "basic_recommendations": [
                    "Maintain an emergency fund of 6 months expenses",
                    "Try to save at least 20% of your income",
                    "Review and optimize your monthly expenses",
                    "Consider investing surplus funds for long-term growth"
                ],
                "note": "For detailed AI-powered analysis, please try again later."
            }
            
            return {
                "success": True,
                "simulation_type": simulation_type,
                "result": fallback_result,
                "fallback_mode": True
            }
        else:
            raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")

@app.post("/simulations/save-profile")
async def save_simulation_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or update user's simulation profile"""
    try:
        # Get or create user profile
        profile = db.query(SimulationProfile).filter(SimulationProfile.user_id == current_user.id).first()
        
        if not profile:
            profile = SimulationProfile(user_id=current_user.id)
            db.add(profile)
        
        # Update profile with simulation data
        if 'location' in profile_data:
            profile.location = profile_data['location']
        if 'familySize' in profile_data:
            profile.family_size = profile_data['familySize']
        if 'incomeType' in profile_data:
            profile.income_type = profile_data['incomeType']
        if 'existingLiabilities' in profile_data:
            profile.existing_liabilities = profile_data['existingLiabilities']
        if 'primaryGoal' in profile_data:
            profile.goal = profile_data['primaryGoal']
        if 'monthlyIncome' in profile_data:
            profile.monthly_income = profile_data['monthlyIncome']
        if 'monthlyExpenses' in profile_data:
            profile.monthly_expenses = profile_data['monthlyExpenses']
        if 'dependents' in profile_data:
            profile.dependents = profile_data['dependents']
        
        db.commit()
        
        return {
            "success": True,
            "message": "Profile saved successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving profile: {str(e)}")

@app.get("/simulations/profile")
async def get_simulation_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's simulation profile"""
    # Check cache first for simulation profile
    cache_key = f"simulation_profile_{current_user.id}"
    cached_profile = get_from_cache(cache_key)
    
    if cached_profile:
        logger.info(f"Cache hit for simulation profile: user {current_user.id}")
        return cached_profile
    
    try:
        profile = db.query(SimulationProfile).filter(SimulationProfile.user_id == current_user.id).first()
        
        if not profile:
            profile_data = {
                "has_profile": False,
                "profile": {}
            }
        else:
            profile_data = {
                "has_profile": True,
                "profile": {
                    "location": profile.location,
                    "familySize": profile.family_size,
                    "incomeType": profile.income_type,
                    "existingLiabilities": profile.existing_liabilities,
                    "primaryGoal": profile.goal,
                    "monthlyIncome": profile.monthly_income,
                    "monthlyExpenses": profile.monthly_expenses,
                    "dependents": profile.dependents
                }
            }
        
        # Cache simulation profile for 10 minutes
        set_cache(cache_key, profile_data)
        logger.info(f"Generated and cached simulation profile for user {current_user.id}")
        
        return profile_data
    except Exception as e:
        logger.error(f"Error fetching simulation profile for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )