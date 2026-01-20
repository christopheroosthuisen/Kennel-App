
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Owner, Pet, Reservation, CareTask, ReservationStatus, 
  ServiceType, Invoice, Notification, ClassSession, ClassEnrollment, ReportCard 
} from '../types';
import { 
  MOCK_OWNERS, MOCK_PETS, MOCK_RESERVATIONS, MOCK_CARE_TASKS, 
  MOCK_INVOICES, MOCK_NOTIFICATIONS, MOCK_CLASS_SESSIONS, MOCK_CLASS_ENROLLMENTS, MOCK_REPORT_CARDS 
} from '../constants';

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
  // Initialize state with Mocks
  const [owners, setOwners] = useState<Owner[]>(MOCK_OWNERS);
  const [pets, setPets] = useState<Pet[]>(MOCK_PETS);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [careTasks, setCareTasks] = useState<CareTask[]>(MOCK_CARE_TASKS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [reportCards, setReportCards] = useState<ReportCard[]>(MOCK_REPORT_CARDS);
  const [classSessions, setClassSessions] = useState<ClassSession[]>(MOCK_CLASS_SESSIONS);
  const [classEnrollments, setClassEnrollments] = useState<ClassEnrollment[]>(MOCK_CLASS_ENROLLMENTS);

  // Reservation Actions
  const addReservation = (res: Reservation) => {
    setReservations(prev => [...prev, res]);
    // Auto-create notification
    const petName = pets.find(p => p.id === res.petId)?.name || 'Pet';
    addNotification({
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
    });
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

  return (
    <DataContext.Provider value={{
      owners, pets, reservations, careTasks, invoices, notifications, reportCards, classSessions, classEnrollments,
      addReservation, updateReservation, deleteReservation,
      addPet, updatePet,
      addOwner, updateOwner,
      updateCareTask,
      addNotification, markNotificationRead,
      updateReportCard, addReportCard,
      addClassSession, enrollPetInClass, updateClassEnrollment
    }}>
      {children}
    </DataContext.Provider>
  );
};
