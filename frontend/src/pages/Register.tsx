import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Leaf, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useStore();

  if (user) return <Navigate to="/account" replace />;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) throw new Error('Error al registrarse');
      navigate('/login');
    } catch (error) {
      console.log(error);
      setError('No se pudo completar el registro. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-deep">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1200"
          alt="Frutas frescas"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/35 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">Mercados Central</span>
          </div>
          <p className="font-display text-2xl text-white/90 italic leading-snug">
            "Únete a miles de familias<br />que confían en nosotros."
          </p>
          <div className="flex items-center gap-3 mt-4">
            {['🥑', '🍎', '🥦', '🫐', '🥕'].map((emoji, i) => (
              <span
                key={i}
                className="text-2xl animate-on-load"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 text-sm mb-10 transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          {/* Logo (mobile) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-emerald-sm">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-cream">Mercados <span className="text-primary-400">Central</span></span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-cream mb-2">Crear tu cuenta</h1>
            <p className="text-white/40 text-sm">Regístrate gratis y empieza a comprar hoy</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              ⚠ {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              <UserPlus size={18} />
              Crear cuenta
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};