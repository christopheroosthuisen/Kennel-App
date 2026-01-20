
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalIcon, Filter, Plus, 
  Clock, CheckCircle, LogIn, LogOut, Scissors, GraduationCap, MapPin, 
  MoreHorizontal, Users, Map
} from 'lucide-react';
import { Card, Button, Select, Badge, cn, Modal, Label, Input, Textarea, Tabs } from './Common';
import { EditReservationModal } from './EditModals';
import { MOCK_CLASS_TYPES, MOCK_UNITS } from '../constants';
import { ReservationStatus, ServiceType } from '../types';
import { useData } from './DataContext';
import { FacilityMap } from './FacilityMap';

// --- Types for Calendar ---

type ViewMode = 'facility' | 'lodging' | 'map';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'arrival' | 'departure' | 'service' | 'class' | 'block';
  start: Date;
  end?: Date;
  petName?: string;
  details?: string;
  color?: string;
}

// --- Components ---

const DayCell = ({ date, isToday, isSelected, onClick, events }: { date: Date, isToday: boolean, isSelected: boolean, onClick: () => void, events: CalendarEvent[] }) => {
  const maxDisplay = 3;
  const overflow = events.length - maxDisplay;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "min-h-[120px] p-2 border-b border-r border-slate-100 transition-colors cursor-pointer flex flex-col gap-1 hover:bg-slate-50 relative group",
        isToday ? "bg-slate-50/50" : "bg-white",
        isSelected ? "ring-2 ring-inset ring-primary-500 z-10" : ""
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={cn(
          "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
          isToday ? "bg-primary-600 text-white" : "text-slate-700"
        )}>
          {date.getDate()}
        </span>
        {events.length > 0 && <span className="text-[10px] text-slate-400 font-medium">{events.length} events</span>}
      </div>

      <div className="space-y-1 flex-1">
        {events.slice(0, maxDisplay).map(evt => (
          <div key={evt.id} className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border truncate", evt.color)}>
            {evt.type === 'arrival' && <span className="mr-1">↓</span>}
            {evt.type === 'departure' && <span className="mr-1">↑</span>}
            {evt.title}
          </div>
        ))}
        {overflow > 0 && (
          <div className="text-[10px] text-slate-400 pl-1 hover:text-primary-600">+ {overflow} more</div>
        )}
      </div>
      
      {/* Quick Add Button on Hover */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="h-6 w-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white shadow-sm">
            <Plus size={14}/>
         </div>
      </div>
    </div>
  );
};

const FacilityScheduleView = ({ currentDate, setCurrentDate }: { currentDate: Date, setCurrentDate: (d: Date) => void }) => {
  const { reservations, pets, classSessions } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Generate calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  
  // Fillers for grid
  const prefixDays = Array.from({ length: startDayOfWeek }, (_, i) => {
    const d = new Date(year, month, 0);
    d.setDate(d.getDate() - (startDayOfWeek - 1 - i));
    return d;
  });
  
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    return new Date(year, month, i + 1);
  });

  const allDays = [...prefixDays, ...currentMonthDays];
  const remainingSlots = 42 - allDays.length; // 6 rows * 7 cols
  const suffixDays = Array.from({ length: remainingSlots }, (_, i) => {
    return new Date(year, month + 1, i + 1);
  });
  
  const calendarGrid = [...allDays, ...suffixDays];

  // Logic to get events
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const dateStr = date.toDateString();

    reservations.forEach(res => {
      const pet = pets.find(p => p.id === res.petId);
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);

      // Arrivals
      if (checkIn.toDateString() === dateStr) {
        if (res.type === ServiceType.Grooming || res.type === ServiceType.Training) {
          events.push({
            id: `serv-${res.id}`,
            title: `${res.type}: ${pet?.name}`,
            type: 'service',
            start: checkIn,
            petName: pet?.name,
            details: res.services.join(', '),
            color: res.type === ServiceType.Grooming ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
          });
        } else {
          events.push({
            id: `in-${res.id}`,
            title: `In: ${pet?.name} (${res.type})`,
            type: 'arrival',
            start: checkIn,
            petName: pet?.name,
            details: res.lodging,
            color: 'bg-green-100 text-green-700 border-green-200'
          });
        }
      }

      // Departures
      if (checkOut.toDateString() === dateStr && (res.type === ServiceType.Boarding || res.type === ServiceType.Daycare)) {
        events.push({
          id: `out-${res.id}`,
          title: `Out: ${pet?.name}`,
          type: 'departure',
          start: checkOut,
          petName: pet?.name,
          color: 'bg-amber-100 text-amber-700 border-amber-200'
        });
      }
    });

    classSessions.forEach(cls => {
      const classStart = new Date(cls.startTime);
      if (classStart.toDateString() === dateStr) {
         const classType = MOCK_CLASS_TYPES.find(ct => ct.id === cls.classTypeId);
         const end = new Date(classStart.getTime() + cls.durationMinutes * 60000);
         
         events.push({
           id: `class-${cls.id}`,
           title: classType?.name || 'Group Class',
           type: 'class',
           start: classStart,
           end: end,
           details: `Capacity: ${cls.capacity}`,
           color: classType?.color || 'bg-blue-50 text-blue-700 border-blue-200'
         });
      }
    });

    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  // Side Panel Data
  const selectedDateEvents = getEventsForDate(selectedDate);

  const stats = useMemo(() => {
     let ins = 0, outs = 0, serv = 0;
     selectedDateEvents.forEach(e => {
        if (e.type === 'arrival') ins++;
        else if (e.type === 'departure') outs++;
        else if (e.type === 'service') serv++;
     });
     return { ins, outs, serv };
  }, [selectedDateEvents]);

  return (
    <div className="flex h-full gap-6 animate-in fade-in duration-300">
      {/* Main Calendar Grid */}
      <Card className="flex-1 flex flex-col shadow-sm border-slate-200">
         {/* Weekday Headers */}
         <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
               <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {day}
               </div>
            ))}
         </div>
         
         {/* Days Grid */}
         <div className="grid grid-cols-7 grid-rows-6 flex-1 bg-slate-100 gap-px border-b border-slate-200">
            {calendarGrid.map((date, idx) => {
               const isCurrentMonth = date.getMonth() === month;
               const isToday = date.toDateString() === new Date().toDateString();
               const isSelected = date.toDateString() === selectedDate.toDateString();
               
               return (
                  <div key={idx} className={cn("bg-white", !isCurrentMonth && "bg-slate-50/30 text-slate-400")}>
                     <DayCell 
                        date={date} 
                        isToday={isToday} 
                        isSelected={isSelected}
                        onClick={() => setSelectedDate(date)} 
                        events={getEventsForDate(date)}
                     />
                  </div>
               );
            })}
         </div>
      </Card>

      {/* Daily Agenda Sidebar */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
         <Card className="p-4 bg-white border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-1">
               {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="flex gap-2 mt-4 text-xs">
               <div className="flex-1 p-2 bg-green-50 rounded border border-green-100 text-center">
                  <div className="font-bold text-green-700 text-lg">{stats.ins}</div>
                  <div className="text-green-600">Arriving</div>
               </div>
               <div className="flex-1 p-2 bg-amber-50 rounded border border-amber-100 text-center">
                  <div className="font-bold text-amber-700 text-lg">{stats.outs}</div>
                  <div className="text-amber-600">Departing</div>
               </div>
               <div className="flex-1 p-2 bg-purple-50 rounded border border-purple-100 text-center">
                  <div className="font-bold text-purple-700 text-lg">{stats.serv}</div>
                  <div className="text-purple-600">Services</div>
               </div>
            </div>
         </Card>

         <Card className="flex-1 flex flex-col overflow-hidden bg-white border-slate-200">
            <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
               <span>Timeline</span>
               <Filter size={12} className="cursor-pointer hover:text-primary-600"/>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
               {selectedDateEvents.length > 0 ? (
                  <div className="relative">
                     {/* Time indicators line */}
                     <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 z-0"></div>
                     
                     {selectedDateEvents.map((evt, i) => (
                        <div key={i} className="relative z-10 pl-8 pr-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                           {/* Dot */}
                           <div className={cn("absolute left-[13px] top-5 h-2 w-2 rounded-full border-2 border-white ring-1 ring-slate-300", 
                              evt.type === 'arrival' ? 'bg-green-500 ring-green-200' : 
                              evt.type === 'departure' ? 'bg-amber-500 ring-amber-200' :
                              evt.type === 'service' ? 'bg-purple-500 ring-purple-200' : 
                              evt.type === 'class' ? 'bg-pink-500 ring-pink-200' : 'bg-blue-500 ring-blue-200'
                           )}></div>
                           
                           <div className="flex justify-between items-start">
                              <span className="font-mono text-xs text-slate-500 font-medium">
                                 {evt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 opacity-0 group-hover:opacity-100"><MoreHorizontal size={14}/></Button>
                           </div>
                           
                           <div className="mt-1">
                              <div className="font-bold text-sm text-slate-800">{evt.title}</div>
                              {evt.details && <div className="text-xs text-slate-500 mt-0.5">{evt.details}</div>}
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                     <Clock size={24} className="mb-2 opacity-50"/>
                     <span className="text-sm">No events scheduled</span>
                  </div>
               )}
            </div>
            <div className="p-3 border-t border-slate-100">
               <Button className="w-full gap-2" variant="outline"><Plus size={14}/> Add Appointment</Button>
            </div>
         </Card>
      </div>
    </div>
  );
};

const LodgingOccupancyView = ({ currentDate, setCurrentDate }: { currentDate: Date, setCurrentDate: (d: Date) => void }) => {
  const { reservations, pets } = useData();
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const daysToShow = 14; 
  
  // Generate dates
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <>
      <Card className="flex-1 overflow-auto border border-slate-300 shadow-inner bg-slate-50 animate-in fade-in duration-300">
        <div className="min-w-[1200px]">
          {/* Header Row */}
          <div className="grid sticky top-0 z-20 bg-white shadow-sm" style={{ gridTemplateColumns: `180px repeat(${daysToShow}, 1fr)` }}>
            <div className="p-3 border-b border-r border-slate-200 font-bold text-slate-500 text-xs uppercase bg-slate-50 flex items-center pl-6">Unit / Date</div>
            {dates.map(date => {
               const isWeekend = date.getDay() === 0 || date.getDay() === 6;
               return (
                 <div key={date.toISOString()} className={cn("p-2 border-b border-r border-slate-200 text-center min-w-[60px]", date.toDateString() === new Date().toDateString() ? "bg-blue-50" : isWeekend ? "bg-slate-50/50" : "")}>
                   <div className={cn("font-bold text-xs uppercase", isWeekend ? "text-slate-400" : "text-slate-600")}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                   <div className="text-lg font-light text-slate-900">{date.getDate()}</div>
                 </div>
               )
            })}
          </div>

          {/* Rows */}
          {MOCK_UNITS.map(unit => (
            <div key={unit.id} className="grid bg-white hover:bg-slate-50 transition-colors" style={{ gridTemplateColumns: `180px repeat(${daysToShow}, 1fr)` }}>
               {/* Unit Label */}
               <div className="p-3 border-b border-r border-slate-200 sticky left-0 bg-white z-10 flex flex-col justify-center pl-6 border-l-4" style={{ borderLeftColor: unit.status === 'Active' ? 'transparent' : '#f59e0b' }}>
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     {unit.name}
                     {unit.status !== 'Active' && <Badge variant="warning" className="text-[9px] px-1 py-0 h-4">Maint</Badge>}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase mt-0.5">{unit.type} • {unit.size}</span>
               </div>
               
               {/* Days Cells */}
               {dates.map(date => {
                 // Mock collision detection
                 const res = reservations.find(r => 
                    r.lodging === unit.id && 
                    new Date(r.checkIn) <= date && 
                    new Date(r.checkOut) >= date
                 );
                 const pet = res ? pets.find(p => p.id === res.petId) : null;
                 
                 // Determine cell style based on reservation part
                 const isCheckIn = res && new Date(res.checkIn).toDateString() === date.toDateString();
                 const isCheckOut = res && new Date(res.checkOut).toDateString() === date.toDateString();
                 
                 return (
                   <div key={date.toISOString()} className="border-b border-r border-slate-100 h-14 relative p-1">
                      {res && pet && (
                        <div 
                          className={cn(
                            "w-full h-full rounded flex items-center px-1 gap-1.5 shadow-sm cursor-pointer hover:shadow-md transition-all text-xs overflow-hidden opacity-90 hover:opacity-100",
                            res.status === 'Checked In' ? "bg-blue-100 text-blue-900 border border-blue-200" : "bg-green-50 text-green-900 border border-green-200",
                            isCheckIn ? "ml-1" : "rounded-l-none border-l-0",
                            isCheckOut ? "mr-1" : "rounded-r-none border-r-0"
                          )} 
                          title={`${pet.name} (${res.status}) - Click to Edit Lodging`}
                          onClick={() => setSelectedResId(res.id)}
                        >
                          {isCheckIn && (
                             <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-black/5">
                                <img src={pet.photoUrl} className="h-full w-full object-cover" alt=""/>
                             </div>
                          )}
                          <span className="font-bold truncate">{pet.name}</span>
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          ))}
        </div>
      </Card>

      {/* Direct Edit Modal from Calendar */}
      {selectedResId && (
        <EditReservationModal 
          isOpen={true} 
          onClose={() => setSelectedResId(null)} 
          id={selectedResId} 
        />
      )}
    </>
  );
};

// --- Main Calendar Component ---

export const CalendarView = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('facility');
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);

  const handlePrev = () => {
     const d = new Date(viewDate);
     if (viewMode === 'facility') d.setMonth(d.getMonth() - 1);
     else d.setDate(d.getDate() - 7);
     setViewDate(d);
  };

  const handleNext = () => {
     const d = new Date(viewDate);
     if (viewMode === 'facility') d.setMonth(d.getMonth() + 1);
     else d.setDate(d.getDate() + 7);
     setViewDate(d);
  };

  const handleToday = () => setViewDate(new Date());

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CalIcon size={24} className="text-primary-600"/>
              Calendar
           </h1>
           <div className="h-8 w-px bg-slate-200"/>
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                 onClick={() => setViewMode('facility')}
                 className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", viewMode === 'facility' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                 Facility Schedule
              </button>
              <button 
                 onClick={() => setViewMode('lodging')}
                 className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", viewMode === 'lodging' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                 Lodging Occupancy
              </button>
              <button 
                 onClick={() => setViewMode('map')}
                 className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", viewMode === 'map' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                 Facility Map
              </button>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="ghost" onClick={handleToday}>Today</Button>
           <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm">
              <Button variant="ghost" size="icon" onClick={handlePrev} className="border-r border-slate-100 rounded-r-none"><ChevronLeft size={16}/></Button>
              <span className="min-w-[140px] text-center font-bold text-slate-700 px-2 select-none">
                 {viewMode === 'facility' 
                    ? viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : `Week of ${viewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                 }
              </span>
              <Button variant="ghost" size="icon" onClick={handleNext} className="border-l border-slate-100 rounded-l-none"><ChevronRight size={16}/></Button>
           </div>
           
           <div className="w-px h-8 bg-slate-200 mx-2"/>
           
           <Button className="gap-2" onClick={() => setIsNewEventOpen(true)}><Plus size={16}/> New Event</Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
         {viewMode === 'facility' && (
            <FacilityScheduleView currentDate={viewDate} setCurrentDate={setViewDate} />
         )}
         {viewMode === 'lodging' && (
            <LodgingOccupancyView currentDate={viewDate} setCurrentDate={setViewDate} />
         )}
         {viewMode === 'map' && (
            <FacilityMap />
         )}
      </div>
      
      {/* New Event Modal */}
      <Modal isOpen={isNewEventOpen} onClose={() => setIsNewEventOpen(false)} title="Create Calendar Event" size="md">
         <div className="space-y-4">
            <div><Label>Event Title</Label><Input placeholder="e.g. Kennel Maintenance"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date</Label><Input type="date"/></div>
              <div><Label>Time</Label><Input type="time"/></div>
            </div>
            <div><Label>Category</Label><Select><option>Staff Block</option><option>Maintenance</option><option>Holiday</option><option>Class</option></Select></div>
            <div><Label>Notes</Label><Textarea placeholder="Details..."/></div>
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
               <Button variant="ghost" onClick={() => setIsNewEventOpen(false)}>Cancel</Button>
               <Button onClick={() => setIsNewEventOpen(false)}>Create Event</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
