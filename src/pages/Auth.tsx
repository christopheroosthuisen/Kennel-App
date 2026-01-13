
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input, Label, cn } from '../components/Common';
import { Dog, ShieldCheck, Zap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password); 
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2969&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/90 pointer-events-none"></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="flex w-full h-full relative z-10">
        
        {/* Left: Branding & Value Props */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] p-16">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="h-12 w-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                <Dog size={28} />
              </div>
              <span className="text-white font-bold text-3xl tracking-tight">Partners <span className="text-indigo-400">Ops</span></span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight mb-8 tracking-tight drop-shadow-lg">
              The OS for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Modern Kennels</span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-md leading-relaxed mb-12">
              Streamline operations, enhance pet care, and delight owners with an AI-powered management suite designed for the future.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Zap, title: "AI-Native Workflow", desc: "Automated report cards & smart scheduling" },
                { icon: ShieldCheck, title: "Compliance Core", desc: "Digital vaccination tracking & secure records" },
                { icon: Mail, title: "Client Engagement", desc: "Seamless 2-way messaging & automated updates" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                   <div className="h-12 w-12 shrink-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg group-hover:scale-110 group-hover:rotate-3">
                      <item.icon size={20} />
                   </div>
                   <div>
                      <h3 className="text-white font-bold text-lg">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium tracking-widest uppercase">
            © 2024 Partners Dog Training & Kennel Group
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white/5 backdrop-blur-sm lg:bg-white lg:backdrop-blur-none border-l border-white/5 lg:border-none">
           <Card className="w-full max-w-md p-10 border border-white/10 lg:border-slate-200 shadow-2xl bg-white/90 lg:bg-white rounded-3xl backdrop-blur-xl">
              <div className="text-center mb-8">
                 <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 mb-6 lg:hidden shadow-sm">
                    <Dog size={28} />
                 </div>
                 <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                   Welcome Back
                 </h2>
                 <p className="text-slate-500 text-base">
                   Sign in to access your facility dashboard.
                 </p>
                 
                 <div className="mt-6 bg-blue-50/80 border border-blue-100 rounded-xl p-4 text-left flex items-start gap-3 shadow-inner">
                    <InfoIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 leading-snug">
                      <span className="font-bold block mb-1">Sandbox Mode Active</span>
                      Use <span className="font-mono bg-blue-100 px-1 rounded text-blue-700">admin@local</span> / <span className="font-mono bg-blue-100 px-1 rounded text-blue-700">password</span> to explore.
                    </div>
                 </div>
              </div>

              {error && (
                 <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-3 border border-red-100 font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" /> {error}
                 </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1.5">
                    <Label className="text-slate-700 font-semibold ml-1">Email Address</Label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                       <Input 
                          type="email" 
                          placeholder="name@company.com" 
                          className="pl-11 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 rounded-xl transition-all" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                       <Label className="text-slate-700 font-semibold">Password</Label>
                       <a href="#" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                       <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-11 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 rounded-xl transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                       />
                    </div>
                 </div>

                 <Button className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 mt-2 transition-all hover:translate-y-[-2px] hover:shadow-xl rounded-xl" disabled={isLoading}>
                    {isLoading ? 'Connecting...' : (
                      <span className="flex items-center gap-2">Sign In <ArrowRight size={18} className="opacity-80"/></span>
                    )}
                 </Button>
              </form>
              
              <div className="mt-8 text-center flex items-center justify-center gap-2 text-slate-400 text-sm">
                 <ShieldCheck size={14} /> Enterprise-grade security
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

const InfoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);
