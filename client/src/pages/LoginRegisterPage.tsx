import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginRegisterPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({ 
    identifier: '', // used for login
    password: '', 
    name: '',
    email: '',
    phone: '',
    role: 'client', // client or agent
    clientType: 'buyer' // buyer or renter
  });
  
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // LOGIN
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
        const isPhone = /^\d{10}$/.test(formData.identifier);
        if (!isEmail && !isPhone) {
          setError('Identifier must be a valid email or exactly a 10-digit phone number');
          return;
        }
        const res = await api.post('/auth/login', { identifier: formData.identifier, password: formData.password, expectedRole: formData.role });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'agent') navigate('/agent');
        else if (role === 'client') navigate('/client');
        else if (role === 'owner') navigate('/owner');
        else navigate('/properties');
      } else {
        // REGISTER
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|mail\.com|yahoo\.com)$/i;
        if (!emailRegex.test(formData.email)) {
           setError('Please use a valid @gmail.com, @mail.com, or @yahoo.com email address');
           return;
        }
        if (formData.phone.length !== 10) {
           setError('Phone number must be exactly 10 digits');
           return;
        }

        const payload: any = {
           name: formData.name,
           email: formData.email,
           phone: formData.phone,
           password: formData.password,
           role: formData.role
        };
        
        if (formData.role === 'client') payload.clientType = formData.clientType;
        if (formData.role === 'agent') payload.joiningDate = new Date().toISOString().split('T')[0];

        await api.post('/auth/register', payload);
        
        // Auto-login after register
        const res = await api.post('/auth/login', { identifier: formData.email || formData.phone, password: formData.password, expectedRole: formData.role });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        if (res.data.user.role === 'agent') navigate('/agent', { state: { isNew: true } });
        else navigate('/client', { state: { isNew: true } });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication error');
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#050505] font-sans">
      {/* Left side hero */}
      <div className="hidden lg:flex w-6/12 relative">
        <div className="absolute inset-0 top-6 left-8 z-20">
            <h2 className="text-white font-display font-bold tracking-widest text-xl cursor-pointer hover:text-[#a855f7] transition-all" onClick={() => navigate('/')}>WASHUB</h2>
        </div>

        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80" 
            alt="Architecture" 
            className="w-full h-full object-cover brightness-[0.3] mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#050505]/50 to-[#050505]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 px-20 pb-32 flex flex-col justify-end h-full w-full">
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-gray-400 font-semibold mb-6">The Digital Curator</p>
            <h1 className="text-7xl font-display font-medium text-white mb-6 leading-[1.1] tracking-tight">
              Beyond<br/>Structure.
            </h1>
            <p className="text-[17px] text-gray-300 font-light max-w-lg leading-relaxed">
              Access an elite portfolio of architectural masterpieces curated for the discerning collector.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-20 z-10 w-full">
              <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase font-medium">
            © 2026 WASHUB CURATIONS. BEYOND STRUCTURE.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-6/12 flex items-center justify-center p-8 lg:p-16 relative bg-[#0a0a0c] overflow-y-auto">
        <div className="absolute bottom-8 right-12 z-10 flex gap-8">
             <p className="text-[9px] tracking-[0.2em] text-gray-500 hover:text-white transition-colors cursor-pointer uppercase font-medium" onClick={() => navigate('/properties')}>Back to Explore</p>
        </div>

        <div className="w-full max-w-md z-20 py-12">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[32px] font-display font-medium text-white mb-2">{isLogin ? 'Welcome Back' : 'Apply for Access'}</h2>
            <p className="text-gray-400 font-light text-[15px]">{isLogin ? 'Sign in to your private WASHUB dashboard.' : 'Register to curate your architectural portfolio.'}</p>
          </div>

          <div className="p-8 md:p-10 border border-[#222225] rounded-[24px] bg-[#0d0d0f] shadow-2xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Core Role Switcher */}
              <div className="flex bg-[#050505] border border-[#222225] rounded-[16px] p-1 mb-8 overflow-x-auto scroller-hidden">
                 {(isLogin ? ['client', 'agent', 'owner', 'admin'] : ['client', 'agent', 'owner']).map(tab => (
                    <button 
                       key={tab}
                       type="button"
                       onClick={() => setFormData({...formData, role: tab})}
                       className={`min-w-[80px] flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-[12px] transition-all ${formData.role === tab ? 'bg-[#9333ea] text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                       {tab === 'client' ? 'Client' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                 ))}
              </div>

              {!isLogin && (
                 <>
                    <div className="space-y-2">
                       <label className="text-[9px] tracking-[0.2em] text-gray-400 font-bold uppercase ml-1 block">Full Name</label>
                       <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-[#222225] rounded-[16px] px-5 py-3 text-white focus:border-arch-purple focus:outline-none transition-all text-sm" placeholder="John Doe" required={!isLogin} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] tracking-[0.2em] text-gray-400 font-bold uppercase ml-1 block">Phone (10 Digits)</label>
                       <input type="text" maxLength={10} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full bg-[#050505] border border-[#222225] rounded-[16px] px-5 py-3 text-white focus:border-arch-purple focus:outline-none transition-all text-sm" placeholder="9876543210" required={!isLogin} />
                    </div>
                 </>
              )}

              <div className="space-y-2">
                <label className="text-[9px] tracking-[0.2em] text-gray-400 font-bold uppercase ml-1 block">Email Address {isLogin && '/ Phone'}</label>
                <input 
                  type={isLogin ? "text" : "email"} 
                  value={isLogin ? formData.identifier : formData.email}
                  onChange={(e) => isLogin ? setFormData({...formData, identifier: e.target.value}) : setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#050505] border border-[#222225] rounded-[16px] px-5 py-3 text-white placeholder-gray-600 focus:border-arch-purple focus:outline-none transition-all text-sm"
                  placeholder={isLogin ? "name@curation.com or Phone" : "name@gmail.com"}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[9px] tracking-[0.2em] text-gray-400 font-bold uppercase">Password</label>
                  {isLogin && <button type="button" className="text-[9px] tracking-[0.2em] text-arch-purple hover:text-white transition-colors uppercase font-bold">Forgot?</button>}
                </div>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[#050505] border border-[#222225] rounded-[16px] px-5 py-3 text-white placeholder-gray-600 focus:border-arch-purple focus:outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required 
                />
              </div>

              <button type="submit" className="w-full bg-[#9333ea] text-white px-8 py-3.5 mt-4 rounded-[16px] hover:bg-[#7e22ce] shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all font-bold tracking-widest uppercase text-[11px]">
                {isLogin ? 'Enter Washub' : 'Submit Application'}
              </button>
              
            </form>
          </div>

          <div className="mt-12 text-center relative z-20">
            <p className="text-gray-400 text-[13px] font-light">
              {isLogin ? 'New to the collection?' : 'Already have access?'} 
              <button onClick={() => {setIsLogin(!isLogin); setError('');}} className="text-white hover:text-arch-purple font-medium ml-2 transition-colors">
                {isLogin ? 'Apply for Access' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
