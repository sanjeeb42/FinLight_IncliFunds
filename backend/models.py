from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    preferred_language = Column(String, default="en")
    language = Column(String, default="en")
    state = Column(String)
    religion = Column(String)
    cultural_background = Column(String)
    financial_knowledge_level = Column(String, default="beginner")  # beginner, intermediate, proficient, advanced, expert
    onboarding_completed = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False)
    savings_goals = relationship("SavingsGoal", back_populates="user")
    community_memberships = relationship("CommunityMembership", back_populates="user")
    voice_interactions = relationship("VoiceInteraction", back_populates="user")
    financial_scores = relationship("FinancialScore", back_populates="user")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    monthly_income = Column(Float)
    monthly_expenses = Column(Float)
    savings_goal = Column(Float)
    risk_tolerance = Column(String)  # low, medium, high
    investment_preferences = Column(JSON)  # Array of preferences
    financial_goals = Column(JSON)  # Array of goals
    occupation = Column(String)
    family_size = Column(Integer)
    dependents = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="financial_profile")

class CommunityCircle(Base):
    __tablename__ = "community_circles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    state = Column(String)
    language = Column(String)
    category = Column(String)  # women, youth, farmers, etc.
    member_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    memberships = relationship("CommunityMembership", back_populates="circle")
    learning_content = relationship("LearningContent", back_populates="circle")
    challenges = relationship("PeerChallenge", back_populates="circle")

class CommunityMembership(Base):
    __tablename__ = "community_memberships"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    circle_id = Column(Integer, ForeignKey("community_circles.id"))
    role = Column(String, default="member")  # member, mentor, admin
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="community_memberships")
    circle = relationship("CommunityCircle", back_populates="memberships")

class LearningContent(Base):
    __tablename__ = "learning_content"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text)
    content_type = Column(String)  # story, lesson, tip
    language = Column(String)
    state_specific = Column(String)
    cultural_context = Column(String)
    circle_id = Column(Integer, ForeignKey("community_circles.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    is_approved = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    circle = relationship("CommunityCircle", back_populates="learning_content")

class PeerChallenge(Base):
    __tablename__ = "peer_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    challenge_type = Column(String)  # savings, no_spend, learning
    target_amount = Column(Float)
    duration_days = Column(Integer)
    circle_id = Column(Integer, ForeignKey("community_circles.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    participant_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    circle = relationship("CommunityCircle", back_populates="challenges")
    participations = relationship("ChallengeParticipation", back_populates="challenge")

class ChallengeParticipation(Base):
    __tablename__ = "challenge_participations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    challenge_id = Column(Integer, ForeignKey("peer_challenges.id"))
    current_progress = Column(Float, default=0.0)
    is_completed = Column(Boolean, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    challenge = relationship("PeerChallenge", back_populates="participations")

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    scheme_type = Column(String)  # insurance, savings, loan, subsidy
    eligibility_criteria = Column(JSON)
    benefits = Column(JSON)
    application_process = Column(Text)
    required_documents = Column(JSON)
    applicable_states = Column(JSON)
    age_min = Column(Integer)
    age_max = Column(Integer)
    income_max = Column(Float)
    is_active = Column(Boolean, default=True)
    official_website = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LocalAgent(Base):
    __tablename__ = "local_agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String)
    address = Column(Text)
    state = Column(String)
    district = Column(String)
    specializations = Column(JSON)  # Array of scheme types they handle
    languages_spoken = Column(JSON)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    whatsapp_number = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime)
    category = Column(String)  # wedding, festival, education, emergency
    cultural_context = Column(String)  # diwali, wedding, harvest
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high
    auto_contribution = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="savings_goals")
    transactions = relationship("SavingsTransaction", back_populates="goal")

class SavingsTransaction(Base):
    __tablename__ = "savings_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("savings_goals.id"))
    amount = Column(Float, nullable=False)
    transaction_type = Column(String)  # deposit, withdrawal
    description = Column(String)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    goal = relationship("SavingsGoal", back_populates="transactions")

class VoiceInteraction(Base):
    __tablename__ = "voice_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query_text = Column(Text)
    query_language = Column(String)
    response_text = Column(Text)
    response_language = Column(String)
    intent_detected = Column(String)
    confidence_score = Column(Float)
    session_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="voice_interactions")

class FinancialScore(Base):
    __tablename__ = "financial_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    overall_score = Column(Integer)  # 0-1000
    savings_score = Column(Integer)
    spending_score = Column(Integer)
    learning_score = Column(Integer)
    community_score = Column(Integer)
    goal_achievement_score = Column(Integer)
    cultural_awareness_score = Column(Integer)
    calculation_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="financial_scores")

class CulturalNudge(Base):
    __tablename__ = "cultural_nudges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    nudge_type = Column(String)  # festival, seasonal, cultural_event
    title = Column(String, nullable=False)
    message = Column(Text)
    cultural_context = Column(String)
    state_specific = Column(String)
    language = Column(String)
    action_suggested = Column(String)
    is_read = Column(Boolean, default=False)
    is_acted_upon = Column(Boolean, default=False)
    expires_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InvestmentFilter(Base):
    __tablename__ = "investment_filters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    filter_type = Column(String)  # shariah_compliant, jain_ethical, etc.
    description = Column(Text)
    criteria = Column(JSON)
    applicable_religions = Column(JSON)
    excluded_sectors = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SimulationProfile(Base):
    __tablename__ = "simulation_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    monthly_income = Column(Float)
    monthly_expenses = Column(Float)
    location = Column(String)
    family_size = Column(Integer, default=1)
    dependents = Column(Integer, default=0)
    goal = Column(String)  # Education, Festive, Emergency, etc.
    existing_liabilities = Column(Float, default=0.0)
    income_type = Column(String, default="fixed")  # fixed, daily, seasonal
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")