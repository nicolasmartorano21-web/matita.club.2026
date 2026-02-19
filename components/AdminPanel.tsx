/**
 * PANEL DE ADMINISTRACIÓN - LIBRERÍA MATITA 2026
 * Versión: 4.5.0 (Edición Maestra)
 * Funcionalidades: Dashboard, Inventario Pro, Ventas, Socios, Ideas, Marca y Carrusel.
 * Soporte de Importación: CSV, EXCEL (.xlsx, .xls) y PDF.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, User } from '../types';
import { useApp } from '../App';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, 
  PieChart, Pie, Legend 
} from 'recharts';

// IMPORTACIÓN DE LIBRERÍAS EXTERNAS (Asegúrate de ejecutar: npm install xlsx pdfjs-dist)
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Configuración obligatoria para PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * UTILERÍA DE IMÁGENES OPTIMIZADA - CONEXIÓN CLOUDINARY
 */
const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inventory' | 'sales' | 'socios' | 'ideas' | 'design' | 'carousel'
  >('dashboard');

  // MANEJO DE AUTENTICACIÓN DEL PANEL
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'matita2026') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta ❌ Intenta de nuevo, Maestro.');
    }
  };

  // PANTALLA DE BLOQUEO (LOGIN ADMIN)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-6 font-matita">
        <div className="max-w-xl w-full bg-white rounded-[4rem] p-16 shadow-2xl border-[12px] border-white text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 matita-gradient-orange"></div>
          <div className="text-9xl mb-4 animate-bounce">👑</div>
          <div className="space-y-2">
            <h2 className="text-6xl font-black text-gray-800 uppercase tracking-tighter">Panel Maestro</h2>
            <p className="text-[#f6a118] font-bold tracking-[0.3em] text-sm uppercase">Solo personal autorizado</p>
          </div>
          
          <form onSubmit={handleAdminAuth} className="space-y-8">
            <div className="relative">
              <input
                type="password"
                placeholder="CLAVE MATITA"
                className="w-full text-4xl text-center shadow-inner py-6 bg-[#fef9eb] rounded-[2rem] border-4 border-transparent focus:border-[#fadb31] outline-none uppercase font-black transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button className="w-full py-8 matita-gradient-orange text-white rounded-[2.5rem] text-4xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase border-b-8 border-orange-700">
              ENTRAR AHORA
            </button>
          </form>

          <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 font-bold uppercase underline text-sm hover:text-gray-600 transition-colors"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 py-10 animate-fadeIn px-4 font-matita">
      {/* CABECERA PRINCIPAL */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b-8 border-[#fadb31]/20 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="text-6xl">⚙️</span>
            <h2 className="text-6xl md:text-8xl font-black text-[#f6a118] uppercase tracking-tighter leading-none">
              Gestión <span className="text-gray-800">MATITA</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-2xl md:text-3xl text-gray-400 font-bold italic uppercase tracking-widest">
              Control total del universo matita ✨
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-center bg-white p-4 rounded-[3rem] shadow-xl border-4 border-[#fadb31]/10">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'dashboard', label: '📊 Stats', color: 'orange' },
              { id: 'inventory', label: '📦 Stock', color: 'orange' },
              { id: 'sales', label: '💸 Ventas', color: 'orange' },
              { id: 'socios', label: '👥 Socios', color: 'orange' },
              { id: 'ideas', label: '💡 Ideas', color: 'orange' },
              { id: 'design', label: '🎨 Marca', color: 'orange' },
              { id: 'carousel', label: '🖼️ Inicio', color: 'orange' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 rounded-[1.8rem] text-xl font-black transition-all uppercase ${
                  activeTab === tab.id 
                    ? 'matita-gradient-orange text-white shadow-lg scale-110 -translate-y-1' 
                    : 'bg-transparent text-gray-400 hover:text-[#f6a118] hover:bg-orange-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="w-px h-12 bg-gray-100 mx-4 hidden md:block"></div>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="px-10 py-4 bg-[#ea7e9c] text-white rounded-[1.8rem] font-black text-xl shadow-xl hover:bg-red-500 hover:scale-110 transition-all uppercase flex items-center gap-2 border-b-4 border-red-800"
          >
            SALIR 🚪
          </button>
        </div>
      </div>

      {/* CONTENEDOR DINÁMICO */}
      <div className="bg-white rounded-[4rem] md:rounded-[5rem] shadow-matita p-8 md:p-16 border-[12px] border-white min-h-[800px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fef9eb] rounded-full -mr-32 -mt-32 -z-10 opacity-50"></div>
        
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

/**
 * COMPONENTE: DASHBOARD - ESTADÍSTICAS REALES
 */
const Dashboard: React.FC = () => {
  const { supabase } = useApp();
  const [data, setData] = useState<any>({
    salesHistory: [],
    categoryStats: [],
    lowStock: [],
    recentSales: [],
    totals: { sales: 0, users: 0, products: 0, points: 0 }
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      // Promesas en paralelo para velocidad
      const [salesRes, usersRes, prodsRes] = await Promise.all([
        supabase.from('sales').select('*').order('created_at', { ascending: true }),
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('products').select('*')
      ]);

      if (salesRes.data && prodsRes.data) {
        // Historial de ventas para gráfico lineal
        const history = salesRes.data.map((s: any) => ({
          date: new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          amount: s.total
        }));

        // Agrupar ventas por categoría
        const catMap: any = {};
        salesRes.data.forEach((s: any) => {
          const cat = s.category_summary || 'Otros';
          catMap[cat] = (catMap[cat] || 0) + s.total;
        });
        const categories = Object.keys(catMap).map(k => ({ name: k, total: catMap[k] }));

        // Detectar productos con poco stock (menos de 5 unidades)
        const lowStock = prodsRes.data.filter((p: any) => {
          const totalStock = p.colors?.reduce((acc: number, c: any) => acc + (Number(c.stock) || 0), 0) || 0;
          return totalStock < 5;
        });

        setData({
          salesHistory: history,
          categoryStats: categories,
          lowStock,
          recentSales: salesRes.data.slice(-5).reverse(),
          totals: {
            sales: salesRes.data.reduce((a: number, b: any) => a + b.total, 0),
            users: usersRes.count || 0,
            products: prodsRes.data.length || 0,
            points: usersRes.data?.reduce((a: number, b: any) => a + (b.points || 0), 0) || 0
          }
        });
      }
    };
    fetchDashboard();
  }, [supabase]);

  const COLORS = ['#f6a118', '#ea7e9c', '#fadb31', '#93c5fd', '#86efac', '#c084fc'];

  return (
    <div className="space-y-16 animate-fadeIn">
      {/* TARJETAS DE TOTALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Ventas Totales', val: `$${data.totals.sales.toLocaleString()}`, bg: '#fef9eb', text: '#f6a118', icon: '💰' },
          { label: 'Socios Club', val: data.totals.users, bg: '#fff1f2', text: '#ea7e9c', icon: '👑' },
          { label: 'Productos', val: data.totals.products, bg: '#f0f9ff', text: '#3b82f6', icon: '📦' },
          { label: 'Puntos en Circulación', val: data.totals.points, bg: '#f0fdf4', text: '#22c55e', icon: '✨' }
        ].map((card, i) => (
          <div key={i} className="p-10 rounded-[3.5rem] border-4 border-white shadow-lg text-center relative overflow-hidden group" style={{ backgroundColor: card.bg }}>
            <div className="absolute -top-4 -right-4 text-6xl opacity-10 group-hover:scale-150 transition-transform">{card.icon}</div>
            <p className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
            <p className="text-5xl font-black" style={{ color: card.text }}>{card.val}</p>
          </div>
        ))}
      </div>

      {/* ALERTAS DE STOCK */}
      {data.lowStock.length > 0 && (
        <div className="bg-red-50 p-10 rounded-[3.5rem] border-8 border-white shadow-xl animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">⚠️</span>
            <h4 className="text-3xl font-black text-red-600 uppercase tracking-tighter">Atención: Reposición Urgente</h4>
          </div>
          <div className="flex flex-wrap gap-4">
            {data.lowStock.map((p: any) => (
              <div key={p.id} className="bg-white px-6 py-3 rounded-2xl text-lg font-black text-red-400 border-2 border-red-100 uppercase shadow-sm flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRÁFICOS */}
      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-8 bg-gray-50/50 p-10 rounded-[4rem] border-4 border-white shadow-inner">
          <div className="flex justify-between items-center px-4">
            <h4 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">Tendencia Mensual 📈</h4>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesHistory}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f6a118" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f6a118" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="#ddd" vertical={false} />
                <XAxis dataKey="date" stroke="#999" fontSize={12} fontStyle="bold" />
                <YAxis stroke="#999" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#f6a118" strokeWidth={6} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8 bg-gray-50/50 p-10 rounded-[4rem] border-4 border-white shadow-inner">
          <div className="flex justify-between items-center px-4">
            <h4 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">Top Categorías 🏷️</h4>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} width={100} />
                <Tooltip cursor={{ fill: '#fff' }} />
                <Bar dataKey="total" radius={[0, 20, 20, 0]} barSize={40}>
                  {data.categoryStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENTE: INVENTORY MANAGER - EL CORAZÓN DEL PANEL
 */
const InventoryManager: React.FC = () => {
  const { supabase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formMode, setFormMode] = useState<'list' | 'edit'>('list');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkImportRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async (isNewSearch = false) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const currentPage = isNewSearch ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase.from('products').select('*', { count: 'exact' });
      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        const mapped = data.map((p: any) => ({
          ...p,
          oldPrice: p.old_price,
          images: p.images || [],
          colors: p.colors || [],
          description: p.description || ""
        }));

        if (isNewSearch) {
          setProducts(mapped);
          setPage(1);
        } else {
          setProducts(prev => [...prev, ...mapped]);
          setPage(prev => prev + 1);
        }

        if (count !== null) {
          setHasMore(from + data.length < count);
        }
      }
    } catch (err) {
      console.error("Error al obtener inventario:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, page, searchTerm, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formMode === 'list') fetchProducts(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, formMode]);

  // CLONAR PRODUCTO RÁPIDO
  const handleClone = (p: Product) => {
    const clone = { 
      ...p, 
      id: undefined, 
      name: `${p.name} (COPIA)`, 
      created_at: undefined 
    };
    setEditingProduct(clone);
    setFormMode('edit');
  };

  /**
   * MANEJADOR DE IMPORTACIÓN MASIVA (EXCEL, PDF, CSV)
   */
  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    let newItems: any[] = [];

    try {
      // PROCESAR CSV
      if (fileExt === 'csv') {
        const text = await file.text();
        const rows = text.split("\n").slice(1);
        newItems = rows.map(row => {
          const parts = row.split(",");
          if (parts.length < 2) return null;
          return { 
            name: parts[0].trim(), 
            price: Number(parts[1]) || 0, 
            category: parts[2]?.trim() || "Escolar", 
            colors: [{ color: 'Único', stock: 10 }], 
            images: [] 
          };
        }).filter(i => i !== null);
      } 
      // PROCESAR EXCEL
      else if (fileExt === 'xlsx' || fileExt === 'xls') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        newItems = json.map(row => ({
          name: String(row.Nombre || row.name || Object.values(row)[0] || ""),
          price: Number(row.Precio || row.price || Object.values(row)[1] || 0),
          category: String(row.Categoria || row.category || "Escolar"),
          colors: [{ color: 'Único', stock: 10 }],
          images: []
        }));
      }
      // PROCESAR PDF
      else if (fileExt === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }

        const lines = fullText.split("\n");
        newItems = lines.map(line => {
          const parts = line.split(/[-|$]/);
          if (parts.length >= 2) {
            return {
              name: parts[0].trim(),
              price: parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0,
              category: "Escolar",
              colors: [{ color: 'Único', stock: 10 }],
              images: []
            };
          }
          return null;
        }).filter(i => i !== null && i.name.length > 2);
      }

      if (newItems.length > 0) {
        if (confirm(`DETECTAMOS ${newItems.length} PRODUCTOS. ¿SUBIR AL SISTEMA?`)) {
          const { error } = await supabase.from('products').insert(newItems);
          if (error) throw error;
          alert('🚀 ¡CATÁLOGO SINCRONIZADO!');
          fetchProducts(true);
        }
      } else {
        alert('Formato de archivo no reconocido o sin datos válidos. Revisa las columnas (Nombre, Precio).');
      }
    } catch (err: any) {
      alert("Error en el archivo: " + err.message);
    }
  };

  const handleStockChange = (idx: number, value: string) => {
    if (!editingProduct?.colors) return;
    const next = [...editingProduct.colors];
    const finalValue = value === "" ? ("" as any) : parseInt(value, 10);
    next[idx].stock = finalValue;
    setEditingProduct({ ...editingProduct, colors: next });
  };

  const updateStockByDelta = (idx: number, delta: number) => {
    if (!editingProduct?.colors) return;
    const next = [...editingProduct.colors];
    const current = Number(next[idx].stock) || 0;
    next[idx].stock = Math.max(0, current + delta);
    setEditingProduct({ ...editingProduct, colors: next });
  };

  const handleSave = async () => {
    if (!editingProduct?.name) return alert('¡Nombre obligatorio!');

    setIsSaving(true);
    try {
      const cleanColors = editingProduct.colors?.map(c => ({
        ...c,
        stock: Number(c.stock) || 0
      })) || [{ color: 'Único', stock: 1 }];

      const payload = {
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: Number(editingProduct.price) || 0,
        old_price: Number(editingProduct.oldPrice) || 0,
        points: Number(editingProduct.points) || 0,
        category: editingProduct.category || "Escolar",
        images: editingProduct.images || [],
        colors: cleanColors
      };

      const { error } = editingProduct.id
        ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert(payload);

      if (error) throw error;

      alert('✨ GUARDADO CORRECTAMENTE');
      setFormMode('list');
      fetchProducts(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Matita_web");
    formData.append("folder", "matita2026");
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.public_id;
    } catch { return null; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const uploadedIds: string[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const id = await uploadToCloudinary(e.target.files[i]);
      if (id) uploadedIds.push(id);
    }
    setEditingProduct(prev => prev ? ({ ...prev, images: [...(prev.images || []), ...uploadedIds] }) : null);
    setIsUploading(false);
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-12">
        {/* BARRA DE ACCIONES */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-8 bg-gray-50 p-8 rounded-[3.5rem] border-4 border-white shadow-inner">
          <div className="space-y-2">
            <h3 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Inventario Vital 📦</h3>
            <div className="flex items-center gap-6">
              <input type="file" ref={bulkImportRef} className="hidden" accept=".csv, .xlsx, .xls, .pdf" onChange={handleBulkImport} />
              <button onClick={() => bulkImportRef.current?.click()} className="text-[#ea7e9c] font-black text-sm underline uppercase tracking-widest hover:text-red-500">
                IMPORTAR MASIVO (Excel / PDF) ⬆️
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
            <input
              type="text"
              placeholder="BUSCAR TESORO... 🔍"
              className="px-10 py-5 rounded-[2rem] border-4 border-white outline-none focus:border-[#fadb31] uppercase font-bold text-xl shadow-lg w-full md:w-96"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                setEditingProduct({ name: '', description: '', price: 0, oldPrice: 0, points: 0, category: 'Escolar', colors: [{ color: 'Único', stock: 10 }], images: [] });
                setFormMode('edit');
              }}
              className="px-10 py-5 matita-gradient-orange text-white rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase whitespace-nowrap border-b-4 border-orange-700"
            >
              + NUEVO PRODUCTO
            </button>
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[3.5rem] border-8 border-gray-50 shadow-sm hover:shadow-2xl hover:border-[#fadb31]/30 transition-all flex flex-col group relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleClone(p)} className="bg-white/90 p-4 rounded-full shadow-xl hover:bg-[#fadb31] text-2xl">📑</button>
              </div>
              <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50">
                <img src={getImgUrl(p.images[0], 400)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="space-y-2 flex-grow">
                <p className="text-xs font-black text-[#fadb31] uppercase tracking-[0.2em]">{p.category}</p>
                <h4 className="text-xl font-black text-gray-800 uppercase tracking-tight leading-none h-14 line-clamp-2">{p.name}</h4>
                <div className="flex justify-between items-end pt-4">
                  <div>
                    <p className="text-3xl font-black text-[#f6a118] leading-none">${p.price}</p>
                    {p.oldPrice > 0 && <p className="text-sm font-bold text-gray-300 line-through">${p.oldPrice}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-800 leading-none">{p.colors.reduce((a, b) => a + (Number(b.stock) || 0), 0)}</p>
                    <p className="text-[10px] font-black text-gray-300 uppercase">STOCK TOTAL</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="flex-grow py-4 bg-white text-gray-800 rounded-2xl font-black border-4 border-gray-50 text-sm uppercase hover:bg-gray-800 hover:text-white transition-all">EDITAR</button>
                <button onClick={async () => { if (confirm('¿ELIMINAR ESTE TESORO?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(true); } }} className="px-5 py-4 bg-red-50 text-red-400 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-20">
            <button
              onClick={() => fetchProducts(false)}
              disabled={isLoading}
              className="px-16 py-8 bg-white border-[6px] border-[#fadb31] text-[#f6a118] rounded-[3rem] text-2xl font-black hover:bg-[#fadb31] hover:text-white transition-all disabled:opacity-50 uppercase tracking-[0.2em] shadow-2xl animate-float"
            >
              {isLoading ? 'Cargando tesoros...' : 'Explorar más productos 🔄'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // VISTA DE EDICIÓN / CREACIÓN
  return (
    <div className="animate-fadeIn max-w-5xl mx-auto space-y-12">
      <div className="flex items-center gap-8">
        <button onClick={() => setFormMode('list')} className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all shadow-lg border-4 border-white">🔙</button>
        <h3 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Editor de Tesoro ✨</h3>
      </div>

      <div className="bg-[#fef9eb] p-10 md:p-16 rounded-[5rem] border-[12px] border-white space-y-12 shadow-2xl relative">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-lg font-black text-gray-400 ml-6 uppercase tracking-[0.2em]">Nombre del Tesoro</label>
            <input type="text" className="w-full text-3xl p-8 rounded-[2.5rem] outline-none shadow-inner border-4 border-transparent focus:border-[#fadb31] uppercase font-bold" value={editingProduct?.name || ''} onChange={e => setEditingProduct({ ...editingProduct!, name: e.target.value })} />
          </div>
          <div className="space-y-4">
            <label className="text-lg font-black text-gray-400 ml-6 uppercase tracking-[0.2em]">Categoría Principal</label>
            <select className="w-full text-3xl p-8 rounded-[2.5rem] outline-none shadow-inner border-4 border-transparent focus:border-[#fadb31] uppercase font-bold appearance-none bg-white" value={editingProduct?.category} onChange={e => setEditingProduct({ ...editingProduct!, category: e.target.value as any })}>
              {['Escolar', 'Otros', 'Oficina', 'Tecnología', 'Novedades', 'Ofertas'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-lg font-black text-gray-400 ml-6 uppercase tracking-[0.2em]">Descripción del Producto</label>
          <textarea
            className="w-full text-2xl p-10 rounded-[3rem] outline-none shadow-inner border-4 border-transparent focus:border-[#fadb31] min-h-[250px] font-medium leading-relaxed"
            placeholder="Cuenta la historia de este producto..."
            value={editingProduct?.description || ''}
            onChange={e => setEditingProduct({ ...editingProduct!, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-2">
            <label className="text-sm font-black text-gray-300 uppercase tracking-widest block">Precio Venta ($)</label>
            <input type="number" className="w-full text-4xl font-black text-[#f6a118] outline-none" value={editingProduct?.price || ''} onFocus={e => e.target.select()} onChange={e => setEditingProduct({ ...editingProduct!, price: Number(e.target.value) })} />
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-2">
            <label className="text-sm font-black text-gray-300 uppercase tracking-widest block">Precio Anterior ($)</label>
            <input type="number" className="w-full text-4xl font-black text-gray-300 outline-none" value={editingProduct?.oldPrice || ''} onFocus={e => e.target.select()} onChange={e => setEditingProduct({ ...editingProduct!, oldPrice: Number(e.target.value) })} />
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-2">
            <label className="text-sm font-black text-gray-300 uppercase tracking-widest block">Puntos Matita ✨</label>
            <input type="number" className="w-full text-4xl font-black text-blue-400 outline-none" value={editingProduct?.points || ''} onFocus={e => e.target.select()} onChange={e => setEditingProduct({ ...editingProduct!, points: Number(e.target.value) })} />
          </div>
        </div>

        {/* GESTIÓN DE COLORES Y STOCK */}
        <div className="space-y-8">
          <div className="flex justify-between items-center px-6">
            <h4 className="text-2xl font-black text-gray-800 uppercase tracking-widest">Variantes y Stock</h4>
            <button onClick={() => setEditingProduct({ ...editingProduct!, colors: [...(editingProduct?.colors || []), { color: 'Nuevo Color', stock: 10 }] })} className="text-[#f6a118] font-black uppercase text-lg hover:scale-110 transition-all">+ Añadir Variante</button>
          </div>
          <div className="grid gap-4">
            {editingProduct?.colors?.map((c, i) => (
              <div key={i} className="flex items-center gap-6 bg-white p-6 rounded-[2.5rem] border-4 border-white shadow-sm group">
                <input className="flex-grow text-2xl font-black p-4 bg-gray-50 rounded-2xl outline-none uppercase" value={c.color} onChange={e => {
                  const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({ ...editingProduct, colors: n });
                }} />
                <div className="flex items-center gap-6 bg-gray-50 px-8 py-3 rounded-full border-4 border-white">
                  <button onClick={() => updateStockByDelta(i, -1)} className="text-5xl text-[#ea7e9c] font-black">-</button>
                  <input
                    type="number"
                    className="w-20 bg-transparent text-center text-4xl font-black outline-none"
                    value={c.stock}
                    onFocus={e => e.target.select()}
                    onChange={(e) => handleStockChange(i, e.target.value)}
                  />
                  <button onClick={() => updateStockByDelta(i, 1)} className="text-5xl text-[#f6a118] font-black">+</button>
                </div>
                <button onClick={() => setEditingProduct({ ...editingProduct, colors: editingProduct.colors?.filter((_, idx) => idx !== i) })} className="text-red-200 text-5xl hover:text-red-500">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* GALERÍA DE IMÁGENES */}
        <div className="space-y-8">
          <div className="flex flex-wrap gap-6">
            {editingProduct?.images?.map((img, idx) => (
              <div key={idx} className="relative w-40 h-40 group">
                <img src={getImgUrl(img, 300)} className="w-full h-full object-cover rounded-[2rem] border-8 border-white shadow-lg" />
                <button onClick={() => setEditingProduct({ ...editingProduct!, images: editingProduct.images?.filter((_, i) => i !== idx) })} className="absolute -top-4 -right-4 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl font-bold text-xl">×</button>
              </div>
            ))}
            <label className="w-40 h-40 flex flex-col items-center justify-center bg-white rounded-[2rem] border-4 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-all group">
              <span className="text-4xl group-hover:scale-125 transition-transform">📸</span>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
              {isUploading && <span className="text-[10px] font-black text-blue-400">SUBIENDO...</span>}
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-10 matita-gradient-orange text-white rounded-[3rem] text-4xl font-black shadow-2xl border-b-[12px] border-orange-700 hover:scale-[1.02] active:scale-95 transition-all uppercase"
        >
          {isSaving ? "Guardando en la Nube..." : "¡Publicar Tesoro! ✨"}
        </button>
      </div>
    </div>
  );
};

/**
 * COMPONENTE: SALES MANAGER
 */
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
    <div className="space-y-12 animate-fadeIn">
      <h3 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Bitácora de Ventas 💸</h3>
      <div className="grid gap-6">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-10 rounded-[3.5rem] border-4 border-white shadow-sm flex flex-col md:flex-row justify-between items-center group hover:bg-white hover:shadow-xl transition-all">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-inner">🛍️</div>
              <div>
                <p className="text-2xl font-black text-gray-800 uppercase tracking-tight">#{s.id.slice(0, 8)} - {s.user_name || 'Visitante Anónimo'}</p>
                <p className="text-lg text-gray-400 font-bold uppercase tracking-widest">{new Date(s.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-center md:text-right mt-6 md:mt-0">
              <p className="text-5xl font-black text-[#f6a118]">${s.total.toLocaleString()}</p>
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Pago Confirmado</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * COMPONENTE: SOCIOS MANAGER
 */
const SociosManager: React.FC = () => {
  const { supabase } = useApp();
  const [socios, setSocios] = useState<User[]>([]);
  const [editingPointsId, setEditingPointsId] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);

  const fetchSocios = async () => {
    const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
    if (data) setSocios(data.map((u: any) => ({ ...u, isSocio: u.is_socio, isAdmin: u.is_admin })));
  };

  useEffect(() => { fetchSocios(); }, [supabase]);

  const handleUpdatePoints = async (id: string) => {
    const { error } = await supabase.from('users').update({ points: newPoints }).eq('id', id);
    if (!error) {
      alert('✨ PUNTOS ACTUALIZADOS');
      setEditingPointsId(null);
      fetchSocios();
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <h3 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Socios del Club 👑</h3>
      <div className="grid gap-6">
        {socios.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[3.5rem] border-8 border-gray-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-[#fadb31]/30 transition-all">
            <div className="flex items-center gap-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-inner ${s.isAdmin ? 'bg-orange-100' : 'bg-blue-50'}`}>
                {s.isAdmin ? '🧙‍♂️' : s.isSocio ? '👑' : '👤'}
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-none">{s.name}</h4>
                <p className="text-lg text-gray-400 font-bold lowercase">{s.email}</p>
                <div className="flex gap-2">
                  {s.isAdmin && <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Admin</span>}
                  {s.isSocio && <span className="bg-[#fadb31] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Socio Activo</span>}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-[2.5rem] min-w-[200px] text-center relative overflow-hidden">
              {editingPointsId === s.id ? (
                <div className="flex flex-col items-center gap-4">
                  <input type="number" className="w-full text-3xl font-black text-center bg-white rounded-2xl p-2 outline-none" value={newPoints} onFocus={e => e.target.select()} onChange={e => setNewPoints(Number(e.target.value))} />
                  <div className="flex gap-2 w-full">
                    <button onClick={() => handleUpdatePoints(s.id)} className="flex-1 bg-green-500 text-white py-2 rounded-xl font-black">OK</button>
                    <button onClick={() => setEditingPointsId(null)} className="flex-1 bg-gray-200 text-gray-500 py-2 rounded-xl font-black">X</button>
                  </div>
                </div>
              ) : (
                <div className="cursor-pointer group/points" onClick={() => { setEditingPointsId(s.id); setNewPoints(s.points); }}>
                  <p className="text-5xl font-black text-[#f6a118] group-hover/points:scale-110 transition-transform">{s.points.toLocaleString()}</p>
                  <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Puntos ✨</p>
                  <p className="text-[10px] text-gray-300 italic opacity-0 group-hover/points:opacity-100">Click para editar</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * COMPONENTE: IDEAS MANAGER
 */
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
    <div className="space-y-12 animate-fadeIn px-4">
      <h3 className="text-5xl font-black text-gray-800 uppercase tracking-tighter">Buzón de Ideas 💡</h3>
      <div className="grid gap-10">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-12 rounded-[4rem] border-8 border-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-10 right-10 text-8xl opacity-5 group-hover:rotate-12 transition-transform">💡</div>
            <p className="text-3xl font-black text-gray-800 mb-6 italic uppercase leading-tight">"{i.title}"</p>
            <p className="text-xl text-gray-500 font-medium leading-relaxed uppercase">{i.content}</p>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f6a118] rounded-full"></div>
              <p className="text-lg text-[#f6a118] font-black uppercase tracking-[0.2em]">{i.user_name || 'Usuario Matita'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * COMPONENTE: DESIGN MANAGER (LOGOTIPO)
 */
const DesignManager: React.FC = () => {
  const { logoUrl, setLogoUrl, supabase } = useApp();
  const fRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const uploadLogoToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Matita_web");
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.public_id;
    } catch { return null; }
  };

  const saveDesign = async () => {
    setIsSaving(true);
    let finalLogoId = logoUrl;
    if (previewFile) {
      const uploadedId = await uploadLogoToCloudinary(previewFile);
      if (uploadedId) finalLogoId = uploadedId;
    }
    await supabase.from('site_config').upsert({ id: 'global', logo_url: finalLogoId });
    setLogoUrl(finalLogoId);
    setPreviewFile(null);
    setIsSaving(false);
    alert('🎨 IDENTIDAD ACTUALIZADA');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-16 text-center py-10">
      <h3 className="text-6xl font-black text-[#f6a118] uppercase tracking-tighter">Identidad Visual 🎨</h3>
      <div className="bg-[#fef9eb] p-20 rounded-[5rem] shadow-2xl border-[12px] border-white relative">
        <div 
          className="w-72 h-72 bg-white rounded-full mx-auto shadow-2xl flex items-center justify-center p-12 border-8 border-[#fadb31] cursor-pointer group hover:scale-105 transition-all" 
          onClick={() => fRef.current?.click()}
        >
          <img 
            src={previewFile ? URL.createObjectURL(previewFile) : getImgUrl(logoUrl, 400)} 
            className="w-full h-full object-contain group-hover:rotate-6 transition-transform" 
            alt="Logo Actual" 
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-4xl">📸</div>
        </div>
        <p className="mt-8 text-gray-400 font-black uppercase tracking-widest text-sm">Click para cambiar el logotipo oficial</p>
        <input type="file" ref={fRef} className="hidden" onChange={e => setPreviewFile(e.target.files?.[0] || null)} accept="image/*" />
        <button 
          onClick={saveDesign} 
          disabled={isSaving} 
          className="w-full mt-16 py-8 matita-gradient-orange text-white rounded-[3rem] text-3xl font-black shadow-xl uppercase border-b-8 border-orange-700"
        >
          {isSaving ? "Subiendo Identidad..." : "Sincronizar Cambios ✨"}
        </button>
      </div>
    </div>
  );
};

/**
 * COMPONENTE: CAROUSEL MANAGER
 */
const CarouselManager: React.FC = () => {
  const { supabase } = useApp();
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCarousel = async () => {
      const { data } = await supabase.from('site_config').select('carousel_images').eq('id', 'global').maybeSingle();
      if (data?.carousel_images) setImages(data.carousel_images);
    };
    fetchCarousel();
  }, [supabase]);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Matita_web");
    formData.append("folder", "matita2026/carousel");
    const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.public_id;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newImages: string[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const id = await uploadToCloudinary(e.target.files[i]);
      if (id) newImages.push(id);
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const saveCarousel = async () => {
    setIsSaving(true);
    await supabase.from('site_config').upsert({ id: 'global', carousel_images: images });
    setIsSaving(false);
    alert("🖼️ CARRUSEL ACTUALIZADO");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <h3 className="text-5xl font-black text-[#f6a118] uppercase tracking-tighter text-center">Escaparate Principal 🖼️</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-[3rem] overflow-hidden border-8 border-white shadow-xl aspect-[4/5]">
            <img src={getImgUrl(img, 800)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center">
              <button onClick={() => removeImage(i)} className="bg-red-500 text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all">
                ELIMINAR ✕
              </button>
            </div>
          </div>
        ))}
        <button 
          onClick={() => fileRef.current?.click()} 
          className="aspect-[4/5] flex flex-col items-center justify-center bg-gray-50 rounded-[3rem] border-8 border-dashed border-gray-200 hover:bg-white hover:border-[#fadb31] transition-all group"
        >
          <span className="text-8xl group-hover:scale-125 transition-transform">📸</span>
          <span className="mt-4 font-black text-gray-300 uppercase tracking-widest text-sm">Añadir Foto</span>
        </button>
      </div>
      <input type="file" ref={fileRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
      
      <button 
        onClick={saveCarousel} 
        disabled={isSaving} 
        className="w-full py-10 matita-gradient-orange text-white rounded-[3.5rem] text-4xl font-black shadow-2xl uppercase border-b-[12px] border-orange-700 hover:scale-[1.02] active:scale-95 transition-all"
      >
        {isSaving ? "Sincronizando Escaparate..." : "¡Guardar Portada! ✨"}
      </button>
    </div>
  );
};

export default AdminPanel;
