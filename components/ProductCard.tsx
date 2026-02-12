
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string | undefined, w = 400) => {
  if (!id || typeof id !== 'string') return "https://via.placeholder.com/600x600?text=Sin+Imagen";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
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
      setActiveImage(0);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showModal]);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
    }
  };

  return (
    <>
      {/* CARD PRINCIPAL - VISTA DE CUADRÍCULA */}
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#fadb31] flex flex-col h-full relative"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-10 w-9 h-9 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 border border-gray-100"
        >
          <svg className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
            alt={product.name}
            loading="lazy"
          />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-900 text-white text-[10px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <p className="text-[10px] md:text-xs text-[#f6a118] font-bold uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-sm md:text-xl font-bold text-gray-800 line-clamp-2 leading-tight mb-2 uppercase tracking-tighter">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-base md:text-2xl font-bold text-gray-800">${(product.price || 0).toLocaleString()}</span>
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#fef9eb] text-[#f6a118] flex items-center justify-center border-2 border-[#fadb31]/30">
              <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3.5}/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL - REDISEÑO TOTAL PARA MÓVIL (BOTTOM SHEET) */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div 
            className="bg-[#fdfaf6] w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-[3rem] md:rounded-[3.5rem] shadow-2xl relative flex flex-col overflow-hidden transition-transform animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* BOTÓN CERRAR - SIEMPRE VISIBLE */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 z-[1050] w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl active:scale-90 border-2 border-gray-100"
            >
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3.5}/></svg>
            </button>

            {/* CONTENIDO SCROLLABLE */}
            <div className="flex-grow overflow-y-auto scrollbar-hide">
              <div className="flex flex-col md:flex-row">
                
                {/* ÁREA DE IMAGEN - SECCIÓN SUPERIOR EN MÓVIL */}
                <div className="w-full md:w-1/2 bg-white shrink-0">
                  <div className="w-full aspect-square flex items-center justify-center p-6 md:p-12 relative bg-white">
                    <img 
                      key={activeImage}
                      src={getImgUrl(productImages[activeImage], 800)} 
                      className="w-full h-full object-contain animate-fadeIn drop-shadow-xl" 
                      alt={product.name} 
                    />
                  </div>
                  
                  {/* GALERÍA DE MINIATURAS */}
                  {productImages.length > 1 && (
                    <div className="w-full flex justify-center gap-3 p-4 bg-white overflow-x-auto scrollbar-hide">
                      {productImages.map((img, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImage(i)} 
                          className={`w-14 h-14 rounded-xl border-4 transition-all shrink-0 shadow-sm ${
                            activeImage === i ? 'border-[#f6a118] scale-105' : 'border-gray-50 opacity-60'
                          }`}
                        >
                          <img src={getImgUrl(img, 150)} className="w-full h-full object-cover rounded-lg" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* INFO DEL PRODUCTO */}
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col bg-[#fdfaf6]">
                  <div className="mb-6">
                     <p className="text-[#ea7e9c] font-bold text-xs uppercase tracking-[0.2em] mb-1">{product.category}</p>
                     <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-4 uppercase tracking-tighter">{product.name}</h2>
                     <div className="bg-white/80 p-5 rounded-[1.5rem] border-2 border-white shadow-sm mb-6">
                       <p className="text-base text-gray-500 italic leading-relaxed font-matita">
                         {product.description || 'Una joyita elegida por Matita con todo el amor del mundo.'}
                       </p>
                     </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Seleccioná tu favorito:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(product.colors || []).map(c => (
                        <button 
                          key={c.color} 
                          onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                          className={`relative p-4 rounded-[1.8rem] border-4 transition-all flex flex-col items-center justify-center text-center ${
                            c.stock <= 0 
                              ? 'bg-gray-100 text-gray-300 border-transparent opacity-40 cursor-not-allowed' 
                              : selectedColor === c.color 
                                ? 'bg-white border-[#f6a118] shadow-md scale-[1.02]' 
                                : 'bg-white border-white hover:border-gray-50 shadow-sm'
                          }`}
                        >
                          <span className={`text-base font-bold uppercase tracking-tighter ${selectedColor === c.color ? 'text-[#f6a118]' : 'text-gray-700'}`}>{c.color}</span>
                          <span className="text-[10px] font-bold opacity-30 uppercase">Stock: {c.stock}</span>
                          {selectedColor === c.color && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#f6a118] rounded-full flex items-center justify-center text-white text-[11px] shadow-sm">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* ESPACIADOR FINAL PARA MÓVIL (Para no tapar con el footer) */}
                  <div className="h-32 md:hidden"></div>
                </div>
              </div>
            </div>

            {/* PIE DE PÁGINA FIJO - SIEMPRE VISIBLE ABAJO */}
            <div className="shrink-0 w-full p-6 md:p-10 bg-white border-t-2 border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-[1040]">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex justify-between items-center w-full md:w-auto md:gap-12">
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-6xl font-bold text-gray-900 leading-none tracking-tighter">${(product.price || 0).toLocaleString()}</span>
                    <p className="text-[11px] text-[#ea7e9c] font-bold mt-1 uppercase tracking-widest">✨ Sumás {product.points || 0} puntos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-1">Elegido</p>
                    <p className="text-xl font-bold text-[#f6a118] uppercase truncate max-w-[120px]">{selectedColor || '---'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`w-full md:flex-grow py-5 md:py-6 rounded-full text-xl md:text-3xl font-bold shadow-2xl active:scale-95 transition-all uppercase tracking-tighter border-4 border-white ${
                    currentStock <= 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'matita-gradient-orange text-white hover:brightness-105'
                  }`}
                >
                  {currentStock <= 0 ? '¡Se agotó! 😿' : 'Añadir al Carrito 🛍️'}
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
