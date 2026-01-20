
import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Mail, MessageSquare, Phone, BarChart3, Settings, 
  Plus, Users, Send, Download, Filter, MoreHorizontal, Check, 
  Trash2, GripVertical, Image as ImageIcon, Type, Link as LinkIcon,
  Play, Pause, Mic, PhoneIncoming, PhoneOutgoing, Voicemail,
  RefreshCw, Power, ExternalLink
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, cn, Modal, Label, Textarea, Tabs, Switch, BulkActionBar } from './Common';
import { MOCK_CAMPAIGNS, MOCK_CALL_LOGS, MOCK_CONNECTORS, MOCK_OWNERS, MOCK_EMAIL_TEMPLATES } from '../constants';
import { MarketingCampaign, CallLog, MarketingConnector } from '../types';
import { useSearchParams } from 'react-router-dom';

// --- Dashboard View ---
const MarketingDashboard = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
           { label: 'Active Campaigns', value: '3', color: 'text-primary-600', bg: 'bg-primary-50', icon: Megaphone },
           { label: 'Emails Sent (30d)', value: '1,240', color: 'text-blue-600', bg: 'bg-blue-50', icon: Mail },
           { label: 'SMS Sent (30d)', value: '450', color: 'text-green-600', bg: 'bg-green-50', icon: MessageSquare },
           { label: 'Inbound Calls', value: '82', color: 'text-orange-600', bg: 'bg-orange-50', icon: Phone },
        ].map((stat, i) => (
           <Card key={i} className="p-4 flex items-center justify-between">
              <div>
                 <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">{stat.label}</div>
                 <div className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</div>
              </div>
              <div className={cn("p-3 rounded-full", stat.bg, stat.color)}>
                 <stat.icon size={20} />
              </div>
           </Card>
        ))}
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-4">Recent Campaign Performance</h3>
           <div className="space-y-4">
              {MOCK_CAMPAIGNS.slice(0, 3).map(cmp => (
                 <div key={cmp.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                       <div className={cn("p-2 rounded-lg", cmp.type === 'Email' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600")}>
                          {cmp.type === 'Email' ? <Mail size={16}/> : <MessageSquare size={16}/>}
                       </div>
                       <div>
                          <div className="font-medium text-slate-900">{cmp.name}</div>
                          <div className="text-xs text-slate-500">Sent: {cmp.sentCount} • {new Date(cmp.createdAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                    <div className="text-right text-xs">
                       <div className="font-bold text-slate-700">{cmp.openRate ? `${(cmp.openRate * 100).toFixed(0)}% Open` : `${(cmp.clickRate || 0 * 100).toFixed(0)}% Click`}</div>
                       <Badge variant={cmp.status === 'Sent' ? 'success' : 'default'} className="mt-1">{cmp.status}</Badge>
                    </div>
                 </div>
              ))}
           </div>
        </Card>
        
        <Card className="p-6">
           <h3 className="font-bold text-slate-800 mb-4">Engagement by Channel</h3>
           <div className="h-48 flex items-end justify-between gap-2 px-4 border-b border-slate-200">
              {[65, 40, 75, 50, 85, 60, 90].map((h, i) => (
                 <div key={i} className="w-full bg-primary-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h} Engagements</div>
                 </div>
              ))}
           </div>
           <div className="flex justify-between text-xs text-slate-400 mt-2 px-4">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
           </div>
        </Card>
     </div>
  </div>
);

// --- Email Builder & Campaigns ---
const EmailStudio = ({ autoOpen }: { autoOpen: boolean }) => {
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [activeStep, setActiveStep] = useState(1); // 1: Setup, 2: Audience, 3: Design, 4: Review

   useEffect(() => {
      if (autoOpen) setIsCreateOpen(true);
   }, [autoOpen]);

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Email Campaigns</h2>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus size={16}/> New Campaign</Button>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {MOCK_CAMPAIGNS.filter(c => c.type === 'Email').map(cmp => (
               <Card key={cmp.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                        {cmp.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-900">{cmp.name}</h3>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                           <span className="flex items-center gap-1"><Users size={12}/> {cmp.audience}</span>
                           <span>•</span>
                           <span>Created {new Date(cmp.createdAt).toLocaleDateString()}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-center">
                        <div className="text-xl font-bold text-slate-800">{cmp.openRate ? (cmp.openRate * 100).toFixed(0) : 0}%</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Open Rate</div>
                     </div>
                     <div className="text-center">
                        <div className="text-xl font-bold text-slate-800">{cmp.clickRate ? (cmp.clickRate * 100).toFixed(0) : 0}%</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Click Rate</div>
                     </div>
                     <Badge variant={cmp.status === 'Sent' ? 'success' : cmp.status === 'Scheduled' ? 'warning' : 'default'} className="w-20 justify-center">
                        {cmp.status}
                     </Badge>
                     <Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button>
                  </div>
               </Card>
            ))}
         </div>

         {/* Create Campaign Modal */}
         <Modal isOpen={isCreateOpen} onClose={() => {setIsCreateOpen(false); setActiveStep(1);}} title="Create Email Campaign" size="xl">
            <div className="flex flex-col h-[600px]">
               {/* Stepper */}
               <div className="flex justify-between items-center mb-6 px-12 relative">
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10"></div>
                  {['Setup', 'Audience', 'Design', 'Review'].map((step, i) => (
                     <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div className={cn(
                           "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                           activeStep > i + 1 ? "bg-green-500 border-green-500 text-white" :
                           activeStep === i + 1 ? "bg-primary-600 border-primary-600 text-white" :
                           "bg-white border-slate-200 text-slate-400"
                        )}>
                           {activeStep > i + 1 ? <Check size={14}/> : i + 1}
                        </div>
                        <span className={cn("text-xs font-medium", activeStep === i + 1 ? "text-primary-700" : "text-slate-500")}>{step}</span>
                     </div>
                  ))}
               </div>

               <div className="flex-1 overflow-y-auto px-1">
                  {activeStep === 1 && (
                     <div className="space-y-4 max-w-lg mx-auto">
                        <div><Label>Campaign Name</Label><Input placeholder="e.g. October Newsletter"/></div>
                        <div><Label>Email Subject</Label><Input placeholder="What your clients will see..."/></div>
                        <div><Label>Preview Text</Label><Input placeholder="Optional snippet..."/></div>
                        <div className="grid grid-cols-2 gap-4">
                           <div><Label>From Name</Label><Input defaultValue="Partners Dogs"/></div>
                           <div><Label>From Email</Label><Select><option>info@partnersdogs.com</option></Select></div>
                        </div>
                     </div>
                  )}

                  {activeStep === 2 && (
                     <div className="space-y-4 max-w-lg mx-auto">
                        <Label>Who should receive this email?</Label>
                        <div className="grid grid-cols-1 gap-3">
                           {['All Owners (Active)', 'VIP Clients', 'Expired Vaccinations', 'Puppy Class Interest', 'Manual Selection'].map(seg => (
                              <div key={seg} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 hover:border-primary-300 transition-all group">
                                 <input type="radio" name="segment" className="text-primary-600"/>
                                 <div className="flex-1">
                                    <div className="font-medium text-slate-900">{seg}</div>
                                    <div className="text-xs text-slate-500">Approx. {Math.floor(Math.random() * 500) + 10} recipients</div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeStep === 3 && (
                     <div className="flex h-full border border-slate-200 rounded-lg overflow-hidden">
                        {/* Drag Sidebar */}
                        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-4">
                           <h4 className="text-xs font-bold text-slate-500 uppercase">Blocks</h4>
                           <div className="grid grid-cols-2 gap-2">
                              <div className="p-3 bg-white border border-slate-200 rounded text-center cursor-move hover:shadow-sm">
                                 <ImageIcon size={20} className="mx-auto mb-1 text-slate-400"/> <span className="text-xs">Image</span>
                              </div>
                              <div className="p-3 bg-white border border-slate-200 rounded text-center cursor-move hover:shadow-sm">
                                 <Type size={20} className="mx-auto mb-1 text-slate-400"/> <span className="text-xs">Text</span>
                              </div>
                              <div className="p-3 bg-white border border-slate-200 rounded text-center cursor-move hover:shadow-sm">
                                 <Users size={20} className="mx-auto mb-1 text-slate-400"/> <span className="text-xs">Spacer</span>
                              </div>
                              <div className="p-3 bg-white border border-slate-200 rounded text-center cursor-move hover:shadow-sm">
                                 <LinkIcon size={20} className="mx-auto mb-1 text-slate-400"/> <span className="text-xs">Button</span>
                              </div>
                           </div>
                        </div>
                        {/* Canvas */}
                        <div className="flex-1 bg-white p-8 flex justify-center overflow-y-auto">
                           <div className="w-[600px] min-h-[500px] border border-dashed border-slate-300 rounded p-8 space-y-4">
                              <div className="h-32 bg-slate-100 rounded flex items-center justify-center text-slate-400">Header Image Area</div>
                              <div className="space-y-2">
                                 <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                                 <div className="h-4 bg-slate-50 rounded w-full"></div>
                                 <div className="h-4 bg-slate-50 rounded w-full"></div>
                                 <div className="h-4 bg-slate-50 rounded w-5/6"></div>
                              </div>
                              <div className="flex justify-center pt-4">
                                 <Button>Call to Action</Button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeStep === 4 && (
                     <div className="max-w-lg mx-auto text-center space-y-6 pt-8">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                           <Check size={32}/>
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-slate-900">Ready to Send!</h3>
                           <p className="text-slate-500 mt-2">You are about to send <strong>October Newsletter</strong> to <strong>425 recipients</strong>.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg text-left text-sm space-y-2 border border-slate-200">
                           <div className="flex justify-between"><span className="text-slate-500">Subject:</span> <span className="font-medium">Fall Updates & Tips</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">From:</span> <span className="font-medium">Partners Dogs</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Scheduled:</span> <span className="font-medium">Immediately</span></div>
                        </div>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-between mt-4">
                  <Button variant="ghost" onClick={() => { if(activeStep > 1) setActiveStep(s => s-1); else setIsCreateOpen(false); }}>
                     {activeStep === 1 ? 'Cancel' : 'Back'}
                  </Button>
                  <Button onClick={() => { if(activeStep < 4) setActiveStep(s => s+1); else { alert('Sent!'); setIsCreateOpen(false); }}}>
                     {activeStep === 4 ? 'Send Campaign' : 'Next Step'}
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

// --- SMS Console ---
const SMSConsole = ({ autoOpen }: { autoOpen: boolean }) => {
   const [message, setMessage] = useState('');
   const [isCreateOpen, setIsCreateOpen] = useState(false);

   useEffect(() => {
      if (autoOpen) setIsCreateOpen(true);
   }, [autoOpen]);

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">SMS Broadcasts</h2>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus size={16}/> New Blast</Button>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {MOCK_CAMPAIGNS.filter(c => c.type === 'SMS').map(cmp => (
               <Card key={cmp.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-lg">
                        <MessageSquare size={20}/>
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-900">{cmp.name}</h3>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                           <span className="flex items-center gap-1"><Users size={12}/> {cmp.audience}</span>
                           <span>•</span>
                           <span>Created {new Date(cmp.createdAt).toLocaleDateString()}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-center">
                        <div className="text-xl font-bold text-slate-800">{cmp.sentCount}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Delivered</div>
                     </div>
                     <Badge variant={cmp.status === 'Sent' ? 'success' : cmp.status === 'Scheduled' ? 'warning' : 'default'} className="w-20 justify-center">
                        {cmp.status}
                     </Badge>
                     <Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button>
                  </div>
               </Card>
            ))}
         </div>

         {/* Create SMS Modal */}
         <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create SMS Blast" size="md">
            <div className="space-y-4">
               <div>
                  <Label>Campaign Name</Label>
                  <Input placeholder="Internal name..."/>
               </div>
               <div>
                  <Label>Audience</Label>
                  <Select>
                     <option>Select Segment...</option>
                     <option>All Active Clients</option>
                     <option>Staff Only</option>
                  </Select>
               </div>
               <div>
                  <div className="flex justify-between">
                     <Label>Message</Label>
                     <span className={cn("text-xs", message.length > 160 ? "text-red-500 font-bold" : "text-slate-400")}>{message.length} / 160 chars</span>
                  </div>
                  <Textarea 
                     value={message} 
                     onChange={(e) => setMessage(e.target.value)} 
                     placeholder="Type your message..." 
                     className="h-32 resize-none"
                  />
                  <div className="text-xs text-slate-500 mt-2 flex gap-2">
                     <span className="bg-slate-100 px-1 py-0.5 rounded cursor-pointer hover:bg-slate-200">{'{first_name}'}</span>
                     <span className="bg-slate-100 px-1 py-0.5 rounded cursor-pointer hover:bg-slate-200">{'{opt_out_link}'}</span>
                  </div>
               </div>
               <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={() => { alert('Blast scheduled!'); setIsCreateOpen(false); }}>Schedule Blast</Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

// --- Call Tracking ---
const CallTracking = () => {
   const [isPlaying, setIsPlaying] = useState<string | null>(null);

   const togglePlay = (id: string) => {
      setIsPlaying(isPlaying === id ? null : id);
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Call Logs & Tracking</h2>
            <div className="flex gap-2">
               <Button variant="outline" className="gap-2"><Phone size={16}/> Buy Number</Button>
               <Button variant="outline" className="gap-2"><Download size={16}/> Export</Button>
            </div>
         </div>

         <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                     <th className="px-6 py-3">Direction</th>
                     <th className="px-6 py-3">From / To</th>
                     <th className="px-6 py-3">Duration</th>
                     <th className="px-6 py-3">Time</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Recording</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {MOCK_CALL_LOGS.map(call => (
                     <tr key={call.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 font-medium">
                              {call.direction === 'Inbound' ? <PhoneIncoming size={16} className="text-green-600"/> : <PhoneOutgoing size={16} className="text-blue-600"/>}
                              {call.direction}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{call.direction === 'Inbound' ? call.from : call.to}</span>
                              {call.relatedOwnerId && <span className="text-xs text-primary-600 cursor-pointer hover:underline">{MOCK_OWNERS.find(o=>o.id===call.relatedOwnerId)?.name}</span>}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono">
                           {Math.floor(call.durationSeconds / 60)}:{String(call.durationSeconds % 60).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                           {new Date(call.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant={call.status === 'Answered' ? 'success' : 'danger'}>{call.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                           {call.recordingUrl && (
                              <div className="flex items-center justify-end gap-2">
                                 {isPlaying === call.id ? (
                                    <div className="h-8 bg-slate-100 rounded-full px-3 flex items-center gap-2 animate-pulse min-w-[120px]">
                                       <Pause size={14} className="cursor-pointer" onClick={() => togglePlay(call.id)}/>
                                       <div className="h-1 bg-slate-300 flex-1 rounded-full overflow-hidden">
                                          <div className="h-full bg-primary-500 w-1/2"></div>
                                       </div>
                                    </div>
                                 ) : (
                                    <Button size="icon" variant="ghost" onClick={() => togglePlay(call.id)}><Play size={16}/></Button>
                                 )}
                                 <Button size="icon" variant="ghost"><Download size={16}/></Button>
                              </div>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
   );
};

// --- Admin / Connectors ---
const ConnectorsAdmin = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-lg font-bold text-slate-900">Integrations & Connectors</h2>
               <p className="text-slate-500 text-sm">Manage API keys and providers for marketing channels.</p>
            </div>
            <Button className="gap-2"><Plus size={16}/> Add Provider</Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CONNECTORS.map(conn => (
               <Card key={conn.id} className="p-6 border-t-4 border-t-slate-800 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-700">
                           {conn.provider.charAt(0)}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">{conn.provider}</h3>
                           <div className="text-xs text-slate-500">{conn.type} Service</div>
                        </div>
                     </div>
                     <Switch checked={conn.status === 'Connected'} onCheckedChange={()=>{}} />
                  </div>
                  
                  <div className="space-y-4 flex-1">
                     <div className="bg-slate-50 p-3 rounded border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">API Key</label>
                        <div className="font-mono text-sm text-slate-700 truncate">{conn.apiKeyMasked}</div>
                     </div>
                     {conn.phoneNumber && (
                        <div className="bg-slate-50 p-3 rounded border border-slate-100">
                           <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number</label>
                           <div className="font-mono text-sm text-slate-700">{conn.phoneNumber}</div>
                        </div>
                     )}
                  </div>

                  <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100">
                     <Badge variant={conn.status === 'Connected' ? 'success' : 'danger'}>{conn.status}</Badge>
                     <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800">Configure</Button>
                  </div>
               </Card>
            ))}
            
            <Card className="p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary-300 hover:bg-slate-50 transition-all cursor-pointer min-h-[250px]">
               <Plus size={32} className="mb-2 opacity-50"/>
               <span className="font-medium">Connect New Provider</span>
            </Card>
         </div>
      </div>
   );
};

// --- Main Marketing Component ---

export const Marketing = () => {
   const [activeTab, setActiveTab] = useState('dashboard');
   const [searchParams] = useSearchParams();

   // Handle Deep Links
   useEffect(() => {
      const action = searchParams.get('action');
      if (action === 'new-email') {
         setActiveTab('email');
      } else if (action === 'new-sms') {
         setActiveTab('sms');
      }
   }, [searchParams]);

   return (
      <div className="flex h-[calc(100vh-100px)] gap-6">
         {/* Sidebar Nav */}
         <div className="w-64 shrink-0 flex flex-col gap-1">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 mb-1">Marketing</h1>
               <p className="text-slate-500 text-sm mb-6">Campaigns & Channels</p>
            </div>
            
            {[
               { id: 'dashboard', label: 'Overview', icon: BarChart3 },
               { id: 'email', label: 'Email Campaigns', icon: Mail },
               { id: 'sms', label: 'SMS Broadcasts', icon: MessageSquare },
               { id: 'voice', label: 'Call Tracking', icon: Phone },
               { id: 'connectors', label: 'Connectors', icon: Power },
            ].map(item => (
               <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                     "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                     activeTab === item.id 
                        ? "bg-white shadow-sm text-primary-700 border border-slate-100" 
                        : "text-slate-600 hover:bg-slate-100"
                  )}
               >
                  <item.icon size={18}/> {item.label}
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto pr-2 pb-10">
            {activeTab === 'dashboard' && <MarketingDashboard />}
            {activeTab === 'email' && <EmailStudio autoOpen={searchParams.get('action') === 'new-email'} />}
            {activeTab === 'sms' && <SMSConsole autoOpen={searchParams.get('action') === 'new-sms'} />}
            {activeTab === 'voice' && <CallTracking />}
            {activeTab === 'connectors' && <ConnectorsAdmin />}
         </div>
      </div>
   );
};
