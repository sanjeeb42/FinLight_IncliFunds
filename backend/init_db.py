#!/usr/bin/env python3
"""
Database initialization script for FinTwin+ application.
This script creates all tables and populates initial data.
"""

import asyncio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import Base, DATABASE_URL, get_db
from models import (
    User, FinancialProfile, CommunityCircle, LearningContent,
    GovernmentScheme, LocalAgent, CulturalNudge, InvestmentFilter
)
from auth import get_password_hash
from datetime import datetime, date
import json

# Create engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def populate_government_schemes():
    """Populate government schemes data."""
    print("Populating government schemes...")
    
    db = SessionLocal()
    try:
        schemes = [
            {
                "name": "Pradhan Mantri Jan Dhan Yojana",
                "description": "Financial inclusion program providing bank accounts with zero balance",
                "eligibility_criteria": json.dumps({
                    "age_min": 18,
                    "income_max": 200000,
                    "documents_required": ["Aadhaar", "PAN"]
                }),
                "benefits": json.dumps({
                    "zero_balance_account": True,
                    "overdraft_facility": 10000,
                    "insurance_cover": 200000
                }),
                "application_process": "Visit nearest bank branch with required documents",
                "official_website": "https://pmjdy.gov.in/",
                "applicable_states": json.dumps(["All States"]),
                
                
            },
            {
                "name": "Atal Pension Yojana",
                "description": "Pension scheme for unorganized sector workers",
                "eligibility_criteria": json.dumps({
                    "age_min": 18,
                    "age_max": 40,
                    "income_max": 500000,
                    "documents_required": ["Aadhaar", "Bank Account"]
                }),
                "benefits": json.dumps({
                    "guaranteed_pension": True,
                    "pension_amount": [1000, 2000, 3000, 4000, 5000],
                    "government_contribution": True
                }),
                "application_process": "Apply through bank or online portal",
                "official_website": "https://npscra.nsdl.co.in/",
                "applicable_states": json.dumps(["All States"]),
                
                
            },
            {
                "name": "Sukanya Samriddhi Yojana",
                "description": "Savings scheme for girl child education and marriage",
                "eligibility_criteria": json.dumps({
                    "girl_child_age_max": 10,
                    "documents_required": ["Birth Certificate", "Aadhaar", "Parent ID"]
                }),
                "benefits": json.dumps({
                    "interest_rate": 7.6,
                    "tax_benefit": True,
                    "maturity_period": 21,
                    "partial_withdrawal": True
                }),
                "application_process": "Open account at post office or authorized bank",
                "official_website": "https://www.nsiindia.gov.in/",
                "applicable_states": json.dumps(["All States"]),
                
                "is_active": True
            },
            {
                "name": "PM Kisan Samman Nidhi",
                "description": "Income support for small and marginal farmers",
                "eligibility_criteria": json.dumps({
                    "land_holding_max": 2,
                    "farmer_category": ["Small", "Marginal"],
                    "documents_required": ["Land Records", "Aadhaar", "Bank Account"]
                }),
                "benefits": json.dumps({
                    "annual_amount": 6000,
                    "installments": 3,
                    "direct_transfer": True
                }),
                "application_process": "Register online or through Common Service Centers",
                "official_website": "https://pmkisan.gov.in/",
                "applicable_states": json.dumps(["All States"]),
                
                "is_active": True
            },
            {
                "name": "Pradhan Mantri Mudra Yojana",
                "description": "Micro-finance scheme for small businesses",
                "eligibility_criteria": json.dumps({
                    "business_type": ["Manufacturing", "Trading", "Services"],
                    "loan_amount_max": 1000000,
                    "documents_required": ["Business Plan", "Aadhaar", "Bank Statements"]
                }),
                "benefits": json.dumps({
                    "collateral_free": True,
                    "categories": {
                        "Shishu": 50000,
                        "Kishore": 500000,
                        "Tarun": 1000000
                    }
                }),
                "application_process": "Apply through banks, NBFCs, or MFIs",
                "official_website": "https://mudra.org.in/",
                "applicable_states": json.dumps(["All States"]),
                
                "is_active": True
            }
        ]
        
        for scheme_data in schemes:
            # Check if scheme already exists
            existing = db.query(GovernmentScheme).filter(
                GovernmentScheme.name == scheme_data["name"]
            ).first()
            
            if not existing:
                scheme = GovernmentScheme(**scheme_data)
                db.add(scheme)
        
        db.commit()
        print(f"✅ Added {len(schemes)} government schemes!")
        
    except Exception as e:
        print(f"❌ Error populating government schemes: {e}")
        db.rollback()
    finally:
        db.close()

def populate_learning_content():
    """Populate learning content data."""
    print("Populating learning content...")
    
    db = SessionLocal()
    try:
        content_items = [
            {
                "title": "Basics of Saving Money",
                "content": "Learn the fundamentals of saving money and building an emergency fund. Start with the 50-30-20 rule: 50% needs, 30% wants, 20% savings.",
                "content_type": "article",

                
                "language": "en"
             },
            {
                "title": "Understanding Mutual Funds",
                "content": "Mutual funds pool money from many investors to buy securities. Learn about SIP, NAV, and different types of mutual funds.",
                "content_type": "video",

                
                "language": "en"
            },
            {
                "title": "बचत की मूल बातें",
                "content": "पैसे बचाने और आपातकालीन फंड बनाने की बुनियादी बातें सीखें। 50-30-20 नियम से शुरुआत करें: 50% जरूरतें, 30% इच्छाएं, 20% बचत।",
                "content_type": "article",
                "language": "hi"
            },
            {
                "title": "Tax Saving Strategies",
                "content": "Learn about Section 80C, ELSS, PPF, and other tax-saving instruments. Maximize your tax savings while building wealth.",
                "content_type": "article",
                "language": "en"
            },
            {
                "title": "Wedding Financial Planning",
                "content": "Plan your wedding finances effectively. Learn about wedding loans, savings strategies, and budget allocation for different ceremonies.",
                "content_type": "guide",
                "language": "en"
            }
        ]
        
        for content_data in content_items:
            # Check if content already exists
            existing = db.query(LearningContent).filter(
                LearningContent.title == content_data["title"]
            ).first()
            
            if not existing:
                content = LearningContent(**content_data)
                db.add(content)
        
        db.commit()
        print(f"✅ Added {len(content_items)} learning content items!")
        
    except Exception as e:
        print(f"❌ Error populating learning content: {e}")
        db.rollback()
    finally:
        db.close()

def populate_community_circles():
    """Populate community circles data."""
    print("Populating community circles...")
    
    db = SessionLocal()
    try:
        circles = [
            {
                "name": "Beginner Savers",
                "description": "A community for people just starting their savings journey. Share tips, ask questions, and motivate each other.",
                "category": "savings",
                
                "member_count": 0
            },
            {
                "name": "Investment Enthusiasts",
                "description": "Discuss investment strategies, market trends, and share portfolio insights with fellow investors.",
                "category": "investment",
                
                "member_count": 0
            },
            {
                "name": "Wedding Planners",
                "description": "Planning a wedding? Join this circle to share budgeting tips, vendor recommendations, and cost-saving strategies.",
                "category": "goals",
                
                "member_count": 0
            },
            {
                "name": "Government Scheme Experts",
                "description": "Learn about and discuss various government schemes, eligibility criteria, and application processes.",
                "category": "schemes",
                
                "member_count": 0
            },
            {
                "name": "Tax Savers Club",
                "description": "Share tax-saving strategies, discuss new tax rules, and help each other maximize tax benefits.",
                "category": "tax",
                
                "member_count": 0
            }
        ]
        
        for circle_data in circles:
            # Check if circle already exists
            existing = db.query(CommunityCircle).filter(
                CommunityCircle.name == circle_data["name"]
            ).first()
            
            if not existing:
                circle = CommunityCircle(**circle_data)
                db.add(circle)
        
        db.commit()
        print(f"✅ Added {len(circles)} community circles!")
        
    except Exception as e:
        print(f"❌ Error populating community circles: {e}")
        db.rollback()
    finally:
        db.close()

def populate_local_agents():
    """Populate local agents data."""
    print("Populating local agents...")
    
    db = SessionLocal()
    try:
        agents = [
            {
                "name": "Rajesh Kumar",
                "phone": "+91-9876543210",
                "email": "rajesh.kumar@fintwin.com",
                "state": "Delhi",

                "specializations": json.dumps(["Government Schemes", "Tax Planning"]),
                 "languages_spoken": json.dumps(["Hindi", "English"]),
                "rating": 4.5,
                "is_verified": True,
                "is_active": True
            },
            {
                "name": "Priya Sharma",
                "phone": "+91-9876543211",
                "email": "priya.sharma@fintwin.com",
                "state": "Maharashtra",

                "specializations": json.dumps(["Investment Planning", "Mutual Funds"]),
                 "languages_spoken": json.dumps(["Hindi", "English", "Marathi"]),
                "rating": 4.7,
                "is_verified": True,
                "is_active": True
            },
            {
                "name": "Suresh Reddy",
                "phone": "+91-9876543212",
                "email": "suresh.reddy@fintwin.com",
                "state": "Telangana",

                "specializations": json.dumps(["Business Loans", "MUDRA Schemes"]),
                 "languages_spoken": json.dumps(["Telugu", "English", "Hindi"]),
                "rating": 4.3,
                "is_verified": True,
                "is_active": True
            },
            {
                "name": "Lakshmi Iyer",
                "phone": "+91-9876543213",
                "email": "lakshmi.iyer@fintwin.com",
                "state": "Tamil Nadu",

                "specializations": json.dumps(["Women Schemes", "Education Loans"]),
                 "languages_spoken": json.dumps(["Tamil", "English"]),
                "rating": 4.6,
                "is_verified": True,
                "is_active": True
            },
            {
                "name": "Amit Patel",
                "phone": "+91-9876543214",
                "email": "amit.patel@fintwin.com",
                "state": "Gujarat",

                "specializations": json.dumps(["Small Business", "Agricultural Loans"]),
                 "languages_spoken": json.dumps(["Gujarati", "Hindi", "English"]),
                "rating": 4.4,
                "is_verified": True,
                "is_active": True
            }
        ]
        
        for agent_data in agents:
            # Check if agent already exists
            existing = db.query(LocalAgent).filter(
                LocalAgent.email == agent_data["email"]
            ).first()
            
            if not existing:
                agent = LocalAgent(**agent_data)
                db.add(agent)
        
        db.commit()
        print(f"✅ Added {len(agents)} local agents!")
        
    except Exception as e:
        print(f"❌ Error populating local agents: {e}")
        db.rollback()
    finally:
        db.close()

def populate_cultural_nudges():
    """Populate cultural nudges data."""
    print("Populating cultural nudges...")
    
    db = SessionLocal()
    try:
        nudges = [
            {
                "title": "Diwali Savings Reminder",
                "message": "Diwali is approaching! Start saving ₹500 weekly to have ₹5000 for celebrations and gifts.",
                "nudge_type": "festival"
            },
            {
                "title": "Eid Preparation",
                "message": "Eid Mubarak! Plan your Eid expenses wisely. Consider setting aside money for charity (Zakat) and celebrations.",
                "nudge_type": "festival"
            },
            {
                "title": "Wedding Season Planning",
                "message": "Wedding season is here! If you're planning a wedding, start saving early. Consider wedding loans with low interest rates.",
                "nudge_type": "seasonal"
            },
            {
                "title": "Monsoon Emergency Fund",
                "message": "Monsoon season can bring unexpected expenses. Ensure you have an emergency fund covering 3-6 months of expenses.",
                "nudge_type": "seasonal"
            },
            {
                "title": "Tax Saving Deadline",
                "message": "March 31st is approaching! Don't miss out on tax-saving opportunities. Invest in ELSS, PPF, or NSC to save taxes.",
                "nudge_type": "deadline"
            }
        ]
        
        for nudge_data in nudges:
            # Check if nudge already exists
            existing = db.query(CulturalNudge).filter(
                CulturalNudge.title == nudge_data["title"]
            ).first()
            
            if not existing:
                nudge = CulturalNudge(**nudge_data)
                db.add(nudge)
        
        db.commit()
        print(f"✅ Added {len(nudges)} cultural nudges!")
        
    except Exception as e:
        print(f"❌ Error populating cultural nudges: {e}")
        db.rollback()
    finally:
        db.close()

def populate_investment_filters():
    """Populate investment filters data."""
    print("Populating investment filters...")
    
    db = SessionLocal()
    try:
        filters = [
            {
                "name": "Halal Investments",
                "description": "Sharia-compliant investment options excluding interest-based and prohibited sectors",
                "filter_type": "religious",
                "criteria": json.dumps({
                    "excluded_sectors": ["Banking", "Alcohol", "Tobacco", "Gambling", "Adult Entertainment"],
                    "investment_types": ["Equity", "Gold", "Real Estate", "Sukuk"],
                    "principles": ["No Interest", "No Speculation", "Asset-backed"]
                }),
                "applicable_religions": json.dumps(["Islam"])
            },
            {
                "name": "Jain Investment Principles",
                "description": "Investment options aligned with Jain principles of non-violence and ethical business",
                "filter_type": "religious",
                "criteria": json.dumps({
                    "excluded_sectors": ["Leather", "Alcohol", "Tobacco", "Weapons", "Animal Products"],
                    "preferred_sectors": ["Technology", "Healthcare", "Education", "Renewable Energy"],
                    "principles": ["Ahimsa", "Ethical Business", "Sustainable Growth"]
                }),
                "applicable_religions": json.dumps(["Jainism"])
            },
            {
                "name": "Vegetarian Lifestyle Investments",
                "description": "Investment options for those following vegetarian lifestyle principles",
                "filter_type": "lifestyle",
                "criteria": json.dumps({
                    "excluded_sectors": ["Meat Processing", "Leather", "Animal Testing"],
                    "preferred_sectors": ["Plant-based Foods", "Organic Farming", "Sustainable Agriculture"],
                    "principles": ["Cruelty-free", "Plant-based", "Sustainable"]
                }),
                "applicable_religions": json.dumps(["Hindu", "Jain", "Buddhist"])
            },
            {
                "name": "Traditional Hindu Values",
                "description": "Investment approach based on traditional Hindu values and dharmic principles",
                "filter_type": "religious",
                "criteria": json.dumps({
                    "preferred_investments": ["Gold", "Real Estate", "Education", "Healthcare"],
                    "auspicious_timing": ["Akshaya Tritiya", "Dhanteras", "Gudi Padwa"],
                    "principles": ["Dharma", "Long-term wealth", "Family security"]
                }),
                "applicable_religions": json.dumps(["Hindu"])
            },
            {
                "name": "Sikh Community Values",
                "description": "Investment options aligned with Sikh principles of honest earning and community welfare",
                "filter_type": "religious",
                "criteria": json.dumps({
                    "excluded_sectors": ["Tobacco", "Alcohol", "Gambling"],
                    "preferred_sectors": ["Agriculture", "Education", "Healthcare", "Community Development"],
                    "principles": ["Honest earning", "Community welfare", "Hard work"]
                }),
                "applicable_religions": json.dumps(["Sikhism"])
            }
        ]
        
        for filter_data in filters:
            # Check if filter already exists
            existing = db.query(InvestmentFilter).filter(
                InvestmentFilter.name == filter_data["name"]
            ).first()
            
            if not existing:
                investment_filter = InvestmentFilter(**filter_data)
                db.add(investment_filter)
        
        db.commit()
        print(f"✅ Added {len(filters)} investment filters!")
        
    except Exception as e:
        print(f"❌ Error populating investment filters: {e}")
        db.rollback()
    finally:
        db.close()

def create_admin_user():
    """Create an admin user for testing."""
    print("Creating admin user...")
    
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@fintwin.com").first()
        
        if not existing_admin:
            admin_user = User(
                email="admin@fintwin.com",
                full_name="FinTwin Admin",
                hashed_password=get_password_hash("admin123"),
                phone="+91-9999999999",
                state="Delhi",
                preferred_language="en",
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            db.commit()
            
            # Create financial profile for admin
            financial_profile = FinancialProfile(
                user_id=admin_user.id,
                monthly_income=100000.0,
                monthly_expenses=60000.0,
                savings_goal=500000.0,
                risk_tolerance="moderate",
                investment_preferences=json.dumps(["mutual_funds", "stocks"]),
                financial_goals=json.dumps(["retirement", "wealth_building"]),
                occupation="admin",
                family_size=3,
                dependents=2
            )
            db.add(financial_profile)
            db.commit()
            
            print("✅ Admin user created successfully!")
            print("   Email: admin@fintwin.com")
            print("   Password: admin123")
        else:
            print("ℹ️  Admin user already exists")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main function to initialize the database."""
    print("🚀 Initializing FinTwin+ Database...")
    print("=" * 50)
    
    try:
        # Create tables
        create_tables()
        
        # Populate initial data
        populate_government_schemes()
        populate_learning_content()
        populate_community_circles()
        populate_local_agents()
        populate_cultural_nudges()
        populate_investment_filters()
        
        # Create admin user
        create_admin_user()
        
        print("=" * 50)
        print("🎉 Database initialization completed successfully!")
        print("")
        print("Next steps:")
        print("1. Start the backend server: python main.py")
        print("2. Access the API documentation at: http://localhost:8000/docs")
        print("3. Login with admin credentials to test the system")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())