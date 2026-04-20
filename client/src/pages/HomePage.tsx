import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [showDevelopers, setShowDevelopers] = useState(false);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await api.get('/properties?limit=3');
        setProperties(res.data.data || []);
      } catch (err) {
        console.error("HomePage load error:", err);
      }
    };
    fetchProps();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center overflow-x-hidden">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto h-24 flex items-center justify-between px-8 lg:px-16 mt-4">
        <h2 className="text-white font-display font-bold tracking-widest text-lg cursor-pointer z-10 uppercase hover:text-[#a855f7] transition-all" onClick={() => navigate('/')}>WASHUB</h2>
        
        <div className="hidden lg:flex gap-12 font-bold text-[10px] tracking-[0.2em] uppercase text-gray-400 z-10">
          <span className="text-[#a855f7] border-b-2 border-[#a855f7] pb-1 cursor-pointer transition-colors">Listings</span>
        </div>
        
        <div className="flex items-center gap-6 z-10">
          <button onClick={() => setShowDevelopers(true)} className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 hover:text-[#a855f7] transition-colors flex items-center gap-2 border border-[#222225] hover:border-[#a855f7]/30 px-4 py-2.5 rounded-full bg-[#0a0a0c]">
             <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             Sys Team
          </button>
          <div className="w-10 h-10 rounded-full border border-[#222225] flex items-center justify-center hover:bg-[#131315] cursor-pointer transition-colors" onClick={() => navigate('/login')}>
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto px-8 lg:px-16 pt-16 flex flex-col items-center text-center relative z-10">
        <h1 className="text-6xl md:text-8xl font-display font-medium text-white tracking-tight mb-8 drop-shadow-2xl">
          Washub Excellence
        </h1>
        <p className="text-sm md:text-base text-gray-400 font-light max-w-2xl leading-relaxed mb-12">
          Curating high-end living spaces where obsidian depth meets violet luminosity. Explore the pinnacle of modern architectural design.
        </p>

        {/* Search Action */}
        <div className="mb-20 pointer-events-auto">
          <button className="bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white px-12 py-4 rounded-full text-[13px] font-bold tracking-[0.2em] uppercase hover:scale-[1.02] shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all" onClick={() => navigate('/properties')}>
            Discover Collection
          </button>
        </div>

        {/* Hero Image */}
        <div className="w-full h-[500px] md:h-[600px] rounded-[40px] overflow-hidden border border-[#222225] relative shadow-2xl mb-32 group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600" 
            alt="Hero Architecture" 
            className="w-full h-full object-cover brightness-[0.6] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30"></div>
          {/* Subtle violet overlay matching the mockup's glow */}
          <div className="absolute inset-0 bg-[#a855f7]/10 mix-blend-color"></div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="w-full max-w-7xl mx-auto px-8 lg:px-16 mb-32 bg-[#101011] pt-16 rounded-[40px]">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">Featured Properties</h2>
            <p className="text-xs text-gray-400 tracking-wider">Handpicked selection of obsidian-grade architectural marvels</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:text-[#a855f7] transition-colors" onClick={() => navigate('/properties')}>
            View Gallery <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
          {/* Large Left Card */}
          {properties[0] && (
            <div onClick={() => navigate(`/properties/${properties[0].property_id}`)} className="lg:col-span-2 h-[500px] rounded-[32px] overflow-hidden relative group cursor-pointer border border-[#222225]">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200" alt="Obsidian Monolith" className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end z-10">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded-full border border-[#a855f7]/20 inline-block mb-3">{properties[0].city_name}</p>
                  <h3 className="text-3xl font-display font-bold text-white">Washub Estate #{properties[0].property_id}</h3>
                </div>
                <div className="bg-[#131315]/80 backdrop-blur-md border border-[#222225] px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                   <p className="text-white font-display font-medium text-lg">${(properties[0].selling_price || properties[0].rent_price || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Right Stack */}
          <div className="flex flex-col gap-6 h-[500px]">
            {/* Top Right Card */}
            {properties[1] && (
              <div onClick={() => navigate(`/properties/${properties[1].property_id}`)} className="h-1/2 rounded-[32px] overflow-hidden relative group cursor-pointer border border-[#222225]">
                <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600" alt="Glass Veil" className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-8 z-10">
                  <h3 className="text-xl font-display font-bold text-white">Washub Estate #{properties[1].property_id}</h3>
                </div>
              </div>
            )}

            {/* Bottom Right Card */}
            {properties[2] && (
              <div onClick={() => navigate(`/properties/${properties[2].property_id}`)} className="h-1/2 rounded-[32px] overflow-hidden relative group cursor-pointer border border-[#222225]">
                <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600" alt="Azure Horizon" className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-8 z-10">
                  <h3 className="text-xl font-display font-bold text-white">Washub Estate #{properties[2].property_id}</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curated Collections Section */}
      <div className="w-full max-w-7xl mx-auto px-8 lg:px-16 mb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-5xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">Curated<br/>Collections</h2>
            <p className="text-xs text-gray-400 leading-loose max-w-sm mb-12">
              Every listing in our curated collection is vetted by lead architects. We don't just sell property; we represent the evolution of the domestic habitat.
            </p>

            <div className="flex flex-col gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
               <div className="flex items-center gap-4 text-white">
                 <span className="w-12 h-1 bg-[#a855f7]"></span>
                 <span className="cursor-pointer">Brutalist Retreats</span>
               </div>
               <div className="flex items-center gap-4 hover:text-white transition-colors">
                 <span className="w-12 h-[1px] bg-[#222225]"></span>
                 <span className="cursor-pointer">Neo-Vernacular</span>
               </div>
               <div className="flex items-center gap-4 hover:text-white transition-colors">
                 <span className="w-12 h-[1px] bg-[#222225]"></span>
                 <span className="cursor-pointer">Sustainable Luxe</span>
               </div>
            </div>
          </div>

          <div className="flex-1 flex gap-6 h-[500px]">
             {/* Tall architectural images overlapping */}
             <div className="w-1/2 h-[90%] rounded-[40px] overflow-hidden border border-[#222225] mt-6 shadow-2xl relative">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600" className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity brightness-75" alt=""/>
                <div className="absolute inset-0 bg-[#a855f7]/30 mix-blend-overlay"></div>
             </div>
             <div className="w-1/2 h-[90%] rounded-[40px] overflow-hidden border border-[#222225] mb-6 shadow-2xl relative">
                <img src="https://images.unsplash.com/photo-1628611225249-6c3c7c689552?auto=format&fit=crop&w=600" className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity brightness-50" alt=""/>
                <div className="absolute inset-0 bg-[#7e22ce]/40 mix-blend-overlay"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="w-full max-w-5xl mx-auto px-8 lg:px-16 mb-24 relative">
         <div className="w-full bg-[#0a0a0c] border border-[#222225] rounded-[40px] p-16 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Ambient background glow inside the banner */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#a855f7] rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
            
            <h2 className="text-3xl font-display font-medium text-white mb-4 relative z-10">Join the Inner Circle</h2>
            <p className="text-[11px] text-gray-400 mb-10 relative z-10">Receive exclusive previews of off-market architectural listings twice a month.</p>
            
            <div className="max-w-xl mx-auto flex gap-4 relative z-10 flex-col sm:flex-row">
               <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="flex-1 bg-[#131315] border border-[#222225] rounded-full px-6 py-4 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-[#a855f7] transition-all"
               />
               <button className="bg-[#9333ea] text-white px-8 py-4 rounded-full text-[11px] font-bold tracking-widest uppercase hover:bg-[#7e22ce] shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all">
                  Subscribe
               </button>
            </div>
         </div>
      </div>

      {/* Contact Us Section */}
      <div className="w-full max-w-5xl mx-auto px-8 lg:px-16 mb-24 relative">
         {/* Tab Header */}
         <div className="flex items-center gap-3 mb-0">
            <div className="px-6 py-3 bg-gradient-to-r from-[#9333ea] to-[#6b21a8] rounded-t-[20px] text-[10px] font-bold tracking-[0.2em] uppercase text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]">
               📞 Contact Us
            </div>
            <div className="px-6 py-3 bg-[#131315] border-t border-l border-r border-[#222225] rounded-t-[20px] text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
               🏢 Our Office
            </div>
         </div>

         {/* Tab Body */}
         <div className="w-full bg-[#0a0a0c]/60 backdrop-blur-3xl border border-[#222225] rounded-b-[40px] rounded-tr-[40px] p-12 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Gradient ambient glows */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#9333ea] rounded-full mix-blend-screen filter blur-[120px] opacity-15 pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
               {/* Phone */}
               <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9333ea] to-[#6b21a8] rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(147,51,234,0.4)] group-hover:scale-110 transition-transform">
                     <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#9333ea] mb-2">Phone</p>
                  <p className="text-2xl font-display font-bold text-white">+91 9988774455</p>
                  <p className="text-[11px] text-gray-500 mt-2 font-medium">Mon–Sat, 9am–6pm IST</p>
               </div>

               {/* Divider */}
               <div className="hidden md:flex flex-col items-center justify-center">
                  <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-[#9333ea]/30 to-transparent"></div>
               </div>

               {/* Address */}
               <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                     <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#3b82f6] mb-2">Address</p>
                  <p className="text-xl font-display font-bold text-white leading-snug">Tech City, IIITG</p>
                  <p className="text-lg font-display font-bold text-white">Assam, India</p>
                  <p className="text-[11px] text-gray-500 mt-2 font-medium">Indian Institute of Information Technology Guwahati</p>
               </div>
            </div>

            {/* Bottom CTA strip */}
            <div className="relative z-10 mt-10 pt-8 border-t border-[#222225] flex flex-col sm:flex-row items-center justify-between gap-4">
               <p className="text-[11px] text-gray-400 font-medium">Have a property inquiry? Our team responds within 24 hours.</p>
               <button className="px-8 py-3 bg-gradient-to-r from-[#9333ea] to-[#6b21a8] text-white rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:scale-105 transition-all">
                  Send a Message →
               </button>
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[#222225] bg-[#050505]">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 py-8 flex flex-col md:flex-row justify-between items-center text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase">
             <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-4 md:mb-0">
                 <h2 className="text-white text-[12px] tracking-[0.1em]">WASHUB</h2>
                 <p>© 2026 WASHUB CURATIONS.</p>
             </div>
             <div className="flex gap-8">
               <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
               <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
               <span className="cursor-pointer hover:text-white transition-colors">Editorial</span>
               <span className="cursor-pointer hover:text-white transition-colors">Press</span>
             </div>
          </div>
      </footer>
      {/* Developers Modal */}
      {showDevelopers && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-12">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowDevelopers(false)}></div>
             
             <div className="bg-[#050505] border border-[#222225] rounded-[40px] w-full max-w-6xl relative z-10 p-8 md:p-12 overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.2)] animate-fade-in-up">
                {/* Background ambient light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#a855f7] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

                <div className="flex justify-between items-end mb-16 relative z-10 border-b border-[#222225] pb-8">
                   <div>
                     <p className="text-[10px] tracking-[0.3em] font-bold text-[#a855f7] uppercase mb-4">Core Architecture Team</p>
                     <h2 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight">Washub Core Developers</h2>
                   </div>
                   <button onClick={() => setShowDevelopers(false)} className="w-12 h-12 bg-[#131315] border border-[#222225] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-[#a855f7]/50 transition-all flex-shrink-0">
                       ✕
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
                    {[
                      { name: 'Rohit', role: 'Integration Architect', focus: 'Directed the full-stack architecture, orchestrating the seamless integration between dynamic React client pipelines and hardcore Node backend controllers natively.' },
                      { name: 'Sameer', role: 'Data Systems Engineer', focus: 'Authored the rigid MySQL models, binding strictly structured schema tables directly onto the active frontend environments without collision.' },
                      { name: 'Somya', role: 'UI/UX Visual Designer', focus: 'Designed the brutalist glassmorphic frontend layouts, actively translating relational database logic requirements into fluid, stunning interactive experiences.' },
                      { name: 'Shivam', role: 'Deployment & Ops', focus: 'Governed the absolute final-tier confirmation mechanics, stress-testing execution workflows and locking the overall platform pipeline into deployment readiness.' }
                    ].map((dev, i) => (
                       <div key={i} className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-[#222225] rounded-[32px] p-8 hover:border-[#a855f7]/40 hover:-translate-y-2 hover:bg-[#131315] transition-all duration-500 group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
                          
                          <div className="w-16 h-16 flex justify-center items-center rounded-full border border-[#222225] bg-[#131315] font-display text-2xl font-bold uppercase text-[#a855f7] mb-8 group-hover:border-[#a855f7]/50 group-hover:bg-[#a855f7]/10 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
                             {dev.name[0]}
                          </div>
                          <h3 className="text-xl font-display font-bold text-white mb-2">{dev.name}</h3>
                          <p className="text-[9px] font-bold tracking-[0.2em] text-[#a855f7] uppercase mb-6">{dev.role}</p>
                          
                          <div className="w-full h-[1px] bg-[#222225] mb-6 group-hover:bg-[#a855f7]/20 transition-colors"></div>
                          <p className="text-[12px] text-gray-400 leading-relaxed font-light group-hover:text-gray-300">{dev.focus}</p>
                       </div>
                    ))}
                </div>
             </div>
         </div>
      )}

    </div>
  );
}
