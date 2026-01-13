
import React, { useState } from 'react';
import { 
  BarChart, DollarSign, TrendingUp, Users, Plus, FileText, 
  PieChart, Calendar, ArrowUpRight, ArrowDownRight, Filter,
  Download, Share2, Layers, Settings, ChevronRight, Layout,
  Activity, AlertCircle, CheckCircle, Clock, Search, X, Table
} from 'lucide-react';
import { Card, Select, cn, Button, Modal, Label, Input, Badge } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';

// --- Simple Charts ---

const SimpleBarChart = ({ data, labels, color = "bg-blue-500" }: { data: number[], labels: string[], color?: string }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-2 h-40 w-full pt-6">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
           <div 
             className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
           >
             {d}
           </div>
           <div className={cn("w-full rounded-t-sm transition-all hover:opacity-80", color)} style={{ height: `${(d / max) * 100}%` }}></div>
           <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// --- Dashboards ---

const FinancialDashboard = () => {
  // Fetch real data to aggregate
  const { data: owners = [] } = useApiQuery('rep-owners', () => api.getOwners());
  // In a real app we'd have a specific analytics endpoint, but for local we aggregate
  
  // Calculate total outstanding balance
  const outstanding = owners.reduce((acc, o) => acc + o.balance, 0);

  return (
  <div className="space-y-6 animate-in fade-in duration-300">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
           <div className="flex justify-between">
              <div>
                 <p className="text-slate-500 text-sm">Outstanding Balances</p>
                 <h3 className="text-2xl font-bold text-red-600 mt-1">${(outstanding / 100).toFixed(2)}</h3>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                 <DollarSign size={20}/>
              </div>
           </div>
        </Card>
     </div>
     
     <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4">Revenue Projection (Mock)</h3>
        <SimpleBarChart 
           data={[450, 520, 480, 610, 750, 820]} 
           labels={['Jan','Feb','Mar','Apr','May','Jun']} 
           color="bg-primary-500"
        />
     </Card>
  </div>
  );
};

const OperationsDashboard = () => {
  const { data: reservations = [] } = useApiQuery('rep-res', () => api.getReservations({}));
  
  const checkedIn = reservations.filter(r => r.status === 'CheckedIn').length;
  const requested = reservations.filter(r => r.status === 'Requested').length;
  const confirmed = reservations.filter(r => r.status === 'Confirmed').length;

  return (
  <div className="space-y-6 animate-in fade-in duration-300">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> Checked In</h3>
           <div className="text-3xl font-bold text-slate-900">{checkedIn}</div>
        </Card>
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Clock size={18} className="text-amber-500"/> Pending Requests</h3>
           <div className="text-3xl font-bold text-slate-900">{requested}</div>
        </Card>
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Calendar size={18} className="text-blue-500"/> Confirmed Upcoming</h3>
           <div className="text-3xl font-bold text-slate-900">{confirmed}</div>
        </Card>
     </div>
  </div>
  );
};

export const Reports = () => {
  const [activeDashboard, setActiveDashboard] = useState<'operations' | 'financial'>('operations');

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      <div className="w-64 shrink-0 space-y-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Analytics</h1>
            <p className="text-slate-500 text-sm">Business Intelligence</p>
         </div>
         
         <div className="space-y-1">
            <button 
               onClick={() => setActiveDashboard('operations')}
               className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeDashboard === 'operations' ? "bg-white shadow-sm text-primary-700 border border-slate-100" : "text-slate-600 hover:bg-slate-100")}
            >
               <Activity size={18}/> Operations Center
            </button>
            <button 
               onClick={() => setActiveDashboard('financial')}
               className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeDashboard === 'financial' ? "bg-white shadow-sm text-primary-700 border border-slate-100" : "text-slate-600 hover:bg-slate-100")}
            >
               <DollarSign size={18}/> Financial Performance
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
         <div className="pb-10">
            {activeDashboard === 'operations' && <OperationsDashboard />}
            {activeDashboard === 'financial' && <FinancialDashboard />}
         </div>
      </div>
    </div>
  );
};
