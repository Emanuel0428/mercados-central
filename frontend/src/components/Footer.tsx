import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Phone, Clock, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface-deep border-t border-white/5 text-cream/70">
      {/* Top strip */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-emerald-sm">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-cream">
              Mercados <span className="text-primary-400">Central</span>
            </span>
          </Link>
          <p className="text-sm text-white/40 text-center sm:text-right max-w-xs">
            Productos frescos y de alta calidad, entregados el mismo día en tu zona.
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-cream">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Las Flores, Envigado, Colombia</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={15} className="text-primary-400 flex-shrink-0" />
                <span>+57 312 345 6789</span>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-cream">Horarios</h3>
            <ul className="space-y-2 text-sm">
              {[
                { day: 'Lunes – Viernes', hours: '8:00 – 20:00' },
                { day: 'Sábado', hours: '9:00 – 19:30' },
                { day: 'Domingo', hours: 'Cerrado' },
              ].map(({ day, hours }) => (
                <li key={day} className="flex items-center gap-2">
                  <Clock size={14} className="text-primary-400 flex-shrink-0" />
                  <span className="text-white/50">{day}:</span>
                  <span className={hours === 'Cerrado' ? 'text-red-400' : 'text-cream/80'}>{hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sobre Nosotros */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-cream">Sobre Nosotros</h3>
            <p className="text-sm leading-relaxed">
              Supermercado especializado en productos frescos y orgánicos de la región de Antioquia.
              Comprometidos con la calidad y el servicio.
            </p>
          </div>

          {/* Redes & Links */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-semibold text-cream">Síguenos</h3>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: 'Instagram', href: '#' },
                { Icon: Facebook, label: 'Facebook', href: '#' },
                { Icon: Twitter, label: 'Twitter', href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary-600/20 border border-white/10 hover:border-primary-500/40
                    flex items-center justify-center text-white/50 hover:text-primary-400
                    transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <Link to="/categories" className="block text-white/50 hover:text-primary-400 transition-colors">Ver productos</Link>
              <Link to="/contact" className="block text-white/50 hover:text-primary-400 transition-colors">Contáctanos</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Mercados Central. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/20">
            Envigado, Antioquia — Colombia 🇨🇴
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;