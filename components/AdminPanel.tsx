import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, User } from '../types';
import { useApp } from '../App';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie, Legend 
} from 'recharts';
import { 
  Settings, Package, Users, Lightbulb, Image as ImageIcon, 
  LogOut, Plus, Trash2, Edit3, Save, Search, Upload, 
  Download, Copy, Key, ShieldCheck, UserCog, AlertCircle,
  TrendingUp, ShoppingBag, Star, Mail, CheckCircle2, XCircle,
  ChevronRight, ArrowRight, RefreshCcw, FileText
} from 'lucide-react';

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
    else alert('Contraseña incorrecta ❌ Acceso denegado.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-6 font-matita">
        <div className="max-w-md w-full bg-white rounded-[4rem] p-12 shadow-2xl border-[12px] border-white text-center space-y-8 animate-fadeIn">
          <div className="text-8xl animate-bounce">👑</div>
          <h2 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Panel Maestro</h2>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Librería & Club Matita</p>
          <form onSubmit={handleAdminAuth} className="space-y-6">
            <input
              type="password"
              placeholder="CLAVE DE ACCESO"
              className="w-full text-3xl text-center shadow-inner py-6 bg-[#fef9eb] rounded-3xl outline-none uppercase font-black border-4 border-transparent focus:border-[#fadb31] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-3xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase border-b-8 border-orange-700">
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
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b-8 border-[#fadb31]/20 pb-10">
        <div className="space-y-2">
          <h2 className="text-6xl md:text-8xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">
            Gestión <span className="text-gray-800">MATITA</span>
          </h2>
          <p className="text-2xl text-gray-400 font-bold uppercase tracking-[0.3em]">Mando Central de Operaciones ✏️</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-4 rounded-[3rem] shadow-xl border-4 border-white">
          {[
            { id: 'dashboard', label: '📊 Stats', icon: TrendingUp },
            { id: 'inventory', label: '📦 Stock', icon: Package },
            { id: 'sales', label: '💸 Ventas', icon: ShoppingBag },
            { id: 'socios', label: '👥 Socios', icon: Users },
            { id: 'ideas', label: '💡 Ideas', icon: Lightbulb },
            { id: 'design', label: '🎨 Marca', icon: ImageIcon },
            { id: 'carousel', label: '🖼️ Inicio', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 rounded-[1.8rem] text-lg font-black transition-all uppercase flex items-center gap-2 ${activeTab === tab.id ? 'matita-gradient-orange text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <tab.icon size={20} />
              <span className="hidden md:inline">{tab.label.split(' ')[1]}</span>
            </button>
          ))}
          <button onClick={() => setIsAuthenticated(false)} className="px-6 py-4 bg-red-50 text-red-400 rounded-[1.8rem] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-md">
            <LogOut size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] md:rounded-[5rem] shadow-matita p-8 md:p-16 border-[12px] border-white min-h-[800px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fadb31]/5 rounded-full -mr-32 -mt-32 -z-0"></div>
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

// --- COMPONENTE: DASHBOARD ---
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
      const { data: pointsData } = await supabase.from('users').select('points');

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

        const low = prods.filter((p: any) => {
          const stock = p.colors?.reduce((a: number, c: any) => a + (Number(c.stock) || 0), 0) || 0;
          return stock < 5;
        });

        setData({
          history,
          cats: Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })),
          lowStock: low,
          totals: {
            money: sales.reduce((a, b) => a + b.total, 0),
            users: users || 0,
            products: prods.length,
            points: pointsData?.reduce((a, b) => a + (b.points || 0), 0) || 0
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
        <div className="bg-[#fef9eb] p-10 rounded-[3.5rem] border-4 border-white shadow-sm group">
          <p className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">Ingresos</p>
          <p className="text-5xl font-black text-[#f6a118]">${data.totals.money.toLocaleString()}</p>
        </div>
        <div className="bg-[#fff1f2] p-10 rounded-[3.5rem] border-4 border-white shadow-sm group">
          <p className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">Socios</p>
          <p className="text-5xl font-black text-[#ea7e9c]">{data.totals.users}</p>
        </div>
        <div className="bg-[#f0f9ff] p-10 rounded-[3.5rem] border-4 border-white shadow-sm group">
          <p className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">Artículos</p>
          <p className="text-5xl font-black text-blue-400">{data.totals.products}</p>
        </div>
        <div className="bg-[#f0fdf4] p-10 rounded-[3.5rem] border-4 border-white shadow-sm group">
          <p className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">Puntos Club</p>
          <p className="text-5xl font-black text-green-400">{data.totals.points}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white h-[500px] shadow-inner">
          <h4 className="text-3xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
            <TrendingUp className="text-[#f6a118]" /> Tendencia de Ventas
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#ccc" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="amount" stroke="#f6a118" strokeWidth={6} fill="#fadb31" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white h-[500px] shadow-inner">
          <h4 className="text-3xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
            <Star className="text-[#ea7e9c]" /> Categorías Top
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.cats}
                innerRadius={80}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
              >
                {data.cats.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="bg-red-50 p-10 rounded-[4rem] border-8 border-white shadow-xl animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <AlertCircle className="text-red-500" size={48} />
            <h4 className="text-4xl font-black text-red-600 uppercase tracking-tighter">Stock Crítico</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.lowStock.map((p: any) => (
              <div key={p.id} className="bg-white p-4 rounded-3xl border-2 border-red-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 font-bold">!</div>
                <p className="text-sm font-black text-gray-700 uppercase truncate">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE: INVENTORY MANAGER ---
const InventoryManager: React.FC = () => {
  const { supabase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formMode, setFormMode] = useState<'list' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    let q = supabase.from('products').select('*');
    if (searchTerm) q = q.ilike('name', `%${searchTerm}%`);
    const { data } = await q.order('created_at', { ascending: false });
    if (data) setProducts(data.map((p: any) => ({ ...p, oldPrice: p.old_price, images: p.images || [], colors: p.colors || [] })));
  }, [supabase, searchTerm]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        newItems = json.map(r => {
          const keys = Object.keys(r);
          const find = (arr: string[]) => keys.find(k => arr.some(word => k.toLowerCase().includes(word)));
          const nK = find(['nom', 'prod', 'art', 'item']) || keys[0];
          const pK = find(['prec', 'val', 'cost']) || keys[1];
          const dK = find(['desc', 'info', 'detal']) || keys[2];
          const cK = find(['cat', 'tipo']);

          return {
            name: String(r[nK] || 'Sin Nombre').trim().toUpperCase(),
            price: Number(String(r[pK]).replace(/[^0-9.]/g, '')) || 0,
            description: r[dK] ? String(r[dK]) : "",
            category: r[cK] ? String(r[cK]) : "Otros",
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
        newItems = lines.map(line => {
          const regex = /^(.+?)\s+[\$]?\s?(\d+[\d\.,]*)$/;
          const match = line.trim().match(regex);
          if (match) {
            return {
              name: match[1].trim().toUpperCase(),
              price: parseFloat(match[2].replace(',', '.')) || 0,
              category: "Escolar",
              colors: [{ color: 'Único', stock: 5 }],
              images: []
            };
          }
          return null;
        }).filter(i => i !== null);
      }

      if (newItems.length > 0) {
        if (confirm(`¿Cargar ${newItems.length} artículos al sistema?`)) {
          const { error } = await supabase.from('products').insert(newItems);
          if (error) throw error;
          fetchProducts();
          alert("¡Importación exitosa! 🚀");
        }
      }
    } catch (err) { alert("Error procesando archivo."); }
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name) return alert("El nombre es obligatorio");
    setIsSaving(true);
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
      setFormMode('list');
      fetchProducts();
      alert("¡Tesoro guardado! ✨");
    }
    setIsSaving(false);
  };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Matita_web");
    const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.public_id) {
      setEditingProduct(prev => ({ ...prev!, images: [...(prev?.images || []), data.public_id] }));
    }
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-gray-50 p-8 rounded-[4rem] border-4 border-white shadow-inner">
          <div className="space-y-2">
            <h3 className="text-4xl font-black uppercase tracking-tighter">Catálogo Vital 📦</h3>
            <input type="file" ref={importInputRef} className="hidden" accept=".xlsx,.xls,.pdf" onChange={handleBulkImport} />
            <button onClick={() => importInputRef.current?.click()} className="text-[#ea7e9c] font-black text-sm underline uppercase tracking-widest flex items-center gap-2 hover:text-red-500">
              <Upload size={16} /> Importar Excel / PDF
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-96">
              <Search className="absolute left-5 top-5 text-gray-300" />
              <input 
                type="text" 
                placeholder="BUSCAR EN EL ALMACÉN..." 
                className="w-full p-5 pl-14 rounded-3xl bg-white border-4 border-transparent focus:border-[#fadb31] outline-none font-bold uppercase transition-all shadow-md"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingProduct({ name: '', price: 0, category: 'Escolar', colors: [{ color: 'Único', stock: 10 }], images: [] }); setFormMode('edit'); }}
              className="px-10 py-5 matita-gradient-orange text-white rounded-3xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase flex items-center gap-3 border-b-8 border-orange-700"
            >
              <Plus /> NUEVO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[3.5rem] border-8 border-gray-50 shadow-sm hover:border-[#fadb31] transition-all group relative">
              <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50">
                <img src={getImgUrl(p.images[0], 400)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <p className="text-[10px] font-black text-[#fadb31] uppercase mb-1">{p.category}</p>
              <h4 className="text-sm font-black uppercase text-gray-800 truncate mb-2">{p.name}</h4>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-[#f6a118] leading-none">${p.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="p-3 bg-gray-100 text-gray-400 rounded-2xl hover:bg-blue-400 hover:text-white transition-all"><Edit3 size={16}/></button>
                  <button onClick={async () => { if(confirm('¿BORRAR?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="p-3 bg-gray-100 text-gray-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
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
        <button onClick={() => setFormMode('list')} className="w-20 h-20 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all shadow-md">
          <ArrowRight className="rotate-180" size={32} />
        </button>
        <h3 className="text-5xl font-black uppercase tracking-tighter">Editor de Tesoros ✨</h3>
      </div>

      <div className="bg-[#fef9eb] p-12 rounded-[5rem] border-[12px] border-white shadow-2xl space-y-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-6 uppercase">Nombre Oficial</label>
            <input type="text" className="w-full text-3xl p-8 rounded-[3rem] outline-none shadow-inner uppercase font-black bg-white focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all" value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-6 uppercase">Categoría</label>
            <select className="w-full text-3xl p-8 rounded-[3rem] outline-none shadow-inner font-black uppercase appearance-none bg-white border-4 border-transparent focus:border-[#fadb31]" value={editingProduct?.category} onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}>
              {['Escolar', 'Oficina', 'Tecnología', 'Novedades', 'Ofertas', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-gray-400 ml-6 uppercase">Descripción del Tesoro</label>
          <textarea className="w-full text-xl p-8 rounded-[3.5rem] outline-none shadow-inner min-h-[250px] font-bold bg-white focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all" value={editingProduct?.description} onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 bg-white p-8 rounded-[3.5rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase">Precio Actual ($)</label>
            <input type="number" className="w-full text-5xl font-black text-[#f6a118] outline-none bg-transparent" value={editingProduct?.price} onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-8 rounded-[3.5rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase">Precio Tachado ($)</label>
            <input type="number" className="w-full text-5xl font-black text-gray-300 outline-none bg-transparent" value={editingProduct?.oldPrice} onChange={e => setEditingProduct({...editingProduct!, oldPrice: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-8 rounded-[3.5rem] shadow-sm">
            <label className="text-xs font-black text-gray-300 uppercase">Puntos Club ✨</label>
            <input type="number" className="w-full text-5xl font-black text-blue-400 outline-none bg-transparent" value={editingProduct?.points} onChange={e => setEditingProduct({...editingProduct!, points: Number(e.target.value)})} />
          </div>
        </div>

        {/* VARIANTES */}
        <div className="space-y-8">
          <div className="flex justify-between items-center px-6">
            <h4 className="text-3xl font-black uppercase text-gray-800 tracking-tighter">Variantes & Almacén</h4>
            <button onClick={() => setEditingProduct({...editingProduct!, colors: [...(editingProduct?.colors || []), { color: 'NUEVO', stock: 10 }]})} className="text-[#f6a118] font-black uppercase text-sm flex items-center gap-2 hover:scale-110 transition-transform">
              <Plus size={16}/> AÑADIR VARIANTE
            </button>
          </div>
          <div className="grid gap-4">
            {editingProduct?.colors?.map((c, i) => (
              <div key={i} className="flex items-center gap-6 bg-white p-8 rounded-[3.5rem] shadow-sm border-4 border-white group">
                <input className="flex-grow text-3xl font-black outline-none uppercase bg-transparent" value={c.color} onChange={e => {
                  const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({...editingProduct!, colors: n});
                }} />
                <div className="flex items-center gap-8 bg-gray-50 px-10 py-4 rounded-full border-4 border-white shadow-inner">
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock = Math.max(0, n[i].stock - 1); setEditingProduct({...editingProduct!, colors: n}); }} className="text-5xl text-red-300 hover:text-red-500 transition-colors">-</button>
                   <input type="number" className="w-24 text-center bg-transparent text-4xl font-black outline-none" value={c.stock} onChange={e => {
                     const n = [...editingProduct.colors!]; n[i].stock = parseInt(e.target.value) || 0; setEditingProduct({...editingProduct!, colors: n});
                   }} />
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock += 1; setEditingProduct({...editingProduct!, colors: n}); }} className="text-5xl text-[#f6a118] hover:text-orange-600 transition-colors">+</button>
                </div>
                <button onClick={() => setEditingProduct({...editingProduct!, colors: editingProduct.colors?.filter((_, idx) => idx !== i)})} className="text-red-200 hover:text-red-500 transition-colors"><Trash2 size={28}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* FOTOS */}
        <div className="space-y-8">
           <h4 className="text-3xl font-black uppercase text-gray-800 tracking-tighter px-6">Galería Visual</h4>
           <div className="flex flex-wrap gap-6 px-6">
              {editingProduct?.images?.map((img, i) => (
                <div key={i} className="relative w-48 h-48 group">
                  <img src={getImgUrl(img, 400)} className="w-full h-full object-cover rounded-[3rem] border-8 border-white shadow-xl group-hover:scale-105 transition-transform" />
                  <button onClick={() => setEditingProduct({...editingProduct!, images: editingProduct.images?.filter((_, idx) => idx !== i)})} className="absolute -top-3 -right-3 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl font-black text-xl hover:scale-110 transition-all">×</button>
                </div>
              ))}
              <label className="w-48 h-48 bg-white rounded-[3rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#fadb31] transition-all group shadow-inner">
                <ImageIcon size={48} className="text-gray-200 group-hover:text-[#fadb31] transition-colors" />
                <span className="mt-2 text-[10px] font-black text-gray-300 uppercase">Añadir Foto</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImgUpload} />
              </label>
           </div>
        </div>

        <button 
          onClick={handleSaveProduct} 
          disabled={isSaving}
          className="w-full py-12 matita-gradient-orange text-white rounded-[4rem] text-5xl font-black uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all border-b-[12px] border-orange-700 disabled:opacity-50"
        >
           {isSaving ? 'GUARDANDO...' : '¡PUBLICAR TESORO! ✨'}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE: SOCIOS MANAGER ---
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

  const filtered = socios.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const handleUpdate = async () => {
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

  const handleResetPass = async (email: string) => {
    if (confirm(`¿Enviar instrucciones de cambio de clave a ${email}?`)) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (!error) alert("Email de recuperación enviado correctamente 📧");
      else alert("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <h3 className="text-5xl font-black uppercase tracking-tighter">Socios del Club 👑</h3>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-5 top-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="BUSCAR SOCIO POR NOMBRE O MAIL..." 
            className="w-full p-5 pl-14 rounded-3xl bg-gray-50 border-4 border-transparent focus:border-[#fadb31] focus:bg-white outline-none font-bold uppercase transition-all shadow-inner"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid gap-6">
        {filtered.map(s => (
          <div key={s.id} className="bg-white p-10 rounded-[4rem] border-8 border-gray-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 group hover:border-[#fadb31] transition-all">
            <div className="flex items-center gap-8">
               <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner ${s.isAdmin ? 'bg-orange-100' : 'bg-blue-50'}`}>
                 {s.isAdmin ? '🛡️' : '👤'}
               </div>
               <div>
                  <h4 className="text-4xl font-black uppercase text-gray-800 leading-none mb-2">{s.name}</h4>
                  <div className="flex items-center gap-3 text-lg text-gray-400 font-bold lowercase">
                    <Mail size={16}/> {s.email}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {s.isAdmin && <span className="bg-orange-500 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase flex items-center gap-1"><ShieldCheck size={12}/> Admin</span>}
                    {s.isSocio && <span className="bg-[#fadb31] text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase flex items-center gap-1"><Star size={12}/> Socio VIP</span>}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="text-center bg-gray-50 px-10 py-6 rounded-[3rem] shadow-inner border-4 border-white">
                  <p className="text-5xl font-black text-[#f6a118] leading-none mb-1">{s.points.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">PUNTOS ✨</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setEditingSocio(s)} className="w-20 h-20 bg-blue-50 text-blue-400 rounded-[2rem] flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all shadow-md">
                    <UserCog size={32}/>
                  </button>
                  <button onClick={() => handleResetPass(s.email)} className="w-20 h-20 bg-orange-50 text-orange-400 rounded-[2rem] flex items-center justify-center hover:bg-orange-400 hover:text-white transition-all shadow-md">
                    <Key size={32}/>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {editingSocio && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[5rem] p-16 border-[16px] border-white shadow-2xl space-y-12 animate-slideUp">
             <div className="text-center space-y-2">
                <h3 className="text-5xl font-black uppercase tracking-tighter">Perfil de Socio</h3>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{editingSocio.email}</p>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-sm font-black text-gray-400 ml-6 uppercase">Nombre Completo</label>
                   <input type="text" className="w-full text-3xl p-8 rounded-[3rem] bg-gray-50 font-black uppercase outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner" value={editingSocio.name} onChange={e => setEditingSocio({...editingSocio, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                   <label className="text-sm font-black text-gray-400 ml-6 uppercase">Billetera de Puntos</label>
                   <div className="flex items-center gap-6">
                      <input type="number" className="flex-grow text-4xl p-8 rounded-[3rem] bg-gray-50 font-black outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner" value={editingSocio.points} onChange={e => setEditingSocio({...editingSocio, points: parseInt(e.target.value) || 0})} />
                      <div className="w-24 h-24 bg-[#fef9eb] rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-white">✨</div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <button 
                    onClick={() => setEditingSocio({...editingSocio, isSocio: !editingSocio.isSocio})}
                    className={`py-8 rounded-[3rem] text-2xl font-black uppercase transition-all shadow-lg flex items-center justify-center gap-3 border-b-8 ${editingSocio.isSocio ? 'bg-[#fadb31] text-white border-yellow-600' : 'bg-gray-100 text-gray-300 border-gray-200'}`}
                   >
                     {editingSocio.isSocio ? <CheckCircle2/> : <XCircle/>} {editingSocio.isSocio ? 'SOCIO VIP' : 'NO SOCIO'}
                   </button>
                   <button 
                    onClick={() => setEditingSocio({...editingSocio, isAdmin: !editingSocio.isAdmin})}
                    className={`py-8 rounded-[3rem] text-2xl font-black uppercase transition-all shadow-lg flex items-center justify-center gap-3 border-b-8 ${editingSocio.isAdmin ? 'bg-orange-500 text-white border-orange-700' : 'bg-gray-100 text-gray-300 border-gray-200'}`}
                   >
                     {editingSocio.isAdmin ? <ShieldCheck/> : <User/>} {editingSocio.isAdmin ? 'ADMINISTRADOR' : 'USUARIO'}
                   </button>
                </div>
             </div>

             <div className="flex gap-6">
                <button onClick={() => setEditingSocio(null)} className="flex-1 py-8 bg-gray-50 text-gray-300 rounded-[3rem] font-black uppercase text-xl hover:bg-gray-100 transition-all">Cancelar</button>
                <button onClick={handleUpdate} className="flex-1 py-8 matita-gradient-orange text-white rounded-[3rem] font-black uppercase text-2xl shadow-xl border-b-8 border-orange-700">Guardar ✨</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- OTROS COMPONENTES ---

const SalesManager: React.FC = () => {
  const { supabase } = useApp();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (data) setSales(data);
    };
    fetch();
  }, [supabase]);

  return (
    <div className="space-y-12 animate-fadeIn">
      <h3 className="text-5xl font-black uppercase tracking-tighter">Historial de Ventas 💸</h3>
      <div className="grid gap-6">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-10 rounded-[4rem] border-4 border-white shadow-sm flex flex-col lg:flex-row justify-between items-center group hover:bg-white transition-all">
             <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:bg-[#fef9eb]">🛍️</div>
                <div>
                   <p className="text-3xl font-black uppercase text-gray-800 leading-none mb-1">#{s.id.slice(0, 8)} - {s.user_name || 'Invitado'}</p>
                   <p className="text-lg text-gray-300 font-bold uppercase tracking-widest flex items-center gap-2">
                     <Settings size={14}/> {new Date(s.created_at).toLocaleString('es-AR')}
                   </p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-6xl font-black text-[#f6a118] leading-none mb-2">${s.total.toLocaleString()}</p>
                <span className="bg-green-100 text-green-500 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">PAGADO ✅</span>
             </div>
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
    const fetch = async () => {
      const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
      if (data) setIdeas(data);
    };
    fetch();
  }, [supabase]);

  return (
    <div className="space-y-12 animate-fadeIn px-4">
      <h3 className="text-5xl font-black uppercase tracking-tighter">Buzón de Ideas 💡</h3>
      <div className="grid gap-10">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-12 rounded-[5rem] border-[12px] border-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-10 right-10 text-[10rem] opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-transform text-[#fadb31]">💡</div>
            <p className="text-4xl font-black text-gray-800 mb-8 italic uppercase leading-none">"{i.title}"</p>
            <p className="text-2xl text-gray-500 font-bold leading-relaxed uppercase mb-8">{i.content}</p>
            <div className="flex items-center gap-3 bg-white w-fit px-8 py-4 rounded-full shadow-md">
              <div className="w-8 h-8 bg-[#f6a118] rounded-full"></div>
              <p className="text-lg text-[#f6a118] font-black uppercase tracking-widest">- {i.user_name || 'Anónimo'}</p>
            </div>
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
      <h3 className="text-6xl font-black text-[#f6a118] uppercase tracking-tighter">Marca & Estilo 🎨</h3>
      <div className="bg-[#fef9eb] p-24 rounded-[6rem] shadow-2xl border-[20px] border-white relative">
        <div 
          className="w-80 h-80 bg-white rounded-full mx-auto shadow-2xl flex items-center justify-center p-14 border-[12px] border-[#fadb31] cursor-pointer group hover:scale-110 transition-all relative" 
          onClick={() => fRef.current?.click()}
        >
          <img src={preview ? URL.createObjectURL(preview) : getImgUrl(logoUrl, 600)} className="w-full h-full object-contain group-hover:rotate-6 transition-transform" alt="Logo" />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-5xl">📸</div>
        </div>
        <div className="mt-12 space-y-4">
           <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm">Cambiar Logotipo Oficial</p>
           <p className="text-gray-300 text-xs uppercase px-10">Asegurate de usar una imagen PNG transparente para que brille ✨</p>
        </div>
        <input type="file" ref={fRef} className="hidden" accept="image/*" onChange={e => setPreview(e.target.files?.[0] || null)} />
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full mt-16 py-10 matita-gradient-orange text-white rounded-[3.5rem] text-4xl font-black shadow-2xl uppercase border-b-[12px] border-orange-700 hover:scale-105 active:scale-95 transition-all"
        >
          {isSaving ? "Guardando..." : "Sincronizar Marca ✨"}
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
    alert("🖼️ Banner principal actualizado.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <h3 className="text-5xl font-black text-[#f6a118] uppercase tracking-tighter text-center">Escaparate de Portada 🖼️</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-[4rem] overflow-hidden border-[10px] border-white shadow-2xl aspect-[4/5] bg-gray-50">
            <img src={getImgUrl(img, 800)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="bg-red-500 text-white p-6 rounded-full shadow-2xl hover:scale-125 active:scale-95 transition-all">
                <Trash2 size={32}/>
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()} className="aspect-[4/5] flex flex-col items-center justify-center bg-[#fef9eb] rounded-[4rem] border-[10px] border-dashed border-white hover:bg-white hover:border-[#fadb31] transition-all group shadow-xl">
          <Plus size={80} className="text-gray-200 group-hover:text-[#fadb31] group-hover:scale-125 transition-all" />
          <span className="mt-4 font-black text-gray-300 uppercase tracking-widest text-xs">Subir Foto</span>
        </button>
      </div>
      <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
      <button onClick={save} disabled={isSaving} className="w-full py-12 matita-gradient-orange text-white rounded-[4rem] text-5xl font-black shadow-2xl uppercase border-b-[12px] border-orange-700 hover:scale-[1.02] active:scale-95 transition-all">
         {isSaving ? "Guardando Portada..." : "¡Publicar Banner! ✨"}
      </button>
    </div>
  );
};

export default AdminPanel;
