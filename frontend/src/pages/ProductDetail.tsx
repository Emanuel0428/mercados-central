import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2, Tag, Package, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import { useStore } from '../store/useStore';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, updateQuantity, removeFromCart, isDarkMode } = useStore();
  const isDark = isDarkMode;

  const product = products.find((p) => p.id === id);
  const cartItem = cart.find((item) => item.id === id);

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-surface-deep' : 'bg-gray-50'}`}>
        <div className="text-center space-y-4">
          <div className="text-5xl">🥬</div>
          <p className={`font-display text-xl ${isDark ? 'text-cream' : 'text-gray-800'}`}>Producto no encontrado</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-surface-deep' : 'bg-gray-50'}`}>

      {/* Breadcrumb */}
      <div className={`border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs">
          <button
            onClick={() => navigate('/categories')}
            className={`flex items-center gap-1 transition-colors ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Categorías
          </button>
          <ChevronRight size={12} className={isDark ? 'text-white/20' : 'text-gray-300'} />
          <span className={`capitalize ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{product.category}</span>
          <ChevronRight size={12} className={isDark ? 'text-white/20' : 'text-gray-300'} />
          <span className={`font-medium truncate max-w-[160px] ${isDark ? 'text-cream/80' : 'text-gray-700'}`}>{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-8 text-sm font-medium transition-colors
            ${isDark ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <ArrowLeft size={16} /> Volver
        </button>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            </div>
            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="badge badge-emerald flex items-center gap-1 text-xs">
                <Tag size={11} /> {product.category}
              </span>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div>
              <h1 className={`font-display text-4xl lg:text-5xl font-bold leading-tight mb-4 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                {product.name}
              </h1>
              <p className="font-display text-3xl font-bold text-primary-400">
                ${product.price.toLocaleString('es-CO')}
              </p>
            </div>

            <p className={`text-base leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              {product.description}
            </p>

            {/* Meta */}
            <div className={`flex items-center gap-6 py-4 border-y text-sm ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Package size={15} className="text-primary-400" />
                <span className={isDark ? 'text-white/50' : 'text-gray-500'}>
                  Stock: <span className="font-semibold text-primary-400">{product.stock}</span>
                </span>
              </div>
              <div className={`capitalize text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                Cat: <span className={`font-medium ${isDark ? 'text-cream/80' : 'text-gray-700'}`}>{product.category}</span>
              </div>
            </div>

            {/* Cart controls */}
            {cartItem ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex items-center gap-3 p-1 rounded-xl border ${isDark ? 'border-white/10 bg-surface' : 'border-gray-200 bg-gray-50'}`}>
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30
                      ${isDark ? 'hover:bg-white/10 text-cream' : 'hover:bg-gray-200 text-gray-700'}`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={`text-lg font-bold w-8 text-center ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= product.stock}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white transition-colors disabled:opacity-40"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={15} /> Quitar
                </button>
                <span className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                  Subtotal: <span className="text-primary-400 font-bold">${(cartItem.quantity * product.price).toLocaleString('es-CO')}</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => addToCart(product)}
                  className="btn-primary text-base px-8 py-3.5"
                >
                  <ShoppingCart size={20} />
                  Agregar al carrito
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <span className="section-label">Quizás te interese</span>
              <h2 className={`font-display text-2xl font-bold mt-1 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                Productos relacionados
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct, i) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};