import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [view, setView] = useState(location.state?.isNew ? 'onboarding' : 'dashboard');
  
  // Modals & States
  const [actionMsg, setActionMsg] = useState('');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [propForm, setPropForm] = useState({ city_id: 1, type_id: 1, size: 1000, bedrooms: 2, bathrooms: 2, year_of_construction: 2020, selling_price: 0, rent_price: 0, owner_id: 1, address: '' });

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboards/agent');
      setData(res.data);
    } catch (err) {
      console.error(err);
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

  const handleDeleteProperty = async (id: number) => {
    if(!window.confirm('Delete property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      fetchDashboard();
      setActionMsg('Property deleted');
      setTimeout(() => setActionMsg(''), 2000);
    } catch(err) {
      alert("Failed to delete");
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(!propForm.selling_price && !propForm.rent_price) return alert("Please specify either selling or rent price.");
      await api.post('/properties', { ...propForm, agent_id: user.id });
      setShowAddProperty(false);
      fetchDashboard();
      setActionMsg('Property Added Securely');
      setTimeout(() => setActionMsg(''), 2000);
    } catch(err: any) {
      alert("Failed to add property: " + (err.response?.data?.error || err.message));
    }
  };

  const handleInquiryStatus = async (inquiryId: number, status: string) => {
     try {
         await api.put(`/dashboards/agent/inquiries/${inquiryId}`, { status });
         fetchDashboard();
         setActionMsg(`Inquiry ${status}`);
         setTimeout(() => setActionMsg(''), 2000);
     } catch(err: any) {
         alert("Failed to resolve inquiry");
     }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'inquiries', name: 'Client Inquiries' },
    { id: 'properties', name: 'Property Management' },
    { id: 'transactions', name: 'Transaction Logs' },
    { id: 'reviews', name: 'Client Reviews' },
    { id: 'about', name: 'About Team' }
  ];

  const formatCurrency = (val: number) => '$' + (val || 0).toLocaleString();

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8 font-sans relative">
         <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover brightness-[0.2]"/>
          <div className="absolute inset-0 bg-[#a855f7]/10 mix-blend-color"></div>
         </div>
         <div className="max-w-xl w-full bg-[#0a0a0c]/90 backdrop-blur-xl border border-[#a855f7]/30 rounded-[32px] p-12 text-center relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <div className="w-16 h-16 rounded-full bg-[#131315] border border-[#a855f7]/50 text-[#a855f7] flex items-center justify-center mx-auto mb-6 text-3xl font-display font-medium">✨</div>
            <h1 className="text-3xl font-display font-bold mb-2">Account Created Successfully</h1>
            <p className="text-gray-400 mb-8 font-light">Welcome to the Washub Elite Agent Network, {user.name}.</p>
            
            <div className="bg-[#131315] border border-[#222225] rounded-[16px] p-6 mb-8 text-left">
               <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-gray-500 mb-4">Official Records</p>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-400">Agent ID:</span>
                 <span className="text-sm font-bold text-white">#WSH-{user.id || 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">Joining Date:</span>
                 <span className="text-sm font-bold text-white">{new Date().toLocaleDateString()}</span>
               </div>
            </div>

            <div className="space-y-4 text-left mb-10">
               <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-gray-500 mb-4 ml-1">Quick Start Guide</p>
               <button className="w-full bg-[#131315] border border-[#222225] p-4 rounded-xl text-left hover:border-[#a855f7] transition-all">
                  <span className="text-white text-sm font-bold block mb-1">Add Your First Property →</span>
                  <span className="text-gray-500 text-xs">Curate your portfolio immediately.</span>
               </button>
               <button className="w-full bg-[#131315] border border-[#222225] p-4 rounded-xl text-left hover:border-[#a855f7] transition-all">
                  <span className="text-white text-sm font-bold block mb-1">View Assigned Clients →</span>
                  <span className="text-gray-500 text-xs">Review inquiries and sales targets.</span>
               </button>
            </div>

            <button onClick={() => setView('dashboard')} className="w-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all">
               Go to Dashboard
            </button>
         </div>
      </div>
    )
  }

  return (
    <div className="flex bg-[#050505] min-h-screen font-sans text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#222225] p-8 flex flex-col justify-between hidden lg:flex h-screen sticky top-0 bg-[#070708]">
        <div>
          <h2 className="text-white font-display font-bold tracking-widest text-xl mb-12 uppercase cursor-pointer" onClick={() => navigate('/')}>WASHUB</h2>
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-[#222225] text-white flex items-center justify-center font-bold text-xl uppercase bg-[#a855f7]/20 text-[#a855f7]">
               {user.name ? user.name[0] : 'A'}
            </div>
            <div>
              <p className="text-white text-[13px] font-bold">{user.name || 'Agent'}</p>
              <p className="text-gray-500 text-[9px] uppercase tracking-wider">Agent Panel</p>
            </div>
          </div>

          <button onClick={() => setView('properties')} className="w-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white text-[11px] font-bold tracking-widest uppercase py-3.5 mb-8 rounded-[14px] hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
            + Add Property
          </button>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[14px] transition-all font-bold text-[13px] ${view === item.id ? 'bg-[#131315] text-white border border-[#222225] shadow-lg' : 'text-gray-400 hover:text-white hover:bg-[#131315]'}`}
              >
                <div className={`w-2 h-2 rounded-full ${view === item.id ? 'bg-[#a855f7] shadow-[0_0_8px_#a855f7]' : 'bg-gray-600'}`}></div>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="space-y-2">
             <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-[13px] text-red-500 hover:text-white hover:bg-[#131315]">
                Sign Out
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 lg:p-12">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] tracking-[0.2em] font-bold text-arch-purple uppercase mb-2">Command Center</p>
            <h1 className="text-4xl font-display font-bold mb-2">Agent Headquarters.</h1>
          </div>
          {actionMsg && <div className="px-6 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold font-display animate-pulse">{actionMsg}</div>}
        </div>

        {view === 'dashboard' && (
           <>
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <div className="bg-[#131315] border border-[#222225] rounded-[24px] p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/10 rounded-bl-full"></div>
                 <p className="text-[11px] font-medium text-gray-400 mb-2">Total Managed Properties</p>
                 <p className="text-[40px] font-display font-bold text-white relative z-10">{data?.metrics?.totalProperties || 0}</p>
                 <p className="text-[11px] font-bold text-[#22c55e] mt-4">Active oversight</p>
               </div>
               <div className="bg-[#050505] border border-[#222225] rounded-[24px] p-8">
                 <p className="text-[11px] font-medium text-gray-400 mb-2">Active Sales Under Agent</p>
                 <p className="text-[40px] font-display font-bold text-white">{data?.metrics?.activeSales || 0}</p>
               </div>
               <div className="bg-[#050505] border border-[#222225] rounded-[24px] p-8">
                 <p className="text-[11px] font-medium text-gray-400 mb-2">Active Rentals Handled</p>
                 <p className="text-[40px] font-display font-bold text-white">{data?.metrics?.activeRentals || 0}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0c] border border-[#222225] rounded-[24px] p-8">
                    <h2 className="text-xl font-display font-bold mb-6">Recent Property Activity</h2>
                    {data?.managedPortfolio?.slice(0,3).map((p:any) => (
                        <div key={p.property_id} className="flex justify-between items-center py-4 border-b border-[#222225] last:border-0">
                            <div>
                                <p className="font-bold">Prop #{p.property_id} - {p.city_name}</p>
                                <p className="text-[11px] text-gray-400">{formatCurrency(p.selling_price || p.rent_price)}</p>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-bold px-3 py-1 bg-white/5 border border-white/10 rounded-full">{p.status}</span>
                        </div>
                    ))}
                </div>
            </div>
           </>
        )}

        {view === 'properties' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8">
               <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-display font-bold">Property Management (CRUD)</h2>
                   <button onClick={() => setShowAddProperty(true)} className="bg-[#9333ea] px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white hover:bg-[#7e22ce] transition-colors shadow-lg shadow-purple-900/30">+ Add Property</button>
               </div>
               
               <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                       <thead>
                           <tr className="border-b border-[#222225]">
                               <th className="pb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">ID</th>
                               <th className="pb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">Location</th>
                               <th className="pb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">Price</th>
                               <th className="pb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">Status</th>
                               <th className="pb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500 text-right">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="text-sm">
                           {data?.managedPortfolio?.map((p: any) => (
                               <tr key={p.property_id} className="border-b border-[#222225]/50 hover:bg-[#131315] transition-colors leading-10">
                                   <td className="font-bold text-[#a855f7]">#{p.property_id}</td>
                                   <td>{p.city_name}</td>
                                   <td className="font-medium">{formatCurrency(p.selling_price || p.rent_price)}</td>
                                   <td><span className="px-3 py-1 text-[9px] uppercase font-bold border border-white/10 rounded-full">{p.status}</span></td>
                                   <td className="text-right space-x-2">
                                       <button className="text-xs text-blue-400 hover:text-blue-300 font-bold" onClick={() => alert('Editing ID ' + p.property_id)}>Edit</button>
                                       <button className="text-xs text-red-500 hover:text-red-400 font-bold" onClick={() => handleDeleteProperty(p.property_id)}>Delete</button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
        )}

        {view === 'inquiries' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8">
               <h2 className="text-2xl font-display font-bold mb-8">Client Inquiries</h2>
               <div className="space-y-4">
                  {data?.inquiries?.map((inq:any) => (
                      <div key={inq.inquiry_id} className="bg-[#131315] border border-[#222225] p-6 rounded-2xl flex justify-between items-center group hover:border-[#a855f7]/30 transition-colors">
                          <div className="flex-1">
                              <p className="font-bold text-white text-sm mb-1">{inq.client_name} <span className="text-gray-500 font-normal ml-2">({inq.client_phone})</span></p>
                              <p className="text-[12px] text-gray-300 italic mb-2">"{inq.message}"</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Target: Property #{inq.property_id} (City #{inq.city_id})</p>
                          </div>
                          <div className="flex flex-col gap-2 ml-6 text-right items-end">
                              <span className={`px-4 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${inq.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : inq.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>{inq.status}</span>
                              {inq.status === 'pending' && (
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleInquiryStatus(inq.inquiry_id, 'accepted')} className="px-3 py-1 bg-[#a855f7] hover:bg-[#7e22ce] text-white text-[10px] rounded cursor-pointer transition-colors font-bold uppercase">Accept</button>
                                  <button onClick={() => handleInquiryStatus(inq.inquiry_id, 'rejected')} className="px-3 py-1 bg-[#222225] hover:bg-[#333336] text-white text-[10px] rounded cursor-pointer transition-colors font-bold uppercase">Reject</button>
                                </div>
                              )}
                          </div>
                      </div>
                  ))}
                  {(!data?.inquiries || data?.inquiries?.length === 0) && (
                     <div className="p-8 text-center border border-[#222225] rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">No Pending Inquiries</div>
                  )}
               </div>
           </div>
        )}

        {view === 'transactions' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8">
               <h2 className="text-2xl font-display font-bold mb-8">Transaction Logs</h2>
               <div className="space-y-4">
                  {data?.transactions?.map((t:any, i:number) => (
                      <div key={i} className="bg-[#131315] border border-[#222225] p-5 rounded-2xl flex justify-between items-center group hover:border-[#a855f7]/30 transition-colors">
                          <div>
                              <p className="font-bold text-white text-sm mb-1">{t.type} Contract Confirmed</p>
                              <p className="text-[11px] text-gray-400">Property #{t.property_id} • Amount: {formatCurrency(t.price || t.rent_amount)}</p>
                          </div>
                          <span className="px-4 py-1.5 bg-[#a855f7]/20 text-[#d8b4fe] border border-[#a855f7]/40 text-[9px] font-bold uppercase tracking-widest rounded-full">{t.type}</span>
                      </div>
                  ))}
               </div>
           </div>
        )}

        {view === 'reviews' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8">
               <h2 className="text-2xl font-display font-bold mb-8">Client Feedback</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.reviews?.map((r:any) => (
                      <div key={r.review_id} className="bg-[#131315] border border-[#222225] p-6 rounded-2xl relative">
                          <div className="flex justify-between items-start mb-4">
                              <p className="font-bold text-white">{r.client_name}</p>
                              <div className="flex text-yellow-500 text-sm">
                                 {"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}
                              </div>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed italic">"{r.comment}"</p>
                          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold absolute bottom-6 right-6">Prop #{r.property_id}</p>
                      </div>
                  ))}
               </div>
           </div>
        )}

        {view === 'about' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-12 text-center max-w-3xl mx-auto mt-10 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#a855f7] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
               <h2 className="text-3xl font-display font-bold mb-4 drop-shadow-lg">Washub Excellence</h2>
               <p className="text-gray-400 mb-12 max-w-lg mx-auto text-sm leading-relaxed">Built and designed natively. The architectural blueprint for real estate database systems mapping high-level analytics securely.</p>
               
               <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#a855f7] mb-8">Engineering Credits</p>
               <div className="flex flex-wrap justify-center gap-6">
                  {['Shivam', 'Sameer', 'Rohit', 'Somya'].map(name => (
                     <div key={name} className="px-8 py-3 bg-[#131315] border border-[#222225] rounded-full text-white font-bold tracking-widest shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)] hover:border-[#a855f7] transition-all cursor-pointer">
                        {name}
                     </div>
                  ))}
               </div>
           </div>
        )}

      </div>

      {showAddProperty && (
        <div className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#0a0a0c] border border-[#222225] p-8 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
               <h2 className="text-2xl font-display font-bold mb-6">Register New Property</h2>
               <form onSubmit={handleAddProperty} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Complete Address</label>
                          <input type="text" required placeholder="Street address or locality..." className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.address} onChange={(e) => setPropForm({...propForm, address: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">City</label>
                          <select className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.city_id} onChange={(e) => setPropForm({...propForm, city_id: Number(e.target.value)})}>
                             <option value={1}>Delhi</option><option value={2}>Mumbai</option><option value={3}>Pune</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Property Type</label>
                          <select className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.type_id} onChange={(e) => setPropForm({...propForm, type_id: Number(e.target.value)})}>
                             <option value={1}>Flat</option><option value={2}>House</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Size (sqft)</label>
                          <input type="number" required className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.size} onChange={(e) => setPropForm({...propForm, size: Number(e.target.value)})}/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Year Constructed</label>
                          <input type="number" required className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.year_of_construction} onChange={(e) => setPropForm({...propForm, year_of_construction: Number(e.target.value)})}/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Bedrooms</label>
                          <input type="number" required className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.bedrooms} onChange={(e) => setPropForm({...propForm, bedrooms: Number(e.target.value)})}/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Bathrooms</label>
                          <input type="number" required className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.bathrooms} onChange={(e) => setPropForm({...propForm, bathrooms: Number(e.target.value)})}/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Selling Price ($)</label>
                          <input type="number" className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.selling_price} onChange={(e) => setPropForm({...propForm, selling_price: Number(e.target.value)})}/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Rent Price ($)</label>
                          <input type="number" className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.rent_price} onChange={(e) => setPropForm({...propForm, rent_price: Number(e.target.value)})}/>
                      </div>
                      <div className="col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Owner ID Reference (Database Link)</label>
                          <input type="number" required className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.owner_id} onChange={(e) => setPropForm({...propForm, owner_id: Number(e.target.value)})}/>
                      </div>
                  </div>
                  <div className="flex gap-4 mt-8 pt-4 border-t border-[#222225]">
                      <button type="button" onClick={() => setShowAddProperty(false)} className="px-6 py-3 rounded-xl bg-[#131315] hover:bg-[#222225] transition-colors font-bold text-sm">Cancel</button>
                      <button type="submit" className="flex-1 bg-[#a855f7] hover:bg-[#7e22ce] transition-colors text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)]">List Property Securely</button>
                  </div>
               </form>
           </div>
        </div>
      )}

    </div>
  );
}
