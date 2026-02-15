import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, favorites, toggleFavorite } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);

  const isFavorite = favorites.includes(product.id);
  const currentStock = useMemo(() => product.colors.find(c => c.color === selectedColor)?.stock || 0, [selectedColor, product.colors]);
  const isGlobalOutOfStock = product.colors.every(c => c.stock <= 0);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
      alert(`¡${product.name} (${selectedColor}) añadido! 🌸`);
    }
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#fadb31] flex flex-col h-full relative"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
        >
          <svg className={`w-5 h-5 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="relative aspect-[4/5] bg-[#fdfaf6] flex items-center justify-center p-4">
          <img src={getImgUrl(product.images[0], 400)} className="w-full h-full object-contain transition-transform group-hover:scale-105" alt={product.name} />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-800/80 text-white text-xs px-4 py-1 rounded-full font-bold uppercase tracking-widest">Agotado</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow bg-white">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight mb-2">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-[#f6a118]">${product.price.toLocaleString()}</span>
            <div className="w-8 h-8 rounded-lg bg-[#fef9eb] text-[#fadb31] flex items-center justify-center border border-[#fadb31]/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2.5}/></svg>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fdfaf6] w-full max-w-4xl max-h-[95vh] rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row border-t-8 md:border-8 border-white">
            
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
            </button>

            <div className="md:w-1/2 p-6 md:p-10 bg-white flex flex-col items-center">
              <div className="w-full aspect-square bg-[#fdfaf6] rounded-[2rem] p-4 flex items-center justify-center overflow-hidden border-2 border-gray-50 mb-6">
                <img src={getImgUrl(product.images[activeImage], 800)} className="max-w-full max-h-full object-contain" alt={product.name} />
              </div>
              <div className="flex gap-2 mb-6">
                {product.images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-3 h-3 rounded-full transition-all ${activeImage === i ? 'bg-[#f6a118] w-8' : 'bg-gray-200'}`} />
                ))}
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-5 rounded-[2rem] text-xl font-bold shadow-xl active:scale-95 flex items-center justify-center gap-2 ${currentStock <= 0 ? 'bg-gray-100 text-gray-300' : 'matita-gradient-pink text-white'}`}
              >
                {currentStock <= 0 ? 'Sin Stock' : 'Añadir al Carrito ✨'}
              </button>
            </div>

            <div className="md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto scrollbar-hide bg-[#fdfaf6]">
              <div className="mb-6">
                 <p className="text-[#ea7e9c] font-bold text-[10px] uppercase tracking-widest mb-1">{product.category}</p>
                 <h2 className="text-3xl font-bold text-gray-800 leading-tight mb-3">{product.name}</h2>
                 <p className="text-base text-gray-500 italic leading-relaxed">"{product.description || 'Producto seleccionado por Matita.'}"</p>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Elige tu variante:</p>
                <div className="grid grid-cols-2 gap-2">
                  {product.colors.map(c => (
                    <button 
                      key={c.color} 
                      onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                      className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                        c.stock <= 0 
                          ? 'bg-gray-50 text-gray-300 border-gray-100 opacity-50' 
                          : selectedColor === c.color 
                            ? 'bg-white border-[#f6a118] shadow-md' 
                            : 'bg-white border-transparent'
                      }`}
                    >
                      {selectedColor === c.color && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-[#f6a118] rounded-full flex items-center justify-center text-white text-[8px]">✓</div>
                      )}
                      <span className={`text-sm font-bold ${selectedColor === c.color ? 'text-[#f6a118]' : 'text-gray-500'}`}>{c.color}</span>
                      <span className="text-[8px] font-bold uppercase opacity-40">Stock: {c.stock}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/50 flex justify-between items-end">
                <div>
                  <span className="text-4xl font-bold text-[#f6a118]">${product.price.toLocaleString()}</span>
                  <p className="text-[10px] text-[#ea7e9c] font-bold">+ {product.points} pts ✨</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">Seleccionado</p>
                  <p className="text-lg font-bold text-gray-800">{selectedColor || '-'}</p>
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
