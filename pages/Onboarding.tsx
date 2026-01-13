
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input, Label, Textarea, Badge, cn, Select } from '../components/Common';
import { Dog, Building2, MapPin, Zap, Check, Sparkles, LayoutGrid, Users, Info, BedDouble } from 'lucide-react';
import { generateFacilityContent } from '../services/aiService';

export const Onboarding = () => {
  const { user, updateOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    facilityName: '',
    address: '',
    phone: '',
    keywords: '',
    description: '',
    welcomeMessage: '',
    runs: 10,
    suites: 5,
    playrooms: 2
  });

  const handleAIHelp = async () => {
    if (!formData.facilityName || !formData.keywords) {
      alert("Please provide a name and some keywords first!");
      return;
    }
    setIsGenerating(true);
    const content = await generateFacilityContent(formData.facilityName, formData.keywords);
    setFormData(prev => ({ 
      ...prev, 
      description: content.description, 
      welcomeMessage: content.welcomeMessage 
    }));
    setIsGenerating(false);
  };

  const handleComplete = async () => {
    const orgData = {
      id: 'org-' + Math.random().toString(36).substr(2, 9),
      name: formData.facilityName,
      address: formData.address,
      phone: formData.phone,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      description: formData.description,
      welcomeMessage: formData.welcomeMessage,
      capacity: {
        runs: formData.runs,
        suites: formData.suites,
        playrooms: formData.playrooms
      }
    };
    await updateOnboarding(orgData);
  };

  const steps = [
    { id: 1, label: 'Owner Profile', icon: Users },
    { id: 2, label: 'Facility Identity', icon: Building2 },
    { id: 3, label: 'Capacity & Units', icon: LayoutGrid },
    { id: 4, label: 'Review & Launch', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col md:flex-row gap-8">
        {/* Left Nav (Desktop) */}
        <div className="w-full md:w-64 space-y-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Dog size={24} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Partners <span className="text-primary-400">Ops</span></span>
          </div>

          <div className="space-y-2">
            {steps.map((s) => (
              <div 
                key={s.id} 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  step === s.id ? "bg-white/10 text-white border border-white/10" : "text-slate-400"
                )}
              >
                <s.icon size={18} className={step >= s.id ? "text-primary-400" : ""} />
                <span className="text-sm font-semibold">{s.label}</span>
                {step > s.id && <Check size={14} className="ml-auto text-green-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="flex-1 p-8 bg-white/95 backdrop-blur-xl border-none shadow-2xl flex flex-col min-h-[500px]">
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}!</h2>
                  <p className="text-slate-500 mt-1">Let's set up your personal operator profile.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Full Name</Label>
                    <Input defaultValue={user?.name} readOnly className="bg-slate-50" />
                  </div>
                  <div className="space-y-1">
                    <Label>Primary Role</Label>
                    <Select defaultValue="Admin">
                      <option>Admin</option>
                      <option>Facility Manager</option>
                      <option>Owner</option>
                    </Select>
                  </div>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 flex gap-3">
                  <Info className="text-primary-600 shrink-0" size={20} />
                  <p className="text-sm text-primary-800">Your role allows you to configure organization-wide settings like pricing and unit definitions.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Tell us about your facility</h2>
                  <p className="text-slate-500 mt-1">Define your business identity and use AI to craft your brand.</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Facility Name</Label>
                      <Input 
                        placeholder="e.g. Blue Sky Kennels" 
                        value={formData.facilityName}
                        onChange={e => setFormData({...formData, facilityName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Phone Number</Label>
                      <Input 
                        placeholder="(555) 000-0000" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Address</Label>
                    <Input 
                      placeholder="123 Dogwood Ln..." 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="mb-0">Facility Vibe / Keywords</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-indigo-600 gap-2 h-8"
                        onClick={handleAIHelp}
                        disabled={isGenerating}
                      >
                        <Sparkles size={14} className={isGenerating ? "animate-spin" : ""}/>
                        {isGenerating ? 'Generating...' : 'AI Generate Content'}
                      </Button>
                    </div>
                    <Input 
                      placeholder="e.g. Luxury, medical focus, cage-free, urban" 
                      value={formData.keywords}
                      onChange={e => setFormData({...formData, keywords: e.target.value})}
                    />
                    
                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <div>
                        <Label>Dashboard Description</Label>
                        <Textarea 
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          placeholder="Short blurb for your team..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div>
                   <h2 className="text-2xl font-bold text-slate-900">Initial Capacity</h2>
                   <p className="text-slate-500 mt-1">We'll auto-generate your unit list based on these counts.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {[
                     { key: 'runs', label: 'Standard Runs', icon: Building2, color: 'bg-blue-50 text-blue-600' },
                     { key: 'suites', label: 'Luxury Suites', icon: BedDouble, color: 'bg-purple-50 text-purple-600' },
                     { key: 'playrooms', label: 'Play Areas', icon: LayoutGrid, color: 'bg-green-50 text-green-600' }
                   ].map(item => (
                     <div key={item.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="flex items-center gap-4">
                           <div className={cn("p-3 rounded-lg", item.color)}>
                              <item.icon size={24} />
                           </div>
                           <span className="font-bold text-slate-800">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => setFormData({...formData, [item.key]: Math.max(0, (formData as any)[item.key] - 1)})}
                             className="h-8 w-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white"
                           >
                             -
                           </button>
                           <span className="w-8 text-center font-bold">{(formData as any)[item.key]}</span>
                           <button 
                             onClick={() => setFormData({...formData, [item.key]: (formData as any)[item.key] + 1})}
                             className="h-8 w-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-white"
                           >
                             +
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="text-center py-8">
                   <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={40} />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900">You're ready to launch!</h2>
                   <p className="text-slate-500 mt-2">Verify your settings and enter the dashboard.</p>
                </div>

                <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                   <div className="flex justify-between">
                      <span className="text-slate-500">Business Name</span>
                      <span className="font-bold">{formData.facilityName}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500">Capacity</span>
                      <span className="font-bold">{formData.runs + formData.suites} Total Units</span>
                   </div>
                   <div className="flex justify-between border-t border-slate-200 pt-3 mt-3">
                      <span className="text-slate-500">Welcome Msg</span>
                      <span className="italic text-slate-700 text-sm text-right max-w-[250px]">{formData.welcomeMessage || 'Default'}</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={() => setStep(s => s - 1)} 
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={step === 2 && !formData.facilityName}>
                Next Step
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-primary-600 hover:bg-primary-700">
                Launch Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
