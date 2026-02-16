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
  
  // Imágenes de respaldo (Fallback) para carga instantánea
  const defaultBanners = useMemo(() => [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586075010633-2a420b91e1d7?q=80&w=1600&auto=format&fit=crop"
  ], []);

  const [banners, setBanners] = useState<string[]>(defaultBanners);
  const [loadingBanners, setLoadingBanners] = useState(false);

  /**
   * getFullUrl: Genera la URL final optimizada.
   */
  const getFullUrl = (id: string) => {
    if (!id) return "";
    if (id.startsWith('http') || id.startsWith('data:')) return id;
    return `https://res.cloudinary.com/dllm8ggob/image/upload/f_auto,q_auto,w_1920/${id}`;
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
      }
    } catch (err) {
      console.warn("Layout: Usando banners predeterminados.");
    } finally {
      setLoadingBanners(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchConfig();

    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animación del carrusel mejorada: solo depende de la cantidad de banners
    const carouselTimer = setInterval(() => {
      setBanners(prevBanners => {
        if (prevBanners.length > 0) {
          setCurrentSlide(prev => (prev + 1) % prevBanners.length);
        }
        return prevBanners;
      });
    }, 6000);

    // Suscripción Real-time
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
      
      {/* SECCIÓN 1: CARRUSEL PROPORCIONAL - Altura optimizada */}
      <section className="w-full relative overflow-hidden bg-white shadow-sm h-[35vh] md:h-[400px] lg:h-[480px]">
        {banners.map((url, idx) => (
          <div 
            key={`${url}-${idx}`} 
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Capa 1: Fondo desenfocado */}
            <img 
              src={getFullUrl(url)} 
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-110" 
              alt=""
            />
            
            {/* Capa 2: Imagen principal */}
            <img 
              src={getFullUrl(url)} 
              loading={idx === 0 ? "eager" : "lazy"}
              className="relative w-full h-full object-contain drop-shadow-2xl" 
              alt={`Matita Banner ${idx + 1}`} 
            />
            
            {/* Overlay ultra suave */}
            <div className="absolute inset-0 bg-black/[0.02]"></div>
          </div>
        ))}

        {/* Indicadores */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-40">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 shadow-xl ${
                  idx === currentSlide ? 'w-10 bg-[#fadb31]' : 'w-2 bg-black/10 hover:bg-black/20'
                } border border-white/50`}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: HEADER PEGAJOSO - Letras más pequeñas */}
      <header 
        className={`sticky top-0 z-[100] transition-all duration-500 bg-white/95 backdrop-blur-md border-b-2 border-[#fadb31]/20 shadow-sm ${
          isScrolled ? 'py-1 md:py-2' : 'py-3 md:py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4 max-w-[1920px]">
          
          <NavLink to="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
            <div className={`bg-[#fadb31] rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all duration-500 overflow-hidden ${
              isScrolled ? 'w-8 h-8 md:w-10 md:h-10' : 'w-10 h-10 md:w-14 md:h-14'
            }`}>
              <img 
                src={getFullUrl(logoUrl)} 
                alt="Logo" 
                className="w-full h-full object-contain p-1 group-hover:rotate-12 transition-transform duration-500" 
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

          {/* Navegación Desktop - Tamaños reducidos para PC */}
          <nav className="hidden lg:flex items-center justify-center gap-x-8 flex-grow">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) =>
                  `text-sm xl:text-base font-bold transition-all border-b-2 pb-0.5 hover:scale-105 active:scale-95 ${
                    isActive ? 'text-[#f6a118] border-[#fadb31]' : 'text-gray-300 border-transparent hover:text-[#ea7e9c]'
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
              className="hidden md:flex bg-gray-50 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-red-50 hover:text-red-300 transition-all border border-transparent uppercase tracking-widest"
            >
               SALIR 🚪
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="lg:hidden p-2 text-[#f6a118] hover:scale-110 transition-transform"
            >
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN 3: ÁREA DE CONTENIDO */}
      <main className="container mx-auto flex-grow px-4 py-8 max-w-[1600px] animate-fadeIn">
        <Outlet />
      </main>

      {/* SECCIÓN 4: ACCIONES FLOTANTES */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col gap-3 items-center">
         <a 
           href="https://www.instagram.com/libreriamatita" 
           target="_blank" 
           rel="noreferrer"
           className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:scale-110 transition-transform group"
         >
           <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" alt="IG" />
         </a>

         <a 
           href="https://wa.me/5493517587003" 
           target="_blank" 
           rel="noreferrer"
           className="w-10 h-10 md:w-11 md:h-11 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform group"
         >
           <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" className="w-5 h-5 md:w-6 md:h-6 brightness-0 invert group-hover:-rotate-12 transition-transform" alt="WA" />
         </a>

         <Cart />
      </div>

      {/* SECCIÓN 5: FOOTER - Letras proporcionadas */}
      <footer className="bg-gradient-to-br from-[#f6a118] to-[#ea7e9c] text-white pt-12 pb-0 relative overflow-hidden mt-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left pb-10 relative z-10">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center md:justify-start">
               <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-lg shadow-sm">📍</div>
               <h4 className="text-lg md:text-xl font-bold uppercase tracking-tighter">Encontranos</h4>
            </div>
            <p className="text-sm italic leading-relaxed text-white/90">
              Te esperamos en **Altos de la Calera**, Córdoba.<br/>
              Donde la papelería se vuelve mágica.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3">
            <div 
              onClick={() => navigate('/admin')}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-white/50 hover:border-white hover:scale-110 transition-all cursor-pointer group"
            >
              <span className="text-3xl group-hover:rotate-12 transition-transform">✏️</span>
            </div>
            <p className="font-logo text-3xl md:text-4xl mt-2 uppercase tracking-wider text-white">MATITA</p>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.3em] text-white">"UNA LIBRERÍA CON ALMA"</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center md:justify-start">
               <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-lg shadow-sm">✉️</div>
               <h4 className="text-lg md:text-xl font-bold uppercase tracking-tighter">Seguinos</h4>
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
               <a href="https://instagram.com/libreriamatita" target="_blank" rel="noreferrer" className="text-white hover:text-white/70 underline transition-colors text-[11px] font-bold uppercase">INSTAGRAM</a>
               <span className="text-white/40">•</span>
               <a href="https://wa.me/5493517587003" target="_blank" rel="noreferrer" className="text-white hover:text-white/70 underline transition-colors text-[11px] font-bold uppercase">WHATSAPP</a>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">HECHO CON AMOR EN CBA 🇦🇷</p>
          </div>
        </div>

        <div className="w-full h-8 bg-black/10 flex items-center justify-center">
          <p className="text-white text-[8px] font-bold uppercase tracking-[0.4em] opacity-80">
            © 2026 MATITA • TODOS LOS DERECHOS RESERVADOS
          </p>
        </div>
      </footer>

      {/* SECCIÓN 6: MENÚ MÓVIL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-6 flex flex-col gap-6 border-l-8 border-[#fadb31] animate-slideUp">
             <button onClick={() => setIsMenuOpen(false)} className="self-end text-3xl text-gray-200 hover:text-[#ea7e9c] leading-none transition-colors">&times;</button>
             <div className="flex flex-col gap-5">
               {navItems.map((item) => (
                 <NavLink 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-lg font-bold text-gray-600 hover:text-[#f6a118] transition-colors uppercase tracking-tighter"
                 >
                   {item.label}
                 </NavLink>
               ))}
             </div>
             <button onClick={handleLogout} className="mt-auto py-3 bg-gray-50 text-red-300 rounded-2xl font-bold text-sm border-2 border-transparent uppercase">Salir 🚪</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
