
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string | undefined, w = 400) => {
  if (!id || typeof id !== 'string') return "https://via.placeholder.com/600x600?text=Sin+Imagen";
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
      setActiveImage(0);
      document.body.style.overflow = 'hidden';
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
      {/* CARD PRINCIPAL - CATÁLOGO */}
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#fadb31] flex flex-col h-full relative"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-10 w-9 h-9 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-90 border border-gray-100"
        >
          <svg className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-3 md:p-6 overflow-hidden">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
            alt={product.name}
            loading="lazy"
          />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-900 text-white text-[10px] md:text-sm px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-2xl">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="p-4 md:p-8 flex flex-col flex-grow bg-white">
          <p className="text-[10px] md:text-xs text-[#f6a118] font-bold uppercase tracking-[0.2em] mb-1.5">{product.category}</p>
          <h3 className="text-sm md:text-2xl font-bold text-gray-800 line-clamp-2 leading-tight mb-3 uppercase tracking-tighter">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-dashed border-gray-50">
            <span className="text-lg md:text-3xl font-bold text-gray-900">${(product.price || 0).toLocaleString()}</span>
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#fef9eb] text-[#f6a118] flex items-center justify-center border-2 border-[#fadb31]/30 transition-transform group-hover:scale-110 shadow-sm">
              <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3.5}/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / BOTTOM SHEET - ARREGLO DE BUG VISUAL */}
      {showModal && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-0 md:p-6 overflow-hidden">
          
          <div 
            className="bg-white w-full max-w-5xl h-[94vh] md:h-auto md:max-h-[90vh] rounded-t-[3rem] md:rounded-[4rem] shadow-2xl relative flex flex-col md:flex-row transition-all duration-500 transform translate-y-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* BOTÓN CERRAR SUPERIOR - Siempre visible */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 z-[550] w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all border-2 border-gray-100 md:hidden"
            >
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3.5}/></svg>
            </button>

            {/* SECCIÓN IZQUIERDA: IMAGEN (Fijo en desktop, scrollable arriba en móvil) */}
            <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-6 md:p-12 border-b md:border-b-0 md:border-r-2 border-gray-50 shrink-0 relative">
               {/* BOTÓN CERRAR DESKTOP */}
               <button 
                onClick={() => setShowModal(false)} 
                className="absolute top-6 left-6 z-[550] w-12 h-12 bg-gray-50 rounded-full hidden md:flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
               >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
               </button>

              <div className="w-full aspect-square md:max-w-md flex items-center justify-center overflow-hidden bg-gray-50 rounded-[2.5rem] p-4 shadow-inner">
                <img 
                  key={activeImage}
                  src={getImgUrl(productImages[activeImage], 800)} 
                  className="max-w-full max-h-full object-contain animate-fadeIn drop-shadow-2xl" 
                  alt={product.name} 
                />
              </div>
              
              {productImages.length > 1 && (
                <div className="flex gap-3 mt-6 overflow-x-auto py-2 px-2 scrollbar-hide max-w-full">
                  {productImages.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)} 
                      className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl border-4 transition-all overflow-hidden shrink-0 shadow-sm ${
                        activeImage === i ? 'border-[#f6a118] scale-105 shadow-md' : 'border-white opacity-40 grayscale hover:grayscale-0'
                      }`}
                    >
                      <img src={getImgUrl(img, 200)} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN DERECHA: INFO Y COMPRA (Scroll independiente) */}
            <div className="flex-grow flex flex-col bg-[#fdfaf6] overflow-hidden">
              
              {/* Contenido Scrollable */}
              <div className="flex-grow overflow-y-auto p-6 md:p-14 scrollbar-hide">
                <div className="mb-10">
                   <p className="text-[#ea7e9c] font-bold text-xs uppercase tracking-[0.4em] mb-2 bg-pink-50 inline-block px-4 py-1 rounded-full">{product.category}</p>
                   <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-[0.9] mb-6 uppercase tracking-tighter">{product.name}</h2>
                   <div className="bg-white p-6 rounded-[2rem] border-2 border-white shadow-sm italic text-lg md:text-xl text-gray-500 leading-relaxed font-matita">
                     "{product.description || 'Una pieza mágica elegida cuidadosamente para tu colección de Matita.'}"
                   </div>
                </div>

                <div className="mb-8">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#fadb31] rounded-full"></span> Seleccioná una opción:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(product.colors || []).map(c => (
                      <button 
                        key={c.color} 
                        onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                        className={`relative p-4 rounded-[1.8rem] border-4 transition-all flex flex-col items-center justify-center gap-1 overflow-hidden ${
                          c.stock <= 0 
                            ? 'bg-gray-100 text-gray-300 border-transparent opacity-50 cursor-not-allowed' 
                            : selectedColor === c.color 
                              ? 'bg-white border-[#f6a118] shadow-md scale-[1.02]' 
                              : 'bg-white border-transparent hover:border-gray-100 shadow-sm'
                        }`}
                      >
                        <span className={`text-base md:text-lg font-bold uppercase tracking-tighter ${selectedColor === c.color ? 'text-[#f6a118]' : 'text-gray-700'}`}>{c.color}</span>
                        <span className="text-[10px] font-bold opacity-30 uppercase">Stock: {c.stock}</span>
                        {selectedColor === c.color && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#f6a118] rounded-full flex items-center justify-center text-white text-[11px] shadow-sm animate-fadeIn">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PIE DE PÁGINA FIJO (Compra) - FIX BUG MÓVIL */}
              <div className="p-8 md:p-14 bg-white border-t-4 border-[#fadb31]/10 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <span className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tighter leading-none">${(product.price || 0).toLocaleString()}</span>
                    <p className="text-[11px] text-[#ea7e9c] font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                      <span className="animate-pulse">✨</span> Ganás {product.points || 0} puntos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-1">Color Activo</p>
                    <p className="text-xl md:text-2xl font-bold text-[#f6a118] uppercase tracking-tighter">{selectedColor || '---'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`w-full py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center gap-3 border-4 border-white ${
                    currentStock <= 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'matita-gradient-orange text-white hover:brightness-110 active:brightness-90'
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

