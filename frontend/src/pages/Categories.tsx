import React, { useState } from 'react';
import { products, categories } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Search, X } from 'lucide-react';

export const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [showFilters, setShowFilters] = useState(true);
  const { searchQuery, setSearchQuery, isDarkMode } = useStore();
  const isDark = isDarkMode;

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesPrice = product.price <= priceRange;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <div className={`min-h-screen pt-8 pb-16 ${isDark ? 'bg-surface-deep' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="section-label">Catálogo</span>
          <h1 className={`font-display text-3xl md:text-4xl font-bold mt-1 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
            Todos los productos
          </h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar Filters ── */}
          <aside className="w-full md:w-60 flex-shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl mb-4 border text-sm font-medium
                ${isDark ? 'border-white/10 bg-surface text-cream' : 'border-gray-200 bg-white text-gray-700'}`}
            >
              <span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filtros</span>
              {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
            </button>

            <motion.div
              animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
              className={`overflow-hidden md:overflow-visible md:opacity-100 md:h-auto`}
            >
              <div className={`p-5 rounded-2xl border space-y-6
                ${isDark ? 'bg-surface border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>

                {/* Search */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-3 block ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    Buscar
                  </label>
                  <div className="relative">
                    <Search size={14} className={`absolute left-3 top-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-primary-500
                        ${isDark ? 'bg-surface-light border-white/10 text-cream placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-3 block ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    Categorías
                  </label>
                  <div className="space-y-1">
                    {[{ id: '', name: 'Todas' }, ...categories].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                          ${selectedCategory === category.id
                            ? 'bg-primary-600 text-white shadow-emerald-sm'
                            : isDark
                              ? 'text-cream/60 hover:text-cream hover:bg-white/5'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    <span>Precio máximo</span>
                    <span className={`text-primary-400 text-xs font-semibold normal-case tracking-normal`}>
                      ${priceRange.toLocaleString('es-CO')}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-primary-500 cursor-pointer"
                    style={{ accentColor: '#22c55e' }}
                  />
                  <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    <span>$0</span>
                    <span>$50,000</span>
                  </div>
                </div>

                {/* Reset */}
                {(selectedCategory || priceRange < 50000 || searchQuery) && (
                  <button
                    onClick={() => { setSelectedCategory(''); setPriceRange(50000); setSearchQuery(''); }}
                    className="w-full text-center text-xs text-primary-400 hover:text-primary-300 transition-colors py-1"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </motion.div>
          </aside>

          {/* ── Products Grid ── */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 gap-4 text-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                  ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  🥬
                </div>
                <p className={`font-display text-lg font-semibold ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                  Sin resultados
                </p>
                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  No hay productos con los filtros seleccionados.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};