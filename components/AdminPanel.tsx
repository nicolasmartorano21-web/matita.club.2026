import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category, User, Sale, ColorStock } from '../types';
import { useApp } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

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


  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'matita2026') setIsAuthenticated(true);
    else alert('Contraseña incorrecta ❌');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 animate-fadeIn">
        <div className="bg-white rounded-[3rem] p-16 shadow-2xl border-4 border-[#fadb31] text-center space-y-10">
          <div className="text-9xl mb-4">👑</div>
          <h2 className="text-5xl font-bold text-gray-800 uppercase tracking-tighter">Panel Maestro</h2>
          <form onSubmit={handleAdminAuth} className="space-y-8">
            <input 
              type="password" 
              placeholder="CLAVE MATITA" 
              className="w-full text-3xl text-center shadow-inner py-5 bg-[#fef9eb] rounded-3xl outline-none uppercase" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-4xl font-bold shadow-lg hover:scale-105 transition-all uppercase">
              Entrar
            </button>
          </form>
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 font-bold uppercase underline text-sm mt-4"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-12 py-10 animate-fadeIn px-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-4 border-[#fadb31]/20 pb-8">
        <div>
          <h2 className="text-5xl md:text-6xl font-bold text-[#f6a118] uppercase">Gestión MATITA</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xl md:text-2xl text-gray-400 italic uppercase">ESTADÍSTICAS Y CONTROL REAL ✏️</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'dashboard', label: '📊 Stats' },
              { id: 'inventory', label: '📦 Stock' },
              { id: 'sales', label: '💸 Ventas' },
              { id: 'socios', label: '👥 Socios' },
              { id: 'ideas', label: '💡 Ideas' },
              { id: 'design', label: '🎨 Marca' },
              { id: 'carousel', label: '🖼️ Carrusel' }

            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-5 py-2 md:px-8 md:py-3 rounded-[1.5rem] text-lg md:text-xl font-bold transition-all uppercase ${activeTab === tab.id ? 'matita-gradient-orange text-white shadow-lg scale-110' : 'bg-white text-gray-400 hover:text-[#f6a118]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-8 py-3 bg-[#ea7e9c] text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-110 transition-all uppercase flex items-center gap-2 border-4 border-white"
          >
            SALIR DEL PANEL 🚪
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-matita p-6 md:p-14 border-[8px] border-white min-h-[600px]">
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

const Dashboard: React.FC = () => {
  const { supabase } = useApp();
  const [data, setData] = useState<any>({ 
    salesHistory: [], 
    categoryStats: [], 
    lowStock: [],
    totals: { sales: 0, users: 0, products: 0 } 
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: sales } = await supabase.from('sales').select('*').order('created_at', { ascending: true });
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { data: prods } = await supabase.from('products').select('*');

      if (sales && prods) {
        const history = sales.map((s:any) => ({ 
          date: new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          amount: s.total 
        }));
        
        const catMap: any = {};
        sales.forEach((s:any) => {
          const cat = s.category_summary || 'Varios';
          catMap[cat] = (catMap[cat] || 0) + s.total;
        });
        const categories = Object.keys(catMap).map(k => ({ name: k, total: catMap[k] }));

        const lowStock = prods.filter((p:any) => {
          const totalStock = p.colors?.reduce((acc:number, c:any) => acc + (Number(c.stock) || 0), 0) || 0;
          return totalStock < 5;
        });

        setData({
          salesHistory: history,
          categoryStats: categories,
          lowStock,
          totals: {
            sales: sales.reduce((a:number, b:any) => a + b.total, 0),
            users: usersCount || 0,
            products: prods.length || 0
          }
        });
      }
    };
    fetchDashboard();
  }, [supabase]);

  const COLORS = ['#f6a118', '#ea7e9c', '#fadb31', '#93c5fd', '#86efac'];

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fef9eb] p-8 rounded-[2.5rem] text-center border-4 border-white shadow-sm">
          <p className="text-xl text-gray-400 font-bold uppercase">Ingresos Totales</p>
          <p className="text-4xl font-bold text-[#f6a118]">${data.totals.sales.toLocaleString()}</p>
        </div>
        <div className="bg-[#fff1f2] p-8 rounded-[2.5rem] text-center border-4 border-white shadow-sm">
          <p className="text-xl text-gray-400 font-bold uppercase">Socios</p>
          <p className="text-4xl font-bold text-[#ea7e9c]">{data.totals.users}</p>
        </div>
        <div className="bg-[#f0f9ff] p-8 rounded-[2.5rem] text-center border-4 border-white shadow-sm">
          <p className="text-xl text-gray-400 font-bold uppercase">Items Catálogo</p>
          <p className="text-4xl font-bold text-blue-400">{data.totals.products}</p>
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="bg-red-50 p-8 rounded-[2.5rem] border-4 border-white shadow-sm">
          <h4 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-2 uppercase tracking-tighter">⚠️ ALERTA DE REPOSICIÓN</h4>
          <div className="flex flex-wrap gap-4">
             {data.lowStock.map((p:any) => (
               <div key={p.id} className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-red-100 uppercase">
                 {p.name}
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <h4 className="text-3xl font-bold text-gray-700 ml-4 uppercase tracking-tighter">TENDENCIA DE VENTAS 💸</h4>
          <div className="h-[350px] w-full bg-[#fdfaf6] p-4 rounded-[2.5rem] border-2 border-white shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" stroke="#999" fontSize={10} />
                <YAxis stroke="#999" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#f6a118" strokeWidth={4} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-3xl font-bold text-gray-700 ml-4 uppercase tracking-tighter">VENTAS POR CATEGORÍA 🏷️</h4>
          <div className="h-[350px] w-full bg-[#fdfaf6] p-4 rounded-[2.5rem] border-2 border-white shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" stroke="#999" fontSize={10} />
                <YAxis stroke="#999" fontSize={10} />
                <Tooltip />
                <Bar dataKey="total">
                  {data.categoryStats.map((entry:any, index:number) => (
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

const InventoryManager: React.FC = () => {
  const { supabase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formMode, setFormMode] = useState<'list' | 'edit'>('list');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data.map((p: any) => ({ 
      ...p, 
      oldPrice: p.old_price, 
      images: p.images || [], 
      colors: p.colors || [],
      description: p.description || ""
    })));
  };

  useEffect(() => { fetchProducts(); }, [supabase]);

  const exportInventory = () => {
    const headers = "Nombre,Precio,Puntos,Categoría\n";
    const csvContent = products.map(p => `"${p.name}",${p.price},${p.points},"${p.category}"`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Inventario_MATITA.csv';
    a.click();
  };

  const updateStock = (idx: number, change: number) => {
    if (!editingProduct?.colors) return;
    const next = [...editingProduct.colors];
    const currentStock = Number(next[idx].stock) || 0;
    next[idx].stock = Math.max(0, currentStock + change);
    setEditingProduct({ ...editingProduct, colors: next });
  };

  const handleSave = async () => {
    if (!editingProduct?.name) return alert('¡Escribe el nombre del tesoro!');
    
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
        colors: editingProduct.colors || [{color: 'Único', stock: 1}]
      };

      const { error } = editingProduct.id 
        ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert(payload);
      
      if (error) throw error;

      alert('✨ ¡Sincronizado con éxito! PC y Celular actualizados.');
      setFormMode('list'); 
      fetchProducts();
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImageToCloudinary = async (file: File) => {
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
      if (data.error) throw new Error(data.error.message);
      return data.public_id;
    } catch (error) {
      console.error("Cloudinary error:", error);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const uploadedIds: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const publicId = await uploadImageToCloudinary(files[i]);
      if (publicId) uploadedIds.push(publicId);
    }
    
    setEditingProduct(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        images: [...(prev.images || []), ...uploadedIds] 
      };
    });
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <h3 className="text-3xl font-bold text-gray-700 uppercase tracking-tighter">INVENTARIO 📦</h3>
             <button onClick={exportInventory} className="text-[#f6a118] font-bold text-sm underline uppercase">EXPORTAR CSV ⬇️</button>
          </div>
          <button 
            onClick={() => { 
              setEditingProduct({ name: '', description: '', price: 0, oldPrice: 0, points: 0, category: 'Escolar', colors: [{color: 'Único', stock: 10}], images: [] }); 
              setFormMode('edit'); 
            }} 
            className="px-6 py-3 bg-[#f6a118] text-white rounded-2xl font-bold text-xl shadow-md hover:scale-105 transition-all uppercase"
          >
            + NUEVO ARTÍCULO
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-gray-50 p-4 rounded-[2rem] border-2 border-white shadow-sm hover:border-[#fadb31] transition-all flex flex-col h-full">
              <img src={getImgUrl(p.images[0], 200)} className="w-full aspect-square object-cover rounded-2xl mb-3" />
              <h4 className="text-sm font-bold truncate text-gray-800 uppercase">{p.name}</h4>
              <p className="text-lg font-bold text-[#f6a118] mb-3">${p.price}</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="flex-grow py-2 bg-white text-[#f6a118] rounded-xl font-bold border border-[#fadb31] text-xs uppercase">EDITAR</button>
                <button onClick={async () => { if(confirm('¿BORRAR?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="text-red-200">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-6">
        <button onClick={() => setFormMode('list')} className="text-4xl hover:scale-110 transition-all uppercase">🔙</button>
        <h3 className="text-3xl font-bold text-gray-800 uppercase tracking-tighter">EDITOR DE PRODUCTO</h3>
      </div>
      
      <div className="bg-[#fef9eb] p-8 md:p-12 rounded-[3.5rem] border-4 border-white space-y-8 shadow-xl max-h-[85vh] overflow-y-auto scrollbar-hide">
        <div className="grid md:grid-cols-2 gap-6">
           <div className="space-y-1">
             <label className="text-sm font-bold text-gray-400 ml-4 uppercase tracking-widest">Nombre del Tesoro</label>
             <input type="text" className="w-full text-2xl p-4 rounded-2xl outline-none shadow-inner uppercase" value={editingProduct?.name || ''} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
           </div>
           <div className="space-y-1">
             <label className="text-sm font-bold text-gray-400 ml-4 uppercase tracking-widest">Categoría</label>
             <select className="w-full text-2xl p-4 rounded-2xl outline-none shadow-inner uppercase" value={editingProduct?.category} onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}>
               {['Escolar', 'Otros', 'Oficina', 'Tecnología', 'Novedades', 'Ofertas'].map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           </div>
        </div>

        <div className="space-y-1">
           <label className="text-sm font-bold text-gray-400 ml-4 uppercase tracking-widest">Descripción del Producto 📖</label>
           <textarea 
             className="w-full text-xl p-6 rounded-[2rem] outline-none shadow-inner min-h-[150px] font-matita bg-white border-2 border-[#fadb31]/20" 
             placeholder="Cuenta la historia de este producto..."
             value={editingProduct?.description || ''} 
             onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})}
           />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">Precio ($)</label>
             <input type="number" className="w-full text-xl p-4 rounded-2xl outline-none shadow-inner uppercase" value={editingProduct?.price || ''} onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">Antes ($)</label>
             <input type="number" className="w-full text-xl p-4 rounded-2xl outline-none shadow-inner uppercase" value={editingProduct?.oldPrice || ''} onChange={e => setEditingProduct({...editingProduct!, oldPrice: Number(e.target.value)})} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">Puntos ✨</label>
             <input type="number" className="w-full text-xl p-4 rounded-2xl outline-none shadow-inner uppercase" value={editingProduct?.points || ''} onChange={e => setEditingProduct({...editingProduct!, points: Number(e.target.value)})} />
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center px-4">
             <h4 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Variantes y Stock</h4>
             <button onClick={() => setEditingProduct({...editingProduct!, colors: [...(editingProduct?.colors || []), {color: 'Nuevo', stock: 1}]})} className="text-[#f6a118] font-bold uppercase tracking-widest">+ AÑADIR</button>
           </div>
           <div className="grid gap-3">
             {editingProduct?.colors?.map((c, i) => (
               <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-white shadow-sm">
                  <input className="flex-grow border-none text-xl font-bold p-0 bg-transparent outline-none uppercase" value={c.color} onChange={e => {
                    const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({...editingProduct, colors: n});
                  }} />
                  <div className="flex items-center gap-6 bg-gray-50 px-6 py-2 rounded-full border-2 border-gray-100">
                    <button onClick={() => updateStock(i, -1)} className="text-4xl text-[#ea7e9c] font-bold active:scale-125 transition-transform">-</button>
                    <span className="text-2xl font-bold min-w-[2.5rem] text-center">{c.stock}</span>
                    <button onClick={() => updateStock(i, 1)} className="text-4xl text-[#f6a118] font-bold active:scale-125 transition-transform">+</button>
                  </div>
                  <button onClick={() => setEditingProduct({...editingProduct, colors: editingProduct.colors?.filter((_, idx) => idx !== i)})} className="text-red-200 text-3xl">×</button>
               </div>
             ))}
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex flex-wrap gap-4 mb-4">
              {editingProduct?.images?.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 group">
                  <img src={getImgUrl(img, 200)} className="w-full h-full object-cover rounded-xl border-2 border-white shadow-sm" />
                  <button onClick={() => setEditingProduct({...editingProduct!, images: editingProduct.images?.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              ))}
           </div>
           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} multiple accept="image/*" />
           <button 
             onClick={() => fileInputRef.current?.click()} 
             disabled={isUploading}
             className="w-full py-8 bg-white border-4 border-dashed border-gray-200 text-gray-400 rounded-3xl text-xl font-bold hover:bg-gray-100 transition-all uppercase tracking-widest flex items-center justify-center gap-4"
           >
             {isUploading ? <><div className="w-6 h-6 border-4 border-[#f6a118] border-t-transparent rounded-full animate-spin"></div> SUBIENDO...</> : '📸 SUBIR FOTOS'}
           </button>
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-3xl font-bold shadow-xl border-4 border-white hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter disabled:opacity-50"
        >
          {isSaving ? "GUARDANDO..." : "¡GUARDAR PRODUCTO! ✨"}
        </button>
      </div>
    </div>
  );
};

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

  const exportSales = () => {
    const headers = "Folio,Cliente,Fecha,Total,Categoría\n";
    const csvContent = sales.map(s => `"${s.id.slice(0,8)}","${s.user_name || 'Invitado'}","${new Date(s.created_at).toLocaleString()}",${s.total},"${s.category_summary || 'Venta'}"`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ventas_MATITA.csv';
    a.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-3xl font-bold text-gray-700 uppercase tracking-tighter">HISTORIAL DE VENTAS 💸</h3>
        <button onClick={exportSales} className="text-[#f6a118] font-bold text-sm underline uppercase">EXPORTAR CSV ⬇️</button>
      </div>
      <div className="grid gap-4">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-6 rounded-[2rem] border-2 border-white shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-800 uppercase tracking-tighter">#{s.id.slice(0,8)} - {s.user_name || 'Invitado'}</p>
              <p className="text-sm text-gray-400 uppercase tracking-widest">{new Date(s.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#f6a118]">${s.total}</p>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{s.category_summary || 'Venta'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SociosManager: React.FC = () => {
  const { supabase } = useApp();
  const [socios, setSocios] = useState<User[]>([]);
  const [editingPointsId, setEditingPointsId] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);

  const fetchSocios = async () => {
    const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
    if (data) setSocios(data.map((u:any) => ({ ...u, isSocio: u.is_socio, isAdmin: u.is_admin })));
  };

  useEffect(() => { fetchSocios(); }, [supabase]);

  const exportSocios = () => {
    const headers = "Nombre,Email,Puntos,Socio\n";
    const csvContent = socios.map(s => `"${s.name}","${s.email}",${s.points},${s.isSocio}`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Socios_MATITA.csv';
    a.click();
  };

  const handleUpdatePoints = async (id: string) => {
    const { error } = await supabase.from('users').update({ points: newPoints }).eq('id', id);
    if (!error) {
      alert('¡Puntos actualizados! ✨');
      setEditingPointsId(null);
      fetchSocios();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <h3 className="text-3xl font-bold text-gray-700 uppercase tracking-tighter">SOCIOS DEL CLUB 👑</h3>
          <button onClick={exportSocios} className="text-[#f6a118] font-bold text-sm underline uppercase">EXPORTAR CSV ⬇️</button>
        </div>
        <span className="bg-[#fef9eb] text-[#f6a118] px-4 py-2 rounded-full font-bold uppercase tracking-widest">{socios.length} MIEMBROS</span>
      </div>
      
      <div className="grid gap-4">
        {socios.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[2rem] border-2 border-gray-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fef9eb] rounded-full flex items-center justify-center text-2xl">
                  {s.isSocio ? '👑' : '👤'}
                </div>
                <div>
                   <h4 className="text-xl font-bold text-gray-800 uppercase tracking-tighter">{s.name}</h4>
                   <p className="text-sm text-gray-400 uppercase tracking-widest">{s.email}</p>
                </div>
             </div>
             <div className="flex items-center gap-6">
                {editingPointsId === s.id ? (
                  <div className="flex items-center gap-2">
                    <input type="number" className="w-20 p-2 text-center border-2 rounded-xl uppercase shadow-inner" value={newPoints} onChange={e => setNewPoints(Number(e.target.value))} />
                    <button onClick={() => handleUpdatePoints(s.id)} className="bg-green-500 text-white p-2 rounded-xl uppercase font-bold shadow-md">✓</button>
                    <button onClick={() => setEditingPointsId(null)} className="bg-gray-100 text-gray-400 p-2 rounded-xl uppercase font-bold">×</button>
                  </div>
                ) : (
                  <div className="cursor-pointer text-right" onClick={() => { setEditingPointsId(s.id); setNewPoints(s.points); }}>
                    <p className="text-2xl font-bold text-[#f6a118] leading-none tracking-tighter">{s.points}</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">PUNTOS ✨</p>
                  </div>
                )}
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
    const f = async () => {
      const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
      if (data) setIdeas(data);
    };
    f();
  }, [supabase]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <h3 className="text-3xl font-bold text-gray-700 uppercase tracking-tighter">BUZÓN DE IDEAS 💡</h3>
      <div className="grid gap-6">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-8 rounded-[3rem] border-4 border-white shadow-md">
             <p className="text-2xl font-bold text-gray-800 mb-2 italic uppercase tracking-tighter">"{i.title}"</p>
             <p className="text-lg text-gray-500 uppercase tracking-tight">{i.content}</p>
             <p className="mt-4 text-sm text-[#f6a118] font-bold uppercase tracking-widest">- {i.user_name}</p>
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
    } catch (error) {
      return null;
    }
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
    alert('✨ LOGO GUARDADO');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 text-center py-6">
      <h3 className="text-4xl font-bold text-[#f6a118] uppercase tracking-tighter">IDENTIDAD DE MARCA 🎨</h3>
      <div className="bg-[#fef9eb] p-12 rounded-[4rem] shadow-xl border-4 border-white">
        <div className="w-48 h-48 bg-white rounded-full mx-auto shadow-inner flex items-center justify-center p-6 border-4 border-[#fadb31] cursor-pointer" onClick={() => fRef.current?.click()}>
           <img src={previewFile ? URL.createObjectURL(previewFile) : getImgUrl(logoUrl, 300)} className="w-full h-full object-contain" alt="Logo" />
        </div>
        <input type="file" ref={fRef} className="hidden" onChange={e => setPreviewFile(e.target.files?.[0] || null)} accept="image/*" />
        <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Toca el logo para cambiarlo</p>
        <button onClick={saveDesign} disabled={isSaving} className="w-full mt-10 py-5 matita-gradient-orange text-white rounded-[2rem] text-2xl font-bold shadow-lg uppercase tracking-widest">
          {isSaving ? "GUARDANDO..." : "GUARDAR CAMBIOS ✨"}
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
    const fetchCarousel = async () => {
      const { data } = await supabase
        .from('site_config')
        .select('carousel_images')
        .eq('id', 'global')
        .maybeSingle();

      if (data?.carousel_images) {
        setImages(data.carousel_images);
      }
    };

    fetchCarousel();
  }, [supabase]);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Matita_web");
    formData.append("folder", "matita2026/carousel");

    const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", {
      method: "POST",
      body: formData
    });

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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: number) => {
    const newArr = [...images];
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setImages(newArr);
  };

  const saveCarousel = async () => {
    setIsSaving(true);

    await supabase.from('site_config').upsert({
      id: 'global',
      carousel_images: images
    });

    setIsSaving(false);
    alert("✨ Carrusel actualizado correctamente");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h3 className="text-4xl font-bold text-[#f6a118] uppercase tracking-tighter text-center">
        ADMINISTRAR CARRUSEL 🖼️
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <img
              src={`https://res.cloudinary.com/dllm8ggob/image/upload/w_600/${img}`}
              className="rounded-2xl object-cover aspect-square border-4 border-white shadow-md"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 rounded-2xl">
              <button
                onClick={() => moveImage(i, -1)}
                className="bg-white px-3 py-1 rounded-full text-xs font-bold"
              >
                ⬆️
              </button>
              <button
                onClick={() => moveImage(i, 1)}
                className="bg-white px-3 py-1 rounded-full text-xs font-bold"
              >
                ⬇️
              </button>
              <button
                onClick={() => removeImage(i)}
                className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        type="file"
        ref={fileRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleUpload}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full py-6 border-4 border-dashed border-gray-300 rounded-3xl font-bold uppercase text-gray-400 hover:bg-gray-100"
      >
        📸 ABRIR GALERÍA Y AGREGAR IMÁGENES
      </button>

      <button
        onClick={saveCarousel}
        disabled={isSaving}
        className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-2xl font-bold shadow-xl uppercase"
      >
        {isSaving ? "GUARDANDO..." : "GUARDAR CAMBIOS ✨"}
      </button>
    </div>
  );
};

export default AdminPanel;
