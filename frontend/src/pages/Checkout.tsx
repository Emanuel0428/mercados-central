import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface OrderDetails {
  orderId: number;
  total: number;
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  email: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: number }[];
}

export const Checkout = () => {
  const { cart, removeFromCart, updateQuantity, user } = useStore();
  const navigate = useNavigate();
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({ name: '', address: '', city: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const total = cart.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!shippingDetails.name || !shippingDetails.address || !shippingDetails.city || !shippingDetails.phone) {
      alert('Por favor, completa todos los datos de envío.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart, shippingDetails, paymentMethod }),
      });
      if (!response.ok) throw new Error('Error al procesar la orden');
      const data = await response.json();
      setOrderDetails(data);
      cart.forEach((item) => removeFromCart(item.id)); // Limpiar carrito
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Hubo un problema al procesar tu compra.');
    }
  };

  if (!cart.length && !orderDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Finalizar Compra</h1>
        <p className="text-gray-600 dark:text-gray-300">El carrito está vacío.</p>
        <Link to="/categories" className="mt-4 inline-block btn-primary">Volver a comprar</Link>
      </div>
    );
  }

  if (orderDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Factura de Compra</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p><strong>Orden #:</strong> {orderDetails.orderId}</p>
            <p><strong>Cliente:</strong> {orderDetails.shippingDetails.name} ({orderDetails.email})</p>
            <p><strong>Dirección:</strong> {orderDetails.shippingDetails.address}, {orderDetails.shippingDetails.city}</p>
            <p><strong>Teléfono:</strong> {orderDetails.shippingDetails.phone}</p>
            <p><strong>Método de Pago:</strong> {orderDetails.paymentMethod === 'cash' ? 'Efectivo' : orderDetails.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}</p>
            <p><strong>Fecha:</strong> {new Date(orderDetails.createdAt).toLocaleString()}</p>
            <h3 className="text-lg font-semibold mt-4 mb-2">Detalles de la Compra</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2">Producto</th>
                  <th className="p-2">Cantidad</th>
                  <th className="p-2">Precio</th>
                  <th className="p-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items.map((item) => (
                  <tr key={item.id} className="border-b dark:border-gray-700">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">${item.price.toLocaleString('es-CO')}</td>
                    <td className="p-2">${(item.quantity * item.price).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-lg font-bold">Total: ${orderDetails.total.toLocaleString('es-CO')}</p>
            <Link to="/" className="mt-4 inline-block btn-primary">Volver al inicio</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 mb-6">
          <ArrowLeft className="mr-2" size={20} />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Finalizar Compra</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tu Carrito</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">${item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Resumen</h2>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">Subtotal: ${total}</p>
                <p className="text-gray-600 dark:text-gray-300">Envío: $5.00</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">Total: ${(parseFloat(total) + 5).toFixed(2)}</p>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6 mb-2">Datos de Envío</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={shippingDetails.name}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={shippingDetails.city}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={shippingDetails.phone}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />

                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-6 mb-2">Método de Pago</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="accent-green-600" />
                    Efectivo
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-green-600" />
                    Tarjeta
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="accent-green-600" />
                    Transferencia
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2 mt-4"
                >
                  <ShoppingCart size={20} />
                  Confirmar compra
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};