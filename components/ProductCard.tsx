import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

/**
 * getImgUrl: Utilidad centralizada para el manejo de recursos visuales.
 * Optimiza la carga mediante Cloudinary o maneja fallbacks de placeholders.
 */
const getImgUrl = (id: string | undefined, w = 600) => {
  if (!id || typeof id !== 'string') return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto:best,f_auto,w_${w}/${id}`;
};

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard: Componente de interfaz de usuario para la exhibición de productos.
 * Integra la lógica de visualización, gestión de favoritos, selección de variantes (colores)
 * y ahora un sistema avanzado de selección de cantidad con validaciones estrictas.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, favorites, toggleFavorite } = useApp();
  
  // -- ESTADOS DE INTERFAZ --
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // -- ESTADOS DE COMPRA --
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.color || '');
  const [quantity, setQuantity] = useState(1);

  // -- LOGICA DE DATOS --
  
  // Aseguramos que las imágenes sean un array válido de strings
  const productImages = useMemo(() => 
    (product.images || []).filter(img => img && typeof img === 'string')
  , [product.images]);

  const isFavorite = (favorites || []).includes(product.id);

  // Localizamos la variante actual para conocer su disponibilidad real
  const currentVariant = useMemo(() => 
    (product.colors || []).find(c => c.color === selectedColor)
  , [selectedColor, product.colors]);
  
  const currentStock = currentVariant?.stock || 0;
  
  // Verificación de agotamiento total del producto
  const isGlobalOutOfStock = (product.colors || []).every(c => c.stock <= 0);

  // -- EFECTOS --
  
  // Reseteamos la cantidad si el stock de la nueva variante es menor a la cantidad actual
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(0);
    } else if (quantity === 0 && currentStock > 0) {
      setQuantity(1);
    }
  }, [selectedColor, currentStock]);

  // Manejo de scroll del body para evitar doble scroll con el modal abierto
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuantity(1); // Reset al cerrar
    }
  }, [showModal]);

  /**
   * handleQuantityChange: Valida la entrada manual del usuario.
   * Evita que se ingresen valores no numéricos, negativos o superiores al stock.
   */
  const handleQuantityChange = (val: string) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 1) {
      setQuantity(1);
    } else if (num > currentStock) {
      setQuantity(currentStock);
    } else {
      setQuantity(num);
    }
  };

  /**
   * increment: Aumenta la cantidad respetando el techo de stock.
   */
  const increment = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1);
    }
  };

  /**
   * decrement: Reduce la cantidad respetando el suelo de 1 unidad.
   */
  const decrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  /**
   * onAddToCart: Lógica final de inserción al carrito.
   * Incluye un pequeño delay visual para dar sensación de procesamiento.
   */
  const onAddToCart = () => {
    if (currentStock >= quantity && quantity > 0) {
      setIsAdding(true);
      setTimeout(() => {
        addToCart({ product, quantity, selectedColor });
        setIsAdding(false);
        setShowModal(false);
        // Feedback opcional mediante el sistema de notificaciones del navegador
      }, 400);
    }
  };

  return (
    <>
      {/* 1. VISTA DE MINIATURA (GRID DEL CATÁLOGO) */}
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-[#fadb31] flex flex-col h-full relative"
      >
        {/* Favoritos */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        >
          <svg className={`w-6 h-6 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Contenedor de Imagen con Efecto de Zoom */}
        <div className="relative aspect-square bg-[#fdfaf6] flex items-center justify-center p-6 overflow-hidden">
          <img 
            src={getImgUrl(productImages[0], 400)} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
            alt={product.name} 
          />
          
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-800 text-white text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg">Agotado Temporalmente</span>
            </div>
          )}
        </div>
        
        {/* Detalle del Producto */}
        <div className="p-6 flex flex-col flex-grow bg-white">
          <p className="text-[10px] text-[#f6a118] font-bold uppercase tracking-[0.2em] mb-2">{product.category}</p>
          <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight mb-4 font-matita">{product.name}</h3>
          
          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col">
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs text-red-300 line-through font-bold mb-1">${product.oldPrice.toLocaleString()}</span>
              )}
              <span className="text-3xl font-bold text-gray-900 tracking-tighter">${(product.price || 0).toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[8px] font-bold text-[#ea7e9c] uppercase tracking-widest bg-[#fef9eb] px-3 py-1 rounded-full border border-[#fadb31]/20">
                +{product.points} pts Club
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MODAL DE SELECCIÓN Y CONFIGURACIÓN DE COMPRA */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
          {/* Capa de cierre al tocar fuera */}
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />
          
          <div className="bg-[#fdfaf6] w-full h-[95%] md:h-auto md:max-h-[90vh] md:max-w-5xl rounded-t-[3rem] md:rounded-[4rem] shadow-2xl relative flex flex-col md:flex-row overflow-hidden animate-slideUp border-t-[10px] md:border-[10px] border-white">
            
            {/* Botón Cerrar Flotante */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform border border-gray-100"
            >
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
            </button>

            {/* Galería Lateral (Desktop) / Superior (Mobile) */}
            <div className="md:w-1/2 p-8 bg-white flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-50">
              <div className="w-full aspect-square bg-[#fdfaf6] rounded-[3rem] p-8 flex items-center justify-center overflow-hidden border-2 border-gray-50 mb-6 shadow-inner">
                <img 
                  src={getImgUrl(productImages[activeImage], 800)} 
                  className="max-w-full max-h-full object-contain transition-all duration-500" 
                  alt={product.name} 
                />
              </div>
              
              {/* Navegador de Imágenes Miniatura */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-full">
                {productImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)} 
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === i ? 'border-[#f6a118] scale-110 shadow-md' : 'border-transparent opacity-60 grayscale'
                    }`}
                  >
                    <img src={getImgUrl(img, 150)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de Configuración de Cantidad y Variantes */}
            <div className="md:w-1/2 p-8 md:p-14 flex flex-col overflow-y-auto bg-[#fdfaf6] scrollbar-hide">
              <div className="mb-8">
                 <p className="text-[#ea7e9c] font-bold text-[10px] uppercase tracking-[0.3em] mb-2">{product.category} ✨</p>
                 <h2 className="text-4xl font-bold text-gray-800 leading-none mb-4 font-matita uppercase tracking-tighter">{product.name}</h2>
                 <div className="w-20 h-1.5 bg-[#fadb31] rounded-full mb-6"></div>
                 <p className="text-lg text-gray-500 italic leading-relaxed font-matita">
                   "{product.description || 'Este tesoro ha sido seleccionado cuidadosamente por el equipo de Matita para llenar de magia tu colección personal.'}"
                 </p>
              </div>

              {/* Selector de Variante (Color) */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4 px-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Elegí tu variante:</p>
                  <span className="text-[10px] font-bold text-[#f6a118] uppercase tracking-widest">Stock: {currentStock}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(product.colors || []).map(c => (
                    <button 
                      key={c.color} 
                      onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                      className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 shadow-sm ${
                        c.stock <= 0 
                          ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed opacity-40' 
                          : selectedColor === c.color 
                            ? 'bg-white border-[#fadb31] ring-4 ring-[#fadb31]/10 scale-[1.02]' 
                            : 'bg-white border-white hover:border-gray-100'
                      }`}
                    >
                      <span className="text-base font-bold text-gray-700 uppercase">{c.color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ----- APARTADO DE ELEGIR CANTIDAD ----- */}
              <div className="mb-10 p-6 bg-white rounded-[2.5rem] border-2 border-white shadow-sm flex flex-col items-center gap-4">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">¿Cuántas unidades llevás? 🛒</p>
                <div className="flex items-center gap-8">
                  {/* Botón Reducir */}
                  <button 
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-3xl font-bold text-[#ea7e9c] hover:bg-red-50 hover:scale-110 active:scale-95 transition-all shadow-sm disabled:opacity-20"
                  >
                    -
                  </button>
                  
                  {/* Entrada Numérica Central */}
                  <div className="flex flex-col items-center">
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-24 text-center text-5xl font-bold text-gray-800 bg-transparent border-none outline-none font-matita [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="h-1 w-12 bg-[#fadb31]/30 rounded-full mt-1"></div>
                  </div>

                  {/* Botón Aumentar */}
                  <button 
                    onClick={increment}
                    disabled={quantity >= currentStock}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl font-bold transition-all shadow-sm ${
                      quantity >= currentStock 
                        ? 'bg-gray-50 text-gray-200 cursor-not-allowed' 
                        : 'bg-gray-50 text-[#f6a118] hover:bg-orange-50 hover:scale-110 active:scale-95'
                    }`}
                  >
                    +
                  </button>
                </div>
                {quantity === currentStock && currentStock > 0 && (
                  <p className="text-[10px] font-bold text-[#f6a118] uppercase animate-fadeIn">¡Últimas unidades disponibles!</p>
                )}
              </div>

              {/* Resumen de Inversión y Puntos */}
              <div className="mt-auto pt-8 border-t-2 border-white flex justify-between items-center mb-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-2">Total Estimado</span>
                  <span className="text-5xl font-bold text-[#f6a118] leading-none tracking-tighter">
                    ${(product.price * quantity).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="bg-[#fef9eb] px-5 py-3 rounded-[2rem] border-2 border-[#fadb31]/20 shadow-sm flex items-center gap-3">
                    <span className="text-3xl">✨</span>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-800 leading-none">{(product.points * quantity)}</span>
                      <span className="text-[8px] font-bold text-[#ea7e9c] uppercase tracking-widest">PUNTOS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Acción Principal */}
              <button 
                onClick={onAddToCart}
                disabled={currentStock <= 0 || isAdding || quantity === 0}
                className={`w-full py-8 rounded-[2.5rem] text-2xl font-bold shadow-2xl active:scale-95 transition-all uppercase tracking-widest relative overflow-hidden flex items-center justify-center gap-4 ${
                  currentStock <= 0 
                    ? 'bg-gray-100 text-gray-300' 
                    : 'matita-gradient-pink text-white hover:scale-[1.02]'
                }`}
              >
                {isAdding ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {currentStock <= 0 ? 'Sin Stock ✨' : '¡Lo quiero en mi bolsa! 🌸'}
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] mt-8">RESERVA PROTEGIDA POR MATITA BOUTIQUE</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
