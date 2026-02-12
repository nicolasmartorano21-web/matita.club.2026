
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

  // Bloqueo de scroll seguro
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, [showModal]);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
    }
  };

  return (
    <>
      {/* CARD DEL CATÁLOGO - Diseño Limpio */}
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-white hover:border-[#fadb31] flex flex-col h-full relative"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md active:scale-90 border border-gray-100 transition-all hover:bg-white"
        >
          <svg className={`w-6 h-6 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="relative aspect-[4/5] bg-white flex items-center justify-center overflow-hidden p-4">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
            alt={product.name}
            loading="lazy"
          />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-900 text-white text-[11px] px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] shadow-xl">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="p-6 flex flex-col flex-grow bg-white">
          <p className="text-[11px] text-[#f6a118] font-bold uppercase tracking-[0.2em] mb-2">{product.category}</p>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight mb-3 uppercase tracking-tighter">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-2xl font-bold text-gray-900">${(product.price || 0).toLocaleString()}</span>
            <div className="w-10 h-10 rounded-full bg-[#fef9eb] text-[#f6a118] flex items-center justify-center border-2 border-[#fadb31]/30 group-hover:bg-[#f6a118] group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3}/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ULTRA PREMIUM */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />

          <div 
            className="bg-[#fdfaf6] w-full h-[95%] md:h-auto md:max-h-[90vh] md:max-w-6xl md:rounded-[4rem] rounded-t-[3rem] shadow-2xl relative flex flex-col overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar Flotante */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 z-[100] w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-90 border-2 border-gray-100 hover:bg-red-50 group transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3.5}/></svg>
            </button>

            {/* CONTENIDO PRINCIPAL SCROLLABLE */}
            <div className="flex-grow overflow-y-auto overscroll-contain pb-32 md:pb-0 scrollbar-hide">
              <div className="flex flex-col md:flex-row">
                
                {/* GALERÍA DE IMÁGENES */}
                <div className="w-full md:w-1/2 bg-white flex flex-col shrink-0">
                  <div className="w-full aspect-square flex items-center justify-center p-8 md:p-16">
                    <img 
                      key={activeImage}
                      src={getImgUrl(productImages[activeImage], 1000)} 
                      className="max-w-full max-h-full object-contain drop-shadow-2xl animate-fadeIn" 
                      alt={product.name} 
                    />
                  </div>
                  
                  {productImages.length > 1 && (
                    <div className="flex gap-4 px-8 pb-10 overflow-x-auto scrollbar-hide justify-center">
                      {productImages.map((img, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImage(i)} 
                          className={`w-16 h-16 rounded-2xl border-4 transition-all shrink-0 ${
                            activeImage === i ? 'border-[#fadb31] scale-105 shadow-md' : 'border-transparent opacity-40 grayscale hover:grayscale-0'
                          }`}
                        >
                          <img src={getImgUrl(img, 200)} className="w-full h-full object-cover rounded-xl" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* INFORMACIÓN DEL PRODUCTO */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col">
                  <p className="text-[#ea7e9c] font-bold text-xs uppercase tracking-[0.4em] mb-3">{product.category}</p>
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-800 leading-none mb-8 uppercase tracking-tighter">
                    {product.name}
                  </h2>
                  
                  <div className="bg-white/90 p-8 rounded-[3rem] border-2 border-white shadow-sm mb-12 relative">
                    <div className="absolute -top-4 -left-2 text-4xl">✨</div>
                    <p className="text-xl text-gray-500 italic font-matita leading-relaxed">
                      "{product.description || 'Una joyita elegida por Matita para acompañarte en todos tus momentos creativos.'}"
                    </p>
                  </div>

                  {/* VARIANTES / COLORES */}
                  <div className="space-y-6 mb-8 md:mb-16">
                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest ml-4 flex items-center gap-2">
                       <span className="w-2 h-2 bg-[#fadb31] rounded-full"></span> Opciones Disponibles
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {(product.colors || []).map(c => (
                        <button 
                          key={c.color} 
                          onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                          className={`relative p-5 rounded-[2rem] border-4 transition-all flex flex-col items-center justify-center gap-1 ${
                            c.stock <= 0 
                              ? 'bg-gray-100 text-gray-200 border-transparent cursor-not-allowed opacity-50' 
                              : selectedColor === c.color 
                                ? 'bg-white border-[#fadb31] shadow-lg scale-[1.03]' 
                                : 'bg-white border-white hover:border-gray-50'
                          }`}
                        >
                          <span className={`text-lg font-bold uppercase tracking-tighter ${selectedColor === c.color ? 'text-gray-900' : 'text-gray-400'}`}>{c.color}</span>
                          <span className="text-[10px] font-bold opacity-30 uppercase">Disponibles: {c.stock}</span>
                          {selectedColor === c.color && (
                            <div className="absolute top-2 right-2 w-7 h-7 bg-[#fadb31] rounded-full flex items-center justify-center text-gray-900 text-[12px] shadow-sm">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PIE DE PÁGINA: DISEÑO REDEFINIDO (MÁS ESPACIO, MÁS CLARIDAD) */}
            <div className="md:relative fixed bottom-0 left-0 w-full p-6 md:p-12 bg-white border-t-2 border-gray-50 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] z-[200]">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                
                <div className="flex justify-between items-center w-full md:w-auto md:gap-20">
                  <div className="flex flex-col">
                    <span className="text-5xl md:text-8xl font-bold text-gray-900 leading-none tracking-tighter">
                      ${(product.price || 0).toLocaleString()}
                    </span>
                    <p className="text-[12px] text-[#ea7e9c] font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                      ✨ Sumás {product.points || 0} Matita Puntos
                    </p>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-1">Tu Elección</p>
                    <p className="text-3xl font-bold text-[#f6a118] uppercase tracking-tighter">{selectedColor || '---'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`w-full md:flex-grow py-7 md:py-10 rounded-full text-2xl md:text-4xl font-bold shadow-2xl active:scale-95 transition-all uppercase tracking-tighter border-4 border-white flex items-center justify-center gap-4 ${
                    currentStock <= 0 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'matita-gradient-orange text-white hover:brightness-105'
                  }`}
                >
                  {currentStock <= 0 ? '¡Volvemos Pronto! 😿' : (
                    <>
                      <span>Llevar a Casa</span>
                      <span className="text-4xl">🛍️</span>
                    </>
                  )}
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
