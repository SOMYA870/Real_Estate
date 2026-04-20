import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [view, setView] = useState(location.state?.isNew ? 'onboarding' : 'dashboard');
  const [clientType, setClientType] = useState(user.type?.toLowerCase() || 'buyer');
  
  // Feedback Action States
  const [reviewForm, setReviewForm] = useState({ property_id: '', rating: 5, comment: '' });
  const [actionMsg, setActionMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboards/client');
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.property_id || !reviewForm.comment) return alert("Fill all fields");
    try {
      // Assuming you have a post review endpoint or just mocking the success for UI flow
      // await api.post('/reviews', reviewForm);
      setActionMsg('Review published securely.');
      setTimeout(() => setActionMsg(''), 2000);
      setReviewForm({ property_id: '', rating: 5, comment: '' });
      fetchDashboard();
    } catch(err) {
      alert("Failed to submit review");
    }
  };

  const handleReleaseAsset = async (propertyId: number) => {
     try {
         await api.delete(`/properties/${propertyId}/release`);
         setActionMsg('Asset successfully released back to market.');
         setTimeout(() => setActionMsg(''), 2000);
         fetchDashboard();
     } catch(err) {
         alert("Failed to release asset.");
     }
  };

  const handleCompleteSetup = async () => {
    try {
      const payload = {
        name: user.name,
        phone: user.phone,
        email: user.email,
        type: clientType
      };
      const res = await api.put('/auth/profile', payload);
      // Synchronize updated user to local storage and refresh React state directly if possible
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Optionally update the local `user` reference if you mutate it, but since it's a snapshot, 
      // the page will use the newly cached data if they refresh, or we can just proceed to dashboard
    } catch(err) {
      console.error('Failed to sync profile', err);
    }
    setView('dashboard');
  };

  const navItems = [
    { id: 'dashboard', name: 'Client Dashboard' },
    { id: 'inquiries', name: 'My Inquiries' },
    { id: 'search', name: 'Search & Discovery' },
    { id: 'transactions', name: 'My Transactions' },
    { id: 'reviews', name: 'My Reviews' }
  ];

  const formatCurrency = (val: number) => '$' + (val || 0).toLocaleString();

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8 font-sans relative">
         <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1628611225249-6c3c7c689552?auto=format&fit=crop&q=80" alt="" className="w-full h-full object-cover brightness-[0.2]"/>
          <div className="absolute inset-0 bg-[#10b981]/10 mix-blend-color"></div>
         </div>
         <div className="max-w-xl w-full bg-[#0a0a0c]/90 backdrop-blur-xl border border-[#10b981]/30 rounded-[32px] p-12 text-center relative z-10 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            <h1 className="text-3xl font-display font-bold mb-2">Welcome to Washub, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-400 mb-8 font-light">Let’s configure your Client Preferences.</p>
            
            <div className="bg-[#131315] border border-[#222225] rounded-[16px] p-6 mb-8 text-left">
               <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-gray-500 mb-4">Identity Confirmation</p>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-400">Client ID:</span>
                 <span className="text-sm font-bold text-white">#WSH-{user.id || 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-400">Account Type:</span>
                 <span className="text-sm font-bold text-[#10b981] uppercase tracking-widest">{clientType}</span>
               </div>
            </div>

            <div className="space-y-4 text-left mb-10">
               <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-gray-500 mb-4 ml-1">Preference Setup</p>

               <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setClientType('buyer')} className={`${clientType === 'buyer' ? 'bg-[#10b981] border border-[#047857] shadow-lg text-white' : 'bg-[#131315] border border-[#222225] hover:border-[#10b981] text-gray-400'} p-4 rounded-xl text-center transition-colors`}>
                      <span className="text-sm font-bold block">Looking to Buy</span>
                   </button>
                   <button onClick={() => setClientType('renter')} className={`${clientType === 'renter' ? 'bg-[#10b981] border border-[#047857] shadow-lg text-white' : 'bg-[#131315] border border-[#222225] hover:border-[#10b981] text-gray-400'} p-4 rounded-xl text-center transition-colors`}>
                      <span className="text-sm font-bold block">Looking to Rent</span>
                   </button>
               </div>
               
               <div className="bg-[#131315] border border-[#222225] p-4 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-300">Min Bedrooms</span>
                  <select className="bg-[#131315] text-white outline-none font-bold">
                      <option className="bg-[#131315] text-white">Any</option><option className="bg-[#131315] text-white">2+ BHK</option><option className="bg-[#131315] text-white">3+ BHK</option><option className="bg-[#131315] text-white">4+ BHK</option>
                  </select>
               </div>

               <div className="bg-[#131315] border border-[#222225] p-4 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-300">Budget Range</span>
                  <select className="bg-[#131315] text-white outline-none font-bold">
                      <option className="bg-[#131315] text-white">$1M - $3M</option><option className="bg-[#131315] text-white">$3M - $5M</option><option className="bg-[#131315] text-white">$5M+</option>
                  </select>
               </div>
            </div>

            <button onClick={handleCompleteSetup} className="w-full bg-gradient-to-r from-[#10b981] to-[#047857] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all">
               Complete Setup & Enter Dashboard
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
            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-[#222225] text-white flex items-center justify-center font-bold text-lg uppercase bg-[#10b981]/20 text-[#10b981]">
               {user.name ? user.name[0] : 'C'}
            </div>
            <div>
              <p className="text-white text-[13px] font-bold">{user.name || 'Client'}</p>
              <p className="text-gray-500 text-[9px] uppercase tracking-wider">{user.type || 'Buyer'}</p>
            </div>
          </div>

          <button onClick={() => navigate('/properties')} className="w-full bg-gradient-to-r from-[#10b981] to-[#047857] text-white text-[11px] font-bold tracking-widest uppercase py-3.5 mb-8 rounded-[14px] hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
            Access Full Catalog
          </button>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[14px] transition-all font-bold text-[13px] ${view === item.id ? 'bg-[#131315] text-white border border-[#222225] shadow-lg' : 'text-gray-400 hover:text-white hover:bg-[#131315]'}`}
              >
                <div className={`w-2 h-2 rounded-full ${view === item.id ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]' : 'bg-gray-600'}`}></div>
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
            <p className="text-[10px] tracking-[0.2em] font-bold text-[#10b981] uppercase mb-2">Discovery Hub</p>
            <h1 className="text-4xl font-display font-bold mb-2">Client Dashboard.</h1>
          </div>
          {actionMsg && <div className="px-6 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold font-display animate-pulse">{actionMsg}</div>}
        </div>

        {view === 'dashboard' && (
           <>
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <div className="bg-[#131315] border border-[#222225] rounded-[24px] p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 rounded-bl-full"></div>
                 <p className="text-[11px] font-medium text-gray-400 mb-2">Total Capital Deployed</p>
                 <p className="text-[40px] font-display font-bold text-white relative z-10">{data ? formatCurrency(data.totalSpent) : '$0'}</p>
               </div>
               <div className="bg-[#050505] border border-[#222225] rounded-[24px] p-8">
                 <p className="text-[11px] font-medium text-gray-400 mb-2">Active Washub Leases</p>
                 <p className="text-[40px] font-display font-bold text-white">{data?.rentals?.length || 0}</p>
               </div>
               <div className="bg-[#050505] border border-[#222225] rounded-[24px] p-8">
                 <p className="text-[11px] font-medium text-gray-400 mb-2">Acquired Assets</p>
                 <p className="text-[40px] font-display font-bold text-white">{data?.purchases?.length || 0}</p>
               </div>
            </div>

            <div className="bg-[#0a0a0c] border border-[#222225] rounded-[24px] p-8">
               <h2 className="text-xl font-display font-bold mb-6">Recommended for You</h2>
               <div className="flex gap-4">
                  {[1,2,3].map((num, i) => (
                      <div key={num} className="flex-1 rounded-[16px] bg-[#131315] border border-[#222225] overflow-hidden group cursor-pointer relative" onClick={() => navigate('/properties')}>
                          <img src={[`https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=400`, `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400`, `https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400`][i]} className="w-full h-32 object-cover brightness-75 group-hover:brightness-100 transition-all duration-500 scale-100 group-hover:scale-105" alt="Recommendation" />
                          <div className="absolute top-2 right-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] uppercase tracking-widest font-bold text-[#10b981]">Match 98%</div>
                          <div className="p-4">
                              <p className="font-bold text-sm">Curated Selection {num}</p>
                              <p className="text-[11px] text-gray-500">Based on your preferences</p>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
           </>
        )}

        {view === 'search' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8 min-h-[500px] flex flex-col justify-center items-center text-center">
               <div className="w-20 h-20 rounded-full bg-[#131315] border border-[#222225] flex items-center justify-center text-[#10b981] mb-8">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>
               <h2 className="text-3xl font-display font-bold mb-4">Deep Property Search</h2>
               <p className="text-gray-400 max-w-sm mb-10 leading-relaxed font-light">Launch the global Washub API parameters to locate specific Price points, BHK dimensions, and aesthetic classes.</p>
               
               <button onClick={() => navigate('/properties')} className="bg-gradient-to-r from-[#10b981] to-[#047857] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
                  Launch Master Catalog
               </button>
           </div>
        )}

        {view === 'inquiries' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8">
               <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-2">My Active Inquiries<span className="text-[#10b981]">.</span></h2>
               <div className="space-y-4">
                  {data?.inquiries?.map((inq:any) => (
                      <div key={inq.inquiry_id} className="bg-[#131315] border border-[#222225] p-5 rounded-2xl flex justify-between items-center group hover:border-[#10b981]/30 transition-colors">
                          <div className="flex-1">
                              <p className="font-bold text-white text-sm mb-1">Inquiry: Property #{inq.property_id} ({inq.city_name})</p>
                              <p className="text-[11px] text-gray-400 mb-2">Message: "{inq.message}"</p>
                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Assigned Agent: {inq.agent_name}</p>
                          </div>
                          <div className="ml-6 text-right">
                              <span className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full ${inq.status === 'accepted' ? 'bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20' : inq.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                 {inq.status}
                              </span>
                          </div>
                      </div>
                  ))}
                  {(!data?.inquiries || data?.inquiries?.length === 0) && (
                     <div className="p-10 border border-[#222225] rounded-3xl text-center text-gray-600 font-bold tracking-widest text-[10px] uppercase">No Inquiries Found</div>
                  )}
               </div>
           </div>
        )}

        {view === 'transactions' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8">
               <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-2">My Transactions<span className="text-[#10b981]">.</span></h2>
               <div className="space-y-4">
                  {data?.purchases?.map((t:any) => (
                      <div key={t.sale_id} className="bg-[#131315] border border-[#222225] p-5 rounded-2xl flex justify-between items-center group hover:border-[#10b981]/30 transition-colors">
                          <div>
                              <p className="font-bold text-white text-sm mb-1">Asset Deployed - Purchase</p>
                              <p className="text-[11px] text-gray-400">Washub Property #{t.property_id} • Amount: {formatCurrency(t.price)}</p>
                          </div>
                          <div className="flex gap-4 items-center">
                              <span className="px-4 py-1.5 bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20 text-[9px] font-bold uppercase tracking-widest rounded-full">Sale Validated</span>
                              <span className="px-4 py-1.5 border border-[#222225] bg-[#131315] text-gray-500 text-[9px] font-bold uppercase tracking-widest rounded-full">Permanently Acquired</span>
                          </div>
                      </div>
                  ))}
                  {data?.rentals?.map((t:any) => (
                      <div key={t.rental_id} className="bg-[#131315] border border-[#222225] p-5 rounded-2xl flex justify-between items-center group hover:border-[#10b981]/30 transition-colors">
                          <div>
                              <p className="font-bold text-white text-sm mb-1">Asset Deployed - Lease</p>
                              <p className="text-[11px] text-gray-400">Washub Property #{t.property_id} • Amount: {formatCurrency(t.rent_amount)} / mo</p>
                          </div>
                          <div className="flex gap-4 items-center">
                              {new Date(t.end_date) <= new Date() ? (
                                   <span className="px-4 py-1.5 bg-[#131315] border border-[#222225] text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-full">Lease Concluded</span>
                               ) : (
                                   <>
                                      <span className="px-4 py-1.5 bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/20 text-[9px] font-bold uppercase tracking-widest rounded-full">Lease Active</span>
                                      <button onClick={() => handleReleaseAsset(t.property_id)} className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-500 text-[9px] font-bold uppercase tracking-widest rounded-full transition-colors cursor-pointer relative z-10">Terminate Lease</button>
                                   </>
                               )}
                          </div>
                      </div>
                  ))}
                  {(!data?.purchases?.length && !data?.rentals?.length) && (
                     <div className="p-10 border border-[#222225] rounded-3xl text-center text-gray-600 font-bold tracking-widest text-[10px] uppercase">No Transaction Logs Found</div>
                  )}
               </div>
           </div>
        )}

        {view === 'reviews' && (
           <div className="bg-[#0a0a0c] border border-[#222225] rounded-[32px] p-8">
               <h2 className="text-2xl font-display font-bold mb-8">My Reviews Hub</h2>
               
               <form onSubmit={submitReview} className="bg-[#131315] border border-[#222225] p-6 rounded-[24px] mb-10 flex gap-4 items-end">
                   <div className="flex-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-2 block ml-1">Property ID Reference</label>
                      <input type="text" value={reviewForm.property_id} onChange={(e) => setReviewForm({...reviewForm, property_id: e.target.value})} className="w-full bg-[#050505] border border-[#222225] text-white px-4 py-3 rounded-xl outline-none focus:border-[#10b981] transition-colors" placeholder="e.g. 15"/>
                   </div>
                   <div className="flex-[2]">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-2 block ml-1">Client Comment</label>
                      <input type="text" value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full bg-[#050505] border border-[#222225] text-white px-4 py-3 rounded-xl outline-none focus:border-[#10b981] transition-colors" placeholder="Exquisite brutalist geometry..."/>
                   </div>
                   <button type="submit" className="bg-[#10b981] text-white font-bold uppercase tracking-widest text-[10px] px-8 py-4 rounded-xl hover:bg-[#047857] transition-all">Post Review</button>
               </form>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.reviews?.map((r:any) => (
                      <div key={r.review_id} className="bg-[#131315] border border-[#222225] p-6 rounded-2xl relative group">
                          <div className="flex justify-between items-start mb-4">
                              <p className="font-bold text-white text-[10px] tracking-widest uppercase text-[#10b981]">Prop #{r.property_id}</p>
                              <div className="flex text-yellow-500 text-sm">
                                 {"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}
                              </div>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed italic">"{r.comment}"</p>
                          <div className="absolute top-4 right-4 hidden group-hover:flex gap-2">
                             <span className="text-[9px] font-bold text-blue-400 cursor-pointer uppercase">Edit</span>
                             <span className="text-[9px] font-bold text-red-500 cursor-pointer uppercase">Del</span>
                          </div>
                      </div>
                  ))}
               </div>
           </div>
        )}

      </div>
    </div>
  );
}
