import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import Cart from './Cart';

/**
 * Layout Component: Estructura principal de Matita.
 * Optimizado para que el carrusel se vea completo en celulares usando proporciones de aspecto.
 */
const Layout: React.FC = () => {
  const { user, setUser, clearCart, logoUrl, supabase } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados locales para UI
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);

  // Imágenes por defecto con alta calidad
  const defaultBanners = useMemo(() => [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586075010633-2a420b91e1d7?q=80&w=2000&auto=format&fit=crop"
  ], []);

  const [banners, setBanners] = useState<string[]>(defaultBanners);

  // Formateador de URLs para Cloudinary
  const getBannerUrl = (id: string) => {
    if (!id) return defaultBanners[0];
    if (id.startsWith('http') || id.startsWith('data:')) return id;
    return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto:best,f_auto,w_2000/${id}`;
  };

  // Carga de configuración desde Supabase
  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('carousel_images')
        .eq('id', 'global')
        .maybeSingle();

      if (error) throw error;

      if (data?.carousel_images && Array.isArray(data.carousel_images) && data.carousel_images.length > 0) {
        setBanners(data.carousel_images);
      }
    } catch (err) {
      setBanners(defaultBanners);
    } finally {
      setIsLoadingBanners(false);
    }
  }, [supabase, defaultBanners]);

  useEffect(() => {
    fetchBanners();

    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      if (scrolled !== isScrolled) setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const timer = setInterval(() => {
      if (banners.length > 1) {
        setCurrentSlide(curr => (curr + 1) % banners.length);
      }
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, [supabase, fetchBanners, isScrolled, banners.length]);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleLogout = () => {
    if (confirm("¿Quieres cerrar tu sesión en Matita? ✨")) {
      setUser(null);
      clearCart();
      localStorage.removeItem('matita_persisted_user');
      navigate('/');
    }
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
    <div className="min-h-screen flex flex-col font-matita bg-[#fef9eb]/30 transition-colors duration-500">
      
      {/* CARRUSEL RESPONSIVO CORREGIDO */}
      <section className="w-full relative overflow-hidden bg-[#fef9eb] shadow-md group aspect-video sm:aspect-auto sm:h-[400px] md:h-[500px] lg:h-[600px]">
        {isLoadingBanners ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#fadb31] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {banners.map((url, idx) => (
              <div 
                key={`${url}-${idx}`} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                }`}
              >
                <img 
                  src={getBannerUrl(url)} 
                  className="w-full h-full object-cover md:object-center" 
                  alt="Matita Banner" 
                  loading={idx === 0 ? "eager" : "lazy"}
                />
                {/* Overlay sutil para mejorar legibilidad del header cuando es sticky */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5"></div>
              </div>
            ))}
            
            {/* Indicadores de Slide (Dots) más visibles */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 shadow-md ${
                    idx === currentSlide ? 'w-8 md:w-12 bg-white' : 'w-2 md:w-3 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Ir al slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Flechas de navegación laterales (Solo Desktop) */}
            <button 
              onClick={() => setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hidden md:flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => setCurrentSlide(prev => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hidden md:flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </section>

      {/* HEADER STICKY */}
      <header 
        className={`sticky top-0 z-[100] transition-all duration-300 bg-white/95 backdrop-blur-md border-b-2 border-[#fadb31]/10 ${
          isScrolled ? 'py-2 shadow-lg' : 'py-4 md:py-6'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between max-w-[1400px]">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className={`bg-[#fadb31] rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden shadow-sm ${
              isScrolled ? 'w-10 h-10' : 'w-14 h-14 md:w-20 md:h-20'
            }`}>
              <img src={getBannerUrl(logoUrl)} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <h1 className={`font-brand text-gray-800 transition-all duration-300 uppercase font-black tracking-tighter ${
              isScrolled ? 'text-2xl' : 'text-3xl md:text-6xl'
            }`}>
              MATITA
            </h1>
          </NavLink>

          {/* Nav Desktop */}
          <nav className="hidden lg:flex items-center gap-x-6 xl:gap-x-10">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) =>
                  `text-base xl:text-lg font-bold transition-all border-b-4 pb-1 ${
                    isActive ? 'text-[#f6a118] border-[#fadb31]' : 'text-gray-300 border-transparent hover:text-[#ea7e9c]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {user?.isAdmin && (
              <NavLink to="/admin" className="hidden md:flex p-2 bg-gray-100 rounded-full text-gray-400 hover:text-[#f6a118] transition-colors shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </NavLink>
            )}
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-[#f6a118] active:scale-90 transition-transform bg-white rounded-full shadow-sm border border-gray-100">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto flex-grow px-4 py-8 md:py-12 max-w-[1400px] animate-fadeIn">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-[#f6a118] text-white pt-16 md:pt-24 pb-10 mt-12">
        <div className="container mx-auto px-6 text-center space-y-8">
           <p className="font-logo text-5xl md:text-7xl">MATITA</p>
           <p className="text-lg md:text-2xl italic opacity-90 max-w-lg mx-auto leading-tight">"Una librería con alma, colores y muchos sueños en Altos de la Calera"</p>
           <div className="flex justify-center gap-6 md:gap-10 text-sm font-bold uppercase tracking-widest opacity-80 flex-wrap">
              <a href="https://instagram.com/libreriamatita" target="_blank" rel="noreferrer" className="hover:text-white hover:scale-110 transition-all">Instagram</a>
              <span className="hidden md:inline opacity-30">•</span>
              <a href="https://wa.me/5493517587003" target="_blank" rel="noreferrer" className="hover:text-white hover:scale-110 transition-all">WhatsApp</a>
              <span className="hidden md:inline opacity-30">•</span>
              <button onClick={() => navigate('/contact')} className="hover:text-white hover:scale-110 transition-all">Ubicación</button>
           </div>
           <p className="text-[10px] opacity-40 uppercase tracking-[0.4em] pt-10 border-t border-white/10 mt-10">© 2026 MATITA • CÓRDOBA, ARGENTINA</p>
        </div>
      </footer>

      {/* COMPONENTES FLOTANTES */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[120] flex flex-col gap-4">
         <Cart />
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-72 md:w-80 bg-[#fdfaf6] p-8 flex flex-col gap-8 border-l-[10px] border-[#fadb31] animate-slideUp shadow-2xl">
             <div className="flex justify-between items-center">
               <span className="font-brand text-3xl text-[#f6a118]">MENÚ</span>
               <button onClick={() => setIsMenuOpen(false)} className="text-4xl text-gray-300 leading-none hover:text-[#ea7e9c] transition-colors">&times;</button>
             </div>
             <div className="flex flex-col gap-6">
               {navItems.map((item) => (
                 <NavLink 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsMenuOpen(false)} 
                    className={({ isActive }) => 
                      `text-2xl font-bold transition-all uppercase tracking-tight ${isActive ? 'text-[#f6a118] translate-x-2' : 'text-gray-400 hover:text-gray-600'}`
                    }
                 >
                   {item.label}
                 </NavLink>
               ))}
               <div className="h-px bg-gray-100 my-2"></div>
               {user?.isAdmin && (
                 <NavLink 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-bold text-[#ea7e9c] uppercase tracking-tight"
                 >
                   ADMINISTRAR 👑
                 </NavLink>
               )}
             </div>
             <button onClick={handleLogout} className="mt-auto py-5 bg-white text-gray-400 rounded-3xl font-bold uppercase tracking-widest text-xs border-2 border-gray-100 active:bg-red-50 active:text-red-400 transition-colors">Cerrar Sesión 🚪</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
