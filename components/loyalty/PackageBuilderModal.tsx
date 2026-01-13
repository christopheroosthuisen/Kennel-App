
import React, { useState } from 'react';
import { Modal, Button, Input, Label, Select, Badge, cn, Switch } from '@/components/Common';
import { PackageDefinition, PackageCreditRule } from '@/types/loyalty';
import { Plus, Trash2, Package } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: PackageDefinition) => void;
}

export const PackageBuilderModal = ({ isOpen, onClose, onSave }: Props) => {
  const [tab, setTab] = useState<'details' | 'credits'>('details');
  const [pkg, setPkg] = useState<Partial<PackageDefinition>>({
    name: '',
    price: 0,
    description: '',
    expirationDays: 365,
    credits: [],
    isActive: true
  });

  const addCreditRule = () => {
    const newRule: PackageCreditRule = { serviceCategory: 'SERVICE', quantity: 1, isHourly: false };
    setPkg(prev => ({ ...prev, credits: [...(prev.credits || []), newRule] }));
  };

  const updateCreditRule = (idx: number, field: keyof PackageCreditRule, val: any) => {
    const newCredits = [...(pkg.credits || [])];
    newCredits[idx] = { ...newCredits[idx], [field]: val };
    setPkg(prev => ({ ...prev, credits: newCredits }));
  };

  const removeCreditRule = (idx: number) => {
    setPkg(prev => ({ ...prev, credits: prev.credits?.filter((_, i) => i !== idx) }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Package Builder" size="lg">
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setTab('details')}
          className={cn("pb-2 text-sm font-medium border-b-2 transition-colors", tab === 'details' ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500")}
        >
          Package Details
        </button>
        <button 
          onClick={() => setTab('credits')}
          className={cn("pb-2 text-sm font-medium border-b-2 transition-colors", tab === 'credits' ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500")}
        >
          Credits & Usage
        </button>
      </div>

      <div className="min-h-[300px]">
        {tab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Package Name</Label><Input value={pkg.name} onChange={e => setPkg({...pkg, name: e.target.value})} placeholder="e.g. 10 Day Pass" /></div>
              <div><Label>Price (Cents)</Label><Input type="number" value={pkg.price} onChange={e => setPkg({...pkg, price: parseInt(e.target.value)})} /></div>
            </div>
            <div><Label>Description</Label><Input value={pkg.description} onChange={e => setPkg({...pkg, description: e.target.value})} /></div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-sm font-medium">Active for Sale</div>
              <Switch checked={pkg.isActive} onCheckedChange={c => setPkg({...pkg, isActive: c})} />
            </div>
          </div>
        )}

        {tab === 'credits' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Credits Included</Label>
              <Button size="sm" variant="outline" onClick={addCreditRule} className="gap-2"><Plus size={14}/> Add Credit Rule</Button>
            </div>
            
            {pkg.credits?.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                <Package size={32} className="mx-auto mb-2 opacity-50"/>
                No credits configured.
              </div>
            )}

            {pkg.credits?.map((rule, i) => (
              <div key={i} className="flex gap-3 items-end p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={rule.serviceCategory} onChange={e => updateCreditRule(i, 'serviceCategory', e.target.value)}>
                    <option value="SERVICE">Service (Daycare/Boarding)</option>
                    <option value="GROOMING">Grooming</option>
                    <option value="TRAINING">Training</option>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" value={rule.quantity} onChange={e => updateCreditRule(i, 'quantity', parseInt(e.target.value))} />
                </div>
                <div className="flex items-center h-10 pb-2 gap-2">
                  <Switch checked={rule.isHourly} onCheckedChange={c => updateCreditRule(i, 'isHourly', c)} />
                  <span className="text-xs text-slate-600">Hourly?</span>
                </div>
                <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeCreditRule(i)}><Trash2 size={16}/></Button>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100">
              <Label>Expiration (Days)</Label>
              <Input type="number" value={pkg.expirationDays} onChange={e => setPkg({...pkg, expirationDays: parseInt(e.target.value)})} />
              <p className="text-xs text-slate-500 mt-1">Days after purchase until unused credits expire.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-100 mt-4">
        <Button onClick={() => onSave(pkg as PackageDefinition)}>Save Package</Button>
      </div>
    </Modal>
  );
};
