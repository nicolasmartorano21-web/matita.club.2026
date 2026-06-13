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
      {location.pathname === '/catalog' && (
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
      )}

      {/* SECCIÓN 2: HEADER PEGAJOSO COMPACTO */}
      <header 
        className={`sticky top-0 z-[100] transition-all duration-500 bg-white/95 backdrop-blur-md border-b-2 border-[#fadb31]/10 shadow-md ${
          isScrolled ? 'py-1.5 md:py-2' : 'py-3 md:py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4 max-w-7xl">
          
          <NavLink to="/" className="flex items-center gap-2 md:gap-3 shrink-0 group hover:-translate-y-0.5 transition-transform duration-300">
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
                  `text-sm xl:text-base font-bold tracking-tight transition-all duration-300 hover:-translate-y-0.5 border-b-2 pb-0.5 ${
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
              className="hidden md:flex bg-gray-50 text-gray-400 px-5 py-2 rounded-full text-[11px] font-bold hover:bg-red-50 hover:text-red-300 hover:-translate-y-0.5 transition-all border border-transparent uppercase tracking-wider"
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
           className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#f6a118] to-[#ea7e9c] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all group"
         >
           <svg className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
         </a>
         <a 
           href="https://wa.me/5493517587003" 
           target="_blank" 
           rel="noreferrer"
           className="w-16 h-16 md:w-20 md:h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all group"
         >
           <svg className="w-8 h-8 md:w-10 md:h-10 group-hover:-rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.849L.054 23.272a.75.75 0 00.912.982l5.5-1.494A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-5.003-1.384l-.358-.214-3.715 1.01 1.019-3.6-.235-.372A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
         </a>
         <Cart />
      </div>

      {/* FOOTER */}
      <footer className="bg-gradient-to-br from-[#f6a118] via-[#f09020] to-[#ea7e9c] text-white relative overflow-hidden mt-16">
        {/* Onda decorativa superior */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[40px] md:h-[56px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,40 C200,90 400,10 600,50 C800,90 1000,20 1200,60 L1200,0 L0,0 Z" fill="#fef9eb"/>
          </svg>
        </div>

        <div className="container mx-auto px-6 md:px-10 pt-20 pb-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center md:text-left pb-10 border-b border-white/20">
            
            {/* Col 1 - Dirección */}
            <div className="space-y-3">
              <h4 className="text-base font-black uppercase tracking-[0.15em] text-white/90">📍 Encontranos</h4>
              <p className="text-sm leading-relaxed text-white/80 font-medium">
                Altos de la Calera, Córdoba.<br/>
                <span className="text-white/60 text-xs italic">Donde la papelería se vuelve mágica.</span>
              </p>
            </div>

            {/* Col 2 - Marca central */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div
                onClick={() => navigate('/admin')}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 hover:scale-110 hover:rotate-6 transition-all cursor-pointer group"
              >
                <span className="text-3xl group-hover:rotate-12 transition-transform inline-block">✏️</span>
              </div>
              <p className="font-logo text-5xl uppercase tracking-wide leading-none text-white drop-shadow-md">MATITA</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">"Una librería con alma"</p>
            </div>

            {/* Col 3 - Redes */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h4 className="text-base font-black uppercase tracking-[0.15em] text-white/90">🌸 Seguinos</h4>
              <div className="flex gap-4">
                {/* Instagram */}
                <a
                  href="https://instagram.com/libreriamatita"
                  target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/15 hover:bg-white rounded-2xl flex items-center justify-center border-2 border-white/30 hover:border-white transition-all duration-300 hover:scale-110 hover:-rotate-6 group"
                >
                  <svg className="w-6 h-6 text-white group-hover:text-[#ea7e9c] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* WhatsApp — SVG oficial simplificado y correcto */}
                <a
                  href="https://wa.me/5493517587003"
                  target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/15 hover:bg-white rounded-2xl flex items-center justify-center border-2 border-white/30 hover:border-white transition-all duration-300 hover:scale-110 hover:rotate-6 group"
                >
                  <svg className="w-6 h-6 text-white group-hover:text-[#25D366] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.472 3.528A11.955 11.955 0 0012.001 0C5.387 0 .003 5.383 0 11.998a11.96 11.96 0 001.604 6L0 24l6.153-1.614A11.97 11.97 0 0012 23.997h.001c6.612 0 11.997-5.383 12-11.999a11.943 11.943 0 00-3.529-8.47zM12.001 21.997a9.944 9.944 0 01-5.07-1.382l-.363-.216-3.764.987 1.005-3.672-.236-.377A9.929 9.929 0 012 12c.003-5.514 4.489-10 9.999-10 2.672 0 5.183 1.042 7.073 2.933A9.92 9.92 0 0122 12.001c-.003 5.514-4.49 9.996-9.999 9.996zm5.485-7.484c-.3-.15-1.773-.874-2.048-.974-.274-.1-.474-.15-.674.15-.2.3-.773.975-.948 1.175-.174.2-.349.224-.649.075-.3-.15-1.265-.466-2.41-1.485-.89-.794-1.492-1.774-1.667-2.074-.174-.3-.019-.462.131-.612.134-.134.3-.35.449-.524.15-.175.2-.3.3-.499.1-.2.05-.374-.025-.524-.075-.15-.674-1.624-.923-2.224-.243-.583-.49-.504-.673-.513-.174-.008-.374-.01-.574-.01-.2 0-.524.075-.799.374-.274.3-1.047 1.024-1.047 2.499s1.072 2.898 1.222 3.098c.15.2 2.11 3.223 5.112 4.522.714.308 1.271.492 1.705.63.717.228 1.37.196 1.886.119.575-.086 1.773-.725 2.022-1.424.25-.7.25-1.3.175-1.424-.074-.125-.274-.2-.574-.35z"/>
                  </svg>
                </a>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Hecho con amor en Cba 🇦🇷</p>
            </div>
          </div>

          {/* Barra inferior */}
          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
            <span>© 2026 Matita · Todos los derechos reservados</span>
            <span className="hidden sm:block">✏️ Librería & Club</span>
          </div>
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
