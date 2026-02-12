import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string | undefined, w = 800) => {
  if (!id || typeof id !== 'string') return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto:best,f_auto,w_${w}/${id}`;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, favorites, toggleFavorite } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);

  const productImages = useMemo(() => 
    (product.images || []).filter(img => img && typeof img === 'string' && img.trim() !== '')
  , [product.images]);

  const isFavorite = (favorites || []).includes(product.id);
  
  const currentStock = useMemo(() => 
    (product.colors || []).find(c => c.color === selectedColor)?.stock || 0
  , [selectedColor, product.colors]);
  
  const isGlobalOutOfStock = (product.colors || []).every(c => c.stock <= 0);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
    }
  };

  return (
    <>
      {/* CARD VISTA PREVIA */}
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#fadb31] flex flex-col h-full relative"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-2 right-2 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md active:scale-90 border border-gray-100"
        >
          <svg className={`w-5 h-5 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden p-3">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
            alt={product.name}
          />
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-[9px] text-[#f6a118] font-bold uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-2 uppercase tracking-tighter">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-lg font-bold text-gray-900">${(product.price || 0).toLocaleString()}</span>
            <div className="w-8 h-8 rounded-full bg-[#fef9eb] text-[#f6a118] flex items-center justify-center border-2 border-[#fadb31]/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3.5}/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL RECONSTRUIDO DESDE CERO */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4">
          
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />

          <div 
            className="bg-[#fdfaf6] w-full h-[92vh] md:h-auto md:max-h-[90vh] md:max-w-5xl md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. HEADER FIJO */}
            <div className="w-full flex justify-end p-4 md:p-6 shrink-0 z-[100]">
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 border-2 border-gray-100"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3.5}/></svg>
              </button>
            </div>

            {/* 2. CUERPO CON SCROLL REAL */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-10 scrollbar-hide">
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* IMAGEN */}
                <div className="w-full md:w-1/2 flex flex-col items-center">
                  <div className="w-full aspect-square bg-white rounded-[2rem] p-4 flex items-center justify-center shadow-inner">
                    <img 
                      src={getImgUrl(productImages[activeImage], 1000)} 
                      className="max-w-full max-h-full object-contain drop-shadow-xl" 
                      alt={product.name} 
                    />
                  </div>
                  {productImages.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 w-full justify-center">
                      {productImages.map((img, i) => (
                        <button key={i} onClick={() => setActiveImage(i)} className={`w-14 h-14 rounded-xl border-4 shrink-0 ${activeImage === i ? 'border-[#fadb31]' : 'border-white'}`}>
                          <img src={getImgUrl(img, 200)} className="w-full h-full object-cover rounded-lg" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* TEXTOS */}
                <div className="w-full md:w-1/2">
                  <p className="text-[#ea7e9c] font-bold text-[10px] uppercase tracking-[0.3em] mb-2">{product.category}</p>
                  <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-4 uppercase tracking-tighter">{product.name}</h2>
                  
                  <div className="bg-white/80 p-6 rounded-[2rem] border-2 border-white mb-6">
                    <p className="text-base md:text-lg text-gray-500 italic font-matita">"{product.description}"</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Elige tu favorito:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(product.colors || []).map(c => (
                        <button 
                          key={c.color} 
                          onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                          className={`p-3 rounded-2xl border-2 transition-all ${c.stock <= 0 ? 'opacity-30' : selectedColor === c.color ? 'bg-white border-[#fadb31] shadow-md' : 'bg-white border-transparent'}`}
                        >
                          <span className="block text-sm font-bold uppercase">{c.color}</span>
                          <span className="text-[8px] opacity-40 uppercase">Stock: {c.stock}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FOOTER FIJO ABAJO */}
            <div className="w-full p-4 md:p-8 bg-white border-t-2 border-gray-50 shrink-0 z-[100]">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
                <div className="flex justify-between items-center w-full md:w-auto md:gap-8">
                  <div className="flex flex-col">
                    <span className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tighter">${(product.price || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-[#ea7e9c] font-bold uppercase tracking-widest">✨ +{product.points} Puntos</span>
                  </div>
                  <div className="text-right border-l-2 border-gray-100 pl-4">
                    <p className="text-[10px] text-gray-300 font-bold uppercase">Color</p>
                    <p className="text-lg font-bold text-[#f6a118] uppercase">{selectedColor || '---'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`w-full md:flex-grow py-4 md:py-6 rounded-full text-xl font-bold shadow-xl transition-all uppercase tracking-tighter border-4 border-white ${currentStock <= 0 ? 'bg-gray-100 text-gray-300' : 'matita-gradient-orange text-white'}`}
                >
                  {currentStock <= 0 ? 'Sin Stock' : 'Llevar a Casa 🛍️'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
