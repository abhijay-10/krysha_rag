from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, nullable=True)
    hashed_password = Column(String)

    sessions = relationship("ChatSession", back_populates="user")
    daily_logs = relationship("DailyLog", back_populates="user")
    reflections = relationship("Reflection", back_populates="user")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String) # 'user' or 'assistant'
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, index=True) # Format: YYYY-MM-DD
    distraction_score = Column(Integer) # 1-10
    main_distraction = Column(String, nullable=True)
    peace_mood_level = Column(Integer, default=5)

    user = relationship("User", back_populates="daily_logs")
    habits = relationship("HabitRecord", back_populates="daily_log", cascade="all, delete-orphan")

class HabitRecord(Base):
    __tablename__ = "habit_records"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("daily_logs.id"))
    habit_type = Column(String) # "Prayer", "Meditation", "Mantra"
    duration_minutes = Column(Integer, default=0)
    count = Column(Integer, default=0)
    completed = Column(Boolean, default=False)

    daily_log = relationship("DailyLog", back_populates="habits")

class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, index=True) # Format: YYYY-MM-DD
    morning_goal = Column(Text, nullable=True)
    night_reflection = Column(Text, nullable=True)

    user = relationship("User", back_populates="reflections")

