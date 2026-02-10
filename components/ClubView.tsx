
import React, { useState } from 'react';
import { useApp } from '../App';
import { Coupon } from '../types';

const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', code: 'MATITA10', discount: 1000, pointsRequired: 500 },
  { id: 'c2', code: 'MATITA20', discount: 2500, pointsRequired: 1200 },
  { id: 'c3', code: 'PROMOVIP', discount: 5000, pointsRequired: 2500 },
];

const ClubView: React.FC = () => {
  const { user, setUser, supabase } = useApp();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  // LOGICA DE BLOQUEO PARA NO SOCIOS
  if (user && !user.isSocio) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 animate-fadeIn">
        <div className="bg-white rounded-[5rem] p-16 md:p-24 shadow-matita border-[12px] border-[#ea7e9c]/10 text-center space-y-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-6 matita-gradient-pink"></div>
          
          <div className="relative">
            <div className="text-[12rem] mb-6 animate-bounce">🔐</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-100/50 rounded-full blur-3xl -z-10"></div>
          </div>

          <div className="space-y-6">
            <h2 className="text-6xl md:text-7xl font-bold text-gray-800">Espacio Premium</h2>
            <p className="text-2xl md:text-3xl text-gray-500 italic max-w-2xl mx-auto leading-relaxed">
              "Este rincón es exclusivo para nuestros **Socios Matita**. Únete hoy para canjear tus puntos por regalos mágicos y descuentos."
            </p>
          </div>

          <div className="pt-10 flex flex-col items-center gap-6">
            <button 
              onClick={() => window.open(`https://wa.me/5493517587003?text=${encodeURIComponent("¡Hola Matita! 👋 Quiero ser socio del club para empezar a sumar puntos. ✨")}`, '_blank')}
              className="px-16 py-8 matita-gradient-pink text-white rounded-[2.5rem] text-4xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-white"
            >
              ¡Quiero ser Socio! 🌸
            </button>
            <p className="text-gray-300 font-bold uppercase tracking-[0.3em] text-sm">Cada compra suma magia a tu cuenta</p>
          </div>
        </div>
      </div>
    );
  }

  const handleRedeem = async (coupon: Coupon) => {
    if (!user) return;
    if (user.points < coupon.pointsRequired) {
      alert('¡Aún te faltan algunos puntos para este cupón! 🌸');
      return;
    }

    if (window.confirm(`¿Canjear ${coupon.pointsRequired} puntos por $${coupon.discount} OFF?`)) {
      setRedeeming(coupon.id);
      const newPoints = user.points - coupon.pointsRequired;

      const { error } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', user.id);
      
      if (!error) {
        setUser({ ...user, points: newPoints });
        alert(`¡Genial! Tu código es ${coupon.code}. Se copió al portapapeles ✨`);
        navigator.clipboard.writeText(coupon.code);
      } else {
        alert('Ups, algo falló al canjear. Reintenta pronto ❌');
      }
      setRedeeming(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-12 animate-fadeIn px-6">
      {/* Card de Usuario */}
      <div className="matita-gradient-orange rounded-[4rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden border-[10px] border-white">
        <div className="absolute -top-10 -right-10 p-20 opacity-10 transform rotate-12">
          <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-bold">¡Hola, {user?.name}! ✨</h2>
            <p className="text-2xl md:text-3xl opacity-90 font-bold uppercase tracking-widest mt-2">Mundo Club Matita</p>
          </div>
          <div className="flex items-end gap-6 bg-white/20 backdrop-blur-md p-8 rounded-[3rem] border-2 border-white/30 inline-flex">
            <span className="text-8xl md:text-[10rem] font-bold tracking-tighter leading-none">{user?.points}</span>
            <span className="text-3xl md:text-4xl font-bold italic uppercase tracking-widest opacity-80 mb-4 text-orange-100">Puntos</span>
          </div>
        </div>
      </div>

      {/* Cupones */}
      <div className="space-y-12">
        <h3 className="text-5xl md:text-6xl font-bold text-gray-800 text-center">Tus Beneficios 🎁</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {MOCK_COUPONS.map(coupon => (
            <div 
              key={coupon.id} 
              className="bg-white border-8 border-dashed border-[#fadb31] rounded-[3.5rem] p-10 text-center space-y-8 shadow-xl hover:scale-105 transition-all group"
            >
              <div className="text-8xl group-hover:scale-125 transition-transform">🎫</div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold text-gray-800">${coupon.discount} OFF</h4>
                <p className="text-xl text-gray-400 font-bold tracking-widest uppercase">Canje: {coupon.pointsRequired} Pts</p>
              </div>
              <button 
                onClick={() => handleRedeem(coupon)}
                disabled={redeeming === coupon.id || (user?.points || 0) < coupon.pointsRequired}
                className={`w-full py-6 rounded-[2rem] text-3xl font-bold shadow-xl transition-all ${
                  (user?.points || 0) < coupon.pointsRequired
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'matita-gradient-pink text-white hover:shadow-2xl active:scale-95'
                }`}
              >
                {redeeming === coupon.id ? 'Canjeando...' : '¡Lo Quiero! ✨'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubView;
