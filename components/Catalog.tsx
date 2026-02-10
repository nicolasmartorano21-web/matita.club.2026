
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
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'priceLow' | 'priceHigh' | 'name'>('recent');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          oldPrice: p.old_price,
          points: p.points,
          category: p.category,
          images: p.images || [],
          colors: p.colors || []
        })));
      }
    } catch (err: any) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [supabase]);

  const normalize = (s: string | null | undefined) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      
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
      if (sortBy === 'name') return a.name.localeCompare(b.name);
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

  const getSectionTitle = () => {
    if (category === 'Catalog') return 'EXPLORAR';
    if (category === 'Favorites') return 'FAVORITOS';
    if (normalize(category) === "otros") return 'OTROS';
    return category.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-transparent border-t-[#f6a118] rounded-full animate-spin"></div>
        </div>
        <p className="text-[#f6a118] font-bold animate-pulse text-3xl text-center px-6 uppercase tracking-tighter">ABRIENDO EL MUNDO MATITA... ✨</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn pb-24 mt-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <h2 className="text-6xl md:text-8xl font-matita font-bold text-[#f6a118] drop-shadow-sm uppercase tracking-tighter">
          {getSectionTitle()}
        </h2>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="BUSCAR TESOROS... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-8 py-5 rounded-[2rem] border-4 border-[#fadb31]/30 text-xl font-matita shadow-lg focus:border-[#fadb31] focus:ring-[15px] focus:ring-[#fadb31]/5 outline-none transition-all placeholder:text-gray-300 bg-white uppercase"
            />
          </div>
          <div className="relative shrink-0">
             <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full px-8 py-5 pr-12 rounded-[2rem] border-4 border-[#fadb31]/30 text-lg font-bold text-gray-400 bg-white outline-none cursor-pointer hover:border-[#fadb31] transition-colors shadow-lg uppercase"
            >
              <option value="recent">RECIENTES ✨</option>
              <option value="priceLow">MENOR PRECIO ⬇️</option>
              <option value="priceHigh">MAYOR PRECIO ⬆️</option>
              <option value="name">NOMBRE A-Z 📝</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#f6a118]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3}/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative py-2 border-y-2 border-[#fadb31]/10">
        <div className="flex overflow-x-auto gap-4 py-4 px-2 scrollbar-hide snap-x items-center -mx-4">
           <button 
             onClick={() => navigate('/catalog')}
             className={`snap-start px-8 py-3 rounded-full text-xl font-bold transition-all whitespace-nowrap border-2 flex items-center gap-3 uppercase ${
               category === 'Catalog' 
               ? 'bg-[#f6a118] text-white border-[#f6a118] shadow-lg scale-105' 
               : 'bg-white text-gray-400 border-gray-100 hover:border-[#fadb31]'
             }`}
           >
             <span className="text-2xl">🌈</span> TODOS
           </button>

           {categoryList.map(item => (
             <button 
               key={item.cat}
               onClick={() => navigate(item.route)}
               className={`snap-start px-8 py-3 rounded-full text-xl font-bold transition-all whitespace-nowrap border-2 flex items-center gap-3 uppercase ${
                 category === item.cat 
                 ? 'bg-[#f6a118] text-white border-[#f6a118] shadow-lg scale-105' 
                 : 'bg-white text-gray-400 border-gray-100 hover:border-[#fadb31]'
               }`}
             >
               <span className="text-2xl">{item.icon}</span> {item.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-16">
        {sortedAndFilteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sortedAndFilteredProducts.length === 0 && (
        <div className="text-center py-40 flex flex-col items-center animate-fadeIn">
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-7xl shadow-inner border-4 border-gray-50 mb-8 opacity-40">🔎</div>
          <p className="text-3xl font-matita text-gray-300 italic px-6 uppercase tracking-tighter">"NO ENCONTRAMOS RESULTADOS PARA ESTA BÚSQUEDA."</p>
          <button 
            onClick={() => {setSearchTerm(''); setSortBy('recent')}} 
            className="mt-8 px-12 py-4 bg-[#fadb31] text-white rounded-full text-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all uppercase"
          >
            LIMPIAR FILTROS ✨
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;

