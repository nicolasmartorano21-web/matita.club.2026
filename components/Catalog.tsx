
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product, Category } from '../types';
import { useApp } from '../App';

interface CatalogProps {
  category: Category | 'Catalog' | 'Favorites';
}

const CACHE_KEY = 'matita_products_cache_v4';

const Catalog: React.FC<CatalogProps> = ({ category }) => {
  const { favorites, supabase } = useApp();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'priceLow' | 'priceHigh' | 'name'>('recent');
  const [initialLoad, setInitialLoad] = useState(products.length === 0);

  const fetchProducts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name || "Producto sin nombre",
          description: p.description || "",
          price: Number(p.price) || 0,
          oldPrice: Number(p.old_price) || 0,
          points: Number(p.points) || 0,
          category: p.category || "Otros",
          images: p.images || [],
          colors: p.colors || []
        }));
        
        setProducts(mapped);
        localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
      }
    } catch (err: any) {
      console.error("Error cargando productos:", err);
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // SUSCRIPCIÓN EN TIEMPO REAL: Sincroniza PC y Celular al instante
    const channel = supabase.channel('realtime-stock')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts(); // Recarga los datos si hay cualquier cambio en la DB
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const normalize = (s: string | null | undefined) => (s || "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      if (category === 'Favorites') return matchesSearch && favorites.includes(p.id);
      if (category === 'Catalog') return matchesSearch;
      
      if (category === 'Ofertas') {
        const hasOfferPrice = p.oldPrice && p.oldPrice > 0;
        return matchesSearch && (hasOfferPrice || p.category === 'Ofertas');
      }
      
      return matchesSearch && normalize(p.category) === normalize(category);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'name') return (a.name || "").localeCompare(b.name || "");
      return 0;
    });
  }, [category, searchTerm, favorites, products, sortBy]);

  const categoryList: {label: string, cat: Category, icon: string, route: string}[] = [
    { label: 'ESCOLAR', cat: 'Escolar', icon: '🎒', route: '/escolar' },
    { label: 'OFICINA', cat: 'Oficina', icon: '💼', route: '/oficina' },
    { label: 'TECNOLOGÍA', cat: 'Tecnología', icon: '🎧', route: '/tecnologia' },
    { label: 'NOVEDADES', cat: 'Novedades', icon: '✨', route: '/novedades' },
    { label: 'OTROS', cat: 'Otros', icon: '📝', route: '/otros' },
    { label: 'OFERTAS', cat: 'Ofertas', icon: '🏷️', route: '/ofertas' }
  ];

  if (initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8 animate-fadeIn">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-transparent border-t-[#f6a118] rounded-full animate-spin"></div>
        </div>
        <p className="text-[#f6a118] font-bold animate-pulse text-2xl uppercase tracking-tighter text-center px-10">
          CONECTANDO CON MATITA... ✨
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn pb-24 mt-2">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h2 className="text-lg md:text-xl font-matita font-bold text-[#f6a118] drop-shadow-sm uppercase tracking-widest">
          {category === 'Catalog' ? 'EXPLORAR' : category === 'Favorites' ? 'FAVORITOS' : category.toUpperCase()}
        </h2>
        <div className="flex flex-col md:flex-row gap-3 w-full max-w-4xl">
          <input
            type="text"
            placeholder="¿Qué buscamos hoy? 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 rounded-3xl border-2 border-[#fadb31]/20 text-lg shadow-sm focus:border-[#fadb31] outline-none bg-white uppercase"
          />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-6 py-4 rounded-3xl border-2 border-[#fadb31]/20 text-base font-bold text-gray-400 bg-white outline-none shadow-sm uppercase"
          >
            <option value="recent">RECIENTES ✨</option>
            <option value="priceLow">MENOR PRECIO ⬇️</option>
            <option value="priceHigh">MAYOR PRECIO ⬆️</option>
            <option value="name">A-Z 📝</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 py-2 border-y border-gray-50">
        <div className="flex gap-3">
          <button onClick={() => navigate('/catalog')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${category === 'Catalog' ? 'bg-[#f6a118] text-white border-[#f6a118]' : 'bg-white text-gray-400 border-gray-100'}`}>🌈 TODOS</button>
          {categoryList.map(item => (
            <button key={item.cat} onClick={() => navigate(item.route)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${category === item.cat ? 'bg-[#f6a118] text-white border-[#f6a118]' : 'bg-white text-gray-400 border-gray-100'}`}>{item.icon} {item.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {sortedAndFilteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sortedAndFilteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl font-matita italic text-gray-300 uppercase">Sin resultados... 🔎</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
