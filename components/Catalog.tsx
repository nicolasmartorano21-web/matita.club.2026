import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product, Category } from '../types';
import { useApp } from '../App';

interface CatalogProps {
  category: Category | 'Catalog' | 'Favorites';
}

const Catalog: React.FC<CatalogProps> = ({ category }) => {
  const { favorites, supabase } = useApp();
  const navigate = useNavigate();
  
  // CARGA INTELIGENTE CON CACHÉ
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('matita_products_cache');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'priceLow' | 'priceHigh' | 'name'>('recent');
  const [loading, setLoading] = useState(products.length === 0);

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
          name: p.name,
          description: p.description,
          price: p.price,
          oldPrice: p.old_price,
          points: p.points,
          category: p.category,
          images: p.images || [],
          colors: p.colors || []
        }));
        setProducts(mapped);
        localStorage.setItem('matita_products_cache', JSON.stringify(mapped));
      }
    } catch (err: any) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel('catalog_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const normalize = (s: string | null | undefined) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (category === 'Favorites') return matchesSearch && favorites.includes(p.id);
      if (category === 'Catalog') return matchesSearch;
      if (category === 'Ofertas') return matchesSearch && ((p.oldPrice && p.oldPrice > 0) || p.category === 'Ofertas');
      return matchesSearch && normalize(p.category) === normalize(category);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [category, searchTerm, favorites, products, sortBy]);

  const categoryList = [
    { label: 'ESCOLAR', cat: 'Escolar', icon: '✏️', route: '/escolar' },
    { label: 'OFICINA', cat: 'Oficina', icon: '💼', route: '/oficina' },
    { label: 'TECNOLOGIA', cat: 'Tecnología', icon: '🎧', route: '/tecnologia' },
    { label: 'NOVEDADES', cat: 'Novedades', icon: '✨', route: '/novedades' },
    { label: 'OTROS', cat: 'Otros', icon: '🎁', route: '/otros' },
    { label: 'OFERTAS', cat: 'Ofertas', icon: '🏷️', route: '/ofertas' }
  ];

  const getSectionTitle = () => {
    if (category === 'Catalog') return 'Explorar';
    if (category === 'Favorites') return 'Favoritos';
    return category.toUpperCase();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-[#f6a118] rounded-full animate-spin"></div>
      <p className="text-[#f6a118] font-bold text-sm uppercase tracking-widest animate-pulse">Abriendo el mundo matita...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto px-1">
      {/* HEADER INTERMEDIO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <h2 className="text-4xl md:text-6xl font-matita font-bold text-[#f6a118] uppercase tracking-tighter">
          {getSectionTitle()}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:max-w-2xl">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="BUSCAR TESOROS... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-3.5 rounded-full border-2 border-[#fadb31]/20 text-base font-matita shadow-sm focus:border-[#fadb31] outline-none transition-all placeholder:text-gray-300 bg-white uppercase"
            />
          </div>
          <div className="relative shrink-0">
             <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full px-8 py-3.5 pr-12 rounded-full border-2 border-[#fadb31]/20 text-sm font-bold text-gray-500 bg-white outline-none cursor-pointer hover:border-[#fadb31] transition-colors shadow-sm uppercase"
            >
              <option value="recent">RECIENTES</option>
              <option value="priceLow">MENOR PRECIO</option>
              <option value="priceHigh">MAYOR PRECIO</option>
              <option value="name">NOMBRE A-Z</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#f6a118]">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3}/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORÍAS TIPO BURBUJA */}
      <div className="w-full relative py-2 border-y border-[#fadb31]/10 bg-white/40">
        <div className="flex overflow-x-auto gap-3 py-3 px-1 scrollbar-hide snap-x items-center whitespace-nowrap">
           <button 
             onClick={() => navigate('/catalog')}
             className={`px-6 py-2 rounded-full text-xs font-bold transition-all border uppercase flex items-center gap-2 ${
               category === 'Catalog' 
               ? 'bg-[#f6a118] text-white border-[#f6a118] shadow-md scale-105' 
               : 'bg-white text-gray-400 border-gray-100 hover:border-[#fadb31]'
             }`}
           >
             🌈 TODOS
           </button>

           {categoryList.map(item => (
             <button 
               key={item.cat}
               onClick={() => navigate(item.route)}
               className={`px-6 py-2 rounded-full text-xs font-bold transition-all border uppercase flex items-center gap-2 ${
                 category === item.cat 
                 ? 'bg-[#f6a118] text-white border-[#f6a118] shadow-md scale-105' 
                 : 'bg-white text-gray-400 border-gray-100 hover:border-[#fadb31]'
               }`}
             >
               <span>{item.icon}</span> {item.label}
             </button>
           ))}
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
        {sortedAndFilteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* NO RESULTS */}
      {sortedAndFilteredProducts.length === 0 && (
        <div className="text-center py-24 flex flex-col items-center animate-fadeIn opacity-50">
          <div className="text-5xl mb-4">🔎</div>
          <p className="text-xl font-matita text-gray-300 italic px-6 uppercase tracking-tighter">Sin tesoros para esta búsqueda</p>
          <button 
            onClick={() => {setSearchTerm(''); setSortBy('recent')}} 
            className="mt-8 px-10 py-3 bg-[#fadb31] text-white rounded-full text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all uppercase"
          >
            Limpiar filtros ✨
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
