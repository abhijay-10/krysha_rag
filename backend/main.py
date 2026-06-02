

# import time
# import os
# import glob
# import re
# from fastapi import FastAPI, HTTPException, Depends, status
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.security import OAuth2PasswordRequestForm
# from pydantic import BaseModel, EmailStr
# from sqlalchemy.orm import Session
# from typing import List, Dict, Any, Optional
# import uvicorn

# import models, database, auth
# from rag import ask_bot

# # Initialize Database
# models.Base.metadata.create_all(bind=database.engine)

# # Auto SQLite Migration for peace_mood_level and username
# from sqlalchemy import text
# try:
#     with database.engine.begin() as conn:
#         conn.execute(text("ALTER TABLE daily_logs ADD COLUMN peace_mood_level INTEGER DEFAULT 5"))
# except Exception:
#     pass

# try:
#     with database.engine.begin() as conn:
#         conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR"))
# except Exception:
#     pass

# app = FastAPI(title="Mahabharata Bot API")


# # Enable CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class Query(BaseModel):
#     query: str
#     mode: str = "neutral"
#     history: Optional[List[Dict[str, Any]]] = None
#     session_id: Optional[str] = None
#     voice_sanctuary: Optional[bool] = False


# class UserCreate(BaseModel):
#     username: str
#     email: EmailStr
#     password: str

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# @app.get("/")
# def home():
#     return {
#         "status": "Running",
#         "database": "Qdrant Cloud",
#         "chunks_indexed": 37386,
#         "model": "BGE-M3 + Mistral"
#     }

# @app.post("/signup", response_model=Token)
# def signup(user: UserCreate, db: Session = Depends(database.get_db)):
#     db_user = db.query(models.User).filter(models.User.email == user.email).first()
#     if db_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
    
#     hashed_password = auth.get_password_hash(user.password)
#     new_user = models.User(email=user.email, username=user.username, hashed_password=hashed_password)
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
    
#     access_token = auth.create_access_token(data={"sub": new_user.email})
#     return {"access_token": access_token, "token_type": "bearer"}

# @app.post("/login", response_model=Token)
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
#     user = db.query(models.User).filter(models.User.email == form_data.username).first()
#     if not user or not auth.verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
    
#     access_token = auth.create_access_token(data={"sub": user.email})
#     return {"access_token": access_token, "token_type": "bearer"}

# @app.get("/me")
# def get_me(current_user: models.User = Depends(auth.get_current_user)):
#     return {"email": current_user.email, "username": current_user.username}

# @app.get("/sessions")
# def get_sessions(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
#     sessions = db.query(models.ChatSession).filter(models.ChatSession.user_id == current_user.id).order_by(models.ChatSession.created_at.desc()).all()
#     return [{
#         "id": s.id,
#         "title": s.title,
#         "created_at": s.created_at,
#         "history": [{
#             "role": m.role,
#             "content": m.content,
#             "timestamp": m.timestamp
#         } for m in s.messages]
#     } for s in sessions]

# @app.delete("/sessions/{session_id}")
# def delete_session(session_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
#     session = db.query(models.ChatSession).filter(
#         models.ChatSession.id == session_id,
#         models.ChatSession.user_id == current_user.id
#     ).first()
    
#     if not session:
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     db.delete(session)
#     db.commit()
#     return {"message": "Session deleted successfully"}

# @app.post("/ask")
# def ask(q: Query, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
#     try:
#         start_time = time.time()
        
#         # Fetch history from DB if session_id is provided
#         history_to_use = q.history
#         if q.session_id:
#             session = db.query(models.ChatSession).filter(
#                 models.ChatSession.id == q.session_id,
#                 models.ChatSession.user_id == current_user.id
#             ).first()
#             if session:
#                 past_messages = db.query(models.ChatMessage).filter(
#                     models.ChatMessage.session_id == q.session_id
#                 ).order_by(models.ChatMessage.timestamp.asc()).all()
#                 if past_messages:
#                     history_to_use = [{"role": m.role, "content": m.content} for m in past_messages]
                    
#         # Fetch Memory Context for personalization
#         memory_context = ""
#         try:
#             # 1. Fetch latest reflections
#             reflections = db.query(models.Reflection).filter(
#                 models.Reflection.user_id == current_user.id
#             ).order_by(models.Reflection.date.desc()).limit(3).all()
            
#             ref_texts = []
#             for r in reflections:
#                 goals = []
#                 if r.morning_goal: goals.append(f"Morning Goal: {r.morning_goal}")
#                 if r.night_reflection: goals.append(f"Night Reflection: {r.night_reflection}")
#                 if goals:
#                     ref_texts.append(f"Date {r.date}: " + " | ".join(goals))
            
#             # 2. Fetch latest logs for distraction
#             logs = db.query(models.DailyLog).filter(
#                 models.DailyLog.user_id == current_user.id
#             ).order_by(models.DailyLog.date.desc()).limit(3).all()
            
#             log_texts = []
#             for l in logs:
#                 habs = []
#                 for h in l.habits:
#                     if h.completed or h.duration_minutes > 0 or h.count > 0:
#                         status = "completed" if h.completed else f"{h.duration_minutes}m" if h.duration_minutes > 0 else f"{h.count} counts"
#                         habs.append(f"{h.habit_type} ({status})")
                
#                 habs_str = ", ".join(habs) if habs else "No habits logged"
#                 log_texts.append(f"Date {l.date}: Distraction={l.distraction_score}/10 due to {l.main_distraction or 'None'} | Habits={habs_str}")
            
#             # 3. Calculate streak
#             completed_dates = set()
#             all_logs = db.query(models.DailyLog).filter(models.DailyLog.user_id == current_user.id).all()
#             for l in all_logs:
#                 for h in l.habits:
#                     if h.completed or h.duration_minutes > 0 or h.count > 0:
#                         completed_dates.add(l.date)
#                         break
            
#             streak = len(completed_dates)
            
#             memory_lines = []
#             memory_lines.append(f"User: {current_user.email}")
#             memory_lines.append(f"Total spiritual days active: {streak}")
#             if ref_texts:
#                 memory_lines.append("Recent Reflections:\n" + "\n".join(ref_texts))
#             if log_texts:
#                 memory_lines.append("Recent Habits & Distractions:\n" + "\n".join(log_texts))
                
#             memory_context = "\n".join(memory_lines)
#         except Exception as e:
#             print(f"Failed to fetch memory context: {e}")

#         answer = ask_bot(q.query, q.mode, history_to_use, memory_context=memory_context, voice_sanctuary=q.voice_sanctuary)
#         duration = round(time.time() - start_time, 2)

#         # Persistence Logic
#         if q.session_id:
#             # Get or create session
#             session = db.query(models.ChatSession).filter(models.ChatSession.id == q.session_id).first()
#             if not session:
#                 title = q.query[:30] + ("..." if len(q.query) > 30 else "")
#                 session = models.ChatSession(id=q.session_id, title=title, user_id=current_user.id)
#                 db.add(session)
#                 db.commit()
            
#             # Save User Message
#             user_msg = models.ChatMessage(session_id=q.session_id, role="user", content=q.query)
#             db.add(user_msg)
            
#             # Save Assistant Message
#             assistant_msg = models.ChatMessage(session_id=q.session_id, role="assistant", content=answer)
#             db.add(assistant_msg)
            
#             db.commit()

#         return {
#             "answer": answer,
#             "response_time": f"{duration}s",
#             "status": "success"
#         }
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


# @app.get("/knowledge/list")
# def list_knowledge(current_user: models.User = Depends(auth.get_current_user)):
#     try:
#         knowledge_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "knowledge")
#         files = glob.glob(os.path.join(knowledge_path, "*.txt"))
        
#         result = []
#         for file_path in files:
#             with open(file_path, "r", encoding="utf-8") as f:
#                 content = f.read()
#                 # Simple parser for the text files
#                 title_match = re.search(r"Title:\s*(.*)", content)
#                 if not title_match:
#                     continue
                    
#                 summary_match = re.search(r"Summary:\s*(.*)", content)
#                 link_match = re.search(r"Link:\s*(.*)", content)
                
#                 result.append({
#                     "id": os.path.basename(file_path),
#                     "title": title_match.group(1) if title_match else os.path.basename(file_path),
#                     "summary": summary_match.group(1) if summary_match else "No summary available.",
#                     "link": link_match.group(1) if link_match else "#"
#                 })
#         return result
#     except Exception as e:
#         print(f"Error listing knowledge: {e}")
#         return []

# # --- SPIRITUAL JOURNEY TRACKER & DISCIPLINE SYSTEM ENDPOINTS ---

# class HabitInput(BaseModel):
#     habit_type: str
#     duration_minutes: Optional[int] = 0
#     count: Optional[int] = 0
#     completed: Optional[bool] = False

# class TrackerLogInput(BaseModel):
#     date: str # YYYY-MM-DD
#     distraction_score: Optional[int] = None
#     main_distraction: Optional[str] = None
#     peace_mood_level: Optional[int] = 5
#     habits: Optional[List[HabitInput]] = []
#     morning_goal: Optional[str] = None
#     night_reflection: Optional[str] = None

# @app.post("/tracker/log")
# def log_tracker(
#     data: TrackerLogInput,
#     current_user: models.User = Depends(auth.get_current_user),
#     db: Session = Depends(database.get_db)
# ):
#     try:
#         # 1. Fetch or create DailyLog
#         log = db.query(models.DailyLog).filter(
#             models.DailyLog.user_id == current_user.id,
#             models.DailyLog.date == data.date
#         ).first()

#         if not log:
#             log = models.DailyLog(
#                 user_id=current_user.id,
#                 date=data.date,
#                 distraction_score=data.distraction_score if data.distraction_score is not None else 0,
#                 main_distraction=data.main_distraction,
#                 peace_mood_level=data.peace_mood_level if data.peace_mood_level is not None else 5
#             )
#             db.add(log)
#             db.flush() # Populate log.id
#         else:
#             if data.distraction_score is not None:
#                 log.distraction_score = data.distraction_score
#             if data.main_distraction is not None:
#                 log.main_distraction = data.main_distraction
#             if data.peace_mood_level is not None:
#                 log.peace_mood_level = data.peace_mood_level

#         # 2. Update/create Habits
#         if data.habits:
#             for h_in in data.habits:
#                 habit = db.query(models.HabitRecord).filter(
#                     models.HabitRecord.log_id == log.id,
#                     models.HabitRecord.habit_type == h_in.habit_type
#                 ).first()

#                 if not habit:
#                     habit = models.HabitRecord(
#                         log_id=log.id,
#                         habit_type=h_in.habit_type,
#                         duration_minutes=h_in.duration_minutes if h_in.duration_minutes is not None else 0,
#                         count=h_in.count if h_in.count is not None else 0,
#                         completed=h_in.completed if h_in.completed is not None else False
#                     )
#                     db.add(habit)
#                 else:
#                     if h_in.duration_minutes is not None:
#                         habit.duration_minutes = h_in.duration_minutes
#                     if h_in.count is not None:
#                         habit.count = h_in.count
#                     if h_in.completed is not None:
#                         habit.completed = h_in.completed

#         # 3. Fetch or create Reflection
#         if data.morning_goal is not None or data.night_reflection is not None:
#             reflection = db.query(models.Reflection).filter(
#                 models.Reflection.user_id == current_user.id,
#                 models.Reflection.date == data.date
#             ).first()

#             if not reflection:
#                 reflection = models.Reflection(
#                     user_id=current_user.id,
#                     date=data.date,
#                     morning_goal=data.morning_goal,
#                     night_reflection=data.night_reflection
#                 )
#                 db.add(reflection)
#             else:
#                 if data.morning_goal is not None:
#                     reflection.morning_goal = data.morning_goal
#                 if data.night_reflection is not None:
#                     reflection.night_reflection = data.night_reflection

#         db.commit()
#         return {"status": "success", "message": "Tracker updated successfully."}
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/tracker/today")
# def get_tracker_today(
#     date: str,
#     current_user: models.User = Depends(auth.get_current_user),
#     db: Session = Depends(database.get_db)
# ):
#     # Fetch log
#     log = db.query(models.DailyLog).filter(
#         models.DailyLog.user_id == current_user.id,
#         models.DailyLog.date == date
#     ).first()

#     habits_list = []
#     if log:
#         habits_list = [{
#             "habit_type": h.habit_type,
#             "duration_minutes": h.duration_minutes,
#             "count": h.count,
#             "completed": h.completed
#         } for h in log.habits]

#     # Fetch reflection
#     reflection = db.query(models.Reflection).filter(
#         models.Reflection.user_id == current_user.id,
#         models.Reflection.date == date
#     ).first()

#     return {
#         "date": date,
#         "distraction_score": log.distraction_score if log else 0,
#         "main_distraction": log.main_distraction if log else "",
#         "peace_mood_level": log.peace_mood_level if log else 5,
#         "habits": habits_list,
#         "morning_goal": reflection.morning_goal if reflection else "",
#         "night_reflection": reflection.night_reflection if reflection else ""
#     }

# @app.get("/tracker/stats")
# def get_tracker_stats(
#     current_user: models.User = Depends(auth.get_current_user),
#     db: Session = Depends(database.get_db)
# ):
#     from datetime import datetime, timedelta
    
#     # Fetch all daily logs with at least one completed habit
#     logs = db.query(models.DailyLog).filter(
#         models.DailyLog.user_id == current_user.id
#     ).all()
    
#     completed_dates = set()
#     for log in logs:
#         for habit in log.habits:
#             if habit.completed or habit.duration_minutes > 0 or habit.count > 0:
#                 completed_dates.add(log.date)
#                 break
                
#     if not completed_dates:
#         return {
#             "current_streak": 0,
#             "max_streak": 0,
#             "total_days_completed": 0
#         }
        
#     # Parse dates
#     parsed_dates = []
#     for d_str in completed_dates:
#         try:
#             parsed_dates.append(datetime.strptime(d_str, "%Y-%m-%d").date())
#         except ValueError:
#             pass
            
#     parsed_dates.sort(reverse=True)
    
#     # Calculate current streak
#     today = datetime.now().date()
#     yesterday = today - timedelta(days=1)
    
#     current_streak = 0
#     if today in parsed_dates:
#         current_streak = 1
#         check_date = today - timedelta(days=1)
#         while check_date in parsed_dates:
#             current_streak += 1
#             check_date -= timedelta(days=1)
#     elif yesterday in parsed_dates:
#         current_streak = 1
#         check_date = yesterday - timedelta(days=1)
#         while check_date in parsed_dates:
#             current_streak += 1
#             check_date -= timedelta(days=1)
            
#     # Calculate max streak
#     sorted_dates = sorted(list(parsed_dates))
#     max_streak = 0
#     if sorted_dates:
#         temp_streak = 1
#         max_streak = 1
#         for i in range(1, len(sorted_dates)):
#             if sorted_dates[i] - sorted_dates[i-1] == timedelta(days=1):
#                 temp_streak += 1
#             elif sorted_dates[i] - sorted_dates[i-1] > timedelta(days=1):
#                 temp_streak = 1
#             max_streak = max(max_streak, temp_streak)
            
#     return {
#         "current_streak": current_streak,
#         "max_streak": max_streak,
#         "total_days_completed": len(completed_dates)
#     }

# @app.get("/tracker/insights")
# def get_tracker_insights(
#     date: str,
#     current_user: models.User = Depends(auth.get_current_user),
#     db: Session = Depends(database.get_db)
# ):
#     from datetime import datetime, timedelta
#     from prompt_router import get_tracker_guidance_prompt
#     import ollama

#     # Fetch today's log
#     log = db.query(models.DailyLog).filter(
#         models.DailyLog.user_id == current_user.id,
#         models.DailyLog.date == date
#     ).first()

#     # Check if a habit was completed today
#     today_completed = False
#     if log:
#         for h in log.habits:
#             if h.completed or h.duration_minutes > 0 or h.count > 0:
#                 today_completed = True
#                 break
                
#     streak_broken = False
#     if today_completed:
#         try:
#             # Check if they completed a habit yesterday
#             yesterday_str = (datetime.strptime(date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
#             yesterday_log = db.query(models.DailyLog).filter(
#                 models.DailyLog.user_id == current_user.id,
#                 models.DailyLog.date == yesterday_str
#             ).first()
            
#             yesterday_completed = False
#             if yesterday_log:
#                 for h in yesterday_log.habits:
#                     if h.completed or h.duration_minutes > 0 or h.count > 0:
#                         yesterday_completed = True
#                         break
                        
#             # If yesterday was empty, check if there's any completed log in the past
#             if not yesterday_completed:
#                 past_completed = False
#                 all_past_logs = db.query(models.DailyLog).filter(
#                     models.DailyLog.user_id == current_user.id,
#                     models.DailyLog.date < yesterday_str
#                 ).all()
#                 for p_log in all_past_logs:
#                     for h in p_log.habits:
#                         if h.completed or h.duration_minutes > 0 or h.count > 0:
#                             past_completed = True
#                             break
#                     if past_completed:
#                         break
#                 if past_completed:
#                     streak_broken = True
#         except Exception:
#             pass

#     distraction_score = log.distraction_score if log else None
#     main_distraction = log.main_distraction if log else None

#     # Retrieve specialized guidance prompt
#     sys_prompt = get_tracker_guidance_prompt(
#         distraction_score=distraction_score,
#         main_distraction=main_distraction,
#         streak_broken=streak_broken
#     )

#     # Format user statistics for context
#     habits_summary = []
#     if log:
#         for h in log.habits:
#             status = "completed" if h.completed else f"{h.duration_minutes} mins" if h.duration_minutes > 0 else f"{h.count} counts" if h.count > 0 else "not completed"
#             habits_summary.append(f"- {h.habit_type}: {status}")
            
#     reflection = db.query(models.Reflection).filter(
#         models.Reflection.user_id == current_user.id,
#         models.Reflection.date == date
#     ).first()
    
#     reflection_context = ""
#     if reflection:
#         if reflection.morning_goal:
#             reflection_context += f"Morning Goal: {reflection.morning_goal}\n"
#         if reflection.night_reflection:
#             reflection_context += f"Night Reflection: {reflection.night_reflection}\n"
            
#     user_content = f"Today's Date: {date}\n"
#     if habits_summary:
#         user_content += "Habits Logged:\n" + "\n".join(habits_summary) + "\n"
#     if reflection_context:
#         user_content += f"Reflections:\n{reflection_context}"
#     if distraction_score is not None:
#         user_content += f"Distraction Level: {distraction_score}/10 due to {main_distraction or 'general distractions'}\n"

#     try:
# #         response = ollama.chat(
# #             model="mistral:latest",
# #             messages=[
# #                 {"role": "system", "content": sys_prompt},
# #                 {"role": "user", "content": user_content}
# #             ],
# #             options={
# #                 "temperature": 0.2,
# #                 "num_ctx": 2048,
# #                 "num_predict": 250,
# #                 "num_thread": 8
# #             }
# #         )
# #         insight = response["message"]["content"].strip()

#         from groq import Groq
#         client = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         response = client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=[
#                 {"role": "system", "content": sys_prompt},
#                 {"role": "user", "content": user_content}
#             ],
#             max_tokens=250,
#             temperature=0.2
#         )
#         insight = response.choices[0].message.content.strip()
        
# #         from huggingface_hub import InferenceClient
# #         client = InferenceClient(token=os.getenv("HUGGINGFACEHUB_API_TOKEN"))
# #         response = client.chat_completion(
# #             model="mistralai/Mistral-7B-Instruct-v0.3",
# #             messages=[
# #                 {"role": "system", "content": sys_prompt},
# #                 {"role": "user", "content": user_content}
# #             ],
# #             max_tokens=250,
# #             temperature=0.2
# #         )
# #         insight = response.choices[0].message.content.strip()
#     except Exception as e:
#         insight = f"May peace guide you. Even if we encounter moments of silence, focus on the presence of divine calmness today. (Error: {e})"

#     return {
#         "streak_broken": streak_broken,
#         "insight": insight
#     }

# if __name__ == "__main__":
#     uvicorn.run(app, host="127.0.0.1", port=8000)




import time
import os
import glob
import re
from contextlib import asynccontextmanager  # Added this import for the lifespan wrapper
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import uvicorn

import models, database, auth
from rag import ask_bot


# --- ONLY EDITED THIS SECTION TO PREVENT RENDER TIMEOUT ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Database
    models.Base.metadata.create_all(bind=database.engine)

    # Auto SQLite Migration for peace_mood_level and username
    from sqlalchemy import text
    try:
        with database.engine.begin() as conn:
            conn.execute(text("ALTER TABLE daily_logs ADD COLUMN peace_mood_level INTEGER DEFAULT 5"))
    except Exception:
        pass

    try:
        with database.engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR"))
    except Exception:
        pass
    yield

# Passed the lifespan into your app definition here
app = FastAPI(title="Mahabharata Bot API", lifespan=lifespan)
# ---------------------------------------------------------


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for Render deployment, or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    query: str
    mode: str = "neutral"
    history: Optional[List[Dict[str, Any]]] = None
    session_id: Optional[str] = None
    voice_sanctuary: Optional[bool] = False


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@app.get("/")
def home():
    return {
        "status": "Running",
        "database": "Qdrant Cloud",
        "chunks_indexed": 37386,
        "model": "BGE-M3 + Mistral"
    }

@app.post("/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"email": current_user.email, "username": current_user.username}

@app.get("/sessions")
def get_sessions(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    sessions = db.query(models.ChatSession).filter(models.ChatSession.user_id == current_user.id).order_by(models.ChatSession.created_at.desc()).all()
    return [{
        "id": s.id,
        "title": s.title,
        "created_at": s.created_at,
        "history": [{
            "role": m.role,
            "content": m.content,
            "timestamp": m.timestamp
        } for m in s.messages]
    } for s in sessions]

@app.delete("/sessions/{session_id}")
def delete_session(session_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}

@app.post("/ask")
def ask(q: Query, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    try:
        start_time = time.time()
        
        # Fetch history from DB if session_id is provided
        history_to_use = q.history
        if q.session_id:
            session = db.query(models.ChatSession).filter(
                models.ChatSession.id == q.session_id,
                models.ChatSession.user_id == current_user.id
            ).first()
            if session:
                past_messages = db.query(models.ChatMessage).filter(
                    models.ChatMessage.session_id == q.session_id
                ).order_by(models.ChatMessage.timestamp.asc()).all()
                if past_messages:
                    history_to_use = [{"role": m.role, "content": m.content} for m in past_messages]
                    
        # Fetch Memory Context for personalization
        memory_context = ""
        try:
            # 1. Fetch latest reflections
            reflections = db.query(models.Reflection).filter(
                models.Reflection.user_id == current_user.id
            ).order_by(models.Reflection.date.desc()).limit(3).all()
            
            ref_texts = []
            for r in reflections:
                goals = []
                if r.morning_goal: goals.append(f"Morning Goal: {r.morning_goal}")
                if r.night_reflection: goals.append(f"Night Reflection: {r.night_reflection}")
                if goals:
                    ref_texts.append(f"Date {r.date}: " + " | ".join(goals))
            
            # 2. Fetch latest logs for distraction
            logs = db.query(models.DailyLog).filter(
                models.DailyLog.user_id == current_user.id
            ).order_by(models.DailyLog.date.desc()).limit(3).all()
            
            log_texts = []
            for l in logs:
                habs = []
                for h in l.habits:
                    if h.completed or h.duration_minutes > 0 or h.count > 0:
                        status = "completed" if h.completed else f"{h.duration_minutes}m" if h.duration_minutes > 0 else f"{h.count} counts"
                        habs.append(f"{h.habit_type} ({status})")
                
                habs_str = ", ".join(habs) if habs else "No habits logged"
                log_texts.append(f"Date {l.date}: Distraction={l.distraction_score}/10 due to {l.main_distraction or 'None'} | Habits={habs_str}")
            
            # 3. Calculate streak
            completed_dates = set()
            all_logs = db.query(models.DailyLog).filter(models.DailyLog.user_id == current_user.id).all()
            for l in all_logs:
                for h in l.habits:
                    if h.completed or h.duration_minutes > 0 or h.count > 0:
                        completed_dates.add(l.date)
                        break
            
            streak = len(completed_dates)
            
            memory_lines = []
            memory_lines.append(f"User: {current_user.email}")
            memory_lines.append(f"Total spiritual days active: {streak}")
            if ref_texts:
                memory_lines.append("Recent Reflections:\n" + "\n".join(ref_texts))
            if log_texts:
                memory_lines.append("Recent Habits & Distractions:\n" + "\n".join(log_texts))
                
            memory_context = "\n".join(memory_lines)
        except Exception as e:
            print(f"Failed to fetch memory context: {e}")

        answer = ask_bot(q.query, q.mode, history_to_use, memory_context=memory_context, voice_sanctuary=q.voice_sanctuary)
        duration = round(time.time() - start_time, 2)

        # Persistence Logic
        if q.session_id:
            # Get or create session
            session = db.query(models.ChatSession).filter(models.ChatSession.id == q.session_id).first()
            if not session:
                title = q.query[:30] + ("..." if len(q.query) > 30 else "")
                session = models.ChatSession(id=q.session_id, title=title, user_id=current_user.id)
                db.add(session)
                db.commit()
            
            # Save User Message
            user_msg = models.ChatMessage(session_id=q.session_id, role="user", content=q.query)
            db.add(user_msg)
            
            # Save Assistant Message
            assistant_msg = models.ChatMessage(session_id=q.session_id, role="assistant", content=answer)
            db.add(assistant_msg)
            
            db.commit()

        return {
            "answer": answer,
            "response_time": f"{duration}s",
            "status": "success"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/knowledge/list")
def list_knowledge(current_user: models.User = Depends(auth.get_current_user)):
    try:
        knowledge_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "knowledge")
        files = glob.glob(os.path.join(knowledge_path, "*.txt"))
        
        result = []
        for file_path in files:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                title_match = re.search(r"Title:\s*(.*)", content)
                if not title_match:
                    continue
                    
                summary_match = re.search(r"Summary:\s*(.*)", content)
                link_match = re.search(r"Link:\s*(.*)", content)
                
                result.append({
                    "id": os.path.basename(file_path),
                    "title": title_match.group(1) if title_match else os.path.basename(file_path),
                    "summary": summary_match.group(1) if summary_match else "No summary available.",
                    "link": link_match.group(1) if link_match else "#"
                })
        return result
    except Exception as e:
        print(f"Error listing knowledge: {e}")
        return []

class HabitInput(BaseModel):
    habit_type: str
    duration_minutes: Optional[int] = 0
    count: Optional[int] = 0
    completed: Optional[bool] = False

class TrackerLogInput(BaseModel):
    date: str
    distraction_score: Optional[int] = None
    main_distraction: Optional[str] = None
    peace_mood_level: Optional[int] = 5
    habits: Optional[List[HabitInput]] = []
    morning_goal: Optional[str] = None
    night_reflection: Optional[str] = None

@app.post("/tracker/log")
def log_tracker(
    data: TrackerLogInput,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        log = db.query(models.DailyLog).filter(
            models.DailyLog.user_id == current_user.id,
            models.DailyLog.date == data.date
        ).first()

        if not log:
            log = models.DailyLog(
                user_id=current_user.id,
                date=data.date,
                distraction_score=data.distraction_score if data.distraction_score is not None else 0,
                main_distraction=data.main_distraction,
                peace_mood_level=data.peace_mood_level if data.peace_mood_level is not None else 5
            )
            db.add(log)
            db.flush()
        else:
            if data.distraction_score is not None:
                log.distraction_score = data.distraction_score
            if data.main_distraction is not None:
                log.main_distraction = data.main_distraction
            if data.peace_mood_level is not None:
                log.peace_mood_level = data.peace_mood_level

        if data.habits:
            for h_in in data.habits:
                habit = db.query(models.HabitRecord).filter(
                    models.HabitRecord.log_id == log.id,
                    models.HabitRecord.habit_type == h_in.habit_type
                ).first()

                if not habit:
                    habit = models.HabitRecord(
                        log_id=log.id,
                        habit_type=h_in.habit_type,
                        duration_minutes=h_in.duration_minutes if h_in.duration_minutes is not None else 0,
                        count=h_in.count if h_in.count is not None else 0,
                        completed=h_in.completed if h_in.completed is not None else False
                    )
                    db.add(habit)
                else:
                    if h_in.duration_minutes is not None:
                        habit.duration_minutes = h_in.duration_minutes
                    if h_in.count is not None:
                        habit.count = h_in.count
                    if h_in.completed is not None:
                        habit.completed = h_in.completed

        if data.morning_goal is not None or data.night_reflection is not None:
            reflection = db.query(models.Reflection).filter(
                models.Reflection.user_id == current_user.id,
                models.Reflection.date == data.date
            ).first()

            if not reflection:
                reflection = models.Reflection(
                    user_id=current_user.id,
                    date=data.date,
                    morning_goal=data.morning_goal,
                    night_reflection=data.night_reflection
                )
                db.add(reflection)
            else:
                if data.morning_goal is not None:
                    reflection.morning_goal = data.morning_goal
                if data.night_reflection is not None:
                    reflection.night_reflection = data.night_reflection

        db.commit()
        return {"status": "success", "message": "Tracker updated successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tracker/today")
def get_tracker_today(
    date: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    log = db.query(models.DailyLog).filter(
        models.DailyLog.user_id == current_user.id,
        models.DailyLog.date == date
    ).first()

    habits_list = []
    if log:
        habits_list = [{
            "habit_type": h.habit_type,
            "duration_minutes": h.duration_minutes,
            "count": h.count,
            "completed": h.completed
        } for h in log.habits]

    reflection = db.query(models.Reflection).filter(
        models.Reflection.user_id == current_user.id,
        models.Reflection.date == date
    ).first()

    return {
        "date": date,
        "distraction_score": log.distraction_score if log else 0,
        "main_distraction": log.main_distraction if log else "",
        "peace_mood_level": log.peace_mood_level if log else 5,
        "habits": habits_list,
        "morning_goal": reflection.morning_goal if reflection else "",
        "night_reflection": reflection.night_reflection if reflection else ""
    }

@app.get("/tracker/stats")
def get_tracker_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    from datetime import datetime, timedelta
    
    logs = db.query(models.DailyLog).filter(
        models.DailyLog.user_id == current_user.id
    ).all()
    
    completed_dates = set()
    for log in logs:
        for habit in log.habits:
            if habit.completed or habit.duration_minutes > 0 or habit.count > 0:
                completed_dates.add(log.date)
                break
                
    if not completed_dates:
        return {
            "current_streak": 0,
            "max_streak": 0,
            "total_days_completed": 0
        }
        
    parsed_dates = []
    for d_str in completed_dates:
        try:
            parsed_dates.append(datetime.strptime(d_str, "%Y-%m-%d").date())
        except ValueError:
            pass
            
    parsed_dates.sort(reverse=True)
    
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    current_streak = 0
    if today in parsed_dates:
        current_streak = 1
        check_date = today - timedelta(days=1)
        while check_date in parsed_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
    elif yesterday in parsed_dates:
        current_streak = 1
        check_date = yesterday - timedelta(days=1)
        while check_date in parsed_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
            
    sorted_dates = sorted(list(parsed_dates))
    max_streak = 0
    if sorted_dates:
        temp_streak = 1
        max_streak = 1
        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] - sorted_dates[i-1] == timedelta(days=1):
                temp_streak += 1
            elif sorted_dates[i] - sorted_dates[i-1] > timedelta(days=1):
                temp_streak = 1
            max_streak = max(max_streak, temp_streak)
            
    return {
        "current_streak": current_streak,
        "max_streak": max_streak,
        "total_days_completed": len(completed_dates)
    }

@app.get("/tracker/insights")
def get_tracker_insights(
    date: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    from datetime import datetime, timedelta
    from prompt_router import get_tracker_guidance_prompt

    log = db.query(models.DailyLog).filter(
        models.DailyLog.user_id == current_user.id,
        models.DailyLog.date == date
    ).first()

    today_completed = False
    if log:
        for h in log.habits:
            if h.completed or h.duration_minutes > 0 or h.count > 0:
                today_completed = True
                break
                
    streak_broken = False
    if today_completed:
        try:
            yesterday_str = (datetime.strptime(date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
            yesterday_log = db.query(models.DailyLog).filter(
                models.DailyLog.user_id == current_user.id,
                models.DailyLog.date == yesterday_str
            ).first()
            
            yesterday_completed = False
            if yesterday_log:
                for h in yesterday_log.habits:
                    if h.completed or h.duration_minutes > 0 or h.count > 0:
                        yesterday_completed = True
                        break
                        
            if not yesterday_completed:
                past_completed = False
                all_past_logs = db.query(models.DailyLog).filter(
                    models.DailyLog.user_id == current_user.id,
                    models.DailyLog.date < yesterday_str
                ).all()
                for p_log in all_past_logs:
                    for h in p_log.habits:
                        if h.completed or h.duration_minutes > 0 or h.count > 0:
                            past_completed = True
                            break
                    if past_completed:
                        break
                if past_completed:
                    streak_broken = True
        except Exception:
            pass

    distraction_score = log.distraction_score if log else None
    main_distraction = log.main_distraction if log else None

    sys_prompt = get_tracker_guidance_prompt(
        distraction_score=distraction_score,
        main_distraction=main_distraction,
        streak_broken=streak_broken
    )

    habits_summary = []
    if log:
        for h in log.habits:
            status = "completed" if h.completed else f"{h.duration_minutes} mins" if h.duration_minutes > 0 else f"{h.count} counts" if h.count > 0 else "not completed"
            habits_summary.append(f"- {h.habit_type}: {status}")
            
    reflection = db.query(models.Reflection).filter(
        models.Reflection.user_id == current_user.id,
        models.Reflection.date == date
    ).first()
    
    reflection_context = ""
    if reflection:
        if reflection.morning_goal:
            reflection_context += f"Morning Goal: {reflection.morning_goal}\n"
        if reflection.night_reflection:
            reflection_context += f"Night Reflection: {reflection.night_reflection}\n"
            
    user_content = f"Today's Date: {date}\n"
    if habits_summary:
        user_content += "Habits Logged:\n" + "\n".join(habits_summary) + "\n"
    if reflection_context:
        user_content += f"Reflections:\n{reflection_context}"
    if distraction_score is not None:
        user_content += f"Distraction Level: {distraction_score}/10 due to {main_distraction or 'general distractions'}\n"

    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_content}
            ],
            max_tokens=250,
            temperature=0.2
        )
        insight = response.choices[0].message.content.strip()
        
    except Exception as e:
        insight = f"May peace guide you. Focus on the presence of divine calmness today. (Error: {e})"

    return {
        "streak_broken": streak_broken,
        "insight": insight
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
