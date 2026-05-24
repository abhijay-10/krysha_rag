import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import ollama

# Configure local path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import models
from prompt_router import get_tracker_guidance_prompt

# Setup DB Session
DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def test_diagnostics():
    print("--- DIAGNOSTICS: spiritual insights ---")
    date = "2026-05-18"
    
    # 1. Fetch latest daily log
    log = db.query(models.DailyLog).first()
    if not log:
        print("Error: No log found in database.")
        return
        
    print(f"Log Found: Date={log.date}, Distraction={log.distraction_score}, Main={log.main_distraction}")
    
    # Check completed habits
    for h in log.habits:
        print(f"  Habit: {h.habit_type}, duration={h.duration_minutes}, count={h.count}, completed={h.completed}")
        
    # Check streak broken logic
    streak_broken = False
    print(f"Streak Broken: {streak_broken}")
    
    # Get system prompt
    sys_prompt = get_tracker_guidance_prompt(
        distraction_score=log.distraction_score,
        main_distraction=log.main_distraction,
        streak_broken=streak_broken
    )
    print("\n--- GENERATED SYSTEM PROMPT ---")
    print(sys_prompt)
    
    # Format context
    habits_summary = []
    for h in log.habits:
        status = "completed" if h.completed else f"{h.duration_minutes} mins" if h.duration_minutes > 0 else f"{h.count} counts" if h.count > 0 else "not completed"
        habits_summary.append(f"- {h.habit_type}: {status}")
        
    reflection = db.query(models.Reflection).filter(models.Reflection.date == date).first()
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
    user_content += f"Distraction Level: {log.distraction_score}/10 due to {log.main_distraction or 'general distractions'}\n"
    
    print("\n--- GENERATED USER CONTENT ---")
    print(user_content)
    
    print("\n--- RUNNING LOCAL MISTRAL INFERENCE (OLLAMA) ---")
    try:
        response = ollama.chat(
            model="mistral:latest",
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_content}
            ],
            options={
                "temperature": 0.2,
                "num_ctx": 2048,
                "num_predict": 250,
                "num_thread": 8
            }
        )
        print("\n--- SUCCESS: RECEIVED INSIGHT ---")
        print(response["message"]["content"].strip())
    except Exception as e:
        print(f"\n--- ERROR DETECTED ---")
        print(e)

if __name__ == "__main__":
    test_diagnostics()
