import React, { useState } from 'react';
import { 
  BarChart, DollarSign, TrendingUp, Users, Plus, FileText, 
  PieChart, Calendar, ArrowUpRight, ArrowDownRight, Filter,
  Download, Share2, Layers, Settings, ChevronRight, Layout,
  Activity, AlertCircle, CheckCircle, Clock, Search, X, Table
} from 'lucide-react';
import { Card, Select, cn, Button, Modal, Label, Input, Badge } from './Common';

// --- Reusable Chart Components (SVG based) ---

const SimpleLineChart = ({ data, color = "#0ea5e9", height = 60 }: { data: number[], color?: string, height?: number }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / (max - min)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {/* Area fill */}
        <polyline
          fill={color}
          fillOpacity="0.1"
          stroke="none"
          points={`0,100 ${points} 100,100`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

const SimpleBarChart = ({ data, labels, color = "bg-blue-500" }: { data: number[], labels: string[], color?: string }) => {
  const max = Math.max(...data);
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

// --- Dashboard Views ---

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

const OperationsDashboard = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> Check-Ins Today</h3>
           <div className="text-3xl font-bold text-slate-900">24 <span className="text-sm font-normal text-slate-400">/ 28</span></div>
           <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-green-500 h-full w-[85%]"></div>
           </div>
           <div className="text-xs text-slate-500 mt-2">4 expected arrivals remaining</div>
        </Card>
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><AlertCircle size={18} className="text-red-500"/> Incidents</h3>
           <div className="text-3xl font-bold text-slate-900">2</div>
           <p className="text-xs text-slate-500 mt-2">1 Medical (Upset Stomach), 1 Behavioral</p>
           <Button variant="ghost" size="sm" className="mt-2 text-red-600 p-0 h-auto hover:bg-transparent hover:underline">View Logs</Button>
        </Card>
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Users size={18} className="text-blue-500"/> Staff on Duty</h3>
           <div className="text-3xl font-bold text-slate-900">8</div>
           <p className="text-xs text-slate-500 mt-2">Ratio: 1 staff per 12 dogs</p>
           <div className="flex -space-x-2 mt-3">
              {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">S{i}</div>
              ))}
              <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+3</div>
           </div>
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

const FinancialDashboard = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
           <div className="flex justify-between">
              <div>
                 <p className="text-slate-500 text-sm">Gross Revenue</p>
                 <h3 className="text-2xl font-bold text-slate-900 mt-1">$45,230</h3>
              </div>
              <SimpleLineChart data={[30, 40, 35, 50, 45, 60, 55]} height={40} />
           </div>
        </Card>
        <Card className="p-6">
           <div className="flex justify-between">
              <div>
                 <p className="text-slate-500 text-sm">Net Profit</p>
                 <h3 className="text-2xl font-bold text-slate-900 mt-1">$12,450</h3>
              </div>
              <SimpleLineChart data={[10, 15, 12, 20, 18, 25, 22]} color="#22c55e" height={40} />
           </div>
        </Card>
        <Card className="p-6">
           <div className="flex justify-between">
              <div>
                 <p className="text-slate-500 text-sm">Outstanding Invoices</p>
                 <h3 className="text-2xl font-bold text-red-600 mt-1">$3,200</h3>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                 <AlertCircle size={20}/>
              </div>
           </div>
        </Card>
     </div>

     <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4">Service Profitability</h3>
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                 <tr>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">COGS</th>
                    <th className="px-4 py-3 text-right">Margin</th>
                    <th className="px-4 py-3 text-right">% of Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {[
                    { name: 'Boarding - Standard', rev: 25000, cost: 8000, margin: '68%' },
                    { name: 'Daycare - Full Day', rev: 12000, cost: 4000, margin: '66%' },
                    { name: 'Grooming - Full', rev: 5000, cost: 3500, margin: '30%' },
                    { name: 'Training - Group', rev: 3230, cost: 500, margin: '85%' },
                 ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                       <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                       <td className="px-4 py-3 text-right">${row.rev.toLocaleString()}</td>
                       <td className="px-4 py-3 text-right text-slate-500">${row.cost.toLocaleString()}</td>
                       <td className="px-4 py-3 text-right text-green-600 font-bold">{row.margin}</td>
                       <td className="px-4 py-3 text-right">
                          <div className="w-24 ml-auto h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className="bg-primary-500 h-full" style={{ width: row.margin }}></div>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </Card>
  </div>
);

// --- Custom Report Builder ---

const ReportBuilder = () => {
   const [step, setStep] = useState(1);
   const [source, setSource] = useState<string | null>(null);
   const [columns, setColumns] = useState<string[]>([]);
   
   const SOURCES = [
      { id: 'reservations', label: 'Reservations', icon: Calendar },
      { id: 'revenue', label: 'Revenue & Invoices', icon: DollarSign },
      { id: 'pets', label: 'Pet Demographics', icon: Users },
      { id: 'incidents', label: 'Incidents & Health', icon: Activity },
   ];

   const COLUMNS_MAP: Record<string, string[]> = {
      reservations: ['Check-In Date', 'Check-Out Date', 'Pet Name', 'Owner Name', 'Service Type', 'Lodging Unit', 'Status', 'Total Price'],
      revenue: ['Invoice ID', 'Date', 'Amount', 'Tax', 'Payment Method', 'Status', 'Items'],
      pets: ['Pet Name', 'Breed', 'Weight', 'Age', 'Gender', 'Fixed', 'Vaccine Status'],
      incidents: ['Date', 'Type', 'Severity', 'Pet Involved', 'Staff Reporter', 'Description']
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         {/* Stepper */}
         <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
            {['Select Source', 'Choose Columns', 'Filters', 'Visualize'].map((label, i) => (
               <div key={i} className={cn("flex flex-col items-center gap-2 relative z-10", step > i + 1 ? "text-primary-600" : step === i + 1 ? "text-primary-700 font-bold" : "text-slate-400")}>
                  <div className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                     step > i + 1 ? "bg-primary-600 text-white" : 
                     step === i + 1 ? "bg-primary-600 text-white ring-4 ring-primary-100" : "bg-slate-100 text-slate-500"
                  )}>
                     {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className="text-xs">{label}</span>
               </div>
            ))}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-100 -z-0 mx-20 hidden md:block" />
         </div>

         <Card className="p-8 min-h-[400px]">
            {step === 1 && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SOURCES.map(s => (
                     <button 
                        key={s.id}
                        onClick={() => { setSource(s.id); setStep(2); }}
                        className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                     >
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
                           <s.icon size={32} className="text-slate-500 group-hover:text-primary-600"/>
                        </div>
                        <h3 className="font-bold text-slate-800">{s.label}</h3>
                     </button>
                  ))}
               </div>
            )}

            {step === 2 && source && (
               <div className="space-y-6">
                  <h3 className="font-bold text-slate-800">Select Columns for {SOURCES.find(s => s.id === source)?.label}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {COLUMNS_MAP[source].map(col => (
                        <label key={col} className={cn(
                           "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                           columns.includes(col) ? "border-primary-500 bg-primary-50" : "border-slate-200 hover:bg-slate-50"
                        )}>
                           <input 
                              type="checkbox" 
                              checked={columns.includes(col)}
                              onChange={() => {
                                 if (columns.includes(col)) setColumns(prev => prev.filter(c => c !== col));
                                 else setColumns(prev => [...prev, col]);
                              }}
                              className="rounded text-primary-600 focus:ring-primary-500"
                           />
                           <span className="text-sm font-medium text-slate-700">{col}</span>
                        </label>
                     ))}
                  </div>
                  <div className="flex justify-end pt-4">
                     <Button onClick={() => setStep(3)} disabled={columns.length === 0}>Next: Filters</Button>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-6">
                  <h3 className="font-bold text-slate-800">Apply Filters</h3>
                  <div className="grid grid-cols-2 gap-6">
                     <div><Label>Date Range</Label><Select><option>Last 30 Days</option><option>This Year</option></Select></div>
                     <div><Label>Sort By</Label><Select><option>Date (Desc)</option><option>Amount (Desc)</option></Select></div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center text-slate-500 text-sm">
                     Additional advanced filters would appear here based on selected columns.
                  </div>
                  <div className="flex justify-between pt-4">
                     <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                     <Button onClick={() => setStep(4)}>Next: Visualize</Button>
                  </div>
               </div>
            )}

            {step === 4 && (
               <div className="space-y-6">
                  <h3 className="font-bold text-slate-800">Preview & Save</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 p-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Table Preview</div>
                        <table className="w-full text-sm text-left">
                           <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                              <tr>
                                 {columns.map(c => <th key={c} className="p-3">{c}</th>)}
                              </tr>
                           </thead>
                           <tbody>
                              {[1,2,3].map(i => (
                                 <tr key={i} className="border-b border-slate-50 last:border-0">
                                    {columns.map(c => <td key={c} className="p-3 text-slate-600">--</td>)}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                     <div className="space-y-4">
                        <div><Label>Report Name</Label><Input placeholder="e.g. Monthly Revenue by Service"/></div>
                        <div><Label>Description</Label><Input placeholder="Optional description"/></div>
                        <Button className="w-full bg-green-600 hover:bg-green-700">Save Report</Button>
                        <Button variant="outline" className="w-full">Export CSV</Button>
                     </div>
                  </div>
                  <div className="flex justify-start pt-4">
                     <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                  </div>
               </div>
            )}
         </Card>
      </div>
   );
};

// --- Main Reports Component ---

export const Reports = () => {
  const [activeDashboard, setActiveDashboard] = useState<'executive' | 'operations' | 'financial' | 'custom'>('executive');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Sidebar Navigation */}
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

         <div className="pt-6 border-t border-slate-200">
            <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Saved Reports</h3>
            <div className="space-y-1">
               <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  <FileText size={16}/> End of Day Summary
               </button>
               <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  <FileText size={16}/> Monthly Tax Report
               </button>
            </div>
            <Button 
               className="w-full mt-4 gap-2" 
               variant="outline"
               onClick={() => setActiveDashboard('custom')}
            >
               <Plus size={16}/> Report Builder
            </Button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
         {/* Toolbar */}
         <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm sticky top-0 z-10">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               {activeDashboard === 'executive' && <><Layout size={20} className="text-primary-600"/> Executive Overview</>}
               {activeDashboard === 'operations' && <><Activity size={20} className="text-primary-600"/> Operations Center</>}
               {activeDashboard === 'financial' && <><DollarSign size={20} className="text-primary-600"/> Financial Performance</>}
               {activeDashboard === 'custom' && <><Settings size={20} className="text-primary-600"/> Custom Report Builder</>}
            </h2>
            <div className="flex gap-2">
               {activeDashboard !== 'custom' && (
                  <>
                     <Select className="w-36 text-sm"><option>This Month</option><option>Last Month</option><option>Year to Date</option></Select>
                     <Button variant="ghost" size="icon" title="Filter"><Filter size={18}/></Button>
                     <Button variant="ghost" size="icon" title="Export"><Download size={18}/></Button>
                     <Button variant="ghost" size="icon" title="Share"><Share2 size={18}/></Button>
                  </>
               )}
            </div>
         </div>

         {/* Dashboard Content */}
         <div className="pb-10">
            {activeDashboard === 'executive' && <ExecutiveDashboard />}
            {activeDashboard === 'operations' && <OperationsDashboard />}
            {activeDashboard === 'financial' && <FinancialDashboard />}
            {activeDashboard === 'custom' && <ReportBuilder />}
         </div>
      </div>
    </div>
  );
};