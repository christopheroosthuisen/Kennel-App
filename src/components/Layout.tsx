
import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Search, ShoppingCart, HelpCircle, User, LayoutDashboard, 
  Calendar, Dog, CreditCard, FileText, Settings, ChevronLeft, ChevronRight, 
  Sparkles, X, Plus, LogOut, Command, GitBranch
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn, Button, Input, Badge } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { useEventStream } from '../hooks/useEventStream';

const NavItem = ({ icon: Icon, label, path, collapsed, active }: { icon: any, label: string, path: string, collapsed: boolean, active: boolean }) => (
  <Link 
    to={path}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
      active ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon size={20} className={cn("min-w-[20px]", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
    {!collapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>}
  </Link>
);

export const AppLayout = ({ children, showAI, toggleAI }: { children?: React.ReactNode, showAI: boolean, toggleAI: () => void }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Notification count
  const { data: notifications = [], refetch: refetchNotifs } = useApiQuery('unread-notifs', () => api.listNotifications({ unreadOnly: true }));
  useEventStream((e) => {
     if (e.type === 'notification') refetchNotifs();
  });

  const unreadCount = notifications.length;

  // Quick Nav Hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickNavOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Reservations', path: '/reservations' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: CreditCard, label: 'Point of Sale', path: '/pos' },
    { icon: Dog, label: 'Owners & Pets', path: '/owners-pets' },
    { icon: GitBranch, label: 'Automations', path: '/automations' },
    { icon: FileText, label: 'Report Cards', path: '/report-cards' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Admin', path: '/admin' },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = e.currentTarget.value;
      setQuickNavOpen(false);
      navigate(`/owners-pets?search=${term}`);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 z-20",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-xl overflow-hidden">
             <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center shrink-0">
               <Dog size={20} className="text-white" />
             </div>
             {!collapsed && <span className="truncate">Partners</span>}
            </div>
        </div>

        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <React.Fragment key={item.path}>
              <NavItem 
                {...item} 
                collapsed={collapsed} 
                active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))} 
              />
            </React.Fragment>
          ))}
        </div>

        <div className="p-2 border-t border-slate-800">
           <button 
             onClick={() => setCollapsed(!collapsed)}
             className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
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
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer hover:text-primary-600">
                  Downtown Facility <ChevronRight size={14}/>
                </span>
             </div>
             <div 
                className="relative w-96 group"
                onClick={() => setQuickNavOpen(true)}
             >
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary-500 transition-colors" size={18} />
               <input 
                 readOnly
                 placeholder="Search owners, pets, reservations... (Cmd+K)" 
                 className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 cursor-text hover:bg-slate-200 transition-colors"
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
                  showAI ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                )}
             >
               <Sparkles size={16} className={showAI ? "fill-indigo-300 text-indigo-600" : "text-slate-400"} />
               <span className="hidden sm:inline font-medium">AI Assistant</span>
             </Button>

             <div className="ml-2 flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer">
                <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  JD
                </div>
             </div>
           </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-auto bg-slate-50 relative">
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
           </div>

           {/* Drafts */}
           <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ask Copilot</h3>
               <div className="flex gap-2">
                 <Input placeholder="Type a request (e.g., 'Draft email to Alice')..." className="flex-1" />
                 <Button size="icon"><ChevronRight size={18} /></Button>
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
                 placeholder="Go to page or search database..." 
                 className="flex-1 text-lg font-medium placeholder:text-slate-400 outline-none"
                 onKeyDown={handleSearch}
               />
               <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">ESC</span>
             </div>
             <div className="p-2 max-h-[60vh] overflow-y-auto">
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
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
