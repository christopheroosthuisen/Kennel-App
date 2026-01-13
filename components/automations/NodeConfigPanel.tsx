
import React, { useEffect, useState } from 'react';
import { X, Save, Variable } from 'lucide-react';
import { Button, Input, Label, Textarea, Select, cn, Badge } from '../Common';
import { WorkflowNode } from '../../types/automation';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onSave: (nodeId: string, data: any) => void;
}

export const NodeConfigPanel = ({ node, onClose, onSave }: NodeConfigPanelProps) => {
  const [config, setConfig] = useState<any>({});
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (node) {
      setConfig(node.data.config || {});
      setLabel(node.data.label as string || '');
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onSave(node.id, { ...node.data, label, config });
    onClose();
  };

  const insertVariable = (v: string) => {
    // Simple append for now, real implementation would handle cursor position
    if (config.message !== undefined) {
      setConfig({ ...config, message: (config.message || '') + ` {{${v}}} ` });
    }
  };

  const renderForm = () => {
    const type = node.data.actionType || node.data.triggerType;

    switch (type) {
      case 'SEND_SMS':
      case 'SEND_EMAIL':
        return (
          <div className="space-y-4">
            <div>
              <Label>Template / Message</Label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {['FirstName', 'LastName', 'PetName', 'BookingDate', 'TotalAmount'].map(v => (
                  <Badge 
                    key={v} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary-50 hover:border-primary-300"
                    onClick={() => insertVariable(v)}
                  >
                    {`{${v}}`}
                  </Badge>
                ))}
              </div>
              <Textarea 
                value={config.message || ''} 
                onChange={e => setConfig({ ...config, message: e.target.value })}
                className="h-40 font-mono text-sm"
                placeholder={`Hi {{FirstName}}, thanks for visiting!`}
              />
            </div>
            {type === 'SEND_EMAIL' && (
               <div>
                 <Label>Subject Line</Label>
                 <Input 
                   value={config.subject || ''} 
                   onChange={e => setConfig({ ...config, subject: e.target.value })} 
                 />
               </div>
            )}
          </div>
        );

      case 'WAIT_DELAY':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration</Label>
                <Input 
                  type="number" 
                  value={config.duration || 1} 
                  onChange={e => setConfig({ ...config, duration: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select 
                  value={config.unit || 'hours'} 
                  onChange={e => setConfig({ ...config, unit: e.target.value })}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'POS_PURCHASE':
        return (
          <div className="space-y-4">
            <div>
              <Label>Minimum Amount ($)</Label>
              <Input 
                type="number" 
                value={config.minAmount || 0} 
                onChange={e => setConfig({ ...config, minAmount: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Category Filter (Optional)</Label>
              <Select 
                value={config.category || 'Any'} 
                onChange={e => setConfig({ ...config, category: e.target.value })}
              >
                <option value="Any">Any Category</option>
                <option value="Service">Service</option>
                <option value="Retail">Retail</option>
              </Select>
            </div>
          </div>
        );

      default:
        return <div className="text-sm text-slate-500 italic">No specific configuration available for this node type.</div>;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-slate-200 z-[60] flex flex-col animate-in slide-in-from-right duration-200">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-slate-900">Configure Node</h3>
          <p className="text-xs text-slate-500 font-mono">{node.id}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <Label>Label Name</Label>
          <Input 
            value={label} 
            onChange={e => setLabel(e.target.value)} 
            placeholder="e.g. Send Welcome SMS"
          />
        </div>

        <div className="h-px bg-slate-100" />

        {renderForm()}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <Button className="w-full gap-2" onClick={handleSave}>
          <Save size={16} /> Save Configuration
        </Button>
      </div>
    </div>
  );
};
