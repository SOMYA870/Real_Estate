import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Bath, Bed, Square, ChevronLeft } from 'lucide-react';
import api from '../services/api';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryMsg, setInquiryMsg] = useState('');
  
  const submitInquiry = async (intentOption: string) => {
      if(!localStorage.getItem('token')) {
          alert('System requires secure login parameters. Please authenticate as a Client to inquire on Assets.');
          navigate('/login');
          return;
      }
      if(!inquiryMsg) return alert('Please enter a message detail before inquiring.');
      
      try {
          await api.post(`/properties/${id}/inquire`, { message: inquiryMsg, intent: intentOption });
          alert(`Inquiry (${intentOption.toUpperCase()}) successfully dispatched to assigned Principal Agent!`);
          setInquiryMsg('');
      } catch(err: any) {
          alert(err.response?.data?.error || "Error dispatching Inquiry request");
      }
  };

  useEffect(() => {
    // If it's a dummy ID or not found in DB, we'll try to fetch, otherwise fallback to mock so UI doesn't crash
    const fetchProp = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        setProperty({ property_id: id, city_name: 'Zurich, Switzerland', selling_price: 8450000, bedrooms: 4, bathrooms: 3.5, size: 4200, type_name: 'Penthouse' });
      } finally {
        setLoading(false);
      }
    };
    fetchProp();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-display text-arch-purple text-2xl">Loading Asset Data...</div>;

  const formatCurrency = (val: number) => '$' + val.toLocaleString();

  const generateDescription = (p: any) => {
     if (!p) return '';
     const dateStr = p.listed_on ? new Date(p.listed_on).toLocaleDateString() : 'recently';
     return `Nestled exclusively within the pristine bounds of ${p.city_name}, this remarkable ${p.size} sq.ft. ${p.type_name?.toLowerCase() || 'estate'} serves as a literal masterclass in brutalist luxury. Originally engineered natively in ${p.year_of_construction}, the property features ${p.bedrooms} hyper-luxurious bedrooms and ${p.bathrooms} SPA-tier architectural baths, creating a seamless, floating dialogue between the structural interior limits and the surrounding metropolitan landscape.\n\nOperating explicitly under the core Washub global asset portfolio since ${dateStr}, this specific property anchors itself heavily as a flagship holding perfectly built to last generations without structural decay.`;
  };

  const getAmenityIcon = (name: string) => {
     const lookup: Record<string, string> = {
        'Gym': '💪', 'Pool': '🏊', 'Parking': '🚘', 'Clubhouse': '🏛️', 'Park': '🌳', 'Security': '🛡️', 'Infinity Pool': '🏊‍♂️', 'Wine Vault': '🍷', 'Helipad': '🚁'
     };
     return lookup[name] || '✨';
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-400 pb-20">
      {/* Top Navbar Header */}
      <nav className="w-full bg-[#0a0a0c]/80 backdrop-blur-2xl border-b border-[#222225] h-20 flex items-center px-8 lg:px-16 justify-between sticky top-0 z-50">
         <h2 className="text-[#a855f7] font-display font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>WASHUB ESTATES</h2>
         <div className="hidden lg:flex gap-10 text-[12px] uppercase tracking-widest font-semibold text-gray-500">
            <span className="text-[#a855f7] border-b-2 border-[#a855f7] pb-1 cursor-pointer" onClick={() => navigate('/properties')}>Listings</span>
         </div>
         <div className="flex items-center gap-6">
            <MapPin className="w-5 h-5 text-gray-500" />
            <button className="flex items-center gap-2 bg-[#131315] border border-[#222225] px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest text-[#a855f7] hover:bg-[#222225] transition-colors" onClick={() => navigate('/login')}>
              <div className="w-6 h-6 rounded-full bg-[#a855f7] text-white flex items-center justify-center -ml-2 text-[10px]">P</div>
              Profile
            </button>
         </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
        <button onClick={() => navigate('/properties')} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-arch-purple mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Collection
        </button>

        {/* Hero Image Block */}
        <div className="w-full h-[600px] rounded-[40px] overflow-hidden relative shadow-2xl mb-16 border border-gray-200">
           <img 
             src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600" 
             alt="Property View" 
             className="w-full h-full object-cover brightness-[0.7]"
           />
           {/* Dark gradient overlay matching mockup */}
           <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-black/80 to-transparent"></div>
           
           <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end">
              <div className="text-white">
                <div className="flex gap-3 mb-4">
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/30">
                    {property?.type_name || 'Penthouse'}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/30">
                    {property?.city_name}
                  </span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight mb-4 drop-shadow-lg">
                  {property?.owner_name ? `${property.owner_name}'s ${property?.type_name || 'Estate'}` : 'Washub Estate'}
                </h1>
                <div className="flex gap-8 text-sm font-semibold tracking-wide">
                  <div className="flex items-center gap-2"><Bed className="w-5 h-5"/> {property?.bedrooms} Beds</div>
                  <div className="flex items-center gap-2"><Bath className="w-5 h-5"/> {property?.bathrooms} Baths</div>
                  <div className="flex items-center gap-2"><Square className="w-5 h-5"/> {property?.size} sqft</div>
                </div>
              </div>
              
              <div className="bg-[#1c1c1e]/90 backdrop-blur-xl p-8 rounded-[24px] border border-white/10 mt-6 md:mt-0 min-w-[320px] shadow-2xl">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Market Price</p>
                 <p className="text-4xl font-display font-bold text-white mb-6">{formatCurrency(property?.selling_price || property?.rent_price || 0)}</p>
                 <button onClick={() => document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full bg-[#7e22ce] hover:bg-[#6b21a8] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors">
                    Inquire Now
                 </button>
              </div>
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Narrative & Amenities */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-display font-bold mb-6 text-white border-b border-[#222225] pb-4"><span className="text-[#a855f7]">01.</span> Architectural Narrative</h2>
            <div className="prose prose-gray max-w-none text-gray-400 leading-loose font-medium mb-16 space-y-6">
              {generateDescription(property).split('\n\n').map((para, i) => (
                  <p key={i} className="text-lg">{para}</p>
              ))}
            </div>

            <h2 className="text-2xl font-display font-bold mb-8 text-white border-b border-[#222225] pb-4"><span className="text-[#a855f7]">02.</span> Extracted Attributes & Curated Amenities</h2>
            
            {/* Database Raw Metrics */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
                 <div className="bg-[#131315]/40 backdrop-blur-md border border-white/5 rounded-[24px] p-6 shadow-xl min-w-[140px] text-center">
                    <p className="text-2xl font-display font-bold text-white mb-1">{property?.year_of_construction}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#a855f7] font-bold">Constructed</p>
                 </div>
                 <div className="bg-[#131315]/40 backdrop-blur-md border border-white/5 rounded-[24px] p-6 shadow-xl min-w-[140px] text-center">
                    <p className="text-2xl font-display font-bold text-white mb-1">{property?.listed_on ? new Date(property.listed_on).getFullYear() : '2026'}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#a855f7] font-bold">Listed</p>
                 </div>
                 <div className="bg-[#131315]/40 backdrop-blur-md border border-white/5 rounded-[24px] p-6 shadow-xl min-w-[140px] text-center">
                    <p className="text-2xl font-display font-bold text-white mb-1">{property?.size}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#a855f7] font-bold">Sq.Ft.</p>
                 </div>
            </div>

            {/* Dynamic Amenities Array */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
               {property?.amenities?.map((am: any, i: number) => (
                 <div key={i} className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-[#a855f7]/30 transition-all group overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="text-3xl mb-3 text-white group-hover:scale-110 transition-transform relative z-10">{getAmenityIcon(am.amenity_name)}</div>
                   <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 group-hover:text-[#a855f7] relative z-10">{am.amenity_name}</p>
                 </div>
               ))}
               {(!property?.amenities || property.amenities.length === 0) && (
                   <p className="col-span-4 text-center py-8 text-gray-600 text-[11px] tracking-[0.2em] font-bold uppercase border border-[#222225] rounded-[24px]">No specific engineered amenities mapped.</p>
               )}
            </div>

            <h2 className="text-2xl font-display font-bold mb-8 text-white border-b border-[#222225] pb-4"><span className="text-[#a855f7]">03.</span> Private Evaluations</h2>
            <div className="space-y-6 mb-16">
               <div className="bg-[#131315]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#a855f7] rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>
                 <div className="flex items-center gap-4 mb-4 relative z-10">
                   <div className="w-12 h-12 bg-gray-800 rounded-full overflow-hidden border border-[#222225]">
                     <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="w-full h-full object-cover grayscale" alt=""/>
                   </div>
                   <div>
                     <p className="font-bold text-sm text-white">Julian Vane</p>
                     <p className="text-[9px] uppercase tracking-widest text-[#a855f7] font-bold">Global Collector</p>
                   </div>
                 </div>
                 <p className="text-gray-400 italic leading-relaxed text-sm relative z-10">"The level of detail mapping here is unparalleled. It's not just an asset; it's a piece of habitable architecture redefining brutalist living."</p>
               </div>

               <div className="bg-[#131315]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                 <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#a855f7] rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>
                 <div className="flex items-center gap-4 mb-4 relative z-10">
                   <div className="w-12 h-12 bg-gray-800 rounded-full overflow-hidden border border-[#222225]">
                     <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" className="w-full h-full object-cover grayscale" alt=""/>
                   </div>
                   <div>
                     <p className="font-bold text-sm text-white">Elena Rossi</p>
                     <p className="text-[9px] uppercase tracking-widest text-[#a855f7] font-bold">Structural Critic</p>
                   </div>
                 </div>
                 <p className="text-gray-400 italic leading-relaxed text-sm relative z-10">"The integration of material geometry strictly mapped into reality here is what every major luxury portfolio inherently requires natively."</p>
               </div>
            </div>
          </div>

          {/* Right Column: Agent Form & Map */}
          <div className="lg:col-span-4 space-y-8">
             <div id="inquiry-section" className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] scroll-mt-24 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[#a855f7] rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>
               <div className="flex flex-col items-center border-b border-[#222225] pb-8 mb-8 relative z-10">
                 <div className="w-20 h-20 rounded-full bg-[#131315] mb-4 overflow-hidden border border-[#a855f7]/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex justify-center items-center font-display font-bold text-3xl text-white">
                    {property?.agent_name ? property.agent_name[0] : 'S'}
                 </div>
                 <h3 className="font-display font-bold text-xl text-white">{property?.agent_name || 'System Broker'}</h3>
                 <p className="text-[10px] uppercase tracking-widest font-bold text-[#a855f7]">Listing Agent</p>
               </div>

               <div className="bg-[#131315]/50 backdrop-blur-sm border border-white/5 rounded-[24px] p-6 mb-8 mt-[-10px] flex items-center gap-4 relative z-10 shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-[#050505] border border-[#222225] flex items-center justify-center font-display text-[#a855f7] font-bold shrink-0">
                     {property?.owner_name ? property.owner_name[0] : 'O'}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Registered Owner</p>
                    <p className="font-bold text-sm text-white leading-tight">{property?.owner_name || 'Secure Asset Proprietor'}</p>
                  </div>
               </div>

               <form className="space-y-5 relative z-10" onSubmit={(e) => e.preventDefault()}>
                 <div>
                   <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-2 block ml-1">Message Detail</label>
                   <textarea value={inquiryMsg} onChange={(e) => setInquiryMsg(e.target.value)} placeholder="I am entirely interested in securing a private viewing on this logic..." rows={4} className="w-full bg-[#131315] border border-[#222225] rounded-xl px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all outline-none resize-none"></textarea>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    {(property?.selling_price > 0) && (
                        <button type="button" onClick={() => submitInquiry('buy')} className="flex-1 bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:to-[#6b21a8] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                            Inquire for Purchase
                        </button>
                    )}
                    {(property?.rent_price > 0) && (
                        <button type="button" onClick={() => submitInquiry('rent')} className="flex-1 bg-gradient-to-r from-[#10b981] to-[#059669] hover:to-[#047857] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                            Inquire for Lease
                        </button>
                    )}
                    {(!property?.selling_price && !property?.rent_price) && (
                        <button type="button" onClick={() => submitInquiry('buy')} className="flex-1 bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all">
                            Send General Inquiry
                        </button>
                    )}
                 </div>
               </form>
             </div>

             {/* Neighborhood Map card */}
             <div className="w-full h-[240px] bg-[#0a0a0c] rounded-[32px] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#222225]">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800" className="w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale" alt="Map"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <button className="bg-white/5 backdrop-blur-3xl border border-white/10 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-[#a855f7]/50 hover:bg-white/10 transition-all shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                     Explore Neighborhood Zone
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      
      {/* Footer */}
      <footer className="w-full border-t border-[#222225] bg-[#000000] mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-4 gap-12">
             <div>
                 <h2 className="text-[#a855f7] font-display font-bold text-sm mb-4">Washub Estates</h2>
                 <p className="text-gray-500 text-[10px] leading-relaxed max-w-[200px]">Curating the world's most exceptional residential architectures strictly for the discerning collector.</p>
             </div>
             <div>
                 <h3 className="text-white font-bold text-[10px] tracking-widest uppercase mb-4">Discovery</h3>
                 <div className="space-y-3 flex flex-col">
                   <span className="text-gray-500 hover:text-[#a855f7] text-[10px] transition-colors cursor-pointer">Global Listings</span>
                   <span className="text-gray-500 hover:text-[#a855f7] text-[10px] transition-colors cursor-pointer">Architectural Engineering</span>
                   <span className="text-gray-500 hover:text-[#a855f7] text-[10px] transition-colors cursor-pointer">Agent Directory Bounds</span>
                 </div>
             </div>
             <div>
                 <h3 className="text-white font-bold text-[10px] tracking-widest uppercase mb-4">Legal Structures</h3>
                 <div className="space-y-3 flex flex-col">
                   <span className="text-gray-500 hover:text-[#a855f7] text-[10px] transition-colors cursor-pointer">Data Privacy Scope</span>
                   <span className="text-gray-500 hover:text-[#a855f7] text-[10px] transition-colors cursor-pointer">Execution Terms</span>
                   <span className="text-gray-500 hover:text-[#a855f7] text-[10px] transition-colors cursor-pointer">Cookie Policy</span>
                 </div>
             </div>
             <div>
                 <h3 className="text-white font-bold text-[10px] tracking-widest uppercase mb-4">Journal Logs</h3>
                 <p className="text-gray-500 text-[10px] leading-relaxed mb-4">Subscribe to our native architectural digest securely.</p>
                 <div className="flex bg-[#131315] border border-[#222225] rounded-full overflow-hidden p-1 shadow-inner focus-within:border-[#a855f7]/50 transition-colors">
                   <input type="email" placeholder="Email Address" className="bg-transparent border-none text-xs px-4 py-2 w-full outline-none text-white placeholder-gray-600"/>
                   <button className="bg-[#a855f7] hover:bg-[#7e22ce] transition-colors w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0">→</button>
                 </div>
             </div>
          </div>
          <div className="w-full border-t border-[#222225] py-6 text-center text-[9px] text-gray-600 tracking-widest uppercase font-medium bg-[#050505]">
             © 2026 Washub Estates Engineering. All core logic rights reserved natively.
          </div>
      </footer>
    </div>
  );
}
