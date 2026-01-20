
import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, User, Plus, Minus, ChevronRight, X } from 'lucide-react';
import { Card, Button, Input, Badge, Select, cn, Modal, Label } from './Common';
import { useData } from './DataContext';

const PRODUCTS = [
  { id: 1, name: 'Premium Kibble 5lb', price: 24.99, category: 'Retail', color: 'bg-orange-100 text-orange-800' },
  { id: 2, name: 'Squeaky Toy', price: 8.50, category: 'Retail', color: 'bg-orange-100 text-orange-800' },
  { id: 3, name: 'Full Day Daycare', price: 35.00, category: 'Service', color: 'bg-blue-100 text-blue-800' },
  { id: 4, name: 'Half Day Daycare', price: 22.00, category: 'Service', color: 'bg-blue-100 text-blue-800' },
  { id: 5, name: 'Nail Trim', price: 15.00, category: 'Grooming', color: 'bg-purple-100 text-purple-800' },
  { id: 6, name: 'Exit Bath (<30lbs)', price: 30.00, category: 'Grooming', color: 'bg-purple-100 text-purple-800' },
];

export const POS = () => {
  const { owners } = useData();
  const [cart, setCart] = useState<{id: number, name: string, price: number, qty: number}[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<{id: string, name: string} | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.qty + delta);
        return { ...p, qty: newQty };
      }
      return p;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const filteredCustomers = owners.filter(o => 
    o.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    o.phone.includes(customerSearch)
  );

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
          {['All', 'Service', 'Retail', 'Grooming'].map(cat => (
             <Button 
               key={cat} 
               variant={activeCategory === cat ? 'primary' : 'secondary'}
               onClick={() => setActiveCategory(cat)}
               size="sm"
               className="rounded-full"
             >
               {cat}
             </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {PRODUCTS.filter(p => activeCategory === 'All' || p.category === activeCategory).map(product => (
            <Card 
              key={product.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-32 active:scale-95 transition-transform"
              onClick={() => addToCart(product)}
            >
              <div>
                <Badge className={cn("mb-2", product.color)}>{product.category}</Badge>
                <h3 className="font-semibold text-slate-800 leading-tight">{product.name}</h3>
              </div>
              <div className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</div>
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
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-start group">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-500">${item.price.toFixed(2)} / unit</div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center border border-slate-200 rounded-md">
                     <button className="px-2 py-1 hover:bg-slate-100" onClick={() => updateQty(item.id, -1)}><Minus size={12}/></button>
                     <span className="w-6 text-center text-sm font-mono">{item.qty}</span>
                     <button className="px-2 py-1 hover:bg-slate-100" onClick={() => updateQty(item.id, 1)}><Plus size={12}/></button>
                   </div>
                   <div className="font-bold w-12 text-right">${(item.price * item.qty).toFixed(2)}</div>
                   <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button className="w-full mt-4 h-12 text-lg gap-2 bg-green-600 hover:bg-green-700">
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
               {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                  <div 
                     key={c.id} 
                     className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                     onClick={() => { setSelectedCustomer({ id: c.id, name: c.name }); setIsCustomerModalOpen(false); }}
                  >
                     <div>
                        <div className="font-semibold text-slate-800">{c.name}</div>
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
    </div>
  );
};
