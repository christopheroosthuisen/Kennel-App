
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

const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-8">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {data.map((slice, i) => {
            const angle = (slice.value / total) * 360;
            const x1 = 50 + 40 * Math.cos(Math.PI * currentAngle / 180);
            const y1 = 50 + 40 * Math.sin(Math.PI * currentAngle / 180);
            const x2 = 50 + 40 * Math.cos(Math.PI * (currentAngle + angle) / 180);
            const y2 = 50 + 40 * Math.sin(Math.PI * (currentAngle + angle) / 180);
            
            const pathData = total === slice.value 
              ? `M 50 10 A 40 40 0 1 1 49.99 10` // Full circle fix
              : `M 50 50 L ${x1} ${y1} A 40 40 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
            
            currentAngle += angle;
            return (
              <path key={i} d={pathData} fill={slice.color} stroke="white" strokeWidth="2" />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
      </div>
      <div className="space-y-2 flex-1">
        {data.map((slice, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
                <span className="text-slate-600">{slice.label}</span>
             </div>
             <span className="font-bold text-slate-800">{Math.round((slice.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Dashboards ---

const ExecutiveDashboard = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
     {/* KPIs */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
           { label: 'Total Revenue', value: '$124,500', sub: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
           { label: 'Occupancy Rate', value: '88%', sub: '+2.1%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
           { label: 'New Clients', value: '142', sub: '-5%', trend: 'down', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
           { label: 'Avg Ticket', value: '$245', sub: '+8%', trend: 'up', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map((stat, i) => (
           <Card key={i} className="p-4 flex items-center justify-between">
              <div>
                 <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
                 <div className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</div>
                 <div className={cn("text-xs font-medium flex items-center gap-1 mt-1", stat.trend === 'up' ? "text-green-600" : "text-red-500")}>
                    {stat.trend === 'up' ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                    {stat.sub} vs last month
                 </div>
              </div>
              <div className={cn("p-3 rounded-full", stat.bg, stat.color)}>
                 <stat.icon size={20} />
              </div>
           </Card>
        ))}
     </div>

     {/* Main Charts */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Revenue Trend (YTD)</h3>
              <Select className="w-32"><option>2023</option><option>2022</option></Select>
           </div>
           <SimpleBarChart 
              data={[45, 52, 48, 61, 75, 82, 80, 85, 91, 105, 115, 124]} 
              labels={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']} 
              color="bg-primary-500"
           />
        </Card>
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-6">Revenue by Source</h3>
           <DonutChart data={[
              { label: 'Boarding', value: 65, color: '#3b82f6' },
              { label: 'Daycare', value: 20, color: '#22c55e' },
              { label: 'Grooming', value: 10, color: '#a855f7' },
              { label: 'Retail', value: 5, color: '#f97316' },
           ]} />
        </Card>
     </div>
  </div>
);

const FinancialDashboard = () => {
  const { data: owners = [] } = useApiQuery('rep-owners', () => api.getOwners());
  const outstanding = owners.reduce((acc: number, o: any) => acc + (o.balance || 0), 0);

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
  
  const checkedIn = reservations.filter((r: any) => r.status === 'CheckedIn').length;
  const requested = reservations.filter((r: any) => r.status === 'Requested').length;
  const confirmed = reservations.filter((r: any) => r.status === 'Confirmed').length;

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
     
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-4">Weekly Capacity Heatmap</h3>
           <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                 const cap = [45, 55, 60, 85, 95, 90, 40][i];
                 return (
                    <div key={day} className="flex items-center gap-4">
                       <span className="w-8 text-sm font-medium text-slate-600">{day}</span>
                       <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                             className={cn("h-full", cap > 90 ? "bg-red-500" : cap > 70 ? "bg-orange-500" : "bg-green-500")}
                             style={{ width: `${cap}%` }}
                          ></div>
                       </div>
                       <span className="w-8 text-sm text-slate-500 text-right">{cap}%</span>
                    </div>
                 )
              })}
           </div>
        </Card>
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-4">Task Completion</h3>
           <DonutChart data={[
              { label: 'Feeding', value: 98, color: '#22c55e' },
              { label: 'Medications', value: 100, color: '#3b82f6' },
              { label: 'Playgroups', value: 85, color: '#f59e0b' },
              { label: 'Cleaning', value: 60, color: '#94a3b8' },
           ]} />
        </Card>
     </div>
  </div>
  );
};

export const Reports = () => {
  const [activeDashboard, setActiveDashboard] = useState<'executive' | 'operations' | 'financial'>('executive');

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      <div className="w-64 shrink-0 space-y-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Analytics</h1>
            <p className="text-slate-500 text-sm">Business Intelligence</p>
         </div>
         
         <div className="space-y-1">
            <button 
               onClick={() => setActiveDashboard('executive')}
               className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeDashboard === 'executive' ? "bg-white shadow-sm text-primary-700 border border-slate-100" : "text-slate-600 hover:bg-slate-100")}
            >
               <Layout size={18}/> Executive Overview
            </button>
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
            {activeDashboard === 'executive' && <ExecutiveDashboard />}
            {activeDashboard === 'operations' && <OperationsDashboard />}
            {activeDashboard === 'financial' && <FinancialDashboard />}
         </div>
      </div>
    </div>
  );
};
