import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { CartItem, User, ColorStock } from '../types';

/**
 * getImgUrl: Utilidad para procesar imágenes a través de Cloudinary.
 */
const getImgUrl = (id: string | undefined, w = 250) => {
  if (!id) return "https://via.placeholder.com/250x250?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto:best,f_auto,w_${w}/${id}`;
};

/**
 * CONFIGURACIÓN DE MÉTODOS DE PAGO CON "CARTELITOS"
 */
const PAYMENT_METHODS = [
  { 
    id: 'efectivo', 
    label: 'Efectivo', 
    icon: '💵', 
    detail: 'Abonás al retirar en el local',
    alertBg: 'bg-green-100 border-green-300 text-green-800',
    info: '¡Genial! Reservamos tus productos. Podés pagar en efectivo al retirar por Altos de la Calera. 🌸'
  },
  { 
    id: 'transferencia', 
    label: 'Transferencia', 
    icon: '🏦', 
    detail: 'Alias: Matita.2020.mp / Matita.2023',
    alertBg: 'bg-orange-100 border-orange-400 text-orange-900',
    info: '¡AVISO IMPORTANTE! ⚠️ Para confirmar, envianos el comprobante por WhatsApp apenas termines el pedido. 🏦'
  },
  { 
    id: 'tarjeta', 
    label: 'Tarjeta / Link de Pago', 
    icon: '💳', 
    detail: 'Crédito/Débito (Se abona en el local)',
    alertBg: 'bg-pink-100 border-pink-400 text-pink-900',
    info: 'AVISO: 💳 Los pagos con tarjeta son ÚNICAMENTE en la librería. Sujeto a recargos del banco.'
  }
];

const Cart: React.FC = () => {
  const { cart, setCart, removeFromCart, clearCart, user, supabase } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [isProcessing, setIsProcessing] = useState(false);

  const GIFT_WRAP_PRICE = 2000;
  const POINTS_VALUATION = 0.5;
  const MAX_POINTS_REDUCTION_PCT = 0.5;

  const summary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const pointsDiscount = (user && usePoints && user.isSocio) 
      ? Math.min(user.points * POINTS_VALUATION, subtotal * MAX_POINTS_REDUCTION_PCT) 
      : 0;
    const giftCost = isGift ? GIFT_WRAP_PRICE : 0;
    const finalTotal = Math.max(0, subtotal - pointsDiscount + giftCost);

    return {
      subtotal,
      pointsDiscount,
      pointsToDeduct: pointsDiscount / POINTS_VALUATION,
      giftCost,
      finalTotal
    };
  }, [cart, user, usePoints, isGift]);

  /**
   * handleCheckout: AQUÍ SE PROCESA EL DESCUENTO DE STOCK Y LA VENTA
   */
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const selectedPay = PAYMENT_METHODS.find(p => p.id === paymentMethod);
      
      // DESCUENTO DE STOCK REAL: Buscamos el producto y restamos la cantidad del color elegido.
      for (const item of cart) {
        const { data: currentProd } = await supabase
          .from('products')
          .select('colors')
          .eq('id', item.product.id)
          .single();

        if (currentProd) {
          const updatedColors = currentProd.colors.map((c: any) => {
            if (c.color === item.selectedColor) {
              return { ...c, stock: Math.max(0, c.stock - item.quantity) };
            }
            return c;
          });

          await supabase.from('products').update({ colors: updatedColors }).eq('id', item.product.id);
        }
      }

      await supabase.from('sales').insert({
        total: summary.finalTotal,
        user_name: user?.name || 'Invitado',
        category_summary: cart.map(i => i.product.category).join(', '),
        created_at: new Date().toISOString()
      });

      if (user && usePoints && summary.pointsToDeduct > 0) {
        await supabase.from('users').update({ points: Math.max(0, user.points - summary.pointsToDeduct) }).eq('id', user.id);
      }

      const detail = cart.map(i => `• *${i.product.name}* (${i.selectedColor}) x${i.quantity}`).join('\n');
      const waMsg = 
        `*✨ NUEVA RESERVA - MATITA BOUTIQUE ✨*\n` +
        `👤 *Cliente:* ${user?.name || 'Invitado'}\n\n` +
        `🛍️ *PEDIDO:*\n${detail}\n\n` +
        (summary.pointsDiscount > 0 ? `✨ *Club Matita:* -$${summary.pointsDiscount.toLocaleString()}\n` : '') +
        (isGift ? `🎁 *Pack Regalo:* Sí\n` : '') +
        `💰 *TOTAL: $${summary.finalTotal.toLocaleString()}*\n` +
        `💳 *PAGO:* ${selectedPay?.label}\n\n` +
        `¡Hola! Hice una reserva en la web. ¿Me confirman si está todo ok? 🌸`;
      
      window.open(`https://wa.me/5493517587003?text=${encodeURIComponent(waMsg)}`, '_blank');
      
      clearCart();
      setIsOpen(false);
      alert("¡Reserva confirmada con éxito! ✨");

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-16 h-16 md:w-20 md:h-20 bg-[#ea7e9c] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all relative group z-[90]"
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

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setIsOpen(false)}></div>
          
          {/* ANCHO REDUCIDO EN PC: De 32rem a 25rem para que sea más elegante */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[28rem] lg:w-[25rem] bg-[#fdfaf6] shadow-2xl z-[200] flex flex-col border-l-[10px] border-[#fadb31] animate-slideUp overflow-hidden">
            
            <div className="p-5 md:p-6 matita-gradient-orange text-white flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h3 className="text-2xl md:text-3xl font-logo uppercase tracking-tighter leading-none">Mi Bolsa.</h3>
                <p className="text-[9px] uppercase font-bold tracking-[0.4em] opacity-80 mt-1">Librería & Club Matita</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-2 bg-white/20 rounded-full active:scale-90">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 md:p-5 space-y-5 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center opacity-40">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-xl font-bold italic text-gray-400 font-matita">Tu bolsa está vacía...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] ml-2">Tesoro seleccionado:</p>
                    {cart.map((item, idx) => (
                      <div key={`${item.product.id}-${idx}`} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-center relative animate-fadeIn group">
                        <div className="w-14 h-14 bg-[#fef9eb] rounded-xl overflow-hidden flex items-center justify-center border border-gray-50 shrink-0">
                          <img src={getImgUrl(item.product.images[0], 150)} className="w-full h-full object-contain p-1.5" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 leading-tight truncate font-matita uppercase">{item.product.name}</h4>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Color: <span className="text-[#f6a118]">{item.selectedColor}</span></p>
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">
                               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cant:</span>
                               <span className="text-sm font-bold text-gray-600 font-matita">{item.quantity}</span>
                            </div>
                            <span className="text-lg font-bold text-[#f6a118] tracking-tighter">${(item.product.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="absolute -top-1.5 -right-1.5 bg-white text-red-300 w-6 h-6 rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-xl hover:text-red-500 transition-colors">×</button>
                      </div>
                    ))}
                  </div>

                  {user && user.isSocio && user.points > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-gray-50">
                       <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${usePoints ? 'bg-white border-[#fadb31]' : 'bg-transparent border-gray-100 opacity-60'}`}>
                         <div className="flex items-center gap-2.5">
                            <span className="text-2xl">✨</span>
                            <div className="text-left">
                               <p className="text-xs font-bold text-gray-800">Canjear puntos ({user.points})</p>
                               <p className="text-[9px] font-bold text-[#f6a118] uppercase tracking-tighter">Descuento: -${summary.pointsDiscount.toLocaleString()}</p>
                            </div>
                         </div>
                         <button onClick={() => setUsePoints(!usePoints)} className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${usePoints ? 'bg-[#f6a118]' : 'bg-gray-300'}`}>
                           <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${usePoints ? 'translate-x-5' : ''}`} />
                         </button>
                       </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${isGift ? 'bg-white border-[#ea7e9c]' : 'bg-transparent border-gray-100 opacity-60'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🎁</span>
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-800">¿Para regalo? (+$2.000)</p>
                          <p className="text-[9px] font-bold text-[#ea7e9c] uppercase tracking-tighter">Pack especial matita</p>
                        </div>
                      </div>
                      <button onClick={() => setIsGift(!isGift)} className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${isGift ? 'bg-[#ea7e9c]' : 'bg-gray-300'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isGift ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-1.5 pb-16">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] ml-2">Cómo vas a pagar:</p>
                    {PAYMENT_METHODS.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => setPaymentMethod(p.id)} 
                        className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 shadow-sm ${paymentMethod === p.id ? 'bg-white border-[#fadb31] ring-2 ring-[#fadb31]/5' : 'bg-transparent border-transparent text-gray-400 opacity-60'}`}
                      >
                        <span className="text-2xl">{p.icon}</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-800 leading-none mb-1 uppercase tracking-tighter">{p.label}</p>
                          <p className="text-[9px] font-medium text-gray-400 italic leading-none">{p.detail}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* SECCIÓN FINALIZAR COMPRA COMPACTADA */}
            {cart.length > 0 && (
              <div className="p-5 md:p-6 bg-white border-t-[6px] border-[#fef9eb] rounded-t-[2.5rem] shadow-xl space-y-3 shrink-0 z-10">
                <div className={`p-3 rounded-xl border animate-fadeIn transition-all duration-500 ${
                  PAYMENT_METHODS.find(p => p.id === paymentMethod)?.alertBg
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📢</span>
                    <p className="text-[9px] font-bold italic leading-tight uppercase tracking-tight">
                      {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.info}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col">
                    <span className="text-xl md:text-2xl font-logo text-gray-800 leading-none">Total</span>
                    <span className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.1em]">Matita Boutique</span>
                  </div>
                  {/* PRECIO REDUCIDO EN PC: De 5xl a 3xl */}
                  <span className="text-2xl md:text-3xl font-bold tracking-tighter text-[#f6a118] leading-none">${summary.finalTotal.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-full font-bold uppercase tracking-[0.15em] text-lg shadow-md transition-all border-2 border-white ${
                    isProcessing ? 'bg-gray-100 text-gray-400' : 'matita-gradient-pink text-white hover:scale-[1.01] active:scale-95'
                  }`}
                >
                  {isProcessing ? "Sincronizando..." : "Confirmar Reserva ✨"}
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
