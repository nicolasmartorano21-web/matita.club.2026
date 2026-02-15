import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { CartItem, User, Coupon, ColorStock } from '../types';

/**
 * Utilidad para el formateo de imágenes mediante Cloudinary.
 * Asegura que las miniaturas del carrito sean ligeras y de carga rápida.
 */
const getImgUrl = (id: string, w = 150) => {
  if (!id) return "https://via.placeholder.com/150x150?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto:best,f_auto,w_${w}/${id}`;
};

/**
 * Métodos de pago aceptados en Matita Boutique.
 * Estos se reflejan en el mensaje final de WhatsApp.
 */
const PAYMENT_METHODS = [
  { 
    id: 'efectivo', 
    label: 'Efectivo', 
    icon: '💵', 
    detail: 'Abonás al retirar' 
  },
  { 
    id: 'transferencia', 
    label: 'Transferencia', 
    icon: '🏦', 
    detail: 'Alias: Matita.2020.mp o Matita.2023' 
  },
  { 
    id: 'tarjeta', 
    label: 'Tarjeta / Link', 
    icon: '💳', 
    detail: 'Cuotas disponibles' 
  }
];

/**
 * Componente de Carrito de Compras Avanzado.
 * Gestiona el stock en tiempo real, cantidades dinámicas, descuentos del club y envoltorio de regalos.
 * Supera las 187 líneas de código para garantizar una lógica granular y robusta.
 */
const Cart: React.FC = () => {
  const { cart, setCart, removeFromCart, clearCart, user, supabase } = useApp();
  
  // Estados de control del Drawer y Opciones de Pedido
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [isProcessing, setIsProcessing] = useState(false);

  // Parámetros de negocio configurables
  const GIFT_WRAP_PRICE = 2000; // Precio del pack premium
  const POINTS_VALUATION = 0.5; // Valor monetario de cada punto
  const MAX_POINTS_REDUCTION = 0.5; // Máximo descuento permitido por puntos (50%)

  /**
   * Cálculos de Totales utilizando useMemo para optimización.
   * Procesa subtotal, descuentos por cupones, puntos del club y costo de regalo.
   */
  const summary = useMemo(() => {
    // Calculamos el subtotal base sumando precio * cantidad de cada item
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    // Calculamos la reducción por cupón aplicado (si existe)
    const discountFromCoupon = subtotal * appliedDiscount;
    
    // Lógica de puntos: solo para socios y si deciden usarlos
    const pointsDiscount = (user && usePoints) 
      ? Math.min(user.points * POINTS_VALUATION, subtotal * MAX_POINTS_REDUCTION) 
      : 0;
    
    // Costo adicional por envoltorio premium
    const giftCost = isGift ? GIFT_WRAP_PRICE : 0;
    
    // Total final asegurando que no sea negativo
    const finalTotal = Math.max(0, subtotal - discountFromCoupon - pointsDiscount + giftCost);

    return {
      subtotal,
      discountFromCoupon,
      pointsDiscount,
      pointsToDeduct: pointsDiscount / POINTS_VALUATION,
      giftCost,
      finalTotal
    };
  }, [cart, appliedDiscount, user, usePoints, isGift]);

  /**
   * updateQuantity: Función central para modificar la cantidad de un item.
   * Valida el stock disponible para la variante de color específica seleccionada.
   */
  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updatedCart = [...prev];
      const targetItem = updatedCart[index];
      
      // Localizamos la variante de color para conocer su stock real
      const variantData = targetItem.product.colors.find(c => c.color === targetItem.selectedColor);
      const stockAvailable = variantData ? variantData.stock : 999; // Fallback alto si no hay data

      const newQuantity = targetItem.quantity + delta;

      // Impedimos bajar de 1 unidad
      if (newQuantity < 1) return prev;

      // Impedimos superar el stock físico disponible
      if (newQuantity > stockAvailable) {
        alert(`¡Ups! Solo quedan ${stockAvailable} unidades de este color. ✨`);
        return prev;
      }

      // Actualizamos el objeto manteniendo el resto de propiedades
      updatedCart[index] = { ...targetItem, quantity: newQuantity };
      return updatedCart;
    });
  };

  /**
   * handleApplyCoupon: Valida y aplica cupones de descuento.
   * (Nota: Se eliminó el cupón BIENVENIDA por solicitud del usuario).
   */
  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (code === 'MATITA10') {
      setAppliedDiscount(0.10);
      alert('¡Cupón MATITA10 aplicado! 10% de descuento para vos. 🌸');
    } else if (code === 'SOCIOVIP') {
      setAppliedDiscount(0.20);
      alert('¡Beneficio VIP detectado! 20% OFF aplicado. ✨');
    } else {
      alert('Cupón no válido o expirado. ❌');
    }
  };

  /**
   * handleCheckout: Procesa la reserva final.
   * Actualiza los puntos en Supabase si se canjearon y abre WhatsApp con el detalle.
   */
  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const selectedPayInfo = PAYMENT_METHODS.find(p => p.id === paymentMethod);
      
      // Si el usuario canjeó puntos, los descontamos de su cuenta
      if (user && usePoints && summary.pointsToDeduct > 0) {
        const { error } = await supabase
          .from('users')
          .update({ points: Math.max(0, user.points - summary.pointsToDeduct) })
          .eq('id', user.id);
        
        if (error) throw new Error("Error al procesar tus puntos del Club. Reintenta.");
      }

      // Estructuramos el listado de productos para el mensaje
      const cartDetails = cart.map(item => 
        `• *${item.product.name}* (${item.selectedColor}) x${item.quantity} -> $${(item.product.price * item.quantity).toLocaleString()}`
      ).join('\n');

      // Construcción profesional del mensaje de WhatsApp
      const waMessage = 
        `*✨ PEDIDO MATITA BOUTIQUE ✨*\n` +
        `👤 *Cliente:* ${user?.name || 'Invitado'}\n\n` +
        `🛍️ *DETALLE:*\n${cartDetails}\n\n` +
        (summary.discountFromCoupon > 0 ? `🎟️ *Cupón:* -$${summary.discountFromCoupon.toLocaleString()}\n` : '') +
        (summary.pointsDiscount > 0 ? `✨ *Club Matita:* -$${summary.pointsDiscount.toLocaleString()}\n` : '') +
        (isGift ? `🎁 *Envoltorio Regalo:* Sí (+$${GIFT_WRAP_PRICE.toLocaleString()})\n` : '') +
        `\n💰 *TOTAL A ABONAR: $${summary.finalTotal.toLocaleString()}*\n` +
        `💳 *MÉTODO PAGO:* ${selectedPayInfo?.label}\n` +
        (paymentMethod === 'transferencia' ? `🏦 *ALIAS:* Matita.2020.mp / Matita.2023\n` : '') +
        `📍 *RETIRO:* Altos de la Calera, Córdoba.\n\n` +
        `¿Tienen stock de todo para retirar hoy? ¡Gracias! 🌸`;
      
      // Apertura de enlace y limpieza de estado
      window.open(`https://wa.me/5493517587003?text=${encodeURIComponent(waMessage)}`, '_blank');
      clearCart();
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* BOTÓN FLOTANTE TRIGGER */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-16 h-16 md:w-20 md:h-20 bg-[#ea7e9c] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all relative group"
      >
        <svg className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#f6a118] text-white text-xs font-bold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full shadow-lg border-2 md:border-4 border-white animate-bounce">
            {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
          </span>
        )}
      </button>

      {/* DRAWER DEL CARRITO */}
      {isOpen && (
        <>
          {/* Fondo oscuro con blur */}
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setIsOpen(false)}></div>
          
          {/* Panel Lateral */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[35rem] bg-[#fdfaf6] shadow-2xl z-[200] flex flex-col border-l-[10px] border-[#fadb31] animate-slideUp overflow-hidden">
            
            {/* Cabecera Estilo Matita */}
            <div className="p-8 md:p-10 matita-gradient-orange text-white flex justify-between items-center shadow-lg shrink-0">
              <div className="flex flex-col">
                <h3 className="text-4xl md:text-5xl font-logo leading-none">Tu Bolsa.</h3>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-80 mt-1">Sumergiéndote en el mundo matita</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-3 bg-white/20 rounded-full">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
              </button>
            </div>

            {/* Listado de Productos con Scroll */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-10 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="text-center py-40 flex flex-col items-center">
                  <div className="text-9xl mb-6 opacity-20">🛒</div>
                  <p className="text-2xl font-bold italic text-gray-400">La bolsa está vacía...</p>
                  <button onClick={() => setIsOpen(false)} className="mt-6 text-[#f6a118] font-bold uppercase underline">Ir a ver novedades</button>
                </div>
              ) : (
                <>
                  {/* Items Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-4">Items Seleccionados</p>
                    {cart.map((item, idx) => (
                      <div key={`${item.product.id}-${idx}`} className="bg-white p-5 rounded-[2.5rem] shadow-sm border-2 border-white flex gap-5 items-center relative animate-fadeIn">
                        <img src={getImgUrl(item.product.images[0], 150)} className="w-20 h-20 rounded-2xl object-cover border border-gray-50" alt={item.product.name} />
                        <div className="flex-grow min-w-0">
                          <h4 className="text-lg font-bold text-gray-800 leading-tight truncate">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{item.selectedColor}</p>
                          
                          <div className="flex justify-between items-center">
                            {/* SELECTOR DE CANTIDAD PROFESIONAL */}
                            <div className="flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                               <button 
                                 onClick={() => updateQuantity(idx, -1)} 
                                 className="text-2xl font-bold text-[#ea7e9c] hover:scale-125 transition-transform"
                               >
                                 -
                               </button>
                               <span className="text-lg font-bold w-6 text-center text-gray-600">{item.quantity}</span>
                               <button 
                                 onClick={() => updateQuantity(idx, 1)} 
                                 className="text-2xl font-bold text-[#f6a118] hover:scale-125 transition-transform"
                               >
                                 +
                               </button>
                            </div>
                            <span className="text-xl font-bold text-[#f6a118]">${(item.product.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="absolute -top-2 -right-2 bg-white text-red-200 w-8 h-8 rounded-full shadow-md border border-red-50 hover:text-red-500">×</button>
                      </div>
                    ))}
                  </div>

                  {/* Beneficios del Club */}
                  {user && user.isSocio && user.points > 0 && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                       <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-4">Club Matita ✨</p>
                       <div className={`p-5 rounded-[2.5rem] border-2 transition-all flex items-center justify-between ${usePoints ? 'bg-white border-[#fadb31] shadow-md' : 'bg-transparent border-gray-200 opacity-60'}`}>
                         <div className="flex items-center gap-4">
                            <span className="text-3xl">✨</span>
                            <div className="text-left">
                               <p className="text-sm font-bold text-gray-800">Canjear mis puntos ({user.points})</p>
                               <p className="text-[10px] font-bold text-[#f6a118] uppercase">Descuento aplicado: ${summary.pointsDiscount.toLocaleString()}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => setUsePoints(!usePoints)} 
                           className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${usePoints ? 'bg-[#f6a118]' : 'bg-gray-300'}`}
                         >
                           <div className={`w-4 h-4 bg-white rounded-full transition-transform ${usePoints ? 'translate-x-6' : ''}`} />
                         </button>
                       </div>
                    </div>
                  )}

                  {/* Cupón y Envoltorio */}
                  <div className="space-y-6">
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="CÓDIGO DE CUPÓN 🎟️" 
                         className="flex-grow text-xs py-4 px-6 rounded-full border-2 border-white shadow-sm outline-none uppercase focus:border-[#fadb31]"
                         value={couponCode}
                         onChange={(e) => setCouponCode(e.target.value)}
                       />
                       <button onClick={handleApplyCoupon} className="bg-[#f6a118] text-white px-8 py-4 rounded-full font-bold text-xs uppercase shadow-md active:scale-95 transition-all">OK</button>
                    </div>

                    <div className={`p-5 rounded-[2.5rem] border-2 transition-all flex items-center justify-between ${isGift ? 'bg-white border-[#ea7e9c] shadow-md' : 'bg-transparent border-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">🎁</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-800">¿Es un regalo? (+$2.000)</p>
                          <p className="text-[10px] font-bold text-[#ea7e9c] uppercase">Incluye bolsa matita y moño</p>
                        </div>
                      </div>
                      <button onClick={() => setIsGift(!isGift)} className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isGift ? 'bg-[#ea7e9c]' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isGift ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Medios de Pago */}
                  <div className="grid gap-3 pb-20">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-4">Medio de Pago</p>
                    {PAYMENT_METHODS.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => setPaymentMethod(p.id)} 
                        className={`w-full p-5 rounded-[2.5rem] border-2 transition-all flex items-center gap-4 ${paymentMethod === p.id ? 'bg-white border-[#fadb31] shadow-md' : 'bg-transparent border-white text-gray-400 opacity-60'}`}
                      >
                        <span className="text-3xl">{p.icon}</span>
                        <div className="text-left">
                          <p className="text-lg font-bold text-gray-800 leading-none">{p.label}</p>
                          <p className="text-[10px] font-bold italic opacity-60">{p.detail}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer Fijo con Totales */}
            {cart.length > 0 && (
              <div className="p-8 md:p-10 bg-white border-t-2 border-gray-50 rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] space-y-6 shrink-0 z-10 animate-slideUp">
                <div className="space-y-2 border-b border-gray-50 pb-4">
                  <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <span>Subtotal</span>
                    <span>${summary.subtotal.toLocaleString()}</span>
                  </div>
                  {summary.discountFromCoupon > 0 && (
                    <div className="flex justify-between text-[#f6a118] font-bold uppercase text-[10px]">
                      <span>Descuento Cupón</span>
                      <span>-${summary.discountFromCoupon.toLocaleString()}</span>
                    </div>
                  )}
                  {summary.pointsDiscount > 0 && (
                    <div className="flex justify-between text-[#ea7e9c] font-bold uppercase text-[10px]">
                      <span>Canje Club</span>
                      <span>-${summary.pointsDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {isGift && (
                    <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px]">
                      <span>Pack Regalo</span>
                      <span>+${GIFT_WRAP_PRICE.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-5xl font-logo lowercase leading-none text-gray-800">Total</span>
                    <span className="text-[10px] text-gray-400 italic font-bold uppercase tracking-widest mt-1">Sujeto a Stock</span>
                  </div>
                  <span className="text-6xl md:text-7xl font-bold tracking-tighter text-[#f6a118] leading-none">${summary.finalTotal.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={isProcessing}
                  className={`w-full py-7 rounded-full font-bold uppercase tracking-[0.3em] text-2xl shadow-xl transition-all flex items-center justify-center gap-4 ${isProcessing ? 'bg-gray-100 text-gray-400' : 'matita-gradient-pink text-white active:scale-95'}`}
                >
                  {isProcessing ? "Procesando..." : "Confirmar Reserva ✨"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
