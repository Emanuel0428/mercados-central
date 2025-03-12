import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

// Tipos para los datos del backend
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  email?: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

export const Account = () => {
  const { user, setUser, logout } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stock' | 'orders' | 'stats'>('stock');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/account', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then((data) => {
        if (!user || user.email !== data.email) {
          setUser({ email: data.email, role: data.role });
        }
      })
      .catch(() => {
        logout();
        localStorage.removeItem('token');
        navigate('/login');
      });

    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user, setUser, logout, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!productsRes.ok || !ordersRes.ok) throw new Error('Error al cargar datos');

      const productsData: Product[] = await productsRes.json();
      const ordersData: Order[] = await ordersRes.json();

      setProducts(productsData);
      setOrders(ordersData);

      const itemsPromises = ordersData.map((order) =>
        fetch(`http://localhost:5000/api/admin/orders/${order.id}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
          if (!res.ok) throw new Error(`Error al cargar ítems de la orden ${order.id}`);
          return res.json();
        })
      );

      const itemsData = await Promise.all(itemsPromises);
      const itemsMap: Record<number, OrderItem[]> = {};
      ordersData.forEach((order, index) => {
        itemsMap[order.id] = itemsData[index];
      });
      setOrderItems(itemsMap);
    } catch (err) {
      setError('No se pudieron cargar los datos del administrador. Intenta de nuevo.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
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
        <p className="text-gray-600 dark:text-gray-300">Por favor, inicia sesión para ver tu cuenta.</p>
        <Link to="/login" className="mt-4 inline-block btn-primary">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Cargando...</div>;
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-red-600 dark:text-red-400">{error}</p>
      <button onClick={fetchAdminData} className="mt-4 btn-primary">Reintentar</button>
    </div>
  );

  // Estadísticas adicionales
  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

  // Datos para gráficos
  const salesByCategory = products.reduce((acc, product) => {
    const items = Object.values(orderItems).flat().filter((item) => item.product_id === product.id);
    const sales = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    acc[product.category] = (acc[product.category] || 0) + sales;
    return acc;
  }, {} as Record<string, number>);

  const barData = {
    labels: Object.keys(salesByCategory),
    datasets: [{
      label: 'Ventas por Categoría ($)',
      data: Object.values(salesByCategory),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const last7DaysSales = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const daySales = orders
      .filter((o) => new Date(o.created_at).toDateString() === date.toDateString())
      .reduce((acc, o) => acc + o.total, 0);
    return { date: date.toLocaleDateString(), sales: daySales };
  }).reverse();

  const lineData = {
    labels: last7DaysSales.map((d) => d.date),
    datasets: [{
      label: 'Ventas Diarias ($)',
      data: last7DaysSales.map((d) => d.sales),
      borderColor: 'rgba(54, 162, 235, 1)',
      fill: false,
    }],
  };

  const topProducts = Object.values(orderItems)
    .flat()
    .reduce((acc: Record<string, number>, item) => {
      acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
      return acc;
    }, {});
  const sortedTopProducts = Object.entries(topProducts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const pieData = {
    labels: sortedTopProducts.map((p) => p.name),
    datasets: [{
      label: 'Unidades Vendidas',
      data: sortedTopProducts.map((p) => topProducts[p.id]),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
    }],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 mb-6">
          <ArrowLeft className="mr-2" size={20} />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Mi Cuenta</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Bienvenido, {user.email}</p>

        {user.role === 'admin' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Panel de Administrador</h2>
            <div className="flex space-x-4 mb-6">
              <button onClick={() => setActiveTab('stock')} className={`py-2 px-4 rounded ${activeTab === 'stock' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                Stock
              </button>
              <button onClick={() => setActiveTab('orders')} className={`py-2 px-4 rounded ${activeTab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                Órdenes
              </button>
              <button onClick={() => setActiveTab('stats')} className={`py-2 px-4 rounded ${activeTab === 'stats' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                Estadísticas
              </button>
            </div>

            {activeTab === 'stock' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Inventario de Productos</h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-2">Producto</th>
                      <th className="p-2">Categoría</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b dark:border-gray-700">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2">{product.stock}</td>
                        <td className="p-2">${product.price.toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Órdenes</h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-2">ID</th>
                      <th className="p-2">Usuario</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b dark:border-gray-700">
                        <td className="p-2">{order.id}</td>
                        <td className="p-2">{order.email || 'Anónimo'}</td>
                        <td className="p-2">${order.total.toFixed(2)}</td>
                        <td className="p-2">{order.status}</td>
                        <td className="p-2">{new Date(order.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <p className="text-gray-600 dark:text-gray-300">Ventas Totales</p>
                    <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <p className="text-gray-600 dark:text-gray-300">Órdenes Totales</p>
                    <p className="text-2xl font-bold">{totalOrders}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <p className="text-gray-600 dark:text-gray-300">Productos en Stock</p>
                    <p className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.stock, 0)}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <p className="text-gray-600 dark:text-gray-300">Productos con Bajo Stock</p>
                    <p className="text-2xl font-bold">{lowStockProducts}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <p className="text-gray-600 dark:text-gray-300">Órdenes Pendientes</p>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <p className="text-gray-600 dark:text-gray-300">Ingreso Promedio por Orden</p>
                    <p className="text-2xl font-bold">${avgOrderValue}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-semibold mb-2">Ventas por Categoría</h4>
                    <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                  </div>
                  <div>
                    <h4 className="text-md font-semibold mb-2">Ventas Diarias (Últimos 7 días)</h4>
                    <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                  </div>
                  <div>
                    <h4 className="text-md font-semibold mb-2">Productos Más Vendidos</h4>
                    <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Panel de Usuario</h2>
            <p className="text-gray-600 dark:text-gray-300">Aquí puedes ver tus pedidos y datos personales.</p>
          </div>
        )}

        <button onClick={handleLogout} className="mt-6 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center gap-2">
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </motion.div>
    </div>
  );
};