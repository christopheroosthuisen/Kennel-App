
"use client";

import React, { useState } from 'react';
import { Card, Button, Input, Badge, Switch, Select, Label } from '../../../components/Common';
import { MembershipDefinition, MembershipBenefit } from '../../../types/loyalty';
import { Crown, Plus, Trash2, FileText } from 'lucide-react';
import { formatMoney } from '../../../shared/utils';

export default function MembershipBuilderPage() {
  const [memberships, setMemberships] = useState<MembershipDefinition[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeMem = memberships.find(m => m.id === editingId);

  const addMembership = () => {
    const newMem: MembershipDefinition = {
      id: `mem_${Date.now()}`,
      name: 'New Membership',
      price: 0,
      billingFrequency: 'MONTHLY',
      benefits: [],
      requiresSignature: true,
      isActive: false,
      colorHex: '#3b82f6'
    };
    setMemberships([...memberships, newMem]);
    setEditingId(newMem.id);
  };

  const updateActive = (updates: Partial<MembershipDefinition>) => {
    setMemberships(prev => prev.map(m => m.id === editingId ? { ...m, ...updates } : m));
  };

  const addBenefit = () => {
    if (!activeMem) return;
    const newBen: MembershipBenefit = {
      id: `ben_${Date.now()}`,
      type: 'DISCOUNT_PERCENT',
      value: 10,
      targetCategory: 'ALL',
      description: '10% Off Everything'
    };
    updateActive({ benefits: [...activeMem.benefits, newBen] });
  };

  const updateBenefit = (idx: number, updates: Partial<MembershipBenefit>) => {
    if (!activeMem) return;
    const newBens = [...activeMem.benefits];
    newBens[idx] = { ...newBens[idx], ...updates };
    updateActive({ benefits: newBens });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Memberships</h2>
          <Button size="icon" className="h-8 w-8" onClick={addMembership}><Plus size={16}/></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {memberships.map(m => (
            <div 
              key={m.id} 
              onClick={() => setEditingId(m.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${editingId === m.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-200'}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">{m.name}</span>
                <Badge variant={m.isActive ? 'success' : 'default'} className="text-[10px]">{m.isActive ? 'Active' : 'Draft'}</Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1">{formatMoney(m.price)} / {m.billingFrequency}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Builder Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeMem ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Settings */}
            <Card className="p-6 space-y-6">
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: activeMem.colorHex }}></div>
                  Edit Membership
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Switch checked={activeMem.isActive} onCheckedChange={c => updateActive({ isActive: c })} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div><Label>Name</Label><Input value={activeMem.name} onChange={e => updateActive({ name: e.target.value })} /></div>
                <div><Label>Price (Cents)</Label><Input type="number" value={activeMem.price} onChange={e => updateActive({ price: parseInt(e.target.value) })} /></div>
                <div>
                  <Label>Billing Frequency</Label>
                  <Select value={activeMem.billingFrequency} onChange={e => updateActive({ billingFrequency: e.target.value as any })}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUALLY">Annually</option>
                  </Select>
                </div>
                <div>
                  <Label>Card Color</Label>
                  <div className="flex gap-2 mt-1">
                    {['#3b82f6', '#eab308', '#a855f7', '#22c55e', '#ef4444'].map(c => (
                      <button 
                        key={c} 
                        className={`w-8 h-8 rounded-full border-2 ${activeMem.colorHex === c ? 'border-slate-900' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        onClick={() => updateActive({ colorHex: c })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Benefits Matrix */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Crown size={20} className="text-gold-500"/> Benefits Matrix</h3>
                <Button size="sm" onClick={addBenefit}>Add Benefit</Button>
              </div>
              
              <div className="space-y-3">
                {activeMem.benefits.map((ben, i) => (
                  <div key={ben.id} className="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="col-span-3">
                      <Label className="text-xs">Type</Label>
                      <Select value={ben.type} onChange={e => updateBenefit(i, { type: e.target.value as any })}>
                        <option value="DISCOUNT_PERCENT">% Discount</option>
                        <option value="DISCOUNT_FIXED">$ Discount</option>
                        <option value="CREDIT_DROP">Monthly Credit</option>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Value</Label>
                      <Input type="number" value={ben.value} onChange={e => updateBenefit(i, { value: parseInt(e.target.value) })} />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Target</Label>
                      <Select value={ben.targetCategory} onChange={e => updateBenefit(i, { targetCategory: e.target.value as any })}>
                        <option value="ALL">Everything</option>
                        <option value="SERVICE">Services</option>
                        <option value="RETAIL">Retail</option>
                        <option value="GROOMING">Grooming</option>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs">Description</Label>
                      <Input value={ben.description} onChange={e => updateBenefit(i, { description: e.target.value })} />
                    </div>
                    <div className="col-span-1 flex justify-end pb-2">
                      <button onClick={() => {
                        const newBens = activeMem.benefits.filter((_, idx) => idx !== i);
                        updateActive({ benefits: newBens });
                      }} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contract */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><FileText size={20}/> Contract Terms</h3>
                <Switch checked={activeMem.requiresSignature} onCheckedChange={c => updateActive({ requiresSignature: c })} />
              </div>
              {activeMem.requiresSignature && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-500">
                  <p className="mb-2">Upload PDF Terms & Conditions</p>
                  <Button variant="outline" size="sm">Choose File</Button>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">Select or create a membership</div>
        )}
      </div>
    </div>
  );
}
