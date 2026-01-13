
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Label, Badge } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { Estimate, EstimateLineItem } from '../../shared/domain';
import { DollarSign, Check, Send } from 'lucide-react';

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId?: string; // If creating new
  estimateId?: string; // If viewing existing
}

export const EstimateModal = ({ isOpen, onClose, reservationId, estimateId }: EstimateModalProps) => {
  const [currentEstimateId, setCurrentEstimateId] = useState(estimateId);
  
  // Create if needed
  useEffect(() => {
    const init = async () => {
      if (isOpen && reservationId && !currentEstimateId) {
        try {
          const res = await api.createEstimate(reservationId);
          setCurrentEstimateId(res.data.id);
        } catch (e) {
          alert('Failed to generate estimate');
          onClose();
        }
      }
    };
    init();
  }, [isOpen, reservationId, currentEstimateId]);

  const { data: estimate, refetch } = useApiQuery(
    currentEstimateId ? `est-${currentEstimateId}` : 'noop', 
    () => api.getEstimate(currentEstimateId!),
    [currentEstimateId]
  );

  const [discountInput, setDiscountInput] = useState('0');

  useEffect(() => {
    if (estimate) setDiscountInput((estimate.discount / 100).toString());
  }, [estimate]);

  if (!estimate) return null;

  const handleUpdate = async () => {
    const discCents = Math.round(parseFloat(discountInput) * 100);
    await api.updateEstimate(estimate.id, { discount: discCents });
    refetch();
  };

  const handleAccept = async () => {
    await api.acceptEstimate(estimate.id);
    refetch();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Estimate #${estimate.id.slice(-6)}`} size="lg">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
           <div>
              <div className="text-sm text-slate-500">Total Estimate</div>
              <div className="text-3xl font-bold text-slate-900">${(estimate.total / 100).toFixed(2)}</div>
           </div>
           <Badge variant={estimate.status === 'Accepted' ? 'success' : 'default'} className="text-sm px-3 py-1">
              {estimate.status}
           </Badge>
        </div>

        <div>
           <h4 className="font-bold text-sm text-slate-700 mb-2 uppercase tracking-wide">Line Items</h4>
           <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                       <th className="p-3">Description</th>
                       <th className="p-3 text-right">Qty</th>
                       <th className="p-3 text-right">Price</th>
                       <th className="p-3 text-right">Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {estimate.lineItems.map(item => (
                       <tr key={item.id}>
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">${(item.unitPrice / 100).toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">${(item.totalPrice / 100).toFixed(2)}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="flex justify-end gap-8 text-sm">
           <div className="text-right space-y-1">
              <div className="text-slate-500">Subtotal</div>
              <div className="text-slate-500">Tax</div>
              <div className="text-slate-500 flex items-center justify-end gap-2">
                 Discount 
                 <div className="flex items-center w-20">
                    <span className="text-slate-400 mr-1">$</span>
                    <Input 
                       className="h-6 text-right px-1 py-0" 
                       value={discountInput}
                       onChange={e => setDiscountInput(e.target.value)}
                       onBlur={handleUpdate}
                    />
                 </div>
              </div>
              <div className="font-bold text-lg pt-2 border-t border-slate-100">Total</div>
           </div>
           <div className="text-right space-y-1 font-mono">
              <div>${(estimate.subtotal / 100).toFixed(2)}</div>
              <div>${(estimate.taxTotal / 100).toFixed(2)}</div>
              <div className="text-red-500">-${(estimate.discount / 100).toFixed(2)}</div>
              <div className="font-bold text-lg pt-2 border-t border-slate-100">${(estimate.total / 100).toFixed(2)}</div>
           </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
           <Button variant="ghost" onClick={onClose}>Close</Button>
           {estimate.status === 'Draft' && (
              <>
                 <Button variant="outline" className="gap-2"><Send size={14}/> Send to Client</Button>
                 <Button onClick={handleAccept} className="gap-2 bg-green-600 hover:bg-green-700"><Check size={14}/> Accept Estimate</Button>
              </>
           )}
        </div>
      </div>
    </Modal>
  );
};
