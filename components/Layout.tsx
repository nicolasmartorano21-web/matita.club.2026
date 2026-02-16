import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import Cart from './Cart';

/**
 * Layout: Componente principal de estructura.
 * Gestiona la navegación, el carrusel de banners dinámico y el branding global.
 */
const Layout: React.FC = () => {
  const { user, setUser, clearCart, logoUrl, supabase } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de interfaz y visualización
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Estado inicial con caché para carga instantánea
  const [banners, setBanners] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('matita_banners_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loadingBanners, setLoadingBanners] = useState(banners.length === 0);

  /**
   * getFullUrl: Genera la URL optimizada.
   * En móviles pide 800px para carga instantánea, en PC 1920px.
   */
  const getFullUrl = (id: string) => {
    if (!id) return "";
    if (id.startsWith('http') || id.startsWith('data:')) return id;
    const isMobile = window.innerWidth < 768;
    const width = isMobile ? 800 : 1920;
    return `https://res.cloudinary.com/dllm8ggob/image/upload/f_auto,q_auto,w_${width}/${id}`;
  };

  /**
   * fetchConfig: Sincroniza los banners con la base de datos (Admin).
   */
  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('carousel_images')
        .eq('id', 'global')
        .maybeSingle();

      if (error) throw error;

      if (data?.carousel_images && Array.isArray(data.carousel_images) && data.carousel_images.length > 0) {
        setBanners(data.carousel_images);
        localStorage.setItem('matita_banners_cache', JSON.stringify(data.carousel_images));
      }
    } catch (err) {
      console.warn("Layout: Error sincronizando banners.");
    } finally {
      setLoadingBanners(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchConfig();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animación fluida del carrusel
    const carouselTimer = setInterval(() => {
      setBanners(prev => {
        if (prev.length > 1) {
          setCurrentSlide(c => (c + 1) % prev.length);
        }
        return prev;
      });
    }, 6000);

    // Sincronización Real-time desde el Admin
    const configSubscription = supabase
      .channel('layout_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_config', filter: 'id=eq.global' },
        (payload) => {
          if (payload.new && payload.new.carousel_images) {
            setBanners(payload.new.carousel_images);
            localStorage.setItem('matita_banners_cache', JSON.stringify(payload.new.carousel_images));
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(carouselTimer);
      supabase.removeChannel(configSubscription);
    };
  }, [supabase, fetchConfig]);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleLogout = () => {
    if (confirm("¿Deseas cerrar tu sesión en Matita? ✨")) {
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
    <div className="min-h-screen flex flex-col font-matita bg-[#fef9eb]/30 transition-colors duration-500 overflow-x-hidden">
      
      {/* SECCIÓN 1: CARRUSEL PROPORCIONAL SIN ESPACIOS BLANCOS */}
      <section className="w-full relative overflow-hidden bg-white shadow-sm h-[40vh] md:h-[450px] lg:h-[550px]">
        {loadingBanners && banners.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
             <div className="w-10 h-10 border-4 border-[#fadb31] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          banners.map((url, idx) => (
            <div 
              key={`${url}-${idx}`} 
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Capa 1: Fondo desenfocado que rellena toda el área */}
              <img 
                src={getFullUrl(url)} 
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-110 pointer-events-none" 
                alt=""
              />
              
              {/* Capa 2: Imagen principal contenida (SE VE COMPLETA SIEMPRE) */}
              <img 
                src={getFullUrl(url)} 
                loading={idx === 0 ? "eager" : "lazy"}
                className="relative w-full h-full object-contain drop-shadow-2xl pointer-events-none" 
                alt={`Banner Matita ${idx + 1}`} 
              />
              
              {/* Overlay sutil para elegancia */}
              <div className="absolute inset-0 bg-black/[0.01] pointer-events-none"></div>
            </div>
          ))
        )}

        {/* Indicadores Minimalistas */}
        {banners.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-40">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 shadow-xl ${
                  idx === currentSlide ? 'w-10 bg-[#fadb31]' : 'w-2 bg-black/10 hover:bg-black/20'
                } border border-white/50`}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: HEADER PEGAJOSO COMPACTO */}
      <header 
        className={`sticky top-0 z-[100] transition-all duration-500 bg-white/95 backdrop-blur-md border-b-2 border-[#fadb31]/10 shadow-sm ${
          isScrolled ? 'py-1.5 md:py-2' : 'py-3 md:py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4 max-w-7xl">
          
          <NavLink to="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
            <div className={`bg-[#fadb31] rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all duration-500 overflow-hidden ${
              isScrolled ? 'w-10 h-10 md:w-12 md:h-12' : 'w-12 h-12 md:w-14 md:h-14'
            }`}>
              <img 
                src={getFullUrl(logoUrl)} 
                alt="Logo" 
                className="w-full h-full object-contain p-1 group-hover:rotate-6 transition-transform duration-500" 
              />
            </div>
            <div className="flex flex-col">
              <h1 className={`font-matita text-gray-800 transition-all duration-500 uppercase leading-none tracking-tighter ${
                isScrolled ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl lg:text-4xl'
              }`}>
                MATITA
              </h1>
            </div>
          </NavLink>

          {/* Navegación Desktop - Tamaños intermedios */}
          <nav className="hidden lg:flex items-center justify-center gap-x-8 flex-grow">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) =>
                  `text-sm xl:text-base font-bold tracking-tight transition-all border-b-2 pb-0.5 ${
                    isActive
                      ? 'text-[#f6a118] border-[#fadb31]'
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={handleLogout} 
              className="hidden md:flex bg-gray-50 text-gray-400 px-5 py-2 rounded-full text-[11px] font-bold hover:bg-red-50 hover:text-red-300 transition-all border border-transparent uppercase tracking-wider"
            >
               SALIR 🚪
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="lg:hidden p-2 text-[#f6a118] hover:scale-110 transition-transform"
            >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTENIDO */}
      <main className="container mx-auto flex-grow px-4 py-8 md:py-10 max-w-7xl animate-fadeIn">
        <Outlet />
      </main>

      {/* ACCIONES FLOTANTES */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col gap-4 items-center">
         <a 
           href="https://www.instagram.com/libreriamatita" 
           target="_blank" 
           rel="noreferrer"
           className="w-11 h-11 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:scale-110 transition-transform group"
         >
           <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" className="w-6 h-6 group-hover:rotate-6 transition-transform" alt="IG" />
         </a>
         <a 
           href="https://wa.me/5493517587003" 
           target="_blank" 
           rel="noreferrer"
           className="w-11 h-11 md:w-12 md:h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform group"
         >
           <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" className="w-6 h-6 brightness-0 invert group-hover:-rotate-6 transition-transform" alt="WA" />
         </a>
         <Cart />
      </div>

      {/* FOOTER REDUCIDO */}
      <footer className="bg-gradient-to-br from-[#f6a118] to-[#ea7e9c] text-white pt-12 md:pt-16 pb-0 relative overflow-hidden mt-12">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left pb-10 relative z-10">
          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-bold uppercase tracking-tighter">Encontranos</h4>
            <p className="text-sm md:text-base italic leading-relaxed text-white/90">
              Altos de la Calera, Córdoba.<br/>
              Donde la papelería se vuelve mágica.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-3">
            <div 
              onClick={() => navigate('/admin')}
              className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 hover:border-white hover:scale-110 transition-all cursor-pointer group"
            >
              <span className="text-3xl md:text-4xl group-hover:rotate-12 transition-transform">✏️</span>
            </div>
            <p className="font-logo text-4xl md:text-5xl mt-2 uppercase tracking-wider text-white">MATITA</p>
            <p className="text-[11px] font-bold opacity-80 uppercase tracking-[0.3em] text-white">"UNA LIBRERÍA CON ALMA"</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-bold uppercase tracking-tighter">Seguinos</h4>
            <div className="flex gap-5 justify-center md:justify-start">
               <a href="https://instagram.com/libreriamatita" target="_blank" className="text-white hover:text-white/70 underline text-xs font-bold uppercase">INSTAGRAM</a>
               <span className="text-white/40">•</span>
               <a href="https://wa.me/5493517587003" target="_blank" className="text-white hover:text-white/70 underline text-xs font-bold uppercase">WHATSAPP</a>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">HECHO CON AMOR EN CBA 🇦🇷</p>
          </div>
        </div>
        <div className="w-full h-10 bg-black/10 flex items-center justify-center">
          <p className="text-white text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">© 2026 MATITA • TODOS LOS DERECHOS RESERVADOS</p>
        </div>
      </footer>

      {/* MENÚ MÓVIL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-8 flex flex-col gap-8 border-l-8 border-[#fadb31] animate-slideUp">
             <button onClick={() => setIsMenuOpen(false)} className="self-end text-4xl text-gray-200 leading-none">&times;</button>
             <div className="flex flex-col gap-6">
               {navItems.map((item) => (
                 <NavLink 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-xl font-bold text-gray-600 hover:text-[#f6a118] transition-colors uppercase tracking-tighter"
                 >
                   {item.label}
                 </NavLink>
               ))}
             </div>
             <button onClick={handleLogout} className="mt-auto py-4 bg-gray-50 text-red-300 rounded-2xl font-bold text-lg border-2 border-transparent active:border-red-100 uppercase">Salir</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
