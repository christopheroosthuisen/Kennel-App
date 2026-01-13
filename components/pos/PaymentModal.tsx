
import React, { useState } from 'react';
import { Modal, Button, Input, cn } from '../Common';
import { formatMoney } from '../../shared/utils';
import { CreditCard, Banknote, Check, Trash2 } from 'lucide-react';
import { PaymentMethod } from '../../types/retail';
import { usePosStore } from '../../store/pos-store';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalDue: number;
}

export const PaymentModal = ({ isOpen, onClose, totalDue }: PaymentModalProps) => {
  const { clearCart } = usePosStore();
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [currentAmountInput, setCurrentAmountInput] = useState('');

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = totalDue - totalPaid;
  const changeDue = totalPaid - totalDue;
  const isComplete = totalPaid >= totalDue;

  // Use current input or default to full remaining
  const amountToApply = currentAmountInput ? Math.round(parseFloat(currentAmountInput) * 100) : remaining;

  const addPayment = (type: PaymentMethod['type']) => {
    if (amountToApply <= 0 && type !== 'CASH') return; // Allow cash overpayment

    const newPayment: PaymentMethod = {
      type,
      amount: amountToApply,
      reference: type === 'CARD' ? `Auth-${Math.random().toString(36).substr(2, 4).toUpperCase()}` : undefined
    };

    setPayments([...payments, newPayment]);
    setCurrentAmountInput('');
  };

  const handleComplete = () => {
    // In real app, submit order to API here
    clearCart();
    setPayments([]);
    onClose();
    // Maybe show success toast
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment" size="lg">
      <div className="flex flex-col h-[500px]">
        
        {/* Top Summary */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <div className="text-xs font-bold text-slate-500 uppercase">Total Due</div>
            <div className="text-2xl font-black text-slate-900">{formatMoney(totalDue)}</div>
          </div>
          <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <div className="text-xs font-bold text-green-600 uppercase">Paid So Far</div>
            <div className="text-2xl font-black text-green-700">{formatMoney(totalPaid)}</div>
          </div>
          <div className={cn("flex-1 p-4 rounded-lg border text-center", isComplete ? "bg-slate-100 border-slate-200" : "bg-red-50 border-red-200")}>
            <div className={cn("text-xs font-bold uppercase", isComplete ? "text-slate-500" : "text-red-600")}>
              {isComplete ? 'Change Due' : 'Remaining'}
            </div>
            <div className={cn("text-2xl font-black", isComplete ? "text-slate-900" : "text-red-700")}>
              {isComplete ? formatMoney(changeDue) : formatMoney(remaining)}
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-1">
          {/* LEFT: Input Pad */}
          <div className="w-1/2 flex flex-col gap-4">
            {!isComplete && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Amount to Tender</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                    <Input 
                      className="h-16 pl-10 text-3xl font-bold"
                      value={currentAmountInput}
                      onChange={(e) => setCurrentAmountInput(e.target.value)}
                      placeholder={(remaining / 100).toFixed(2)}
                      autoFocus
                      type="number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-16 flex-col gap-1 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => addPayment('CARD')}>
                    <CreditCard size={20} /> Card
                  </Button>
                  <Button className="h-16 flex-col gap-1 text-lg bg-green-600 hover:bg-green-700" onClick={() => addPayment('CASH')}>
                    <Banknote size={20} /> Cash
                  </Button>
                </div>

                {/* Smart Cash Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 50, 100].map(val => (
                    <Button 
                      key={val} 
                      variant="outline" 
                      className="h-12 font-bold"
                      onClick={() => {
                        setCurrentAmountInput(val.toString());
                        // Optional: auto-submit cash on click? Better to fill input first.
                      }}
                    >
                      ${val}
                    </Button>
                  ))}
                  <Button variant="outline" className="h-12 font-bold" onClick={() => setCurrentAmountInput((remaining / 100).toString())}>
                    Exact
                  </Button>
                </div>
              </>
            )}
            
            {isComplete && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-xl font-bold text-green-900">Payment Complete</h3>
                <p className="text-green-700 mt-2">
                  Change Due: <strong>{formatMoney(changeDue)}</strong>
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Payment List */}
          <div className="w-1/2 border-l border-slate-100 pl-6 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-3">Tenders</h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded shadow-sm">
                  <div className="flex items-center gap-2">
                    {p.type === 'CARD' ? <CreditCard size={16} className="text-blue-500"/> : <Banknote size={16} className="text-green-500"/>}
                    <span className="font-medium text-slate-700">{p.type}</span>
                    {p.reference && <span className="text-xs text-slate-400 font-mono px-1.5 py-0.5 bg-slate-100 rounded">{p.reference}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatMoney(p.amount)}</span>
                    <button 
                      onClick={() => setPayments(payments.filter((_, idx) => idx !== i))}
                      className="text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="text-center text-slate-400 py-10 italic">No payments added</div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-auto flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            className="w-48 bg-slate-900 text-white" 
            disabled={!isComplete} 
            onClick={handleComplete}
          >
            Finalize Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};
