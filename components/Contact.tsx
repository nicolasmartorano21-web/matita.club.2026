
import React from 'react';

const Contact: React.FC = () => {
  const whatsappNumber = '5493517587003';
  const igHandle = '@libreriamatita';

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-12 animate-fadeIn px-4">
      <div className="text-center space-y-6">
        <h2 className="text-6xl md:text-7xl font-matita font-bold text-[#f6a118] drop-shadow-sm">¡Visítanos! ✨</h2>
        <p className="text-3xl font-matita text-gray-500 italic">"Te esperamos en nuestro rincón lleno de colores"</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12 items-stretch">
        <div className="lg:col-span-2 bg-[#fef9eb] rounded-[4rem] p-12 shadow-matita space-y-10 border-8 border-white flex flex-col justify-between">
          <div className="space-y-10">
            <div className="flex items-start gap-6">
               <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg border-2 border-orange-50 text-4xl">📍</div>
               <div>
                  <h4 className="text-3xl font-matita font-bold text-gray-800 mb-1">Dirección</h4>
                  <p className="text-2xl font-matita text-gray-600">Librería MATITA</p>
                  <p className="text-2xl font-matita text-[#f6a118] font-bold">La Calera, Córdoba, Arg.</p>
               </div>
            </div>

            <div className="flex items-start gap-6">
               <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg border-2 border-pink-50 text-4xl">⏰</div>
               <div className="space-y-4">
                  <div>
                    <h4 className="text-3xl font-matita font-bold text-gray-800 mb-1">Lunes a Viernes</h4>
                    <p className="text-2xl font-matita text-gray-500">Mañana: <span className="text-[#ea7e9c] font-bold">08:30 – 13:00</span></p>
                    <p className="text-2xl font-matita text-gray-500">Tarde: <span className="text-[#ea7e9c] font-bold">17:00 – 20:30</span></p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-matita font-bold text-gray-800 mb-1">Sábados</h4>
                    <p className="text-2xl font-matita text-gray-500">Mañana: <span className="text-[#fadb31] font-bold">09:30 – 13:00</span></p>
                    <p className="text-2xl font-matita text-gray-500">Tarde: <span className="text-[#fadb31] font-bold">17:00 – 20:00</span></p>
                  </div>
               </div>
            </div>

            <div className="flex items-start gap-6">
               <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg border-2 border-yellow-50 text-4xl">📱</div>
               <div>
                  <h4 className="text-3xl font-matita font-bold text-gray-800 mb-1">Redes y Web</h4>
                  <p className="text-2xl font-matita text-[#f6a118] font-bold">+{whatsappNumber}</p>
                  <p className="text-2xl font-matita text-[#ea7e9c] font-bold underline cursor-pointer">{igHandle}</p>
               </div>
            </div>
          </div>

          <div className="pt-10">
             <a 
               href={`https://wa.me/${whatsappNumber}`} 
               target="_blank" 
               rel="noreferrer"
               className="w-full block text-center py-6 matita-gradient-orange text-white rounded-[2.5rem] font-matita text-3xl font-bold shadow-2xl hover:scale-105 transition-all border-4 border-white"
             >
                ¡Escribinos ahora! 🌸
             </a>
          </div>
        </div>

        <div className="lg:col-span-3 h-[600px] md:h-auto bg-white rounded-[5rem] overflow-hidden shadow-2xl border-[12px] border-white group relative">
           {/* MAPA EXACTO DE MATITA */}
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.893565623194!2d-64.34343842439472!3d-31.361916174286957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d61158a0b1287%3A0xbf3671aeb05d68a5!2sLibrer%C3%ADa%20MATITA!5e0!3m2!1sen!2sar!4v1770595344101!5m2!1sen!2sar" 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
             className="grayscale group-hover:grayscale-0 transition-all duration-1000"
           ></iframe>
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-8 py-4 rounded-full shadow-2xl border-4 border-[#fadb31] pointer-events-none transition-opacity group-hover:opacity-0">
             <p className="text-[#f6a118] font-bold text-xl">📍 Librería MATITA - La Calera</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
