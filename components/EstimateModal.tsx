
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Printer, DollarSign, CreditCard, Plus, Trash2, Edit2, Save, 
  Send, Calculator, Percent, Calendar, CheckCircle, AlertCircle, MessageCircle 
} from 'lucide-react';
import { Modal, Button, Input, Select, Badge, cn, Label } from './Common';
import { MOCK_RESERVATIONS, MOCK_PETS, MOCK_OWNERS, MOCK_SERVICE_CONFIGS } from '../constants';
import { ReservationStatus } from '../types';
import { useTeamChat } from './TeamChatContext';

interface EstimateModalProps {
  reservationId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface LineItem {
  id: string;
  description: string;
  category: 'Service' | 'Add-on' | 'Product' | 'Adjustment' | 'Discount' | 'Tax';
  quantity: number;
  rate: number;
  taxable: boolean;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: 'Credit Card' | 'Cash' | 'Check' | 'Store Credit';
  reference?: string;
}

export const EstimateModal = ({ reservationId, isOpen, onClose }: EstimateModalProps) => {
  const reservation = MOCK_RESERVATIONS.find(r => r.id === reservationId);
  const pet = MOCK_PETS.find(p => p.id === reservation?.petId);
  const owner = MOCK_OWNERS.find(o => o.id === reservation?.ownerId);
  const { openDiscuss } = useTeamChat();

  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState<LineItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [showPaymentInput, setShowPaymentInput] = useState(false);

  // Initialize Data
  useEffect(() => {
    if (reservation && pet && isOpen) {
      // Calculate Duration
      const start = new Date(reservation.checkIn);
      const end = new Date(reservation.checkOut);
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      const serviceConfig = MOCK_SERVICE_CONFIGS.find(s => s.type === reservation.type);
      const baseRate = serviceConfig?.baseRate || 50;

      const initialItems: LineItem[] = [
        {
          id: 'base-service',
          description: `${reservation.type} (${pet.name})`,
          category: 'Service',
          quantity: duration,
          rate: baseRate,
          taxable: true
        }
      ];

      // Add Services
      reservation.services.forEach((serviceName, idx) => {
        // Mock lookup for service price
        let price = 15;
        if (serviceName.includes('Bath')) price = 30;
        
        initialItems.push({
          id: `svc-${idx}`,
          description: serviceName,
          category: 'Add-on',
          quantity: 1, // Default to 1 for now, logic could be more complex
          rate: price,
          taxable: true
        });
      });

      setItems(initialItems);
      
      // Mock existing payments if any (random logic for demo)
      if (reservation.status === 'Checked Out') {
         // If checked out, assume fully paid for demo
         setPayments([{ id: 'p1', date: new Date().toISOString(), amount: 0, method: 'Credit Card' }]); // Amount calc handled below
      } else {
         setPayments([]);
      }
    }
  }, [reservation, pet, isOpen]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxableAmount = items.filter(i => i.taxable).reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxRate = 0.08; // 8%
  const tax = taxableAmount * taxRate;
  const total = subtotal + tax;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = total - totalPaid;

  // Handlers
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      description: 'New Item',
      category: 'Adjustment',
      quantity: 1,
      rate: 0,
      taxable: true
    };
    setItems([...items, newItem]);
  };

  const handleAddDiscount = () => {
    const newItem: LineItem = {
      id: `disc-${Date.now()}`,
      description: 'Discount / Adjustment',
      category: 'Discount',
      quantity: 1,
      rate: -10.00,
      taxable: false
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleApplyPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount: amount,
      method: paymentMethod as any
    };

    setPayments([...payments, newPayment]);
    setPaymentAmount('');
    setShowPaymentInput(false);
  };

  const handleRequestApproval = () => {
     openDiscuss({
        type: 'estimate',
        id: reservationId,
        title: `Estimate Review: ${owner?.name}`,
        subtitle: `Total: $${total.toFixed(2)}`
     });
  };

  if (!reservation || !owner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Estimate & Billing" size="lg">
      <div className="flex flex-col h-[700px]">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 bg-white">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                 <Calculator size={20}/>
              </div>
              <div>
                 <h2 className="text-lg font-bold text-slate-900">Estimate #{reservation.id}</h2>
                 <p className="text-xs text-slate-500">Created: {new Date(reservation.checkIn).toLocaleDateString()}</p>
              </div>
           </div>
           <div className="flex gap-2">
              {!isEditing ? (
                 <>
                    <Button variant="ghost" className="gap-2 text-primary-600 bg-primary-50 hover:bg-primary-100" onClick={handleRequestApproval}>
                        <MessageCircle size={14}/> Ask Team
                    </Button>
                    <div className="w-px h-8 bg-slate-200 mx-1"></div>
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2"><Edit2 size={14}/> Edit Estimate</Button>
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}><Printer size={14}/> Print</Button>
                    <Button variant="primary" className="gap-2"><Send size={14}/> Email to Owner</Button>
                 </>
              ) : (
                 <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setIsEditing(false)} className="gap-2 bg-green-600 hover:bg-green-700 border-none"><Save size={14}/> Save Changes</Button>
                 </>
              )}
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden gap-6">
           
           {/* Left: Invoice Body */}
           <div className="flex-1 flex flex-col overflow-y-auto pr-2">
              
              {/* Customer Header */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex justify-between">
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bill To</h4>
                    <div className="font-bold text-slate-900">{owner.name}</div>
                    <div className="text-sm text-slate-600">{owner.address}</div>
                    <div className="text-sm text-slate-600">{owner.email}</div>
                 </div>
                 <div className="text-right">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reservation Details</h4>
                    <div className="text-sm font-medium">{pet?.name} ({pet?.breed})</div>
                    <div className="text-sm text-slate-600">
                       {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
                    </div>
                    <Badge variant={reservation.status === 'Checked In' ? 'success' : 'default'} className="mt-1">{reservation.status}</Badge>
                 </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                       <tr>
                          <th className="px-4 py-3 w-1/2">Description</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Rate</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          {isEditing && <th className="px-4 py-3 w-10"></th>}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {items.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50 group">
                             <td className="px-4 py-3">
                                {isEditing ? (
                                   <Input 
                                      value={item.description} 
                                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                      className="h-8 text-sm"
                                   />
                                ) : (
                                   <div>
                                      <div className={cn("font-medium", item.rate < 0 ? "text-red-600" : "text-slate-800")}>{item.description}</div>
                                      <div className="text-xs text-slate-400">{item.category}</div>
                                   </div>
                                )}
                             </td>
                             <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                   <Input 
                                      type="number" 
                                      value={item.quantity} 
                                      onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value))}
                                      className="h-8 w-16 text-center mx-auto"
                                   />
                                ) : item.quantity}
                             </td>
                             <td className="px-4 py-3 text-right">
                                {isEditing ? (
                                   <Input 
                                      type="number" 
                                      value={item.rate} 
                                      onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value))}
                                      className="h-8 w-24 text-right ml-auto"
                                   />
                                ) : (
                                   <span className={item.rate < 0 ? "text-red-600" : ""}>${Math.abs(item.rate).toFixed(2)}</span>
                                )}
                             </td>
                             <td className="px-4 py-3 text-right font-medium">
                                <span className={item.rate * item.quantity < 0 ? "text-red-600" : ""}>
                                   ${(item.rate * item.quantity).toFixed(2)}
                                </span>
                             </td>
                             {isEditing && (
                                <td className="px-4 py-3 text-center">
                                   <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500">
                                      <Trash2 size={16}/>
                                   </button>
                                </td>
                             )}
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {isEditing && (
                    <div className="bg-slate-50 p-3 border-t border-slate-200 flex gap-2">
                       <Button size="sm" variant="outline" onClick={handleAddItem} className="gap-2 bg-white"><Plus size={14}/> Add Item</Button>
                       <Button size="sm" variant="outline" onClick={handleAddDiscount} className="gap-2 bg-white text-red-600 border-red-200 hover:bg-red-50"><Percent size={14}/> Add Discount</Button>
                    </div>
                 )}
              </div>

              {/* Payments List */}
              {payments.length > 0 && (
                 <div className="mb-6">
                    <h4 className="font-bold text-slate-800 mb-2 text-sm">Payments Applied</h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                       {payments.map(p => (
                          <div key={p.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 bg-green-50/50">
                             <div className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-600"/>
                                <span className="font-medium text-sm">{new Date(p.date).toLocaleDateString()}</span>
                                <span className="text-xs text-slate-500">• {p.method}</span>
                             </div>
                             <div className="font-bold text-green-700">-${p.amount.toFixed(2)}</div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </div>

           {/* Right: Totals & Payment Action */}
           <div className="w-80 shrink-0 flex flex-col gap-6">
              <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Summary</h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-300">
                       <span>Subtotal</span>
                       <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                       <span>Tax (8.0%)</span>
                       <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <div className="flex justify-between text-xl font-bold">
                       <span>Total</span>
                       <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                       <span>Paid</span>
                       <span>-${totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <div className="flex justify-between text-2xl font-bold text-white">
                       <span>Due</span>
                       <span>${balanceDue.toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              {/* Payment Terminal */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                 {!showPaymentInput ? (
                    <Button 
                       className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95"
                       onClick={() => setShowPaymentInput(true)}
                       disabled={balanceDue <= 0}
                    >
                       <CreditCard size={20} className="mr-2"/>
                       {balanceDue <= 0 ? 'Paid in Full' : 'Take Payment'}
                    </Button>
                 ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                       <Label>Payment Amount</Label>
                       <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                          <Input 
                             value={paymentAmount} 
                             onChange={(e) => setPaymentAmount(e.target.value)} 
                             className="pl-9 font-bold text-lg" 
                             placeholder={balanceDue.toFixed(2)}
                             autoFocus
                          />
                       </div>
                       
                       <Label>Method</Label>
                       <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                          <option>Credit Card</option>
                          <option>Cash</option>
                          <option>Check</option>
                          <option>Store Credit</option>
                       </Select>

                       <div className="flex gap-2 pt-2">
                          <Button variant="ghost" className="flex-1" onClick={() => setShowPaymentInput(false)}>Cancel</Button>
                          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleApplyPayment}>Charge</Button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </Modal>
  );
};
