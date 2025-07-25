from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv
import asyncio
from functools import lru_cache

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fintwin_plus.db")

# Optimized SQLAlchemy engine for SQLite
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,
            "timeout": 20,
            "isolation_level": None
        },
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
else:
    # For PostgreSQL or other databases
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )

# Create SessionLocal class with optimizations
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    expire_on_commit=False
)

# Create Base class
Base = declarative_base()

# Cache for frequently accessed data
@lru_cache(maxsize=128)
def get_cached_data(key: str):
    """Simple in-memory cache for frequently accessed data"""
    return None

# Optimized dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async database session for heavy operations
async def get_async_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()