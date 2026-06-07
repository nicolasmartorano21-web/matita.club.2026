
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Coupon } from '../types';
import { triggerConfetti } from '../utils/confetti';

const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', code: 'MATITA10', discount: 1000, pointsRequired: 500 },
  { id: 'c2', code: 'MATITA20', discount: 2500, pointsRequired: 1200 },
  { id: 'c3', code: 'PROMOVIP', discount: 5000, pointsRequired: 2500 },
];

// Segmentos de la ruleta: 6 premios con sus colores temáticos
const WHEEL_SEGMENTS = [
  { label: '10 Pts',  points: 10,  color: '#f6a118', textColor: '#fff' },
  { label: '50 Pts',  points: 50,  color: '#fadb31', textColor: '#555' },
  { label: '20 Pts',  points: 20,  color: '#ea7e9c', textColor: '#fff' },
  { label: '5 Pts',   points: 5,   color: '#93c5fd', textColor: '#fff' },
  { label: '30 Pts',  points: 30,  color: '#86efac', textColor: '#444' },
  { label: '15 Pts',  points: 15,  color: '#f6a118', textColor: '#fff' },
];

const NUM_SEGMENTS = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

const ClubView: React.FC = () => {
  const { user, setUser, supabase, showToast } = useApp();
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastSpinAt, setLastSpinAt] = useState<string | null>(null);
  const [spinResult, setSpinResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);
  const spinRef = useRef(0);

  // Cargar last_spin_at del servidor al montar
  useEffect(() => {
    if (user && user.id && user.id !== 'guest') {
      supabase
        .from('users')
        .select('last_spin_at')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.last_spin_at) setLastSpinAt(data.last_spin_at);
        });
    }
  }, [user, supabase]);

  const canSpinToday = () => {
    if (!lastSpinAt) return true;
    const last = new Date(lastSpinAt);
    const now = new Date();
    return (
      last.getFullYear() !== now.getFullYear() ||
      last.getMonth() !== now.getMonth() ||
      last.getDate() !== now.getDate()
    );
  };

  const handleSpin = async () => {
    if (!user || user.id === 'guest') {
      showToast('Solo socios', 'Iniciá sesión como socio para girar la ruleta 🌸', 'info');
      return;
    }
    if (!canSpinToday()) {
      showToast('Ya giraste hoy', '¡Volvé mañana para otro premio! ⭐', 'info');
      return;
    }
    if (spinning) return;

    // Elegir segmento ganador basado en probabilidad (premios altos son raros)
    const rand = Math.random();
    let winnerIdx = 0;
    if (rand < 0.45) winnerIdx = 3; // 5 Pts (45%)
    else if (rand < 0.75) winnerIdx = 0; // 10 Pts (30%)
    else if (rand < 0.90) winnerIdx = 5; // 15 Pts (15%)
    else if (rand < 0.96) winnerIdx = 2; // 20 Pts (6%)
    else if (rand < 0.99) winnerIdx = 4; // 30 Pts (3%)
    else winnerIdx = 1; // 50 Pts (1%)

    const winner = WHEEL_SEGMENTS[winnerIdx];

    // Calcular rotación: múltiples vueltas + posición exacta del segmento
    // El puntero está en la parte superior (270°). El segmento 0 empieza en 0°.
    // Para que el ganador quede en la parte superior, calculamos su centro.
    const winnerCenter = winnerIdx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const targetAngle = 270 - winnerCenter;
    const extraSpins = 5 * 360; // 5 vueltas completas
    const newRotation = spinRef.current + extraSpins + ((targetAngle - (spinRef.current % 360) + 360) % 360);

    setSpinning(true);
    setSpinResult(null);
    setRotation(newRotation);
    spinRef.current = newRotation;

    // Esperar a que termine la animación CSS (3s)
    setTimeout(async () => {
      setSpinning(false);
      setSpinResult(winner);

      const newPoints = user.points + winner.points;
      const now = new Date().toISOString();

      let isSuccess = false;

      if (user.id === 'admin_local') {
        isSuccess = true;
      } else {
        const { error } = await supabase
          .from('users')
          .update({ points: newPoints, last_spin_at: now })
          .eq('id', user.id);
        isSuccess = !error;
      }

      if (isSuccess) {
        const updatedUser = { ...user, points: newPoints };
        setUser(updatedUser);
        localStorage.setItem('matita_persisted_user', JSON.stringify(updatedUser));
        setLastSpinAt(now);
        triggerConfetti();
        showToast(`¡Ganaste ${winner.points} puntos! 🎉`, `Ahora tenés ${newPoints} puntos en tu cuenta ✨`, 'success');
      } else {
        showToast('Error al guardar', 'No se pudieron guardar tus puntos. Reintentá.', 'error');
      }
    }, 3200);
  };

  // PANTALLA BLOQUEADA PARA NO SOCIOS
  if (user && !user.isSocio) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 animate-fadeIn">
        <div className="bg-white rounded-[5rem] p-16 md:p-24 shadow-matita border-[12px] border-[#ea7e9c]/10 text-center space-y-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-6 matita-gradient-pink"></div>
          <div className="relative">
            <div className="text-[12rem] mb-6 animate-bounce">🔐</div>
          </div>
          <div className="space-y-6">
            <h2 className="text-6xl md:text-7xl font-bold text-gray-800">Espacio Premium</h2>
            <p className="text-2xl md:text-3xl text-gray-500 italic max-w-2xl mx-auto leading-relaxed">
              "Este rincón es exclusivo para nuestros Socios Matita. Únete hoy para canjear tus puntos y girar la ruleta mágica."
            </p>
          </div>
          <div className="pt-10 flex flex-col items-center gap-6">
            <button
              onClick={() => window.open(`https://wa.me/5493517587003?text=${encodeURIComponent("¡Hola Matita! 👋 Quiero ser socio del club para empezar a sumar puntos. ✨")}`, '_blank')}
              className="px-16 py-8 matita-gradient-pink text-white rounded-[2.5rem] text-4xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-white"
            >
              ¡Quiero ser Socio! 🌸
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRedeem = async (coupon: Coupon) => {
    if (!user) return;
    if (user.points < coupon.pointsRequired) {
      showToast('Puntos insuficientes', '¡Aún te faltan algunos puntos para este cupón! 🌸', 'info');
      return;
    }

    setRedeeming(coupon.id);
    const newPoints = user.points - coupon.pointsRequired;

    const { error } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, points: newPoints });
      navigator.clipboard.writeText(coupon.code).catch(() => {});
      showToast(`¡Código copiado! 🎫`, `Tu código es: ${coupon.code}. Guardalo para usarlo en tu próxima reserva ✨`, 'success');
    } else {
      showToast('Error al canjear', 'Ups, algo falló. Reintentá pronto ❌', 'error');
    }
    setRedeeming(null);
  };

  // Generar el SVG de la ruleta
  const wheelSize = 280;
  const cx = wheelSize / 2;
  const cy = wheelSize / 2;
  const r = wheelSize / 2 - 4;

  const polarToCartesian = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle, r);
    const end = polarToCartesian(endAngle, r);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  const alreadySpun = !canSpinToday();

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-12 animate-fadeIn px-4 md:px-6">

      {/* Card de Usuario */}
      <div className="matita-gradient-orange rounded-[4rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border-[10px] border-white">
        <div className="absolute -top-10 -right-10 p-20 opacity-10 transform rotate-12">
          <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold">¡Hola, {user?.name}! ✨</h2>
            <p className="text-xl md:text-2xl opacity-90 font-bold uppercase tracking-widest mt-2">Mundo Club Matita</p>
          </div>
          <div className="flex items-end gap-4 bg-white/20 backdrop-blur-md px-8 py-6 rounded-[2.5rem] border-2 border-white/30 inline-flex">
            <span className="text-7xl md:text-9xl font-bold tracking-tighter leading-none">{user?.points}</span>
            <span className="text-2xl md:text-3xl font-bold italic uppercase tracking-widest opacity-80 mb-3 text-orange-100">Puntos</span>
          </div>
        </div>
      </div>

      {/* ✨ RULETA DE LA SUERTE */}
      <div className="bg-white rounded-[4rem] p-8 md:p-14 shadow-matita border-[8px] border-white text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#f6a118] via-[#ea7e9c] to-[#fadb31]"></div>
        <div>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-800">Ruleta de la Suerte 🎡</h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
            {alreadySpun ? '¡Ya giraste hoy! Volvé mañana ⭐' : 'Un giro por día • Ganás puntos extra'}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          {/* Contenedor de la ruleta con puntero */}
          <div className="relative" style={{ width: wheelSize + 32, height: wheelSize + 32 }}>

            {/* Puntero triangular en la parte superior */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{ top: 0 }}
            >
              <div
                style={{
                  width: 0, height: 0,
                  borderLeft: '14px solid transparent',
                  borderRight: '14px solid transparent',
                  borderTop: '28px solid #ea7e9c',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />
            </div>

            {/* Ruleta SVG animada */}
            <div
              className="absolute inset-4"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 3.2s cubic-bezier(0.17, 0.67, 0.12, 1)' : 'none',
                borderRadius: '50%',
                boxShadow: '0 8px 40px rgba(246,161,24,0.3)',
              }}
            >
              <svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
                {WHEEL_SEGMENTS.map((seg, i) => {
                  const startAngle = i * SEGMENT_ANGLE - 90;
                  const endAngle = startAngle + SEGMENT_ANGLE;
                  const midAngle = startAngle + SEGMENT_ANGLE / 2;
                  const textPos = polarToCartesian(midAngle, r * 0.65);
                  return (
                    <g key={i}>
                      <path d={describeArc(startAngle, endAngle)} fill={seg.color} stroke="white" strokeWidth="3" />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={seg.textColor}
                        fontSize="13"
                        fontWeight="bold"
                        fontFamily="system-ui"
                        transform={`rotate(${midAngle + 90}, ${textPos.x}, ${textPos.y})`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
                {/* Centro de la ruleta */}
                <circle cx={cx} cy={cy} r={18} fill="white" stroke="#fadb31" strokeWidth="4" />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14">✨</text>
              </svg>
            </div>
          </div>

          {/* Resultado */}
          {spinResult && !spinning && (
            <div className="bg-[#fdfaf6] border-4 border-[#fadb31] rounded-2xl px-8 py-4 animate-fadeIn">
              <p className="text-2xl font-bold text-gray-800">
                ¡Ganaste <span className="text-[#f6a118]">{spinResult.points} puntos</span>! 🎉
              </p>
            </div>
          )}

          {/* Botón girar */}
          <button
            onClick={handleSpin}
            disabled={spinning || alreadySpun}
            className={`px-12 py-5 rounded-full text-2xl font-black shadow-xl uppercase tracking-wider transition-all border-b-4 ${
              alreadySpun
                ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                : spinning
                ? 'bg-[#fadb31] text-gray-600 border-yellow-400 animate-pulse cursor-wait'
                : 'matita-gradient-orange text-white border-orange-700 hover:scale-105 active:scale-95'
            }`}
          >
            {alreadySpun ? 'Volvé mañana ⭐' : spinning ? 'Girando...' : 'Girar Ruleta 🎡'}
          </button>
        </div>
      </div>

      {/* Cupones */}
      <div className="space-y-12">
        <h3 className="text-4xl md:text-5xl font-bold text-gray-800 text-center">Tus Beneficios 🎁</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
