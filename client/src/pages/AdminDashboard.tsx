import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [showAddAgent, setShowAddAgent] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', phone: '', email: '', password: '123456' });
  const [selectedAsset, setSelectedAsset] = useState<any>(null); // For overlay

  // Retrieve user info for the Admin Panel
  const [adminUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: 'Admin', email: 'admin@system.com' };
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      // Ensure your api utility includes the Bearer token from localStorage automatically
      const res = await api.get('/dashboards/admin');
      console.log("API Response:", res.data); // DEBUG: Check your console!
      setData(res.data);
    } catch (err) {
      console.error("Fetch Failed:", err);
      // If unauthorized, kick to login
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
         role: 'agent',
         name: agentForm.name,
         phone: agentForm.phone,
         email: agentForm.email,
         password: agentForm.password,
         joiningDate: new Date().toISOString().split('T')[0]
      };
      await api.post('/auth/register', payload);
      setShowAddAgent(false);
      fetchDashboard();
      setAgentForm({ name: '', phone: '', email: '', password: '123456' });
    } catch(err: any) {
      alert("Failed to create agent: " + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (val: number) => {
    if (!val) return '$0';
    if (val >= 1000000) return '$' + (val / 1000000).toFixed(2) + 'M';
    return '$' + val.toLocaleString();
  };

  const handleAssetClick = async (propId: number) => {
    setSelectedAsset({ id: propId, loading: true });
    try {
       const res = await api.get(`/properties/${propId}`);
       setSelectedAsset(res.data);
    } catch(err) {
       console.error(err);
       setSelectedAsset(null);
    }
  };

  const handleDeleteUser = async (type: string, id: number) => {
     if(window.confirm(`WARNING (ROOT): Are you absolutely sure you want to completely erase this ${type} and all of their active holdings/assignments permanently? This drops their objects via SQL ON DELETE CASCADE intrinsically.`)) {
        try {
           await api.delete(`/dashboards/admin/users/${type}/${id}`);
           const res = await api.get('/dashboards/admin');
           setData(res.data);
        } catch(err: any) {
           alert("Master Deletion Failed: " + (err.response?.data?.error || err.message));
        }
     }
  };

  const handleDeleteProperty = async (e: React.MouseEvent, propId: number) => {
     e.stopPropagation();
     if(window.confirm("WARNING (ROOT): Deleting this asset instantly overrides agent locks natively tracking MySQL CASCADE bindings permanently. Proceed?")) {
        try {
           await api.delete(`/properties/${propId}`);
           const res = await api.get('/dashboards/admin');
           setData(res.data);
        } catch(err: any) {
           alert("Master Asset Deletion Failed: " + (err.response?.data?.error || err.message));
        }
     }
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#9333ea] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Accessing Secure Layer...</p>
    </div>
  );

  return (
    <div className="flex bg-[#050505] min-h-screen text-white font-sans">
      
      {/* SIDEBAR */}
      <div className="w-72 border-r border-[#222225] bg-[#070708] flex flex-col p-6 h-screen sticky top-0">
        <h1 className="text-[#9333ea] font-black text-2xl tracking-tighter mb-10">WASHUB</h1>

        {/* ADMIN INFO PANEL */}
        <div className="bg-[#131315] border border-[#222225] p-4 rounded-2xl mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#9333ea] rounded-full flex items-center justify-center font-bold">
              {adminUser.name?.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold truncate">{adminUser.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">System Administrator</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-[#9333ea] shadow-lg shadow-[#9333ea]/20' : 'text-gray-400 hover:bg-white/5'}`}>
            Overview
          </button>
          <button onClick={() => setView('users')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'users' ? 'bg-[#9333ea]' : 'text-gray-400 hover:bg-white/5'}`}>
            User Management
          </button>
          <button onClick={() => setView('inventory')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'inventory' ? 'bg-[#9333ea]' : 'text-gray-400 hover:bg-white/5'}`}>
            Inventory
          </button>
        </nav>

        {/* LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 w-full p-4 rounded-2xl border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
        >
          <span>LOGOUT SYSTEM</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 overflow-y-auto">
        
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#131315] to-[#0a0a0c] p-8 rounded-[32px] border border-[#222225] shadow-2xl">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Total Capital</p>
                <h2 className="text-4xl font-display font-bold text-white">{formatCurrency(data?.financials?.totalCapital)}</h2>
              </div>
              <div className="bg-[#131315] p-8 rounded-[32px] border border-[#222225]">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Total Sales</p>
                <h2 className="text-4xl font-display font-bold">{data?.oversight?.totalSalesCount || 0}</h2>
              </div>
              <div className="bg-[#131315] p-8 rounded-[32px] border border-[#222225]">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Total Rentals</p>
                <h2 className="text-4xl font-display font-bold">{data?.oversight?.totalRentalsCount || 0}</h2>
              </div>
            </div>
            
            <div className="bg-[#0a0a0c]/80 backdrop-blur-xl p-8 rounded-[32px] border border-[#222225]">
               <h3 className="text-xl font-display font-bold text-white mb-6">Completed Transactions</h3>
               <div className="space-y-4">
                  {data?.completedTransactions?.map((tx: any) => (
                      <div key={`${tx.intent}-${tx.id}`} className="flex justify-between items-center p-4 bg-[#131315] border border-[#222225] rounded-2xl">
                         <div className="flex gap-6 items-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${tx.intent === 'sale' ? 'border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]' : 'border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]'}`}>{tx.intent}</span>
                            <div>
                               <p className="text-sm font-bold text-white mb-1">{tx.agent_name} <span className="text-[#9333ea] mx-2">→</span> {tx.client_name}</p>
                               <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Prop #{tx.property_id}</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <p className="font-display font-bold text-lg">{formatCurrency(tx.amount)}</p>
                         </div>
                      </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-display font-bold">Directory</h2>
              <button onClick={() => setShowAddAgent(true)} className="px-6 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                  + Add Agent
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Agents */}
              <div className="bg-[#0a0a0c]/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#9333ea] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
                 <h3 className="text-[#9333ea] text-[10px] tracking-[0.2em] font-bold uppercase mb-6 pb-4 border-b border-[#222225] relative z-10">Agents ({data?.agents?.length || 0})</h3>
                 <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-4 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#9333ea]/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#9333ea]/50 transition-colors">
                    {data?.agents?.map((a: any) => (
                       <div key={a.agent_id} className="bg-[#131315]/60 backdrop-blur-md border border-white/5 hover:border-[#9333ea]/40 p-5 rounded-2xl flex flex-col gap-3 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)] hover:-translate-y-1 relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#9333ea]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="flex justify-between items-start relative z-10">
                             <p className="font-bold text-white text-sm">{a.name} <span className="text-gray-600 text-[10px] ml-2">ID #{a.agent_id}</span></p>
                             <button onClick={() => handleDeleteUser('agents', a.agent_id)} className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-500/20 rounded-full transition-colors opacity-0 group-hover:opacity-100" title="Root Erase Agent">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                             </button>
                           </div>
                           <div className="flex flex-col gap-1.5 text-[11px] text-gray-400 font-medium relative z-10">
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-[#050505]/50 backdrop-blur-sm rounded-md border border-white/5 group-hover:border-[#9333ea]/20 transition-colors">📧 {a.email}</span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-[#050505]/50 backdrop-blur-sm rounded-md border border-white/5 group-hover:border-[#9333ea]/20 transition-colors">📱 {a.phone}</span>
                           </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              {/* Clients */}
              <div className="bg-[#0a0a0c]/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
                 <h3 className="text-[#3b82f6] text-[10px] tracking-[0.2em] font-bold uppercase mb-6 pb-4 border-b border-[#222225] relative z-10">Clients ({data?.clients?.length || 0})</h3>
                 <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-4 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3b82f6]/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3b82f6]/50 transition-colors">
                    {data?.clients?.map((c: any) => (
                       <div key={c.client_id} className="bg-[#131315]/60 backdrop-blur-md border border-white/5 hover:border-[#3b82f6]/40 p-5 rounded-2xl flex flex-col gap-3 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1 relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="flex justify-between items-start relative z-10">
                              <p className="font-bold text-white text-sm">{c.name}</p>
                              <div className="flex items-center gap-3">
                                  <span className="text-[9px] uppercase tracking-widest text-[#3b82f6] font-bold">{c.type}</span>
                                  <button onClick={() => handleDeleteUser('clients', c.client_id)} className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-500/20 rounded-full transition-colors opacity-0 group-hover:opacity-100" title="Root Erase Client">
                                     <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                               </div>
                           </div>
                           <div className="flex flex-col gap-1.5 text-[11px] text-gray-400 font-medium relative z-10">
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-[#050505]/50 backdrop-blur-sm rounded-md border border-white/5 group-hover:border-[#3b82f6]/20 transition-colors">📧 {c.email || 'N/A'}</span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-[#050505]/50 backdrop-blur-sm rounded-md border border-white/5 group-hover:border-[#3b82f6]/20 transition-colors">📱 {c.phone}</span>
                           </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              {/* Owners */}
              <div className="bg-[#0a0a0c]/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>
                 <h3 className="text-yellow-500 text-[10px] tracking-[0.2em] font-bold uppercase mb-6 pb-4 border-b border-[#222225] relative z-10">Owners ({data?.owners?.length || 0})</h3>
                 <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-4 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-yellow-500/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-yellow-500/50 transition-colors">
                    {data?.owners?.map((o: any) => (
                       <div key={o.owner_id} className="bg-[#131315]/60 backdrop-blur-md border border-white/5 hover:border-yellow-500/40 p-5 rounded-2xl flex flex-col gap-3 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:-translate-y-1 relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="flex justify-between items-start relative z-10">
                             <p className="font-bold text-white text-sm">{o.name} <span className="text-gray-600 text-[10px] ml-2">ID #{o.owner_id}</span></p>
                             <button onClick={() => handleDeleteUser('owners', o.owner_id)} className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-500/20 rounded-full transition-colors opacity-0 group-hover:opacity-100" title="Root Erase Owner">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                             </button>
                           </div>
                           <div className="flex flex-col gap-1.5 text-[11px] text-gray-400 font-medium relative z-10">
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-[#050505]/50 backdrop-blur-sm rounded-md border border-white/5 group-hover:border-yellow-500/20 transition-colors">📧 {o.email}</span>
                              <span className="flex items-center gap-2 px-3 py-1.5 bg-[#050505]/50 backdrop-blur-sm rounded-md border border-white/5 group-hover:border-yellow-500/20 transition-colors">📱 {o.phone}</span>
                           </div>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {view === 'inventory' && (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
             {data?.properties?.map((p: any, i: number) => (
               <div key={p.property_id} onClick={() => handleAssetClick(p.property_id)} className="bg-[#0a0a0c]/80 backdrop-blur-md border border-[#222225] p-4 rounded-3xl cursor-pointer hover:bg-[#131315] hover:border-[#9333ea]/30 transition-all flex gap-6 items-center group shadow-xl">
                  <div className="w-[140px] h-[90px] rounded-[20px] overflow-hidden shrink-0">
                      <img src={[`https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400`, `https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=400`][i%2]} alt="Property" className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"/>
                  </div>
                  <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-1">Washub Asset #{p.property_id}</h4>
                      <p className="text-[11px] text-gray-400 font-medium mb-2 leading-relaxed">{p.address || ''} {p.city_name}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#9333ea]">{formatCurrency(p.selling_price || p.rent_price)}</p>
                  </div>
                  <div className="text-right mr-4 flex flex-col items-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${p.status === 'available' ? 'border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]' : p.status === 'sold' ? 'border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]'}`}>
                          {p.status}
                      </span>
                      <button onClick={(e) => handleDeleteProperty(e, p.property_id)} className="w-8 h-8 inline-flex items-center justify-center text-red-500 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 rounded-full transition-colors" title="Root Override Property Archive">
                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                  </div>
               </div>
             ))}
           </div>
        )}

      </div>

      {selectedAsset && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-12">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setSelectedAsset(null)}></div>
             
             <div className="bg-[#050505]/95 border border-[#222225] rounded-[32px] w-full max-w-5xl relative z-10 flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(147,51,234,0.4)] animate-fade-in-up duration-300 my-auto max-h-[90vh]">
                 <button onClick={() => setSelectedAsset(null)} className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#9333ea] transition-all border border-white/10 shadow-2xl">
                     ✕
                 </button>
                 
                 {selectedAsset.loading ? (
                    <div className="w-full p-32 flex flex-col justify-center items-center gap-6">
                        <div className="w-16 h-16 border-4 border-[#9333ea]/20 border-t-[#9333ea] rounded-full animate-spin"></div>
                    </div>
                 ) : (
                    <>
                      <div className="w-full md:w-5/12 h-64 md:h-auto relative shrink-0">
                          <img src={`https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=800`} alt="Property" className="w-full h-full object-cover brightness-[0.6]"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-[#050505]/40 md:to-[#050505]"></div>
                          
                          <div className="absolute bottom-10 left-10">
                             <div className="inline-block px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full mb-6">
                                <p className={`text-[10px] uppercase tracking-[0.3em] font-bold ${selectedAsset.status === 'available' ? 'text-[#10b981]' : selectedAsset.status === 'sold' ? 'text-[#3b82f6]' : 'text-yellow-500'}`}>{selectedAsset.status}</p>
                             </div>
                             <h2 className="text-4xl font-display font-medium text-white mb-2">{formatCurrency(selectedAsset.selling_price || selectedAsset.rent_price)}</h2>
                             <p className="text-[13px] uppercase tracking-widest text-[#9333ea] font-bold">{selectedAsset.city_name} • {selectedAsset.type_name}</p>
                          </div>
                      </div>
                      
                      <div className="w-full md:w-7/12 p-10 lg:p-14 bg-[#050505]/60 flex flex-col relative backdrop-blur-md overflow-y-auto min-h-[500px]">
                           <div className="mb-12">
                               <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-gray-500 mb-4 border-b border-[#222225] pb-4">Asset Details</p>
                               <h3 className="text-3xl font-display font-bold text-white mb-3">Washub Property #{selectedAsset.property_id}</h3>
                               <p className="text-[14px] text-gray-400 max-w-md font-light leading-relaxed">{selectedAsset.address || 'Address pending.'} {selectedAsset.city_name}</p>
                           </div>

                           <div className="grid grid-cols-3 gap-4 mb-12">
                               <div className="bg-[#0a0a0c] border border-[#222225] rounded-[20px] p-6 text-center shadow-2xl relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#9333ea]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Structure</p>
                                    <p className="text-2xl font-display font-bold text-white">{selectedAsset.bedrooms} <span className="text-[11px] font-sans font-bold text-[#9333ea] tracking-widest">BHK</span></p>
                               </div>
                               <div className="bg-[#0a0a0c] border border-[#222225] rounded-[20px] p-6 text-center shadow-2xl relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#9333ea]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Baths</p>
                                    <p className="text-2xl font-display font-bold text-white">{selectedAsset.bathrooms}</p>
                               </div>
                               <div className="bg-[#0a0a0c] border border-[#222225] rounded-[20px] p-6 text-center shadow-2xl relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#9333ea]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Scale</p>
                                    <p className="text-2xl font-display font-bold text-white">{selectedAsset.size} <span className="text-[11px] font-sans font-bold text-[#9333ea] tracking-widest">SQFT</span></p>
                               </div>
                           </div>
                           
                           <div className="mb-12 p-6 bg-[#0a0a0c] border border-[#222225] rounded-[24px] flex gap-4 overflow-hidden relative group">
                               <div className="flex-1 bg-[#131315] border border-[#222225] p-5 rounded-[16px] text-center relative overflow-hidden group-hover:border-[#9333ea]/30 transition-colors">
                                   <div className="absolute top-0 right-0 w-16 h-16 bg-[#9333ea]/5 rounded-bl-[100px]"></div>
                                   <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#9333ea] mb-2">Agent</p>
                                   <p className="text-sm font-bold text-gray-300">{selectedAsset.agent_name || 'Pending'}</p>
                               </div>
                               <div className="flex-1 bg-[#131315] border border-[#222225] p-5 rounded-[16px] text-center relative overflow-hidden group-hover:border-[#eab308]/30 transition-colors">
                                   <div className="absolute top-0 right-0 w-16 h-16 bg-[#eab308]/5 rounded-bl-[100px]"></div>
                                   <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#eab308] mb-2">Owner</p>
                                   <p className="text-sm font-bold text-gray-300">{selectedAsset.owner_name}</p>
                               </div>
                           </div>

                           <div>
                               <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-500 mb-5 border-b border-[#222225] pb-4">Architectural Amenities</p>
                               <div className="flex flex-wrap gap-2">
                                  {selectedAsset.amenities?.map((am: any) => (
                                     <span key={am.amenity_id} className="px-4 py-2 bg-[#131315] border border-[#222225] rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                         {am.amenity_name}
                                     </span>
                                  ))}
                                  {!selectedAsset.amenities?.length && <span className="text-[10px] text-gray-600">Pending config...</span>}
                               </div>
                           </div>
                      </div>
                    </>
                 )}
             </div>
         </div>
      )}

      {showAddAgent && (
        <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#131315] border border-[#222225] p-8 rounded-[32px] w-full max-w-md shadow-2xl">
               <h2 className="text-2xl font-display font-bold mb-6">Register Official Agent</h2>
               <form onSubmit={handleAddAgent} className="space-y-4">
                  <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Agent Name</label>
                      <input type="text" required className="bg-[#0a0a0c] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={agentForm.name} onChange={(e) => setAgentForm({...agentForm, name: e.target.value})}/>
                  </div>
                  <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Email Address</label>
                      <input type="email" required className="bg-[#0a0a0c] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={agentForm.email} onChange={(e) => setAgentForm({...agentForm, email: e.target.value})}/>
                  </div>
                  <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Phone Number</label>
                      <input type="text" required className="bg-[#0a0a0c] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={agentForm.phone} onChange={(e) => setAgentForm({...agentForm, phone: e.target.value.replace(/\D/g, '')})}/>
                  </div>
                  <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Initial Password</label>
                      <input type="text" required className="bg-[#0a0a0c] border border-[#222225] w-full p-3 rounded-xl text-gray-400 outline-none" value={agentForm.password} readOnly/>
                  </div>
                  <div className="flex gap-4 mt-8 pt-4 border-t border-[#222225]">
                      <button type="button" onClick={() => setShowAddAgent(false)} className="px-6 py-3 rounded-xl bg-[#0a0a0c] hover:bg-[#222225] transition-colors font-bold text-sm">Cancel</button>
                      <button type="submit" className="flex-1 bg-[#9333ea] hover:bg-[#7e22ce] transition-colors text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(147,51,234,0.3)]">Deploy Agent</button>
                  </div>
               </form>
           </div>
        </div>
      )}

    </div>
  );
}