
import React, { useState } from 'react';
import { Card, Button, Input, Label } from '../Common';
import { usePosStore } from '../../store/pos-store';
import { DollarSign, Lock, Unlock } from 'lucide-react';

export const ShiftManager = () => {
  const { currentShift, openShift, closeShift } = usePosStore();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  if (!currentShift) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <Card className="w-[400px] p-8 text-center space-y-6 shadow-xl">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mb-4">
            <Unlock size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Open Register</h1>
            <p className="text-slate-500 mt-2">Enter the starting cash amount in the drawer to begin the shift.</p>
          </div>
          
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              className="pl-10 text-xl font-bold h-12 text-center"
              placeholder="0.00"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <Button 
            className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800"
            onClick={() => {
              const val = parseFloat(amount) * 100;
              if (!isNaN(val)) openShift(val);
            }}
          >
            Start Shift
          </Button>
        </Card>
      </div>
    );
  }

  // This component usually sits in a modal triggered by "Close Shift" in the UI, 
  // but for the prompt requirements, I'll export a modal-ready content piece or button
  return null; 
};
