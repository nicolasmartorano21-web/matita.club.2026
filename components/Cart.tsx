
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { CartItem, User, Coupon } from '../types';

const getImgUrl = (id: string, w = 150) => {
  if (!id) return "";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: '💵', detail: 'Abonás al retirar' },
  { id: 'transferencia', label: 'Transferencia', icon: '🏦', detail: 'Alias: Matita.2020.mp o Matita.2023' },
  { id: 'tarjeta', label: 'Tarjeta / Link', icon: '💳', detail: 'Cuotas disponibles' }
];

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, user, supabase } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  const GIFT_WRAP_PRICE = 2000;
  const POINTS_CONVERSION = 0.5;
  const MIN_PURCHASE_FOR_BIENVENIDA = 15000;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (code === 'BIENVENIDA') {
      if (subtotal < MIN_PURCHASE_FOR_BIENVENIDA) {
        alert(`¡Falta poco! El cupón BIENVENIDA es para compras mayores a $${MIN_PURCHASE_FOR_BIENVENIDA.toLocaleString()}.`);
        return;
      }
      setAppliedDiscount(0.15);
      alert('¡Bienvenido! 15% de descuento aplicado. ✨');
    } else alert('Cupón no válido 🌸');
  };

  const couponReduction = subtotal * appliedDiscount;
  const cashDiscountValue = 0; // Descuento del 10% eliminado según solicitud
  const maxPointsDiscount = subtotal * 0.5; 
  const pointsDiscountValue = user && usePoints ? Math.min(user.points * POINTS_CONVERSION, maxPointsDiscount) : 0;
  const pointsUsed = pointsDiscountValue / POINTS_CONVERSION;

  const total = Math.max(0, subtotal - couponReduction - pointsDiscountValue - cashDiscountValue + (isGift ? GIFT_WRAP_PRICE : 0));

  const handleCheckout = async () => {
    const selectedPay = PAYMENT_METHODS.find(p => p.id === paymentMethod);
    if (user && usePoints && pointsUsed > 0) {
      await supabase.from('users').update({ points: user.points - pointsUsed }).eq('id', user.id);
    }
    const message = `*✨ PEDIDO MATITA BOUTIQUE ✨*\n` +
      `👤 *Cliente:* ${user?.name || 'Invitado'}\n\n` +
      cart.map(item => `📍 *${item.product.name}* (${item.selectedColor}) - $${item.product.price.toLocaleString()}`).join('\n') +
      `\n\n💰 *TOTAL FINAL: $${total.toLocaleString()}*\n` +
      `💳 *PAGO:* ${selectedPay?.label}\n` +
      (paymentMethod === 'transferencia' ? `🏦 *ALIAS:* Matita.2020.mp o Matita.2023\n` : '') +
      `📍 *RETIRO:* La Calera, CBA.\n\n¿Me confirman si tienen stock? ¡Gracias! ✨`;
    
    window.open(`https://wa.me/5493517587003?text=${encodeURIComponent(message)}`, '_blank');
    clearCart();
    setIsOpen(false);
  };

  return (
    <>
      {/* TRIGGER FLOTANTE */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-20 h-20 md:w-24 md:h-24 bg-[#ea7e9c] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all relative"
      >
        <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#f6a118] text-white text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-4 border-white animate-bounce">
            {cart.length}
          </span>
        )}
      </button>

      {/* DRAWER DEL CARRITO */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md animate-fadeIn" onClick={() => setIsOpen(false)}></div>
          <div className="fixed right-0 top-0 h-full w-full sm:w-[35rem] bg-[#fdfaf6] shadow-2xl z-[200] flex flex-col border-l-8 border-[#fadb31] animate-slideUp overflow-hidden">
            
            {/* Header Fijo */}
            <div className="p-10 matita-gradient-orange text-white flex justify-between items-center shadow-lg shrink-0">
              <h3 className="text-5xl font-logo">Tu Bolsa.</h3>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-3 bg-white/20 rounded-full">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
              </button>
            </div>

            {/* Cuerpo con Scroll */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="text-center py-40 opacity-30">
                  <div className="text-9xl mb-4">🛒</div>
                  <p className="text-3xl font-bold italic">La bolsa está vacía...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-white p-5 rounded-[2.5rem] shadow-sm border-2 border-white group">
                        <img src={getImgUrl(item.product.images[0], 200)} className="w-20 h-20 rounded-2xl object-cover" alt={item.product.name} />
                        <div className="flex-grow">
                          <h4 className="text-xl font-bold text-gray-800 leading-tight">{item.product.name}</h4>
                          <p className="text-xs text-gray-300 font-bold uppercase">{item.selectedColor}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-2xl font-bold text-[#f6a118]">${item.product.price.toLocaleString()}</span>
                            <button onClick={() => removeFromCart(idx)} className="text-red-200 hover:text-red-500">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-4">Cómo pagas</p>
                    {PAYMENT_METHODS.map(p => (
                      <button key={p.id} onClick={() => setPaymentMethod(p.id)} className={`w-full p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${paymentMethod === p.id ? 'bg-white border-[#f6a118] shadow-md' : 'bg-gray-50 border-transparent text-gray-400 opacity-60'}`}>
                        <span className="text-3xl">{p.icon}</span>
                        <div className="text-left">
                          <p className="text-lg font-bold text-gray-800 leading-none">{p.label}</p>
                          <p className="text-xs font-bold italic">{p.detail}</p>
                        </div>
                      </button>
                    ))}
                    
                    {paymentMethod === 'transferencia' && (
                      <p className="px-6 py-2 text-center text-xs text-gray-400 italic font-bold animate-fadeIn">
                        ✨ Si transferís, por favor enviá el comprobante por WhatsApp
                      </p>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🎁</span>
                        <p className="text-lg font-bold">¿Es un regalo? <span className="text-[10px] text-[#ea7e9c] block">+$2.000 Pack Premium</span></p>
                      </div>
                      <button onClick={() => setIsGift(!isGift)} className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isGift ? 'bg-[#ea7e9c]' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isGift ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Fijo al Final */}
            {cart.length > 0 && (
              <div className="p-10 bg-white border-t-2 border-gray-50 rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] space-y-6 shrink-0 z-10">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-4xl font-logo lowercase leading-none">Total</span>
                    <span className="text-[10px] text-gray-400 italic">Precios sujetos a stock</span>
                  </div>
                  <span className="text-6xl font-bold tracking-tighter text-[#f6a118]">${total.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleCheckout} 
                  className="w-full matita-gradient-pink text-white py-8 rounded-full font-bold uppercase tracking-[0.3em] text-2xl hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                  Finalizar Reserva ✨
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
