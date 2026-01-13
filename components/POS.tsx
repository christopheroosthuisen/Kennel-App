
import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, User, Plus, Minus, ChevronRight, X, Check } from 'lucide-react';
import { Card, Button, Input, Badge, Select, cn, Modal, Label } from './Common';
import { api } from '../api/api';
import { useApiQuery } from '../hooks/useApiQuery';
import { CatalogItem, Owner } from '../../shared/domain';
import { AutomationEngine } from '../../lib/automation-engine'; // Import Engine

export const POS = () => {
  const [cart, setCart] = useState<{item: CatalogItem, qty: number}[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<{id: string, name: string} | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const { data: catalog = [] } = useApiQuery('catalog', api.getCatalog);
  const { data: owners = [] } = useApiQuery('owners', () => api.getOwners());

  const addToCart = (product: CatalogItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === product.id);
      if (existing) {
        return prev.map(p => p.item.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { item: product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.item.id === id) {
        const newQty = Math.max(1, p.qty + delta);
        return { ...p, qty: newQty };
      }
      return p;
    }));
  };

  // Prices are in cents
  const subtotal = cart.reduce((sum, line) => sum + (line.item.basePrice * line.qty), 0);
  const tax = Math.round(subtotal * 0.08); // 8% mock tax
  const total = subtotal + tax;

  const filteredOwners = owners.filter(o => 
    o.firstName.toLowerCase().includes(customerSearch.toLowerCase()) || 
    o.lastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    o.phone.includes(customerSearch)
  );

  const categories = ['All', ...Array.from(new Set((catalog as any[]).map(c => c.category || c.type)))] as string[];

  // Modified Payment Completion
  const handlePaymentComplete = async (method: string) => {
    try {
      const order = await api.posCheckout({
        ownerId: selectedCustomer?.id,
        items: cart.map(c => ({ catalogItemId: c.item.id, quantity: c.qty })),
        payment: { method, amountCents: total }
      });

      // --- AUTOMATION HOOK ---
      // Trigger the automation engine
      await AutomationEngine.triggerEvent('POS_PURCHASE', {
        ownerId: selectedCustomer?.id,
        orderId: order.data.id,
        data: {
          amount: total / 100, // Pass dollars for easier config
          items: cart.map(c => c.item.name)
        }
      });
      // -----------------------

      setCart([]);
      setSelectedCustomer(null);
      setIsCheckoutOpen(false);
      alert('Payment Successful & Automations Triggered');
    } catch (e) {
      alert('Payment failed');
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Point of Sale</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input placeholder="Search products..." className="pl-9" />
          </div>
        </div>
        
        <div className="flex gap-2 pb-2 overflow-x-auto">
          {categories.map(cat => (
             <Button 
               key={cat} 
               variant={activeCategory === cat ? 'primary' : 'secondary'}
               onClick={() => setActiveCategory(cat)}
               size="sm"
               className="rounded-full capitalize"
             >
               {cat}
             </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {catalog
            .filter(p => activeCategory === 'All' || p.category === activeCategory || p.type === activeCategory)
            .map(product => (
            <Card 
              key={product.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-32 active:scale-95 transition-transform"
              onClick={() => addToCart(product)}
            >
              <div>
                <Badge className={cn("mb-2", "bg-slate-100 text-slate-800")}>{product.category || product.type}</Badge>
                <h3 className="font-semibold text-slate-800 leading-tight line-clamp-2">{product.name}</h3>
              </div>
              <div className="text-lg font-bold text-slate-900">${(product.basePrice / 100).toFixed(2)}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <Card className="w-96 flex flex-col h-full border-l border-slate-200 shadow-lg">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-600">
             <User size={18} />
             <span className="text-sm font-medium">{selectedCustomer ? selectedCustomer.name : "Walk-in Guest"}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsCustomerModalOpen(true)}>Change</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart size={48} className="mb-2 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(line => (
              <div key={line.item.id} className="flex justify-between items-start group">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{line.item.name}</div>
                  <div className="text-xs text-slate-500">${(line.item.basePrice / 100).toFixed(2)} / unit</div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center border border-slate-200 rounded-md">
                     <button className="px-2 py-1 hover:bg-slate-100" onClick={() => updateQty(line.item.id, -1)}><Minus size={12}/></button>
                     <span className="w-6 text-center text-sm font-mono">{line.qty}</span>
                     <button className="px-2 py-1 hover:bg-slate-100" onClick={() => updateQty(line.item.id, 1)}><Plus size={12}/></button>
                   </div>
                   <div className="font-bold w-12 text-right">${((line.item.basePrice * line.qty) / 100).toFixed(2)}</div>
                   <button onClick={() => removeFromCart(line.item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax (8%)</span>
            <span>${(tax / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
          <Button 
            className="w-full mt-4 h-12 text-lg gap-2 bg-green-600 hover:bg-green-700"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
          >
             <CreditCard size={20} /> Checkout
          </Button>
        </div>
      </Card>

      {/* Customer Select Modal */}
      <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="Select Customer" size="md">
         <div className="space-y-4">
            <div className="relative">
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <Input 
                  placeholder="Search name or phone..." 
                  className="pl-9" 
                  autoFocus
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
               />
            </div>
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
               {filteredOwners.length > 0 ? filteredOwners.map(c => (
                  <div 
                     key={c.id} 
                     className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                     onClick={() => { setSelectedCustomer({ id: c.id, name: `${c.firstName} ${c.lastName}` }); setIsCustomerModalOpen(false); }}
                  >
                     <div>
                        <div className="font-semibold text-slate-800">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-slate-500">{c.phone} • {c.email}</div>
                     </div>
                     <ChevronRight size={16} className="text-slate-300"/>
                  </div>
               )) : (
                  <div className="p-4 text-center text-slate-400">No customers found.</div>
               )}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
               <Button variant="ghost" onClick={() => { setSelectedCustomer(null); setIsCustomerModalOpen(false); }}>Guest Checkout</Button>
               <Button onClick={() => setIsCustomerModalOpen(false)}>Cancel</Button>
            </div>
         </div>
      </Modal>

      {/* Checkout Payment Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        totalCents={total}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
};

const CheckoutModal = ({ isOpen, onClose, totalCents, onComplete }: { isOpen: boolean, onClose: () => void, totalCents: number, onComplete: (method: string) => void }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Payment" size="sm">
      <div className="space-y-4 text-center">
        <div className="text-4xl font-bold text-slate-900 mb-6">${(totalCents / 100).toFixed(2)}</div>
        <div className="grid grid-cols-2 gap-4">
           <Button className="h-20 flex-col gap-2 text-lg" onClick={() => onComplete('CreditCard')}>
              <CreditCard size={24}/> Card
           </Button>
           <Button className="h-20 flex-col gap-2 text-lg bg-green-600 hover:bg-green-700" onClick={() => onComplete('Cash')}>
              <DollarSign size={24}/> Cash
           </Button>
        </div>
        <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
      </div>
    </Modal>
  );
};

// Simple dollar sign icon override
const DollarSign = ({size}: {size: number}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
