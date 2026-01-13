
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input, Label, cn } from '../components/Common';
import { Dog, ShieldCheck, Zap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const Auth = () => {
  const [mode, setMode] = useState<'login'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      try {
        await login(email, password); 
      } catch (e) {
        // Error handled in context/state, but now we allow sandbox fallthrough
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Left: Branding & Value Props (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Dog size={24} />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Partners <span className="text-indigo-400">Ops</span></span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-8 tracking-tight">
            The Operating System for <span className="text-indigo-400">Modern Kennels</span>.
          </h1>
          
          <div className="space-y-8 max-w-md">
            {[
              { icon: Zap, title: "AI-Enhanced Workflow", desc: "Automate report cards and facility management with built-in intelligence." },
              { icon: ShieldCheck, title: "Enterprise Reliability", desc: "Securely manage pet health records, vaccinations, and client billing." },
              { icon: Mail, title: "Smart Communication", desc: "Keep parents updated with automated SMS and email notifications." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                 <div className="h-12 w-12 shrink-0 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-lg">
                    <item.icon size={22} />
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{item.desc}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © 2024 Partners Dog Training & Kennel Group. All rights reserved.
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[100px] rounded-full animate-pulse duration-[5000ms]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
         <Card className="w-full max-w-md p-10 border border-slate-200 shadow-xl bg-white rounded-2xl">
            <div className="text-center mb-8">
               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-4 lg:hidden">
                  <Dog size={24} />
               </div>
               <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                 Welcome Back
               </h2>
               <p className="text-slate-600 text-base">
                 Enter your credentials to access your dashboard.
               </p>
               
               <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3 text-left flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <span className="font-bold">Sandbox Mode Active:</span> Login with any email to access the demo environment with mock data.
                  </div>
               </div>
            </div>

            {error && (
               <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-100 font-medium">
                  <AlertCircle size={16} /> {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="space-y-1.5">
                  <Label className="text-slate-700 font-semibold">Email Address</Label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                     <Input 
                        type="email" 
                        placeholder="name@company.com" 
                        className="pl-10 h-11 bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-slate-900" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <div className="flex justify-between">
                     <Label className="text-slate-700 font-semibold">Password</Label>
                     <a href="#" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                     <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-slate-900"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                     />
                  </div>
               </div>

               <Button className="w-full h-11 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 mt-4 transition-all hover:translate-y-[-1px]" disabled={isLoading}>
                  {isLoading ? 'Connecting...' : 'Sign In to Dashboard'}
               </Button>
            </form>
            
            <div className="mt-8 text-center">
               <p className="text-sm text-slate-500">
                  Protected by enterprise-grade security.
               </p>
            </div>
         </Card>
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
