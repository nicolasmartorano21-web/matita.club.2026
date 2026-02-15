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
 * Aquí definimos los colores y mensajes de los avisos dinámicos.
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

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      const variant = item.product.colors.find(c => c.color === item.selectedColor);
      const stock = variant ? variant.stock : 0;
      const nextQty = item.quantity + delta;

      if (nextQty < 1) return prev;
      if (nextQty > stock) {
        alert(`¡Ups! Solo quedan ${stock} unidades. ✨`);
        return prev;
      }
      item.quantity = nextQty;
      updated[index] = item;
      return updated;
    });
  };

  /**
   * handleCheckout: AQUÍ SE PROCESA EL DESCUENTO DE STOCK Y LA VENTA
   */
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const selectedPay = PAYMENT_METHODS.find(p => p.id === paymentMethod);
      
      // 1. DESCUENTO DE STOCK REAL EN BASE DE DATOS
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

      // 2. REGISTRO DE LA VENTA (PARA GRÁFICOS DEL ADMIN)
      await supabase.from('sales').insert({
        total: summary.finalTotal,
        user_name: user?.name || 'Invitado',
        category_summary: cart.map(i => i.product.category).join(', '),
        created_at: new Date().toISOString()
      });

      // 3. DESCUENTO DE PUNTOS
      if (user && usePoints && summary.pointsToDeduct > 0) {
        await supabase.from('users').update({ points: Math.max(0, user.points - summary.pointsToDeduct) }).eq('id', user.id);
      }

      // 4. ENVÍO A WHATSAPP
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
      alert("¡Reserva confirmada y stock descontado con éxito! ✨");

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
          <div className="fixed right-0 top-0 h-full w-full sm:w-[38rem] bg-[#fdfaf6] shadow-2xl z-[200] flex flex-col border-l-[12px] border-[#fadb31] animate-slideUp overflow-hidden">
            
            <div className="p-8 md:p-10 matita-gradient-orange text-white flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h3 className="text-4xl md:text-5xl font-logo uppercase tracking-tighter leading-none">Mi Bolsa.</h3>
                <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-80 mt-1">Librería & Club Matita</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-3 bg-white/20 rounded-full active:scale-90">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-10 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="text-center py-40 flex flex-col items-center opacity-40">
                  <div className="text-[10rem] mb-6 animate-pulse">🛒</div>
                  <p className="text-3xl font-bold italic text-gray-400 font-matita">Tu bolsa está vacía...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] ml-4">Items en la bolsa:</p>
                    {cart.map((item, idx) => (
                      <div key={`${item.product.id}-${idx}`} className="bg-white p-5 rounded-[2.5rem] shadow-sm border-2 border-white flex gap-5 items-center relative animate-fadeIn group">
                        <div className="w-20 h-20 bg-[#fef9eb] rounded-2xl overflow-hidden flex items-center justify-center border border-gray-50">
                          <img src={getImgUrl(item.product.images[0], 150)} className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-lg font-bold text-gray-800 leading-tight truncate font-matita uppercase">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Color: <span className="text-[#f6a118]">{item.selectedColor}</span></p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                               <button onClick={() => updateQuantity(idx, -1)} className="text-2xl font-bold text-[#ea7e9c] hover:scale-125 transition-transform">-</button>
                               <span className="text-xl font-bold w-6 text-center text-gray-600 font-matita">{item.quantity}</span>
                               <button onClick={() => updateQuantity(idx, 1)} className="text-2xl font-bold text-[#f6a118] hover:scale-125 transition-transform">+</button>
                            </div>
                            <span className="text-2xl font-bold text-[#f6a118] tracking-tighter">${(item.product.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="absolute -top-2 -right-2 bg-white text-red-200 w-10 h-10 rounded-full shadow-lg border border-gray-50 flex items-center justify-center text-2xl">×</button>
                      </div>
                    ))}
                  </div>

                  {user && user.isSocio && user.points > 0 && (
                    <div className="space-y-4 pt-4 border-t-2 border-gray-50">
                       <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] ml-4">Club Matita ✨</p>
                       <div className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between shadow-sm ${usePoints ? 'bg-white border-[#fadb31] ring-4 ring-[#fadb31]/5' : 'bg-transparent border-gray-200 opacity-60'}`}>
                         <div className="flex items-center gap-4">
                            <span className="text-4xl">✨</span>
                            <div className="text-left">
                               <p className="text-lg font-bold text-gray-800">Canjear mis puntos ({user.points})</p>
                               <p className="text-xs font-bold text-[#f6a118] uppercase tracking-tighter">Descuento: -${summary.pointsDiscount.toLocaleString()}</p>
                            </div>
                         </div>
                         <button onClick={() => setUsePoints(!usePoints)} className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${usePoints ? 'bg-[#f6a118]' : 'bg-gray-300'}`}>
                           <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${usePoints ? 'translate-x-7' : ''}`} />
                         </button>
                       </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between shadow-sm ${isGift ? 'bg-white border-[#ea7e9c] ring-4 ring-[#ea7e9c]/5' : 'bg-transparent border-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">🎁</span>
                        <div className="text-left">
                          <p className="text-lg font-bold text-gray-800">¿Es para regalo? (+$2.000)</p>
                          <p className="text-xs font-bold text-[#ea7e9c] uppercase tracking-tighter">Incluye bolsa matita y tarjetita</p>
                        </div>
                      </div>
                      <button onClick={() => setIsGift(!isGift)} className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${isGift ? 'bg-[#ea7e9c]' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isGift ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 pb-32">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] ml-4">Método de Pago:</p>
                    {PAYMENT_METHODS.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => setPaymentMethod(p.id)} 
                        className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-5 shadow-sm ${paymentMethod === p.id ? 'bg-white border-[#fadb31] ring-4 ring-[#fadb31]/10' : 'bg-transparent border-white text-gray-400 opacity-60'}`}
                      >
                        <span className="text-4xl">{p.icon}</span>
                        <div className="text-left">
                          <p className="text-xl font-bold text-gray-800 leading-none mb-1">{p.label}</p>
                          <p className="text-xs font-medium text-gray-400 italic">{p.detail}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 md:p-10 bg-white border-t-[8px] border-[#fef9eb] rounded-t-[4rem] shadow-xl space-y-6 shrink-0 z-10">
                
                {/* CARTELITO NOTORIO DINÁMICO */}
                <div className={`p-6 rounded-[2.5rem] border-2 animate-fadeIn transition-all duration-500 shadow-inner ${
                  PAYMENT_METHODS.find(p => p.id === paymentMethod)?.alertBg
                }`}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">📢</span>
                    <p className="text-base font-bold italic leading-tight uppercase tracking-tight">
                      {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.info}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-5xl font-logo text-gray-800">Total</span>
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-1">Sujeto a Stock Real</span>
                  </div>
                  <span className="text-6xl md:text-7xl font-bold tracking-tighter text-[#f6a118] leading-none">${summary.finalTotal.toLocaleString()}</span>
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={isProcessing}
                  className={`w-full py-7 rounded-full font-bold uppercase tracking-[0.3em] text-2xl shadow-2xl transition-all border-4 border-white ${
                    isProcessing ? 'bg-gray-100 text-gray-400' : 'matita-gradient-pink text-white hover:scale-[1.03] active:scale-95'
                  }`}
                >
                  {isProcessing ? "Sincronizando Stock..." : "Confirmar Reserva ✨"}
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
