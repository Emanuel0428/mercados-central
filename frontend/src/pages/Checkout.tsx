import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2, CheckCircle, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

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

const paymentOptions = [
  { value: 'cash' as const, label: 'Efectivo', icon: <Banknote size={18} /> },
  { value: 'card' as const, label: 'Tarjeta', icon: <CreditCard size={18} /> },
  { value: 'transfer' as const, label: 'Transferencia', icon: <ArrowRightLeft size={18} /> },
];

export const Checkout = () => {
  const { cart, removeFromCart, updateQuantity, user, isDarkMode } = useStore();
  const isDark = isDarkMode;
  const navigate = useNavigate();
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({ name: '', address: '', city: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const shipping = 5000;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (!shippingDetails.name || !shippingDetails.address || !shippingDetails.city || !shippingDetails.phone) {
      alert('Por favor, completa todos los datos de envío.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart, shippingDetails, paymentMethod }),
      });
      if (!response.ok) throw new Error('Error al procesar la orden');
      const data = await response.json();
      setOrderDetails(data);
      cart.forEach((item) => removeFromCart(item.id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Hubo un problema al procesar tu compra.');
    }
  };

  /* ── Empty cart ── */
  if (!cart.length && !orderDetails) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-surface-deep' : 'bg-gray-50'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-4xl
            ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            🛒
          </div>
          <h2 className={`font-display text-2xl font-bold ${isDark ? 'text-cream' : 'text-gray-900'}`}>Tu carrito está vacío</h2>
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Agrega productos antes de finalizar tu compra</p>
          <Link to="/categories" className="btn-primary inline-flex">Ver productos</Link>
        </motion.div>
      </div>
    );
  }

  /* ── Order confirmation ── */
  if (orderDetails) {
    return (
      <div className={`min-h-screen py-16 ${isDark ? 'bg-surface-deep' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {/* Success header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary-600/15 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-primary-400" />
              </div>
              <h1 className={`font-display text-3xl font-bold ${isDark ? 'text-cream' : 'text-gray-900'}`}>¡Orden confirmada!</h1>
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                Orden #{orderDetails.orderId} · {new Date(orderDetails.createdAt).toLocaleString('es-CO')}
              </p>
            </div>

            {/* Receipt card */}
            <div className={`rounded-2xl border p-6 space-y-5 ${isDark ? 'bg-surface border-white/8' : 'bg-white border-gray-200 shadow-sm'}`}>
              {/* Customer info */}
              <div className={`pb-5 border-b space-y-2 text-sm ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
                {[
                  { label: 'Cliente', value: `${orderDetails.shippingDetails.name} (${orderDetails.email})` },
                  { label: 'Dirección', value: `${orderDetails.shippingDetails.address}, ${orderDetails.shippingDetails.city}` },
                  { label: 'Teléfono', value: orderDetails.shippingDetails.phone },
                  { label: 'Pago', value: orderDetails.paymentMethod === 'cash' ? 'Efectivo' : orderDetails.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className={`w-20 flex-shrink-0 font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{label}</span>
                    <span className={isDark ? 'text-cream/80' : 'text-gray-700'}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Items table */}
              <div>
                <h3 className={`font-display text-base font-semibold mb-3 ${isDark ? 'text-cream' : 'text-gray-900'}`}>Detalle de compra</h3>
                <div className="space-y-2">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between text-sm py-2 border-b last:border-0
                      ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
                      <span className={isDark ? 'text-cream/80' : 'text-gray-700'}>{item.name}</span>
                      <span className={isDark ? 'text-white/40' : 'text-gray-400'}>{item.quantity} × ${item.price.toLocaleString('es-CO')}</span>
                      <span className="font-semibold text-primary-400">${(item.quantity * item.price).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between items-center mt-4 pt-4 border-t font-bold
                  ${isDark ? 'border-white/10 text-cream' : 'border-gray-200 text-gray-900'}`}>
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-xl text-primary-400">${orderDetails.total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            <Link to="/" className="btn-primary w-full text-center py-3.5">Volver al inicio</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Main checkout ── */
  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-surface-deep' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 mb-8 text-sm transition-colors ${isDark ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}>
            <ArrowLeft size={16} /> Volver
          </button>

          <div className="mb-8">
            <span className="section-label">Última etapa</span>
            <h1 className={`font-display text-3xl md:text-4xl font-bold mt-1 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
              Finalizar compra
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Cart items (left, 3 cols) ── */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className={`font-display text-xl font-semibold mb-2 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                Tu carrito
              </h2>

              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border
                      ${isDark ? 'bg-surface border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}
                  >
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold truncate ${isDark ? 'text-cream' : 'text-gray-900'}`}>{item.name}</h3>
                      <p className="text-primary-400 text-sm font-bold mt-0.5">${item.price.toLocaleString('es-CO')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${isDark ? 'border-white/10 bg-surface-light' : 'border-gray-200 bg-gray-50'}`}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className={`w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-30 transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-700'}`}><Minus size={13} /></button>
                        <span className={`text-sm font-semibold w-5 text-center ${isDark ? 'text-cream' : 'text-gray-800'}`}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-md flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white transition-colors"><Plus size={13} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <span className={`text-sm font-semibold min-w-[70px] text-right ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                      ${(item.price * item.quantity).toLocaleString('es-CO')}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Order summary + form (right, 2 cols) ── */}
            <div className="lg:col-span-2">
              <div className={`rounded-2xl border p-6 space-y-6 sticky top-20
                ${isDark ? 'bg-surface border-white/8' : 'bg-white border-gray-200 shadow-sm'}`}>

                {/* Summary */}
                <div>
                  <h2 className={`font-display text-lg font-semibold mb-4 ${isDark ? 'text-cream' : 'text-gray-900'}`}>Resumen</h2>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Subtotal', val: `$${subtotal.toLocaleString('es-CO')}` },
                      { label: 'Envío', val: `$${shipping.toLocaleString('es-CO')}` },
                    ].map(({ label, val }) => (
                      <div key={label} className={`flex justify-between ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        <span>{label}</span><span>{val}</span>
                      </div>
                    ))}
                    <div className={`flex justify-between pt-3 border-t font-bold ${isDark ? 'border-white/10 text-cream' : 'border-gray-100 text-gray-900'}`}>
                      <span className="font-display">Total</span>
                      <span className="font-display text-lg text-primary-400">${total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping form */}
                <div>
                  <h3 className={`font-display text-base font-semibold mb-4 ${isDark ? 'text-cream' : 'text-gray-900'}`}>Datos de envío</h3>
                  <div className="space-y-3">
                    {[
                      { placeholder: 'Nombre completo', key: 'name', type: 'text' },
                      { placeholder: 'Dirección', key: 'address', type: 'text' },
                      { placeholder: 'Ciudad', key: 'city', type: 'text' },
                      { placeholder: 'Teléfono', key: 'phone', type: 'tel' },
                    ].map(({ placeholder, key, type }) => (
                      <input
                        key={key}
                        type={type}
                        placeholder={placeholder}
                        value={shippingDetails[key as keyof ShippingDetails]}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, [key]: e.target.value })}
                        className={isDark ? 'input-field' : 'input-field-light'}
                      />
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <h3 className={`font-display text-base font-semibold mb-3 ${isDark ? 'text-cream' : 'text-gray-900'}`}>Método de pago</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentOptions.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => setPaymentMethod(value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all duration-150
                          ${paymentMethod === value
                            ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                            : isDark
                              ? 'border-white/10 bg-white/3 text-white/50 hover:border-white/20'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full py-4 text-base"
                >
                  <ShoppingCart size={18} />
                  Confirmar compra
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};