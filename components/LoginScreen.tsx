
import React, { useState } from 'react';
import { useApp } from '../App';

type ViewMode = 'login' | 'register' | 'forgot';

const LoginScreen: React.FC = () => {
  const { setUser, logoUrl, supabase } = useApp();
  const [mode, setMode] = useState<ViewMode>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isSocio: true
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return alert('Por favor, completa todos los campos.');
    
    setLoading(true);
    try {
      if (mode === 'register') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name || 'Socio Nuevo',
              isSocio: formData.isSocio
            }
          }
        });

        if (authError) throw authError;
        alert('¡Bienvenido! Revisa tu email para confirmar o intenta entrar ✨');
        setMode('login');
        
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      alert(err.message || 'Ups, algo falló. Verifica tus datos ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = { 
      id: 'guest', 
      name: 'Invitado', 
      email: 'invitado@matita.com', 
      points: 0, 
      isAdmin: false, 
      isSocio: false 
    };
    setUser(guestUser);
    localStorage.setItem('matita_persisted_user', JSON.stringify(guestUser));
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4 relative overflow-hidden font-matita">
      <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-[#fadb31]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#ea7e9c]/5 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-[4rem] shadow-2xl max-w-xl w-full overflow-hidden border-[10px] border-white z-10 relative flex flex-col">
        {/* CABECERA SEGÚN LA FOTO SIN LA FRASE EXTRA */}
        <div className="matita-gradient-orange p-12 text-center text-white relative">
          <div className="w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center shadow-xl border-4 border-white mb-6 animate-float">
            <img src={logoUrl} className="w-full h-full object-contain p-2" alt="Logo MATITA" />
          </div>
          <h1 className="text-6xl font-logo drop-shadow-sm uppercase tracking-wider leading-none">LIBRERÍA MATITA</h1>
        </div>

        <div className="p-10 space-y-8 bg-white">
          <div className="flex bg-gray-50 p-2 rounded-full border border-gray-100 shadow-inner">
            <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-full text-xl font-bold transition-all uppercase ${mode === 'login' ? 'bg-white shadow-md text-[#f6a118]' : 'text-gray-400'}`}>Entrar</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-full text-xl font-bold transition-all uppercase ${mode === 'register' ? 'bg-white shadow-md text-[#f6a118]' : 'text-gray-400'}`}>Unirme</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <div className="animate-slideUp">
                <input type="text" required placeholder="Tu Nombre Completo" className="w-full text-2xl p-5 uppercase" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            )}
            <input type="email" required placeholder="Tu Email" className="w-full text-2xl p-5 uppercase" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="password" required placeholder="Tu Contraseña" className="w-full text-2xl p-5 uppercase" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

            <button type="submit" disabled={loading} className="w-full py-6 matita-gradient-orange text-white rounded-full text-3xl font-bold shadow-xl hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-tighter">
              {loading ? 'Cargando...' : mode === 'login' ? 'Entrar al Club ✨' : '¡Ser Socio! 🌸'}
            </button>
            
            <div className="relative flex justify-center items-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-50"></div></div>
              <span className="relative px-4 bg-white text-gray-300 font-bold uppercase tracking-widest text-xs">O CONTINUAR COMO</span>
            </div>

            <button type="button" onClick={handleGuestLogin} className="w-full py-4 bg-white text-gray-400 rounded-full text-xl font-bold border-2 border-gray-100 hover:border-[#fadb31] hover:text-[#f6a118] transition-all uppercase">
              Invitado 🌈
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
