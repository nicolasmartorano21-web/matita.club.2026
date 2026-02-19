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
  Copy, AlertTriangle, Info, Image as LucideImage
} from 'lucide-react';

// LIBRERÍAS EXTERNAS (Configuradas en el package.json)
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Configuración obligatoria de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * UTILERÍA DE IMÁGENES CLOUDINARY PARA MATITA
 */
const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

// --- COMPONENTE PRINCIPAL: ADMIN PANEL ---
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
    else alert('Clave incorrecta ❌ Acceso denegado al Panel Maestro.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-6 font-matita">
        <div className="max-w-md w-full bg-white rounded-[4rem] p-16 shadow-2xl border-[12px] border-white text-center space-y-10 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 matita-gradient-orange"></div>
          <div className="text-9xl animate-float">👑</div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Panel Maestro</h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Exclusivo Personal Matita</p>
          </div>
          <form onSubmit={handleAdminAuth} className="space-y-8">
            <input
              type="password"
              placeholder="CLAVE DE ACCESO"
              className="w-full text-3xl text-center shadow-inner py-6 bg-[#fef9eb] rounded-3xl outline-none uppercase font-black border-4 border-transparent focus:border-[#fadb31] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button className="w-full py-8 matita-gradient-orange text-white rounded-[2.5rem] text-3xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase border-b-8 border-orange-700">
              ENTRAR 🚪
            </button>
          </form>
          <button onClick={() => navigate('/')} className="text-gray-400 font-bold uppercase underline text-xs hover:text-gray-600 transition-colors">Volver a la Tienda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto py-10 px-4 space-y-12 font-matita animate-fadeIn">
      {/* HEADER DE CONTROL */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 border-b-8 border-[#fadb31]/20 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 matita-gradient-orange rounded-3xl flex items-center justify-center text-white shadow-lg">
              <Settings size={40} className="animate-spin-slow" />
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">
              Gestión <span className="text-gray-800">MATITA</span>
            </h2>
          </div>
          <p className="text-2xl text-gray-400 font-bold uppercase tracking-[0.4em] ml-2">Mando Central de Operaciones ✏️</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-5 rounded-[3.5rem] shadow-2xl border-4 border-white">
          {[
            { id: 'dashboard', label: '📊 Stats', icon: TrendingUp },
            { id: 'inventory', label: '📦 Stock', icon: Package },
            { id: 'sales', label: '💸 Ventas', icon: ShoppingBag },
            { id: 'socios', label: '👥 Socios', icon: Users },
            { id: 'ideas', label: '💡 Ideas', icon: Lightbulb },
            { id: 'design', label: '🎨 Marca', icon: ImageIcon },
            { id: 'carousel', label: '🖼️ Inicio', icon: LucideImage }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-5 rounded-[2rem] text-lg font-black transition-all uppercase flex items-center gap-3 ${activeTab === tab.id ? 'matita-gradient-orange text-white shadow-xl scale-110 -translate-y-1' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <tab.icon size={22} />
              <span className="hidden md:inline">{tab.label.split(' ')[1]}</span>
            </button>
          ))}
          <div className="w-px h-12 bg-gray-100 mx-2 hidden xl:block"></div>
          <button onClick={() => setIsAuthenticated(false)} className="px-8 py-5 bg-red-50 text-red-400 rounded-[2rem] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-md group">
            <LogOut size={26} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE SECCIONES */}
      <div className="bg-white rounded-[4rem] md:rounded-[6rem] shadow-matita p-8 md:p-20 border-[16px] border-white min-h-[850px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fadb31]/5 rounded-full -mr-64 -mt-64 -z-0"></div>
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

      <p className="text-center text-gray-300 font-bold uppercase tracking-widest text-xs">Librería Matita © 2026 - Panel de Control Versión 4.0.1</p>
    </div>
  );
};

// --- SECCIÓN: DASHBOARD (ESTADÍSTICAS AVANZADAS) ---
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
      const { data: usersFull } = await supabase.from('users').select('points');

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
            points: usersFull?.reduce((a, b) => a + (b.points || 0), 0) || 0
          }
        });
      }
    };
    loadStats();
  }, [supabase]);

  const COLORS = ['#f6a118', '#ea7e9c', '#fadb31', '#93c5fd', '#86efac', '#c084fc'];

  return (
    <div className="space-y-20 animate-fadeIn">
      {/* TARJETAS DE TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Ingresos Netos', val: `$${data.totals.money.toLocaleString()}`, color: '#f6a118', bg: '#fef9eb', icon: ShoppingBag },
          { label: 'Socios Club', val: data.totals.users, color: '#ea7e9c', bg: '#fff1f2', icon: Users },
          { label: 'Items Activos', val: data.totals.products, color: '#3b82f6', bg: '#f0f9ff', icon: Package },
          { label: 'Puntos Emitidos', val: data.totals.points, color: '#10b981', bg: '#f0fdf4', icon: Star }
        ].map((card, i) => (
          <div key={i} className="p-12 rounded-[4rem] border-4 border-white shadow-sm relative overflow-hidden group hover:shadow-xl transition-all" style={{ backgroundColor: card.bg }}>
            <card.icon className="absolute -right-4 -top-4 w-32 h-32 opacity-5 group-hover:scale-110 transition-transform" />
            <p className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
            <p className="text-6xl font-black" style={{ color: card.color }}>{card.val}</p>
          </div>
        ))}
      </div>

      {/* GRÁFICOS PRINCIPALES */}
      <div className="grid lg:grid-cols-2 gap-16">
        <div className="bg-gray-50 p-12 rounded-[5rem] border-4 border-white h-[550px] shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <TrendingUp className="text-[#f6a118]" /> Curva de Ventas
            </h4>
            <div className="bg-white px-6 py-2 rounded-full text-xs font-black text-gray-400 uppercase shadow-sm">Real Time</div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data.history}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f6a118" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f6a118" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
              <XAxis dataKey="date" stroke="#bbb" fontSize={12} fontStyle="bold" />
              <YAxis stroke="#bbb" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '30px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="amount" stroke="#f6a118" strokeWidth={8} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-12 rounded-[5rem] border-4 border-white h-[550px] shadow-inner">
          <h4 className="text-3xl font-black mb-10 uppercase tracking-tighter flex items-center gap-3">
            <Star className="text-[#ea7e9c]" /> Distribución Categorías
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={data.cats}
                innerRadius={100}
                outerRadius={160}
                paddingAngle={8}
                dataKey="value"
              >
                {data.cats.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ALERTAS DE STOCK */}
      {data.lowStock.length > 0 && (
        <div className="bg-red-50 p-12 rounded-[5rem] border-8 border-white shadow-2xl animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <AlertTriangle size={40} />
            </div>
            <div>
              <h4 className="text-4xl font-black text-red-600 uppercase tracking-tighter leading-none">Reposición Crítica</h4>
              <p className="text-red-400 font-bold uppercase text-sm tracking-widest mt-2">Productos con menos de 5 unidades</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data.lowStock.map((p: any) => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-red-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-black text-2xl mb-4">!</div>
                <p className="text-xs font-black text-gray-800 uppercase line-clamp-2">{p.name}</p>
                <p className="mt-2 text-red-500 font-black text-lg">Quedan: {p.colors?.reduce((a:number, b:any) => a + Number(b.stock), 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SECCIÓN: INVENTORY MANAGER (IMPORTACIÓN PRO & CRUD) ---
const InventoryManager: React.FC = () => {
  const { supabase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formMode, setFormMode] = useState<'list' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    let q = supabase.from('products').select('*');
    if (searchTerm) q = q.ilike('name', `%${searchTerm}%`);
    const { data } = await q.order('created_at', { ascending: false });
    if (data) setProducts(data.map((p: any) => ({ 
      ...p, 
      oldPrice: p.old_price, 
      images: p.images || [], 
      colors: p.colors || [],
      description: p.description || ""
    })));
  }, [supabase, searchTerm]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // LÓGICA DE IMPORTACIÓN INTELIGENTE (Detecta columnas por nombre parecido)
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

        newItems = json.map(row => {
          const keys = Object.keys(row);
          const findKey = (words: string[]) => keys.find(k => words.some(w => k.toLowerCase().includes(w)));
          
          const nameK = findKey(['nom', 'prod', 'art', 'item', 'tit']) || keys[0];
          const priceK = findKey(['prec', 'val', 'cost', 'monto']) || keys[1];
          const descK = findKey(['desc', 'info', 'detal', 'obs']) || keys[2];
          const catK = findKey(['cat', 'tipo', 'rubro', 'grupo']);

          return {
            name: String(row[nameK] || 'Sin Nombre').trim().toUpperCase(),
            price: Number(String(row[priceK]).replace(/[^0-9.]/g, '')) || 0,
            description: row[descK] ? String(row[descK]) : "",
            category: row[catK] ? String(row[catK]) : "Varios",
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
          // Busca patron: Texto del producto seguido de precio al final
          const regex = /^(.+?)\s+[\$]?\s?(\d+[\d\.,]*)$/;
          const match = line.trim().match(regex);
          if (match) {
            return {
              name: match[1].trim().toUpperCase(),
              price: parseFloat(match[2].replace(',', '.')) || 0,
              description: "Extracción PDF",
              category: "Escolar",
              colors: [{ color: 'Único', stock: 5 }],
              images: []
            };
          }
          return null;
        }).filter(i => i !== null);
      }

      if (newItems.length > 0) {
        if (confirm(`He detectado ${newItems.length} productos en el archivo. ¿Deseas cargarlos al catálogo ahora?`)) {
          const { error } = await supabase.from('products').insert(newItems);
          if (error) throw error;
          fetchProducts();
          alert("¡Importación procesada con éxito! 🚀 El catálogo está al día.");
        }
      } else {
        alert("No se pudieron extraer productos válidos. Verificá que el archivo tenga columnas de Nombre y Precio.");
      }
    } catch (err) { alert("Ocurrió un error al procesar el archivo: " + err); }
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name) return alert("¡El nombre del tesoro es obligatorio!");
    setIsSaving(true);
    try {
      const payload = {
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: Number(editingProduct.price) || 0,
        old_price: Number(editingProduct.oldPrice) || 0,
        points: Number(editingProduct.points) || 0,
        category: editingProduct.category || "Escolar",
        images: editingProduct.images || [],
        colors: editingProduct.colors?.map(c => ({ ...c, stock: Number(c.stock) })) || []
      };

      const { error } = editingProduct.id 
        ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert(payload);
      
      if (error) throw error;

      alert("¡Catálogo sincronizado perfectamente! 🌸");
      setFormMode('list');
      fetchProducts();
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
      formData.append("folder", "matita2026");
      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.public_id) uploadedIds.push(data.public_id);
      } catch (err) { console.error("Cloudinary Error:", err); }
    }
    
    setEditingProduct(prev => ({ ...prev!, images: [...(prev?.images || []), ...uploadedIds] }));
    setIsUploading(false);
  };

  const handleClone = (p: Product) => {
    const clone = { ...p, id: undefined, name: `${p.name} (COPIA)`, created_at: undefined };
    setEditingProduct(clone);
    setFormMode('edit');
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-16 animate-fadeIn">
        {/* BARRA DE ACCIONES SUPERIOR */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 bg-gray-50 p-10 rounded-[4.5rem] border-4 border-white shadow-inner">
          <div className="space-y-3">
            <h3 className="text-5xl font-black uppercase tracking-tighter">Almacén Vital 📦</h3>
            <div className="flex items-center gap-6">
              <input type="file" ref={importInputRef} className="hidden" accept=".xlsx,.xls,.csv,.pdf" onChange={handleBulkImport} />
              <button onClick={() => importInputRef.current?.click()} className="text-[#ea7e9c] font-black text-sm underline uppercase tracking-widest flex items-center gap-2 hover:text-red-500 transition-colors">
                <Upload size={18} /> Cargar Masivamente (Excel/PDF)
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-[450px]">
              <Search className="absolute left-6 top-6 text-gray-300" size={24} />
              <input 
                type="text" 
                placeholder="BUSCAR EN EL CATÁLOGO..." 
                className="w-full p-6 pl-16 rounded-[2rem] bg-white border-4 border-transparent focus:border-[#fadb31] outline-none font-bold uppercase transition-all shadow-xl text-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingProduct({ name: '', price: 0, category: 'Escolar', colors: [{ color: 'Único', stock: 10 }], images: [] }); setFormMode('edit'); }}
              className="px-12 py-6 matita-gradient-orange text-white rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase flex items-center gap-4 border-b-8 border-orange-700"
            >
              <Plus size={28} /> NUEVO ITEM
            </button>
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS EN GRILLA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
          {products.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[4rem] border-[10px] border-gray-50 shadow-sm hover:border-[#fadb31] hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => handleClone(p)} className="p-4 bg-white/90 rounded-full shadow-xl text-[#fadb31] hover:scale-110 active:scale-90 transition-all"><Copy size={22}/></button>
                <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="p-4 bg-white/90 rounded-full shadow-xl text-blue-400 hover:scale-110 active:scale-90 transition-all"><Edit3 size={22}/></button>
                <button onClick={async () => { if(confirm('¿BORRAR PARA SIEMPRE?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="p-4 bg-white/90 rounded-full shadow-xl text-red-400 hover:scale-110 active:scale-90 transition-all"><Trash2 size={22}/></button>
              </div>

              <div className="aspect-square rounded-[3rem] overflow-hidden mb-8 bg-gray-50 border-4 border-white shadow-inner relative">
                <img src={getImgUrl(p.images[0], 400)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
                <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 uppercase border-2 border-white shadow-md">{p.category}</div>
              </div>

              <div className="space-y-2 flex-grow">
                <h4 className="text-xl font-black uppercase text-gray-800 tracking-tighter leading-none h-14 line-clamp-2">{p.name}</h4>
                <div className="flex justify-between items-end pt-4">
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-[#f6a118] leading-none">${p.price.toLocaleString()}</p>
                    {p.oldPrice > 0 && <p className="text-sm font-bold text-gray-300 line-through">${p.oldPrice.toLocaleString()}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-800 leading-none">{p.colors?.reduce((a, b) => a + Number(b.stock), 0)}</p>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Stock</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MODO EDITOR DE PRODUCTO
  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-fadeIn">
      <div className="flex items-center gap-10">
        <button onClick={() => setFormMode('list')} className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-white transition-all shadow-md group">
          <ArrowRight className="rotate-180 group-hover:-translate-x-2 transition-transform" size={40} />
        </button>
        <div className="space-y-2">
          <h3 className="text-6xl font-black uppercase tracking-tighter text-gray-800">Editor de Tesoro ✨</h3>
          <p className="text-xl text-gray-400 font-bold uppercase tracking-[0.2em]">{editingProduct?.id ? 'Modificando artículo existente' : 'Agregando nuevo tesoro al club'}</p>
        </div>
      </div>

      <div className="bg-[#fef9eb] p-12 md:p-20 rounded-[6rem] border-[16px] border-white shadow-2xl space-y-16 relative">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest flex items-center gap-2"><Info size={14}/> Nombre Comercial</label>
            <input type="text" className="w-full text-4xl p-10 rounded-[3.5rem] outline-none shadow-inner uppercase font-black bg-white focus:ring-8 focus:ring-[#fadb31]/10 transition-all" value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest flex items-center gap-2"><Package size={14}/> Categoría</label>
            <select className="w-full text-4xl p-10 rounded-[3.5rem] outline-none shadow-inner font-black uppercase appearance-none bg-white border-none focus:ring-8 focus:ring-[#fadb31]/10 transition-all" value={editingProduct?.category} onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}>
              {['Escolar', 'Oficina', 'Tecnología', 'Regalos', 'Ofertas', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest">Biografía del Producto (Descripción)</label>
          <textarea className="w-full text-2xl p-12 rounded-[4rem] outline-none shadow-inner min-h-[300px] font-bold bg-white focus:ring-8 focus:ring-[#fadb31]/10 transition-all leading-relaxed" placeholder="Contá de qué se trata este tesoro..." value={editingProduct?.description} onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4 bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:translate-y-[-5px]">
            <label className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] block text-center">Precio de Venta ($)</label>
            <input type="number" className="w-full text-6xl font-black text-[#f6a118] outline-none bg-transparent text-center" value={editingProduct?.price} onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:translate-y-[-5px]">
            <label className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] block text-center">Precio Anterior ($)</label>
            <input type="number" className="w-full text-6xl font-black text-gray-300 outline-none bg-transparent text-center" value={editingProduct?.oldPrice} onChange={e => setEditingProduct({...editingProduct!, oldPrice: Number(e.target.value)})} />
          </div>
          <div className="space-y-4 bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:translate-y-[-5px]">
            <label className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] block text-center">Puntos Obtenidos ✨</label>
            <input type="number" className="w-full text-6xl font-black text-blue-400 outline-none bg-transparent text-center" value={editingProduct?.points} onChange={e => setEditingProduct({...editingProduct!, points: Number(e.target.value)})} />
          </div>
        </div>

        {/* VARIANTES Y STOCK */}
        <div className="space-y-8">
          <div className="flex justify-between items-center px-10">
            <h4 className="text-4xl font-black uppercase text-gray-800 tracking-tighter">Variantes y Almacén</h4>
            <button onClick={() => setEditingProduct({...editingProduct!, colors: [...(editingProduct?.colors || []), { color: 'NUEVA VARIANTE', stock: 10 }]})} className="px-8 py-3 bg-[#f6a118] text-white rounded-2xl font-black uppercase text-sm flex items-center gap-3 hover:scale-110 shadow-lg active:scale-95 transition-all">
              <Plus size={18}/> AÑADIR VARIANTE
            </button>
          </div>
          <div className="grid gap-6">
            {editingProduct?.colors?.map((c, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:shadow-md">
                <input className="flex-grow text-3xl font-black outline-none uppercase bg-transparent p-4 rounded-3xl border-2 border-transparent focus:border-gray-100" value={c.color} onChange={e => {
                  const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({...editingProduct!, colors: n});
                }} />
                <div className="flex items-center gap-10 bg-gray-50 px-12 py-6 rounded-full border-4 border-white shadow-inner">
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock = Math.max(0, n[i].stock - 1); setEditingProduct({...editingProduct!, colors: n}); }} className="text-6xl text-red-300 hover:text-red-500 hover:scale-125 transition-all">-</button>
                   <input type="number" className="w-28 text-center bg-transparent text-5xl font-black outline-none" value={c.stock} onChange={e => {
                     const n = [...editingProduct.colors!]; n[i].stock = parseInt(e.target.value) || 0; setEditingProduct({...editingProduct!, colors: n});
                   }} />
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock += 1; setEditingProduct({...editingProduct!, colors: n}); }} className="text-6xl text-[#f6a118] hover:text-orange-600 hover:scale-125 transition-all">+</button>
                </div>
                <button onClick={() => setEditingProduct({...editingProduct!, colors: editingProduct.colors?.filter((_, idx) => idx !== i)})} className="p-6 bg-red-50 text-red-200 hover:text-red-500 hover:bg-red-100 rounded-full transition-all"><Trash2 size={32}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* GALERÍA DE FOTOS */}
        <div className="space-y-10">
           <h4 className="text-4xl font-black uppercase text-gray-800 tracking-tighter px-10">Galería de Imágenes</h4>
           <div className="flex flex-wrap gap-8 px-10">
              {editingProduct?.images?.map((img, i) => (
                <div key={i} className="relative w-56 h-56 group">
                  <img src={getImgUrl(img, 400)} className="w-full h-full object-cover rounded-[3.5rem] border-[10px] border-white shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={() => setEditingProduct({...editingProduct!, images: editingProduct.images?.filter((_, idx) => idx !== i)})} className="absolute -top-4 -right-4 bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl font-black text-2xl hover:scale-110 active:scale-90 transition-all">×</button>
                </div>
              ))}
              <label className="w-56 h-56 bg-white rounded-[3.5rem] border-8 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#fadb31] transition-all group shadow-inner">
                {isUploading ? (
                  <RefreshCcw size={60} className="text-[#fadb31] animate-spin" />
                ) : (
                  <>
                    <ImageIcon size={60} className="text-gray-200 group-hover:text-[#fadb31] group-hover:scale-110 transition-all" />
                    <span className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest">Subir Foto</span>
                  </>
                )}
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              </label>
           </div>
        </div>

        <button 
          onClick={handleSaveProduct} 
          disabled={isSaving}
          className="w-full py-16 matita-gradient-orange text-white rounded-[5rem] text-5xl font-black uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all border-b-[16px] border-orange-700 disabled:opacity-50 disabled:grayscale"
        >
           {isSaving ? 'SINCRONIZANDO...' : '¡GUARDAR TODO EN LA NUBE! ✨'}
        </button>
      </div>
    </div>
  );
};

// --- SECCIÓN: SOCIOS MANAGER (GESTIÓN AVANZADA) ---
const SociosManager: React.FC = () => {
  const { supabase } = useApp();
  const [socios, setSocios] = useState<User[]>([]);
  const [editingSocio, setEditingSocio] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSocios = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
    if (data) setSocios(data.map((u: any) => ({ ...u, isSocio: u.is_socio, isAdmin: u.is_admin })));
    setLoading(false);
  };

  useEffect(() => { fetchSocios(); }, [supabase]);

  const filtered = socios.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateSocio = async () => {
    if (!editingSocio) return;
    setLoading(true);
    const { error } = await supabase.from('users').update({
      name: editingSocio.name,
      points: editingSocio.points,
      is_socio: editingSocio.isSocio,
      is_admin: editingSocio.isAdmin
    }).eq('id', editingSocio.id);

    if (!error) {
      alert("¡Socio actualizado con éxito! ✅");
      setEditingSocio(null);
      fetchSocios();
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    if (confirm(`¿Estás seguro de enviar instrucciones de restablecimiento de contraseña a ${email}?`)) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (!error) alert("¡Email de recuperación enviado correctamente! 📧");
      else alert("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="space-y-3">
          <h3 className="text-6xl font-black uppercase tracking-tighter">Socios del Club 👑</h3>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Gestioná los beneficios y rangos de los miembros</p>
        </div>
        <div className="relative w-full lg:w-[500px]">
          <Search className="absolute left-6 top-6 text-gray-300" size={24} />
          <input 
            type="text" 
            placeholder="BUSCAR POR NOMBRE O CORREO..." 
            className="w-full p-6 pl-16 rounded-[2.5rem] bg-gray-50 border-4 border-transparent focus:border-[#fadb31] focus:bg-white outline-none font-bold uppercase transition-all shadow-inner text-xl"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid gap-8">
        {filtered.map(s => (
          <div key={s.id} className="bg-white p-12 rounded-[4.5rem] border-8 border-gray-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-10 group hover:border-[#fadb31] hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="flex items-center gap-10">
               <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center text-6xl shadow-inner relative ${s.isAdmin ? 'bg-orange-100' : 'bg-blue-50'}`}>
                 {s.isAdmin ? '🛡️' : '👑'}
                 {s.isSocio && <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#fadb31] rounded-full border-4 border-white"></div>}
               </div>
               <div className="space-y-1">
                  <h4 className="text-4xl font-black uppercase text-gray-800 leading-none mb-2">{s.name || 'Sin Nombre'}</h4>
                  <div className="flex items-center gap-4 text-xl text-gray-400 font-bold lowercase italic">
                    <Mail size={20}/> {s.email}
                  </div>
                  <div className="flex gap-3 mt-6">
                    {s.isAdmin && <span className="bg-orange-500 text-white text-[10px] px-5 py-2 rounded-full font-black uppercase flex items-center gap-2 shadow-md"><ShieldCheck size={14}/> Administrador</span>}
                    {s.isSocio && <span className="bg-[#fadb31] text-white text-[10px] px-5 py-2 rounded-full font-black uppercase flex items-center gap-2 shadow-md"><Star size={14}/> Socio VIP</span>}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-10">
               <div className="text-center bg-gray-50 px-12 py-8 rounded-[3.5rem] shadow-inner border-4 border-white min-w-[220px]">
                  <p className="text-6xl font-black text-[#f6a118] leading-none mb-2">{s.points.toLocaleString()}</p>
                  <p className="text-[12px] font-black text-gray-300 uppercase tracking-widest">Billetera ✨</p>
               </div>
               <div className="flex gap-5">
                  <button onClick={() => setEditingSocio(s)} className="w-24 h-24 bg-blue-50 text-blue-400 rounded-[2.5rem] flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all shadow-lg active:scale-90" title="Editar Perfil">
                    <UserCog size={36}/>
                  </button>
                  <button onClick={() => handleResetPassword(s.email)} className="w-24 h-24 bg-orange-50 text-orange-400 rounded-[2.5rem] flex items-center justify-center hover:bg-orange-400 hover:text-white transition-all shadow-lg active:scale-90" title="Restablecer Clave">
                    <Key size={36}/>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDITOR DE SOCIO (EXPANDIDO) */}
      {editingSocio && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[5rem] p-16 border-[20px] border-white shadow-2xl space-y-12 animate-slideUp relative">
             <button onClick={() => setEditingSocio(null)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors"><XCircle size={40}/></button>
             
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-[#fef9eb] rounded-full mx-auto flex items-center justify-center text-4xl shadow-md border-4 border-white">👤</div>
                <h3 className="text-5xl font-black uppercase tracking-tighter">Perfil de Miembro</h3>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em]">{editingSocio.email}</p>
             </div>
             
             <div className="space-y-10">
                <div className="space-y-4">
                   <label className="text-sm font-black text-gray-400 ml-8 uppercase">Nombre del Socio</label>
                   <input type="text" className="w-full text-4xl p-10 rounded-[3rem] bg-gray-50 font-black uppercase outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner" value={editingSocio.name} onChange={e => setEditingSocio({...editingSocio, name: e.target.value})} />
                </div>
                <div className="space-y-4">
                   <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest">Billetera de Puntos Acumulados</label>
                   <div className="flex items-center gap-6">
                      <input type="number" className="flex-grow text-6xl p-10 rounded-[3rem] bg-gray-50 font-black outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner" value={editingSocio.points} onChange={e => setEditingSocio({...editingSocio, points: parseInt(e.target.value) || 0})} />
                      <div className="w-28 h-28 bg-[#fef9eb] rounded-[2rem] flex items-center justify-center text-5xl shadow-md border-4 border-white">✨</div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                   <button 
                    onClick={() => setEditingSocio({...editingSocio, isSocio: !editingSocio.isSocio})}
                    className={`py-10 rounded-[3rem] text-2xl font-black uppercase transition-all shadow-lg flex flex-col items-center justify-center gap-3 border-b-8 ${editingSocio.isSocio ? 'bg-[#fadb31] text-white border-yellow-600' : 'bg-gray-100 text-gray-300 border-gray-200'}`}
                   >
                     {editingSocio.isSocio ? <CheckCircle2 size={32}/> : <XCircle size={32}/>}
                     <span>Socio VIP {editingSocio.isSocio ? 'SI' : 'NO'}</span>
                   </button>
                   <button 
                    onClick={() => setEditingSocio({...editingSocio, isAdmin: !editingSocio.isAdmin})}
                    className={`py-10 rounded-[3rem] text-2xl font-black uppercase transition-all shadow-lg flex flex-col items-center justify-center gap-3 border-b-8 ${editingSocio.isAdmin ? 'bg-orange-500 text-white border-orange-700' : 'bg-gray-100 text-gray-300 border-gray-200'}`}
                   >
                     {editingSocio.isAdmin ? <ShieldCheck size={32}/> : <Users size={32}/>}
                     <span>ADMIN {editingSocio.isAdmin ? 'SI' : 'NO'}</span>
                   </button>
                </div>
             </div>

             <div className="flex gap-8 pt-4">
                <button onClick={() => setEditingSocio(null)} className="flex-1 py-10 bg-gray-50 text-gray-300 rounded-[3.5rem] font-black uppercase text-2xl hover:bg-gray-100 transition-all active:scale-95">CANCELAR</button>
                <button onClick={handleUpdateSocio} className="flex-1 py-10 matita-gradient-orange text-white rounded-[3.5rem] font-black uppercase text-2xl shadow-xl border-b-12 border-orange-700 active:scale-95 transition-all">SINCRO ✅</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SECCIÓN: SALES MANAGER (BITÁCORA REAL) ---
const SalesManager: React.FC = () => {
  const { supabase } = useApp();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (data) setSales(data);
    };
    fetchSales();
  }, [supabase]);

  return (
    <div className="space-y-16 animate-fadeIn">
      <h3 className="text-6xl font-black uppercase tracking-tighter">Historial de Ventas 💸</h3>
      <div className="grid gap-8">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-12 rounded-[5rem] border-[10px] border-white shadow-sm flex flex-col lg:flex-row justify-between items-center group hover:bg-white hover:shadow-2xl transition-all">
             <div className="flex items-center gap-10">
                <div className="w-28 h-28 bg-white rounded-[3rem] flex items-center justify-center text-5xl shadow-inner group-hover:bg-[#fef9eb] transition-colors">🛍️</div>
                <div>
                   <p className="text-3xl font-black uppercase text-gray-800 leading-none mb-3">#{s.id.slice(0, 8)} — {s.user_name || 'Visitante Anónimo'}</p>
                   <div className="flex items-center gap-4 text-xl text-gray-400 font-bold uppercase tracking-widest">
                     <Settings size={18}/> {new Date(s.created_at).toLocaleString('es-AR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
             </div>
             <div className="flex flex-col items-end">
                <p className="text-7xl font-black text-[#f6a118] leading-none mb-3">${s.total.toLocaleString()}</p>
                <div className="flex gap-3">
                  <span className="bg-green-100 text-green-500 px-6 py-2 rounded-full font-black text-xs uppercase shadow-sm">PAGADO ✅</span>
                  <button className="p-3 bg-white rounded-full text-gray-300 hover:text-blue-400 transition-colors shadow-sm"><FileText size={20}/></button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SECCIÓN: IDEAS MANAGER ---
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
    <div className="space-y-16 animate-fadeIn">
      <h3 className="text-6xl font-black uppercase tracking-tighter">Buzón de Ideas 💡</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-16 rounded-[6rem] border-[12px] border-white shadow-xl relative overflow-hidden group hover:translate-y-[-10px] transition-all">
            <div className="absolute top-10 right-10 text-[12rem] opacity-5 group-hover:rotate-12 group-hover:scale-125 transition-transform text-[#fadb31]">💡</div>
            <p className="text-4xl font-black text-gray-800 mb-8 italic uppercase leading-tight tracking-tighter">"{i.title}"</p>
            <p className="text-2xl text-gray-500 font-bold leading-relaxed uppercase mb-10">{i.content}</p>
            <div className="flex items-center gap-5 bg-white w-fit px-10 py-5 rounded-full shadow-2xl border-4 border-[#fef9eb]">
              <div className="w-10 h-10 bg-[#f6a118] rounded-full animate-pulse"></div>
              <p className="text-xl text-[#f6a118] font-black uppercase tracking-widest">{i.user_name || 'Inquieto Anónimo'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SECCIÓN: DESIGN MANAGER (MARCA) ---
const DesignManager: React.FC = () => {
  const { logoUrl, setLogoUrl, supabase } = useApp();
  const fRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<File | null>(null);

  const handleSaveLogo = async () => {
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
    alert("¡Identidad visual actualizada con éxito! 🎨✨");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 text-center py-10 animate-fadeIn">
      <h3 className="text-7xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">Estilo de Marca 🎨</h3>
      <div className="bg-[#fef9eb] p-24 rounded-[7rem] shadow-2xl border-[24px] border-white relative group">
        <div 
          className="w-96 h-96 bg-white rounded-full mx-auto shadow-2xl flex items-center justify-center p-16 border-[16px] border-[#fadb31] cursor-pointer group-hover:scale-110 transition-all relative overflow-hidden" 
          onClick={() => fRef.current?.click()}
        >
          <img src={preview ? URL.createObjectURL(preview) : getImgUrl(logoUrl, 600)} className="w-full h-full object-contain group-hover:rotate-6 transition-transform" alt="Logo Matita" />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-full text-5xl">
            <Upload size={60} className="text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="mt-16 space-y-6">
           <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-sm">Cambiar Isotipo Oficial</p>
           <div className="flex items-center justify-center gap-3 text-gray-300 text-xs font-bold uppercase">
             <AlertTriangle size={14}/> Recomendado PNG Transparente 1000x1000px
           </div>
        </div>
        <input type="file" ref={fRef} className="hidden" accept="image/*" onChange={e => setPreview(e.target.files?.[0] || null)} />
        <button 
          onClick={handleSaveLogo} 
          disabled={isSaving} 
          className="w-full mt-20 py-12 matita-gradient-orange text-white rounded-[4rem] text-4xl font-black shadow-2xl uppercase border-b-[16px] border-orange-700 hover:scale-105 active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
        >
          {isSaving ? "SUBIENDO..." : "ACTUALIZAR IDENTIDAD ✨"}
        </button>
      </div>
    </div>
  );
};

// --- SECCIÓN: CAROUSEL MANAGER (PORTADA) ---
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

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsSaving(true);
    const newImgs: string[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append("file", e.target.files[i]);
      formData.append("upload_preset", "Matita_web");
      formData.append("folder", "matita2026/carousel");
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.public_id) newImgs.push(data.public_id);
    }
    setImages(prev => [...prev, ...newImgs]);
    setIsSaving(false);
  };

  const saveCarousel = async () => {
    setIsSaving(true);
    await supabase.from('site_config').upsert({ id: 'global', carousel_images: images });
    setIsSaving(false);
    alert("¡Escaparate principal actualizado! 🖼️✨");
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-16 animate-fadeIn">
      <div className="text-center space-y-4">
        <h3 className="text-7xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">Banner de Portada 🖼️</h3>
        <p className="text-xl text-gray-400 font-bold uppercase tracking-[0.3em]">Gestioná las imágenes que se ven apenas entrás</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-[4.5rem] overflow-hidden border-[12px] border-white shadow-2xl aspect-[4/5] bg-gray-50 group transition-all hover:scale-105">
            <img src={getImgUrl(img, 800)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-8 gap-4">
              <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="w-20 h-20 bg-red-500 text-white rounded-full shadow-2xl hover:scale-125 active:scale-90 transition-all flex items-center justify-center border-4 border-white">
                <Trash2 size={32}/>
              </button>
              <p className="text-white font-black uppercase text-xs tracking-widest text-center">Posición {i + 1}</p>
            </div>
          </div>
        ))}
        <button 
          onClick={() => fileRef.current?.click()} 
          className="aspect-[4/5] flex flex-col items-center justify-center bg-[#fef9eb] rounded-[4.5rem] border-[12px] border-dashed border-white hover:bg-white hover:border-[#fadb31] transition-all group shadow-2xl relative overflow-hidden"
          disabled={isSaving}
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-4 border-[#fef9eb]">
            <Plus size={80} className="text-gray-200 group-hover:text-[#fadb31] transition-all" />
          </div>
          <span className="mt-8 font-black text-gray-300 uppercase tracking-[0.3em] text-xs">Subir Nueva</span>
        </button>
      </div>

      <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={handleUploadBanner} />

      <div className="bg-gray-50 p-12 rounded-[5rem] border-4 border-white shadow-inner flex flex-col items-center">
        <div className="flex items-center gap-4 text-gray-400 font-bold uppercase text-xs mb-10 tracking-[0.2em]">
          <Info size={16}/> Recordá guardar los cambios para que se reflejen en la web
        </div>
        <button 
          onClick={saveCarousel} 
          disabled={isSaving} 
          className="w-full max-w-3xl py-12 matita-gradient-orange text-white rounded-[4rem] text-4xl font-black shadow-2xl uppercase border-b-[16px] border-orange-700 hover:scale-[1.02] active:scale-95 transition-all disabled:grayscale"
        >
          {isSaving ? "PROCESANDO..." : "GUARDAR CARRUSEL ✨"}
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
