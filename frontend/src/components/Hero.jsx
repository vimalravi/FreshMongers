// frontend/src/components/Hero.jsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTruck, FiCheckCircle } from 'react-icons/fi';

const TRUST_PILLS = [
  { icon: '🌊', text: 'Daily fresh catch' },
  { icon: '🚚', text: 'Same-day delivery' },
  { icon: '✅', text: 'No middlemen' },
];

const FLOAT_ICONS = [
  { emoji: '🐟', x: '8%',  y: '25%', duration: 4.5 },
  { emoji: '🦐', x: '85%', y: '18%', duration: 5.5 },
  { emoji: '🦑', x: '75%', y: '65%', duration: 4.0 },
  { emoji: '🦀', x: '12%', y: '70%', duration: 6.0 },
  { emoji: '🐙', x: '50%', y: '10%', duration: 5.0 },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-hero-gradient">

      {/* Ambient radial overlays */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,102,204,0.07) 0%, transparent 70%),' +
            'radial-gradient(ellipse 50% 60% at 80% 30%, rgba(78,205,196,0.09) 0%, transparent 70%)',
        }}
      />

      {/* Floating emoji layer */}
      {FLOAT_ICONS.map((f, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl select-none pointer-events-none opacity-[0.07]"
          style={{ left: f.x, top: f.y }}
          animate={{ y: [0, -22, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: f.duration, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        >
          {f.emoji}
        </motion.span>
      ))}

      {/* Content grid */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-24">

        {/* ── Left column ── */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-7"
        >
          {/* Live badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white border border-border shadow-card px-4 py-2 rounded-pill"
          >
            <span className="freshness-dot fresh" />
            <span className="text-xs font-bold text-gray-700 tracking-wide">
              Fresh catch available now · Trivandrum
            </span>
          </motion.div>

          {/* Headline */}
          <div>
            <p className="label-section">Premium Seafood Delivery</p>
            <h1 className="font-display">
              <span className="block text-gray-900">Ocean Fresh,</span>
              <span className="text-shimmer block">To Your Door.</span>
            </h1>
          </div>

          {/* Sub */}
          <p className="text-base text-gray-500 leading-relaxed max-w-md">
            Premium quality fish sourced directly from Trivandrum's local fishermen — cleaned, packed hygienically, and delivered fast. No middlemen. Just freshness.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-2">
            {TRUST_PILLS.map((p) => (
              <span key={p.text} className="inline-flex items-center gap-1.5 bg-white border border-border rounded-pill px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                {p.icon} {p.text}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link href="/products" className="btn btn-primary text-base px-7 py-3.5">
              Shop Fresh Fish <FiArrowRight size={16} />
            </Link>
            <Link href="/about" className="btn btn-secondary text-base px-7 py-3.5">
              How It Works
            </Link>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-8 pt-3 border-t border-border"
          >
            {[
              { val: '100%', label: 'Fresh Daily',       color: 'text-primary' },
              { val: '2h',   label: 'Avg. Delivery',     color: 'text-teal' },
              { val: '500+', label: 'Happy Customers',   color: 'text-coral' },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-2xl font-black font-display ${s.color}`}>{s.val}</p>
                <p className="text-2xs text-gray-400 mt-0.5 uppercase tracking-wide font-semibold">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right column ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
        >
          {/* Glow backdrop */}
          <div className="absolute w-72 h-72 md:w-88 md:h-88 rounded-full bg-gradient-to-br from-primary/20 to-teal/20 blur-3xl" />

          {/* Main visual card */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-88 lg:h-88">
            <div className="relative w-full h-full bg-white rounded-[2.5rem] shadow-float border border-border/60 flex items-center justify-center overflow-hidden">

              {/* Subtle inner pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-bg/50 via-transparent to-teal-bg/30" />
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(0,102,204,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
              />

              <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 text-[120px] select-none leading-none"
              >
                🐟
              </motion.div>

              {/* Top badge */}
              <div className="absolute top-4 right-4 bg-accent text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-pill shadow-accent/60 shadow-md tracking-wider uppercase">
                Today's Catch
              </div>

              {/* Bottom strip */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary to-teal p-3 text-center">
                <p className="text-white text-xs font-bold">Fresh · Hygienic · Delivered Fast</p>
              </div>
            </div>
          </div>

          {/* Floating mini-cards */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: 0.4, ease: 'easeInOut' }}
            className="absolute -left-4 lg:-left-8 top-10 bg-white rounded-xl shadow-card-hover px-4 py-3 border border-border"
          >
            <p className="text-2xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Today's Best</p>
            <p className="font-black text-primary text-sm font-display">Vanjaram ₹850/kg</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 1.1, ease: 'easeInOut' }}
            className="absolute -right-2 lg:-right-6 bottom-20 bg-white rounded-xl shadow-card-hover px-4 py-3 border border-border"
          >
            <p className="text-2xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Free Delivery</p>
            <p className="font-black text-teal text-sm font-display">Orders ₹500+</p>
          </motion.div>

          {/* Spinning offer badge */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-3 left-8 w-[72px] h-[72px] bg-accent rounded-full flex items-center justify-center shadow-accent"
          >
            <div className="text-center leading-tight">
              <p className="text-[8px] font-black text-gray-900 uppercase">Upto</p>
              <p className="text-xl font-black text-gray-900 font-display leading-none">30%</p>
              <p className="text-[8px] font-black text-gray-900 uppercase">Off</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10 wave-divider">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 64L48 56C96 48 192 32 288 26.7C384 21.3 480 26.7 576 32C672 37.3 768 42.7 864 37.3C960 32 1056 16 1152 10.7C1248 5.3 1344 10.7 1392 13.3L1440 16V64H0Z" fill="#f7f9fc"/>
        </svg>
      </div>
    </section>
  );
}
