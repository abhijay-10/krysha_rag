"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Moon,
  Sun,
  Flame,
  Sparkles,
  Flower2,
  Trophy,
  Activity,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function SpiritualTracker() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Basic States
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [date, setDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Daily Log Inputs
  const [prayerCompleted, setPrayerCompleted] = useState(false);
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [mantraCount, setMantraCount] = useState(0);
  const [distractionScore, setDistractionScore] = useState(3);
  const [mainDistraction, setMainDistraction] = useState("");
  const [peaceMoodLevel, setPeaceMoodLevel] = useState(5);
  const [morningGoal, setMorningGoal] = useState("");
  const [nightReflection, setNightReflection] = useState("");

  // Stats & Insights
  const [streakStats, setStreakStats] = useState({
    current_streak: 0,
    max_streak: 0,
    total_days_completed: 0,
  });
  const [aiInsight, setAiInsight] = useState("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Focus Mode States
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(10);
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(600);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Distraction Options
  const distractionChips = [
    "Social Media",
    "Overthinking",
    "Anger",
    "Lust",
    "Anxiety",
    "Physical Fatigue",
    "Restlessness",
    "Gossiping"
  ];

  // Gita verses for Focus Mode
  const focusVerses = [
    {
      text: "When the mind is completely controlled, free from all desires, it becomes still like a lamp in a windless place.",
      ref: "Gita 6.19"
    },
    {
      text: "For the restless mind, which is so difficult to curb, can be controlled, O Arjuna, by constant practice and detachment.",
      ref: "Gita 6.35"
    },
    {
      text: "A person who has conquered the mind, has already reached the Supreme, for he has attained tranquility.",
      ref: "Gita 6.7"
    }
  ];

  const [activeVerse, setActiveVerse] = useState(focusVerses[0]);

  // Initializing Today's Date String
  useEffect(() => {
    setMounted(true);
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setDate(`${year}-${month}-${day}`);
  }, []);

  // Syncing with Auth
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load Data for selected Date
  const loadDateData = async (selectedDate: string) => {
    if (!selectedDate) return;
    try {
      const token = localStorage.getItem("token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com";

      // 1. Fetch Today's Logs
      const resLog = await fetch(`${apiBase}/tracker/today?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resLog.ok) {
        const data = await resLog.json();
        setDistractionScore(data.distraction_score || 3);
        setMainDistraction(data.main_distraction || "");
        setPeaceMoodLevel(data.peace_mood_level || 5);
        setMorningGoal(data.morning_goal || "");
        setNightReflection(data.night_reflection || "");

        // Reset habits first
        setPrayerCompleted(false);
        setMeditationMinutes(0);
        setMantraCount(0);

        // Populate from backend habits
        if (data.habits && Array.isArray(data.habits)) {
          data.habits.forEach((h: any) => {
            if (h.habit_type === "Prayer") setPrayerCompleted(h.completed);
            if (h.habit_type === "Meditation") setMeditationMinutes(h.duration_minutes);
            if (h.habit_type === "Mantra") setMantraCount(h.count);
          });
        }
      }

      // 2. Fetch Stats
      const resStats = await fetch(`${apiBase}/tracker/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resStats.ok) {
        const data = await resStats.json();
        setStreakStats(data);
      }

      // 3. Fetch Insights
      setIsLoadingInsight(true);
      const resInsight = await fetch(`${apiBase}/tracker/insights?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resInsight.ok) {
        const data = await resInsight.json();
        setAiInsight(data.insight || "");
      } else {
        setAiInsight("Log your first habits today to receive Krysha's divine guidance.");
      }
      setIsLoadingInsight(false);
    } catch (err) {
      console.error("Failed to load tracker date data:", err);
      setIsLoadingInsight(false);
    }
  };

  // Trigger load when date changes
  useEffect(() => {
    if (date && user) {
      loadDateData(date);
    }
  }, [date, user]);

  // Submit Daily Log
  const handleSaveLog = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com";

      const payload = {
        date: date,
        distraction_score: distractionScore,
        main_distraction: mainDistraction || null,
        peace_mood_level: peaceMoodLevel,
        habits: [
          { habit_type: "Prayer", completed: prayerCompleted },
          { habit_type: "Meditation", duration_minutes: meditationMinutes },
          { habit_type: "Mantra", count: mantraCount }
        ],
        morning_goal: morningGoal || null,
        night_reflection: nightReflection || null
      };

      const res = await fetch(`${apiBase}/tracker/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Reload data to pull new AI Insight & calculate streak changes
        await loadDateData(date);
      } else {
        alert("Failed to save log. Please try again.");
      }
    } catch (err) {
      console.error("Failed to save tracker log:", err);
    }
    setIsSaving(false);
  };

  // Focus Mode Audio Player Management
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3");
      audioRef.current.loop = true;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync Focus Mode Playback
  useEffect(() => {
    if (isFocusMode && isFocusRunning) {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play postponed until interaction", e));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isFocusMode, isFocusRunning, isMuted]);

  // Focus Timer Logic
  useEffect(() => {
    if (isFocusMode && isFocusRunning) {
      timerRef.current = setInterval(() => {
        setFocusTimeRemaining((prev) => {
          if (prev <= 1) {
            // Focus session finished
            setIsFocusRunning(false);
            if (audioRef.current) audioRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
            alert("Lotus Focus Session completed! Deep peace is with you.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFocusMode, isFocusRunning]);

  // Start Focus Session
  const handleStartFocus = async (mins: number) => {
    setFocusMinutes(mins);
    setFocusTimeRemaining(mins * 60);
    setIsFocusMode(true);
    setIsFocusRunning(true);
    // Select a random Gita verse for this session
    const rand = focusVerses[Math.floor(Math.random() * focusVerses.length)];
    setActiveVerse(rand);

    // Request true full screen to hide browser tabs
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.log("Fullscreen request failed:", err);
    }
  };

  const handleExitFocus = async () => {
    setIsFocusMode(false);
    setIsFocusRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Exit true full screen
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.log("Exit fullscreen failed:", err);
    }
  };

  // Timer Formatter
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  if (!mounted || authLoading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0a0a0f]">
        <Flower2 size={48} className="text-amber-500 animate-pulse" />
      </div>
    );
  }

  // --- FULL SCREEN IMMERSIVE FOCUS MODE ---
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center p-4 md:p-8 bg-gradient-to-b from-[#0a0515] via-[#0d091f] to-[#05030d] text-white select-none overflow-y-auto">
        
        {/* Header bar */}
        <div className="w-full max-w-4xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-amber-400 font-bold tracking-tight">
            <Flower2 size={20} className="animate-[spin_20s_linear_infinite]" />
            <span>Lotus Sanctuary</span>
          </div>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-all"
            title={isMuted ? "Unmute Ambient Flute" : "Mute Ambient Flute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Central Pulsing Meditative Display */}
        <div className="flex flex-col items-center justify-center text-center max-w-2xl px-4 flex-1 gap-8 md:gap-12 py-8 min-h-max w-full">
          
          {/* Pulsing Lotus Container */}
          <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48 shrink-0">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl animate-pulse scale-150"></div>
            <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-amber-500/20 dark:border-amber-400/10 animate-[ping_4s_ease-in-out_infinite]"></div>
            <div className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full border border-amber-500/30 dark:border-amber-400/20 animate-[spin_30s_linear_infinite] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full absolute -top-1.5"></div>
            </div>
            
            <Flower2 size={56} className="text-amber-500 relative z-10 animate-pulse drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
          </div>

          {/* Meditative Gita Quote */}
          <div className="space-y-4 animate-fade-in px-2">
            <p className="text-lg md:text-2xl font-light italic leading-relaxed text-indigo-100/90 font-serif">
              "{activeVerse.text}"
            </p>
            <p className="text-[10px] md:text-xs tracking-widest text-amber-500 uppercase font-black">
              — {activeVerse.ref}
            </p>
          </div>

          {/* Pulsing Timer */}
          <div className="text-6xl md:text-8xl font-black tracking-tighter text-white font-mono drop-shadow-[0_4px_24px_rgba(255,255,255,0.1)]">
            {formatTimer(focusTimeRemaining)}
          </div>

          {/* Pause / Resume Controls */}
          <button
            onClick={() => setIsFocusRunning(!isFocusRunning)}
            className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold tracking-wider rounded-full transition-all flex items-center gap-3 hover:-translate-y-0.5 active:scale-95 z-50 shadow-xl shadow-black/50"
          >
            {isFocusRunning ? (
              <>
                <Pause size={16} className="text-amber-400 fill-amber-400" />
                <span>Pause Meditation</span>
              </>
            ) : (
              <>
                <Play size={16} className="text-amber-400 fill-amber-400" />
                <span>Resume Meditation</span>
              </>
            )}
          </button>
        </div>

        {/* Exit Controls */}
        <div className="w-full max-w-md text-center space-y-4 pb-4 shrink-0">
          <p className="text-xs text-gray-500 tracking-wider">
            All chats, notifications, and menus are currently silenced.
          </p>
          <button
            onClick={handleExitFocus}
            className="px-8 py-3.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300"
          >
            End Focus Sanctuary
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD TRACKER & DISCIPLINE DASHBOARD ---
  return (
    <div className={`min-h-screen w-full flex flex-col overflow-x-hidden ${isDarkMode ? "dark bg-[#0a0a0f] text-gray-100" : "bg-[#fcfdfe] text-gray-900"}`}>
      
      {/* Mesh Backgrounds */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20 transition-opacity">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] animate-pulse"></div>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/40 dark:bg-[#0a0a0f]/40 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/5 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200/30 dark:border-white/10 flex items-center gap-2 text-xs font-black tracking-tight"
          >
            <ArrowLeft size={16} />
            <span>Chat With Krysha</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-300 dark:to-orange-400">
              Spiritual Sanctuary
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Calendar Date Picker */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 text-sm font-bold rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-white"
          />

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200/30 dark:border-white/10 transition-all"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Habit check-in system */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Morning Intentions */}
          <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center text-orange-500">
                🌅
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Morning Intention</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ideal time: 6 AM - 11 AM</p>
              </div>
            </div>
            
            <textarea
              value={morningGoal}
              onChange={(e) => setMorningGoal(e.target.value)}
              placeholder="What is your core spiritual goal today? (e.g., Speak absolute truth, remain completely peaceful, avoid gossip...)"
              className="w-full h-24 p-4 text-sm rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100 placeholder-gray-400/80 resize-none transition-all"
            />
          </div>

          {/* Daily Discipline / Habits */}
          <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Flower2 size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Daily Sadhana (Disciplines)</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Log your spiritual progress</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prayer Switch */}
              <div className="p-4 rounded-2xl border border-gray-200/40 dark:border-white/5 bg-white/40 dark:bg-black/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-bold">Prayer Completed</span>
                  <p className="text-[10px] text-gray-400">Daily connection to the divine</p>
                </div>
                
                <button
                  onClick={() => setPrayerCompleted(!prayerCompleted)}
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${prayerCompleted ? "bg-amber-500" : "bg-gray-300 dark:bg-white/10"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${prayerCompleted ? "translate-x-6" : "translate-x-0"}`}></div>
                </button>
              </div>

              {/* Meditation Input */}
              <div className="p-4 rounded-2xl border border-gray-200/40 dark:border-white/5 bg-white/40 dark:bg-black/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-bold">Meditation Time</span>
                  <p className="text-[10px] text-gray-400">Duration in minutes</p>
                </div>
                
                <input
                  type="number"
                  min="0"
                  max="480"
                  value={meditationMinutes || ""}
                  onChange={(e) => setMeditationMinutes(Number(e.target.value))}
                  placeholder="Mins"
                  className="w-20 px-3 py-1.5 text-center text-sm font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-800 dark:text-white"
                />
              </div>

              {/* Mantra Count */}
              <div className="p-4 rounded-2xl border border-gray-200/40 dark:border-white/5 bg-white/40 dark:bg-black/10 flex items-center justify-between md:col-span-2">
                <div className="space-y-1">
                  <span className="text-sm font-bold">Naam Jap / Mantra Chants</span>
                  <p className="text-[10px] text-gray-400">Repetitions completed</p>
                </div>
                
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={mantraCount || ""}
                  onChange={(e) => setMantraCount(Number(e.target.value))}
                  placeholder="Chants"
                  className="w-24 px-3 py-1.5 text-center text-sm font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Distraction Panel */}
          <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-500">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Mind Distraction Scale</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Track attention leakages</p>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400">Focused</span>
                <span className="text-amber-500 font-black text-lg bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">{distractionScore}/10</span>
                <span className="text-gray-400">Distracted</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="10"
                value={distractionScore}
                onChange={(e) => setDistractionScore(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-gray-200 dark:bg-white/10 appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Main Distraction Tags */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400">What was your main distraction?</span>
              <div className="flex flex-wrap gap-2">
                {distractionChips.map((chip) => {
                  const isSelected = mainDistraction === chip;
                  return (
                    <button
                      key={chip}
                      onClick={() => setMainDistraction(isSelected ? "" : chip)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 shadow-sm"
                          : "bg-white/40 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Peace & Mood Level Panel */}
          <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 flex items-center justify-center text-teal-500">
                <Flower2 size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Inner Peace & Mood Level</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Track your serene alignment</p>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400">Restless / Stressed</span>
                <span className="text-teal-500 font-black text-lg bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20">{peaceMoodLevel}/10</span>
                <span className="text-gray-400">Peaceful / Meditative</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="10"
                value={peaceMoodLevel}
                onChange={(e) => setPeaceMoodLevel(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-gray-200 dark:bg-white/10 appearance-none cursor-pointer accent-teal-500"
              />

              {/* Mood Indicators based on score */}
              <div className="p-3 rounded-2xl bg-teal-500/[0.02] border border-teal-500/5 text-center text-xs font-bold text-gray-400">
                {peaceMoodLevel <= 3 && "🧘 Arjuna's Grief: Take a few deep, slow breaths in focus mode."}
                {peaceMoodLevel > 3 && peaceMoodLevel <= 6 && "🌅 Steadying: Finding equilibrium and balancing duties."}
                {peaceMoodLevel > 6 && peaceMoodLevel <= 8 && "✨ Calm Sanctuary: Mind is clear, present, and centered."}
                {peaceMoodLevel > 8 && "🕉️ Divine Bliss: Living in deep connection, love, and light."}
              </div>
            </div>
          </div>

          {/* Night Reflections */}
          <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 flex items-center justify-center text-purple-500">
                🌌
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Evening Review</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ideal time: 8 PM - 12 AM</p>
              </div>
            </div>
            
            <textarea
              value={nightReflection}
              onChange={(e) => setNightReflection(e.target.value)}
              placeholder="Reflect on the day: Did anything pull you away from your internal peace? What did you learn?"
              className="w-full h-24 p-4 text-sm rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100 placeholder-gray-400/80 resize-none transition-all"
            />
          </div>

          {/* Save Daily Log Button */}
          <button
            onClick={handleSaveLog}
            disabled={isSaving}
            className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-sm transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSaving ? (
              <>
                <Flower2 size={16} className="animate-spin" />
                <span>Submitting Log...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle size={16} className="text-white" />
                <span>Log Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Daily Log & Fetch AI Guidance</span>
              </>
            )}
          </button>
        </section>

        {/* RIGHT COLUMN: AI insights & Streaks */}
        <section className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Streaks Widget */}
          <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-md space-y-4">
            <h3 className="font-black text-sm tracking-tight">Your Sadhana Streak</h3>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                <div className="flex justify-center text-amber-500">
                  <Flame size={20} className="animate-pulse" />
                </div>
                <span className="block text-2xl font-black">{streakStats.current_streak}</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Streak</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                <div className="flex justify-center text-indigo-500">
                  <Trophy size={20} />
                </div>
                <span className="block text-2xl font-black">{streakStats.max_streak}</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Max Streak</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-1">
                <div className="flex justify-center text-purple-500">
                  <CheckCircle size={20} />
                </div>
                <span className="block text-2xl font-black">{streakStats.total_days_completed}</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Sadhana</p>
              </div>
            </div>
          </div>

          {/* AI Insights from Lord Krishna */}
          <div className="p-6 rounded-3xl border border-amber-500/15 dark:border-amber-500/10 bg-gradient-to-br from-amber-500/[0.02] to-orange-500/[0.02] backdrop-blur-xl shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-amber-500/5 blur-xl"></div>
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-500">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-amber-600 dark:text-amber-300">Divine Guidance</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Krysha AI's Daily Reflection</p>
                </div>
              </div>
            </div>

            <div className="min-h-[120px] flex items-center justify-center">
              {isLoadingInsight ? (
                <div className="flex flex-col items-center justify-center gap-3 py-6 text-gray-400">
                  <Flower2 size={24} className="text-amber-500 animate-spin" />
                  <span className="text-xs font-bold tracking-tight">Synthesizing scriptural advice...</span>
                </div>
              ) : aiInsight ? (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm font-medium leading-relaxed italic text-gray-600 dark:text-gray-300 font-serif">
                    "{aiInsight}"
                  </p>
                  <span className="block text-[10px] tracking-widest uppercase font-black text-amber-500 text-right">
                    — Lord Krishna
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-gray-400">
                  <AlertCircle size={24} className="text-amber-500/50" />
                  <span className="text-xs font-bold tracking-tight">No guidance fetched yet</span>
                  <p className="text-[10px] text-gray-500 max-w-xs">Save today's daily log to receive personalized spiritual remedies.</p>
                </div>
              )}
            </div>
          </div>

          {/* Lotus Focus Mode Launcher */}
          <div className="p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center text-orange-500">
                🧘
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Lotus Focus Sanctuary</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Deep distraction-free Sadhana</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Silence all distractions, lock your screen, and enter deep spiritual focus with looping tranquil ambient sitar/flutes.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStartFocus(10)}
                className="py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-amber-500 hover:text-white border border-gray-200/50 dark:border-white/5 hover:border-transparent rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
              >
                10 Mins
              </button>
              
              <button
                onClick={() => handleStartFocus(20)}
                className="py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-amber-500 hover:text-white border border-gray-200/50 dark:border-white/5 hover:border-transparent rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
              >
                20 Mins
              </button>

              <button
                onClick={() => handleStartFocus(30)}
                className="py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-amber-500 hover:text-white border border-gray-200/50 dark:border-white/5 hover:border-transparent rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
              >
                30 Mins
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Signature */}
      <footer className="relative z-10 w-full text-center py-8 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-200/30 dark:border-white/5">
        <p>© 2026 Krysha AI • Built with timeless wisdom and advanced neural networks.</p>
      </footer>
    </div>
  );
}
