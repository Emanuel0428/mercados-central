import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, Menu, X, Trash2, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, isCartOpen, toggleCart, isDarkMode, toggleDarkMode, removeFromCart, searchQuery, setSearchQuery, user } = useStore();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                Mercados Mi Punto
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-64 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>

            <Link to="/categories" className="text-gray-600 dark:text-gray-200 hover:text-green-600">
              Categorías
            </Link>
            <Link to={user ? '/account' : '/login'} className="text-gray-600 dark:text-gray-200 hover:text-green-600 flex items-center gap-2">
              <User size={20} />
              {user ? 'Mi Cuenta' : 'Iniciar Sesión'}
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-200 hover:text-green-600">
              Contacto
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Carrito desplegable */}
            {isCartOpen && (
              <div className="absolute right-0 top-16 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50">
                {cart.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">El carrito está vacío</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <div className="flex-1">
                          <span className="text-gray-800 dark:text-white">{item.name}</span>
                          <span className="block text-gray-600 dark:text-gray-300 text-sm">
                            {item.quantity} x ${item.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <div className="mt-4">
                      <p className="text-gray-800 dark:text-white font-bold">
                        Total: ${cart.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2)}
                      </p>
                      <Link
                        to="/checkout"
                        className="mt-2 block text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        onClick={toggleCart}
                      >
                        Proceder al pago
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="relative px-3 mb-3">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-6 top-2.5 text-gray-400" size={20} />
            </div>
            <Link
              to="/categories"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Categorías
            </Link>
            <Link
              to={user ? '/account' : '/login'}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {user ? 'Mi Cuenta' : 'Iniciar Sesión'}
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Contacto
            </Link>
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
            <button
              onClick={toggleCart}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Carrito ({totalItems})
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};