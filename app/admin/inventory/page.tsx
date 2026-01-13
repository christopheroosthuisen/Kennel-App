
"use client";

import React, { useState } from 'react';
import { usePosStore } from '@/store/pos-store';
import { Card, Button, Input, Badge, cn } from '@/components/Common';
import { Search, Printer, AlertTriangle, Edit2, Check, Download } from 'lucide-react';
import { formatMoney } from '@/shared/utils';

export default function InventoryPage() {
  const { products } = usePosStore(); // In real app, fetch via API
  const [search, setSearch] = useState('');
  
  // Local state for optimistic editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.includes(search)
  );

  const startEdit = (id: string, current: number) => {
    setEditingId(id);
    setEditValue(current);
  };

  const saveEdit = (id: string) => {
    // In real app: await api.updateProduct(id, { stockLevel: editValue });
    console.log(`Optimistic update: Product ${id} stock -> ${editValue}`);
    setEditingId(null);
    // Force re-render would happen via store/SWR update
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">Track stock levels, print labels, and manage catalog.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2"><Download size={16}/> Export CSV</Button>
          <Button className="gap-2"><Printer size={16}/> Print Low Stock Labels</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search by name, SKU, or barcode..." 
              className="pl-10 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-white">Total Items: {products.length}</Badge>
             <Badge variant="danger" className="bg-red-50 text-red-700 border-red-200">Low Stock: {products.filter(p => p.trackInventory && p.stockLevel <= p.lowStockThreshold).length}</Badge>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock Level</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(product => {
              const isLow = product.trackInventory && product.stockLevel <= product.lowStockThreshold;
              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono">{formatMoney(product.price)}</td>
                  <td className="px-6 py-4">
                    {product.trackInventory ? (
                      editingId === product.id ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-20 h-8" 
                            value={editValue} 
                            onChange={e => setEditValue(parseInt(e.target.value))}
                            autoFocus
                          />
                          <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" onClick={() => saveEdit(product.id)}>
                            <Check size={14}/>
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-200 rounded px-2 py-1 -ml-2 w-fit transition-colors"
                          onClick={() => startEdit(product.id, product.stockLevel)}
                        >
                          <span className={cn("font-bold", isLow ? "text-red-600" : "text-slate-700")}>
                            {product.stockLevel}
                          </span>
                          <Edit2 size={12} className="opacity-0 group-hover:opacity-50" />
                        </div>
                      )
                    ) : (
                      <span className="text-slate-400 italic">Unlimited</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isLow && (
                      <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                        <AlertTriangle size={14}/> Low Stock
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
