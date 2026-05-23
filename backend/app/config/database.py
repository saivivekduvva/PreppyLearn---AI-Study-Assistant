import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.settings import get_settings

settings = get_settings()

# Use DATABASE_URL if provided, else fallback to SQLite
db_url = settings.DATABASE_URL or "sqlite:///./preppylearn.db"

# Fix Render Postgres URLs (postgres:// to postgresql://)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Check if we are using SQLite to set connect_args
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

# Create the SQLAlchemy Engine
engine = create_engine(
    db_url, 
    connect_args=connect_args
)

# Create a SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    """Dependency for FastAPI to get a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
