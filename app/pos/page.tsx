
"use client";

import React, { useState } from 'react';
import { usePosStore } from '@/store/pos-store';
import { Search, Grid, List, AlertCircle, User, Plus, Trash2, PawPrint, ShoppingCart, LayoutGrid, Tag, Crown } from 'lucide-react';
import { Input } from '@/components/Common';
import { Button } from '@/components/Common';
import { Card } from '@/components/Common';
import { Badge } from '@/components/Common';
import { mockOwners } from '@/types/crm';
import { formatMoney } from '@/shared/utils';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ShiftManager } from '@/components/pos/ShiftManager';
import { cn } from '@/lib/utils';

export default function PosPage() {
  const { 
    products, cart, activeCustomer, currentShift, customerLedger,
    addToCart, removeFromCart, updateCartItem, setCustomer, clearCart, parkOrder, redeemCredit,
    getTotals
  } = usePosStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Computed
  const filteredProducts = products.filter(p => 
    (activeCategory === 'ALL' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search))
  );

  const { subtotal, tax, total } = getTotals();

  // If no shift is open, force the shift manager
  if (!currentShift) {
    return <ShiftManager />;
  }

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsPaymentOpen(true);
  };

  // Helper to find applicable credit for an item
  const findApplicableCredit = (item: any) => {
    if (!customerLedger) return null;
    return customerLedger.credits.find(c => 
      c.serviceCategory === item.category && c.remaining > 0
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      
      {/* LEFT: Catalog (65%) */}
      <div className="w-[65%] flex flex-col border-r border-slate-200">
        
        {/* Header / Search */}
        <div className="p-4 bg-white border-b border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Scan barcode or search products..." 
              className="pl-10 h-12 text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button variant="ghost" size="icon" className="bg-white shadow-sm"><Grid size={20}/></Button>
            <Button variant="ghost" size="icon"><List size={20}/></Button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto">
          {['ALL', 'FOOD', 'SERVICE', 'GROOMING', 'RETAIL', 'PACKAGE', 'MEMBERSHIP'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-slate-900 text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const isLowStock = product.trackInventory && product.stockLevel <= product.lowStockThreshold;
              return (
                <Card 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="cursor-pointer hover:shadow-md transition-all active:scale-95 border-slate-200 overflow-hidden flex flex-col h-40"
                >
                  <div className="flex-1 p-4 bg-white relative">
                    {isLowStock && (
                      <Badge variant="danger" className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5">
                        Low Stock ({product.stockLevel})
                      </Badge>
                    )}
                    <h3 className="font-bold text-slate-800 leading-tight line-clamp-2">{product.name}</h3>
                    <div className="text-xs text-slate-500 mt-1">{product.sku}</div>
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-lg">{formatMoney(product.price)}</span>
                    <Plus size={16} className="text-primary-600"/>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Ticket (35%) */}
      <div className="w-[35%] flex flex-col bg-white h-full shadow-xl z-10">
        
        {/* Customer Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          {activeCustomer ? (
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                {activeCustomer.firstName[0]}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  {activeCustomer.firstName} {activeCustomer.lastName}
                  {customerLedger?.activeMembership && (
                    <Badge variant="warning" className="text-[10px] bg-gold-100 text-gold-600 border-gold-300">
                      <Crown size={10} className="mr-1"/> Member
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  Credits: {customerLedger?.credits.reduce((a,c) => a + c.remaining, 0) || 0}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCustomer(null)}><Trash2 size={16}/></Button>
            </div>
          ) : (
            <div className="w-full flex gap-2">
              <Button variant="outline" className="flex-1 border-dashed text-slate-500" onClick={() => setCustomer(mockOwners[0])}>
                <User size={16} className="mr-2"/> Assign Customer
              </Button>
              <Button variant="outline" size="icon"><Plus size={16}/></Button>
            </div>
          )}
        </div>

        {/* Warning Banner (CRM Integration) */}
        {activeCustomer?.tags.includes('BANNED') && (
          <div className="bg-red-600 text-white px-4 py-2 text-sm font-bold text-center">
            ⚠️ WARNING: Do not service (Account Banned)
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <ShoppingCart size={48} className="mb-4 opacity-20"/>
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => {
              const availableCredit = findApplicableCredit(item);
              
              return (
                <div key={item.cartId} className={cn(
                  "flex flex-col gap-2 p-3 rounded-lg border transition-colors",
                  item.isRedemption ? "border-gold-300 bg-gold-50" : "border-slate-100 hover:border-primary-200 bg-slate-50/30"
                )}>
                  
                  {/* Top Row: Name, Price, Remove */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      
                      {/* Discount Badges */}
                      {item.discount > 0 && !item.isRedemption && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <Tag size={10}/> Member Discount: -{formatMoney(item.discount)}
                        </div>
                      )}
                      
                      {/* Redemption Badge */}
                      {item.isRedemption && (
                        <div className="text-xs text-gold-600 font-bold flex items-center gap-1">
                          <Crown size={10}/> Credit Redeemed
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className={cn("font-bold", item.isRedemption && "line-through text-slate-400")}>
                        {formatMoney(item.price * item.quantity)}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.cartId)} 
                        className="text-slate-400 hover:text-red-500 text-xs mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Smart Actions Row */}
                  <div className="flex items-center justify-between mt-1">
                    {/* Qty Stepper */}
                    <div className="flex items-center border bg-white rounded-md">
                      <button 
                        className="px-2 py-1 text-slate-500 hover:bg-slate-100"
                        onClick={() => updateCartItem(item.cartId, { quantity: Math.max(1, item.quantity - 1) })}
                      > - </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 text-slate-500 hover:bg-slate-100"
                        onClick={() => updateCartItem(item.cartId, { quantity: item.quantity + 1 })}
                      > + </button>
                    </div>

                    {/* REDEMPTION BUTTON */}
                    {availableCredit && !item.isRedemption && (
                      <button 
                        onClick={() => redeemCredit(item.cartId, availableCredit.id)}
                        className="text-[10px] bg-gold-100 text-gold-700 border border-gold-300 px-2 py-1 rounded font-bold hover:bg-gold-200 transition-colors flex items-center gap-1"
                      >
                        <Crown size={10}/> Redeem ({availableCredit.remaining} Left)
                      </button>
                    )}
                    
                    {item.isRedemption && (
                      <button 
                        onClick={() => redeemCredit(item.cartId, null)}
                        className="text-[10px] text-slate-500 underline hover:text-slate-700"
                      >
                        Undo
                      </button>
                    )}

                    {/* Pet Selector for Services */}
                    {(item.category === 'SERVICE' || item.category === 'GROOMING') && activeCustomer && (
                      <select
                        className={cn(
                          "text-xs border rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-primary-500 ml-2",
                          !item.assignedPetId ? "border-amber-300 text-amber-700 bg-amber-50" : "border-slate-200 text-slate-600"
                        )}
                        value={item.assignedPetId || ''}
                        onChange={(e) => updateCartItem(item.cartId, { assignedPetId: e.target.value })}
                      >
                        <option value="">Select Pet...</option>
                        {activeCustomer.pets?.map(pet => (
                          <option key={pet.id} value={pet.id}>{pet.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="space-y-1 mb-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (8%)</span>
              <span>{formatMoney(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-dashed border-slate-200 mt-2">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" className="col-span-1 border-slate-300 text-slate-600" onClick={parkOrder}>
              Park
            </Button>
            <Button 
              className="col-span-3 h-14 text-xl bg-green-600 hover:bg-green-700 shadow-md shadow-green-200"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Charge {formatMoney(total)}
            </Button>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        totalDue={total}
      />
    </div>
  );
}
