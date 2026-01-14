
import React, { useEffect, useState } from 'react';
import { api } from '../../api/api';
import { Search, Plus, Filter, Phone, Mail, Dog } from 'lucide-react';

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  balance: number;
  avatar: string;
  pets: Array<{
    id: string;
    name: string;
    breed: string;
    status: string;
    avatar: string;
  }>;
}

const OwnersDirectoryPage = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: ownersData } = await api.getOwners();
        const { data: petsData } = await api.getPets();
        
        // Merge pets into owners for this view
        const merged: Owner[] = ownersData.map((owner: any) => ({
          id: owner.id,
          name: owner.name || `${owner.firstName} ${owner.lastName}`,
          email: owner.email,
          phone: owner.phone,
          status: 'Active', 
          balance: (owner.balance || 0) / 100, 
          avatar: `https://ui-avatars.com/api/?name=${owner.firstName}+${owner.lastName}&background=random`, 
          pets: petsData.filter((p: any) => p.ownerId === owner.id).map((p: any) => ({
            id: p.id,
            name: p.name,
            breed: p.breed,
            status: 'Active', 
            avatar: p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}&background=random`
          }))
        }));
        
        setOwners(merged); 
      } catch (e) {
        console.error("Failed to load owners", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = owners.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Owners & Pets</h1>
                <p className="text-slate-500">Manage client relationships and profiles.</p>
            </div>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition shadow-sm">
                <Plus size={18} /> New Client
            </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by name, email, or pet..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter size={18} /> Filter
            </button>
        </div>

        {/* List */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(owner => (
                    <div key={owner.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <img src={owner.avatar} alt={owner.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-600 transition">{owner.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                        owner.status === 'VIP' 
                                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                            : 'bg-slate-50 text-slate-600 border-slate-100'
                                    }`}>
                                        {owner.status}
                                    </span>
                                </div>
                            </div>
                            <div className={`font-mono font-bold text-sm px-2 py-1 rounded bg-slate-50 ${
                                owner.balance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                                ${owner.balance.toFixed(2)}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-500 mb-6 flex-1">
                            <div className="flex items-center gap-2 hover:text-slate-800 transition-colors"><Mail size={14} className="text-slate-400"/> {owner.email}</div>
                            <div className="flex items-center gap-2 hover:text-slate-800 transition-colors"><Phone size={14} className="text-slate-400"/> {owner.phone}</div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 mt-auto">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                <Dog size={12}/> Household Pets
                            </div>
                            <div className="space-y-2">
                                {owner.pets.map(pet => (
                                    <div key={pet.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img src={pet.avatar} alt={pet.name} className="w-8 h-8 rounded-full object-cover" />
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">{pet.name}</div>
                                                <div className="text-[10px] text-slate-500">{pet.breed}</div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                            pet.status === 'Checked In' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {pet.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                
                {filtered.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No owners found matching "{search}"
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default OwnersDirectoryPage;
