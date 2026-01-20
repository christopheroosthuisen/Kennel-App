
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Owner, Pet, Reservation, CareTask, ReservationStatus, 
  Invoice, Notification, ClassSession, ClassEnrollment, ReportCard 
} from '../types';
import { 
  MOCK_OWNERS, MOCK_PETS, MOCK_RESERVATIONS, MOCK_CARE_TASKS, 
  MOCK_INVOICES, MOCK_NOTIFICATIONS, MOCK_CLASS_SESSIONS, MOCK_CLASS_ENROLLMENTS, MOCK_REPORT_CARDS 
} from '../constants';

// Helper for local storage persistence
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing ${key} to localStorage`, e);
    }
  }, [key, value]);

  return [value, setValue];
}

interface DataContextType {
  owners: Owner[];
  pets: Pet[];
  reservations: Reservation[];
  careTasks: CareTask[];
  invoices: Invoice[];
  notifications: Notification[];
  reportCards: ReportCard[];
  classSessions: ClassSession[];
  classEnrollments: ClassEnrollment[];
  
  // Reservation Actions
  addReservation: (res: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  
  // Directory Actions
  addPet: (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  addOwner: (owner: Owner) => void;
  updateOwner: (id: string, updates: Partial<Owner>) => void;
  
  // Task Actions
  updateCareTask: (id: string, updates: Partial<CareTask>) => void;
  
  // Notification Actions
  addNotification: (note: Notification) => void;
  markNotificationRead: (id: string) => void;

  // Report Card Actions
  updateReportCard: (id: string, updates: Partial<ReportCard>) => void;
  addReportCard: (card: ReportCard) => void;

  // Class Actions
  addClassSession: (session: ClassSession) => void;
  enrollPetInClass: (enrollment: ClassEnrollment) => void;
  updateClassEnrollment: (id: string, updates: Partial<ClassEnrollment>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  // Initialize state with Persistence
  const [owners, setOwners] = useStickyState<Owner[]>(MOCK_OWNERS, 'kennel_owners');
  const [pets, setPets] = useStickyState<Pet[]>(MOCK_PETS, 'kennel_pets');
  const [reservations, setReservations] = useStickyState<Reservation[]>(MOCK_RESERVATIONS, 'kennel_reservations');
  const [careTasks, setCareTasks] = useStickyState<CareTask[]>(MOCK_CARE_TASKS, 'kennel_care_tasks');
  const [invoices, setInvoices] = useStickyState<Invoice[]>(MOCK_INVOICES, 'kennel_invoices');
  const [notifications, setNotifications] = useStickyState<Notification[]>(MOCK_NOTIFICATIONS, 'kennel_notifications');
  const [reportCards, setReportCards] = useStickyState<ReportCard[]>(MOCK_REPORT_CARDS, 'kennel_report_cards');
  const [classSessions, setClassSessions] = useStickyState<ClassSession[]>(MOCK_CLASS_SESSIONS, 'kennel_classes');
  const [classEnrollments, setClassEnrollments] = useStickyState<ClassEnrollment[]>(MOCK_CLASS_ENROLLMENTS, 'kennel_enrollments');

  // Reservation Actions
  const addReservation = (res: Reservation) => {
    setReservations(prev => [...prev, res]);
    const petName = pets.find(p => p.id === res.petId)?.name || 'Pet';
    
    // Auto-create notification
    const newNote: Notification = {
      id: `n-${Date.now()}`,
      title: 'New Reservation Created',
      message: `${petName} has been booked for ${res.type}.`,
      type: 'success',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      read: false,
      relatedPetId: res.petId,
      relatedOwnerId: res.ownerId,
      comments: []
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  // Pet & Owner Actions
  const addPet = (pet: Pet) => setPets(prev => [...prev, pet]);
  const updatePet = (id: string, updates: Partial<Pet>) => setPets(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const addOwner = (owner: Owner) => setOwners(prev => [...prev, owner]);
  const updateOwner = (id: string, updates: Partial<Owner>) => setOwners(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

  // Task Actions
  const updateCareTask = (id: string, updates: Partial<CareTask>) => {
    setCareTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Notification Actions
  const addNotification = (note: Notification) => setNotifications(prev => [note, ...prev]);
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  // Report Card Actions
  const updateReportCard = (id: string, updates: Partial<ReportCard>) => {
    setReportCards(prev => prev.map(rc => rc.id === id ? { ...rc, ...updates } : rc));
  };
  const addReportCard = (card: ReportCard) => setReportCards(prev => [...prev, card]);

  // Class Actions
  const addClassSession = (session: ClassSession) => setClassSessions(prev => [...prev, session]);
  const enrollPetInClass = (enrollment: ClassEnrollment) => setClassEnrollments(prev => [...prev, enrollment]);
  const updateClassEnrollment = (id: string, updates: Partial<ClassEnrollment>) => {
    setClassEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  // Memoize value to prevent re-renders
  const value = useMemo(() => ({
    owners, pets, reservations, careTasks, invoices, notifications, reportCards, classSessions, classEnrollments,
    addReservation, updateReservation, deleteReservation,
    addPet, updatePet,
    addOwner, updateOwner,
    updateCareTask,
    addNotification, markNotificationRead,
    updateReportCard, addReportCard,
    addClassSession, enrollPetInClass, updateClassEnrollment
  }), [owners, pets, reservations, careTasks, invoices, notifications, reportCards, classSessions, classEnrollments]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
