
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, AlertTriangle, RefreshCw, Trash2, X, Terminal, Shield } from 'lucide-react';
import { cn, Button } from '../Common';

export const BootDiagnostics = () => {
  const { user, isLoading, error: authError } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errors, setErrors] = useState<string[]>([]);
  const [minimized, setMinimized] = useState(false);

  // Check visibility conditions (Dev mode or ?debug=1)
  useEffect(() => {
    // Cast import.meta to any to avoid TS error with vite types not being fully loaded in this context
    const isDev = (import.meta as any).env?.DEV;
    const hasDebugParam = new URLSearchParams(window.location.search).has('debug');
    if (isDev || hasDebugParam) setIsVisible(true);
  }, []);

  // Listen for global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, `[Runtime] ${event.message}`]);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, `[Promise] ${event.reason?.message || event.reason}`]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Monitor API Health
  useEffect(() => {
    if (!isVisible) return;
    
    const checkApi = async () => {
      try {
        const res = await fetch('/health', { method: 'GET' });
        if (res.ok) setApiStatus('online');
        else setApiStatus('offline');
      } catch (e) {
        setApiStatus('offline');
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const handleHardReset = () => {
    if (confirm('This will wipe all local session data and reload. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const statusColor = 
    errors.length > 0 || authError || apiStatus === 'offline' ? "text-red-500" : 
    isLoading ? "text-yellow-500" : "text-green-500";

  return (
    <div className={cn(
      "fixed z-[9999] transition-all duration-300 shadow-2xl font-mono text-xs backdrop-blur-md",
      minimized ? "bottom-4 right-4 w-auto h-auto rounded-full" : "bottom-4 right-4 w-80 bg-slate-900/95 text-slate-300 border border-slate-700 rounded-lg overflow-hidden"
    )}>
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-2 cursor-pointer bg-slate-800/80 hover:bg-slate-700 transition-colors select-none",
          minimized ? "rounded-full px-3 py-2 border border-slate-600" : "border-b border-slate-700"
        )}
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2">
          {errors.length > 0 ? (
            <AlertTriangle size={14} className="text-red-500 animate-pulse" />
          ) : (
            <Terminal size={14} className={statusColor} />
          )}
          {!minimized && <span className="font-bold text-white">Diagnostics</span>}
        </div>
        {!minimized && <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">DEV MODE</div>}
      </div>

      {/* Content */}
      {!minimized && (
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-slate-800/50 border border-slate-700 flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase">API</span>
              <span className={cn(
                "font-bold", 
                apiStatus === 'online' ? "text-green-400" : apiStatus === 'checking' ? "text-blue-400" : "text-red-400"
              )}>{apiStatus.toUpperCase()}</span>
            </div>
            <div className="p-2 rounded bg-slate-800/50 border border-slate-700 flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase">Latency</span>
              <span className="font-bold text-slate-300">-- ms</span>
            </div>
          </div>

          {/* Auth State */}
          <div className="space-y-1 border-t border-slate-800 pt-2">
            <div className="flex justify-between items-center text-slate-400">
              <div className="flex items-center gap-1"><Shield size={10}/> Session</div>
              <span className={user ? "text-green-400" : "text-slate-500"}>{user ? 'Authenticated' : 'Guest'}</span>
            </div>
            {isLoading && <div className="text-yellow-500 italic text-[10px]">Hydrating session...</div>}
            {authError && (
              <div className="p-2 bg-red-950/30 border border-red-900/50 rounded text-red-300 mt-1 break-words">
                {authError}
              </div>
            )}
          </div>

          {/* Runtime Errors Log */}
          {errors.length > 0 && (
            <div className="space-y-2 border-t border-slate-800 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-bold">Errors ({errors.length})</span>
                <button onClick={() => setErrors([])} className="text-slate-500 hover:text-white">Clear</button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto bg-black/20 p-1 rounded">
                {errors.map((err, i) => (
                  <div key={i} className="text-[10px] p-1 border-l-2 border-red-500 text-red-200 break-all font-mono">
                    {err}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-slate-800 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="danger" 
                onClick={handleHardReset}
                className="h-8 text-[10px] gap-1 w-full justify-center bg-red-900/30 hover:bg-red-900/50 border-red-900/50"
              >
                <Trash2 size={10} /> Wipe Data
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => window.location.reload()}
                className="h-8 text-[10px] gap-1 w-full justify-center bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                <RefreshCw size={10} /> Reload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};