import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { promotions, Promotion } from '../data/promotions';
import { ProductCard } from '../components/ProductCard';
import Footer from '../components/Footer';

export const Home: React.FC = () => {
  const featuredProducts = products.slice(0, 3); // Asegúrate de que products esté tipado en su archivo
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Función para mover el carrusel
  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * (carouselRef.current.offsetWidth / 3),
        behavior: 'smooth',
      });
    }
  };

  // Variantes para animaciones
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.03,
      transition: { duration: 0.2 }
    }
  };

  return (
    <><div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-r from-green-600 to-green-400">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"
            alt="Fresh produce"
            className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white max-w-2xl"
          >
            <h1 className="text-5xl font-bold mb-6">
              Productos frescos directo a tu hogar
            </h1>
            <p className="text-xl mb-8">
              Descubre nuestra selección de productos frescos y de alta calidad.
              Entrega el mismo día en tu zona.
            </p>
            <Link
              to="/categories"
              className="inline-flex items-center btn-secondary text-lg"
            >
              Ver ofertas
              <ChevronRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Productos Destacados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/categories" className="btn-primary">
            Ver todos los productos
          </Link>
        </div>
      </section>

      {/* Promotions Carousel */}
      <section className="bg-secondary/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Ofertas Especiales
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md disabled:opacity-50"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scrollToIndex(Math.min(promotions.length - 3, currentIndex + 1))}
                disabled={currentIndex >= promotions.length - 3}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md disabled:opacity-50"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={carouselRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              {promotions.map((promo: Promotion, index: number) => (
                <motion.div
                  key={promo.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                  className="flex-none w-full sm:w-1/2 lg:w-1/3 snap-start"
                >
                  <Link to={promo.link} className="block h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
                      <div className="relative">
                        <img
                          src={promo.image}
                          alt={promo.title}
                          className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                          {promo.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {promo.description}
                        </p>
                        <span className="mt-4 inline-block text-primary font-medium hover:underline">
                          Ver oferta →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {promotions.map((_, index: number) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-primary w-4' : 'bg-gray-300'}`}
                  aria-label={`Go to slide ${index + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div><Footer /></>
  );
};