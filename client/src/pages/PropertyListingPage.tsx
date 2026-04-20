import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function PropertyListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State matching mockup styles
  const [cities, setCities] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'price-desc', 'price-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchProperties();
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
       const [cRes, tRes, aRes] = await Promise.all([
          api.get('/references/cities'),
          api.get('/references/types'),
          api.get('/references/amenities')
       ]);
       setCities(cRes.data);
       setTypes(tRes.data);
       setAmenities(aRes.data);
    } catch(err) {
       console.error("References Load:", err);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if(selectedCity) queryParams.push(`city_id=${selectedCity}`);
      if(selectedType) queryParams.push(`type_id=${selectedType}`);
      if(selectedAmenities.length > 0) queryParams.push(`amenities=${selectedAmenities.join(',')}`);
      
      const q = queryParams.length ? '?' + queryParams.join('&') : '';
      const res = await api.get(`/properties${q}`);
      setProperties(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (!val) return 'Price on Request';
    return '$' + val.toLocaleString();
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];
    const locQ = searchParams.get('location')?.toLowerCase() || '';

    // Search filters
    if (locQ) result = result.filter((p: any) => p.city_name?.toLowerCase().includes(locQ));

    // Sort
    if (sortOrder === 'price-desc') result.sort((a: any, b: any) => (b.selling_price || b.rent_price || 0) - (a.selling_price || a.rent_price || 0));
    if (sortOrder === 'price-asc') result.sort((a: any, b: any) => (a.selling_price || a.rent_price || 0) - (b.selling_price || b.rent_price || 0));
    if (sortOrder === 'newest') result.sort((a: any, b: any) => b.property_id - a.property_id);

    return result;
  }, [properties, searchParams, sortOrder]);

  const paginatedProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Navbar specifically for public view */}
      <nav className="w-full h-24 flex items-center justify-between px-16 border-b border-[#222225] bg-[#050505] sticky top-0 z-50">
          <h2 className="text-white font-display font-bold tracking-widest text-lg cursor-pointer hover:text-[#a855f7] transition-all" onClick={() => navigate('/')}>WASHUB</h2>
          <div className="hidden md:flex gap-12 font-medium text-[11px] tracking-widest uppercase text-gray-400">
              <span className="text-white cursor-pointer hover:text-arch-purple transition-colors">Curated Properties</span>
          </div>
          <div className="flex items-center gap-8">
              <div className="w-10 h-10 rounded-full border border-[#222225] flex items-center justify-center hover:bg-[#131315] cursor-pointer transition-colors" onClick={() => navigate('/login')}>
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
          </div>
      </nav>

      <div className="flex flex-1">
          {/* Static Sidebar Filter Panel */}
          <div className="w-[340px] border-r border-[#222225] bg-[#050505] p-10 hidden xl:block shrink-0">
              <h3 className="text-[10px] tracking-[0.2em] font-bold text-arch-purple uppercase mb-10">Refine Collection</h3>

              <div className="mb-12">
                  <p className="text-[13px] font-medium text-white mb-6">Location (City)</p>
                  <div className="space-y-4">
                      <select className="w-full bg-[#131315] border border-[#222225] text-white p-3 rounded-xl outline-none text-sm cursor-pointer hover:border-[#a855f7]/50 transition-colors appearance-none" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                         <option value="">Global Network (All)</option>
                         {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                      </select>
                  </div>
              </div>

              <div className="mb-12">
                  <p className="text-[13px] font-medium text-white mb-6">Property Type</p>
                  <div className="space-y-5">
                      {types.map(t => (
                          <div key={t.type_id} className="flex items-center gap-4 cursor-pointer group" onClick={() => setSelectedType(selectedType === String(t.type_id) ? '' : String(t.type_id))}>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedType === String(t.type_id) ? 'border-[#a855f7] bg-[#a855f7]/20 relative' : 'border-[#222225] bg-[#0a0a0c] group-hover:border-gray-500'}`}>
                                  {selectedType === String(t.type_id) && <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#a855f7]"></span>}
                              </div>
                              <span className={`text-[12px] font-medium ${selectedType === String(t.type_id) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{t.type_name}</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="mb-12">
                  <p className="text-[13px] font-medium text-white mb-6">Curated Amenities</p>
                  <div className="flex flex-wrap gap-3">
                      {amenities.map(am => {
                          const isSelected = selectedAmenities.includes(String(am.amenity_id));
                          return (
                          <button key={am.amenity_id} onClick={() => setSelectedAmenities(prev => isSelected ? prev.filter(x => x !== String(am.amenity_id)) : [...prev, String(am.amenity_id)])} className={`px-5 py-2.5 rounded-full border text-[11px] transition-colors cursor-pointer ${isSelected ? 'border-[#a855f7] text-[#d8b4fe] bg-[#a855f7]/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-[#222225] text-gray-500 hover:text-gray-300 hover:bg-white/5 bg-[#0a0a0c]'}`}>
                              {am.amenity_name}
                          </button>
                          );
                      })}
                  </div>
              </div>

              <button className="w-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white text-[12px] font-bold tracking-wide py-4 mt-8 rounded-[16px] hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all" onClick={fetchProperties}>
                 Apply Filters
              </button>
          </div>

          {/* Main Portfolio Grid */}
          <div className="flex-1 p-10 lg:p-16 bg-[#0a0a0c] overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                  {/* Header */}
                  <div className="flex justify-between items-end mb-16 border-b border-[#222225] pb-8">
                      <div className="max-w-xl">
                          <p className="text-[10px] tracking-[0.2em] font-bold text-arch-purple uppercase mb-4">Curated Portfolio</p>
                          <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight">Washub Estates</h1>
                          <p className="text-[15px] text-gray-400 leading-relaxed font-light">
                              Discover a collection of sculptural living spaces where the boundary between architecture and landscape vanishes.
                          </p>
                      </div>
                      <div className="flex gap-4">
                          <button onClick={() => setSortOrder('newest')} className={`px-6 py-2.5 rounded-full border border-[#222225] text-[10px] font-bold tracking-[0.15em] uppercase transition-colors ${sortOrder === 'newest' ? 'bg-[#131315] text-white' : 'text-gray-500 hover:text-white'}`}>
                              Newest
                          </button>
                          <button onClick={() => setSortOrder(sortOrder === 'price-desc' ? 'price-asc' : 'price-desc')} className={`px-6 py-2.5 rounded-full border border-[#222225] text-[10px] font-bold tracking-[0.15em] uppercase transition-colors ${sortOrder.includes('price') ? 'bg-[#131315] text-white' : 'text-gray-500 hover:text-white'}`}>
                              Price {sortOrder === 'price-asc' ? 'Low-High' : 'High-Low'}
                          </button>
                      </div>
                  </div>

                  {/* Grid layout matching mockup - mixing tall/wide cards elegantly */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                      {loading ? (
                          <div className="col-span-full py-20 text-center text-arch-purple animate-pulse font-display text-2xl">Loading the Collection...</div>
                      ) : paginatedProperties.map((prop: any, i: number) => (
                          <div key={prop.property_id} onClick={() => navigate(`/properties/${prop.property_id}`)} className={`group cursor-pointer rounded-[24px] overflow-hidden relative border border-[#222225] bg-[#050505] transition-all duration-700 hover:border-[#a855f7]/50 ${i === 3 ? 'lg:col-span-2' : ''} ${i === 3 ? 'h-[500px]' : 'h-[600px]'}`}>
                              {/* Background Image absolutely positioned */}
                              <img 
                                src={['https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'][i % 5]} 
                                alt={prop.city_name} 
                                className="absolute inset-0 w-full h-full object-cover brightness-[0.85] group-hover:brightness-110 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                              />
                              
                              {/* Dark heavy gradient from bottom to make text readable */}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 to-transparent"></div>

                              {/* Tags at top */}
                              {i === 0 && (
                                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-[#a855f7] rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                      Off-Market
                                  </div>
                              )}

                              {/* Content at bottom */}
                              <div className="absolute bottom-0 left-0 right-0 p-8 z-10 flex flex-col justify-end h-full">
                                  <div className="mb-2 space-y-1">
                                      {prop.selling_price > 0 && <h2 className="text-2xl font-display font-medium text-white shadow-black/50 drop-shadow-md"><span className="text-[12px] font-bold uppercase tracking-widest text-[#a855f7] mr-2">Sale</span>{formatCurrency(prop.selling_price)}</h2>}
                                      {prop.rent_price > 0 && <h2 className="text-2xl font-display font-medium text-white shadow-black/50 drop-shadow-md"><span className="text-[12px] font-bold uppercase tracking-widest text-[#10b981] mr-2">Rent</span>{formatCurrency(prop.rent_price)} <span className="text-[14px]">/ mo</span></h2>}
                                      {!prop.selling_price && !prop.rent_price && <h2 className="text-2xl font-display font-medium text-white shadow-black/50 drop-shadow-md">Price on Request</h2>}
                                  </div>
                                  <h3 className="text-2xl font-display font-bold text-white mb-2 shadow-black/50 drop-shadow-md">The {prop.city_name} {prop.type_name}</h3>
                                  
                                  <div className="flex justify-between items-end mb-6">
                                      <p className="text-[11px] text-gray-300 flex items-center gap-2 max-w-[60%] leading-relaxed truncate">
                                          <svg className="w-3 h-3 text-[#a855f7] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                          <span className="truncate">{prop.address ? prop.address + ', ' : ''}{prop.city_name}</span>
                                      </p>
                                      <div className="flex gap-4 text-right">
                                          <div>
                                              <p className="text-white font-bold text-lg leading-none">{prop.bedrooms || 3}</p>
                                              <p className="text-[8px] tracking-[0.2em] text-gray-400 font-bold uppercase mt-1">Beds</p>
                                          </div>
                                          <div>
                                              <p className="text-white font-bold text-lg leading-none">{prop.size || 4000}</p>
                                              <p className="text-[8px] tracking-[0.2em] text-gray-400 font-bold uppercase mt-1">Sqft</p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="w-full h-[1px] bg-white/20 mb-6 group-hover:bg-[#a855f7]/50 transition-colors duration-700"></div>

                                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em]">
                                      <p className="text-gray-400 max-w-[60%] truncate">Arch: {['Marc Thorsten', 'OMA Studio', 'Zaha Hadid Architects', 'Foster + Partners'][i % 4]}</p>
                                      <p className="text-white group-hover:text-[#d8b4fe] flex items-center gap-2 transition-colors">
                                          Details <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Pagination / Footer */}
                  <div className="flex justify-center items-center gap-4 mb-20">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`w-10 h-10 rounded-full border border-[#222225] flex items-center justify-center transition-colors ${currentPage > 1 ? 'hover:bg-[#222225] text-white' : 'opacity-50 cursor-not-allowed text-gray-600'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
                      
                      {Array.from({ length: totalPages }).map((_, idx) => (
                         <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold ${currentPage === idx + 1 ? 'bg-[#9333ea] shadow-[0_0_15px_rgba(147,51,234,0.4)] text-white' : 'text-gray-500 hover:text-white transition-colors'}`}>
                           {String(idx + 1).padStart(2, '0')}
                         </button>
                      ))}

                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`w-10 h-10 rounded-full border border-[#222225] flex items-center justify-center transition-colors ${currentPage < totalPages ? 'hover:bg-[#222225] text-white' : 'opacity-50 cursor-not-allowed text-gray-600'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-20 mb-8 border-t border-[#222225] pt-12 px-4">
                     <div>
                         <p className="text-white text-[12px] tracking-[0.1em] mb-2">WASHUB CURATED.</p>
                         <p className="font-medium text-[9px]">© 2026 WASHUB CURATIONS.</p>
                     </div>
                     <div className="flex gap-8">
                       <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
                       <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
                       <span className="cursor-pointer hover:text-white transition-colors">Editorial</span>
                       <span className="cursor-pointer hover:text-white transition-colors">Press</span>
                     </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
