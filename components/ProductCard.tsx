
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string | undefined, w = 400) => {
  if (!id || typeof id !== 'string') return "https://via.placeholder.com/600x600?text=Sin+Imagen";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
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

  useEffect(() => {
    if (showModal) {
      setActiveImage(0);
      // Bloquear scroll del body al abrir modal
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
    }
  };

  return (
    <>
      {/* CARD PRINCIPAL */}
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

        <div className="relative aspect-square bg-[#fdfaf6] flex items-center justify-center p-2 md:p-4 overflow-hidden">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
            alt={product.name}
            loading="lazy"
          />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-800/80 text-white text-[9px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="p-3 md:p-6 flex flex-col flex-grow bg-white">
          <p className="text-[8px] md:text-[10px] text-[#f6a118] font-bold uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-sm md:text-xl font-bold text-gray-800 line-clamp-2 leading-tight mb-2 uppercase tracking-tighter">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-base md:text-2xl font-bold text-gray-800">${(product.price || 0).toLocaleString()}</span>
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#fef9eb] text-[#f6a118] flex items-center justify-center border-2 border-[#fadb31]/30 transition-transform group-hover:scale-110">
              <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3}/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE OPTIMIZADO */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn overflow-hidden">
          <div className="bg-[#fdfaf6] w-full max-w-4xl h-[92vh] md:h-auto md:max-h-[90vh] rounded-t-[3rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row transition-all">
            
            {/* BOTÓN CERRAR - Más accesible en móvil */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 z-[220] w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all border-2 border-gray-100"
              aria-label="Cerrar"
            >
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3.5}/></svg>
            </button>

            {/* ÁREA DE IMAGEN - FIX BUG MÓVIL (Altura controlada) */}
            <div className="h-[40vh] md:h-auto md:w-1/2 p-6 md:p-12 bg-white flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
              <div className="w-full h-full md:aspect-square flex items-center justify-center overflow-hidden">
                <img 
                  key={activeImage}
                  src={getImgUrl(productImages[activeImage], 800)} 
                  className="max-w-full max-h-full object-contain animate-fadeIn drop-shadow-xl" 
                  alt={product.name} 
                />
              </div>
              
              {productImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 px-2 scrollbar-hide max-w-full">
                  {productImages.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)} 
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 transition-all overflow-hidden shrink-0 ${
                        activeImage === i ? 'border-[#f6a118] scale-105 shadow-md' : 'border-gray-100 opacity-50'
                      }`}
                    >
                      <img src={getImgUrl(img, 150)} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ÁREA DE TEXTO - Scroll independiente */}
            <div className="flex-grow md:w-1/2 p-6 md:p-12 flex flex-col overflow-y-auto scrollbar-hide bg-[#fdfaf6]">
              <div className="mb-6">
                 <p className="text-[#ea7e9c] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">{product.category}</p>
                 <h2 className="text-2xl md:text-4xl font-bold text-gray-800 leading-tight mb-3 uppercase tracking-tighter">{product.name}</h2>
                 <p className="text-base md:text-lg text-gray-500 italic leading-relaxed border-l-4 border-[#fadb31] pl-4 py-1">
                   {product.description || 'Una joyita seleccionada por Matita para llenar de magia tu escritorio.'}
                 </p>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Opciones disponibles:</p>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {(product.colors || []).map(c => (
                    <button 
                      key={c.color} 
                      onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                      className={`relative p-3 md:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                        c.stock <= 0 
                          ? 'bg-gray-50 text-gray-300 border-gray-100 opacity-50 cursor-not-allowed' 
                          : selectedColor === c.color 
                            ? 'bg-white border-[#f6a118] shadow-md ring-2 ring-[#f6a118]/10' 
                            : 'bg-white border-transparent shadow-sm'
                      }`}
                    >
                      <span className={`text-sm md:text-base font-bold ${selectedColor === c.color ? 'text-[#f6a118]' : 'text-gray-700'}`}>{c.color}</span>
                      <span className="text-[9px] font-bold uppercase opacity-30">Stock: {c.stock}</span>
                      {selectedColor === c.color && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#f6a118] rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t-2 border-dashed border-gray-100 flex flex-col gap-4 md:gap-6">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-5xl font-bold text-gray-800 leading-none tracking-tighter">${(product.price || 0).toLocaleString()}</span>
                    <p className="text-[10px] text-[#ea7e9c] font-bold mt-2 bg-[#ea7e9c]/10 px-3 py-1 rounded-full self-start inline-block">
                      ✨ +{product.points || 0} pts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Color</p>
                    <p className="text-lg font-bold text-gray-800 uppercase truncate max-w-[120px]">{selectedColor || '-'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`w-full py-5 rounded-full text-xl md:text-2xl font-bold shadow-xl active:scale-95 transition-all uppercase tracking-tighter ${
                    currentStock <= 0 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'matita-gradient-orange text-white hover:brightness-110 active:brightness-90'
                  }`}
                >
                  {currentStock <= 0 ? 'Sin Stock temporal' : 'Añadir al Carrito ✨'}
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

