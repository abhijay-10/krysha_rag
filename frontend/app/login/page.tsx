"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Loader2, Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/login`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if ("speechSynthesis" in window) {
          const text = "Welcome again to Krysha AI. Glad to have you back.";
          const utterance = new SpeechSynthesisUtterance(text);
          
          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('guy') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('mark') ||
            voice.name.toLowerCase().includes('james') ||
            voice.name.toLowerCase().includes('matthew')
          );
          if (maleVoice) utterance.voice = maleVoice;
          
          utterance.rate = 0.95;
          utterance.pitch = 0.9;
          window.speechSynthesis.speak(utterance);
        }
        login(data.access_token);
      } else {
        setError(data.detail || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#05050a] overflow-hidden relative">
      {/* Dynamic Animated Background (Global) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Left Side: Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 z-10 relative">
        <div className="max-w-[460px] w-full mx-auto animate-fade-in-up">
          <div className="mb-10 flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <Sparkles size={24} />
             </div>
             <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
               EliteEdge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Krysha</span>
             </h1>
          </div>

          <div className="relative p-[1px] rounded-[38px] bg-gradient-to-br from-white/80 via-white/20 to-white/80 dark:from-white/20 dark:via-transparent dark:to-white/20 shadow-2xl shadow-indigo-500/10">
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-3xl p-8 lg:p-10 rounded-[37px] relative overflow-hidden">
              {/* Internal glow effects */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]" />
              
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
                  <div className="h-1 w-10 bg-indigo-600 rounded-full mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Enter your details to access the sanctuary.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="group relative">
                      <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-indigo-600">
                        <Mail size={12} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-6 py-4 bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-semibold"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="group relative">
                      <div className="flex justify-between items-center mb-2 px-1">
                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-indigo-600">
                          <Lock size={12} />
                          Password
                        </label>
                        <Link href="#" className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">Forgot?</Link>
                      </div>
                      <input
                        type="password"
                        required
                        className="w-full px-6 py-4 bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-semibold"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>Sign In <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-slate-500 dark:text-slate-500 font-bold text-sm">
                    New seeker?{" "}
                    <Link
                      href="/signup"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline decoration-2 underline-offset-4"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Content (Sanctuary) */}
      <div className="hidden lg:flex w-1/2 h-full bg-[#0a0a14] relative items-center justify-center p-12 overflow-hidden border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.3)]">
         {/* Animated Visual Background */}
         <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-full h-full bg-[conic-gradient(from_225deg_at_50%_50%,#312e81_0%,#1e1b4b_50%,#0a0a14_100%)] opacity-60" />
            
            {/* Animated Glow Aura behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-600/10 blur-[150px] animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-600/5 blur-[120px] animate-slow-spin" />
         </div>

         <div className="relative z-10 text-center max-w-lg">
            <div className="relative w-72 h-72 mx-auto mb-16 animate-float">
               <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20 animate-pulse-subtle" />
               <Image 
                 src="/peacock_feather.png" 
                 alt="Background Motif" 
                 fill 
                 className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                 sizes="50vw"
                 priority
               />
            </div>
            <h3 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter">Experience spiritual <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-shimmer-text">clarity and truth</span>.</h3>
            <p className="text-indigo-200/60 text-lg font-medium leading-relaxed opacity-70">
               Join thousands of seekers in the digital sanctuary of EliteEdge Krysha. Explore ancient wisdom through modern intelligence.
            </p>
         </div>

         {/* Decorative dots in bottom right */}
         <div className="absolute bottom-12 right-12 grid grid-cols-4 gap-2 opacity-20">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />)}
         </div>
      </div>
    </div>
  );
}
