
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, DollarSign, TrendingUp, Users, Plus, FileText, 
  PieChart, Calendar, ArrowUpRight, ArrowDownRight, Filter,
  Download, Share2, Layers, Settings, ChevronRight, Layout,
  Activity, AlertCircle, CheckCircle, Clock, Search, X, Table,
  ChevronLeft, Megaphone, Printer, Mail
} from 'lucide-react';
import { Card, Select, cn, Button, Modal, Label, Input, Badge, BulkActionBar } from './Common';
import { ALL_REPORTS_CONFIG } from '../constants';
import { ReportDefinition } from '../types';
import { useSearchParams } from 'react-router-dom';

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

// --- Report Runner Component (The core of the new request) ---

const ReportRunner = ({ reportId, onBack }: { reportId: string, onBack: () => void }) => {
  const reportConfig = ALL_REPORTS_CONFIG.find(r => r.id === reportId);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Mock Data Generation based on Columns
  const mockData = useMemo(() => {
    if (!reportConfig) return [];
    return Array.from({ length: 25 }, (_, i) => {
      const row: any = { id: i };
      reportConfig.columns.forEach(col => {
        if (col.includes('Date')) row[col] = new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString();
        else if (col.includes('Amount') || col.includes('Price') || col.includes('Balance') || col.includes('Sales')) row[col] = `$${(Math.random() * 500).toFixed(2)}`;
        else if (col.includes('Name') || col.includes('Customer') || col.includes('Owner')) row[col] = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown'][Math.floor(Math.random() * 4)];
        else if (col.includes('Pet')) row[col] = ['Rex', 'Bella', 'Charlie', 'Luna', 'Max'][Math.floor(Math.random() * 5)];
        else if (col.includes('Status')) row[col] = ['Active', 'Pending', 'Expired', 'Cancelled'][Math.floor(Math.random() * 4)];
        else if (col.includes('Email')) row[col] = `user${i}@example.com`;
        else if (col.includes('Phone')) row[col] = `555-01${i.toString().padStart(2, '0')}`;
        else row[col] = '---';
      });
      return row;
    });
  }, [reportId]);

  const filteredData = mockData.filter(row => 
    Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredData.length) setSelectedRows([]);
    else setSelectedRows(filteredData.map(r => r.id));
  };

  const toggleRow = (id: number) => {
    if (selectedRows.includes(id)) setSelectedRows(prev => prev.filter(r => r !== id));
    else setSelectedRows(prev => [...prev, id]);
  };

  if (!reportConfig) return <div>Report not found</div>;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ChevronLeft size={16} className="mr-1"/> Back
          </Button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{reportConfig.name}</h2>
            <div className="text-xs text-slate-500">{reportConfig.category} • {filteredData.length} records found</div>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                 placeholder="Search results..." 
                 className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 outline-none w-48"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="outline" size="sm" className="gap-2"><Filter size={14}/> Filter</Button>
           <Button variant="outline" size="sm" className="gap-2"><Settings size={14}/> Columns</Button>
           <Button variant="outline" size="sm" className="gap-2"><Download size={14}/> Export</Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="flex-1 overflow-hidden flex flex-col">
         <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm relative">
               <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                     <th className="px-4 py-3 w-10 bg-slate-50">
                        <input type="checkbox" className="rounded border-slate-300" checked={selectedRows.length === filteredData.length && filteredData.length > 0} onChange={toggleSelectAll} />
                     </th>
                     {reportConfig.columns.map(col => (
                        <th key={col} className="px-4 py-3 whitespace-nowrap bg-slate-50">{col}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                           <input type="checkbox" className="rounded border-slate-300" checked={selectedRows.includes(row.id)} onChange={() => toggleRow(row.id)} />
                        </td>
                        {reportConfig.columns.map(col => (
                           <td key={col} className="px-4 py-3 whitespace-nowrap text-slate-700">
                              {row[col]}
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      {/* Bulk Actions Bar */}
      <BulkActionBar 
         count={selectedRows.length} 
         onClear={() => setSelectedRows([])}
         actions={
            <>
               <Button 
                  size="sm" 
                  className="bg-primary-600 hover:bg-primary-700 text-white gap-2 border-none"
                  onClick={() => setShowCampaignModal(true)}
               >
                  <Megaphone size={14}/> Add to Campaign
               </Button>
               <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800 gap-2"><Mail size={14}/> Email List</Button>
               <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800 gap-2"><Printer size={14}/> Print</Button>
            </>
         }
      />

      {/* Campaign Modal */}
      <Modal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} title="Add to Marketing Campaign" size="md">
         <div className="space-y-4">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex gap-3">
               <Users className="text-primary-600 shrink-0" size={20}/>
               <div>
                  <h4 className="font-bold text-primary-900 text-sm">Target Audience</h4>
                  <p className="text-xs text-primary-700">You have selected <strong>{selectedRows.length}</strong> records from the <em>{reportConfig.name}</em> report.</p>
               </div>
            </div>

            <div>
               <Label>Select Campaign</Label>
               <Select>
                  <option>-- Create New Campaign --</option>
                  <option>Vaccine Reminder Blast (Email)</option>
                  <option>Summer Promo (SMS)</option>
                  <option>Re-engagement Drip (Email)</option>
               </Select>
            </div>

            <div>
               <Label>Action Type</Label>
               <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50 border-primary-500 bg-primary-50">
                     <div className="font-bold text-sm text-slate-800">One-time Blast</div>
                     <div className="text-xs text-slate-500">Send immediately</div>
                  </div>
                  <div className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50">
                     <div className="font-bold text-sm text-slate-800">Add to Workflow</div>
                     <div className="text-xs text-slate-500">Trigger automation</div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setShowCampaignModal(false)}>Cancel</Button>
               <Button onClick={() => { alert('Added to campaign!'); setShowCampaignModal(false); setSelectedRows([]); }}>Confirm & Add</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

// --- Report Library View ---

const ReportLibrary = ({ onSelectReport }: { onSelectReport: (id: string) => void }) => {
   const [search, setSearch] = useState('');
   const [category, setCategory] = useState('All');

   const categories = ['All', ...new Set(ALL_REPORTS_CONFIG.map(r => r.category))];
   
   const filteredReports = ALL_REPORTS_CONFIG.filter(r => 
      (category === 'All' || r.category === category) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
   );

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center flex-1">
               <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                     placeholder="Search reports..." 
                     className="pl-9"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <div className="h-8 w-px bg-slate-200 mx-2"></div>
               <div className="flex gap-1">
                  {categories.map(cat => (
                     <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={cn(
                           "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                           category === cat ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>
            <Button className="gap-2"><Plus size={16}/> Custom Report</Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredReports.map(report => (
               <Card 
                  key={report.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary-300 group flex flex-col h-full"
                  onClick={() => onSelectReport(report.id)}
               >
                  <div className="flex justify-between items-start mb-2">
                     <div className={cn(
                        "p-2 rounded-lg", 
                        report.category === 'Financial' ? "bg-green-100 text-green-700" :
                        report.category === 'Owners' ? "bg-blue-100 text-blue-700" :
                        report.category === 'Reservations' ? "bg-purple-100 text-purple-700" :
                        report.category === 'Animals' ? "bg-orange-100 text-orange-700" :
                        "bg-slate-100 text-slate-700"
                     )}>
                        <FileText size={20}/>
                     </div>
                     <Badge variant="outline" className="text-[10px] uppercase">{report.category}</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">{report.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{report.description}</p>
                  <div className="flex items-center text-xs text-slate-400 gap-1 pt-3 border-t border-slate-100">
                     <Table size={12}/> {report.columns.length} columns
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );
};

// --- Existing Dashboard Views (Condensed for brevity, assumed unchanged in logic) ---

const ExecutiveDashboard = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
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
     {/* ... Rest of existing charts ... */}
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

// --- Main Reports Component ---

export const Reports = () => {
  const [activeDashboard, setActiveDashboard] = useState<'library' | 'executive' | 'operations' | 'financial'>('library');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Initialize from URL
  useEffect(() => {
     const reportId = searchParams.get('reportId');
     if (reportId) {
        setActiveReportId(reportId);
     }
  }, [searchParams]);

  if (activeReportId) {
     return <ReportRunner reportId={activeReportId} onBack={() => setActiveReportId(null)} />;
  }

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
               onClick={() => setActiveDashboard('library')}
               className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeDashboard === 'library' ? "bg-white shadow-sm text-primary-700 border border-slate-100" : "text-slate-600 hover:bg-slate-100")}
            >
               <Table size={18}/> Report Library
            </button>
            <div className="h-px bg-slate-200 my-2 mx-4"></div>
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
            <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Saved Favorites</h3>
            <div className="space-y-1">
               <button onClick={() => setActiveReportId('fin_eod')} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  <FileText size={16}/> End of Day Summary
               </button>
               <button onClick={() => setActiveReportId('ani_vax')} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  <FileText size={16}/> Expired Vaccines
               </button>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
         {/* Dashboard Content */}
         <div className="pb-10">
            {activeDashboard === 'library' && <ReportLibrary onSelectReport={setActiveReportId} />}
            {activeDashboard === 'executive' && <ExecutiveDashboard />}
            {activeDashboard === 'operations' && <div className="p-8 text-center text-slate-400">Operations Dashboard Component (Existing)</div>}
            {activeDashboard === 'financial' && <div className="p-8 text-center text-slate-400">Financial Dashboard Component (Existing)</div>}
         </div>
      </div>
    </div>
  );
};
