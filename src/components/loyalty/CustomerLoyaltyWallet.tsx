
import React, { useState, useRef } from 'react';
import { Card, Button, Badge, Modal, cn } from '../Common';
import { UserLedger, MembershipDefinition, PackageDefinition } from '../../types/loyalty';
import { Crown, Clock, CheckCircle, PenTool, CreditCard } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { formatMoney } from '../../shared/utils';

// Mock Definitions for context
const MEMBERSHIPS: Record<string, MembershipDefinition> = {
  'md_gold': { id: 'md_gold', name: 'Gold Member', price: 4900, billingFrequency: 'MONTHLY', isActive: true, requiresSignature: true, colorHex: '#eab308', benefits: [] }
};

interface Props {
  ledger: UserLedger;
}

export const CustomerLoyaltyWallet = ({ ledger }: Props) => {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const sigPad = useRef<SignatureCanvas>(null);

  const activeMem = ledger.activeMembership ? MEMBERSHIPS[ledger.activeMembership.membershipDefinitionId] : null;

  const handleSign = () => {
    if (sigPad.current?.isEmpty()) return;
    const dataUrl = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
    // In real app, upload this dataUrl to server
    console.log("Signed:", dataUrl);
    setIsSignModalOpen(false);
    alert("Contract Signed!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <CreditCard size={24} className="text-primary-600"/> Wallet & Memberships
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Membership Card */}
        {activeMem ? (
          <div 
            className="rounded-xl p-6 text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-between"
            style={{ backgroundColor: activeMem.colorHex }}
          >
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start z-10">
              <div>
                <h3 className="font-black text-2xl uppercase tracking-wider">{activeMem.name}</h3>
                <div className="text-white/80 text-sm mt-1">Since {new Date(ledger.activeMembership!.startedAt).toLocaleDateString()}</div>
              </div>
              <Crown size={32} className="text-white/50"/>
            </div>

            <div className="z-10">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs uppercase font-bold text-white/60 mb-1">Status</div>
                  <Badge variant="success" className="bg-white/20 text-white border-none backdrop-blur-sm">{ledger.activeMembership!.status}</Badge>
                </div>
                {!ledger.activeMembership!.signedContractUrl && activeMem.requiresSignature && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-white text-slate-900 hover:bg-slate-100 gap-2 shadow-lg"
                    onClick={() => setIsSignModalOpen(true)}
                  >
                    <PenTool size={14}/> Sign Contract
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-dashed">
            <Crown size={32} className="mb-2 opacity-50"/>
            <p>No Active Membership</p>
            <Button variant="link" className="text-primary-600">View Plans</Button>
          </Card>
        )}

        {/* Punch Cards / Credits */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18}/> Active Packages</h3>
          {ledger.credits.length === 0 ? (
            <div className="text-slate-400 text-sm italic">No active credits available.</div>
          ) : (
            <div className="space-y-4">
              {ledger.credits.map((credit) => (
                <div key={credit.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{credit.serviceCategory === 'SERVICE' ? 'Daycare/Boarding' : credit.serviceCategory}</span>
                    <span className="font-bold text-primary-600">{credit.remaining} Left</span>
                  </div>
                  {/* Punch Visual */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(10, credit.remaining + 2) }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-2 flex-1 rounded-full",
                          i < credit.remaining ? "bg-primary-500" : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 text-right">Expires {new Date(credit.expiresAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Signature Modal */}
      <Modal isOpen={isSignModalOpen} onClose={() => setIsSignModalOpen(false)} title="Sign Membership Agreement" size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">I agree to the terms and conditions of the {activeMem?.name}.</p>
          <div className="border-2 border-slate-300 rounded-lg bg-white overflow-hidden">
            <SignatureCanvas 
              ref={sigPad}
              penColor="black"
              canvasProps={{width: 500, height: 200, className: 'sigCanvas'}} 
            />
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => sigPad.current?.clear()}>Clear</Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsSignModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSign}>Accept & Sign</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
