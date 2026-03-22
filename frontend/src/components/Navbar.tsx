import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, Menu, X, Trash2, User, Leaf, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { cart, isCartOpen, toggleCart, isDarkMode, toggleDarkMode, removeFromCart, updateQuantity, searchQuery, setSearchQuery, user } = useStore();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const navRef = useRef<HTMLElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isDark = isDarkMode;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isDark ? 'glass' : 'glass-light'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg
                ${isDark ? 'bg-primary-600' : 'bg-primary-600'} 
                shadow-emerald-sm group-hover:shadow-emerald-glow transition-shadow duration-300`}>
                <Leaf size={16} className="text-white" />
              </div>
              <span className={`font-display text-xl font-bold tracking-tight
                ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                Mercados
                <span className="text-primary-500 ml-1">Central</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search */}
              <div className={`relative flex items-center transition-all duration-300 ${
                isSearchFocused ? 'w-72' : 'w-56'
              }`}>
                <Search
                  size={16}
                  className={`absolute left-3 transition-colors duration-200 ${
                    isSearchFocused ? 'text-primary-400' : isDark ? 'text-white/30' : 'text-gray-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${isDark
                      ? 'bg-white/5 border-white/10 text-cream placeholder-white/30 focus:bg-white/10'
                      : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white'
                    }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>

              {/* Nav links */}
              {[
                { to: '/categories', label: 'Categorías' },
                { to: user ? '/account' : '/login', label: user ? user.name || 'Mi Cuenta' : 'Iniciar Sesión', icon: <User size={15} /> },
                { to: '/contact', label: 'Contacto' },
              ].map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isDark
                      ? 'text-cream/70 hover:text-cream hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {icon}
                  {label}
                </Link>
              ))}

              {/* Dark mode */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-150 ${
                  isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Cart button */}
              <button
                onClick={toggleCart}
                className={`relative p-2 rounded-lg transition-all duration-150 ${
                  isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle cart"
              >
                <ShoppingCart size={18} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-emerald-sm"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-1">
              <button onClick={toggleCart} className={`relative p-2 rounded-lg ${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`md:hidden border-t overflow-hidden ${isDark ? 'border-white/10 bg-surface/95' : 'border-gray-200 bg-white/95'}`}
              style={{ backdropFilter: 'blur(16px)' }}
            >
              <div className="px-4 py-4 space-y-1">
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${isDark ? 'bg-white/5 border-white/10 text-cream placeholder-white/30' : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {[
                  { to: '/categories', label: 'Categorías' },
                  { to: user ? '/account' : '/login', label: user ? 'Mi Cuenta' : 'Iniciar Sesión' },
                  { to: '/contact', label: 'Contacto' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isDark ? 'text-cream/70 hover:text-cream hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={toggleDarkMode}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isDark ? 'text-cream/70 hover:text-cream hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleCart}
              className="fixed inset-0 bg-black/60 z-40"
              style={{ backdropFilter: 'blur(4px)' }}
            />

            {/* Drawer */}
            <motion.aside
              key="cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col shadow-2xl
                ${isDark ? 'bg-surface border-l border-white/10' : 'bg-white border-l border-gray-200'}`}
            >
              {/* Drawer header */}
              <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-primary-400" />
                  <span className={`font-display text-lg font-semibold ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                    Tu Carrito
                  </span>
                  {totalItems > 0 && (
                    <span className="badge badge-emerald">{totalItems} items</span>
                  )}
                </div>
                <button
                  onClick={toggleCart}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <ShoppingCart size={28} className="text-primary-400 opacity-60" />
                    </div>
                    <div>
                      <p className={`font-display text-base font-semibold ${isDark ? 'text-cream' : 'text-gray-800'}`}>Carrito vacío</p>
                      <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Agrega productos para comenzar</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-cream' : 'text-gray-900'}`}>{item.name}</p>
                        <p className="text-primary-400 text-sm font-semibold">${(item.price * item.quantity).toLocaleString('es-CO')}</p>
                        {/* Qty controls */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-colors disabled:opacity-30
                              ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className={`text-xs font-medium w-5 text-center ${isDark ? 'text-cream' : 'text-gray-700'}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-colors
                              ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className={`px-6 py-5 border-t ${isDark ? 'border-white/10 bg-surface-light' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Total</span>
                    <span className={`font-display text-xl font-bold ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                      ${cartTotal.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={toggleCart}
                    className="btn-primary w-full text-center"
                  >
                    <ShoppingCart size={18} />
                    Proceder al pago
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};