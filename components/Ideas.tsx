
import React, { useState } from 'react';
import { useApp } from '../App';

const Ideas: React.FC = () => {
  const { supabase } = useApp();
  const [userName, setUserName] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('ideas')
      .insert({
        user_name: userName,
        title: ideaTitle,
        content: content,
        status: 'pending'
      });

    if (!error) {
      setIsSent(true);
      setTimeout(() => {
        setUserName('');
        setIdeaTitle('');
        setContent('');
        setIsSent(false);
      }, 3000);
    } else {
      alert('Error al enviar la idea: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 animate-fadeIn">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-[#fadb31] rounded-full mx-auto flex items-center justify-center shadow-lg animate-bounce">
           <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-5xl font-matita font-bold text-[#f6a118]">Buzón de Ideas Mágico</h2>
        <p className="text-2xl font-matita text-gray-500">¿Hay algo que te gustaría que traigamos a Matita? Cuéntanos tus deseos papeleros y haremos lo posible por cumplirlos ✨</p>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-matita border-4 border-white p-10 md:p-16 relative overflow-hidden">
        {isSent && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-10 flex flex-col items-center justify-center animate-fadeIn text-center space-y-4">
             <div className="text-6xl">✨</div>
             <p className="text-3xl font-matita font-bold text-[#f6a118]">¡Idea Enviada!</p>
             <p className="text-xl font-matita text-gray-400">Nuestro equipo ya está revisando tu sugerencia.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="font-matita text-2xl text-gray-400 ml-2">Tu Nombre</label>
              <input 
                type="text" 
                required
                className="w-full px-8 py-4 rounded-3xl border-2 border-gray-100 focus:border-[#fadb31] outline-none font-matita text-xl transition-all"
                placeholder="Ej: Sofi"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-matita text-2xl text-gray-400 ml-2">¿Qué quieres que traigamos?</label>
              <input 
                type="text" 
                required
                className="w-full px-8 py-4 rounded-3xl border-2 border-gray-100 focus:border-[#fadb31] outline-none font-matita text-xl transition-all"
                placeholder="Ej: Stickers de gatitos"
                value={ideaTitle}
                onChange={e => setIdeaTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-matita text-2xl text-gray-400 ml-2">Danos más detalles...</label>
            <textarea 
              required
              rows={6}
              className="w-full px-8 py-4 rounded-3xl border-2 border-gray-100 focus:border-[#fadb31] outline-none font-matita text-xl transition-all"
              placeholder="Cuéntanos por qué te gustaría y cómo lo imaginas..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 matita-gradient-orange text-white rounded-[2.5rem] font-matita text-3xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Mandar idea al buzón ✨'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
         {[
           { icon: "🎨", text: "Nuevos diseños" },
           { icon: "🖋️", text: "Útiles específicos" },
           { icon: "📅", text: "Agendas especiales" }
         ].map((item, i) => (
           <div key={i} className="bg-[#fadb31]/10 p-6 rounded-[2rem] text-center space-y-2 border border-[#fadb31]/20">
              <span className="text-4xl">{item.icon}</span>
              <p className="font-matita text-xl font-bold text-gray-600">{item.text}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Ideas;
