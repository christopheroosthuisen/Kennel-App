import React, { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, Search, ArrowUp, ArrowDown, Megaphone, Trash2, Mail } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Hooks ---

export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// --- Components ---

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  as?: React.ElementType;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', as: Component = 'button', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm border border-transparent',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent',
      ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
      danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
      outline: 'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700'
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0 flex items-center justify-center'
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'info';
  children?: React.ReactNode;
  className?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-800',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-amber-100 text-amber-800 border border-amber-200',
      danger: 'bg-red-100 text-red-800 border border-red-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
      outline: 'border border-slate-200 text-slate-600'
    };
    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

// Card
export const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm', className)} {...props}>
    {children}
  </div>
);

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// Search Input (Standardized)
export const SearchInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <Input 
        ref={ref}
        className="pl-9" 
        {...props}
      />
    </div>
  )
);
SearchInput.displayName = 'SearchInput';

// Textarea
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// Switch
export const Switch = ({ checked, onCheckedChange, disabled }: { checked: boolean, onCheckedChange: (checked: boolean) => void, disabled?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onCheckedChange(!checked)}
    className={cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-primary-600" : "bg-slate-200"
    )}
  >
    <span
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

// Label
export const Label = ({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 block mb-1.5", className)} {...props}>
    {children}
  </label>
);

// Select
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn(
      'relative flex h-10 w-full items-center rounded-md border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden',
      className
    )}>
      <select
        ref={ref}
        className="h-full w-full appearance-none bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 z-10 relative"
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  )
);
Select.displayName = 'Select';

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  if (!isOpen) return null;
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200", sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Tabs
export const Tabs = ({ tabs, activeTab, onChange }: { tabs: { id: string, label: string, count?: number }[], activeTab: string, onChange: (id: string) => void }) => (
  <div className="border-b border-slate-200">
    <div className="flex space-x-6 overflow-x-auto no-scrollbar px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap pt-2",
            activeTab === tab.id
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
              activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-600"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
);

// Bulk Action Bar
export const BulkActionBar = ({ count, onClear, actions }: { count: number, onClear: () => void, actions?: React.ReactNode }) => {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm bg-primary-600 px-2 py-0.5 rounded-full">{count}</span>
        <span className="text-sm font-medium">Selected</span>
      </div>
      <div className="h-4 w-px bg-slate-700" />
      <div className="flex items-center gap-2">
         {actions || (
           <>
            <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800 hover:text-white gap-2"><Megaphone size={14}/> Add to Campaign</Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800 hover:text-white gap-2"><Mail size={14}/> Email</Button>
            <Button size="sm" variant="ghost" className="text-red-300 hover:bg-slate-800 hover:text-red-200 gap-2"><Trash2 size={14}/> Delete</Button>
           </>
         )}
      </div>
      <div className="h-4 w-px bg-slate-700" />
      <button onClick={onClear} className="text-xs text-slate-400 hover:text-white uppercase font-bold tracking-wider">Cancel</button>
    </div>
  );
};

// Sortable Column Header
export const SortableHeader = ({ label, sortKey, currentSort, onSort, className }: { label: string, sortKey: string, currentSort: { key: string, dir: 'asc' | 'desc' }, onSort: (key: string) => void, className?: string }) => {
  const isActive = currentSort.key === sortKey;
  return (
    <th 
      className={cn("px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors select-none", className)}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className="flex flex-col">
          <ArrowUp size={10} className={cn("text-slate-300", isActive && currentSort.dir === 'asc' && "text-primary-600")} />
          <ArrowDown size={10} className={cn("-mt-1 text-slate-300", isActive && currentSort.dir === 'desc' && "text-primary-600")} />
        </div>
      </div>
    </th>
  );
};

// Stat Widget
export const StatCard = ({ title, count, icon: Icon, color, subtext, className }: { title: string, count: number, icon: any, color: string, subtext?: string, className?: string }) => (
  <Card className={cn("p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border-l-4", className)} style={{ borderLeftColor: color }}>
     <div className="flex justify-between items-start">
       <div>
         <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
         <h3 className="text-2xl font-bold text-slate-800 mt-1">{count}</h3>
       </div>
       <div className="p-2 rounded-full bg-slate-50">
         <Icon size={20} className="text-slate-400" />
       </div>
     </div>
     {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </Card>
);
