

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import Cart from './Cart';

const Layout: React.FC = () => {
  const { user, setUser, clearCart, logoUrl } = useApp();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const slides = [
    {
      url: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop",
      color: "border-[#fadb31]"
    },
    {
      url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2000&auto=format&fit=crop",
      color: "border-[#ea7e9c]"
    },
    {
      url: "https://images.unsplash.com/photo-1586075010633-2a420b91e1d7?q=80&w=2000&auto=format&fit=crop",
      color: "border-[#f6a118]"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, [slides.length]);

  const handleLogout = () => {
    setUser(null);
    clearCart();
    navigate('/');
  };

  const navItems = [
    { label: 'CATÁLOGO', path: '/catalog' },
    { label: 'NOVEDADES', path: '/novedades' },
    { label: 'CLUB', path: '/club' },
    { label: 'IDEAS', path: '/ideas' },
    { label: 'FAVORITOS', path: '/favorites' },
    { label: 'CONTACTO', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-matita bg-[#fef9eb]/30">
      
      {/* BANNER DINÁMICO */}
      <section className="w-full relative overflow-hidden bg-white h-[40vh] md:h-[450px]">
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={slide.url} 
              className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${
                idx === currentSlide ? 'scale-110' : 'scale-100'
              }`} 
              alt="MATITA Banner" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-700 ${
                idx === currentSlide ? 'w-12 bg-[#fadb31]' : 'w-2 bg-white/60 hover:bg-white'
              } shadow-sm border border-black/5`}
            />
          ))}
        </div>
      </section>

      {/* HEADER STICKY CON FUENTE font-matita PARA EL NOMBRE EN NEGRO */}
      <header className={`sticky top-0 z-40 transition-all duration-500 bg-white/95 backdrop-blur-md border-b-2 border-[#fadb31]/30 shadow-sm ${isScrolled ? 'py-2' : 'py-5'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between gap-8 max-w-[1920px]">
          
          <NavLink to="/" className="flex items-center gap-4 shrink-0 group">
            <div className={`bg-[#fadb31] rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all duration-500 ${isScrolled ? 'w-10 h-10' : 'w-14 h-14'}`}>
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <h1 className={`font-matita text-gray-800 transition-all duration-500 uppercase leading-none tracking-wider ${isScrolled ? 'text-4xl' : 'text-6xl'}`}>
                MATITA
              </h1>
            </div>
          </NavLink>

          <nav className="hidden lg:flex items-center justify-center gap-x-12 flex-grow">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) =>
                  `text-xl font-bold transition-all border-b-4 pb-1 ${
                    isActive ? 'text-[#f6a118] border-[#fadb31]' : 'text-gray-300 border-transparent hover:text-[#ea7e9c]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout} 
              className="hidden sm:flex bg-gray-50 text-gray-400 px-6 py-2 rounded-full text-base font-bold hover:bg-red-50 hover:text-red-300 transition-all border border-transparent hover:border-red-100 uppercase"
            >
               SALIR 🚪
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-1 text-[#f6a118]">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto flex-grow px-4 py-8 max-w-[1600px] animate-fadeIn">
        <Outlet />
      </main>

      {/* ACCIONES FLOTANTES */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 items-center">
         <a 
           href="https://instagram.com/libreriamatita" 
           target="_blank" 
           rel="noreferrer"
           className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white hover:scale-110 transition-transform group"
         >
           <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" className="w-8 h-8 group-hover:rotate-12 transition-transform" alt="IG" />
         </a>

         <a 
           href="https://wa.me/5493517587003" 
           target="_blank" 
           rel="noreferrer"
           className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl border-2 border-white hover:scale-110 transition-transform group"
         >
           <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" className="w-8 h-8 brightness-0 invert group-hover:-rotate-12 transition-transform" alt="WA" />
         </a>

         <Cart />
      </div>

      {/* FOOTER CON LÁPIZ PARA ADMIN */}
      <footer className="bg-gradient-to-br from-[#f6a118] to-[#ea7e9c] text-white pt-24 pb-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-white/20 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left pb-12 relative z-10">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📍</div>
               <h4 className="text-2xl font-bold uppercase tracking-tighter">Encontranos</h4>
            </div>
            <p className="text-xl italic leading-relaxed text-white/90">
              Te esperamos en **Altos de la Calera**, Córdoba.<br/>
              Un lugar donde los útiles cobran vida.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <div 
              onClick={() => navigate('/admin')}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 hover:border-white hover:scale-110 transition-all cursor-pointer group"
            >
              <span className="text-6xl group-hover:rotate-12 transition-transform">✏️</span>
            </div>
            <p className="font-logo text-6xl mt-4 uppercase tracking-wider text-white">MATITA</p>
            <p className="text-lg font-bold opacity-80 uppercase tracking-[0.3em] text-white">"UNA LIBRERÍA CON ALMA"</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm">✉️</div>
               <h4 className="text-2xl font-bold uppercase tracking-tighter">Seguinos</h4>
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
               <a href="#" className="text-white hover:text-white/70 underline transition-colors text-xl font-bold uppercase">INSTAGRAM</a>
               <span className="text-white/40">•</span>
               <a href="#" className="text-white hover:text-white/70 underline transition-colors text-xl font-bold uppercase">WHATSAPP</a>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-60">HECHO CON AMOR EN CBA 🇦🇷</p>
          </div>
        </div>

        <div className="w-full h-12 bg-black/10 flex items-center justify-center">
          <p className="text-white text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">
            © 2026 MATITA • TODOS LOS DERECHOS RESERVADOS
          </p>
        </div>
      </footer>

      {/* MENÚ MÓVIL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-10 flex flex-col gap-10 border-l-[12px] border-[#fadb31] animate-slideUp">
             <button onClick={() => setIsMenuOpen(false)} className="self-end text-6xl text-gray-200 hover:text-[#ea7e9c] transition-colors">×</button>
             <div className="flex flex-col gap-8">
               {navItems.map((item) => (
                 <NavLink key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-gray-600 hover:text-[#f6a118] transition-colors uppercase tracking-tighter">
                   {item.label}
                 </NavLink>
               ))}
             </div>
             <button onClick={handleLogout} className="mt-auto py-6 bg-gray-50 text-red-300 rounded-3xl font-bold text-2xl border-2 border-transparent active:border-red-100 uppercase">Salir 🚪</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
