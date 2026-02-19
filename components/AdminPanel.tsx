import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, User } from '../types';
import { useApp } from '../App';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie, Legend 
} from 'recharts';
import { 
  Settings, Package, Users, Lightbulb, ImageIcon, 
  LogOut, Plus, Trash2, Edit3, Save, Search, Upload, 
  Key, ShieldCheck, UserCog, TrendingUp, ShoppingBag, 
  Star, Mail, CheckCircle2, XCircle, ArrowRight, 
  Copy, AlertTriangle, Info, Image as LucideImage, Camera, RefreshCcw
} from 'lucide-react';

// LIBRERÍAS EXTERNAS PARA EXCEL Y PDF
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Seteo del worker para que el PDF no falle en Vercel
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * UTILERÍA DE IMÁGENES CLOUDINARY PARA MATITA
 */
const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

// --- COMPONENTE PRINCIPAL: PANEL MAESTRO ---
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
    else alert('Clave incorrecta ❌ Acceso denegado.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-6 font-matita">
        <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 shadow-2xl border-[12px] border-white text-center space-y-10 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 matita-gradient-orange"></div>
          <div className="text-9xl animate-float">👑</div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Panel Maestro</h2>
            <p className="text-[#f6a118] font-bold uppercase text-[10px] tracking-[0.3em]">Gestión Matita 2026</p>
          </div>
          <form onSubmit={handleAdminAuth} className="space-y-8">
            <input
              type="password"
              placeholder="CLAVE MATITA"
              className="w-full text-3xl text-center shadow-inner py-6 bg-[#fef9eb] rounded-3xl outline-none uppercase font-black border-4 border-transparent focus:border-[#fadb31] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button className="w-full py-7 matita-gradient-orange text-white rounded-[2.2rem] text-4xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase border-b-8 border-orange-700">
              Entrar 🚪
            </button>
          </form>
          <button onClick={() => navigate('/')} className="text-gray-300 font-bold uppercase underline text-[10px] hover:text-gray-500 transition-colors">Volver a la Tienda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1550px] mx-auto py-10 px-4 space-y-12 font-matita animate-fadeIn">
      {/* HEADER DE NAVEGACIÓN PRO */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 border-b-8 border-[#fadb31]/20 pb-10">
        <div className="space-y-2">
          <h2 className="text-6xl md:text-7xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">
            Gestión <span className="text-gray-800">MATITA ✏️</span>
          </h2>
          <p className="text-2xl text-gray-400 font-bold uppercase tracking-[0.4em] mt-4">Comandos del Universo 👑</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-4 rounded-[2.5rem] shadow-2xl border-4 border-white">
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
              className={`px-6 py-4 rounded-[1.5rem] text-lg font-black transition-all uppercase flex items-center gap-2 ${activeTab === tab.id ? 'matita-gradient-orange text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
          <div className="w-px h-10 bg-gray-100 mx-2 hidden xl:block"></div>
          <button onClick={() => setIsAuthenticated(false)} className="px-6 py-4 bg-red-50 text-red-400 rounded-[1.5rem] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-md">
             🚪
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE SECCIONES */}
      <div className="bg-white rounded-[4rem] md:rounded-[5rem] shadow-matita p-8 md:p-16 border-[14px] border-white min-h-[850px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#fadb31]/5 rounded-full -mr-48 -mt-48 -z-0"></div>
        <div className="relative z-10">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'sales' && <SalesManager />}
          {activeTab === 'socios' && <SociosManager />}
          {activeTab === 'ideas' && <IdeasManager />}
          {activeTab === 'design' && <DesignManager />}
          {activeTab === 'carousel' && <CarouselManager />}
        </div>
      </div>
    </div>
  );
};

// --- SECCIÓN: DASHBOARD (MÉTRICAS) ---
const Dashboard: React.FC = () => {
  const { supabase } = useApp();
  const [data, setData] = useState<any>({
    history: [], cats: [], lowStock: [],
    totals: { money: 0, users: 0, products: 0, points: 0 }
  });

  useEffect(() => {
    const loadStats = async () => {
      const { data: sales } = await supabase.from('sales').select('*').order('created_at', { ascending: true });
      const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { data: prods } = await supabase.from('products').select('*');
      const { data: userData } = await supabase.from('users').select('points');

      if (sales && prods) {
        const history = sales.map((s: any) => ({
          date: new Date(s.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
          amount: s.total
        }));
        const catMap: any = {};
        sales.forEach((s: any) => {
          const c = s.category_summary || 'Varios';
          catMap[c] = (catMap[c] || 0) + s.total;
        });
        const low = prods.filter((p: any) => (p.colors?.reduce((a: number, b: any) => a + (Number(b.stock) || 0), 0) || 0) < 5);

        setData({
          history,
          cats: Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })),
          lowStock: low,
          totals: {
            money: sales.reduce((a, b) => a + b.total, 0),
            users: users || 0,
            products: prods.length,
            points: userData?.reduce((a, b) => a + (b.points || 0), 0) || 0
          }
        });
      }
    };
    loadStats();
  }, [supabase]);

  const COLORS = ['#f6a118', '#ea7e9c', '#fadb31', '#93c5fd', '#86efac'];

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { l: 'Ingresos 💸', v: `$${data.totals.money.toLocaleString()}`, c: '#f6a118', bg: '#fef9eb' },
          { l: 'Socios 👑', v: data.totals.users, c: '#ea7e9c', bg: '#fff1f2' },
          { l: 'Items 📦', v: data.totals.products, c: '#3b82f6', bg: '#f0f9ff' },
          { l: 'Puntos ✨', v: data.totals.points.toLocaleString(), c: '#10b981', bg: '#f0fdf4' }
        ].map((card, i) => (
          <div key={i} className="p-10 rounded-[3.5rem] border-4 border-white shadow-sm text-center transition-all hover:scale-105" style={{ backgroundColor: card.bg }}>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{card.l}</p>
            <p className="text-5xl font-black" style={{ color: card.c }}>{card.v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white h-[450px] shadow-inner">
          <h4 className="text-2xl font-black mb-8 uppercase tracking-tighter">Tendencia Mensual 📈</h4>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#ccc" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="#f6a118" strokeWidth={5} fill="#fadb31" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white h-[450px] shadow-inner">
          <h4 className="text-2xl font-black mb-8 uppercase tracking-tighter">Ventas por Rubro 🏷️</h4>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data.cats}>
              <XAxis dataKey="name" fontSize={10} fontStyle="bold" />
              <Tooltip />
              <Bar dataKey="value" radius={[15, 15, 0, 0]}>
                {data.cats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % 5]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="bg-red-50 p-12 rounded-[4rem] border-8 border-white shadow-xl">
          <div className="flex items-center gap-4 mb-8 text-red-600">
            <AlertTriangle size={40} />
            <h4 className="text-3xl font-black uppercase tracking-tighter">REPOSICIÓN URGENTE ⚠️</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.lowStock.map((p: any) => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border-2 border-red-100 text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-700 uppercase truncate">{p.name}</p>
                <p className="text-red-500 font-bold mt-1 text-xl">Quedan: {p.colors?.reduce((a:number, b:any) => a + Number(b.stock), 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SECCIÓN: INVENTORY MANAGER (FIXED) ---
const InventoryManager: React.FC = () => {
  const { supabase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formMode, setFormMode] = useState<'list' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    let q = supabase.from('products').select('*');
    if (searchTerm) q = q.ilike('name', `%${searchTerm}%`);
    const { data } = await q.order('created_at', { ascending: false });
    if (data) setProducts(data.map((p: any) => ({ ...p, oldPrice: p.old_price, images: p.images || [], colors: p.colors || [], description: p.description || "" })));
  }, [supabase, searchTerm]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Lógica de importación masiva inteligente
  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    let newItems: any[] = [];
    try {
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);
        newItems = json.map(r => {
          const keys = Object.keys(r);
          const findKey = (words: string[]) => keys.find(k => words.some(w => k.toLowerCase().includes(w)));
          const nameK = findKey(['nom', 'prod', 'art', 'item']) || keys[0];
          const priceK = findKey(['prec', 'val', 'cost', 'monto']) || keys[1];
          const descK = findKey(['desc', 'info', 'detal']) || keys[2];
          return {
            name: String(row[nameK] || 'Sin Nombre').trim().toUpperCase(),
            price: Number(String(row[priceK]).replace(/[^0-9.]/g, '')) || 0,
            description: row[descK] ? String(row[descK]) : "Importado.",
            category: "Otros",
            colors: [{ color: 'Único', stock: 10 }],
            images: []
          };
        });
      } else if (ext === 'pdf') {
        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((it: any) => it.str).join(" ") + "\n";
        }
        const lines = text.split("\n");
        newItems = lines.map(l => {
          const match = l.match(/^(.+?)\s+[\$]?\s?(\d+[\d\.,]*)$/);
          if (match) return { name: match[1].trim().toUpperCase(), price: parseFloat(match[2].replace(',', '.')) || 0, description: "PDF", category: "Escolar", colors: [{ color: 'Único', stock: 5 }], images: [] };
          return null;
        }).filter(i => i !== null);
      }
      if (newItems.length > 0 && confirm(`¿Cargar ${newItems.length} productos?`)) {
        await supabase.from('products').insert(newItems);
        fetchProducts();
        alert("¡Catálogo Actualizado! 🚀");
      }
    } catch (err) { alert("Error procesando archivo."); }
  };

  // --- SOLUCIÓN PARA GUARDAR SIN ERROR DE SCHEMA CACHE ---
  const handleSaveProduct = async () => {
    if (!editingProduct?.name) return alert("¡El nombre es obligatorio!");
    setIsSaving(true);
    try {
      const payload = {
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: Number(editingProduct.price) || 0,
        old_price: Number(editingProduct.oldPrice) || 0, // FIXED: Usar snake_case para la DB
        points: Number(editingProduct.points) || 0,
        category: editingProduct.category || "Escolar",
        images: editingProduct.images || [],
        // Al guardar nos aseguramos de que todo sea número
        colors: editingProduct.colors?.map((c:any) => ({ ...c, stock: Number(c.stock) || 0 })) || []
      };

      const { error } = editingProduct.id 
        ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert(payload);
      
      if (error) throw error;
      alert("¡Tesoro guardado! ✨");
      setFormMode('list'); fetchProducts();
    } catch (err: any) { alert("Error al guardar: " + err.message); }
    finally { setIsSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
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
    setEditingProduct((prev: any) => ({ ...prev!, images: [...(prev?.images || []), ...uploadedIds] }));
    setIsUploading(false);
  };

  // --- SOLUCIÓN PARA BORRAR EL 0 EN STOCK ---
  const handleStockValueChange = (idx: number, val: string) => {
    const next = [...editingProduct.colors!];
    // Permitimos cadena vacía para que el usuario pueda borrar el número por completo
    next[idx].stock = val === "" ? "" : parseInt(val);
    setEditingProduct({ ...editingProduct, colors: next });
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-gray-50 p-8 rounded-[3.5rem] border-4 border-white shadow-inner">
          <div className="space-y-2">
            <h3 className="text-4xl font-black uppercase tracking-tighter">Inventario Vital 📦</h3>
            <input type="file" ref={importInputRef} className="hidden" accept=".xlsx,.xls,.pdf" onChange={handleBulkImport} />
            <button onClick={() => importInputRef.current?.click()} className="text-[#ea7e9c] font-bold text-xs underline uppercase tracking-widest flex items-center gap-2 hover:text-red-500 transition-colors">
              <Upload size={16} /> Importar Excel o PDF ⬆️
            </button>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-96">
              <Search className="absolute left-5 top-5 text-gray-300" />
              <input type="text" placeholder="BUSCAR EN EL CATÁLOGO..." className="w-full p-5 pl-14 rounded-3xl bg-white border-4 border-transparent focus:border-[#fadb31] outline-none font-bold uppercase shadow-md text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingProduct({ name: '', price: 0, oldPrice: 0, points: 0, category: 'Escolar', colors: [{ color: 'Único', stock: 10 }], images: [] }); setFormMode('edit'); }} className="px-10 py-5 matita-gradient-orange text-white rounded-3xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase flex items-center gap-3 border-b-8 border-orange-700">+ NUEVO</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[3rem] border-8 border-gray-50 shadow-sm hover:border-[#fadb31] transition-all group flex flex-col">
              <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 bg-gray-50 relative">
                <img src={getImgUrl(p.images[0], 300)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="p-3 bg-white rounded-full shadow-xl text-blue-400 hover:scale-110"><Edit3 size={18}/></button>
                   <button onClick={async () => { if(confirm('¿BORRAR?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="p-3 bg-white rounded-full shadow-xl text-red-400 hover:scale-110"><Trash2 size={18}/></button>
                </div>
              </div>
              <p className="text-[10px] font-black text-[#fadb31] uppercase mb-1">{p.category}</p>
              <h4 className="text-sm font-black uppercase text-gray-800 truncate mb-2">{p.name}</h4>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-[#f6a118] leading-none">${p.price.toLocaleString()}</p>
                <div className="text-right">
                   <p className="text-lg font-bold text-gray-300 leading-none">{p.colors?.reduce((a,b) => a + Number(b.stock), 0)}</p>
                   <p className="text-[8px] font-black text-gray-200 uppercase">Stock</p>
                </div>
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
        <button onClick={() => setFormMode('list')} className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all shadow-md">🔙</button>
        <h3 className="text-5xl font-black uppercase tracking-tighter">Editor de Tesoro ✨</h3>
      </div>

      <div className="bg-[#fef9eb] p-12 rounded-[5rem] border-[12px] border-white shadow-2xl space-y-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-6 uppercase tracking-widest">Nombre del Producto</label>
            <input type="text" className="w-full text-3xl p-8 rounded-[2.5rem] outline-none shadow-inner uppercase font-black" value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-6 uppercase tracking-widest">Categoría</label>
            <select className="w-full text-3xl p-8 rounded-[2.5rem] outline-none shadow-inner font-black uppercase appearance-none bg-white border-none" value={editingProduct?.category} onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}>
              {['Escolar', 'Oficina', 'Tecnología', 'Regalos', 'Ofertas', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-gray-400 ml-6 uppercase tracking-widest">Descripción Detallada</label>
          <textarea className="w-full text-xl p-8 rounded-[3.5rem] outline-none shadow-inner min-h-[200px] font-bold" value={editingProduct?.description} onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 bg-white p-8 rounded-[3.5rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase block text-center tracking-widest">Precio ($)</label>
            <input type="number" className="w-full text-5xl font-black text-[#f6a118] outline-none bg-transparent text-center" value={editingProduct?.price} onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-8 rounded-[3.5rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase block text-center tracking-widest">Antes ($)</label>
            <input type="number" className="w-full text-5xl font-black text-gray-300 outline-none bg-transparent text-center" value={editingProduct?.oldPrice} onChange={e => setEditingProduct({...editingProduct!, oldPrice: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-8 rounded-[3.5rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase block text-center tracking-widest">Puntos ✨</label>
            <input type="number" className="w-full text-5xl font-black text-blue-400 outline-none bg-transparent text-center" value={editingProduct?.points} onChange={e => setEditingProduct({...editingProduct!, points: Number(e.target.value)})} />
          </div>
        </div>

        {/* VARIANTES Y STOCK CON FIX DE BORRADO */}
        <div className="space-y-8">
          <div className="flex justify-between items-center px-6">
            <h4 className="text-3xl font-black uppercase text-gray-800 tracking-tighter">Variantes y Almacén</h4>
            <button onClick={() => setEditingProduct({...editingProduct!, colors: [...(editingProduct?.colors || []), { color: 'NUEVO', stock: 10 }]})} className="text-[#f6a118] font-black uppercase text-sm">+ AÑADIR VARIANTE</button>
          </div>
          <div className="grid gap-4">
            {editingProduct?.colors?.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border-4 border-white group">
                <input className="flex-grow text-2xl font-black outline-none uppercase bg-transparent" value={c.color} onChange={e => {
                  const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({...editingProduct!, colors: n});
                }} />
                <div className="flex items-center gap-8 bg-gray-50 px-10 py-3 rounded-full border-4 border-white shadow-inner">
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock = Math.max(0, (Number(n[i].stock) || 0) - 1); setEditingProduct({...editingProduct!, colors: n}); }} className="text-4xl text-red-300 font-black">-</button>
                   <input 
                    type="number" 
                    className="w-24 text-center bg-transparent text-3xl font-black outline-none" 
                    value={c.stock} 
                    onChange={e => handleStockValueChange(i, e.target.value)} // FIXED: Lógica de borrado de 0
                   />
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock = (Number(n[i].stock) || 0) + 1; setEditingProduct({...editingProduct!, colors: n}); }} className="text-4xl text-[#f6a118] font-black">+</button>
                </div>
                <button onClick={() => setEditingProduct({...editingProduct!, colors: editingProduct.colors?.filter((_:any, idx:number) => idx !== i)})} className="text-red-200 hover:text-red-500"><Trash2/></button>
              </div>
            ))}
          </div>
        </div>

        {/* FOTOS */}
        <div className="space-y-8">
           <h4 className="text-3xl font-black uppercase text-gray-800 tracking-tighter px-6">Galería de Imágenes</h4>
           <div className="flex flex-wrap gap-6 px-6">
              {editingProduct?.images?.map((img:string, i:number) => (
                <div key={i} className="relative w-44 h-44 group">
                  <img src={getImgUrl(img, 400)} className="w-full h-full object-cover rounded-[3rem] border-8 border-white shadow-lg group-hover:scale-105 transition-transform" />
                  <button onClick={() => setEditingProduct({...editingProduct!, images: editingProduct.images?.filter((_:any, idx:number) => idx !== i)})} className="absolute -top-3 -right-3 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl font-black text-xl">×</button>
                </div>
              ))}
              <label onClick={() => imageInputRef.current?.click()} className="w-44 h-44 bg-white rounded-[3rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#fadb31] transition-all group shadow-inner">
                {isUploading ? <RefreshCcw className="animate-spin text-[#fadb31]"/> : <Camera className="text-gray-200 group-hover:text-[#fadb31] group-hover:scale-110 transition-all" size={48} />}
                <span className="mt-2 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">Subir Foto</span>
                <input type="file" ref={imageInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
              </label>
           </div>
        </div>

        <button onClick={handleSaveProduct} disabled={isSaving} className="w-full py-10 matita-gradient-orange text-white rounded-[3.5rem] text-4xl font-black uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all border-b-12 border-orange-700 disabled:opacity-50">
           {isSaving ? 'SINCRO EN MARCHA...' : '¡PUBLICAR TESORO! ✨'}
        </button>
      </div>
    </div>
  );
};

// --- SECCIÓN: SOCIOS MANAGER (GESTIÓN TOTAL) ---
const SociosManager: React.FC = () => {
  const { supabase } = useApp();
  const [socios, setSocios] = useState<User[]>([]);
  const [editingSocio, setEditingSocio] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  const fetchSocios = async () => {
    const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
    if (data) setSocios(data.map((u: any) => ({ ...u, isSocio: u.is_socio, isAdmin: u.is_admin })));
  };

  useEffect(() => { fetchSocios(); }, [supabase]);

  const filtered = socios.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase()));

  const handleUpdateSocio = async () => {
    if (!editingSocio) return;
    const { error } = await supabase.from('users').update({
      name: editingSocio.name,
      points: editingSocio.points,
      is_socio: editingSocio.isSocio,
      is_admin: editingSocio.isAdmin
    }).eq('id', editingSocio.id);

    if (!error) { alert("¡Socio actualizado! ✅"); setEditingSocio(null); fetchSocios(); }
  };

  const handleResetPassword = async (email: string) => {
    if (confirm(`¿Enviar email para cambiar clave a ${email}?`)) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' });
      if (!error) alert("¡Email enviado! 📧");
      else alert("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
        <h3 className="text-5xl font-black uppercase tracking-tighter">Socios del Club 👑</h3>
        <div className="relative w-full lg:w-[500px]">
          <Search className="absolute left-6 top-6 text-gray-300" size={24} />
          <input type="text" placeholder="BUSCAR SOCIO POR NOMBRE O MAIL..." className="w-full p-6 pl-16 rounded-[2.5rem] bg-gray-50 border-4 border-transparent focus:border-[#fadb31] focus:bg-white outline-none font-bold uppercase transition-all shadow-inner text-xl" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      
      <div className="grid gap-6">
        {filtered.map(s => (
          <div key={s.id} className="bg-white p-10 rounded-[4rem] border-8 border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-8 group hover:border-[#fadb31] transition-all">
            <div className="flex items-center gap-8">
               <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner ${s.isAdmin ? 'bg-orange-100' : 'bg-blue-50'}`}>{s.isAdmin ? '🛡️' : '👤'}</div>
               <div>
                  <h4 className="text-4xl font-black uppercase text-gray-800 leading-none mb-2">{s.name || 'Humano Nuevo'}</h4>
                  <p className="text-xl text-gray-400 font-bold lowercase"><Mail size={18} className="inline mr-2"/> {s.email}</p>
                  <div className="flex gap-2 mt-4">
                    {s.isAdmin && <span className="bg-orange-500 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase">Administrador</span>}
                    {s.isSocio && <span className="bg-[#fadb31] text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase">Socio VIP</span>}
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-center bg-gray-50 px-10 py-6 rounded-[2.5rem] shadow-inner border-4 border-white"><p className="text-5xl font-black text-[#f6a118] leading-none mb-1">{s.points.toLocaleString()}</p><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">PUNTOS ✨</p></div>
               <button onClick={() => setEditingSocio(s)} className="w-20 h-20 bg-blue-50 text-blue-400 rounded-[2rem] flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all shadow-md"><UserCog size={36}/></button>
               <button onClick={() => handleResetPassword(s.email)} className="w-20 h-20 bg-orange-50 text-orange-400 rounded-[2rem] flex items-center justify-center hover:bg-orange-400 hover:text-white transition-all shadow-md"><Key size={36}/></button>
            </div>
          </div>
        ))}
      </div>

      {editingSocio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[5rem] p-16 border-[20px] border-white shadow-2xl space-y-12 animate-slideUp">
             <div className="text-center space-y-2"><h3 className="text-5xl font-black uppercase tracking-tighter leading-none">Perfil Socio</h3><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">{editingSocio.email}</p></div>
             <div className="space-y-10">
                <div className="space-y-3"><label className="text-sm font-black text-gray-400 ml-6 uppercase">Nombre Completo</label><input type="text" className="w-full text-3xl p-8 rounded-[3rem] bg-gray-50 font-black uppercase outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner" value={editingSocio.name} onChange={e => setEditingSocio({...editingSocio, name: e.target.value})} /></div>
                <div className="space-y-3"><label className="text-sm font-black text-gray-400 ml-6 uppercase tracking-widest">Billetera de Puntos</label><div className="flex items-center gap-6"><input type="number" className="flex-grow text-6xl p-8 rounded-[3rem] bg-gray-50 font-black outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner" value={editingSocio.points} onChange={e => setEditingSocio({...editingSocio, points: parseInt(e.target.value) || 0})} /><div className="w-24 h-24 bg-[#fef9eb] rounded-full flex items-center justify-center text-5xl shadow-md border-4 border-white">✨</div></div></div>
                <div className="grid grid-cols-2 gap-6">
                   <button onClick={() => setEditingSocio({...editingSocio, isSocio: !editingSocio.isSocio})} className={`py-10 rounded-[3rem] text-2xl font-black uppercase transition-all shadow-lg flex items-center justify-center gap-3 border-b-8 ${editingSocio.isSocio ? 'bg-[#fadb31] text-white border-yellow-600' : 'bg-gray-100 text-gray-300 border-gray-200'}`}>{editingSocio.isSocio ? <CheckCircle2/> : <XCircle/>} VIP {editingSocio.isSocio ? 'SI' : 'NO'}</button>
                   <button onClick={() => setEditingSocio({...editingSocio, isAdmin: !editingSocio.isAdmin})} className={`py-10 rounded-[3rem] text-2xl font-black uppercase transition-all shadow-lg flex items-center justify-center gap-3 border-b-8 ${editingSocio.isAdmin ? 'bg-orange-500 text-white border-orange-700' : 'bg-gray-100 text-gray-300 border-gray-200'}`}>{editingSocio.isAdmin ? <ShieldCheck/> : <Users/>} ADMIN {editingSocio.isAdmin ? 'SI' : 'NO'}</button>
                </div>
             </div>
             <div className="flex gap-6"><button onClick={() => setEditingSocio(null)} className="flex-1 py-8 bg-gray-50 text-gray-300 rounded-[3rem] font-black uppercase text-xl hover:bg-gray-100 transition-all">Cancelar</button><button onClick={handleUpdateSocio} className="flex-1 py-8 matita-gradient-orange text-white rounded-[3rem] font-black uppercase text-2xl shadow-xl border-b-8 border-orange-700">Actualizar ✨</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- OTROS COMPONENTES: VENTAS, IDEAS, DISEÑO, CARRUSEL ---

const SalesManager: React.FC = () => {
  const { supabase } = useApp();
  const [sales, setSales] = useState<any[]>([]);
  useEffect(() => { const f = async () => { const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false }); if (data) setSales(data); }; f(); }, [supabase]);
  return (
    <div className="space-y-12 animate-fadeIn text-left">
      <h3 className="text-5xl font-black uppercase tracking-tighter">Bitácora de Ventas 💸</h3>
      <div className="grid gap-6">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white flex flex-col lg:flex-row justify-between items-center group shadow-sm">
             <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-inner group-hover:bg-[#fef9eb] transition-colors">🛍️</div>
                <div><p className="text-3xl font-black uppercase text-gray-800 leading-none mb-1">#{s.id.slice(0, 8)} - {s.user_name || 'Anónimo'}</p>
                   <p className="text-lg text-gray-300 font-bold uppercase tracking-widest">{new Date(s.created_at).toLocaleString('es-AR')}</p></div>
             </div>
             <p className="text-7xl font-black text-[#f6a118] leading-none mt-6 lg:mt-0">${s.total.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const IdeasManager: React.FC = () => {
  const { supabase } = useApp();
  const [ideas, setIdeas] = useState<any[]>([]);
  useEffect(() => { const f = async () => { const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false }); if (data) setIdeas(data); }; f(); }, [supabase]);
  return (
    <div className="space-y-12 animate-fadeIn px-4">
      <h3 className="text-5xl font-black uppercase tracking-tighter">Buzón de Ideas 💡</h3>
      <div className="grid gap-12">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-12 rounded-[5rem] border-[12px] border-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-10 right-10 text-[10rem] opacity-5 group-hover:rotate-12 transition-transform text-[#fadb31]">💡</div>
            <p className="text-4xl font-black text-gray-800 mb-6 italic uppercase leading-none tracking-tighter">"{i.title}"</p>
            <p className="text-2xl text-gray-500 font-bold leading-relaxed uppercase mb-10">{i.content}</p>
            <div className="flex items-center gap-3 bg-white w-fit px-8 py-4 rounded-full shadow-md"><div className="w-8 h-8 bg-[#f6a118] rounded-full"></div><p className="text-lg text-[#f6a118] font-black uppercase tracking-widest">- {i.user_name || 'Anónimo'}</p></div>
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
  const handleSaveLogo = async () => {
    setIsSaving(true);
    let finalId = logoUrl;
    if (preview) {
      const formData = new FormData(); formData.append("file", preview); formData.append("upload_preset", "Matita_web");
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
      const data = await res.json(); finalId = data.public_id;
    }
    await supabase.from('site_config').upsert({ id: 'global', logo_url: finalId });
    setLogoUrl(finalId); setPreview(null); setIsSaving(false); alert("¡Marca Actualizada! 🎨");
  };
  return (
    <div className="max-w-3xl mx-auto space-y-16 text-center py-10 animate-fadeIn">
      <h3 className="text-6xl font-black text-[#f6a118] uppercase tracking-tighter">Marca & Estilo 🎨</h3>
      <div className="bg-[#fef9eb] p-24 rounded-[6rem] shadow-2xl border-[15px] border-white relative group">
        <div className="w-80 h-80 bg-white rounded-full mx-auto shadow-2xl flex items-center justify-center p-14 border-[12px] border-[#fadb31] cursor-pointer group-hover:scale-110 transition-all relative overflow-hidden" onClick={() => fRef.current?.click()}>
          <img src={preview ? URL.createObjectURL(preview) : getImgUrl(logoUrl, 600)} className="w-full h-full object-contain group-hover:rotate-6 transition-transform" alt="Logo" />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-5xl text-gray-400">📸</div>
        </div>
        <p className="mt-12 text-gray-400 font-black uppercase tracking-[0.3em] text-sm italic">Cambiar Logotipo Oficial</p>
        <input type="file" ref={fRef} className="hidden" accept="image/*" onChange={e => setPreview(e.target.files?.[0] || null)} />
        <button onClick={handleSaveLogo} disabled={isSaving} className="w-full mt-16 py-10 matita-gradient-orange text-white rounded-[3.5rem] text-4xl font-black shadow-xl uppercase border-b-[12px] border-orange-700 hover:scale-105 active:scale-95 transition-all">{isSaving ? "SUBIENDO..." : "SINCRONIZAR MARCA ✨"}</button>
      </div>
    </div>
  );
};

const CarouselManager: React.FC = () => {
  const { supabase } = useApp();
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const fetch = async () => { const { data } = await supabase.from('site_config').select('carousel_images').eq('id', 'global').maybeSingle(); if (data?.carousel_images) setImages(data.carousel_images); }; fetch(); }, [supabase]);
  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsSaving(true);
    const newImgs: string[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData(); formData.append("file", e.target.files[i]); formData.append("upload_preset", "Matita_web"); formData.append("folder", "matita2026/carousel");
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
      const data = await res.json(); if (data.public_id) newImgs.push(data.public_id);
    }
    setImages(prev => [...prev, ...newImgs]); setIsSaving(false);
  };
  const saveCarousel = async () => { setIsSaving(true); await supabase.from('site_config').upsert({ id: 'global', carousel_images: images }); setIsSaving(false); alert("¡Portada actualizada! 🖼️✨"); };
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn text-center">
      <h3 className="text-6xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">Banner de Portada 🖼️</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-[4rem] overflow-hidden border-[10px] border-white shadow-2xl aspect-[4/5] bg-gray-50 transition-all hover:scale-105">
            <img src={getImgUrl(img, 800)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-8 gap-4">
              <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="w-20 h-20 bg-red-500 text-white rounded-full shadow-2xl hover:scale-125 active:scale-90 transition-all flex items-center justify-center border-4 border-white"><Trash2 size={32}/></button>
              <p className="text-white font-black uppercase text-xs tracking-widest text-center">Posición {i + 1}</p>
            </div>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()} className="aspect-[4/5] flex flex-col items-center justify-center bg-[#fef9eb] rounded-[4rem] border-[12px] border-dashed border-white hover:bg-white hover:border-[#fadb31] transition-all group shadow-xl" disabled={isSaving}>
          <Plus size={80} className="text-gray-200 group-hover:text-[#fadb31] group-hover:scale-125 transition-all" />
          <span className="mt-8 font-black text-gray-300 uppercase tracking-widest text-xs">Subir Nueva</span>
        </button>
      </div>
      <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={handleUploadBanner} />
      <div className="bg-gray-50 p-12 rounded-[5rem] border-4 border-white shadow-inner flex flex-col items-center"><button onClick={saveCarousel} disabled={isSaving} className="w-full max-w-2xl py-12 matita-gradient-orange text-white rounded-[4rem] text-5xl font-black shadow-2xl uppercase border-b-[16px] border-orange-700 hover:scale-[1.02] active:scale-95 transition-all">{isSaving ? "GUARDANDO..." : "GUARDAR BANNER ✨"}</button></div>
    </div>
  );
};

export default AdminPanel;
