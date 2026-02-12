
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string | undefined, w = 600) => {
  if (!id || typeof id !== 'string') return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  // Forzamos formato y calidad para móviles
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

  const productImages = useMemo(() => 
    (product.images || []).filter(img => img && typeof img === 'string' && img.trim() !== '')
  , [product.images]);

  const isFavorite = (favorites || []).includes(product.id);
  
  const currentStock = useMemo(() => 
    (product.colors || []).find(c => c.color === selectedColor)?.stock || 0
  , [selectedColor, product.colors]);
  
  const isGlobalOutOfStock = (product.colors || []).every(c => c.stock <= 0);

  // Manejo de scroll sin romper el renderizado móvil
  useEffect(() => {
    if (showModal) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
    }
  };

  return (
    <>
      {/* VISTA PREVIA (CARD) */}
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

        <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain" 
            alt={product.name}
            loading="lazy"
          />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-900 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-[10px] text-[#f6a118] font-bold uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-2 uppercase tracking-tighter">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-base font-bold text-gray-800">${(product.price || 0).toLocaleString()}</span>
            <div className="w-8 h-8 rounded-full bg-[#fef9eb] text-[#f6a118] flex items-center justify-center border-2 border-[#fadb31]/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3.5}/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / OVERLAY COMPLETO */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn p-0 md:p-6">
          
          {/* Botón Cerrar Flotante Fuera del Contenedor en Móvil */}
          <button 
            onClick={() => setShowModal(false)} 
            className="fixed top-4 right-4 z-[10001] w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90"
          >
            <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
          </button>

          {/* CUERPO DEL MODAL */}
          <div 
            className="bg-[#fdfaf6] w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl md:rounded-[4rem] shadow-2xl relative flex flex-col overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Contenedor con Scroll */}
            <div className="flex-grow overflow-y-auto scrollbar-hide">
              <div className="flex flex-col md:flex-row min-h-full">
                
                {/* SECCIÓN IMAGEN: Garantiza visibilidad */}
                <div className="w-full md:w-1/2 bg-white shrink-0">
                  <div className="w-full min-h-[350px] md:h-full aspect-square flex items-center justify-center p-6 md:p-12">
                    <img 
                      key={activeImage}
                      src={getImgUrl(productImages[activeImage], 800)} 
                      className="w-full h-full object-contain drop-shadow-2xl animate-fadeIn" 
                      alt={product.name} 
                    />
                  </div>
                  
                  {/* Galerilla */}
                  {productImages.length > 1 && (
                    <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide bg-white justify-center">
                      {productImages.map((img, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImage(i)} 
                          className={`w-14 h-14 rounded-2xl border-4 transition-all shrink-0 ${
                            activeImage === i ? 'border-[#f6a118] scale-105' : 'border-gray-50 opacity-40'
                          }`}
                        >
                          <img src={getImgUrl(img, 150)} className="w-full h-full object-cover rounded-xl" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECCIÓN INFO */}
                <div className="w-full md:w-1/2 p-6 md:p-14 flex flex-col">
                  <p className="text-[#ea7e9c] font-bold text-xs uppercase tracking-widest mb-2">{product.category}</p>
                  <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-6 uppercase tracking-tighter">{product.name}</h2>
                  
                  <div className="bg-white/80 p-6 rounded-[2rem] border-2 border-white shadow-sm mb-8">
                    <p className="text-lg text-gray-500 italic font-matita leading-relaxed">
                      "{product.description || 'Una joyita seleccionada con amor para tu colección de Matita.'}"
                    </p>
                  </div>

                  {/* Variantes */}
                  <div className="space-y-4 mb-32 md:mb-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Seleccioná color/modelo:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(product.colors || []).map(c => (
                        <button 
                          key={c.color} 
                          onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                          className={`relative p-5 rounded-[2rem] border-4 transition-all text-center ${
                            c.stock <= 0 
                              ? 'bg-gray-100 text-gray-300 border-transparent opacity-40 cursor-not-allowed' 
                              : selectedColor === c.color 
                                ? 'bg-white border-[#f6a118] shadow-md scale-[1.02]' 
                                : 'bg-white border-white'
                          }`}
                        >
                          <span className={`text-base font-bold uppercase ${selectedColor === c.color ? 'text-[#f6a118]' : 'text-gray-700'}`}>{c.color}</span>
                          <span className="block text-[10px] opacity-30 mt-1 uppercase">Stock: {c.stock}</span>
                          {selectedColor === c.color && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#f6a118] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PIE DE PÁGINA: FIJO/STICKY REAL */}
            <div className="shrink-0 w-full p-6 md:p-10 bg-white border-t-2 border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] z-[10000]">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex justify-between items-center w-full md:w-auto md:gap-12">
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-7xl font-bold text-gray-900 leading-none tracking-tighter">
                      ${(product.price || 0).toLocaleString()}
                    </span>
                    <p className="text-[11px] text-[#ea7e9c] font-bold mt-1 uppercase tracking-widest">✨ Sumás {product.points || 0} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Elegido</p>
                    <p className="text-xl font-bold text-[#f6a118] uppercase truncate max-w-[120px]">{selectedColor || '---'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`w-full md:flex-grow py-5 md:py-7 rounded-full text-xl md:text-3xl font-bold shadow-2xl active:scale-95 transition-all uppercase tracking-tighter border-4 border-white ${
                    currentStock <= 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'matita-gradient-orange text-white hover:brightness-105'
                  }`}
                >
                  {currentStock <= 0 ? 'Sin Stock temporal' : 'Añadir al Carrito 🛍️'}
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
