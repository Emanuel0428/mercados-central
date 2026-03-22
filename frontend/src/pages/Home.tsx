import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Truck, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { promotions, Promotion } from '../data/promotions';
import { ProductCard } from '../components/ProductCard';
import Footer from '../components/Footer';
import { useStore } from '../store/useStore';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.12 } } },
  item: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } },
};

export const Home: React.FC = () => {
  const featuredProducts = products.slice(0, 3);
  const { isDarkMode } = useStore();
  const isDark = isDarkMode;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
      carouselRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }
  };

  const perView = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1) : 3;

  const features = [
    { icon: <Truck size={22} />, title: 'Entrega el mismo día', desc: 'En tu zona sin costo adicional' },
    { icon: <Shield size={22} />, title: 'Calidad garantizada', desc: 'Control estricto de frescura' },
    { icon: <Star size={22} />, title: 'Productos de temporada', desc: 'Lo mejor de cada estación' },
  ];

  return (
    <>
      <div className={isDark ? 'bg-surface-deep' : 'bg-gray-50'}>

        {/* ── Hero ── */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden">
          {/* BG image + overlays */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600"
              alt="Fresh produce"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Decorative radial glow */}
          <div
            className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32">
            <motion.div
              variants={stagger.container}
              initial="hidden"
              animate="show"
              className="max-w-2xl"
            >
              <motion.span variants={stagger.item} className="section-label inline-flex items-center gap-2 mb-4">
                <Sparkles size={13} />
                Mercado Premium en Envigado
              </motion.span>

              <motion.h1
                variants={stagger.item}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
              >
                Sabor fresco,{' '}
                <span className="text-gradient-emerald italic">siempre</span>
              </motion.h1>

              <motion.p
                variants={stagger.item}
                className="text-lg text-white/70 leading-relaxed mb-10 max-w-lg"
              >
                Descubre nuestra selección de productos frescos y de alta calidad.
                Entregamos el mismo día directo a tu hogar en Envigado y alrededores.
              </motion.p>

              <motion.div variants={stagger.item} className="flex flex-wrap gap-4">
                <Link to="/categories" className="btn-primary text-base px-8 py-3.5">
                  Explorar productos
                  <ChevronRight size={18} />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium
                    text-white/80 border border-white/20 hover:border-white/40 hover:bg-white/5
                    transition-all duration-200"
                >
                  Ver ofertas
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30"
          >
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          </motion.div>
        </section>

        {/* ── Feature strip ── */}
        <section className={`border-y ${isDark ? 'border-white/5 bg-surface' : 'border-gray-100 bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map(({ icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-4 p-4"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isDark ? 'bg-primary-600/15 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
                    {icon}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-cream' : 'text-gray-900'}`}>{title}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <span className="section-label">Selección del día</span>
              <h2 className={`font-display text-3xl md:text-4xl font-bold mt-1 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                Productos Destacados
              </h2>
            </div>
            <Link
              to="/categories"
              className={`hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors`}
            >
              Ver todos <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link to="/categories" className="btn-primary">
              Ver todos los productos
            </Link>
          </div>
        </section>

        {/* ── Promotions Carousel ── */}
        <section className={`py-16 ${isDark ? 'bg-surface' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <span className="section-label">Esta semana</span>
                <h2 className={`font-display text-3xl md:text-4xl font-bold mt-1 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                  Ofertas Especiales
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${isDark ? 'bg-surface-light border-white/10 text-cream hover:border-primary-500/40' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400'}`}
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollToIndex(Math.min(promotions.length - perView, currentIndex + 1))}
                  disabled={currentIndex >= promotions.length - perView}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${isDark ? 'bg-surface-light border-white/10 text-cream hover:border-primary-500/40' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400'}`}
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory gap-5 pb-4"
            >
              {promotions.map((promo: Promotion, index: number) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex-none w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] snap-start"
                >
                  <Link to={promo.link} className="group block h-full">
                    <div className={`rounded-2xl overflow-hidden border h-full transition-all duration-300 group-hover:shadow-card-hover
                      ${isDark ? 'bg-surface border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        <img
                          src={promo.image}
                          alt={promo.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute top-3 left-3 badge badge-gold text-[11px]">Oferta</span>
                      </div>
                      <div className="p-5">
                        <h3 className={`font-display text-lg font-semibold mb-1.5 ${isDark ? 'text-cream' : 'text-gray-900'}`}>
                          {promo.title}
                        </h3>
                        <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                          {promo.description}
                        </p>
                        <span className="text-primary-400 text-sm font-medium group-hover:underline">
                          Ver oferta →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center mt-6 gap-2">
              {promotions.map((_, index: number) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    currentIndex === index
                      ? 'bg-primary-500 w-5 h-2'
                      : isDark ? 'bg-white/20 w-2 h-2 hover:bg-white/40' : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};