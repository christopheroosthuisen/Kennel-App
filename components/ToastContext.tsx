
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from './Common';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children?: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-right-10 fade-in",
              toast.type === 'success' ? "bg-white border-green-200 text-green-800" :
              toast.type === 'error' ? "bg-white border-red-200 text-red-800" :
              toast.type === 'warning' ? "bg-white border-amber-200 text-amber-800" :
              "bg-white border-slate-200 text-slate-800"
            )}
          >
            <div className={cn("mt-0.5 shrink-0", 
               toast.type === 'success' ? "text-green-500" :
               toast.type === 'error' ? "text-red-500" :
               toast.type === 'warning' ? "text-amber-500" : "text-blue-500"
            )}>
               {toast.type === 'success' && <CheckCircle size={18}/>}
               {toast.type === 'error' && <AlertCircle size={18}/>}
               {toast.type === 'warning' && <AlertTriangle size={18}/>}
               {toast.type === 'info' && <Info size={18}/>}
            </div>
            <div className="flex-1 text-sm font-medium pt-0.5">{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
               <X size={16}/>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
