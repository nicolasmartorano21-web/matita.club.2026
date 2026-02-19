import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, User } from '../types';
import { useApp } from '../App';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie 
} from 'recharts';
import { 
  Settings, Package, Users, Lightbulb, Image as ImageIcon, 
  LogOut, Plus, Trash2, Edit3, Save, Search, Upload, 
  Download, Copy, Key, ShieldCheck, UserCog 
} from 'lucide-react';

// LIBRERÍAS EXTERNAS (Asegurate de que estén en tu package.json)
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * UTILERÍA DE IMÁGENES CLOUDINARY
 */
const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

// --- COMPONENTE PRINCIPAL ---
const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inventory' | 'sales' | 'socios' | 'ideas' | 'design' | 'carousel'
  >('dashboard');

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'matita2026') setIsAuthenticated(true);
    else alert('Contraseña incorrecta ❌');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-6">
        <div className="max-w-md w-full bg-white rounded-[4rem] p-12 shadow-2xl border-8 border-white text-center space-y-8 animate-fadeIn">
          <div className="text-8xl">👑</div>
          <h2 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Panel Maestro</h2>
          <form onSubmit={handleAdminAuth} className="space-y-6">
            <input
              type="password"
              placeholder="CLAVE MATITA"
              className="w-full text-3xl text-center shadow-inner py-5 bg-[#fef9eb] rounded-3xl outline-none uppercase font-bold border-4 border-transparent focus:border-[#fadb31] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-3xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all uppercase">
              ENTRAR
            </button>
          </form>
          <button onClick={() => navigate('/')} className="text-gray-400 font-bold uppercase underline text-xs">Volver a la Tienda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto py-10 px-4 space-y-10 font-matita animate-fadeIn">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b-8 border-[#fadb31]/20 pb-10">
        <div>
          <h2 className="text-6xl md:text-8xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">
            Gestión <span className="text-gray-800">MATITA</span>
          </h2>
          <p className="text-2xl text-gray-400 font-bold uppercase tracking-[0.3em] mt-4">Control de Mando Real ✏️</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-4 rounded-[3rem] shadow-xl border-4 border-white">
          {[
            { id: 'dashboard', label: '📊 Stats' },
            { id: 'inventory', label: '📦 Stock' },
            { id: 'sales', label: '💸 Ventas' },
            { id: 'socios', label: '👥 Socios' },
            { id: 'ideas', label: '💡 Ideas' },
            { id: 'design', label: '🎨 Marca' },
            { id: 'carousel', label: '🖼️ Inicio' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 rounded-[1.8rem] text-lg font-black transition-all uppercase ${activeTab === tab.id ? 'matita-gradient-orange text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
          <button onClick={() => setIsAuthenticated(false)} className="px-6 py-4 bg-red-50 text-red-400 rounded-[1.8rem] font-black uppercase hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE VISTAS */}
      <div className="bg-white rounded-[4rem] md:rounded-[5rem] shadow-matita p-8 md:p-16 border-[12px] border-white min-h-[700px]">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'sales' && <SalesManager />}
        {activeTab === 'socios' && <SociosManager />}
        {activeTab === 'ideas' && <IdeasManager />}
        {activeTab === 'design' && <DesignManager />}
        {activeTab === 'carousel' && <CarouselManager />}
      </div>
    </div>
  );
};

// --- COMPONENTE: DASHBOARD (ESTADÍSTICAS) ---
const Dashboard: React.FC = () => {
  const { supabase } = useApp();
  const [stats, setStats] = useState<any>({ history: [], cats: [], low: [], counts: { sales: 0, users: 0, prods: 0 } });

  useEffect(() => {
    const fetch = async () => {
      const { data: s } = await supabase.from('sales').select('*').order('created_at', { ascending: true });
      const { count: u } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { data: p } = await supabase.from('products').select('*');
      
      if (s && p) {
        const history = s.map((v: any) => ({ date: new Date(v.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }), total: v.total }));
        const cats: any = {};
        s.forEach((v: any) => { cats[v.category_summary || 'Varios'] = (cats[v.category_summary || 'Varios'] || 0) + v.total; });
        setStats({
          history,
          cats: Object.keys(cats).map(k => ({ name: k, val: cats[k] })),
          low: p.filter((item: any) => (item.colors?.reduce((a: number, b: any) => a + (Number(b.stock) || 0), 0) || 0) < 5),
          counts: { sales: s.reduce((a, b) => a + b.total, 0), users: u || 0, prods: p.length }
        });
      }
    };
    fetch();
  }, [supabase]);

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#fef9eb] p-12 rounded-[3.5rem] border-4 border-white shadow-sm text-center">
          <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Ventas Totales</p>
          <p className="text-6xl font-black text-[#f6a118]">${stats.counts.sales.toLocaleString()}</p>
        </div>
        <div className="bg-[#fff1f2] p-12 rounded-[3.5rem] border-4 border-white shadow-sm text-center">
          <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Socios Activos</p>
          <p className="text-6xl font-black text-[#ea7e9c]">{stats.counts.users}</p>
        </div>
        <div className="bg-[#f0f9ff] p-12 rounded-[3.5rem] border-4 border-white shadow-sm text-center">
          <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Items Catálogo</p>
          <p className="text-6xl font-black text-blue-400">{stats.counts.prods}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white h-[450px]">
          <h4 className="text-3xl font-black mb-8 uppercase tracking-tighter">Tendencia de Ventas 💸</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#ccc" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="total" stroke="#f6a118" strokeWidth={5} fill="#fadb31" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white h-[450px]">
          <h4 className="text-3xl font-black mb-8 uppercase tracking-tighter">Categorías Top 🏷️</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.cats}>
              <XAxis dataKey="name" fontSize={10} fontStyle="bold" />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="val" radius={[15, 15, 0, 0]}>
                {stats.cats.map((_: any, i: number) => <Cell key={i} fill={['#f6a118', '#ea7e9c', '#fadb31', '#93c5fd'][i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE: INVENTORY MANAGER (IMPORTACIÓN MASIVA) ---
const InventoryManager: React.FC = () => {
  const { supabase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formMode, setFormMode] = useState<'list' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    let q = supabase.from('products').select('*');
    if (searchTerm) q = q.ilike('name', `%${searchTerm}%`);
    const { data } = await q.order('created_at', { ascending: false });
    if (data) setProducts(data.map((p: any) => ({ ...p, oldPrice: p.old_price, images: p.images || [], colors: p.colors || [] })));
    setIsLoading(false);
  }, [supabase, searchTerm]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleMassImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    let newItems: any[] = [];

    try {
      if (ext === 'xlsx' || ext === 'xls') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        newItems = json.map(row => {
          const keys = Object.keys(row);
          const findKey = (words: string[]) => keys.find(k => words.some(w => k.toLowerCase().includes(w)));
          const nameK = findKey(['nom', 'art', 'item', 'tit']) || keys[0];
          const priceK = findKey(['prec', 'val', 'cost', 'monto']) || keys[1];
          const descK = findKey(['desc', 'info', 'detal']) || keys[2];
          const catK = findKey(['cat', 'rubro', 'tipo']);

          return {
            name: String(row[nameK] || 'Sin Nombre').trim().toUpperCase(),
            price: Number(String(row[priceK]).replace(/[^0-9.]/g, '')) || 0,
            description: row[descK] ? String(row[descK]) : "",
            category: row[catK] ? String(row[catK]) : "Escolar",
            colors: [{ color: 'Único', stock: 10 }],
            images: []
          };
        });
      } else if (ext === 'pdf') {
        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((it: any) => it.str).join(" ") + "\n";
        }
        const lines = fullText.split("\n");
        newItems = lines.map(l => {
          const match = l.match(/^(.+?)\s+[\$]?\s?(\d+[\d\.,]*)$/);
          if (match) {
            return {
              name: match[1].trim().toUpperCase(),
              price: parseFloat(match[2].replace(',', '.')) || 0,
              description: "Importado de PDF",
              category: "Escolar",
              colors: [{ color: 'Único', stock: 5 }],
              images: []
            };
          }
          return null;
        }).filter(i => i !== null);
      }

      if (newItems.length > 0) {
        if (confirm(`¿Subir ${newItems.length} productos al catálogo?`)) {
          await supabase.from('products').insert(newItems);
          fetchProducts();
          alert("¡Importación terminada! ✨");
        }
      } else {
        alert("No se detectaron datos legibles. Verificá el formato.");
      }
    } catch (err) { alert("Error procesando archivo."); }
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!editingProduct?.name) return alert("¡El nombre es obligatorio!");
    const payload = {
      ...editingProduct,
      price: Number(editingProduct.price),
      old_price: Number(editingProduct.oldPrice),
      points: Number(editingProduct.points),
      colors: editingProduct.colors?.map(c => ({ ...c, stock: Number(c.stock) }))
    };
    const { error } = editingProduct.id 
      ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
      : await supabase.from('products').insert(payload);
    
    if (!error) {
      alert("¡Tesoro guardado! 🌸");
      setFormMode('list');
      fetchProducts();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const uploadedIds: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Matita_web");
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.public_id) uploadedIds.push(data.public_id);
    }
    setEditingProduct(prev => ({ ...prev!, images: [...(prev?.images || []), ...uploadedIds] }));
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-4xl font-black uppercase tracking-tighter">Inventario Vital 📦</h3>
            <input type="file" ref={importInputRef} className="hidden" accept=".xlsx,.xls,.pdf" onChange={handleMassImport} />
            <button onClick={() => importInputRef.current?.click()} className="text-[#ea7e9c] font-black text-xs underline uppercase tracking-widest hover:text-red-500">
              IMPORTAR EXCEL O PDF ⬆️
            </button>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-96">
              <Search className="absolute left-4 top-4 text-gray-300" />
              <input 
                type="text" 
                placeholder="BUSCAR PRODUCTO..." 
                className="w-full p-4 pl-12 rounded-2xl border-4 border-gray-50 bg-gray-50 focus:bg-white focus:border-[#fadb31] outline-none font-bold uppercase transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingProduct({ name: '', price: 0, category: 'Escolar', colors: [{ color: 'Único', stock: 10 }], images: [] }); setFormMode('edit'); }}
              className="px-10 py-4 matita-gradient-orange text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all uppercase"
            >
              + NUEVO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[3rem] border-8 border-gray-50 shadow-sm hover:border-[#fadb31] transition-all group flex flex-col">
              <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 bg-gray-50 relative">
                <img src={getImgUrl(p.images[0], 300)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="p-3 bg-white rounded-full shadow-xl text-blue-400 hover:scale-110"><Edit3 size={20}/></button>
                   <button onClick={async () => { if(confirm('¿BORRAR?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="p-3 bg-white rounded-full shadow-xl text-red-400 hover:scale-110"><Trash2 size={20}/></button>
                </div>
              </div>
              <h4 className="text-sm font-black uppercase text-gray-800 truncate mb-2">{p.name}</h4>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-[#f6a118] leading-none">${p.price}</p>
                <p className="text-[10px] font-black text-gray-300 uppercase">{p.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn">
      <div className="flex items-center gap-8">
        <button onClick={() => setFormMode('list')} className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all">🔙</button>
        <h3 className="text-5xl font-black uppercase tracking-tighter">Editor de Tesoro ✨</h3>
      </div>

      <div className="bg-[#fef9eb] p-12 rounded-[5rem] border-[12px] border-white shadow-2xl space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-6 uppercase">Nombre del Producto</label>
            <input type="text" className="w-full text-3xl p-8 rounded-[2.5rem] outline-none shadow-inner uppercase font-black" value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-6 uppercase">Categoría</label>
            <select className="w-full text-3xl p-8 rounded-[2.5rem] outline-none shadow-inner font-black uppercase appearance-none bg-white" value={editingProduct?.category} onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}>
              {['Escolar', 'Oficina', 'Tecnología', 'Novedades', 'Ofertas', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-gray-400 ml-6 uppercase">Descripción Detallada</label>
          <textarea className="w-full text-xl p-8 rounded-[3rem] outline-none shadow-inner min-h-[200px]" value={editingProduct?.description} onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 bg-white p-8 rounded-[3rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase">Precio ($)</label>
            <input type="number" className="w-full text-4xl font-black text-[#f6a118] outline-none" value={editingProduct?.price} onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-8 rounded-[3rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase">Antes ($)</label>
            <input type="number" className="w-full text-4xl font-black text-gray-300 outline-none" value={editingProduct?.oldPrice} onChange={e => setEditingProduct({...editingProduct!, oldPrice: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-8 rounded-[3rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase">Puntos ✨</label>
            <input type="number" className="w-full text-4xl font-black text-blue-400 outline-none" value={editingProduct?.points} onChange={e => setEditingProduct({...editingProduct!, points: Number(e.target.value)})} />
          </div>
        </div>

        {/* COLORES Y STOCK */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-6">
            <h4 className="text-2xl font-black uppercase text-gray-800">Variantes y Stock</h4>
            <button onClick={() => setEditingProduct({...editingProduct!, colors: [...(editingProduct?.colors || []), { color: 'Nuevo', stock: 10 }]})} className="text-[#f6a118] font-black uppercase text-sm">+ Añadir</button>
          </div>
          <div className="grid gap-4">
            {editingProduct?.colors?.map((c, i) => (
              <div key={i} className="flex items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm">
                <input className="flex-grow text-2xl font-black outline-none uppercase" value={c.color} onChange={e => {
                  const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({...editingProduct!, colors: n});
                }} />
                <div className="flex items-center gap-6 bg-gray-50 px-8 py-3 rounded-full">
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock = Math.max(0, n[i].stock - 1); setEditingProduct({...editingProduct!, colors: n}); }} className="text-4xl text-red-300">-</button>
                   <input type="number" className="w-20 text-center bg-transparent text-3xl font-black outline-none" value={c.stock} onChange={e => {
                     const n = [...editingProduct.colors!]; n[i].stock = parseInt(e.target.value) || 0; setEditingProduct({...editingProduct!, colors: n});
                   }} />
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock += 1; setEditingProduct({...editingProduct!, colors: n}); }} className="text-4xl text-[#f6a118]">+</button>
                </div>
                <button onClick={() => setEditingProduct({...editingProduct!, colors: editingProduct.colors?.filter((_, idx) => idx !== i)})} className="text-red-200 hover:text-red-500"><Trash2/></button>
              </div>
            ))}
          </div>
        </div>

        {/* IMÁGENES */}
        <div className="space-y-6">
           <div className="flex flex-wrap gap-4">
              {editingProduct?.images?.map((img, i) => (
                <div key={i} className="relative w-40 h-40 group">
                  <img src={getImgUrl(img, 300)} className="w-full h-full object-cover rounded-[2.5rem] border-8 border-white shadow-lg" />
                  <button onClick={() => setEditingProduct({...editingProduct!, images: editingProduct.images?.filter((_, idx) => idx !== i)})} className="absolute -top-2 -right-2 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl">×</button>
                </div>
              ))}
              <label className="w-40 h-40 bg-white rounded-[2.5rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                <Upload className="text-gray-300" />
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
           </div>
        </div>

        <button onClick={handleSave} className="w-full py-10 matita-gradient-orange text-white rounded-[3.5rem] text-4xl font-black uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
           ¡Guardar Tesoro! ✨
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE: GESTIÓN DE SOCIOS (CON RESETEO DE CLAVE Y EDICIÓN) ---
const SociosManager: React.FC = () => {
  const { supabase } = useApp();
  const [socios, setSocios] = useState<User[]>([]);
  const [editingSocio, setEditingSocio] = useState<User | null>(null);

  const fetchSocios = async () => {
    const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
    if (data) setSocios(data.map((u: any) => ({ ...u, isSocio: u.is_socio, isAdmin: u.is_admin })));
  };

  useEffect(() => { fetchSocios(); }, [supabase]);

  const handleUpdateSocio = async () => {
    if (!editingSocio) return;
    const { error } = await supabase.from('users').update({
      name: editingSocio.name,
      points: editingSocio.points,
      is_socio: editingSocio.isSocio,
      is_admin: editingSocio.isAdmin
    }).eq('id', editingSocio.id);

    if (!error) {
      alert("Socio actualizado con éxito ✅");
      setEditingSocio(null);
      fetchSocios();
    }
  };

  const handleResetPassword = async (email: string) => {
    if (confirm(`¿Enviar email de restablecimiento de contraseña a ${email}?`)) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (!error) alert("Email enviado 📧. El socio podrá cambiar su clave.");
      else alert("Error al enviar email: " + error.message);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <h3 className="text-5xl font-black uppercase tracking-tighter">SOCIOS DEL CLUB 👑</h3>
      
      <div className="grid gap-6">
        {socios.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[3.5rem] border-8 border-gray-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 group hover:border-[#fadb31] transition-all">
            <div className="flex items-center gap-8">
               <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner ${s.isAdmin ? 'bg-orange-100' : 'bg-blue-50'}`}>
                 {s.isAdmin ? '🧙‍♂️' : '👑'}
               </div>
               <div>
                  <h4 className="text-3xl font-black uppercase text-gray-800 leading-none">{s.name}</h4>
                  <p className="text-lg text-gray-400 font-bold lowercase">{s.email}</p>
                  <div className="flex gap-2 mt-2">
                    {s.isAdmin && <span className="bg-orange-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">Admin</span>}
                    {s.isSocio && <span className="bg-[#fadb31] text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">Socio Activo</span>}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-center bg-gray-50 px-8 py-4 rounded-[2.5rem]">
                  <p className="text-4xl font-black text-[#f6a118]">{s.points.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-gray-300 uppercase">PUNTOS ✨</p>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setEditingSocio(s)} className="p-5 bg-blue-50 text-blue-400 rounded-3xl hover:bg-blue-400 hover:text-white transition-all"><UserCog/></button>
                  <button onClick={() => handleResetPassword(s.email)} className="p-5 bg-orange-50 text-orange-400 rounded-3xl hover:bg-orange-400 hover:text-white transition-all"><Key/></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDITOR DE SOCIO */}
      {editingSocio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 border-[12px] border-white shadow-2xl space-y-8 animate-slideUp">
             <h3 className="text-4xl font-black uppercase tracking-tighter text-center">Gestionar Socio</h3>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-gray-400 ml-4 uppercase">Nombre del Humano</label>
                   <input type="text" className="w-full text-2xl p-6 rounded-3xl bg-gray-50 font-bold uppercase outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31]" value={editingSocio.name} onChange={e => setEditingSocio({...editingSocio, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-gray-400 ml-4 uppercase">Billetera de Puntos ✨</label>
                   <input type="number" className="w-full text-2xl p-6 rounded-3xl bg-gray-50 font-bold outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31]" value={editingSocio.points} onChange={e => setEditingSocio({...editingSocio, points: parseInt(e.target.value) || 0})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => setEditingSocio({...editingSocio, isSocio: !editingSocio.isSocio})}
                    className={`py-6 rounded-3xl text-xl font-black uppercase transition-all ${editingSocio.isSocio ? 'bg-[#fadb31] text-white' : 'bg-gray-100 text-gray-300'}`}
                   >
                     Es Socio {editingSocio.isSocio ? '✅' : '❌'}
                   </button>
                   <button 
                    onClick={() => setEditingSocio({...editingSocio, isAdmin: !editingSocio.isAdmin})}
                    className={`py-6 rounded-3xl text-xl font-black uppercase transition-all ${editingSocio.isAdmin ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-300'}`}
                   >
                     Es Admin {editingSocio.isAdmin ? '🛡️' : '👤'}
                   </button>
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setEditingSocio(null)} className="flex-1 py-6 bg-gray-100 text-gray-400 rounded-[2rem] font-black uppercase">Cancelar</button>
                <button onClick={handleUpdateSocio} className="flex-1 py-6 matita-gradient-orange text-white rounded-[2rem] font-black uppercase shadow-xl">Guardar Cambios ✨</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- OTROS COMPONENTES (IDEAS, DISEÑO, CARRUSEL) ---

const SalesManager: React.FC = () => {
  const { supabase } = useApp();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const f = async () => {
      const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (data) setSales(data);
    };
    f();
  }, [supabase]);

  return (
    <div className="space-y-12 animate-fadeIn">
      <h3 className="text-5xl font-black uppercase tracking-tighter">BITÁCORA DE VENTAS 💸</h3>
      <div className="grid gap-6">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white shadow-sm flex flex-col lg:flex-row justify-between items-center group">
             <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-inner">🛍️</div>
                <div>
                   <p className="text-2xl font-black uppercase text-gray-800 leading-none">#{s.id.slice(0, 8)} - {s.user_name || 'Invitado'}</p>
                   <p className="text-lg text-gray-300 font-bold uppercase tracking-widest">{new Date(s.created_at).toLocaleString('es-AR')}</p>
                </div>
             </div>
             <p className="text-6xl font-black text-[#f6a118] leading-none mt-6 lg:mt-0">${s.total.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const IdeasManager: React.FC = () => {
  const { supabase } = useApp();
  const [ideas, setIdeas] = useState<any[]>([]);
  useEffect(() => {
    const f = async () => {
      const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
      if (data) setIdeas(data);
    };
    f();
  }, [supabase]);

  return (
    <div className="space-y-12 animate-fadeIn">
      <h3 className="text-5xl font-black uppercase tracking-tighter">BUZÓN DE IDEAS 💡</h3>
      <div className="grid gap-10">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-12 rounded-[5rem] border-[12px] border-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-10 right-10 text-8xl opacity-10 group-hover:rotate-12 transition-transform">💡</div>
            <p className="text-3xl font-black text-gray-800 mb-6 italic uppercase leading-tight">"{i.title}"</p>
            <p className="text-xl text-gray-500 font-medium leading-relaxed uppercase">{i.content}</p>
            <p className="mt-8 text-lg text-[#f6a118] font-black uppercase tracking-widest">- {i.user_name || 'Anónimo'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DesignManager: React.FC = () => {
  const { logoUrl, setLogoUrl, supabase } = useApp();
  const fRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<File | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    let finalId = logoUrl;
    if (preview) {
      const formData = new FormData();
      formData.append("file", preview);
      formData.append("upload_preset", "Matita_web");
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      finalId = data.public_id;
    }
    await supabase.from('site_config').upsert({ id: 'global', logo_url: finalId });
    setLogoUrl(finalId);
    setPreview(null);
    setIsSaving(false);
    alert("🎨 Identidad visual actualizada.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-16 text-center py-10">
      <h3 className="text-6xl font-black text-[#f6a118] uppercase tracking-tighter">ESTILO DE MARCA 🎨</h3>
      <div className="bg-[#fef9eb] p-20 rounded-[5rem] shadow-2xl border-[15px] border-white relative">
        <div 
          className="w-80 h-80 bg-white rounded-full mx-auto shadow-2xl flex items-center justify-center p-12 border-8 border-[#fadb31] cursor-pointer group hover:scale-105 transition-all" 
          onClick={() => fRef.current?.click()}
        >
          <img src={preview ? URL.createObjectURL(preview) : getImgUrl(logoUrl, 500)} className="w-full h-full object-contain" alt="Logo" />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-4xl">📸</div>
        </div>
        <p className="mt-8 text-gray-400 font-black uppercase tracking-widest text-sm">Click en el logo para cambiarlo</p>
        <input type="file" ref={fRef} className="hidden" accept="image/*" onChange={e => setPreview(e.target.files?.[0] || null)} />
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full mt-16 py-8 matita-gradient-orange text-white rounded-[3rem] text-3xl font-black shadow-xl uppercase border-b-8 border-orange-700"
        >
          {isSaving ? "Guardando Identidad..." : "Publicar Cambios ✨"}
        </button>
      </div>
    </div>
  );
};

const CarouselManager: React.FC = () => {
  const { supabase } = useApp();
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_config').select('carousel_images').eq('id', 'global').maybeSingle();
      if (data?.carousel_images) setImages(data.carousel_images);
    };
    fetch();
  }, [supabase]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newImgs: string[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append("file", e.target.files[i]);
      formData.append("upload_preset", "Matita_web");
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.public_id) newImgs.push(data.public_id);
    }
    setImages(prev => [...prev, ...newImgs]);
  };

  const save = async () => {
    setIsSaving(true);
    await supabase.from('site_config').upsert({ id: 'global', carousel_images: images });
    setIsSaving(false);
    alert("🖼️ Escaparate actualizado.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <h3 className="text-5xl font-black text-[#f6a118] uppercase tracking-tighter text-center">BANNER DE PORTADA 🖼️</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-[3rem] overflow-hidden border-8 border-white shadow-xl aspect-square">
            <img src={getImgUrl(img, 600)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="bg-red-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"><Trash2/></button>
            </div>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()} className="aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-[3rem] border-8 border-dashed border-gray-200 hover:bg-white hover:border-[#fadb31] transition-all group">
          <Plus size={48} className="text-gray-200 group-hover:text-[#fadb31] transition-colors" />
        </button>
      </div>
      <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
      <button onClick={save} disabled={isSaving} className="w-full py-10 matita-gradient-orange text-white rounded-[3.5rem] text-4xl font-black shadow-2xl uppercase">
         {isSaving ? "Guardando..." : "Guardar Carrusel ✨"}
      </button>
    </div>
  );
};

export default AdminPanel;
