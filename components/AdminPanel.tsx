/**
 * PANEL MAESTRO MATITA 2026 - VERSIÓN ULTRA EXPANDIDA
 * Auditoría, Control de Stock, Gestión de Socios y Exportación PDF
 * Líneas: > 950
 */

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
  Copy, AlertTriangle, Info, Image as LucideImage, Camera, RefreshCcw, FileText, Download, Calendar,Printer
} from 'lucide-react';

// LIBRERÍAS EXTERNAS REQUERIDAS
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Configuración de soporte para PDF (Usa CDN para el worker)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * UTILERÍA DE IMÁGENES OPTIMIZADA CLOUDINARY
 */
const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

// --- COMPONENTE PRINCIPAL: GESTIÓN MATITA ---
const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales' | 'socios' | 'ideas' | 'design' | 'carousel'>('dashboard');

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'matita2026') setIsAuthenticated(true);
    else alert('Che, la contraseña es incorrecta ❌');
  };

  // Pantalla de Login de Admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-6 font-matita">
        <div className="max-w-md w-full bg-white rounded-[4rem] p-16 shadow-2xl border-[12px] border-white text-center space-y-12 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 matita-gradient-orange"></div>
          <div className="text-9xl animate-float">👑</div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Panel Maestro</h2>
            <p className="text-[#f6a118] font-bold uppercase text-[10px] tracking-[0.4em]">Solo personal Matita autorizado</p>
          </div>
          <form onSubmit={handleAdminAuth} className="space-y-8">
            <div className="relative">
              <input
                type="password"
                placeholder="CLAVE MATITA"
                className="w-full text-3xl text-center shadow-inner py-7 bg-[#fef9eb] rounded-3xl outline-none uppercase font-black border-4 border-transparent focus:border-[#fadb31] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button className="w-full py-8 matita-gradient-orange text-white rounded-[2.5rem] text-4xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase border-b-8 border-orange-700">
              ENTRAR 🚪
            </button>
          </form>
          <button onClick={() => navigate('/')} className="text-gray-300 font-bold uppercase underline text-[10px] hover:text-gray-500 transition-colors">Volver a la Tienda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1580px] mx-auto py-10 px-4 space-y-14 font-matita animate-fadeIn print:p-0">
      {/* HEADER DE CONTROL - Oculto al imprimir */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 border-b-8 border-[#fadb31]/20 pb-12 print:hidden">
        <div className="space-y-4">
          <h2 className="text-6xl md:text-8xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">
            Gestión <span className="text-gray-800">MATITA ✏️</span>
          </h2>
          <p className="text-2xl text-gray-400 font-bold uppercase tracking-[0.4em] ml-2">Mando Central de Operaciones 👑</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-5 rounded-[3rem] shadow-2xl border-4 border-white">
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
              className={`px-8 py-5 rounded-[1.8rem] text-lg font-black transition-all uppercase flex items-center gap-2 ${activeTab === tab.id ? 'matita-gradient-orange text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
          <div className="w-px h-12 bg-gray-100 mx-2 hidden xl:block"></div>
          <button onClick={() => setIsAuthenticated(false)} className="px-8 py-5 bg-red-50 text-red-400 rounded-[1.8rem] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-md">
             🚪
          </button>
        </div>
      </div>

      {/* CONTENEDOR DINÁMICO */}
      <div className="bg-white rounded-[4rem] md:rounded-[6rem] shadow-matita p-8 md:p-20 border-[16px] border-white min-h-[850px] relative overflow-hidden print:border-0 print:shadow-none print:p-0 print:m-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fadb31]/5 rounded-full -mr-64 -mt-64 -z-0 print:hidden"></div>
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

      <p className="text-center text-gray-300 font-bold uppercase tracking-widest text-[10px] pb-10 print:hidden">Librería Matita © 2026 - Todos los derechos reservados</p>
    </div>
  );
};

// --- SECCIÓN: DASHBOARD (SEGUIMIENTO Y PDF) ---
const Dashboard: React.FC = () => {
  const { supabase } = useApp();
  const [viewMode, setViewMode] = useState<'today' | 'month' | 'all'>('all');
  const [data, setData] = useState<any>({
    history: [], cats: [], lowStock: [],
    rawSales: [],
    totals: { money: 0, users: 0, products: 0, points: 0 }
  });

  const loadStats = useCallback(async () => {
    const { data: sales } = await supabase.from('sales').select('*').order('created_at', { ascending: true });
    const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { data: prods } = await supabase.from('products').select('*');
    const { data: userData } = await supabase.from('users').select('points');

    if (sales && prods) {
      const now = new Date();
      // Lógica de filtrado para reinicio temporal
      const filteredSales = sales.filter((s: any) => {
        const sDate = new Date(s.created_at);
        if (viewMode === 'today') return sDate.toDateString() === now.toDateString();
        if (viewMode === 'month') return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
        return true;
      });

      const history = filteredSales.map((s: any) => ({
        date: new Date(s.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        amount: s.total
      }));

      const catMap: any = {};
      filteredSales.forEach((s: any) => {
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
        rawSales: filteredSales,
        totals: {
          money: filteredSales.reduce((a, b) => a + b.total, 0),
          users: users || 0,
          products: prods.length,
          points: userData?.reduce((a, b) => a + (b.points || 0), 0) || 0
        }
      });
    }
  }, [supabase, viewMode]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handlePrint = () => { window.print(); };

  const COLORS = ['#f6a118', '#ea7e9c', '#fadb31', '#93c5fd', '#86efac'];

  return (
    <div className="space-y-16 animate-fadeIn">
      {/* FILTROS DE SEGUIMIENTO */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-gray-50 p-8 rounded-[4rem] border-4 border-white shadow-inner print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#f6a118] shadow-sm border-2 border-orange-50">
            <Calendar size={28}/>
          </div>
          <div>
            <h4 className="text-xl font-black uppercase tracking-tighter">Período de Seguimiento</h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtrá para reiniciar la vista</p>
          </div>
        </div>

        <div className="flex gap-2 bg-white p-2 rounded-[2rem] shadow-xl border-2 border-gray-100">
          {[
            { id: 'today', l: 'Hoy 📅' },
            { id: 'month', l: 'Este Mes 🗓️' },
            { id: 'all', l: 'Todo 🌍' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setViewMode(btn.id as any)}
              className={`px-8 py-3 rounded-[1.5rem] font-black uppercase text-xs transition-all ${viewMode === btn.id ? 'matita-gradient-orange text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {btn.l}
            </button>
          ))}
        </div>

        <button onClick={handlePrint} className="flex items-center gap-3 px-10 py-5 bg-gray-800 text-white rounded-[2rem] font-black uppercase text-sm hover:scale-105 transition-all shadow-2xl active:scale-95">
          <Printer size={20}/> Exportar Informe PDF 📋
        </button>
      </div>

      {/* CABECERA PARA EL PDF (Oculta en pantalla) */}
      <div className="hidden print:flex flex-col items-center mb-16 border-b-8 border-gray-100 pb-10">
        <h1 className="text-6xl font-black uppercase text-gray-800">Auditoría Matita</h1>
        <p className="text-2xl font-bold text-orange-500 uppercase tracking-[0.5em] mt-2">Informe de Gestión 2026</p>
        <div className="flex gap-10 mt-8 text-sm font-bold text-gray-400 uppercase">
          <p>Filtro: {viewMode === 'today' ? 'Hoy' : viewMode === 'month' ? 'Mensual' : 'Histórico'}</p>
          <p>Fecha: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { l: 'Ingresos 💸', v: `$${data.totals.money.toLocaleString()}`, c: '#f6a118', bg: '#fef9eb', icon: TrendingUp },
          { l: 'Socios 👑', v: data.totals.users, c: '#ea7e9c', bg: '#fff1f2', icon: Users },
          { l: 'Items 📦', v: data.totals.products, c: '#3b82f6', bg: '#f0f9ff', icon: Package },
          { l: 'Puntos ✨', v: data.totals.points.toLocaleString(), c: '#10b981', bg: '#f0fdf4', icon: Star }
        ].map((card, i) => (
          <div key={i} className="p-12 rounded-[4rem] border-4 border-white shadow-sm text-center relative overflow-hidden group hover:shadow-xl transition-all print:border-2 print:p-8" style={{ backgroundColor: card.bg }}>
            <card.icon className="absolute -right-4 -top-4 w-32 h-32 opacity-5 print:hidden" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">{card.l}</p>
            <p className="text-6xl font-black leading-none" style={{ color: card.c }}>{card.v}</p>
          </div>
        ))}
      </div>

      {/* GRÁFICOS */}
      <div className="grid lg:grid-cols-2 gap-12 print:block">
        <div className="bg-gray-50 p-12 rounded-[5rem] border-4 border-white h-[500px] shadow-inner print:bg-white print:border-0 print:h-auto print:mb-20">
          <h4 className="text-3xl font-black mb-10 uppercase tracking-tighter flex items-center gap-3">
             <TrendingUp className="text-[#f6a118] print:hidden" /> Gráfico de Rendimiento 📈
          </h4>
          <div className="h-[350px] print:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="amount" stroke="#f6a118" strokeWidth={6} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 p-12 rounded-[5rem] border-4 border-white h-[500px] shadow-inner print:hidden">
          <h4 className="text-3xl font-black mb-10 uppercase tracking-tighter flex items-center gap-3">
             <Star className="text-[#ea7e9c]" /> Ventas por Rubro 🏷️
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data.cats}>
              <XAxis dataKey="name" fontSize={10} fontStyle="bold" />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="total" radius={[15, 15, 0, 0]}>
                {data.cats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % 5]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLA DE DETALLE (Solo visible al imprimir el PDF) */}
      <div className="hidden print:block space-y-8 mt-10">
        <h4 className="text-3xl font-black uppercase tracking-tighter border-l-8 border-orange-500 pl-6">Registro de Operaciones</h4>
        <div className="overflow-hidden rounded-[2rem] border-2 border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-5 border-b font-black uppercase text-xs">ID Venta</th>
                <th className="p-5 border-b font-black uppercase text-xs">Socio / Cliente</th>
                <th className="p-5 border-b font-black uppercase text-xs text-right">Monto Neto</th>
                <th className="p-5 border-b font-black uppercase text-xs">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {data.rawSales.map((s: any) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-5 text-[10px] font-mono text-gray-400">#{s.id.slice(0, 12)}</td>
                  <td className="p-5 text-sm font-bold uppercase">{s.user_name || 'Invitado Web'}</td>
                  <td className="p-5 text-right font-black text-orange-600 text-lg">${s.total.toLocaleString()}</td>
                  <td className="p-5 text-xs text-gray-500">{new Date(s.created_at).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-orange-50">
                <td colSpan={2} className="p-6 text-right font-black uppercase">Gran Total Acumulado:</td>
                <td className="p-6 text-right font-black text-2xl text-orange-600">${data.totals.money.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-10 italic">Fin del informe de gestión. Documento generado por el Panel Maestro Matita.</p>
      </div>

      {/* ALERTAS DE STOCK CRÍTICO (Solo en pantalla) */}
      {data.lowStock.length > 0 && (
        <div className="bg-red-50 p-12 rounded-[5rem] border-8 border-white shadow-2xl animate-pulse print:hidden">
          <div className="flex items-center gap-4 mb-8 text-red-600">
            <AlertTriangle size={48} />
            <h4 className="text-4xl font-black uppercase tracking-tighter">Stock Crítico Matita ⚠️</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {data.lowStock.map((p: any) => (
              <div key={p.id} className="bg-white p-6 rounded-[3rem] border-2 border-red-100 text-center shadow-lg transition-transform hover:scale-105">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 font-black mx-auto mb-3">!</div>
                <p className="text-[10px] font-black text-gray-700 uppercase truncate mb-1">{p.name}</p>
                <p className="text-red-500 font-black text-2xl leading-none">{p.colors?.reduce((a:number, b:any) => a + Number(b.stock), 0)}</p>
                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">Unidades</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SECCIÓN: INVENTORY MANAGER (CRUD + IMPORTACIÓN + STOCK FIX) ---
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

  // Importador Pro con búsqueda inteligente de columnas
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

          return {
            name: String(row[nameK] || 'Sin Nombre').trim().toUpperCase(),
            price: Number(String(row[priceK]).replace(/[^0-9.]/g, '')) || 0,
            description: row[descK] ? String(row[descK]) : "Producto del Almacén Matita.",
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
        newItems = lines.map(line => {
          const regex = /^(.+?)\s+[\$]?\s?(\d+[\d\.,]*)$/;
          const match = line.trim().match(regex);
          if (match) return { name: match[1].trim().toUpperCase(), price: parseFloat(match[2].replace(',', '.')) || 0, description: "Importado de PDF", category: "Escolar", colors: [{ color: 'Único', stock: 10 }], images: [] };
          return null;
        }).filter(i => i !== null);
      }
      if (newItems.length > 0 && confirm(`¿Sincronizar ${newItems.length} productos al catálogo?`)) {
        await supabase.from('products').insert(newItems);
        fetchProducts();
        alert("¡Catálogo sincronizado perfectamente! ✨");
      }
    } catch (err) { alert("Error al procesar el archivo."); }
  };

  // --- FIX DE GUARDADO: old_price Y STOCK ---
  const handleSaveProduct = async () => {
    if (!editingProduct?.name) return alert("¡El nombre es obligatorio!");
    setIsSaving(true);
    try {
      const payload = {
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: Number(editingProduct.price) || 0,
        old_price: Number(editingProduct.oldPrice) || 0, // FIXED: old_price en la DB
        points: Number(editingProduct.points) || 0,
        category: editingProduct.category || "Escolar",
        images: editingProduct.images || [],
        colors: editingProduct.colors?.map((c: any) => ({
          ...c,
          stock: c.stock === "" ? 0 : Number(c.stock) // Convertimos el "" a 0 para la DB
        })) || []
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

  // --- FIX STOCK: PERMITIR BORRAR EL 0 ---
  const handleStockValueChange = (idx: number, val: string) => {
    const next = [...editingProduct.colors!];
    // Permitimos "" para que el usuario pueda borrar todo y escribir
    next[idx].stock = val === "" ? "" : parseInt(val);
    setEditingProduct({ ...editingProduct, colors: next });
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-gray-50 p-10 rounded-[4rem] border-4 border-white shadow-inner">
          <div className="space-y-2">
            <h3 className="text-4xl font-black uppercase tracking-tighter">Inventario Matita 📦</h3>
            <input type="file" ref={importInputRef} className="hidden" accept=".xlsx,.xls,.pdf" onChange={handleBulkImport} />
            <button onClick={() => importInputRef.current?.click()} className="text-[#ea7e9c] font-black text-xs underline uppercase tracking-widest flex items-center gap-2 hover:text-red-500 transition-colors">
              <Upload size={16} /> Importar desde Archivo ⬆️
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-[400px]">
              <Search className="absolute left-5 top-5 text-gray-300" />
              <input type="text" placeholder="BUSCAR ARTÍCULO..." className="w-full p-5 pl-14 rounded-3xl bg-white border-4 border-transparent focus:border-[#fadb31] outline-none font-bold uppercase shadow-lg text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingProduct({ name: '', price: 0, oldPrice: 0, points: 0, category: 'Escolar', colors: [{ color: 'Único', stock: 10 }], images: [] }); setFormMode('edit'); }} className="px-12 py-5 matita-gradient-orange text-white rounded-3xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase flex items-center gap-3 border-b-8 border-orange-700">
               <Plus size={24}/> NUEVO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[3.5rem] border-8 border-gray-50 shadow-sm hover:border-[#fadb31] transition-all group flex flex-col relative overflow-hidden">
              <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 bg-gray-50 relative border-4 border-white shadow-inner">
                <img src={getImgUrl(p.images[0], 400)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="p-3 bg-white rounded-full shadow-xl text-blue-400 hover:scale-110 active:scale-90 transition-all"><Edit3 size={20}/></button>
                   <button onClick={async () => { if(confirm('¿Borrar este tesoro?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="p-3 bg-white rounded-full shadow-xl text-red-400 hover:scale-110 active:scale-90 transition-all"><Trash2 size={20}/></button>
                </div>
              </div>
              <p className="text-[10px] font-black text-[#fadb31] uppercase mb-1 tracking-widest">{p.category}</p>
              <h4 className="text-sm font-black uppercase text-gray-800 truncate mb-3">{p.name}</h4>
              <div className="flex justify-between items-end mt-auto pt-4 border-t-2 border-gray-50">
                <div>
                  <p className="text-3xl font-black text-[#f6a118] leading-none">${p.price.toLocaleString()}</p>
                  {p.oldPrice > 0 && <p className="text-[10px] font-bold text-gray-300 line-through">${p.oldPrice.toLocaleString()}</p>}
                </div>
                <div className="text-right">
                   <p className="text-lg font-black text-gray-800 leading-none">{p.colors?.reduce((a,b) => a + Number(b.stock), 0)}</p>
                   <p className="text-[8px] font-black text-gray-200 uppercase tracking-widest">STOCK</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // EDITOR DE PRODUCTO
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn pb-20">
      <div className="flex items-center gap-10">
        <button onClick={() => setFormMode('list')} className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all shadow-md active:scale-90">
          <ArrowRight className="rotate-180" size={32} />
        </button>
        <div className="space-y-2">
          <h3 className="text-5xl font-black uppercase tracking-tighter text-gray-800">Editor de Tesoro ✏️</h3>
          <p className="text-xl text-gray-400 font-bold uppercase tracking-[0.2em]">{editingProduct?.id ? 'Modificando existente' : 'Agregando nuevo'}</p>
        </div>
      </div>

      <div className="bg-[#fef9eb] p-12 rounded-[5.5rem] border-[14px] border-white shadow-2xl space-y-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest flex items-center gap-2">Nombre Comercial 🏷️</label>
            <input type="text" className="w-full text-3xl p-10 rounded-[3.5rem] outline-none shadow-inner uppercase font-black bg-white focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all" value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest flex items-center gap-2">Categoría 📦</label>
            <select className="w-full text-3xl p-10 rounded-[3.5rem] outline-none shadow-inner font-black uppercase appearance-none bg-white border-4 border-transparent focus:border-[#fadb31]" value={editingProduct?.category} onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}>
              {['Escolar', 'Oficina', 'Tecnología', 'Regalos', 'Ofertas', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest">Biografía del Producto (Descripción)</label>
          <textarea className="w-full text-2xl p-10 rounded-[4rem] outline-none shadow-inner min-h-[250px] font-bold bg-white border-4 border-transparent focus:border-[#fadb31] transition-all leading-relaxed" placeholder="Contá la historia de este artículo..." value={editingProduct?.description} onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:translate-y-[-5px]">
            <label className="text-[10px] font-black text-gray-300 uppercase block text-center tracking-widest mb-4">Precio Venta ($)</label>
            <input type="number" className="w-full text-6xl font-black text-[#f6a118] outline-none bg-transparent text-center" value={editingProduct?.price} onChange={e => setEditingProduct({...editingProduct!, price: e.target.value})} />
          </div>
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:translate-y-[-5px]">
            <label className="text-[10px] font-black text-gray-300 uppercase block text-center tracking-widest mb-4">Antes ($)</label>
            <input type="number" className="w-full text-6xl font-black text-gray-300 outline-none bg-transparent text-center" value={editingProduct?.oldPrice} onChange={e => setEditingProduct({...editingProduct!, oldPrice: e.target.value})} />
          </div>
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:translate-y-[-5px]">
            <label className="text-[10px] font-black text-gray-300 uppercase block text-center tracking-widest mb-4">Puntos ✨</label>
            <input type="number" className="w-full text-6xl font-black text-blue-400 outline-none bg-transparent text-center" value={editingProduct?.points} onChange={e => setEditingProduct({...editingProduct!, points: e.target.value})} />
          </div>
        </div>

        {/* VARIANTES Y STOCK */}
        <div className="space-y-8">
          <div className="flex justify-between items-center px-10">
            <h4 className="text-3xl font-black uppercase text-gray-800 tracking-tighter">Variantes & Stock Individual</h4>
            <button onClick={() => setEditingProduct({...editingProduct!, colors: [...(editingProduct?.colors || []), { color: 'NUEVA VARIANTE', stock: 10 }]})} className="px-10 py-4 bg-[#f6a118] text-white rounded-[1.5rem] font-black uppercase text-xs flex items-center gap-3 hover:scale-110 shadow-lg active:scale-95 transition-all">
              <Plus size={20}/> AÑADIR FILA
            </button>
          </div>
          <div className="grid gap-6">
            {editingProduct?.colors?.map((c: any, i: number) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[4rem] shadow-sm border-4 border-white transition-all hover:shadow-md">
                <input className="flex-grow text-3xl font-black outline-none uppercase bg-transparent p-4 rounded-3xl border-2 border-transparent focus:border-gray-50" value={c.color} onChange={e => {
                  const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({...editingProduct!, colors: n});
                }} />
                <div className="flex items-center gap-10 bg-gray-50 px-12 py-6 rounded-full border-4 border-white shadow-inner">
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock = Math.max(0, (Number(n[i].stock) || 0) - 1); setEditingProduct({...editingProduct!, colors: n}); }} className="text-6xl text-red-300 hover:text-red-500 hover:scale-125 transition-all">-</button>
                   <input 
                    type="number" 
                    className="w-24 text-center bg-transparent text-5xl font-black outline-none" 
                    value={c.stock} 
                    onChange={e => handleStockValueChange(i, e.target.value)} 
                   />
                   <button onClick={() => { const n = [...editingProduct.colors!]; n[i].stock = (Number(n[i].stock) || 0) + 1; setEditingProduct({...editingProduct!, colors: n}); }} className="text-6xl text-[#f6a118] hover:text-orange-600 hover:scale-125 transition-all">+</button>
                </div>
                <button onClick={() => setEditingProduct({...editingProduct!, colors: editingProduct.colors?.filter((_:any, idx:number) => idx !== i)})} className="p-6 bg-red-50 text-red-200 hover:text-red-500 hover:bg-red-100 rounded-full transition-all"><Trash2 size={32}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* FOTOS */}
        <div className="space-y-10">
           <h4 className="text-4xl font-black uppercase text-gray-800 tracking-tighter px-10">Galería del Tesoro 📸</h4>
           <div className="flex flex-wrap gap-8 px-10">
              {editingProduct?.images?.map((img:string, i:number) => (
                <div key={i} className="relative w-52 h-52 group">
                  <img src={getImgUrl(img, 400)} className="w-full h-full object-cover rounded-[3.5rem] border-[10px] border-white shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={() => setEditingProduct({...editingProduct!, images: editingProduct.images?.filter((_:any, idx:number) => idx !== i)})} className="absolute -top-4 -right-4 bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl font-black text-2xl hover:scale-110 active:scale-90 transition-all">×</button>
                </div>
              ))}
              <label onClick={() => imageInputRef.current?.click()} className="w-52 h-52 bg-white rounded-[3.5rem] border-8 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#fadb31] transition-all group shadow-inner">
                {isUploading ? <RefreshCcw className="animate-spin text-[#fadb31]" size={50}/> : <Camera className="text-gray-200 group-hover:text-[#fadb31] group-hover:scale-110 transition-all" size={70} />}
                <span className="mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center px-4">Añadir Foto</span>
                <input type="file" ref={imageInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
              </label>
           </div>
        </div>

        <button 
          onClick={handleSaveProduct} 
          disabled={isSaving || isUploading} 
          className="w-full py-14 matita-gradient-orange text-white rounded-[5rem] text-5xl font-black uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all border-b-[18px] border-orange-700 disabled:opacity-50"
        >
           {isSaving ? 'SINCRO EN MARCHA...' : '¡GUARDAR TODO! ✨'}
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
    if (confirm(`¿Enviar instrucciones de restablecimiento de clave a ${email}?`)) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' });
      if (!error) alert("¡Email enviado! 📧");
      else alert("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="space-y-2">
           <h3 className="text-6xl font-black uppercase tracking-tighter leading-none">Socios del Club 👑</h3>
           <p className="text-xl text-gray-300 font-bold uppercase tracking-[0.2em]">Gestión de los Miembros Reales</p>
        </div>
        <div className="relative w-full lg:w-[600px]">
          <Search className="absolute left-6 top-6 text-gray-300" size={24} />
          <input type="text" placeholder="BUSCAR POR NOMBRE O EMAIL..." className="w-full p-6 pl-16 rounded-[2.5rem] bg-gray-50 border-4 border-transparent focus:border-[#fadb31] focus:bg-white outline-none font-bold uppercase transition-all shadow-inner text-xl" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      
      <div className="grid gap-8">
        {filtered.map(s => (
          <div key={s.id} className="bg-white p-12 rounded-[5rem] border-[12px] border-gray-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-10 group hover:border-[#fadb31] transition-all relative overflow-hidden">
            <div className="flex items-center gap-10">
               <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center text-6xl shadow-inner ${s.isAdmin ? 'bg-orange-100' : 'bg-blue-50'}`}>
                 {s.isAdmin ? '🛡️' : '👤'}
               </div>
               <div>
                  <h4 className="text-4xl font-black uppercase text-gray-800 leading-none mb-3">{s.name || 'Socio Anónimo'}</h4>
                  <div className="flex items-center gap-4 text-2xl text-gray-400 font-bold lowercase italic">
                    <Mail size={22}/> {s.email}
                  </div>
                  <div className="flex gap-3 mt-6">
                    {s.isAdmin && <span className="bg-orange-500 text-white text-[10px] px-5 py-2 rounded-full font-black uppercase flex items-center gap-2 shadow-md"><ShieldCheck size={14}/> Administrador</span>}
                    {s.isSocio && <span className="bg-[#fadb31] text-white text-[10px] px-5 py-2 rounded-full font-black uppercase flex items-center gap-2 shadow-md"><Star size={14}/> Socio VIP</span>}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-10">
               <div className="text-center bg-gray-50 px-14 py-10 rounded-[4rem] shadow-inner border-4 border-white min-w-[250px]">
                  <p className="text-7xl font-black text-[#f6a118] leading-none mb-2">{s.points.toLocaleString()}</p>
                  <p className="text-[12px] font-black text-gray-300 uppercase tracking-widest">PUNTOS ✨</p>
               </div>
               <div className="flex gap-5">
                  <button onClick={() => setEditingSocio(s)} className="w-24 h-24 bg-blue-50 text-blue-400 rounded-[2.5rem] flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all shadow-lg active:scale-90" title="Editar Perfil">
                    <UserCog size={40}/>
                  </button>
                  <button onClick={() => handleResetPassword(s.email)} className="w-24 h-24 bg-orange-50 text-orange-400 rounded-[2.5rem] flex items-center justify-center hover:bg-orange-400 hover:text-white transition-all shadow-lg active:scale-90" title="Restablecer Clave">
                    <Key size={40}/>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {editingSocio && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[6rem] p-16 border-[20px] border-white shadow-2xl space-y-12 animate-slideUp relative">
             <button onClick={() => setEditingSocio(null)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors"><XCircle size={40}/></button>
             <div className="text-center space-y-4">
                <h3 className="text-5xl font-black uppercase tracking-tighter">Perfil de Socio</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] italic">{editingSocio.email}</p>
             </div>
             <div className="space-y-10">
                <div className="space-y-4">
                   <label className="text-sm font-black text-gray-400 ml-8 uppercase">Nombre del Socio</label>
                   <input type="text" className="w-full text-4xl p-10 rounded-[3rem] bg-gray-50 font-black uppercase outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner" value={editingSocio.name} onChange={e => setEditingSocio({...editingSocio, name: e.target.value})} />
                </div>
                <div className="space-y-4">
                   <label className="text-sm font-black text-gray-400 ml-8 uppercase tracking-widest">Billetera de Puntos ✨</label>
                   <input type="number" className="w-full text-7xl p-10 rounded-[3rem] bg-gray-50 font-black outline-none focus:bg-white border-4 border-transparent focus:border-[#fadb31] transition-all shadow-inner text-center" value={editingSocio.points} onChange={e => setEditingSocio({...editingSocio, points: parseInt(e.target.value) || 0})} />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <button onClick={() => setEditingSocio({...editingSocio, isSocio: !editingSocio.isSocio})} className={`py-12 rounded-[3.5rem] text-3xl font-black uppercase transition-all shadow-lg flex flex-col items-center justify-center gap-4 border-b-8 ${editingSocio.isSocio ? 'bg-[#fadb31] text-white border-yellow-600' : 'bg-gray-100 text-gray-300 border-gray-200'}`}>
                     {editingSocio.isSocio ? <CheckCircle2 size={40}/> : <XCircle size={40}/>}
                     <span className="text-xl">SOCIO VIP {editingSocio.isSocio ? 'SI' : 'NO'}</span>
                   </button>
                   <button onClick={() => setEditingSocio({...editingSocio, isAdmin: !editingSocio.isAdmin})} className={`py-12 rounded-[3.5rem] text-3xl font-black uppercase transition-all shadow-lg flex flex-col items-center justify-center gap-4 border-b-8 ${editingSocio.isAdmin ? 'bg-orange-500 text-white border-orange-700' : 'bg-gray-100 text-gray-300 border-gray-200'}`}>
                     {editingSocio.isAdmin ? <ShieldCheck size={40}/> : <Users size={40}/>}
                     <span className="text-xl">ADMIN {editingSocio.isAdmin ? 'SI' : 'NO'}</span>
                   </button>
                </div>
             </div>
             <div className="flex gap-8"><button onClick={() => setEditingSocio(null)} className="flex-1 py-10 bg-gray-50 text-gray-300 rounded-[4rem] font-black uppercase text-2xl hover:bg-gray-100 transition-all active:scale-95">CANCELAR</button><button onClick={handleUpdateSocio} className="flex-1 py-10 matita-gradient-orange text-white rounded-[4rem] font-black uppercase text-2xl shadow-xl border-b-12 border-orange-700 active:scale-95 transition-all">SINCRO ✅</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SECCIÓN: HISTORIAL DE VENTAS ---
const SalesManager: React.FC = () => {
  const { supabase } = useApp();
  const [sales, setSales] = useState<any[]>([]);
  useEffect(() => { const f = async () => { const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false }); if (data) setSales(data); }; f(); }, [supabase]);
  return (
    <div className="space-y-16 animate-fadeIn text-left">
      <h3 className="text-5xl font-black uppercase tracking-tighter border-b-8 border-gray-50 pb-8">Bitácora Real de Ventas 💸</h3>
      <div className="grid gap-8">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-12 rounded-[5rem] border-[10px] border-white shadow-sm flex flex-col lg:flex-row justify-between items-center group transition-all hover:bg-white hover:shadow-2xl">
             <div className="flex items-center gap-10">
                <div className="w-28 h-28 bg-white rounded-[3.5rem] flex items-center justify-center text-5xl shadow-inner group-hover:bg-[#fef9eb] transition-colors shadow-lg">🛍️</div>
                <div>
                   <p className="text-4xl font-black uppercase text-gray-800 leading-none mb-3">#{s.id.slice(0, 8)} — {s.user_name || 'Anónimo'}</p>
                   <div className="flex items-center gap-5 text-xl text-gray-400 font-bold uppercase tracking-widest">
                     <FileText size={22}/> {new Date(s.created_at).toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
             </div>
             <div className="text-right mt-10 lg:mt-0">
                <p className="text-8xl font-black text-[#f6a118] leading-none mb-3 tracking-tighter">${s.total.toLocaleString()}</p>
                <div className="bg-green-100 text-green-500 px-8 py-3 rounded-full font-black text-xs uppercase shadow-sm inline-flex items-center gap-2">PAGADO CON ÉXITO ✅</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SECCIÓN: BUZÓN DE IDEAS ---
const IdeasManager: React.FC = () => {
  const { supabase } = useApp();
  const [ideas, setIdeas] = useState<any[]>([]);
  useEffect(() => { const f = async () => { const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false }); if (data) setIdeas(data); }; f(); }, [supabase]);
  return (
    <div className="space-y-16 animate-fadeIn text-left">
      <h3 className="text-5xl font-black uppercase tracking-tighter border-b-8 border-gray-50 pb-8">Buzón de Ideas 💡</h3>
      <div className="grid gap-12">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-16 rounded-[6rem] border-[14px] border-white shadow-xl relative overflow-hidden group transition-transform hover:-translate-y-2">
            <div className="absolute top-10 right-10 text-[14rem] opacity-5 group-hover:rotate-12 transition-transform text-[#fadb31] pointer-events-none">💡</div>
            <p className="text-5xl font-black text-gray-800 mb-8 italic uppercase leading-none tracking-tighter">"{i.title}"</p>
            <p className="text-3xl text-gray-500 font-bold leading-relaxed uppercase mb-12 border-l-8 border-white pl-8">{i.content}</p>
            <div className="flex items-center gap-5 bg-white w-fit px-12 py-6 rounded-[2.5rem] shadow-2xl border-4 border-[#fef9eb]">
              <div className="w-12 h-12 bg-[#f6a118] rounded-full animate-pulse"></div>
              <p className="text-2xl text-[#f6a118] font-black uppercase tracking-widest">- {i.user_name || 'Humano Inquieto'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SECCIÓN: DISEÑO DE MARCA (LOGO) ---
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
    setLogoUrl(finalId); setPreview(null); setIsSaving(false); alert("¡Identidad Actualizada! 🎨✨");
  };
  return (
    <div className="max-w-3xl mx-auto space-y-16 text-center py-10 animate-fadeIn">
      <h3 className="text-7xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">Imagen de Marca 🎨</h3>
      <div className="bg-[#fef9eb] p-24 rounded-[7rem] shadow-2xl border-[20px] border-white relative group">
        <div className="w-96 h-96 bg-white rounded-full mx-auto shadow-2xl flex items-center justify-center p-16 border-[16px] border-[#fadb31] cursor-pointer group-hover:scale-110 transition-all relative overflow-hidden shadow-inner" onClick={() => fRef.current?.click()}>
          <img src={preview ? URL.createObjectURL(preview) : getImgUrl(logoUrl, 700)} className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-500" alt="Logo" />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-7xl text-white drop-shadow-lg">📸</div>
        </div>
        <div className="mt-16 space-y-4">
           <p className="text-gray-400 font-black uppercase tracking-[0.5em] text-sm italic">Cambiar Logotipo Oficial Matita</p>
           <p className="text-gray-300 text-xs font-bold uppercase px-20">Sube una imagen cuadrada de alta calidad para que brille ✨</p>
        </div>
        <input type="file" ref={fRef} className="hidden" accept="image/*" onChange={e => setPreview(e.target.files?.[0] || null)} />
        <button onClick={handleSaveLogo} disabled={isSaving} className="w-full mt-20 py-12 matita-gradient-orange text-white rounded-[4rem] text-5xl font-black shadow-2xl uppercase border-b-[16px] border-orange-700 hover:scale-105 active:scale-95 transition-all">
          {isSaving ? "GUARDANDO..." : "SINCRONIZAR MARCA ✨"}
        </button>
      </div>
    </div>
  );
};

// --- SECCIÓN: CARRUSEL DE PORTADA ---
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
  const saveCarousel = async () => { setIsSaving(true); await supabase.from('site_config').upsert({ id: 'global', carousel_images: images }); setIsSaving(false); alert("¡Escaparate de Portada actualizado! 🖼️✨"); };
  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-fadeIn text-center">
      <div className="space-y-4">
        <h3 className="text-7xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">Banner de Portada 🖼️</h3>
        <p className="text-xl text-gray-400 font-bold uppercase tracking-[0.4em]">Controlá lo primero que ve el cliente</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-[4.5rem] overflow-hidden border-[12px] border-white shadow-2xl aspect-[4/5] bg-gray-50 transition-all hover:scale-105 hover:shadow-orange-100">
            <img src={getImgUrl(img, 800)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-8 gap-6">
              <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="w-24 h-24 bg-red-500 text-white rounded-full shadow-2xl hover:scale-125 active:scale-90 transition-all flex items-center justify-center border-4 border-white shadow-lg">
                <Trash2 size={40}/>
              </button>
              <p className="text-white font-black uppercase text-xs tracking-widest">Posición del Carrusel {i + 1}</p>
            </div>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()} className="aspect-[4/5] flex flex-col items-center justify-center bg-[#fef9eb] rounded-[4.5rem] border-[14px] border-dashed border-white hover:bg-white hover:border-[#fadb31] transition-all group shadow-2xl relative overflow-hidden" disabled={isSaving}>
          <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border-4 border-[#fef9eb]">
             <Plus size={100} className="text-gray-200 group-hover:text-[#fadb31] transition-all" />
          </div>
          <span className="mt-10 font-black text-gray-300 uppercase tracking-widest text-sm">Subir Nueva Foto</span>
        </button>
      </div>
      <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={handleUploadBanner} />
      <div className="bg-gray-50 p-16 rounded-[6rem] border-4 border-white shadow-inner flex flex-col items-center">
        <button onClick={saveCarousel} disabled={isSaving} className="w-full max-w-3xl py-12 matita-gradient-orange text-white rounded-[4.5rem] text-5xl font-black shadow-2xl uppercase border-b-[18px] border-orange-700 hover:scale-[1.02] active:scale-95 transition-all">
          {isSaving ? "PROCESANDO..." : "GUARDAR BANNER ✨"}
        </button>
        <p className="mt-10 text-gray-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
          <Info size={16}/> Recordá sincronizar para que impacte en la tienda real
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
