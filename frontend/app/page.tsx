"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Menu, Plus, MessageSquare, User, MoreHorizontal, Sparkles, Paperclip, Mic, Moon, Sun, Flower2, MicOff, LogOut, ChevronRight, Trash2, MoreVertical, ChevronDown, Rocket, Globe, Zap, Home, Search, Download, FileText, Pencil, Check, X, Database, CheckCircle, Mail, Volume2, VolumeX, Heart, Activity, Target, Flame
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import createGlobe from 'cobe';

const LogoEE = ({ className = "", size = 24 }: { className?: string, size?: number }) => (
  <div className={`flex font-black tracking-tighter leading-none ${className}`} style={{ fontSize: size }}>
    <span>E</span><span className="opacity-70 -ml-[0.15em] text-amber-500">E</span>
  </div>
);

const floatingDocsData = [
  { left: "10%", duration: "45s", delay: "-5s", width: "120px", height: "160px", rotate: "-15deg", scale: "0.8" },
  { left: "25%", duration: "52s", delay: "-12s", width: "150px", height: "200px", rotate: "10deg", scale: "1.1" },
  { left: "45%", duration: "48s", delay: "-2s", width: "110px", height: "150px", rotate: "-5deg", scale: "0.9" },
  { left: "60%", duration: "55s", delay: "-20s", width: "140px", height: "180px", rotate: "20deg", scale: "1.0" },
  { left: "75%", duration: "42s", delay: "-8s", width: "130px", height: "170px", rotate: "-25deg", scale: "0.85" },
  { left: "85%", duration: "50s", delay: "-15s", width: "160px", height: "220px", rotate: "15deg", scale: "1.2" },
  { left: "15%", duration: "46s", delay: "-25s", width: "125px", height: "165px", rotate: "5deg", scale: "0.95" },
  { left: "55%", duration: "53s", delay: "-10s", width: "145px", height: "190px", rotate: "-10deg", scale: "1.05" },
  { left: "33%", duration: "58s", delay: "-18s", width: "135px", height: "175px", rotate: "-20deg", scale: "0.9" },
  { left: "90%", duration: "44s", delay: "-5s", width: "115px", height: "155px", rotate: "12deg", scale: "0.8" },
  { left: "5%", duration: "51s", delay: "-15s", width: "155px", height: "205px", rotate: "-8deg", scale: "1.15" },
];

const FloatingDocuments = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.65] dark:opacity-[0.30] transition-opacity duration-500">
    <style>{`
      @keyframes float-up {
        0% { transform: translateY(100vh); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-20vh); opacity: 0; }
      }
    `}</style>
    {floatingDocsData.map((doc, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          left: doc.left,
          animation: `float-up ${doc.duration} linear infinite`,
          animationDelay: doc.delay,
        }}
      >
        <div
          className="border border-indigo-300/80 dark:border-white/20 rounded-2xl bg-white/85 dark:bg-white/5 p-4 flex flex-col gap-3 backdrop-blur-md shadow-[0_8px_30px_rgba(99,102,241,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300"
          style={{
            width: doc.width,
            height: doc.height,
            transform: `rotate(${doc.rotate}) scale(${doc.scale})`,
          }}
        >
          <div className="w-1/3 h-2 bg-indigo-500 dark:bg-white rounded-full opacity-50"></div>
          <div className="w-full h-1.5 bg-indigo-900/15 dark:bg-white/25 rounded-full mt-2"></div>
          <div className="w-5/6 h-1.5 bg-indigo-900/15 dark:bg-white/25 rounded-full"></div>
          <div className="w-4/6 h-1.5 bg-indigo-900/15 dark:bg-white/25 rounded-full"></div>
          <div className="w-full h-1.5 bg-indigo-900/15 dark:bg-white/25 rounded-full"></div>
          <div className="w-3/4 h-1.5 bg-indigo-900/15 dark:bg-white/25 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

function CobeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let phi = 0;
    let globe: any;

    if (!canvasRef.current) return;

    const timeout = setTimeout(() => {
      if (!canvasRef.current) return;
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: 1000,
        height: 1000,
        phi: 0,
        theta: 0.2,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.15],
        markerColor: [0.38, 0.40, 0.94], // indigo-500
        glowColor: [0.05, 0.05, 0.08],
        markers: [
          { location: [37.7595, -122.4367], size: 0.05 },
          { location: [40.7128, -74.006], size: 0.05 },
          { location: [51.5072, 0.1276], size: 0.05 },
          { location: [25.2048, 55.2708], size: 0.08 }, // Dubai
        ],
        onRender: (state: any) => {
          state.phi = phi;
          phi += 0.003;
        }
      } as any);

      canvasRef.current.style.opacity = '1';
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (globe) {
        globe.destroy();
      }
    };
  }, [isClient]);

  if (!isClient) {
    return <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-150"></div>;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-150">
      <canvas
        ref={canvasRef}
        style={{
          width: 500,
          height: 500,
          opacity: 0,
          transition: 'opacity 2s ease',
        }}
      />
    </div>
  );
}


type ChatMessage = { role: 'user' | 'assistant', content: string, timestamp: Date | string };
type ChatSession = { id: string, title: string, history: ChatMessage[], isLoading: boolean };

export default function ChatbotDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [fadeWelcome, setFadeWelcome] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"neutral" | "krishna">("neutral");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "Ask anything...",
    "Share your thoughts with Krysha...",
    "Seek guidance from ancient wisdom...",
    "What's on your mind today?",
    "Discover clarity and peace...",
    "Explore the depths of sacred texts...",
    "Ask about Dharma or Inner Peace..."
  ];

  // Unified State for all Chats
  const [savedChats, setSavedChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [activeSessionMenu, setActiveSessionMenu] = useState<string | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const allSuggestions = [
    "What is the meaning of life according to Gita?",
    "Explain the concept of Dharma.",
    "What are the teachings of Lord Krishna?",
    "The loyalty of Karna and the Kuru war.",
    "Who is Radha Rani in Vedic literature?",
    "Significance of the Mahabharata today.",
    "What is the Guru Granth Sahib?",
    "Core principles of Sikhism.",
    "Teachings of Guru Nanak Dev Ji.",
    "What is the Holy Quran?",
    "Teachings of the Holy Bible.",
    "Spiritual wisdom from the Guru Granth Sahib.",
    "Understanding the message of the Quran.",
    "Life lessons from the Holy Bible."
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- VOICE SANCTUARY ASSISTANT SYSTEM (PERSISTENT MEMORY & CONTINUOUS VOICE LOOP) ---
  const [isVoiceSanctuaryActive, setIsVoiceSanctuaryActive] = useState(false);
  const isVoiceSanctuaryActiveRef = useRef(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResponseText, setVoiceResponseText] = useState("");
  const [voiceInputText, setVoiceInputText] = useState("");
  const voiceRecognitionRef = useRef<any>(null);

  // Speaks response and automatically resumes listening upon completion
  const speakVoiceSanctuaryText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!isVoiceSanctuaryActiveRef.current) return;
    
    // Cancel current synthesis
    window.speechSynthesis.cancel();
    
    setVoiceState("speaking");
    setVoiceResponseText(text);
    
    // Clean text for TTS (Stop reading at multimedia links)
    let ttsText = text;
    if (ttsText.includes("Please refer to the multimedia resources below for further guidance.")) {
        ttsText = ttsText.split("Please refer to the multimedia resources below for further guidance.")[0] + " Please refer to the multimedia resources provided on your screen.";
    } else if (ttsText.includes("**Multimedia Resources:**")) {
        ttsText = ttsText.split("**Multimedia Resources:**")[0] + " Please refer to the multimedia resources provided on your screen.";
    }
    
    const utterance = new SpeechSynthesisUtterance(ttsText);
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('male') || 
      voice.name.toLowerCase().includes('guy') ||
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('mark') ||
      voice.name.toLowerCase().includes('james') ||
      voice.name.toLowerCase().includes('matthew') ||
      voice.name.toLowerCase().includes('microsoft zira') ||
      voice.name.toLowerCase().includes('google us english')
    );
    if (maleVoice) utterance.voice = maleVoice;
    utterance.rate = 0.88; // Serene, calm spiritual pace
    utterance.pitch = 0.95;
    
    utterance.onend = () => {
      if (!isVoiceSanctuaryActiveRef.current) return;
      setVoiceState("idle");
    };
    
    utterance.onerror = (err) => {
      console.warn("Speech Synthesis ended with error:", err);
      if (!isVoiceSanctuaryActiveRef.current) return;
      setVoiceState("idle");
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceSanctuaryInteraction = async (query: string, speakResponse: boolean) => {
    setVoiceTranscript(query);
    setVoiceState("thinking");

    let targetChatId = currentChatId;
    let isNewSession = false;

    if (!targetChatId) {
      targetChatId = Date.now().toString();
      isNewSession = true;
      setCurrentChatId(targetChatId);
    }

    const newUserMsg: ChatMessage = { role: 'user', content: query, timestamp: new Date() };

    setSavedChats(prev => {
      if (isNewSession) {
        const title = "Voice: " + query.substring(0, 30) + (query.length > 30 ? "..." : "");
        return [{ id: targetChatId!, title, history: [newUserMsg], isLoading: true }, ...prev];
      } else {
        return prev.map(chat =>
          chat.id === targetChatId
            ? { ...chat, history: [...chat.history, newUserMsg], isLoading: true }
            : chat
        );
      }
    });

    try {
      const existingChat = savedChats.find(c => c.id === targetChatId);
      const historyPayload = existingChat ? existingChat.history.map(m => ({ role: m.role, content: m.content })) : [];

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com"}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: query,
          mode: "krishna",
          history: historyPayload,
          session_id: targetChatId,
          voice_sanctuary: true
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const newBotMsg: ChatMessage = { role: 'assistant', content: data.answer, timestamp: new Date() };

        setSavedChats(prev => prev.map(chat =>
          chat.id === targetChatId
            ? { ...chat, history: [...chat.history, newBotMsg], isLoading: false }
            : chat
        ));

        if (speakResponse) {
          speakVoiceSanctuaryText(data.answer);
        } else {
          setVoiceResponseText(data.answer);
          setVoiceState("idle");
        }
      } else {
        const errorMsg = "I could not reach the realms of wisdom. Please try again.";
        setVoiceResponseText(errorMsg);
        setVoiceState("idle");
        
        setSavedChats(prev => prev.map(chat =>
          chat.id === targetChatId
            ? { ...chat, history: [...chat.history, { role: 'assistant', content: errorMsg, timestamp: new Date() }], isLoading: false }
            : chat
        ));
      }
    } catch (err) {
      const errorMsg = "My friend, let us try again once the connection is clear.";
      setVoiceResponseText(errorMsg);
      setVoiceState("idle");
      
      setSavedChats(prev => prev.map(chat =>
        chat.id === targetChatId
          ? { ...chat, history: [...chat.history, { role: 'assistant', content: errorMsg, timestamp: new Date() }], isLoading: false }
          : chat
      ));
    }
  };

  const startVoiceSanctuaryListening = () => {
    if (!isVoiceSanctuaryActiveRef.current) return;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    
    if (voiceRecognitionRef.current) {
      try {
        voiceRecognitionRef.current.stop();
      } catch (e) {}
    }
    
    const recognition = new SpeechRecognition();
    voiceRecognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setVoiceState("listening");
      setVoiceTranscript("Listening for your voice...");
    };
    
    recognition.onresult = async (event: any) => {
      if (!isVoiceSanctuaryActiveRef.current) return;
      const speechToText = event.results[0][0].transcript;
      await handleVoiceSanctuaryInteraction(speechToText, true);
    };
    
    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e);
      if (!isVoiceSanctuaryActiveRef.current) return;
      setVoiceState("idle");
    };
    
    recognition.start();
  };

  const submitVoiceSanctuaryText = async () => {
    if (!voiceInputText.trim()) return;
    const query = voiceInputText;
    setVoiceInputText("");
    await handleVoiceSanctuaryInteraction(query, true);
  };

  const toggleVoiceSanctuary = () => {
    if (isVoiceSanctuaryActive) {
      // Exit voice mode
      setIsVoiceSanctuaryActive(false);
      isVoiceSanctuaryActiveRef.current = false;
      setVoiceState("idle");
      if (voiceRecognitionRef.current) {
        try { voiceRecognitionRef.current.stop(); } catch (e) {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      // Enter voice mode
      setIsVoiceSanctuaryActive(true);
      isVoiceSanctuaryActiveRef.current = true;
      setVoiceTranscript("Say something wise...");
      setVoiceResponseText(`Welcome to the Voice Sanctuary, ${user?.username || 'my friend'}. I am listening.`);
      // Warm initial greeting from Lord Krishna
      speakVoiceSanctuaryText(`Welcome to the Voice Sanctuary, ${user?.username || 'my friend'}. Speak to me, and let us discuss the peace of your soul.`);
    }
  };

  // Derived state for the currently active chat
  const currentChat = savedChats.find(c => c.id === currentChatId);
  const chatHistory = currentChat?.history || [];
  const isLoading = currentChat?.isLoading || false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading, currentChatId]);

  // Cycle placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Manage welcome screen based on auth status
  useEffect(() => {
    if (!authLoading) {
      setShowWelcome(!user);
    }
  }, [authLoading, user]);

  // Scroll reveal animation observer
  useEffect(() => {
    if (!showWelcome) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('scroll-reveal')) {
            entry.target.classList.remove('opacity-0');
            entry.target.classList.add('animate-fade-in-up');
          } else if (entry.target.classList.contains('scroll-reveal-graph-bar')) {
            const h = entry.target.getAttribute('data-h');
            const delay = entry.target.getAttribute('data-delay');
            entry.target.setAttribute('style', `height: ${h}%; animation: grow-up 1s ease-out forwards; animation-delay: ${delay}s;`);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-graph-bar');
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [showWelcome]);

  // Load chats from Backend on mount or when user changes
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com"}/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.status === 401) {
            logout();
            throw new Error("Unauthorized");
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setSavedChats(data.map(session => ({
              ...session,
              isLoading: false
            })));
          }
        })
        .catch(err => {
          if (err.message !== "Unauthorized") {
            console.error("Failed to fetch sessions", err);
          }
        });
    }
  }, [user]);

  // Load knowledge sources
  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com"}/knowledge/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then(res => res.json())
        .then(data => setKnowledge(data))
        .catch(err => console.error("Failed to fetch knowledge", err));
    }
  }, [user]);

  const handleProceed = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setFadeWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 800);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const loadChat = (id: string) => {
    setCurrentChatId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false); // Auto close sidebar on mobile when selecting
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this reflection? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com"}/sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSavedChats(prev => prev.filter(chat => chat.id !== id));
        if (currentChatId === id) {
          setCurrentChatId(null);
        }
      } else {
        alert("Failed to delete the session. Please try again.");
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
    setActiveSessionMenu(null);
  };

  const handleAsk = async (overrideQuery?: string) => {
    const userMessage = (typeof overrideQuery === 'string' ? overrideQuery : query).trim();
    if (!userMessage) return;

    let targetChatId = currentChatId;
    let isNewSession = false;

    if (!targetChatId) {
      targetChatId = Date.now().toString();
      isNewSession = true;
    }

    const activeChat = savedChats.find(c => c.id === targetChatId);
    if (activeChat?.isLoading) return;

    setQuery("");

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const newUserMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: new Date() };

    setSavedChats(prev => {
      if (isNewSession) {
        const title = userMessage.substring(0, 30) + (userMessage.length > 30 ? "..." : "");
        return [{ id: targetChatId!, title, history: [newUserMsg], isLoading: true }, ...prev];
      } else {
        return prev.map(chat =>
          chat.id === targetChatId
            ? { ...chat, history: [...chat.history, newUserMsg], isLoading: true }
            : chat
        );
      }
    });

    if (isNewSession) {
      setCurrentChatId(targetChatId);
    }

    try {
      const existingChat = savedChats.find(c => c.id === targetChatId);
      const historyPayload = existingChat ? existingChat.history.map(m => ({ role: m.role, content: m.content })) : [];

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com"}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: userMessage,
          mode: mode,
          history: historyPayload,
          session_id: targetChatId
        }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      const newBotMsg: ChatMessage = { role: 'assistant', content: data.answer, timestamp: new Date() };

      setSavedChats(prev => prev.map(chat =>
        chat.id === targetChatId
          ? { ...chat, history: [...chat.history, newBotMsg], isLoading: false }
          : chat
      ));
    } catch {
      const errorMsg: ChatMessage = { role: 'assistant', content: "I am unable to connect to the realms of wisdom at the moment.", timestamp: new Date() };
      setSavedChats(prev => prev.map(chat =>
        chat.id === targetChatId
          ? { ...chat, history: [...chat.history, errorMsg], isLoading: false }
          : chat
      ));
    }
  };


  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#0a0a0f]">
        <LogoEE size={48} className="text-amber-500 animate-pulse" />
      </div>
    );
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true; // allow seeing text as you speak
    recognition.continuous = true; // keep listening until stopped by user

    let currentStartQuery = query;
    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setQuery((currentStartQuery ? currentStartQuery + " " : "") + finalTranscript + interimTranscript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (content: string) => {
    // Check for Multimedia Resources block
    let mainContent = content;
    let videosLink: any = null;
    let imagesLink: any = null;
    
    const mmSplit = content.split(/\*\*Multimedia Resources:\*\*|Please refer to the multimedia resources below for further guidance\./);
    if (mmSplit.length > 1) {
      mainContent = mmSplit[0].trim();
      const mmBlock = mmSplit[1];
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(mmBlock)) !== null) {
        if (match[1].includes("Videos") || match[1].includes("📺")) {
          videosLink = { title: match[1], url: match[2] };
        } else if (match[1].includes("Images") || match[1].includes("🖼️")) {
          imagesLink = { title: match[1], url: match[2] };
        }
      }
    }

    // Helper to render bold text
    const renderBold = (text: string) => {
      const boldRegex = /\*\*([^\*]+)\*\*/g;
      if (!boldRegex.test(text)) return text;

      const boldParts = [];
      let bLastIndex = 0;
      let bMatch;

      boldRegex.lastIndex = 0;
      while ((bMatch = boldRegex.exec(text)) !== null) {
        if (bMatch.index > bLastIndex) {
          boldParts.push(text.substring(bLastIndex, bMatch.index));
        }
        boldParts.push(
          <span key={`bold-${bMatch.index}`} className="font-bold text-gray-900 dark:text-white">
            {bMatch[1]}
          </span>
        );
        bLastIndex = bMatch.index + bMatch[0].length;
      }

      if (bLastIndex < text.length) {
        boldParts.push(text.substring(bLastIndex));
      }
      return <>{boldParts}</>;
    };

    const tokenRegex = /(!?)\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

    let parts = [];
    if (!tokenRegex.test(mainContent)) {
      parts.push(<span key="main-text">{renderBold(mainContent)}</span>);
    } else {
      let lastIndex = 0;
      let match;

      tokenRegex.lastIndex = 0;
      while ((match = tokenRegex.exec(mainContent)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${lastIndex}`}>
              {renderBold(mainContent.substring(lastIndex, match.index))}
            </span>
          );
        }
        
        const isImage = match[1] === '!';
        const altText = match[2];
        const url = match[3];
        
        if (isImage) {
          parts.push(
            <div key={`img-${match.index}`} className="my-4">
              <img src={url} alt={altText} className="max-w-full rounded-xl shadow-lg border border-gray-200 dark:border-white/10" />
            </div>
          );
        } else {
          parts.push(
            <a key={`link-${match.index}`} href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1">
              {altText}
            </a>
          );
        }
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < mainContent.length) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {renderBold(mainContent.substring(lastIndex))}
          </span>
        );
      }
    }

    const resourcesBlock = (videosLink || imagesLink) ? (
      <div key="resources-block" className="w-full mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400 px-2">
          <FileText size={16} className="text-indigo-500 dark:text-indigo-400" />
          <span className="text-sm font-semibold tracking-wide text-indigo-700 dark:text-indigo-200">Resources for you</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videosLink && (
            <a href={videosLink.url} target="_blank" rel="noopener noreferrer" className="bg-gray-50 dark:bg-[#15151e] border border-gray-200 dark:border-white/5 hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.02] group shadow-sm dark:shadow-lg">
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-gray-200 font-bold text-sm flex items-center gap-2">
                  <span className="text-lg">▶️</span> {videosLink.title.replace("📺", "").trim()}
                </span>
                <span className="text-gray-500 text-xs mt-1 font-medium">Helpful guidance & stories</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 dark:text-gray-600 group-hover:text-amber-500 transition-colors" />
            </a>
          )}
          {imagesLink && (
            <a href={imagesLink.url} target="_blank" rel="noopener noreferrer" className="bg-gray-50 dark:bg-[#15151e] border border-gray-200 dark:border-white/5 hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.02] group shadow-sm dark:shadow-lg">
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-gray-200 font-bold text-sm flex items-center gap-2">
                  <span className="text-lg">🖼️</span> {imagesLink.title.replace("🖼️", "").trim()}
                </span>
                <span className="text-gray-500 text-xs mt-1 font-medium">Inspiring visuals for you</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 dark:text-gray-600 group-hover:text-amber-500 transition-colors" />
            </a>
          )}
        </div>
      </div>
    ) : null;

    if (resourcesBlock) {
      parts.push(resourcesBlock);
    }

    return <>{parts}</>;
  };


  const downloadAsPDF = (message: ChatMessage, index: number) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 30;

    // 1. Header - Branding
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 119, 6); // Amber-600
    doc.text("EliteEdge Krysha", margin, currentY);

    currentY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Divine Wisdom • Timeless Clarity", margin, currentY);

    currentY += 15;
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(margin, currentY, pageWidth - margin, currentY);

    // 2. Title - The User's Question
    currentY += 15;
    const previousMessage = chatHistory[index - 1];
    const questionTitle = previousMessage && previousMessage.role === 'user'
      ? previousMessage.content
      : "Divine Reflection";

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); // Slate-900

    const splitTitle = doc.splitTextToSize(`Question: ${questionTitle}`, contentWidth);
    doc.text(splitTitle, margin, currentY);
    currentY += (splitTitle.length * 7) + 5;

    // 3. Content - The Assistant's Response
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85); // Slate-700

    const lines = message.content.split('\n');
    lines.forEach((line) => {
      // Check for page overflow
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      const trimmedLine = line.trim();

      // Simple Markdown Parsing for PDF
      if (trimmedLine.startsWith('###')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        const text = trimmedLine.replace('###', '').trim();
        const splitText = doc.splitTextToSize(text, contentWidth);
        doc.text(splitText, margin, currentY);
        currentY += (splitText.length * 7) + 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
      } else if (trimmedLine.startsWith('##')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        const text = trimmedLine.replace('##', '').trim();
        const splitText = doc.splitTextToSize(text, contentWidth);
        doc.text(splitText, margin, currentY);
        currentY += (splitText.length * 8) + 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
      } else if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        const text = trimmedLine.substring(1).trim();
        const splitText = doc.splitTextToSize(`• ${text}`, contentWidth - 5);
        doc.text(splitText, margin + 5, currentY);
        currentY += (splitText.length * 6) + 2;
      } else if (trimmedLine === "") {
        currentY += 6;
      } else {
        const splitText = doc.splitTextToSize(line, contentWidth);
        doc.text(splitText, margin, currentY);
        currentY += (splitText.length * 6) + 2;
      }
    });

    // 4. Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text("Generated by EliteEdge Krysha", margin, 285);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 285);
    }

    const fileName = `Krysha_Reflection_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  const handleEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditText(content);
  };

  const handleSaveEdit = async (index: number) => {
    if (!editText.trim()) return;

    const targetChatId = currentChatId;
    if (!targetChatId) return;

    // Truncate history to messages before the edited one
    setSavedChats(prev => prev.map(chat =>
      chat.id === targetChatId
        ? { ...chat, history: chat.history.slice(0, index), isLoading: true }
        : chat
    ));

    setEditingIndex(null);

    // Trigger handleAsk with the edited text
    await handleAsk(editText);
  };

  return (
    <div className={`relative h-screen w-full overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Welcome Screen Overlay */}
      {showWelcome && (
        <div className={`absolute inset-0 z-[100] transition-all duration-1000 ease-in-out ${fadeWelcome ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'} bg-[#fcfdfe] dark:bg-[#050508] overflow-y-auto scroll-smooth`}>

          {/* Sticky Header Navigation */}
          <div className="sticky top-0 z-50 flex items-center justify-between p-6 md:px-12 md:py-4 bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-colors duration-150">
            <div className="flex items-center gap-3">
              <LogoEE size={28} className="text-gray-900 dark:text-white" />
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden sm:block">Krysha AI</span>
            </div>

            <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</button>
              <button onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Our Features</button>
              <button onClick={() => document.getElementById('workflow-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Our Story</button>
              <button onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Community</button>
            </div>

            <div className="flex items-center gap-6">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button onClick={() => router.push('/login')} className="text-sm font-bold text-gray-500 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-white transition-colors">Sign In</button>
              <button onClick={() => router.push('/signup')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">Sign Up Now</button>
            </div>
          </div>

          {/* First Section: Hero (Refined Mesh Gradient Style - Theme Aware) */}
          <div className="flex min-h-screen w-full relative overflow-hidden items-center justify-center bg-[#fcfdfe] dark:bg-[#0a0515] transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {/* Top Mesh */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#f5f7ff]/50 via-transparent to-[#fcfdfe] dark:to-[#0a0515] z-10" />

              {/* Large Vibrant Blobs (Enhanced Purple & Gold combination - Rich and Premium) */}
              <div className="absolute top-[10%] left-[-15%] w-[80%] h-[70%] rounded-full bg-purple-300/40 dark:bg-purple-800/35 blur-[140px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-15%] w-[80%] h-[70%] rounded-full bg-amber-200/40 dark:bg-amber-500/15 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />

              {/* Bright Bottom Mist (Enhanced Purple/Gold) */}
              <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] rounded-full bg-purple-400/10 dark:bg-purple-900/25 blur-[100px]" />
              <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-amber-300/15 dark:bg-amber-500/15 blur-[80px]" />

              <FloatingDocuments />
            </div>

            {/* Iridescent Fluid Morphing Orb Custom CSS */}
            <style>{`
              @keyframes morph-fluid-orb {
                0% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; transform: rotate(0deg); }
                25% { border-radius: 70% 30% 52% 48% / 60% 40% 60% 40%; }
                50% { border-radius: 30% 70% 40% 60% / 50% 60% 40% 50%; }
                75% { border-radius: 60% 40% 60% 40% / 40% 60% 50% 40%; }
                100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; transform: rotate(360deg); }
              }
            `}</style>

            {/* Split Screen Grid Hero Layout (Directly Inspired by Scale.AI Mockup) */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-4 flex flex-col justify-between min-h-[calc(100vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full my-auto -mt-4 md:-mt-8 lg:-mt-10">

                {/* Left Column: Bold Copy, Social Proof & Metric CTAs */}
                <div className="lg:col-span-7 flex flex-col items-start text-left animate-fade-in-up">
                  {/* Top Sparkle Tag */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600/10 to-amber-500/10 dark:from-indigo-500/10 dark:to-amber-500/10 border border-indigo-500/20 dark:border-amber-500/20 text-indigo-800 dark:text-amber-100 text-[10px] font-black uppercase tracking-[0.3em] mb-6 backdrop-blur-xl shadow-lg shadow-indigo-500/5 hover:scale-105 transition-transform cursor-default">
                    <Sparkles size={12} className="text-amber-500 animate-pulse" />
                    The Divine Sanctuary
                  </div>

                  {/* Main Bold Tall Title */}
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black text-gray-900 dark:text-white tracking-tighter mb-6 leading-[1.02] drop-shadow-sm">
                    Built to Understand <br />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 dark:from-amber-400 dark:via-indigo-400 dark:to-purple-500 pb-2">
                      the Eternal With AI
                      <div className="absolute -bottom-2 left-0 w-1/3 h-1.5 bg-gradient-to-r from-amber-500 to-transparent rounded-full opacity-70"></div>
                    </span>
                  </h1>

                  {/* Short Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg font-medium leading-relaxed max-w-xl border-l-4 border-amber-500 pl-6 mb-5 bg-gradient-to-r from-gray-50 to-transparent dark:from-white/5 dark:to-transparent py-2 rounded-r-xl">
                    The most advanced spiritual intelligence engine. Bridging ancient scrolls with modern neural networks to illuminate your path with absolute clarity.
                  </p>

                  {/* CTA Badge, Button & Stats Row */}
                  <div className="flex flex-wrap items-center gap-6 md:gap-8 w-full mt-0">
                    {/* Primary Capsule Action Button (Dynamic based on login session state) */}
                    <button
                      onClick={handleProceed}
                      className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm transition-all duration-500 shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                    >
                      {user ? "Continue Your Journey" : "Start Your Journey"}
                      <ChevronRight size={16} fill="white" />
                    </button>

                    {/* Bouncing Circular SVG Badge */}
                    <div
                      onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="relative w-20 h-20 flex items-center justify-center cursor-pointer group active:scale-95 transition-all flex-shrink-0"
                    >
                      {/* Outer Rotating SVG Text */}
                      <svg className="absolute w-full h-full animate-[spin_16s_linear_infinite]" viewBox="0 0 100 100">
                        <defs>
                          <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                        </defs>
                        <text className="fill-indigo-600 dark:fill-purple-300 font-black uppercase text-[7.5px] tracking-[0.16em]">
                          <textPath href="#circlePath">DISCOVER ENGINE • DISCOVER ENGINE •</textPath>
                        </text>
                      </svg>

                      {/* Inner Glowing Arrow */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 group-hover:bg-amber-500 text-gray-500 dark:text-gray-300 group-hover:text-white flex items-center justify-center shadow-md transition-all duration-300 z-10">
                        <svg className="w-4.5 h-4.5 group-hover:translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>

                    {/* Stats Metrics Column: 88.9% Accuracy Only */}
                    <div className="flex items-center border-l border-gray-200 dark:border-white/10 pl-6 md:pl-8 text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">88.9%</span>
                        <span className="text-[9px] text-gray-500 dark:text-purple-300 font-bold uppercase tracking-widest">Retrieval Accuracy</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Stunning Iridescent Glass 3D Fluid Orb */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative gap-6">

                  {/* Floating Orb Bubble Container */}
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center select-none">

                    {/* Layer 1: Outer Glowing Neon Blob blur background */}
                    <div
                      className="absolute inset-0 bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 opacity-80 dark:opacity-60 blur-[30px] scale-95"
                      style={{
                        animation: 'morph-fluid-orb 12s ease-in-out infinite',
                      }}
                    />

                    {/* Layer 2: Main Iridescent 3D bubble body */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 border border-white/20 dark:border-white/10 shadow-[inset_-12px_-12px_40px_rgba(0,0,0,0.25),_inset_20px_20px_40px_rgba(255,255,255,0.45),_0_30px_60px_rgba(99,102,241,0.3)] backdrop-blur-[4px]"
                      style={{
                        animation: 'morph-fluid-orb 18s ease-in-out infinite',
                      }}
                    />

                    {/* Layer 3: Contrast Highlight Overlay */}
                    <div
                      className="absolute inset-2 bg-gradient-to-tr from-transparent via-white/25 to-pink-300 opacity-60 mix-blend-overlay"
                      style={{
                        animation: 'morph-fluid-orb 14s ease-in-out infinite reverse',
                      }}
                    />

                    {/* Layer 4: Deep Golden Glowing Core */}
                    <div className="absolute w-20 h-20 rounded-full bg-amber-400/25 blur-xl animate-pulse" />
                  </div>

                  {/* Watch How It Works Glass Card (Clean Centered Alignment - No Overlap) */}
                  <div
                    onClick={() => setShowDemo(true)}
                    className="bg-white/40 dark:bg-black/40 border border-purple-100/50 dark:border-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 max-w-[280px] shadow-xl hover:scale-105 transition-all duration-300 z-20 cursor-pointer w-full mt-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center shadow-lg relative group flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping group-hover:hidden" />
                      <ChevronRight size={16} fill="white" className="text-white ml-0.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black text-gray-900 dark:text-white">Watch How It Works</span>
                      <span className="text-[9px] text-gray-600 dark:text-purple-200 mt-0.5 line-clamp-2">Learn to build and compile ancient wisdom.</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Collaborators Footer Bar (Directly from Mockup) */}
              <div className="relative z-10 w-full border-t border-gray-200/50 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between py-6 mt-12 gap-4 opacity-70 dark:opacity-50 select-none">
                <span className="text-[9px] font-black tracking-[0.25em] text-gray-400 dark:text-purple-300 uppercase">Scale Collaborators</span>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">Coppertone</span>
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">Google</span>
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">Tesla</span>
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">Hummel</span>
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">Custom</span>
                </div>
              </div>
            </div>


          </div>

          {/* Features & Workflow Section */}
          <div id="about-section" className="w-full bg-[#fbfcfd] dark:bg-[#0a0a0f] py-32 px-6 md:px-12 border-t border-gray-100 dark:border-white/5 relative overflow-hidden transition-colors duration-500">

            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

            <div className="max-w-6xl mx-auto space-y-32">

              {/* Features Grid */}
              <div id="features-section" className="space-y-16 pt-10">
                <div className="text-center space-y-4 animate-fade-in-up">
                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Divine Features
                  </h3>
                  <p className="text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto">
                    Experience the synergy of ancient wisdom and cutting-edge artificial intelligence.
                  </p>
                </div>

                {/* Refined Glassmorphic Cards Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Decorative Background Glows */}
                  <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
                  <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 blur-[100px] pointer-events-none"></div>

                  {[
                    { icon: <Globe size={32} />, title: "Global Knowledge", desc: "Access and cross-reference ancient texts from diverse spiritual traditions worldwide.", delay: "0s", color: "indigo" },
                    { icon: <Zap size={32} />, title: "Real-time RAG", desc: "Instantaneous retrieval of highly accurate, context-aware insights from structured scripture databases.", delay: "0.2s", color: "amber" },
                    { icon: <Sparkles size={32} />, title: "Persona AI", desc: "Switch seamlessly between the objective Neutral Scholar or the comforting, direct guidance of Lord Krishna.", delay: "0.4s", color: "blue" }
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="group relative p-8 md:p-10 rounded-[2.5rem] bg-white/70 dark:bg-[#0f0f15]/75 border border-indigo-50/60 dark:border-white/[0.03] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(99,102,241,0.04)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden animate-fade-in-up"
                      style={{ animationDelay: feature.delay }}
                    >
                      {/* Subtle accent glow */}
                      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                        ${feature.color === 'indigo' ? 'bg-indigo-500/10' : feature.color === 'amber' ? 'bg-amber-500/10' : 'bg-blue-500/10'}
                      `} />

                      <div className={`mb-8 p-4 w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-500
                        ${feature.color === 'indigo'
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white'
                          : feature.color === 'amber'
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-600 group-hover:text-white'
                            : 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-600 group-hover:text-white'} 
                        shadow-sm`}>
                        {feature.icon}
                      </div>

                      <div className="relative">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[15px] font-medium transition-colors duration-300">
                          {feature.desc}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${feature.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : feature.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>Core Engine</span>
                        <div className={`w-8 h-px ${feature.color === 'indigo' ? 'bg-indigo-600 dark:bg-indigo-400' : feature.color === 'amber' ? 'bg-amber-600 dark:bg-amber-400' : 'bg-blue-600 dark:bg-blue-400'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics Section */}
              <div className="relative pt-10 space-y-16">
                <div className="text-center space-y-4 animate-fade-in-up">
                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Divine Precision
                  </h3>
                  <p className="text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto">
                    A benchmark of accuracy and scale in spiritual document intelligence.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                    {[
                      { value: "37,800+", label: "Knowledge Chunks", sub: "Deep semantic indexing", icon: <Database size={20} />, color: "indigo" },
                      { value: "88.9%", label: "Accuracy", sub: "Fact-checked retrieval", icon: <CheckCircle size={20} />, color: "amber" },
                      { value: "15-20s", label: "Time Taken", sub: "Optimized RAG pipeline", icon: <Zap size={20} />, color: "indigo" },
                      { value: "24/7", label: "Available", sub: "Always-on intelligence", icon: <Globe size={20} />, color: "amber" }
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className="group relative p-8 rounded-[2.5rem] bg-white/70 dark:bg-[#0d0d12]/75 border border-indigo-50/60 dark:border-white/[0.03] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(99,102,241,0.02)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color === 'indigo' ? 'from-indigo-500/5' : 'from-amber-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                        <div className="relative z-10 flex flex-col items-start text-left">
                          <div className={`w-10 h-10 rounded-xl ${stat.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                          </div>
                          <div className={`text-3xl md:text-4xl font-black ${stat.color === 'indigo' ? 'text-indigo-600 dark:text-white' : 'text-amber-600 dark:text-white'} mb-2 tracking-tight`}>
                            {stat.value}
                          </div>
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-widest mb-1">{stat.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium opacity-75">{stat.sub}</div>
                        </div>

                        {/* Decorative element */}
                        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${stat.color === 'indigo' ? 'bg-indigo-500/5' : 'bg-amber-500/5'} blur-2xl group-hover:scale-150 transition-transform`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workflow Section */}
              <div id="workflow-section" className="space-y-16 pt-10">
                <div className="text-center space-y-4 animate-fade-in-up">
                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    The Divine Workflow
                  </h3>
                  <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
                    A multi-layered journey from inquiry to verified enlightenment.
                  </p>
                </div>

                <div className="relative px-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Step List */}
                    <div className="space-y-8 text-left order-2 lg:order-1">
                      {[
                        { step: "01", title: "Ingestion", desc: "Analyzing and segmenting sacred texts for high-precision retrieval.", color: "indigo" },
                        { step: "02", title: "Retrieval", desc: "Leveraging vector embeddings to find the most relevant spiritual chunks.", color: "amber" },
                        { step: "03", title: "Re-ranker", desc: "Filtering results through our Cross-Encoder to ensure absolute truth.", color: "indigo" },
                        { step: "04", title: "Synthesis", desc: "Synthesizing answers with culturally-aware, divine intelligence.", color: "amber" },
                        { step: "05", title: "Citation", desc: "Mapping every word back to the original source record for proof.", color: "indigo" }
                      ].map((step, idx) => (
                        <div key={idx} className="group flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-all duration-500 group-hover:scale-110 shadow-lg
                          ${step.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white'}
                        `}>
                            {step.step}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-lg font-black text-gray-900 dark:text-white tracking-tight group-hover:text-indigo-500 transition-colors">
                              {step.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium opacity-80 leading-relaxed max-w-sm">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column: Neural Atom Visualization */}
                    <div className="relative order-1 lg:order-2 flex justify-center py-10 lg:py-0">
                      <div className="relative w-[380px] h-[380px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] lg:w-[650px] lg:h-[650px]">
                        {/* Atmospheric Glow behind Atom */}
                        <div className="absolute inset-0 bg-indigo-500/5 blur-[150px] rounded-full animate-pulse" />

                        <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 overflow-visible">
                          {/* Circular Connecting Path */}
                          <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-500/10 dark:text-white/5" />

                          {/* Interconnecting Neural Lines */}
                          <g className="opacity-20">
                            <line x1="200" y1="60" x2="330" y2="150" stroke="#6366f1" strokeWidth="1.5" />
                            <line x1="330" y1="150" x2="280" y2="320" stroke="#f59e0b" strokeWidth="1.5" />
                            <line x1="280" y1="320" x2="120" y2="320" stroke="#6366f1" strokeWidth="1.5" />
                            <line x1="120" y1="320" x2="70" y2="150" stroke="#f59e0b" strokeWidth="1.5" />
                            <line x1="70" y1="150" x2="200" y2="60" stroke="#6366f1" strokeWidth="1.5" />
                          </g>

                          {/* Step Nodes (Visible Real-time Descriptions) */}
                          {[
                            { x: 200, y: 60, color: '#6366f1', title: 'Ingestion', desc: 'Analyzing sacred texts', tx: -60, ty: -85 },
                            { x: 330, y: 150, color: '#f59e0b', title: 'Retrieval', desc: 'Semantic search', tx: 35, ty: -30 },
                            { x: 280, y: 320, color: '#6366f1', title: 'Re-ranker', desc: 'Deep relevance', tx: 35, ty: 15 },
                            { x: 120, y: 320, color: '#f59e0b', title: 'Synthesis', desc: 'AI generation', tx: -155, ty: 15 },
                            { x: 70, y: 150, color: '#6366f1', title: 'Citation', desc: 'Source mapping', tx: -155, ty: -30 },
                          ].map((node, i) => (
                            <g key={i} className="group/node">
                              <circle cx={node.x} cy={node.y} r="14" fill={node.color} className="opacity-10" />
                              <circle cx={node.x} cy={node.y} r="6" fill={node.color} />

                              {/* Permanent Description Box (Rounded & Larger) */}
                              <foreignObject x={node.x + node.tx} y={node.y + node.ty} width="120" height="70" className="pointer-events-none">
                                <div className="bg-white/10 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center shadow-2xl animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                                  <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1 shadow-sm" style={{ color: node.color }}>{node.title}</p>
                                  <p className="text-[8px] sm:text-[9px] text-gray-600 dark:text-gray-300 leading-tight font-bold">{node.desc}</p>
                                </div>
                              </foreignObject>
                            </g>
                          ))}

                          {/* Central Core (The EE Logo) */}
                          <g>
                            <circle cx="200" cy="200" r="45" className="fill-white dark:fill-[#0a0a0f] stroke-indigo-500/20" strokeWidth="2" />
                            <circle cx="200" cy="200" r="35" className="fill-gray-900 dark:fill-white shadow-2xl" />

                            {/* EE Text Representation */}
                            <text x="200" y="212" textAnchor="middle" className="fill-white dark:fill-gray-900 font-black tracking-tighter" style={{ fontSize: '32px' }}>
                              E<tspan className="fill-amber-500 opacity-80">E</tspan>
                            </text>

                            {/* Inner pulsing ring */}
                            <circle cx="200" cy="200" r="50" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="5 5" className="animate-[spin_30s_linear_infinite]" />
                          </g>

                          {/* Connection Particles (Circular real-time flow) */}
                          {[0, 1, 2, 3, 4].map((p) => (
                            <g key={p}>
                              {/* Main Circular Flow Particle */}
                              <circle r="4" fill="#6366f1" className="shadow-[0_0_15px_#6366f1]">
                                <animateMotion
                                  dur={`${5 + p}s`}
                                  repeatCount="indefinite"
                                  path="M 200,60 A 140,140 0 1,1 199,60"
                                  begin={`${p * 1.2}s`}
                                />
                              </circle>
                              {/* Inner Reverse Flow Particle */}
                              <circle r="2.5" fill="#f59e0b" className="shadow-[0_0_10px_#f59e0b]">
                                <animateMotion
                                  dur={`${7 + p}s`}
                                  repeatCount="indefinite"
                                  path="M 200,60 A 140,140 0 1,0 199,60"
                                  begin={`${p * 1.5}s`}
                                />
                              </circle>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spiritual Tracker Showcase Section */}
              <div id="spiritual-tracker-section" className="space-y-16 pt-12">
                <div className="text-center space-y-4 scroll-reveal opacity-0">
                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Spiritual Tracker
                  </h3>
                  <p className="text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto">
                    Quantify the unquantifiable. Monitor your inner growth, maintain your Sadhana (spiritual discipline), and visualize your daily reflections.
                  </p>
                </div>

                <div className="relative px-6 md:px-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Text descriptions */}
                    <div className="space-y-8 text-left order-2 lg:order-1">
                      {[
                        { title: "Journey Analytics", desc: "Visualize your spiritual consistency over time with intricate heatmaps and devotion graphs.", icon: <Activity size={20} />, color: "indigo" },
                        { title: "Sadhana Streaks", desc: "Build consistency by tracking your consecutive days of spiritual discipline, aiming to beat your Max Streak.", icon: <Flame size={20} />, color: "amber" },
                        { title: "Daily Reflections", desc: "Log your mood, epiphanies, and scriptural readings in a beautifully structured digital journal.", icon: <FileText size={20} />, color: "indigo" }
                      ].map((feat, idx) => (
                        <div key={idx} className="group flex items-start gap-6 scroll-reveal opacity-0" style={{ animationDelay: `${idx * 0.15}s` }}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 shadow-lg ${feat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white'}`}>
                            {feat.icon}
                          </div>
                          <div className="flex flex-col pt-1">
                            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-indigo-500 transition-colors">
                              {feat.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-2 max-w-md">
                              {feat.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Visual representation */}
                    <div className="relative order-1 lg:order-2 flex justify-center py-10 lg:py-0">
                      <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-[2.5rem] bg-white/70 dark:bg-[#0f0f15]/80 backdrop-blur-xl border border-indigo-50/60 dark:border-white/[0.05] shadow-[0_30px_60px_rgba(99,102,241,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col p-8 overflow-hidden scroll-reveal opacity-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full"></div>
                        
                        <div className="flex justify-between items-center mb-8 z-10">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">Weekly Devotion</h4>
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-full tracking-widest">Active</span>
                        </div>

                        {/* Faux Graph */}
                        <div className="flex-1 flex items-end gap-3 z-10 mb-6">
                          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="flex-1 bg-gray-100 dark:bg-white/5 rounded-t-lg relative group">
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-80 scroll-reveal-graph-bar" 
                                style={{ height: '0%' }}
                                data-h={h}
                                data-delay={i * 0.1}
                              ></div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 z-10">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Flame size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current Streak</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">12 Days</p>
                          </div>
                        </div>

                        <style>{`
                          @keyframes grow-up {
                            from { height: 0; }
                          }
                        `}</style>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Sanctuary Showcase Section */}
              <div id="voice-sanctuary-section" className="space-y-16 pt-12">
                <div className="text-center space-y-4 scroll-reveal opacity-0">
                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Voice Sanctuary
                  </h3>
                  <p className="text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto">
                    A serene auditory realm where your spoken words weave with timeless wisdom in real-time.
                  </p>
                </div>

                <div className="relative px-6 md:px-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Visual representation */}
                    <div className="relative order-2 lg:order-1 flex justify-center py-10 lg:py-0">
                      <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-[2.5rem] bg-gradient-to-br from-[#0a0a10] to-[#15151e] shadow-[0_0_80px_rgba(245,158,11,0.1)] border border-amber-500/20 flex flex-col items-center justify-center overflow-hidden scroll-reveal opacity-0">
                        <div className="absolute inset-0 bg-amber-500/5 blur-[80px] rounded-full animate-pulse-slow"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-[200px] h-[200px] rounded-full border border-amber-500/10 animate-ping"></div>
                          <div className="absolute w-[140px] h-[140px] rounded-full border border-amber-500/20 animate-pulse-slow"></div>
                          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/40 z-10 animate-bounce">
                            <Mic size={40} />
                          </div>
                        </div>
                        <p className="text-amber-500 mt-12 font-bold tracking-widest uppercase text-sm z-10">Listening...</p>
                      </div>
                    </div>

                    {/* Text descriptions */}
                    <div className="space-y-8 text-left order-1 lg:order-2">
                      {[
                        { title: "Continuous Dialogue", desc: "Speak naturally without pressing buttons. The Sanctuary listens continuously until your thought is complete.", icon: <Zap size={20} />, color: "amber" },
                        { title: "Auditory Empathy", desc: "Responses are spoken back to you with a serene, human-like cadence designed for spiritual reflection.", icon: <Volume2 size={20} />, color: "indigo" },
                        { title: "Sacred Multimedia", desc: "Visual resources, videos, and images organically appear to complement the spoken guidance.", icon: <Flower2 size={20} />, color: "amber" }
                      ].map((feat, idx) => (
                        <div key={idx} className="group flex items-start gap-6 animate-fade-in-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 shadow-lg ${feat.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                            {feat.icon}
                          </div>
                          <div className="flex flex-col pt-1">
                            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-amber-500 transition-colors">
                              {feat.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-2 max-w-md">
                              {feat.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Footer CTA Section */}
              <div id="contact-section" className="pt-32 pb-24 flex flex-col items-center">
                <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-20 animate-fade-in-up">

                  {/* 1. Continue Journey Button (Separated Above) */}
                  <div className="w-full max-w-md">
                    <button
                      onClick={handleProceed}
                      className="group/btn relative w-full h-20 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[2rem] font-black text-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] dark:hover:bg-indigo-500 dark:hover:text-white overflow-hidden shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10 flex items-center justify-center gap-4">
                        {user ? "Continue Your Journey" : "Start Your Journey"} <ChevronRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                      </span>
                    </button>
                  </div>

                  {/* 2. Professional Signature Section */}
                  <div className="w-full relative group mt-8">
                    {/* Glowing Back-drop */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    
                    {/* Glassmorphic Card */}
                    <div className="relative w-full rounded-[2rem] bg-white/70 dark:bg-[#0a0a0f]/80 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
                      
                      {/* Left: Abhijay Parashar */}
                      <div className="flex flex-col items-center md:items-start space-y-3">
                        <div className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
                          Lead Architect
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                          Abhijay Parashar
                        </h3>
                        <a href="mailto:parasharabhijay@gmail.com" className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300 shadow-inner group/mail">
                          <Mail size={14} className="text-amber-500 group-hover/mail:scale-110 transition-transform" />
                          <span className="text-sm font-bold tracking-tight">parasharabhijay@gmail.com</span>
                        </a>
                      </div>

                      {/* Middle: Divider / Logo */}
                      <div className="hidden md:flex flex-col items-center gap-4">
                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 to-amber-500/10 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                          <LogoEE size={28} className="text-indigo-600 dark:text-white" />
                        </div>
                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                      </div>

                      {/* Right: EliteEdge IT */}
                      <div className="flex flex-col items-center md:items-end space-y-2 text-center md:text-right">
                        <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400 uppercase tracking-[0.4em] mb-1">
                          EliteEdge IT
                        </h4>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                          Krysha AI Engine
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-[0.2em] max-w-[200px] mt-2 leading-relaxed">
                          PIONEERING DIVINE INTELLIGENCE
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Subtle Decorative Element */}
                  <div className="w-12 h-1 bg-gray-100 dark:bg-white/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main App */}
      <div className="flex w-full h-full bg-[#f8f9fa] dark:bg-[#0a0a0f] text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) alert(`Selecting file: ${file.name}. (System processing will be implemented next)`);
          }}
        />

        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 bg-white dark:bg-[#12121a] transition-all duration-500 overflow-hidden flex flex-col border-r border-gray-200 dark:border-white/5 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}>
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-3 w-full p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all duration-300 text-sm font-black tracking-tight group shadow-sm hover:shadow-md dark:shadow-none"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Plus size={16} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">New Reflection</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-3 mt-4">Journey History</div>
            <div className="space-y-1">
              {savedChats.length === 0 && (
                <div className="text-sm text-gray-400 dark:text-gray-500 px-3 italic">No past reflections yet.</div>
              )}
              {savedChats.map((chat) => (
                <div key={chat.id} className="relative group">
                  <button
                    onClick={() => loadChat(chat.id)}
                    className={`flex items-center gap-3 w-full p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.02] text-left transition-all duration-300 text-sm ${currentChatId === chat.id ? 'bg-amber-50/50 dark:bg-amber-500/[0.08] text-amber-900 dark:text-amber-200 border-gray-100 dark:border-amber-500/20' : 'text-gray-500 dark:text-gray-400 border-transparent'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${currentChatId === chat.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:bg-amber-500/10 group-hover:text-amber-500'}`}>
                      <MessageSquare size={14} />
                    </div>
                    <span className={`flex-1 truncate transition-colors ${currentChatId === chat.id ? 'font-black tracking-tight' : 'group-hover:text-gray-900 dark:group-hover:text-gray-200 font-medium'}`}>
                      {chat.title}
                    </span>
                    {chat.isLoading && (
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                  </button>

                  {/* Three dots menu - visible on hover */}
                  <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center transition-opacity duration-200 ${activeSessionMenu === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveSessionMenu(activeSessionMenu === chat.id ? null : chat.id); }}
                      className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ${activeSessionMenu === chat.id ? 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-200' : ''}`}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>

                  {/* Delete Dropdown */}
                  {activeSessionMenu === chat.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveSessionMenu(null)} />
                      <div className="absolute right-2 top-10 w-32 bg-white dark:bg-[#1c1c28] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-1 z-50 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                        <button
                          onClick={(e) => handleDeleteSession(e, chat.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-transparent space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              <User size={14} />
              <span className="truncate">{user?.username || user?.email}</span>
            </div>

            <button
              onClick={() => router.push("/tracker")}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all text-sm font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Flower2 size={18} className="text-amber-500 animate-[spin_8s_linear_infinite]" />
                Spiritual Tracker
              </div>
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400 shadow-sm dark:shadow-none border border-transparent hover:border-gray-200 dark:hover:border-white/10"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
                {isDarkMode ? 'Light Realm' : 'Dark Realm'}
              </div>
            </button>

          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full relative w-full min-w-0 bg-gradient-to-b from-[#f8f9fa] to-white dark:from-[#0a0a0f] dark:to-[#12121a]">

          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-white/5 shrink-0 relative bg-white/50 dark:bg-[#0a0a0f]/50 backdrop-blur-md z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
              >
                <Menu size={20} />
              </button>
              <div className="font-bold text-xl flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-300 dark:to-orange-400 tracking-tight">
                  Krysha AI
                </span>
                <span className="bg-amber-100 dark:bg-amber-500/10 text-[10px] px-2 py-0.5 rounded-full text-amber-700 dark:text-amber-400 font-semibold tracking-widest uppercase border border-amber-200 dark:border-amber-500/20">
                  Divine
                </span>
              </div>
              <button
                onClick={() => { setFadeWelcome(false); setShowWelcome(true); }}
                className="ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 flex items-center gap-2 text-xs font-medium"
                title="Go to Sanctuary Home"
              >
                <Home size={18} />
                <span className="hidden md:inline">Home</span>
              </button>
            </div>

            {/* Persona Selector */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex bg-gray-100/80 dark:bg-black/40 backdrop-blur-sm rounded-full p-1 border border-gray-200/50 dark:border-white/5">
              <button
                onClick={() => setMode("neutral")}
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${mode === "neutral" ? "bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
              >
                Scholar
              </button>
              <button
                onClick={() => setMode("krishna")}
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${mode === "krishna" ? "bg-gradient-to-r from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20 text-orange-700 dark:text-orange-300 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
              >
                Lord Krishna
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleVoiceSanctuary}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all shadow-sm shadow-amber-500/5 hover:scale-105 active:scale-95 duration-300"
                title="Enter Real-time Continuous Voice Sanctuary"
              >
                <Mic size={14} className="animate-pulse text-amber-500" />
                <span>Voice Sanctuary</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <MoreHorizontal size={20} className="hidden sm:block" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161622] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50 animate-fade-in-up origin-top-right" style={{ animationDuration: '0.2s' }}>
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 mb-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsDarkMode(!isDarkMode); setIsProfileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {isDarkMode ? 'Light Realm' : 'Dark Realm'}
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-gray-100 dark:border-white/5 mt-1"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Background Ambient Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-purple-500/[0.03] dark:bg-purple-500/[0.05] rounded-full blur-[110px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 scroll-smooth z-10 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" id="chat-container">
            <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">

              {!currentChatId || chatHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center pt-[1vh] pb-4 animate-fade-in-up h-full relative overflow-hidden">
                  <div className="flex flex-col items-center mb-4 w-full">
                    <h1 className="text-5xl font-bold tracking-tight mb-1">
                      <span className="text-gray-900 dark:text-white">krysha</span>
                      <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-light">ai</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-[13px] font-medium tracking-wide text-center opacity-70 uppercase">
                      Divine Wisdom • Timeless Clarity
                    </p>
                  </div>

                  {/* Centered Input Box */}
                  <div className="w-full max-w-3xl mb-6">
                    <div className="relative flex items-end bg-white dark:bg-[#12121a] border border-gray-200/60 dark:border-white/5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] focus-within:ring-4 focus-within:ring-amber-500/5 focus-within:border-amber-500/20 transition-all duration-500">
                      <div className="relative">
                        <button
                          onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
                          className={`p-5 transition-all duration-300 shrink-0 rounded-l-[2.5rem] ${isUploadMenuOpen ? 'text-amber-500 bg-amber-500/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                          <Plus size={22} />
                        </button>

                        {isUploadMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsUploadMenuOpen(false)} />
                            <div className="absolute left-0 top-full mt-2 w-64 bg-[#16161a] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in-up">
                              <button
                                onClick={() => { fileInputRef.current?.click(); setIsUploadMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left text-gray-200"
                              >
                                <Paperclip size={18} className="text-gray-400" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">Upload files or images</div>
                                  <div className="text-[10px] text-gray-500">Open system file window</div>
                                </div>
                              </button>

                              <button
                                onClick={() => { setIsLibraryOpen(true); setIsUploadMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left text-gray-200"
                              >
                                <Globe size={18} className="text-gray-400" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">Knowledge and sources</div>
                                  <div className="text-[10px] text-gray-500">Explore the library</div>
                                </div>
                                <ChevronRight size={14} className="text-gray-500" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>


                      <textarea
                        ref={textareaRef}
                        value={query}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuery(val);
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';

                          if (val.trim()) {
                            const filtered = allSuggestions.filter(s =>
                              s.toLowerCase().includes(val.toLowerCase())
                            );
                            setFilteredSuggestions(filtered);
                            setShowSuggestions(true);
                          } else {
                            setShowSuggestions(false);
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          if (query.trim() && filteredSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        placeholder={isListening ? "Listening..." : placeholders[placeholderIndex]}
                        className="w-full bg-transparent py-4 px-2 text-gray-800 dark:text-gray-100 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-lg resize-none max-h-[200px] scrollbar-none transition-all duration-500 disabled:opacity-50"
                        rows={1}
                      />

                      {/* Dynamic Suggestions Dropdown */}
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setShowSuggestions(false)} />
                          <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-[#161622] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-[70] animate-fade-in-up overflow-hidden">
                            {filteredSuggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setQuery(suggestion);
                                  setShowSuggestions(false);
                                  handleAsk(suggestion);
                                }}
                                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                              >
                                <Search size={16} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {/* Highlight the matching part */}
                                  <span className="font-bold">{suggestion.substring(0, query.length)}</span>
                                  <span>{suggestion.substring(query.length)}</span>
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-2 p-2 shrink-0">
                        <button
                          onClick={toggleVoiceInput}
                          className={`p-2.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button
                          onClick={() => handleAsk()}
                          disabled={!query.trim() || isLoading}
                          className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 ${query.trim() && !isLoading
                            ? 'bg-white text-black hover:scale-105 active:scale-95'
                            : 'bg-white/5 text-gray-600'
                            }`}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Suggestion Grid - Reverted to Original Questions */}
                  <div className="w-full max-w-4xl px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { q: "Gita's Core Shloka", desc: "Meaning of 'Karmanye Vadhikaraste'?", icon: <Sparkles size={18} className="text-amber-500" /> },
                        { q: "The Loyalty of Karna", desc: "Why is he known as the 'Daan-Veer'?", icon: <Moon size={18} className="text-indigo-400" /> },
                        { q: "Bhishma's Vow", desc: "Impact of his celibacy on the Kuru dynasty.", icon: <Globe size={18} className="text-purple-400" /> },
                        { q: "Krishna's Guidance", desc: "Arjuna's inner conflict on the battlefield.", icon: <Zap size={18} className="text-orange-400" /> }
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(item.desc);
                            handleAsk(item.desc);
                          }}
                          className="group text-left p-5 rounded-[2rem] bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] hover:border-amber-500/30 hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 flex items-center gap-5 hover:-translate-y-1"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white transition-all duration-500 shadow-inner">
                            {item.icon}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-[15px] font-black text-gray-900 dark:text-white truncate tracking-tight mb-0.5">{item.q}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium opacity-70">{item.desc}</div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 dark:text-gray-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div key={index} className={`flex gap-4 sm:gap-6 group animate-fade-in-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`} style={{ animationDuration: '0.4s' }}>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                      ${msg.role === 'user'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-purple-900/40 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)] dark:shadow-[0_0_15px_rgba(251,191,36,0.05)]'}`}
                    >
                      {msg.role === 'user' ? <User size={20} strokeWidth={1.5} /> : <LogoEE size={18} />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {msg.role === 'user' ? (user?.username || 'You') : 'Krysha'}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-light">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      <div className={`px-6 py-5 rounded-[2rem] text-[15px] leading-relaxed whitespace-pre-wrap transition-all duration-300 shadow-sm
                        ${msg.role === 'user'
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-md shadow-xl shadow-gray-900/10 dark:shadow-white/5'
                          : 'bg-white dark:bg-[#1a1a24] text-gray-800 dark:text-gray-100 rounded-tl-md border border-gray-100 dark:border-white/[0.03] group-hover:border-amber-500/20 group-hover:shadow-[0_10px_40px_rgba(251,191,36,0.05)]'}`}
                      >
                        {editingIndex === index ? (
                          <div className="flex flex-col gap-3 min-w-[200px] sm:min-w-[400px]">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-white/10 dark:bg-black/10 border border-white/20 dark:border-black/20 rounded-xl p-3 text-sm focus:ring-1 focus:ring-amber-500 outline-none resize-none min-h-[80px]"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-amber-600 transition-colors flex items-center gap-1.5"
                              >
                                <Check size={10} />
                                Save & Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          renderMessageContent(msg.content)
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {msg.role === 'user' && editingIndex !== index && (
                          <button
                            onClick={() => handleEdit(index, msg.content)}
                            className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                        )}

                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => downloadAsPDF(msg, index)}
                            className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all bg-amber-500/5 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/10 group/dl"
                          >
                            <Download size={12} className="group-hover/dl:scale-110 transition-transform" />
                            Download as PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-4 sm:gap-6 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-purple-900/40 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                    <LogoEE size={20} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 px-1">EliteEdge Krysha</div>
                    <div className="px-5 py-4 rounded-2xl bg-white dark:bg-[#161622] text-gray-500 dark:text-gray-400 rounded-tl-sm border border-gray-100 dark:border-white/5 flex items-center gap-3 shadow-sm">
                      <span className="text-sm font-medium italic">thinking...</span>
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area - Only visible when chat has history */}
          {currentChatId && chatHistory.length > 0 && (
            <div className="p-4 sm:p-6 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa] to-transparent dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-transparent absolute bottom-0 left-0 right-0 z-20 animate-fade-in-up">
              <div className="max-w-4xl mx-auto">
                <div className="relative flex items-end bg-white dark:bg-[#161622] border border-gray-200 dark:border-white/10 rounded-3xl shadow-lg dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/30 transition-all duration-300">

                  <div className="relative">
                    <button
                      onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
                      className={`p-4 transition-colors shrink-0 ${isUploadMenuOpen ? 'text-amber-500 bg-white/5' : 'text-gray-400 hover:text-amber-500'}`}
                    >
                      <Plus size={22} />
                    </button>

                    {isUploadMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsUploadMenuOpen(false)} />
                        <div className="absolute left-0 bottom-full mb-2 w-72 bg-[#16161a] border border-white/10 rounded-2xl shadow-2xl py-3 z-50 animate-fade-in-up">
                          <button
                            onClick={() => { fileInputRef.current?.click(); setIsUploadMenuOpen(false); }}
                            className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors text-left text-gray-200"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <Paperclip size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-bold">Upload pdfs images</div>
                              <div className="text-[10px] text-gray-500">Select from your system</div>
                            </div>
                          </button>

                          <button
                            onClick={() => { setIsLibraryOpen(true); setIsUploadMenuOpen(false); }}
                            className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors text-left text-gray-200"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                              <Globe size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-bold">Knowledge and sources</div>
                              <div className="text-[10px] text-gray-500">Explore the library section</div>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuery(val);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';

                      if (val.trim()) {
                        const filtered = allSuggestions.filter(s =>
                          s.toLowerCase().includes(val.toLowerCase())
                        );
                        setFilteredSuggestions(filtered);
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (query.trim() && filteredSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder={isListening ? "Listening..." : placeholders[placeholderIndex]}
                    className="w-full bg-transparent py-4 px-2 text-gray-800 dark:text-gray-100 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-[15px] resize-none max-h-[150px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 transition-all duration-500 disabled:opacity-50"
                    disabled={isLoading}
                    rows={1}
                  />

                  {/* Dynamic Suggestions Dropdown for Chat Mode */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-[60]" onClick={() => setShowSuggestions(false)} />
                      <div className="absolute left-0 bottom-full mb-2 w-full bg-white dark:bg-[#161622] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-[70] animate-fade-in-up overflow-hidden">
                        {filteredSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setQuery(suggestion);
                              setShowSuggestions(false);
                              handleAsk(suggestion);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                          >
                            <Search size={16} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-bold">{suggestion.substring(0, query.length)}</span>
                              <span>{suggestion.substring(query.length)}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-1 p-2 shrink-0">
                    <button
                      onClick={toggleVoiceInput}
                      className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bg-red-50 text-red-500 dark:bg-red-500/10 animate-pulse border border-red-200 dark:border-red-900' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'}`}
                      title={isListening ? "Stop Voice Input" : "Voice Input"}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button
                      onClick={() => handleAsk()}
                      disabled={!query.trim() || isLoading}
                      className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${query.trim() && !isLoading
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      <Send size={18} className={query.trim() && !isLoading ? "ml-1" : ""} />
                    </button>
                  </div>
                </div>
                <div className="text-center mt-3 text-[11px] text-gray-400 dark:text-gray-500 font-light tracking-wide">
                  EliteEdge Krysha seeks truth but may not be infallible. Embrace wisdom with discernment.
                </div>
              </div>
            </div>
          )}
          {/* Compact & Professional Library Modal */}
          {isLibraryOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10 lg:p-16">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setIsLibraryOpen(false)} />
              <div className="relative w-full max-w-6xl h-full max-h-[80vh] bg-[#fafafa] dark:bg-[#0d0d12] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col animate-scale-in">

                {/* Header */}
                <div className="relative p-6 px-10 border-b border-gray-100 dark:border-white/5 flex items-center justify-between z-10 bg-white/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Knowledge Sanctuary</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sacred archives of eternal wisdom</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLibraryOpen(false)}
                    className="p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:bg-gray-200 dark:hover:bg-white/10"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                {/* Grid Content */}
                <div className="relative flex-1 overflow-y-auto p-10 z-10 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {knowledge.map((item) => (
                      <div key={item.id} className="group relative bg-white dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/5 rounded-[2rem] p-6 hover:border-amber-500/40 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white transition-all duration-500 shadow-sm">
                            <LogoEE size={22} />
                          </div>
                          <div className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-all duration-500">Record</div>
                        </div>

                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 line-clamp-1 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-6 line-clamp-3 font-medium opacity-80">
                          {item.summary || "Divine wisdom contained within the sacred records of the ancients."}
                        </p>

                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-white/10 text-white dark:text-gray-100 font-black text-xs group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-gray-900/10 dark:shadow-none hover:shadow-amber-500/30"
                        >
                          Explore Sacred Record <ChevronRight size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="relative p-5 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex items-center justify-center z-10">
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] font-black">
                    EliteEdge Krysha • Divine Intelligence
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Video Demo Modal */}
          {showDemo && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowDemo(false)} />
              <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)] animate-scale-in">
                <button
                  onClick={() => setShowDemo(false)}
                  className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <X size={24} />
                </button>
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/hYZKrPOyEYk?autoplay=1"
                  title="Krysha AI Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          {/* Real-time Continuous Voice Sanctuary Overlay */}
          {isVoiceSanctuaryActive && (
            <div className="fixed inset-0 z-[250] bg-[#050508] p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 animate-fade-in font-sans h-screen w-screen overflow-hidden">
              
              {/* Left Panel: Voice Sanctuary UI */}
              <div className="relative w-full lg:w-[40%] rounded-[2rem] border border-white/5 bg-[#0a0a10] overflow-hidden flex flex-col flex-shrink-0 h-[45vh] lg:h-full shadow-2xl">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>

                {/* Top Bar */}
                <div className="p-6 flex justify-between items-center z-10 relative">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5">
                    <Flower2 size={16} className="text-amber-500" />
                    <span className="text-amber-500/90 text-sm font-semibold tracking-wide">Voice Sanctuary</span>
                  </div>
                  <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                {/* Center Mic Animation */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
                  <div className="relative flex items-center justify-center">
                    {/* Concentric rings */}
                    <div className={`absolute w-[280px] h-[280px] rounded-full border border-amber-500/10 ${voiceState === "listening" ? "animate-ping" : ""}`} />
                    <div className={`absolute w-[200px] h-[200px] rounded-full border border-amber-500/20 ${voiceState !== "idle" ? "animate-pulse-slow" : ""}`} />
                    <div className={`absolute w-36 h-36 rounded-full bg-amber-500/5 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.15)] ${voiceState === "speaking" ? "animate-pulse" : ""}`}>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/40">
                        <Mic size={32} className={voiceState === "speaking" ? "animate-bounce" : ""} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 lg:mt-32 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-amber-500 tracking-wide">
                      {voiceState === "listening" ? "Listening..." : 
                       voiceState === "thinking" ? "Reflecting..." : 
                       voiceState === "speaking" ? "Speaking..." : "Sanctuary"}
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm font-medium">I'm here with you</p>
                    {voiceState === "speaking" && voiceResponseText.includes("Welcome to the Voice Sanctuary") && (
                      <p className="text-amber-500/80 mt-4 text-sm font-medium px-6 animate-fade-in">{voiceResponseText}</p>
                    )}
                  </div>
                </div>
                
                {/* Bottom Info Pill */}
                <div className="p-4 lg:p-8 z-10 mt-auto relative flex justify-center">
                  <div className="rounded-full border border-white/10 bg-[#15151e]/80 backdrop-blur-md py-4 px-6 flex items-center justify-center gap-4 shadow-lg shadow-black/50">
                    <p className="text-sm text-gray-300 leading-snug font-medium text-center">Speak from your heart,<br/>I'm here to listen and guide you.</p>
                  </div>
                </div>
              </div>
              
              {/* Right Panel: Chat & Resources */}
              <div className="flex-1 rounded-[2rem] border border-white/5 bg-[#0a0a10] flex flex-col relative overflow-hidden h-full shadow-2xl">
                {/* Top Bar */}
                <div className="p-6 flex justify-between items-center border-b border-white/5 relative z-10">
                  <div className="flex items-center gap-3">
                    <Sparkles size={24} className="text-amber-500 fill-amber-500" />
                    <div>
                      <h3 className="font-bold text-amber-500 text-lg leading-none">Krysha AI</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1">Your Spiritual Companion</p>
                    </div>
                  </div>
                  <button onClick={toggleVoiceSanctuary} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <Menu size={18} />
                  </button>
                </div>
                
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-10">
                  {/* User Message */}
                  {voiceTranscript && voiceTranscript !== "Listening for your voice..." && voiceTranscript !== "Say something wise..." && (
                    <div className="w-full bg-[#15151e] rounded-[1.5rem] p-5 flex items-start gap-4 border border-white/5 shadow-md">
                      <div className="w-10 h-10 rounded-full bg-[#20202a] flex-shrink-0 flex items-center justify-center border border-white/10">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium">{voiceTranscript}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-white/10 transition-colors">
                        <Pencil size={14} className="text-gray-500" />
                      </div>
                    </div>
                  )}
                  
                  {/* Assistant Response */}
                  {voiceResponseText && !voiceResponseText.includes("Welcome to the Voice Sanctuary") && (
                    <div className="w-full flex flex-col gap-6 animate-fade-in">
                      {/* Main Answer Bubble */}
                      <div className="relative w-full bg-gradient-to-b from-[#15151e] to-[#0a0a0f] rounded-3xl p-6 md:p-8 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.03)] overflow-hidden">
                        {/* Left glowing edge */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/0 via-amber-500 to-amber-500/0 opacity-70"></div>
                        
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex-shrink-0 flex items-center justify-center border border-amber-500/30 shadow-inner">
                            <Heart size={16} className="text-amber-500 fill-amber-500/50" />
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className="font-bold text-amber-500 text-lg mb-4 tracking-wide">I hear you.</h4>
                            <div className="text-gray-300 text-sm md:text-base leading-loose space-y-4 font-medium">
                              {(() => {
                                let cleanResponse = voiceResponseText;
                                const separator = "Please refer to the multimedia resources below for further guidance.";
                                if (voiceResponseText.includes(separator)) {
                                  cleanResponse = voiceResponseText.split(separator)[0].trim();
                                }
                                return renderMessageContent(cleanResponse);
                              })()}
                            </div>
                            
                            <div className="mt-8 flex items-center justify-center gap-4 text-amber-500/30">
                              <div className="h-px w-16 bg-amber-500/20"></div>
                              <Flower2 size={16} />
                              <div className="h-px w-16 bg-amber-500/20"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multimedia Cards */}
                      {(() => {
                        let videosLink: any = null;
                        let imagesLink: any = null;
                        const separator = "Please refer to the multimedia resources below for further guidance.";
                        if (voiceResponseText.includes(separator)) {
                          const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
                          let match;
                          while ((match = linkRegex.exec(voiceResponseText)) !== null) {
                            if (match[1].includes("Videos")) videosLink = { title: match[1], url: match[2] };
                            if (match[1].includes("Images")) imagesLink = { title: match[1], url: match[2] };
                          }
                        }
                        if (!videosLink && !imagesLink) return null;
                        return (
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-4 text-gray-400 px-2">
                              <FileText size={16} className="text-indigo-400" />
                              <span className="text-sm font-semibold tracking-wide text-indigo-200">Resources for you</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {videosLink && (
                                <a href={videosLink.url} target="_blank" rel="noopener noreferrer" className="bg-[#15151e] border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.02] group shadow-lg">
                                  <div className="flex flex-col">
                                    <span className="text-gray-200 font-bold text-sm flex items-center gap-2">
                                      <span className="text-lg">▶️</span> Hey Videos
                                    </span>
                                    <span className="text-gray-500 text-xs mt-1 font-medium">Helpful guidance & stories</span>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-600 group-hover:text-amber-500 transition-colors" />
                                </a>
                              )}
                              {imagesLink && (
                                <a href={imagesLink.url} target="_blank" rel="noopener noreferrer" className="bg-[#15151e] border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.02] group shadow-lg">
                                  <div className="flex flex-col">
                                    <span className="text-gray-200 font-bold text-sm flex items-center gap-2">
                                      <span className="text-lg">🖼️</span> Hey Images
                                    </span>
                                    <span className="text-gray-500 text-xs mt-1 font-medium">Inspiring visuals for you</span>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-600 group-hover:text-amber-500 transition-colors" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                
                {/* Bottom Input Area */}
                <div className="p-6 bg-[#0a0a10] border-t border-white/5">
                  <div className="relative flex items-center">
                    <div className="absolute left-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <MessageSquare size={14} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={voiceInputText}
                      onChange={(e) => setVoiceInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitVoiceSanctuaryText();
                      }}
                      placeholder="Type or speak your thoughts..." 
                      className="w-full bg-[#15151e] border border-white/10 rounded-2xl py-4 pl-16 pr-16 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors shadow-inner"
                    />
                    <button 
                      onClick={() => {
                        if (voiceState === "listening") {
                           if (voiceRecognitionRef.current) voiceRecognitionRef.current.stop();
                           setVoiceState("idle");
                        } else {
                           startVoiceSanctuaryListening();
                        }
                      }}
                      className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${voiceState === "listening" ? "bg-red-500 text-white" : "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-amber-500/20"}`}
                    >
                      {voiceState === "listening" ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>Peace</span> • <span>Guidance</span> • <span>Presence</span> • <span>Always with you</span> <Heart size={10} className="ml-1 text-amber-500/50" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}