
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input, Label, cn } from '../components/Common';
import { Dog, ShieldCheck, Zap, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); // Simulated for UI, not stored in this mock
  const { login, signup, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email);
    } else {
      if (!name) return; // Basic validation
      await signup(email, name);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left: Branding & Value Props (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden bg-gradient-to-br from-primary-900 via-slate-900 to-indigo-950">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
              <Dog size={24} />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Partners <span className="text-primary-400">Ops</span></span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-8">
            The Operating System for <span className="text-primary-400 underline decoration-primary-400/30 decoration-4 underline-offset-4">Modern Kennels</span>.
          </h1>
          
          <div className="space-y-8 max-w-md">
            {[
              { icon: Zap, title: "AI-Enhanced Workflow", desc: "Automate report cards and facility management with built-in intelligence." },
              { icon: ShieldCheck, title: "Enterprise Reliability", desc: "Securely manage pet health records, vaccinations, and client billing." },
              { icon: Mail, title: "Smart Communication", desc: "Keep parents updated with automated SMS and email notifications." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                 <div className="h-12 w-12 shrink-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-primary-300 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                    <item.icon size={22} />
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © 2024 Partners Dog Training & Kennel Group. All rights reserved.
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary-500/10 blur-[100px] rounded-full animate-pulse duration-[5000ms]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
         <Card className="w-full max-w-md p-8 border-none shadow-none lg:shadow-xl lg:border lg:border-slate-100">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-900 mb-2">
                 {mode === 'login' ? 'Welcome Back' : 'Start your Free Trial'}
               </h2>
               <p className="text-slate-500 text-sm">
                 {mode === 'login' 
                   ? 'Enter your credentials to access your dashboard.' 
                   : 'Join hundreds of facilities streamlining their operations.'}
               </p>
            </div>

            {error && (
               <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
               {mode === 'signup' && (
                 <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                       <UserIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
                       <Input 
                          placeholder="Jane Doe" 
                          className="pl-10 h-11" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                       />
                    </div>
                 </div>
               )}

               <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                     <Input 
                        type="email" 
                        placeholder="jane@partnersdogs.com" 
                        className="pl-10 h-11" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <div className="flex justify-between">
                     <Label>Password</Label>
                     {mode === 'login' && <a href="#" className="text-xs text-primary-600 font-medium hover:underline">Forgot password?</a>}
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                     <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                     />
                  </div>
               </div>

               <Button className="w-full h-11 text-base bg-primary-600 hover:bg-primary-700 mt-2" disabled={isLoading}>
                  {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
               </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
               {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
               <button 
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); }}
                  className="font-bold text-primary-600 hover:underline"
               >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
               </button>
            </div>
         </Card>
      </div>
    </div>
  );
};
