import React, { useState } from 'react';
import { useApp } from '../App';
import { Mail, Lock, User, ArrowLeft, Sparkles } from 'lucide-react';

type ViewMode = 'login' | 'register' | 'forgot';

const LoginScreen: React.FC = () => {
  const { setUser, logoUrl, supabase } = useApp();
  const [mode, setMode] = useState<ViewMode>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || (mode !== 'forgot' && !password)) {
      return alert('Che, completá todos los datos ✍️');
    }
    
    setLoading(true);

    try {
      if (mode === 'register') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: formData.name } }
        });

        if (authError) throw authError;

        if (authData.user) {
          await supabase.from('users').insert([
            { 
              id: authData.user.id, 
              name: formData.name || 'Nuevo Socio', 
              email: email, 
              points: 50, 
              is_socio: true,
              is_admin: false
            }
          ]);
          alert('¡Socio Registrado! ✨ Revisá tu Email para confirmar la cuenta.');
          setMode('login');
        }

      } else if (mode === 'login') {
        const { data: logData, error: logError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (logError) throw logError;

        if (logData.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', logData.user.id)
            .single();

          if (profile) {
            const userData = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              points: profile.points,
              isAdmin: profile.is_admin,
              isSocio: profile.is_socio
            };
            setUser(userData);
            localStorage.setItem('matita_persisted_user', JSON.stringify(userData));
          }
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login',
        });
        if (error) throw error;
        alert('📧 ¡Email enviado! Seguí las instrucciones.');
        setMode('login');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = { id: 'guest', name: 'Invitado', email: 'invitado@matita.com', points: 0, isAdmin: false, isSocio: false };
    setUser(guestUser);
    localStorage.setItem('matita_persisted_user', JSON.stringify(guestUser));
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4 relative overflow-hidden font-matita">
      <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-[#fadb31]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#ea7e9c]/10 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-[4rem] shadow-2xl max-w-xl w-full overflow-hidden border-[12px] border-white z-10 relative animate-fadeIn">
        
        <div className="matita-gradient-orange p-10 text-center text-white relative">
          <div className="w-28 h-28 bg-white rounded-full mx-auto flex items-center justify-center shadow-2xl border-4 border-white mb-4 animate-float">
            <img src={logoUrl} className="w-full h-full object-contain p-2" alt="Logo" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
            {mode === 'forgot' ? 'Recuperar' : 'Club Matita'}
          </h1>
          <p className="mt-2 font-bold opacity-90 uppercase tracking-[0.2em] text-[10px]">Librería & Tesoros <Sparkles size={10} className="inline"/></p>
        </div>

        <div className="p-10 space-y-8 bg-white">
          {mode !== 'forgot' && (
            <div className="flex bg-gray-100 p-2 rounded-full border-2 border-gray-50 shadow-inner">
              <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-full text-xl font-black transition-all uppercase ${mode === 'login' ? 'bg-white shadow-md text-[#f6a118]' : 'text-gray-400'}`}>Entrar</button>
              <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-full text-xl font-black transition-all uppercase ${mode === 'register' ? 'bg-white shadow-md text-[#f6a118]' : 'text-gray-400'}`}>Unirme</button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <div className="relative animate-slideUp">
                <User className="absolute left-5 top-5 text-gray-300" />
                <input 
                  type="text" required placeholder="TU NOMBRE" 
                  className="w-full text-2xl p-5 pl-14 bg-[#fef9eb] rounded-3xl outline-none font-bold uppercase border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-5 top-5 text-gray-300" />
              <input 
                type="email" required placeholder="TU EMAIL" 
                className="w-full text-2xl p-5 pl-14 bg-[#fef9eb] rounded-3xl outline-none font-bold uppercase border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            
            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-5 top-5 text-gray-300" />
                <input 
                  type="password" required placeholder="TU CLAVE" 
                  className="w-full text-2xl p-5 pl-14 bg-[#fef9eb] rounded-3xl outline-none font-bold uppercase border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            )}

            <button 
              type="submit" disabled={loading} 
              className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-3xl font-black shadow-xl hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-tighter border-b-8 border-orange-700"
            >
              {loading ? '...' : mode === 'login' ? 'Entrar ✨' : mode === 'register' ? 'Registrar 🌸' : 'Enviar Mail 📧'}
            </button>
            
            <div className="flex justify-between items-center px-2">
              {mode === 'login' ? (
                <button type="button" onClick={() => setMode('forgot')} className="text-gray-400 font-bold uppercase text-xs hover:text-[#ea7e9c]">¿Olvidaste tu clave?</button>
              ) : (
                <button type="button" onClick={() => setMode('login')} className="flex items-center gap-2 text-gray-400 font-bold uppercase text-xs hover:text-[#f6a118]"><ArrowLeft size={14}/> Volver</button>
              )}
            </div>

            <div className="relative flex justify-center items-center py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-100"></div></div>
              <span className="relative px-4 bg-white text-gray-300 font-black uppercase text-[10px] tracking-widest">O CONTINUAR COMO</span>
            </div>

            <button type="button" onClick={handleGuestLogin} className="w-full py-4 bg-white text-gray-400 rounded-[1.5rem] text-xl font-bold border-4 border-gray-100 hover:border-[#fadb31] hover:text-[#f6a118] transition-all uppercase shadow-md">
              Invitado 🌈
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
