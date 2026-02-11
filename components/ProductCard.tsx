
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string, w = 400) => {
  if (!id) return "https://via.placeholder.com/400x400?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  // Optimizamos calidad para móviles (q_auto:eco es más rápido que good)
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto:eco,f_auto,w_${w}/${id}`;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, favorites, toggleFavorite } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);

  const isFavorite = (favorites || []).includes(product.id);
  const currentStock = useMemo(() => 
    (product.colors || []).find(c => c.color === selectedColor)?.stock || 0
  , [selectedColor, product.colors]);
  
  const isGlobalOutOfStock = (product.colors || []).every(c => c.stock <= 0);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#fadb31] flex flex-col h-full relative"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-90"
        >
          <svg className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="relative aspect-square bg-[#fdfaf6] flex items-center justify-center p-2 md:p-4">
          <img 
            src={getImgUrl(product.images?.[0], 350)} 
            className="w-full h-full object-contain transition-transform group-hover:scale-105" 
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-800/80 text-white text-[9px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="p-3 md:p-6 flex flex-col flex-grow bg-white">
          <p className="text-[7px] md:text-[10px] text-[#f6a118] font-bold uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-xs md:text-xl font-bold text-gray-800 line-clamp-2 leading-tight mb-2 uppercase">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-base md:text-2xl font-bold text-gray-800">${(product.price || 0).toLocaleString()}</span>
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#fef9eb] text-[#fadb31] flex items-center justify-center border-2 border-[#fadb31]/30">
              <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3}/></svg>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fdfaf6] w-full max-w-4xl max-h-[90vh] rounded-t-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
            
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border-2 border-gray-100">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
            </button>

            <div className="md:w-1/2 p-6 md:p-12 bg-white flex flex-col items-center">
              <div className="w-full aspect-square bg-[#fdfaf6] rounded-[2rem] p-4 flex items-center justify-center overflow-hidden border-2 border-gray-50 mb-6">
                <img src={getImgUrl(product.images?.[activeImage], 700)} className="max-w-full max-h-full object-contain" alt={product.name} />
              </div>
              <div className="flex gap-2 mb-6">
                {(product.images || []).map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-3 h-3 rounded-full transition-all ${activeImage === i ? 'bg-[#f6a118] w-8' : 'bg-gray-200'}`} />
                ))}
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-5 rounded-[2.5rem] text-xl font-bold shadow-xl active:scale-95 flex items-center justify-center gap-2 transition-all ${currentStock <= 0 ? 'bg-gray-100 text-gray-300' : 'matita-gradient-pink text-white hover:scale-[1.02]'}`}
              >
                {currentStock <= 0 ? 'Sin Stock' : 'Añadir al Carrito ✨'}
              </button>
            </div>

            <div className="md:w-1/2 p-6 md:p-12 flex flex-col overflow-y-auto scrollbar-hide bg-[#fdfaf6]">
              <div className="mb-8">
                 <p className="text-[#ea7e9c] font-bold text-xs uppercase tracking-widest mb-1">{product.category}</p>
                 <h2 className="text-3xl font-bold text-gray-800 leading-tight mb-4 uppercase">{product.name}</h2>
                 <p className="text-lg text-gray-500 italic leading-relaxed">"{product.description || 'Una joyita seleccionada por Matita.'}"</p>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Elige tu preferido:</p>
                <div className="grid grid-cols-2 gap-3">
                  {(product.colors || []).map(c => (
                    <button 
                      key={c.color} 
                      onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                        c.stock <= 0 
                          ? 'bg-gray-50 text-gray-300 border-gray-100 opacity-50' 
                          : selectedColor === c.color 
                            ? 'bg-white border-[#f6a118] shadow-md' 
                            : 'bg-white border-transparent'
                      }`}
                    >
                      {selectedColor === c.color && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-[#f6a118] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      )}
                      <span className={`text-base font-bold ${selectedColor === c.color ? 'text-[#f6a118]' : 'text-gray-600'}`}>{c.color}</span>
                      <span className="text-[10px] font-bold uppercase opacity-30">Stock: {c.stock}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-200 flex justify-between items-end">
                <div>
                  <span className="text-4xl font-bold text-gray-800 leading-none">${(product.price || 0).toLocaleString()}</span>
                  <p className="text-xs text-[#ea7e9c] font-bold mt-2">+ {product.points || 0} pts ✨</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Elegido</p>
                  <p className="text-xl font-bold text-gray-800">{selectedColor || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;

