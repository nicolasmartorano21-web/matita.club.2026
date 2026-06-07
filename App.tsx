
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import ClubView from './components/ClubView';
import LoginScreen from './components/LoginScreen';
import Ideas from './components/Ideas';
import Contact from './components/Contact';
import { Product, CartItem, User, Category } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  supabase: SupabaseClient;
  showToast: (title: string, description: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('matita_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('matita_cached_logo') || "https://res.cloudinary.com/dllm8ggob/image/upload/v1740628230/branding/logo_default.png";
  });

  const clearCart = useCallback(() => setCart([]), []);

  // Bloquear el botón "Atrás" del navegador para que no salga de la app
  useEffect(() => {
    // Empujar un estado extra al historial para tener dónde "atrapar" el back
    window.history.pushState({ matita: true }, '', window.location.href);

    const handlePopState = () => {
      // Cuando el usuario presiona Atrás, re-empujamos el estado para quedarnos
      window.history.pushState({ matita: true }, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem('matita_persisted_user');
      const savedFavs = localStorage.getItem('matita_favs');
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoadingSession(false);
      }

      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.user && !sessionError) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (userData) {
            const fullUser = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              points: userData.points,
              isAdmin: userData.is_admin,
              isSocio: userData.is_socio,
            };
            setUser(fullUser);
            localStorage.setItem('matita_persisted_user', JSON.stringify(fullUser));
          }
        }

        const { data: configData } = await supabase
          .from('site_config')
          .select('logo_url')
          .eq('id', 'global')
          .maybeSingle();
        
        if (configData?.logo_url) {
          setLogoUrl(configData.logo_url);
          localStorage.setItem('matita_cached_logo', configData.logo_url);
        }

      } catch (error) {
        console.error("Fallo silencioso en inicio:", error);
      } finally {
        setLoadingSession(false);
      }
    };

    initApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (userData) {
          const fullUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            points: userData.points,
            isAdmin: userData.is_admin,
            isSocio: userData.is_socio,
          };
          setUser(fullUser);
          localStorage.setItem('matita_persisted_user', JSON.stringify(fullUser));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('matita_persisted_user');
        clearCart();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [clearCart]);

  useEffect(() => {
    localStorage.setItem('matita_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('matita_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

  const showToast = useCallback((title: string, description: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  if (loadingSession && !user) {
    return (
      <div className="min-h-screen bg-[#fef9eb] flex flex-col items-center justify-center gap-8 font-matita">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-8 border-[#fadb31]/20 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-transparent border-t-[#f6a118] rounded-full animate-spin"></div>
          <span className="text-6xl animate-pulse">✏️</span>
        </div>
        <div className="text-center">
          <h2 className="text-5xl font-logo text-[#f6a118] mb-2 text-transform: uppercase">MATITA</h2>
          <div className="flex gap-1 justify-center">
             <div className="w-2 h-2 bg-[#f6a118] rounded-full animate-bounce delay-100"></div>
             <div className="w-2 h-2 bg-[#ea7e9c] rounded-full animate-bounce delay-200"></div>
             <div className="w-2 h-2 bg-[#fadb31] rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      user, setUser, cart, addToCart, removeFromCart, clearCart, 
      favorites, toggleFavorite, logoUrl, setLogoUrl, supabase,
      showToast
    }}>
      {/* CONTENEDOR DE TOASTS FLOTANTES */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none font-matita">
        {toasts.map(toast => {
          const bgClass = toast.type === 'success' ? 'bg-[#f0fdf4] border-[#86efac] text-green-800 shadow-green-100' :
                          toast.type === 'error' ? 'bg-[#fef2f2] border-[#fca5a5] text-red-800 shadow-red-100' :
                          'bg-[#fdfaf6] border-[#fadb31] text-gray-800 shadow-orange-100';
          const icon = toast.type === 'success' ? '🌸' : toast.type === 'error' ? '❌' : '✨';
          return (
            <div 
              key={toast.id} 
              className={`p-5 rounded-2xl border-4 shadow-xl flex gap-3 items-start pointer-events-auto animate-fadeIn ${bgClass} transition-all duration-300 transform hover:scale-102`}
            >
              <span className="text-2xl mt-0.5">{icon}</span>
              <div className="flex-grow">
                <h4 className="font-black text-sm uppercase tracking-tight">{toast.title}</h4>
                <p className="text-xs font-bold opacity-80 mt-1 leading-snug">{toast.description}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-gray-400 hover:text-gray-600 font-black text-sm"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

      <HashRouter>
        <Routes>
          {!user ? (
            <Route path="*" element={<LoginScreen />} />
          ) : (
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/catalog" />} />
              <Route path="catalog" element={<Catalog category="Catalog" />} />
              <Route path="escolar" element={<Catalog category="Escolar" />} />
              <Route path="otros" element={<Catalog category="Otros" />} />
              <Route path="oficina" element={<Catalog category="Oficina" />} />
              <Route path="tecnologia" element={<Catalog category="Tecnología" />} />
              <Route path="novedades" element={<Catalog category="Novedades" />} />
              <Route path="ofertas" element={<Catalog category="Ofertas" />} />
              <Route path="favorites" element={<Catalog category="Favorites" />} />
              <Route path="club" element={<ClubView />} />
              <Route path="ideas" element={<Ideas />} />
              <Route path="contact" element={<Contact />} />
              <Route path="admin" element={<AdminPanel />} />
            </Route>
          )}
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
