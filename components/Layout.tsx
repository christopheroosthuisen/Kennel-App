import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, Bell, Search, ShoppingCart, HelpCircle, User, LayoutDashboard, 
  Calendar, Dog, CreditCard, FileText, Settings, ChevronLeft, ChevronRight, 
  Sparkles, X, Plus, LogOut, Command, GitBranch, MessageSquare,
  Layers, Users, PieChart, ChevronDown, CalendarRange, BarChart3, Briefcase, Clock,
  ArrowRight, GraduationCap, MessageCircle, HeartPulse, Megaphone,
  CheckSquare, Play, Bot, Terminal
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn, Button, Input, Badge, Tabs, Card, SearchInput } from './Common';
import { MOCK_CHANNELS, MOCK_AGENTS } from '../constants';
import { AiAgent } from '../types';
import { useData } from './DataContext';
import { useCommunication } from './Messaging';

// --- Menu Configuration ---

type NavItemConfig = {
  type: 'link' | 'group';
  path?: string;
  label: string;
  icon: any;
  children?: { label: string; path: string; icon: any; badge?: number }[];
  badge?: number;
};

const MENU_ITEMS: NavItemConfig[] = [
  { type: 'link', path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { 
    type: 'group', 
    label: 'Operations', 
    icon: Layers, 
    children: [
      { label: 'Care Dashboard', path: '/care', icon: HeartPulse },
      { label: 'Service Tasks', path: '/services', icon: CheckSquare },
      { label: 'Reservations', path: '/reservations', icon: Calendar },
      { label: 'Facility Calendar', path: '/calendar', icon: CalendarRange },
      { label: 'Group Classes', path: '/classes', icon: GraduationCap },
      { label: 'Point of Sale', path: '/pos', icon: CreditCard },
      { label: 'Pupdates', path: '/report-cards', icon: FileText }, 
    ]
  },
  { 
    type: 'group', 
    label: 'Clients', 
    icon: Users, 
    children: [
      { label: 'Directory', path: '/owners-pets', icon: Dog },
      { label: 'Communication', path: '/messages', icon: MessageSquare },
      { label: 'Marketing Hub', path: '/marketing', icon: Megaphone },
    ]
  },
  { 
    type: 'group', 
    label: 'Team & Staff', 
    icon: Briefcase, 
    children: [
      { label: 'Team Chat', path: '/team/chat', icon: MessageCircle, badge: 3 },
      { label: 'Schedule & Tasks', path: '/team', icon: CalendarRange },
      { label: 'Time Clock', path: '/team?tab=clock', icon: Clock },
    ]
  },
  { 
    type: 'group', 
    label: 'Management', 
    icon: PieChart, 
    children: [
      { label: 'Analytics', path: '/reports', icon: BarChart3 },
      { label: 'Automations', path: '/automations', icon: GitBranch },
      { label: 'Settings', path: '/admin', icon: Settings },
    ]
  },
];

const NavLink = ({ icon: Icon, label, path, collapsed, active, badge }: { icon: any, label: string, path: string, collapsed: boolean, active: boolean, badge?: number }) => (
  <Link 
    to={path}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group relative",
      active ? "bg-primary-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
    title={collapsed ? label : undefined}
  >
    <div className="relative">
       <Icon size={20} className={cn("min-w-[20px] shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
       {badge && collapsed && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-slate-900"></span>
       )}
    </div>
    {!collapsed && (
       <div className="flex-1 flex justify-between items-center overflow-hidden">
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all animate-in fade-in slide-in-from-left-2 duration-200">{label}</span>
          {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{badge}</span>}
       </div>
    )}
    
    {collapsed && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

const NavGroup = ({ item, collapsed, currentPath }: { item: NavItemConfig, collapsed: boolean, currentPath: string }) => {
  const isChildActive = item.children?.some(child => {
    const childPathBase = child.path.split('?')[0];
    const currentPathBase = currentPath.split('?')[0];
    return currentPathBase === childPathBase || currentPathBase.startsWith(childPathBase);
  });
  
  const [isOpen, setIsOpen] = useState(isChildActive);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  if (collapsed) {
    return (
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button 
          className={cn(
            "w-full flex items-center justify-center py-2.5 rounded-md transition-all",
            isChildActive ? "bg-slate-800 text-primary-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
        >
          <item.icon size={20} />
        </button>

        {isHovered && (
          <div className="absolute left-full top-0 ml-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="px-3 py-1 mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
            {item.children?.map(child => {
              const isActive = currentPath === child.path.split('?')[0];
              return (
                <Link 
                  key={child.path}
                  to={child.path}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors",
                    isActive && "bg-primary-600/10 text-primary-400 border-l-2 border-primary-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                     <child.icon size={16} />
                     <span>{child.label}</span>
                  </div>
                  {child.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{child.badge}</span>}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all group text-slate-400 hover:text-white hover:bg-slate-800/50",
          isChildActive && !isOpen && "text-white bg-slate-800"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon size={20} className={cn("min-w-[20px]", isChildActive ? "text-primary-400" : "group-hover:text-white")} />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="space-y-1 pl-4 relative animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="absolute left-[21px] top-0 bottom-2 w-px bg-slate-800" />
          {item.children?.map(child => {
            const isActive = currentPath === child.path.split('?')[0];
            return (
              <Link
                key={child.path}
                to={child.path}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md transition-all relative z-10 text-sm",
                  isActive 
                    ? "text-primary-400 bg-slate-800 font-medium" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", isActive ? "bg-primary-500" : "bg-slate-600")} />
                   <span>{child.label}</span>
                </div>
                {child.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{child.badge}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AppLayout = ({ children, showAI, toggleAI }: { children?: React.ReactNode, showAI: boolean, toggleAI: () => void }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data Context Hooks
  const { owners, pets, reservations, notifications } = useData();
  const { openCompose } = useCommunication();

  // AI Panel State
  const [aiTab, setAiTab] = useState('chat');
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [agentResult, setAgentResult] = useState<React.ReactNode | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick Nav Hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickNavOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setQuickNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll logs & chat
  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs, aiMessages]);

  // --- AI Logic ---
  const processAiCommand = (input: string) => {
    const lower = input.toLowerCase();
    setAiMessages(prev => [...prev, { role: 'user', text: input }]);
    setAiInput('');

    setTimeout(() => {
      // 1. Navigation
      if (lower.includes('go to') || lower.includes('open') || lower.includes('view')) {
        let response = "Navigating...";
        if (lower.includes('reservation')) { navigate('/reservations'); response = "Opening Reservations."; }
        else if (lower.includes('dashboard')) { navigate('/'); response = "Going to Dashboard."; }
        else if (lower.includes('calendar')) { navigate('/calendar'); response = "Opening Calendar."; }
        else if (lower.includes('setting') || lower.includes('admin')) { navigate('/admin'); response = "Opening Admin Settings."; }
        else if (lower.includes('message')) { navigate('/messages'); response = "Opening Messages."; }
        setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
        return;
      }

      // 2. Data Lookup
      if (lower.includes('search') || lower.includes('find') || lower.includes('where')) {
        const nameMatch = input.match(/(?:search|find|where is) (.+)/i);
        const name = nameMatch ? nameMatch[1].trim() : '';
        
        if (name) {
          const foundPet = pets.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
          const foundOwner = owners.find(o => o.name.toLowerCase().includes(name.toLowerCase()));
          
          if (foundPet) {
             navigate(`/owners-pets?id=${foundPet.id}&type=pets`);
             setAiMessages(prev => [...prev, { role: 'ai', text: `Found pet ${foundPet.name}. Opening profile.` }]);
          } else if (foundOwner) {
             navigate(`/owners-pets?id=${foundOwner.id}&type=owners`);
             setAiMessages(prev => [...prev, { role: 'ai', text: `Found owner ${foundOwner.name}. Opening profile.` }]);
          } else {
             setAiMessages(prev => [...prev, { role: 'ai', text: `I couldn't find "${name}" in the database.` }]);
          }
        } else {
           setAiMessages(prev => [...prev, { role: 'ai', text: "Who are you looking for?" }]);
        }
        return;
      }

      // 3. Draft Message
      if (lower.includes('draft') || lower.includes('email') || lower.includes('text')) {
         openCompose();
         setAiMessages(prev => [...prev, { role: 'ai', text: "I've opened the message composer for you." }]);
         return;
      }

      // Default
      setAiMessages(prev => [...prev, { role: 'ai', text: "I can help you navigate, find records, or draft messages. Try 'Go to reservations' or 'Find Rex'." }]);
    }, 600);
  };

  // Run Agent Simulation (Visual only for now, but integrated)
  const runAgent = (agent: AiAgent) => {
    setRunningAgent(agent.id);
    setAgentLogs([`Initializing ${agent.name}...`]);
    setAgentResult(null);

    const steps = ["Scanning database...", "Analyzing records...", "Processing rules...", "Finalizing output..."];
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setAgentLogs(prev => [...prev, `> ${steps[stepIndex]}`]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setRunningAgent(null);
        setAgentLogs(prev => [...prev, `> Task Complete.`]);
        
        if (agent.id === 'vac-agent') {
           setAgentResult(
              <div className="space-y-3">
                 <div className="bg-amber-50 p-3 rounded border border-amber-100 text-xs">Found <strong>3 pets</strong> with expired vaccines.</div>
                 <div className="flex gap-2">
                    <Button size="sm" className="w-full text-xs" onClick={() => navigate('/reports?reportId=ani_vax')}>View Report</Button>
                 </div>
              </div>
           );
        } else {
           setAgentResult(
              <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                 Action completed successfully.
              </div>
           );
        }
      }
    }, 800);
  };

  // Filter Logic for Quick Nav
  const searchResults = useMemo(() => {
    if (!searchTerm) return null;
    const term = searchTerm.toLowerCase();
    const pages = MENU_ITEMS.flatMap(item => {
      const items = item.type === 'group' ? item.children || [] : [item];
      return items.filter(i => i.label.toLowerCase().includes(term));
    });
    const foundOwners = owners.filter(o => o.name.toLowerCase().includes(term) || o.email.includes(term));
    const foundPets = pets.filter(p => p.name.toLowerCase().includes(term));
    const foundRes = reservations.filter(r => {
      const pet = pets.find(p => p?.id === r.petId);
      const owner = owners.find(o => o?.id === r.ownerId);
      return (r.id.toLowerCase().includes(term) || pet?.name.toLowerCase().includes(term) || owner?.name.toLowerCase().includes(term));
    });
    const channels = MOCK_CHANNELS.filter(c => c.name.toLowerCase().includes(term));
    return { pages, owners: foundOwners, pets: foundPets, reservations: foundRes, channels };
  }, [searchTerm, owners, pets, reservations]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setQuickNavOpen(false);
    setSearchTerm('');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-950 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-900 z-20 shadow-2xl",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/50 bg-slate-950">
            <div className="flex items-center gap-3 text-white font-bold text-xl overflow-hidden w-full">
             <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary-900/20">
               <Dog size={20} className="text-white" />
             </div>
             {!collapsed && (
                <div className="flex flex-col leading-none">
                   <span className="truncate tracking-tight">Partners</span>
                   <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Operations</span>
                </div>
             )}
            </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {MENU_ITEMS.map((item) => (
            <React.Fragment key={item.label}>
              {item.type === 'link' ? (
                <NavLink 
                  icon={item.icon} 
                  label={item.label} 
                  path={item.path!} 
                  collapsed={collapsed} 
                  active={location.pathname === item.path} 
                  badge={item.badge}
                />
              ) : (
                <NavGroup 
                  item={item} 
                  collapsed={collapsed} 
                  currentPath={location.pathname + location.search} 
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800/50 bg-slate-900/50">
           <button 
             onClick={() => setCollapsed(!collapsed)}
             className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
           >
             {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header 
          className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10"
          onDoubleClick={() => setQuickNavOpen(true)}
        >
           <div className="flex items-center gap-6 flex-1">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer hover:text-primary-600 transition-colors">
                  Downtown Facility <ChevronRight size={14}/>
                </span>
             </div>
             <div 
                className="relative w-96 group hidden md:block"
                onClick={() => setQuickNavOpen(true)}
             >
               <SearchInput 
                 readOnly
                 placeholder="Search owners, pets, reservations... (Cmd+K)" 
                 className="w-full"
               />
             </div>
           </div>

           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" title="Help"><HelpCircle size={20} /></Button>
             
             <Button 
                variant="ghost" size="icon" title="POS Cart" className="relative"
                onClick={() => navigate('/pos')}
             >
                <ShoppingCart size={20} />
             </Button>

             <Button 
                variant="ghost" size="icon" title="Notifications" className="relative"
                onClick={() => navigate('/notifications')}
             >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
             </Button>
             
             <div className="h-6 w-px bg-slate-200 mx-2" />

             <Button 
                onClick={toggleAI}
                className={cn(
                  "gap-2 border transition-all",
                  showAI ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50/50"
                )}
             >
               <Sparkles size={16} className={showAI ? "fill-primary-300 text-primary-600" : "text-slate-400"} />
               <span className="hidden sm:inline font-medium">AI Ops</span>
             </Button>

             <div className="ml-2 flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer" onClick={() => navigate('/owners-pets?id=o1&type=owners')}>
                <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-medium text-sm hover:ring-2 hover:ring-slate-300 transition-all">
                  JD
                </div>
             </div>
           </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
      </div>

      {/* AI Operations Center */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-slate-200 flex flex-col",
        showAI ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-primary-50/50">
          <div className="flex items-center gap-2 text-primary-900 font-semibold">
            <Bot size={20} className="text-primary-600 fill-primary-200" />
            <span>Operations Command</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleAI}><X size={18} /></Button>
        </div>

        <div className="px-6 border-b border-slate-100">
           <Tabs 
              activeTab={aiTab} 
              onChange={setAiTab} 
              tabs={[{id: 'chat', label: 'Chat Assistant'}, {id: 'agents', label: 'Active Agents'}]}
           />
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
           {aiTab === 'chat' ? (
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {aiMessages.length === 0 && (
                       <div className="text-center text-slate-400 mt-10 text-sm">
                          <Sparkles size={32} className="mx-auto mb-2 opacity-50"/>
                          <p>Ask me to navigate, search records, or draft messages.</p>
                       </div>
                    )}
                    {aiMessages.map((msg, i) => (
                       <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                          <div className={cn(
                             "max-w-[85%] p-3 rounded-lg text-sm",
                             msg.role === 'user' ? "bg-primary-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                          )}>
                             {msg.text}
                          </div>
                       </div>
                    ))}
                    <div ref={chatEndRef} />
                 </div>
                 <div className="flex gap-2">
                    <Input 
                       value={aiInput} 
                       onChange={(e) => setAiInput(e.target.value)} 
                       onKeyDown={(e) => e.key === 'Enter' && processAiCommand(aiInput)}
                       placeholder="How can I help?" 
                       className="flex-1" 
                    />
                    <Button size="icon" onClick={() => processAiCommand(aiInput)}><ArrowRight size={18} /></Button>
                 </div>
              </div>
           ) : (
              <div className="space-y-4">
                 {runningAgent && (
                    <div className="mb-6 bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-xs shadow-lg border border-slate-700">
                       <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                          <span className="flex items-center gap-2"><Terminal size={12}/> AGENT: {MOCK_AGENTS?.find(a => a?.id === runningAgent)?.name.toUpperCase()}</span>
                          <span className="animate-pulse">●</span>
                       </div>
                       <div ref={logContainerRef} className="h-32 overflow-y-auto space-y-1">
                          {agentLogs.map((log, i) => <div key={i}>{log}</div>)}
                       </div>
                    </div>
                 )}

                 {agentResult && !runningAgent && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4">
                       <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <CheckSquare size={14} className="text-green-500"/> Task Complete
                             </h4>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAgentResult(null)}><X size={14}/></Button>
                          </div>
                          {agentResult}
                       </div>
                    </div>
                 )}

                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available Agents</h3>
                 <div className="grid grid-cols-1 gap-3">
                    {MOCK_AGENTS?.map(agent => (
                       <Card key={agent?.id} className={cn("p-3 hover:border-primary-300 transition-all group", runningAgent === agent?.id ? "opacity-50 pointer-events-none" : "")}>
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 transition-colors">
                                   <agent.icon size={18}/>
                                </div>
                                <div>
                                   <h4 className="font-bold text-slate-800 text-sm">{agent?.name}</h4>
                                   <p className="text-xs text-slate-500 line-clamp-1">{agent?.description}</p>
                                </div>
                             </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                             <span className="text-[10px] text-slate-400">Last run: {agent?.lastRun}</span>
                             <Button size="sm" variant="outline" className="h-7 text-xs gap-1 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200" onClick={() => runAgent(agent)}>
                                <Play size={10}/> {agent?.actionButtonText}
                             </Button>
                          </div>
                       </Card>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Quick Nav Overlay */}
      {quickNavOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQuickNavOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-slate-100 flex items-center gap-3">
               <SearchInput 
                 autoFocus
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Go to page or search owners, pets, reservations... (Cmd+K)" 
                 className="flex-1 text-lg font-medium placeholder:text-slate-400 outline-none border-none shadow-none"
               />
               <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">ESC</span>
             </div>
             
             <div className="p-2 max-h-[60vh] overflow-y-auto">
                {searchResults ? (
                  <div className="space-y-4">
                    {/* Pages */}
                    {searchResults.pages.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Pages</div>
                        {searchResults.pages.map(page => (
                          <div 
                            key={page.path}
                            onClick={() => handleResultClick(page.path!)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-md cursor-pointer group"
                          >
                            <LayoutDashboard size={16} className="text-slate-400 group-hover:text-primary-600"/>
                            <span className="text-sm font-medium text-slate-700">{page.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Channels */}
                    {searchResults.channels.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Team Channels</div>
                        {searchResults.channels.map(channel => (
                          <div 
                            key={channel.id}
                            onClick={() => handleResultClick('/team/chat')}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-md cursor-pointer group"
                          >
                            <MessageCircle size={16} className="text-slate-400 group-hover:text-primary-600"/>
                            <span className="text-sm font-medium text-slate-700">#{channel.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Owners */}
                    {searchResults.owners.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Clients</div>
                        {searchResults.owners.map(owner => (
                          <div 
                            key={owner.id}
                            onClick={() => handleResultClick(`/owners-pets?id=${owner.id}&type=owners`)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-md cursor-pointer group"
                          >
                            <User size={16} className="text-slate-400 group-hover:text-primary-600"/>
                            <div>
                              <div className="text-sm font-medium text-slate-700">{owner.name}</div>
                              <div className="text-xs text-slate-500">{owner.email}</div>
                            </div>
                            <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400"/>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pets */}
                    {searchResults.pets.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Pets</div>
                        {searchResults.pets.map(pet => (
                          <div 
                            key={pet.id}
                            onClick={() => handleResultClick(`/owners-pets?id=${pet.id}&type=pets`)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-md cursor-pointer group"
                          >
                            <Dog size={16} className="text-slate-400 group-hover:text-primary-600"/>
                            <div>
                              <div className="text-sm font-medium text-slate-700">{pet.name}</div>
                              <div className="text-xs text-slate-500">{pet.breed}</div>
                            </div>
                            <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400"/>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reservations */}
                    {searchResults.reservations.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Reservations</div>
                        {searchResults.reservations.map(res => {
                          const pet = pets.find(p => p?.id === res.petId);
                          return (
                            <div 
                              key={res.id}
                              onClick={() => handleResultClick('/reservations')} 
                              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-md cursor-pointer group"
                            >
                              <Calendar size={16} className="text-slate-400 group-hover:text-primary-600"/>
                              <div>
                                <div className="text-sm font-medium text-slate-700">Res #{res.id} - {pet?.name}</div>
                                <div className="text-xs text-slate-500">{new Date(res.checkIn).toLocaleDateString()} - {res.status}</div>
                              </div>
                              <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400"/>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {searchResults.pages.length === 0 && searchResults.owners.length === 0 && searchResults.pets.length === 0 && searchResults.reservations.length === 0 && searchResults.channels.length === 0 && (
                      <div className="text-center p-4 text-slate-500 text-sm">No results found for "{searchTerm}"</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</div>
                    <div className="space-y-1">
                       {[
                         { label: 'New Reservation', icon: Calendar, shortcut: 'N', action: () => navigate('/reservations') },
                         { label: 'Quick Check-In', icon: LogOut, shortcut: 'C', rotate: 180, action: () => navigate('/') },
                         { label: 'Take Payment', icon: CreditCard, shortcut: 'P', action: () => navigate('/pos') },
                       ].map((action, i) => (
                         <div 
                            key={i} 
                            onClick={() => { action.action(); setQuickNavOpen(false); }}
                            className="flex items-center justify-between px-3 py-3 hover:bg-primary-50 hover:text-primary-700 rounded-md cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <action.icon size={18} className={cn("text-slate-500 group-hover:text-primary-600", action.rotate && "rotate-180")} />
                              <span className="font-medium text-slate-700 group-hover:text-primary-800">{action.label}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono group-hover:text-primary-400">Cmd+{action.shortcut}</span>
                         </div>
                       ))}
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};