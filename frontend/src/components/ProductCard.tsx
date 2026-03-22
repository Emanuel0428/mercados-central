import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Tag } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart, removeFromCart, updateQuantity, isDarkMode } = useStore();
  const cartItem = cart.find((item) => item.id === product.id);
  const isDark = isDarkMode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer"
      style={{
        background: isDark ? '#151c25' : '#ffffff',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,0,0,0.08)',
      }}
      whileHover={{
        y: -6,
        boxShadow: isDark
          ? '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.15)'
          : '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(34,197,94,0.2)',
      }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay (always present, intensifies on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium
            bg-black/40 text-white/90 backdrop-blur-sm border border-white/10">
            <Tag size={10} />
            {product.category}
          </span>
        </div>

        {/* Stock badge */}
        {product.stock < 10 && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/80 text-white backdrop-blur-sm">
              Últimas unidades
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-display text-base font-semibold mb-1 leading-snug line-clamp-1
            group-hover:text-primary-400 transition-colors duration-200
            ${isDark ? 'text-cream' : 'text-gray-900'}`}>
            {product.name}
          </h3>
        </Link>
        <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-primary-400">
            ${product.price.toLocaleString('es-CO')}
          </span>

          {cartItem ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                disabled={cartItem.quantity <= 1}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30
                  ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <Minus size={13} />
              </button>
              <span className={`text-sm font-semibold w-6 text-center ${isDark ? 'text-cream' : 'text-gray-800'}`}>
                {cartItem.quantity}
              </span>
              <button
                onClick={() => addToCart(product)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-primary-600 hover:bg-primary-500 text-white"
              >
                <Plus size={13} />
              </button>
              <button
                onClick={() => removeFromCart(product.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ml-0.5"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(product)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                bg-primary-600 hover:bg-primary-500 text-white transition-all duration-150
                shadow-emerald-sm hover:shadow-emerald-glow"
            >
              <ShoppingCart size={14} />
              Agregar
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};