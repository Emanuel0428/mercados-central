import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, ChevronDown, ChevronUp, Package, Clock, CheckCircle, Loader2, User as UserIcon, Lock, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const API = 'http://localhost:5000';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
  shipping_details: ShippingDetails | string;
  email?: string;
  items?: OrderItem[];
}

type OrderStatus = 'pending' | 'processing' | 'delivered';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    icon: <Clock size={12} />,
  },
  processing: {
    label: 'En proceso',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: <Package size={12} />,
  },
  delivered: {
    label: 'Entregado',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    icon: <CheckCircle size={12} />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

async function apiFetch(url: string, token: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error('TOKEN_EXPIRED');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Error del servidor');
  }
  return res.json();
}

export const Account = () => {
  const { user, logout, updateUser, setUser } = useStore();
  const navigate = useNavigate();
  const userRef = useRef(user);

  useEffect(() => { userRef.current = user; }, [user]);

  // ── Sync role from backend once on mount (best-effort, silent fail) ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    apiFetch(`${API}/api/account/profile`, token)
      .then((profile) => {
        if (profile.role !== userRef.current?.role) {
          setUser({ id: profile.id, name: profile.name, email: profile.email, role: profile.role });
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeTab, setActiveTab] = useState<'stock' | 'orders' | 'stats'>('orders');
  const [userSection, setUserSection] = useState<'orders' | 'profile'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleExpiredToken = useCallback(() => {
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  }, [logout, navigate]);

  const fetchUserOrders = useCallback(
    async (token: string) => {
      setLoading(true);
      setError(null);
      try {
        const data: Order[] = await apiFetch(`${API}/api/account/orders`, token);
        setUserOrders(data);
      } catch (err) {
        if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
          handleExpiredToken();
        } else {
          setError('No se pudieron cargar tus pedidos. Intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    },
    [handleExpiredToken]
  );

  const fetchAdminData = useCallback(
    async (token: string) => {
      setLoading(true);
      setError(null);
      try {
        const [productsData, ordersData]: [Product[], Order[]] = await Promise.all([
          apiFetch(`${API}/api/admin/products`, token),
          apiFetch(`${API}/api/admin/orders`, token),
        ]);
        setProducts(productsData);
        setOrders(ordersData);

        const itemsData: OrderItem[][] = await Promise.all(
          ordersData.map((o) => apiFetch(`${API}/api/admin/orders/${o.id}/items`, token))
        );
        const map: Record<number, OrderItem[]> = {};
        ordersData.forEach((o, i) => { map[o.id] = itemsData[i]; });
        setOrderItems(map);
      } catch (err) {
        if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
          handleExpiredToken();
        } else {
          setError('No se pudieron cargar los datos. Intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    },
    [handleExpiredToken]
  );

  // ── Load data based on current user role ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      handleExpiredToken();
      return;
    }
    if (user.role === 'admin') {
      fetchAdminData(token);
    } else {
      fetchUserOrders(token);
      setProfileName(user.name ?? '');
      setProfileEmail(user.email ?? '');
    }
  }, [user, fetchAdminData, fetchUserOrders, handleExpiredToken]);

  const toggleExpand = (id: number) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdminStatusChange = async (orderId: number, status: OrderStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return handleExpiredToken();
    setUpdatingStatus(orderId);
    try {
      await apiFetch(`${API}/api/admin/orders/${orderId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') handleExpiredToken();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleMarkReceived = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return handleExpiredToken();
    setUpdatingStatus(orderId);
    try {
      await apiFetch(`${API}/api/account/orders/${orderId}/received`, token, { method: 'PATCH' });
      setUserOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o)));
    } catch (err) {
      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') handleExpiredToken();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return handleExpiredToken();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const data = await apiFetch(`${API}/api/account/profile`, token, {
        method: 'PATCH',
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      });
      updateUser({ name: data.name, email: data.email });
      setProfileMsg({ type: 'ok', text: 'Perfil actualizado correctamente.' });
    } catch (err) {
      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') return handleExpiredToken();
      setProfileMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error al guardar.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'err', text: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return handleExpiredToken();
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      await apiFetch(`${API}/api/account/password`, token, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') return handleExpiredToken();
      setPasswordMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error al actualizar.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600 dark:text-gray-300 mb-4">Por favor, inicia sesión para ver tu cuenta.</p>
        <Link to="/login" className="btn-primary">Iniciar sesión</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => {
            const t = localStorage.getItem('token')!;
            user.role === 'admin' ? fetchAdminData(t) : fetchUserOrders(t);
          }}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Admin stats ──────────────────────────────────────
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(0) : 0;

  const salesByCategory = products.reduce((acc, product) => {
    const sales = Object.values(orderItems).flat()
      .filter((i) => i.product_id === product.id)
      .reduce((s, i) => s + i.quantity * i.price, 0);
    acc[product.category] = (acc[product.category] || 0) + sales;
    return acc;
  }, {} as Record<string, number>);

  const barData = {
    labels: Object.keys(salesByCategory),
    datasets: [{ label: 'Ventas ($)', data: Object.values(salesByCategory), backgroundColor: 'rgba(75,192,192,0.6)' }],
  };

  const last7DaysSales = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      sales: orders.filter((o) => new Date(o.created_at).toDateString() === date.toDateString()).reduce((s, o) => s + o.total, 0),
    };
  }).reverse();

  const lineData = {
    labels: last7DaysSales.map((d) => d.date),
    datasets: [{ label: 'Ventas Diarias ($)', data: last7DaysSales.map((d) => d.sales), borderColor: 'rgba(54,162,235,1)', tension: 0.3, fill: false }],
  };

  const topProducts = Object.values(orderItems).flat().reduce((acc: Record<string, number>, item) => {
    acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
    return acc;
  }, {});
  const sortedTopProducts = Object.entries(topProducts)
    .sort(([, a], [, b]) => b - a).slice(0, 5)
    .map(([id]) => products.find((p) => p.id === id)).filter(Boolean) as Product[];

  const pieData = {
    labels: sortedTopProducts.map((p) => p.name),
    datasets: [{
      data: sortedTopProducts.map((p) => topProducts[p.id]),
      backgroundColor: ['rgba(255,99,132,0.6)', 'rgba(54,162,235,0.6)', 'rgba(255,206,86,0.6)', 'rgba(75,192,192,0.6)', 'rgba(153,102,255,0.6)'],
    }],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-600 mb-6">
          <ArrowLeft size={18} className="mr-1" /> Volver
        </button>

        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mi Cuenta</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {user.name && <span className="font-medium text-gray-700 dark:text-gray-200 mr-2">{user.name}</span>}
              {user.email}
              {user.role === 'admin' && (
                <span className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">Admin</span>
              )}
            </p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        {/* ══════════════ ADMIN PANEL ══════════════ */}
        {user.role === 'admin' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Panel de Administrador</h2>
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['orders', 'stock', 'stats'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tab === 'orders' ? `Pedidos (${orders.length})` : tab === 'stock' ? 'Inventario' : 'Estadísticas'}
                </button>
              ))}
            </div>

            {/* ── Pedidos Admin ── */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">Todos los pedidos</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total recaudado: <span className="font-bold text-green-600">${totalSales.toLocaleString('es-CO')}</span>
                  </p>
                </div>
                {orders.length === 0 ? (
                  <p className="text-center py-10 text-gray-400">No hay pedidos aún.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => {
                      const shipping = typeof order.shipping_details === 'string'
                        ? JSON.parse(order.shipping_details || '{}')
                        : order.shipping_details;
                      const isExpanded = expandedOrders.has(order.id);
                      const items = orderItems[order.id] ?? [];
                      const isUpdating = updatingStatus === order.id;

                      return (
                        <div key={order.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 flex-wrap text-sm">
                              <span className="font-mono font-semibold text-gray-400">#{order.id}</span>
                              <span className="font-medium text-gray-800 dark:text-white">{order.email ?? 'Anónimo'}</span>
                              <StatusBadge status={order.status} />
                              <span className="text-gray-400">{new Date(order.created_at).toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600">${order.total.toLocaleString('es-CO')}</span>
                              {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 border-t dark:border-gray-700 grid md:grid-cols-2 gap-6">
                                  {/* Envío + pago + cambiar estado */}
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Datos de envío</h4>
                                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                        <p><span className="font-medium">Cliente:</span> {shipping.name}</p>
                                        <p><span className="font-medium">Dirección:</span> {shipping.address}, {shipping.city}</p>
                                        <p><span className="font-medium">Teléfono:</span> {shipping.phone}</p>
                                        <p><span className="font-medium">Pago:</span> {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cambiar estado</h4>
                                      <div className="flex gap-2 flex-wrap">
                                        {(['pending', 'processing', 'delivered'] as OrderStatus[]).map((s) => (
                                          <button
                                            key={s}
                                            onClick={() => handleAdminStatusChange(order.id, s)}
                                            disabled={order.status === s || isUpdating}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                              order.status === s
                                                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-default'
                                                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400'
                                            } disabled:opacity-50`}
                                          >
                                            {isUpdating && order.status !== s ? (
                                              <Loader2 size={10} className="animate-spin" />
                                            ) : (
                                              STATUS_CONFIG[s].icon
                                            )}
                                            {STATUS_CONFIG[s].label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Productos */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                      Productos ({items.length})
                                    </h4>
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-gray-400 border-b dark:border-gray-700 text-left">
                                          <th className="pb-1.5">Producto</th>
                                          <th className="pb-1.5 text-center">Cant.</th>
                                          <th className="pb-1.5 text-right">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {items.map((item) => (
                                          <tr key={item.id} className="border-b dark:border-gray-700 last:border-0">
                                            <td className="py-1.5 text-gray-800 dark:text-white">{item.name}</td>
                                            <td className="py-1.5 text-center text-gray-500">{item.quantity}</td>
                                            <td className="py-1.5 text-right text-gray-700 dark:text-gray-300">
                                              ${(item.quantity * item.price).toLocaleString('es-CO')}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr>
                                          <td colSpan={2} className="pt-2 text-right font-semibold text-gray-600 dark:text-gray-400">Total:</td>
                                          <td className="pt-2 text-right font-bold text-green-600">${order.total.toLocaleString('es-CO')}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Inventario ── */}
            {activeTab === 'stock' && (
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Inventario de Productos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                        <th className="p-3 rounded-l-lg">Producto</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 rounded-r-lg">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b dark:border-gray-700/50">
                          <td className="p-3 font-medium text-gray-800 dark:text-white">{p.name}</td>
                          <td className="p-3 capitalize text-gray-500">{p.category}</td>
                          <td className="p-3">
                            <span className={`font-semibold ${p.stock < 10 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{p.stock}</span>
                            {p.stock < 10 && <span className="ml-1 text-xs text-red-400">⚠</span>}
                          </td>
                          <td className="p-3 text-gray-700 dark:text-gray-300">${p.price.toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Estadísticas ── */}
            {activeTab === 'stats' && (
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Estadísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Ventas Totales', value: `$${totalSales.toLocaleString('es-CO')}` },
                    { label: 'Pedidos Totales', value: totalOrders },
                    { label: 'Stock Total', value: products.reduce((a, p) => a + p.stock, 0) },
                    { label: 'Bajo Stock (<10)', value: lowStockProducts },
                    { label: 'Pedidos Pendientes', value: pendingOrders },
                    { label: 'Promedio por Pedido', value: `$${Number(avgOrderValue).toLocaleString('es-CO')}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ventas por Categoría</h4>
                    <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ventas Diarias (7 días)</h4>
                    <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                  </div>
                  {sortedTopProducts.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Productos Más Vendidos</h4>
                      <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        ) : (
          // ══════════════ PANEL USUARIO ══════════════
          <div className="space-y-4">
            {/* Tab nav */}
            <div className="flex gap-2">
              <button
                onClick={() => setUserSection('orders')}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  userSection === 'orders' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                }`}
              >
                <ShoppingBag size={15} />
                Mis Pedidos
              </button>
              <button
                onClick={() => setUserSection('profile')}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  userSection === 'profile' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                }`}
              >
                <UserIcon size={15} />
                Mi Perfil
              </button>
            </div>

            {/* ── Sección Pedidos ── */}
            {userSection === 'orders' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Historial de Pedidos</h2>
                <p className="text-sm text-gray-400 mt-0.5">{userOrders.length} pedido{userOrders.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-14">
                <Package size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Aún no has realizado ningún pedido.</p>
                <Link to="/categories" className="btn-primary">Explorar productos</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  const shipping = order.shipping_details as ShippingDetails;
                  const items = order.items ?? [];
                  const isUpdating = updatingStatus === order.id;
                  const canMarkReceived = order.status !== 'delivered';

                  return (
                    <div key={order.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                          <span className="font-mono font-semibold text-gray-400">Pedido #{order.id}</span>
                          <StatusBadge status={order.status} />
                          <span className="text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <span className="text-gray-400">{items.length} producto{items.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">${order.total.toLocaleString('es-CO')}</span>
                          {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t dark:border-gray-700 grid md:grid-cols-2 gap-6">
                              {/* Info envío */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Datos de entrega</h4>
                                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    <p><span className="font-medium">Nombre:</span> {shipping.name}</p>
                                    <p><span className="font-medium">Dirección:</span> {shipping.address}, {shipping.city}</p>
                                    <p><span className="font-medium">Teléfono:</span> {shipping.phone}</p>
                                    <p><span className="font-medium">Pago:</span> {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
                                  </div>
                                </div>

                                {canMarkReceived && (
                                  <button
                                    onClick={() => handleMarkReceived(order.id)}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60 transition-colors"
                                  >
                                    {isUpdating ? (
                                      <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                      <CheckCircle size={15} />
                                    )}
                                    Marcar como recibido
                                  </button>
                                )}
                              </div>

                              {/* Productos */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Productos</h4>
                                <div className="space-y-2">
                                  {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                      {item.image && (
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.quantity} × ${item.price.toLocaleString('es-CO')}</p>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                                        ${(item.quantity * item.price).toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 pt-3 border-t dark:border-gray-700 flex justify-between text-sm font-bold">
                                  <span className="text-gray-500">Total</span>
                                  <span className="text-green-600">${order.total.toLocaleString('es-CO')}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
            </div>
            )}

            {/* ── Sección Perfil ── */}
            {userSection === 'profile' && (
              <div className="space-y-4">

                {/* Datos personales */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <UserIcon size={18} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Datos personales</h2>
                      <p className="text-xs text-gray-400">Actualiza tu nombre y dirección de email</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <AnimatePresence>
                      {profileMsg && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-sm px-3 py-2 rounded-lg ${
                            profileMsg.type === 'ok'
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {profileMsg.text}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60 transition-colors"
                    >
                      {profileSaving && <Loader2 size={14} className="animate-spin" />}
                      Guardar cambios
                    </button>
                  </form>
                </div>

                {/* Cambiar contraseña */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Lock size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Cambiar contraseña</h2>
                      <p className="text-xs text-gray-400">Mínimo 6 caracteres</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña actual</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva contraseña</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 text-sm transition-colors ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="••••••••"
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                      )}
                    </div>

                    <AnimatePresence>
                      {passwordMsg && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-sm px-3 py-2 rounded-lg ${
                            passwordMsg.type === 'ok'
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {passwordMsg.text}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={passwordSaving || (!!confirmPassword && newPassword !== confirmPassword)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 transition-colors"
                    >
                      {passwordSaving && <Loader2 size={14} className="animate-spin" />}
                      Actualizar contraseña
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
