
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

  // Prevenir scroll del fondo cuando el modal está abierto
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

        <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden p-3">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
            alt={product.name}
            loading="lazy"
          />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-800 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">Agotado</span>
            </div>
          )}
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

      {/* MODAL / BOTTOM SHEET */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
          
          {/* Overlay para cerrar al tocar fuera */}
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />

          <div 
            className="bg-[#fdfaf6] w-full h-[92%] md:h-auto md:max-h-[85vh] md:max-w-5xl md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BOTÓN CERRAR - Ahora siempre visible y con Z-INDEX alto */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 md:top-6 md:right-6 z-[1100] w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 border-2 border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3.5}/></svg>
            </button>

            {/* AREA DE CONTENIDO CON SCROLL */}
            <div className="flex-grow overflow-y-auto scrollbar-hide flex flex-col md:flex-row h-full">
              
              {/* LADO IZQUIERDO: IMAGEN */}
              <div className="w-full md:w-1/2 bg-white shrink-0">
                <div className="w-full aspect-square relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
                  <img 
                    key={activeImage}
                    src={getImgUrl(productImages[activeImage], 1000)} 
                    className="max-w-full max-h-full object-contain animate-fadeIn drop-shadow-2xl" 
                    alt={product.name} 
                  />
                </div>
                
                {productImages.length > 1 && (
                  <div className="flex gap-3 px-6 pb-6 overflow-x-auto scrollbar-hide justify-start md:justify-center">
                    {productImages.map((img, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveImage(i)} 
                        className={`w-16 h-16 rounded-2xl border-4 transition-all shrink-0 ${
                          activeImage === i ? 'border-[#fadb31] scale-105 shadow-md' : 'border-gray-50 opacity-40 grayscale hover:grayscale-0'
                        }`}
                      >
                        <img src={getImgUrl(img, 200)} className="w-full h-full object-cover rounded-xl" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* LADO DERECHO: DETALLES */}
              <div className="w-full md:w-1/2 p-6 md:p-14 flex flex-col pb-40 md:pb-14">
                <p className="text-[#ea7e9c] font-bold text-[10px] md:text-xs uppercase tracking-[0.4em] mb-2">{product.category}</p>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-none mb-6 uppercase tracking-tighter">
                  {product.name}
                </h2>
                
                <div className="bg-white/90 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-white shadow-sm mb-8">
                  <p className="text-base md:text-xl text-gray-500 italic font-matita leading-relaxed">
                    "{product.description || 'Este tesoro fue seleccionado por Matita para llenar de magia tu colección papeleril.'}"
                  </p>
                </div>

                {/* OPCIONES */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Elige tu favorito:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(product.colors || []).map(c => (
                      <button 
                        key={c.color} 
                        onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                        className={`relative p-4 md:p-5 rounded-[1.8rem] border-4 transition-all text-center flex flex-col items-center gap-1 ${
                          c.stock <= 0 
                            ? 'bg-gray-100 text-gray-200 border-transparent opacity-40 cursor-not-allowed' 
                            : selectedColor === c.color 
                              ? 'bg-white border-[#fadb31] shadow-md scale-[1.02]' 
                              : 'bg-white border-white hover:border-gray-50'
                        }`}
                      >
                        <span className={`text-base font-bold uppercase tracking-tighter ${selectedColor === c.color ? 'text-gray-900' : 'text-gray-400'}`}>{c.color}</span>
                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Stock: {c.stock}</span>
                        {selectedColor === c.color && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#fadb31] rounded-full flex items-center justify-center text-gray-900 text-[10px] shadow-sm">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PIE DE PÁGINA: FIJO (STICKY REAL) */}
            <div className="absolute bottom-0 left-0 w-full p-5 md:p-10 bg-white/95 backdrop-blur-md border-t-2 border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-[1050]">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div className="flex justify-between items-center w-full md:w-auto md:gap-14">
                  <div className="flex flex-col">
                    <span className="text-3xl md:text-7xl font-bold text-gray-900 leading-none tracking-tighter">
                      ${(product.price || 0).toLocaleString()}
                    </span>
                    <p className="text-[9px] md:text-[11px] text-[#ea7e9c] font-bold mt-1 uppercase tracking-widest">
                      ✨ Sumás {product.points || 0} Matita Puntos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mb-1">Elegido</p>
                    <p className="text-xl font-bold text-[#f6a118] uppercase truncate max-w-[100px] tracking-tighter">{selectedColor || '---'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`w-full md:flex-grow py-5 md:py-8 rounded-full text-xl md:text-3xl font-bold shadow-2xl active:scale-95 transition-all uppercase tracking-tighter border-4 border-white ${
                    currentStock <= 0 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'matita-gradient-orange text-white hover:brightness-105'
                  }`}
                >
                  {currentStock <= 0 ? 'Sin Stock' : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Llevar a Casa</span>
                      <span className="text-2xl">🛍️</span>
                    </div>
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
