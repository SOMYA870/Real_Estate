import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  
  // Profile settings state
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [profileForm, setProfileForm] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  const [profileMessage, setProfileMessage] = useState('');
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  // Add Property State
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [propForm, setPropForm] = useState<{ city_id: number, type_id: number, size: number, bedrooms: number, bathrooms: number, year_of_construction: number, selling_price: number, rent_price: number, address: string, agent_id: number|string, amenities: number[] }>({ city_id: 1, type_id: 1, size: 1000, bedrooms: 2, bathrooms: 2, year_of_construction: 2024, selling_price: 0, rent_price: 0, address: '', agent_id: '', amenities: [] });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboards/owner');
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
     e.preventDefault();
     setProfileMessage('Updating...');
     try {
       const res = await api.put('/auth/profile', profileForm);
       localStorage.setItem('user', JSON.stringify(res.data.user));
       setUser(res.data.user);
       setProfileMessage('Profile updated successfully!');
       setTimeout(() => { setShowProfile(false); setProfileMessage(''); }, 1500);
     } catch (err) {
       setProfileMessage('Error updating profile.');
     }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(!propForm.selling_price && !propForm.rent_price) return alert("Please specify either selling or rent price.");
      // The API endpoint requires owner_id explicitly mapping to User DB parameters natively securely.
      await api.post('/properties', { ...propForm, owner_id: user.id });
      setShowAddProperty(false);
      
      // Reload dashboard cleanly 
      const res = await api.get('/dashboards/owner');
      setData(res.data);
    } catch(err: any) {
      alert("Failed to add property: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteProperty = async (e: React.MouseEvent, propId: number) => {
    e.stopPropagation();
    if(window.confirm("WARNING: Are you absolutely sure you want to permanently delete this asset? This action natively triggers SQL ON DELETE CASCADE rules seamlessly unwiring assigned agents and destroying mapped transaction histories explicitly.")) {
      try {
        await api.delete(`/properties/${propId}`);
        const res = await api.get('/dashboards/owner');
        setData(res.data);
      } catch(err: any) {
        alert("Failed to rigidly delete property: " + (err.response?.data?.error || err.message));
      }
    }
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

  const navItems = [
    { name: 'Dashboard', path: '/owner' },
    { name: 'Logout', path: '/login' }
  ];

  const formatCurrency = (val: number) => {
    if (!val) return '$0';
    if (val >= 1000000) return '$' + (val / 1000000).toFixed(2) + 'M';
    return '$' + val.toLocaleString();
  };

  return (
    <div className="flex bg-[#050505] min-h-screen font-sans text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#222225] p-8 flex flex-col justify-between hidden lg:flex h-screen sticky top-0">
        <div>
          <h2 className="text-white font-display font-bold tracking-widest text-xl mb-12 uppercase cursor-pointer" onClick={() => navigate('/')}>WASHUB</h2>
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-[#222225] text-white flex items-center justify-center font-bold text-xl uppercase bg-[#3b82f6]/20 text-[#3b82f6]">
               {user.name ? user.name[0] : 'O'}
            </div>
            <div>
              <p className="text-white text-[13px] font-bold">{user.name || 'Owner'}</p>
              <p className="text-gray-500 text-[9px] uppercase tracking-wider">Asset Proprietor</p>
            </div>
          </div>

          <button onClick={() => setShowAddProperty(true)} className="w-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-[11px] font-bold tracking-widest uppercase py-3.5 mb-8 rounded-[14px] hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
            Add Property
          </button>

          <nav className="space-y-2">
            {navItems.map((item, i) => (
              <button 
                key={item.name} 
                onClick={() => {
                  if (item.path === '/login') handleLogout();
                  else navigate(item.path);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[14px] transition-all font-bold text-[13px] ${i === 0 ? 'bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-gray-400 hover:text-white hover:bg-[#131315]'}`}
              >
                <div className="w-4 h-4 bg-current opacity-70 mask-icon"></div>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="space-y-2">
            <button onClick={() => setShowProfile(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-[13px] text-gray-500 hover:text-white hover:bg-[#131315]">
                Settings
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 lg:p-12 bg-[#0a0a0c]">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] tracking-[0.2em] font-bold text-[#3b82f6] uppercase mb-2">Proprietor Network</p>
            <h1 className="text-4xl font-display font-bold mb-2">Asset Intelligence.</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 border border-[#222225] bg-[#131315] px-4 py-2 rounded-full hover:bg-[#222225] transition-colors">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-300">Valuation: Current</span>
            </button>
          </div>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1 */}
          <div className="bg-[#131315] border border-[#222225] rounded-[24px] p-8">
             <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex justify-center items-center mb-6">
                <svg className="w-4 h-4 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/></svg>
             </div>
             <p className="text-[11px] font-medium text-gray-400 mb-2">Total Net Valuation</p>
             <p className="text-[40px] font-display font-bold text-white mb-6">
                {data ? formatCurrency(data.totalValue) : '$0.0M'}
             </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#050505] border border-[#222225] rounded-[24px] p-8">
             <div className="w-8 h-8 rounded-full bg-gray-800 flex justify-center items-center mb-6">
                 <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
             </div>
             <p className="text-[11px] font-medium text-gray-400 mb-2">Leased Assets</p>
             <p className="text-[40px] font-display font-bold text-white mb-8">
                {data ? data.leasedAssets : '0'}
             </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#050505] border border-[#222225] rounded-[24px] p-8">
             <div className="w-8 h-8 rounded-full bg-gray-800 flex justify-center items-center mb-6">
                 <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
             </div>
             <p className="text-[11px] font-medium text-gray-400 mb-2">Active Holdings</p>
             <p className="text-[40px] font-display font-bold text-white mb-6">
                0{data ? data.activeAssets : '0'}
             </p>
          </div>
        </div>

        {/* Managed Portfolio Row Cards */}
        <div className="mb-10">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">Holdings Portfolio<span className="text-[#3b82f6]">.</span></h2>
            </div>

            <div className="space-y-4">
               {data?.portfolio?.map((prop: any, i: number) => (
                   <div key={prop.property_id} onClick={() => handleAssetClick(prop.property_id)} className="bg-[#050505] border border-[#222225] rounded-[24px] p-3 flex justify-between items-center cursor-pointer hover:bg-[#131315] hover:border-[#3b82f6]/30 transition-all group shadow-md hover:shadow-xl">
                       <div className="flex items-center gap-6">
                           <div className="w-[160px] h-[90px] rounded-[16px] overflow-hidden ml-1">
                               <img 
                                src={[`https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400`, `https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=400`][i%2]} 
                                alt="" 
                                className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-500 scale-100 group-hover:scale-105"
                               />
                           </div>
                           <div>
                               <h3 className="text-white text-lg font-bold mb-1">Washub Prop #{prop.property_id}</h3>
                               <p className="text-[12px] text-gray-400 font-medium mb-1">{prop.city_name} • {formatCurrency(prop.selling_price || prop.rent_price)}</p>
                               <p className="text-[10px] text-gray-500 uppercase tracking-widest"><span className="text-[#3b82f6]">Handled By:</span> {prop.agent_name || "Pending Registration"}</p>
                           </div>
                       </div>
                       
                       <div className="flex items-center gap-6 mr-8">
                           <div className="text-center mr-8">
                               <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Status</p>
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${prop.status === 'available' ? 'border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]' : prop.status === 'sold' ? 'border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]'}`}>
                                   {prop.status}
                               </span>
                           </div>
                           <button onClick={(e) => handleDeleteProperty(e, prop.property_id)} className="w-8 h-8 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500/20 hover:border-red-500 transition-colors z-10" title="Delete Asset & Disconnect Agent">
                               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                           </button>
                           <button className="w-8 h-8 rounded-full border border-[#222225] flex items-center justify-center text-gray-400 group-hover:bg-[#222225] transition-colors pointer-events-none">
                               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                           </button>
                       </div>
                   </div>
               ))}
               {(!data || data.portfolio?.length === 0) && (
                   <div className="p-8 text-center text-gray-600 border border-[#222225] rounded-[24px] uppercase tracking-[0.2em] text-[10px] font-bold">No assets registered.</div>
               )}
            </div>
        </div>

      </div>

      <h2 className="lg:hidden absolute top-8 right-8 text-[#3b82f6] font-display font-bold tracking-wider text-xl z-30 uppercase cursor-pointer" onClick={() => navigate('/')}>Washub</h2>
      
      {/* Profile Modal Overlay */}
      {showProfile && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
             <div className="bg-[#0d0d0f] border border-[#222225] rounded-[24px] p-8 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Account Settings</h2>
                <p className="text-[11px] text-[#3b82f6] uppercase tracking-widest font-bold mb-8">Washub Proprietor Network</p>
                
                {profileMessage && <div className="mb-4 text-[#3b82f6] text-sm font-bold">{profileMessage}</div>}
                
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                   <div>
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1 block mb-2">Display Name</label>
                      <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-[#050505] border border-[#222225] rounded-xl px-4 py-3 text-white text-sm focus:border-[#3b82f6] outline-none" required/>
                   </div>
                   <div>
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1 block mb-2">Email Address</label>
                      <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full bg-[#050505] border border-[#222225] rounded-xl px-4 py-3 text-white text-sm focus:border-[#3b82f6] outline-none" required/>
                   </div>
                   <div>
                      <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1 block mb-2">Contact Phone</label>
                      <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-[#050505] border border-[#222225] rounded-xl px-4 py-3 text-white text-sm focus:border-[#3b82f6] outline-none" required/>
                   </div>
                   <button type="submit" className="w-full bg-[#3b82f6] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] mt-4 transition-colors">
                      Save Changes
                   </button>
                </form>
             </div>
         </div>
      )}

      {showAddProperty && (
        <div className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#0a0a0c] border border-[#222225] p-8 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
               <h2 className="text-2xl font-display font-bold mb-6 text-white">Register New Property</h2>
               <form onSubmit={handleAddProperty} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Complete Address</label>
                          <input type="text" required placeholder="Street address or locality..." className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.address} onChange={(e) => setPropForm({...propForm, address: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">City</label>
                          <select className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.city_id} onChange={(e) => setPropForm({...propForm, city_id: Number(e.target.value)})}>
                             {data?.cities?.map((c: any) => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Property Type</label>
                          <select className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.type_id} onChange={(e) => setPropForm({...propForm, type_id: Number(e.target.value)})}>
                             {data?.types?.map((t: any) => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
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
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Assigned Agent</label>
                          <select className="bg-[#131315] border border-[#222225] w-full p-3 rounded-xl text-white outline-none" value={propForm.agent_id} onChange={(e) => setPropForm({...propForm, agent_id: Number(e.target.value)})}>
                             <option value="">Pending / Self Managed</option>
                             {data?.agents?.map((a: any) => <option key={a.agent_id} value={a.agent_id}>{a.name}</option>)}
                          </select>
                      </div>
                      <div className="col-span-2 mt-2">
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-4">Curated Amenities</label>
                          <div className="flex flex-wrap gap-3">
                             {data?.amenities?.map((am: any) => {
                                 const isSelected = propForm.amenities.includes(am.amenity_id);
                                 return (
                                     <button type="button" key={am.amenity_id} onClick={() => setPropForm(prev => ({...prev, amenities: isSelected ? prev.amenities.filter(id => id !== am.amenity_id) : [...prev.amenities, am.amenity_id]}))} className={`px-4 py-2 rounded-full border text-[10px] font-bold tracking-widest uppercase transition-colors ${isSelected ? 'border-[#3b82f6] text-[#60a5fa] bg-[#3b82f6]/20' : 'border-[#222225] text-gray-500 hover:text-gray-300 hover:bg-[#131315]'}`}>
                                         {am.amenity_name}
                                     </button>
                                 );
                             })}
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-4 mt-8 pt-4 border-t border-[#222225]">
                      <button type="button" onClick={() => setShowAddProperty(false)} className="px-6 py-3 rounded-xl bg-[#131315] hover:bg-[#222225] transition-colors font-bold text-sm text-white">Cancel</button>
                      <button type="submit" className="flex-1 bg-[#3b82f6] hover:bg-[#1d4ed8] transition-colors text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]">Inject Property Securely</button>
                  </div>
               </form>
           </div>
        </div>
      )}

      {/* Black Glassmorphism Property Overlay */}
      {selectedAsset && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-12">
             {/* Backdrop */}
             <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setSelectedAsset(null)}></div>
             
             {/* Modal Container */}
             <div className="bg-[#050505]/95 border border-[#222225] rounded-[32px] w-full max-w-5xl relative z-10 flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] animate-fade-in-up duration-300 my-auto max-h-[90vh]">
                 <button onClick={() => setSelectedAsset(null)} className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#3b82f6] transition-all border border-white/10 shadow-2xl">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
                 
                 {selectedAsset.loading ? (
                    <div className="w-full p-32 flex flex-col justify-center items-center gap-6">
                        <div className="w-16 h-16 border-4 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#3b82f6] animate-pulse">Syncing Structural Parameters</p>
                    </div>
                 ) : (
                    <>
                      {/* Left Image Section */}
                      <div className="w-full md:w-5/12 h-64 md:h-auto relative shrink-0">
                          <img src={`https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=800`} alt="Property" className="w-full h-full object-cover brightness-[0.6]"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-[#050505]/40 md:to-[#050505]"></div>
                          
                          <div className="absolute bottom-10 left-10 text-shadow-xl">
                             <div className="inline-block px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full mb-6 shadow-2xl">
                                <p className={`text-[10px] uppercase tracking-[0.3em] font-bold ${selectedAsset.status === 'available' ? 'text-[#10b981]' : selectedAsset.status === 'sold' ? 'text-[#3b82f6]' : 'text-yellow-500'}`}>{selectedAsset.status}</p>
                             </div>
                             <h2 className="text-4xl font-display font-medium text-white mb-2 drop-shadow-lg">{formatCurrency(selectedAsset.selling_price || selectedAsset.rent_price)}</h2>
                             <p className="text-[13px] uppercase tracking-widest text-[#3b82f6] font-bold drop-shadow-md">{selectedAsset.city_name} • {selectedAsset.type_name}</p>
                          </div>
                      </div>
                      
                      {/* Right Data Section */}
                      <div className="w-full md:w-7/12 p-10 lg:p-14 bg-[#050505]/60 flex flex-col relative backdrop-blur-md overflow-y-auto min-h-[500px]">
                           <div className="mb-12">
                               <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-gray-500 mb-4 border-b border-[#222225] pb-4">Asset Details</p>
                               <h3 className="text-3xl font-display font-bold text-white mb-3">Washub Property #{selectedAsset.property_id}</h3>
                               <p className="text-[14px] text-gray-400 max-w-md leading-relaxed font-light">{selectedAsset.address || 'Address configuration pending systemic synchronization.'}, {selectedAsset.city_name}</p>
                           </div>

                           <div className="grid grid-cols-3 gap-4 mb-12">
                               <div className="bg-[#0a0a0c] border border-[#222225] rounded-[20px] p-6 text-center shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Structure</p>
                                    <p className="text-2xl font-display font-bold text-white">{selectedAsset.bedrooms} <span className="text-[11px] font-sans font-bold text-[#3b82f6] tracking-widest">BHK</span></p>
                               </div>
                               <div className="bg-[#0a0a0c] border border-[#222225] rounded-[20px] p-6 text-center shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Baths</p>
                                    <p className="text-2xl font-display font-bold text-white">{selectedAsset.bathrooms}</p>
                               </div>
                               <div className="bg-[#0a0a0c] border border-[#222225] rounded-[20px] p-6 text-center shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Scale</p>
                                    <p className="text-2xl font-display font-bold text-white">{selectedAsset.size} <span className="text-[11px] font-sans font-bold text-[#3b82f6] tracking-widest">SQFT</span></p>
                               </div>
                           </div>
                           
                           <div className="mb-12 p-8 bg-gradient-to-r from-[#131315] to-[#0a0a0c] border border-[#222225] rounded-[24px] flex items-center justify-between shadow-2xl relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-bl-[100px]"></div>
                               <div className="relative z-10">
                                  <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-[#3b82f6] mb-2">Assigned Agent Link</p>
                                  <p className="text-[17px] font-bold text-white tracking-widest">{selectedAsset.agent_name || 'Assignment Pending'}</p>
                               </div>
                               <div className="relative z-10 w-14 h-14 bg-[#0a0a0c] text-[#3b82f6] border border-[#3b82f6]/30 rounded-full flex justify-center items-center font-bold shadow-[0_0_20px_rgba(59,130,246,0.15)] text-lg">
                                   {selectedAsset.agent_name ? selectedAsset.agent_name[0] : '?'}
                               </div>
                           </div>

                           <div>
                               <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-500 mb-5 border-b border-[#222225] pb-4">Architectural Amenities</p>
                               <div className="flex flex-wrap gap-3">
                                  {selectedAsset.amenities?.map((am: any) => (
                                     <span key={am.amenity_id} className="px-5 py-3 bg-[#0a0a0c] border border-[#222225] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 shadow-xl hover:bg-[#222225] transition-colors cursor-default">
                                         {am.amenity_name}
                                     </span>
                                  ))}
                                  {(!selectedAsset.amenities || selectedAsset.amenities.length === 0) && (
                                      <span className="text-[11px] px-2 py-1 text-gray-600 font-bold uppercase tracking-widest">Awaiting feature synchronization</span>
                                  )}
                               </div>
                           </div>
                      </div>
                    </>
                 )}
             </div>
         </div>
      )}
    </div>
  );
}
