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
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Imágenes de respaldo (Fallback) en caso de que la DB esté vacía
  const defaultBanners = useMemo(() => [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586075010633-2a420b91e1d7?q=80&w=2000&auto=format&fit=crop"
  ], []);

  const [banners, setBanners] = useState<string[]>(defaultBanners);

  /**
   * getFullUrl: Genera la URL final optimizada.
   * Prioriza Cloudinary para banners de alta resolución.
   */
  const getFullUrl = (id: string) => {
    if (!id) return "";
    if (id.startsWith('http') || id.startsWith('data:')) return id;
    return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto:best,f_auto,w_2000/${id}`;
  };

  /**
   * fetchConfig: Obtiene la configuración de banners desde Supabase.
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
      } else {
        setBanners(defaultBanners);
      }
    } catch (err) {
      console.warn("Layout: No se pudieron cargar los banners dinámicos, usando predeterminados.");
      setBanners(defaultBanners);
    } finally {
      setLoadingBanners(false);
    }
  }, [supabase, defaultBanners]);

  useEffect(() => {
    fetchConfig();

    // Listener de scroll para el header dinámico
    const handleScroll = () => {
      const scrolled = window.scrollY > 60;
      if (scrolled !== isScrolled) setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animación automática del carrusel (intervalo de 7 segundos)
    const carouselTimer = setInterval(() => {
      setBanners(current => {
        if (current.length > 1) {
          setCurrentSlide(prev => (prev + 1) % current.length);
        }
        return current;
      });
    }, 7000);

    // Suscripción Real-time: Refleja cambios del Admin al instante
    const configSubscription = supabase
      .channel('site_config_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_config', filter: 'id=eq.global' },
        (payload) => {
          if (payload.new && payload.new.carousel_images) {
            setBanners(payload.new.carousel_images);
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(carouselTimer);
      supabase.removeChannel(configSubscription);
    };
  }, [supabase, fetchConfig, isScrolled]);

  // Reset de navegación al cambiar de ruta
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
    <div className="min-h-screen flex flex-col font-matita bg-[#fef9eb]/30 transition-colors duration-500">
      
      {/* SECCIÓN 1: CARRUSEL DE BANNERS DINÁMICOS */}
      <section className="w-full relative overflow-hidden bg-white h-[45vh] md:h-[480px] shadow-sm">
        {loadingBanners ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
            <div className="w-12 h-12 border-4 border-[#fadb31] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          banners.map((url, idx) => (
            <div 
              key={`${url}-${idx}`} 
              className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={getFullUrl(url)} 
                className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${
                  idx === currentSlide ? 'scale-110' : 'scale-100'
                }`} 
                alt={`Matita Banner ${idx + 1}`} 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
            </div>
          ))
        )}

        {/* Indicadores de página del carrusel */}
        {!loadingBanners && banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-700 ${
                  idx === currentSlide ? 'w-12 bg-[#fadb31]' : 'w-2 bg-white/60 hover:bg-white'
                } shadow-sm border border-black/5`}
                aria-label={`Ver slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: HEADER PEGAJOSO (STICKY) */}
      <header 
        className={`sticky top-0 z-[100] transition-all duration-500 bg-white/95 backdrop-blur-md border-b-2 border-[#fadb31]/20 shadow-sm ${
          isScrolled ? 'py-3' : 'py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between gap-8 max-w-[1920px]">
          
          <NavLink to="/" className="flex items-center gap-4 shrink-0 group">
            <div className={`bg-[#fadb31] rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all duration-500 overflow-hidden ${
              isScrolled ? 'w-10 h-10' : 'w-16 h-16'
            }`}>
              <img 
                src={getFullUrl(logoUrl)} 
                alt="Logo Matita" 
                className="w-full h-full object-contain p-1.5 group-hover:rotate-12 transition-transform duration-500" 
              />
            </div>
            <div className="flex flex-col">
              <h1 className={`font-matita text-gray-800 transition-all duration-500 uppercase leading-none tracking-tighter ${
                isScrolled ? 'text-4xl' : 'text-6xl'
              }`}>
                MATITA
              </h1>
            </div>
          </NavLink>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center justify-center gap-x-12 flex-grow">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) =>
                  `text-xl font-bold transition-all border-b-4 pb-1 hover:scale-105 active:scale-95 ${
                    isActive ? 'text-[#f6a118] border-[#fadb31]' : 'text-gray-300 border-transparent hover:text-[#ea7e9c]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Acciones de Usuario */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout} 
              className="hidden md:flex bg-gray-50 text-gray-400 px-6 py-2 rounded-full text-sm font-bold hover:bg-red-50 hover:text-red-300 transition-all border border-transparent hover:border-red-100 uppercase tracking-widest"
            >
               SALIR 🚪
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="lg:hidden p-1 text-[#f6a118] hover:scale-110 transition-transform"
            >
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN 3: ÁREA DE CONTENIDO */}
      <main className="container mx-auto flex-grow px-4 py-12 max-w-[1600px] animate-fadeIn">
        <Outlet />
      </main>

      {/* SECCIÓN 4: ACCIONES FLOTANTES (Sticky) */}
      <div className="fixed bottom-10 right-10 z-[80] flex flex-col gap-4 items-center">
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

      {/* SECCIÓN 5: FOOTER DE DISEÑO PROPIO */}
      <footer className="bg-gradient-to-br from-[#f6a118] to-[#ea7e9c] text-white pt-24 pb-0 relative overflow-hidden mt-20">
        <div className="absolute top-0 left-0 w-full h-2 bg-white/20 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left pb-12 relative z-10">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📍</div>
               <h4 className="text-2xl font-bold uppercase tracking-tighter">Encontranos</h4>
            </div>
            <p className="text-xl italic leading-relaxed text-white/90">
              Te esperamos en **Altos de la Calera**, Córdoba.<br/>
              Donde la papelería se vuelve mágica.
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
            <p className="text-sm font-bold opacity-80 uppercase tracking-[0.4em] text-white">"UNA LIBRERÍA CON ALMA"</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-sm">✉️</div>
               <h4 className="text-2xl font-bold uppercase tracking-tighter">Seguinos</h4>
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
               <a href="https://instagram.com/libreriamatita" target="_blank" rel="noreferrer" className="text-white hover:text-white/70 underline transition-colors text-xl font-bold uppercase">INSTAGRAM</a>
               <span className="text-white/40">•</span>
               <a href="https://wa.me/5493517587003" target="_blank" rel="noreferrer" className="text-white hover:text-white/70 underline transition-colors text-xl font-bold uppercase">WHATSAPP</a>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">HECHO CON AMOR EN CBA 🇦🇷</p>
          </div>
        </div>

        <div className="w-full h-12 bg-black/10 flex items-center justify-center">
          <p className="text-white text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">
            © 2026 MATITA • TODOS LOS DERECHOS RESERVADOS
          </p>
        </div>
      </footer>

      {/* SECCIÓN 6: MENÚ MÓVIL (Overlay) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-10 flex flex-col gap-10 border-l-[12px] border-[#fadb31] animate-slideUp">
             <button onClick={() => setIsMenuOpen(false)} className="self-end text-6xl text-gray-200 hover:text-[#ea7e9c] transition-colors leading-none">&times;</button>
             <div className="flex flex-col gap-8">
               {navItems.map((item) => (
                 <NavLink 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-2xl font-bold text-gray-600 hover:text-[#f6a118] transition-colors uppercase tracking-tighter"
                 >
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
