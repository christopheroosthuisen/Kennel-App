
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, Bell, Search, ShoppingCart, HelpCircle, User, LayoutDashboard, 
  Calendar, Dog, CreditCard, FileText, Settings, ChevronLeft, ChevronRight, 
  Sparkles, X, Plus, LogOut, Command, GitBranch, MessageSquare,
  Layers, Users, PieChart, ChevronDown, CalendarRange, BarChart3, Briefcase, Clock,
  ArrowRight, GraduationCap, MessageCircle, HeartPulse
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn, Button, Input, Badge } from './Common';
import { MOCK_NOTIFICATIONS, MOCK_OWNERS, MOCK_PETS, MOCK_RESERVATIONS, MOCK_CHANNELS } from '../constants';

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
      { label: 'Reservations', path: '/reservations', icon: Calendar },
      { label: 'Facility Calendar', path: '/calendar', icon: CalendarRange },
      { label: 'Group Classes', path: '/classes', icon: GraduationCap },
      { label: 'Point of Sale', path: '/pos', icon: CreditCard },
      { label: 'Report Cards', path: '/report-cards', icon: FileText },
    ]
  },
  { 
    type: 'group', 
    label: 'Clients', 
    icon: Users, 
    children: [
      { label: 'Directory', path: '/owners-pets', icon: Dog },
      { label: 'Communication', path: '/messages', icon: MessageSquare },
    ]
  },
  { 
    type: 'group', 
    label: 'Team & Staff', 
    icon: Briefcase, 
    children: [
      { label: 'Team Chat', path: '/team/chat', icon: MessageCircle, badge: 3 }, // Mock unread count
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

// --- Components ---

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
    
    {/* Collapsed Tooltip (Simple CSS based) */}
    {collapsed && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

const NavGroup = ({ item, collapsed, currentPath }: { item: NavItemConfig, collapsed: boolean, currentPath: string }) => {
  // Check if any child is active to auto-expand or highlight
  const isChildActive = item.children?.some(child => {
    // Handle query params in matching logic
    const childPathBase = child.path.split('?')[0];
    const currentPathBase = currentPath.split('?')[0];
    return currentPathBase === childPathBase || currentPathBase.startsWith(childPathBase);
  });
  
  const [isOpen, setIsOpen] = useState(isChildActive);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-expand if a child becomes active (e.g. navigation from elsewhere)
  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  if (collapsed) {
    // Collapsed Mode: Flyout Menu behavior
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

        {/* Flyout Menu */}
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

  // Expanded Mode: Accordion
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
          {/* Connector Line */}
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
                   {/* Custom dot icon logic or just use text */}
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

  // Filter Logic for Quick Nav
  const searchResults = useMemo(() => {
    if (!searchTerm) return null;
    const term = searchTerm.toLowerCase();

    // Pages
    const pages = MENU_ITEMS.flatMap(item => {
      const items = item.type === 'group' ? item.children || [] : [item];
      return items.filter(i => i.label.toLowerCase().includes(term));
    });

    // Owners
    const owners = MOCK_OWNERS.filter(o => o.name.toLowerCase().includes(term) || o.email.includes(term));

    // Pets
    const pets = MOCK_PETS.filter(p => p.name.toLowerCase().includes(term));

    // Reservations
    const reservations = MOCK_RESERVATIONS.filter(r => {
      const pet = MOCK_PETS.find(p => p.id === r.petId);
      const owner = MOCK_OWNERS.find(o => o.id === r.ownerId);
      return (
        r.id.toLowerCase().includes(term) || 
        pet?.name.toLowerCase().includes(term) ||
        owner?.name.toLowerCase().includes(term)
      );
    });

    // Internal Channels
    const channels = MOCK_CHANNELS.filter(c => c.name.toLowerCase().includes(term));

    return { pages, owners, pets, reservations, channels };
  }, [searchTerm]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setQuickNavOpen(false);
    setSearchTerm('');
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-950 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-900 z-20 shadow-2xl",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Logo Area */}
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

        {/* Navigation Items */}
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
                  currentPath={location.pathname + location.search} // Include search for exact matching
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Sidebar Footer */}
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
        {/* Top Header */}
        <header 
          className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10"
          onDoubleClick={() => setQuickNavOpen(true)}
        >
           {/* Left: Location & Search */}
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
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary-500 transition-colors" size={18} />
               <input 
                 readOnly
                 placeholder="Search owners, pets, reservations... (Cmd+K)" 
                 className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 cursor-text hover:bg-slate-200 transition-colors placeholder:text-slate-400"
               />
             </div>
           </div>

           {/* Right: Actions */}
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" title="Help"><HelpCircle size={20} /></Button>
             
             {/* Cart Button */}
             <Button 
                variant="ghost" size="icon" title="POS Cart" className="relative"
                onClick={() => navigate('/pos')}
             >
                <ShoppingCart size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
             </Button>

             {/* Notification Button */}
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
                  showAI ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                )}
             >
               <Sparkles size={16} className={showAI ? "fill-indigo-300 text-indigo-600" : "text-slate-400"} />
               <span className="hidden sm:inline font-medium">AI Assistant</span>
             </Button>

             <div className="ml-2 flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer" onClick={() => navigate('/owners-pets?id=o1&type=owners')}>
                <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-medium text-sm hover:ring-2 hover:ring-slate-300 transition-all">
                  JD
                </div>
             </div>
           </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-auto bg-slate-50 relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
      </div>

      {/* AI Assistant Panel (Right Side) */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-slate-200 flex flex-col",
        showAI ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-indigo-50/50">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <Sparkles size={18} className="text-indigo-600 fill-indigo-200" />
            <span>AI Copilot</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleAI}><X size={18} /></Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           {/* Contextual Suggestions */}
           <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Smart Suggestions</h3>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg space-y-3">
                 <div className="flex gap-3">
                   <div className="mt-1 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                     <Calendar size={14} />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-indigo-900">Capacity Warning</p>
                     <p className="text-xs text-indigo-700 mt-1">
                       Boarding capacity for next weekend (Nov 3-5) is at 95%. Consider enabling "Waitlist Only" mode for new requests.
                     </p>
                     <div className="mt-3 flex gap-2">
                       <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs h-8">Enable Waitlist</Button>
                       <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-indigo-100 text-xs h-8">Dismiss</Button>
                     </div>
                   </div>
                 </div>
              </div>

               <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-3">
                 <div className="flex gap-3">
                   <div className="mt-1 h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                     <Dog size={14} />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-amber-900">Vaccine Expiring</p>
                     <p className="text-xs text-amber-800 mt-1">
                       Bella's Rabies vaccine expires in 2 days. She is checked in for Boarding until Oct 30.
                     </p>
                     <div className="mt-3 flex gap-2">
                       <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-700 text-xs h-8 border-none">Notify Owner</Button>
                     </div>
                   </div>
                 </div>
              </div>
           </div>

           {/* Drafts */}
           <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ask Copilot</h3>
               <div className="flex gap-2">
                 <Input placeholder="Type a request (e.g., 'Draft email to Alice')..." className="flex-1" />
                 <Button size="icon"><ChevronRight size={18} /></Button>
               </div>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full cursor-pointer hover:bg-slate-200">Summarize today's issues</span>
                 <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full cursor-pointer hover:bg-slate-200">Draft report card for Rex</span>
               </div>
           </div>
        </div>
      </div>

      {/* Quick Nav Overlay */}
      {quickNavOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQuickNavOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-slate-100 flex items-center gap-3">
               <Search className="text-slate-400" />
               <input 
                 autoFocus
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Go to page or search owners, pets, reservations... (Cmd+K)" 
                 className="flex-1 text-lg font-medium placeholder:text-slate-400 outline-none"
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
                          const pet = MOCK_PETS.find(p => p.id === res.petId);
                          return (
                            <div 
                              key={res.id}
                              onClick={() => handleResultClick('/reservations')} // Ideally scrolls to res
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
                    
                    <div className="mt-4 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Recent</div>
                    <div className="space-y-1">
                       <div 
                          className="flex items-center gap-3 px-3 py-3 hover:bg-slate-100 rounded-md cursor-pointer"
                          onClick={() => { navigate('/owners-pets?id=p1&type=pets'); setQuickNavOpen(false); }}
                        >
                          <Dog size={18} className="text-slate-400" />
                          <span className="text-slate-600">Rex (Golden Retriever)</span>
                          <Badge className="ml-auto">Pet</Badge>
                       </div>
                       <div 
                          className="flex items-center gap-3 px-3 py-3 hover:bg-slate-100 rounded-md cursor-pointer"
                          onClick={() => { navigate('/owners-pets?id=o1&type=owners'); setQuickNavOpen(false); }}
                       >
                          <User size={18} className="text-slate-400" />
                          <span className="text-slate-600">Alice Johnson</span>
                          <Badge className="ml-auto">Owner</Badge>
                       </div>
                    </div>
                  </>
                )}
             </div>
             <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between px-4">
                <span><strong className="text-slate-600">↑↓</strong> to navigate</span>
                <span><strong className="text-slate-600">Enter</strong> to select</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
