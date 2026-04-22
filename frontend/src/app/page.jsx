// frontend/src/app/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import api from '@/utils/api';
import {
  FiTrendingUp, FiTruck, FiSmile, FiShield,
  FiArrowRight, FiStar, FiPhone,
} from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ─── Static data ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { name: 'Fin Fish',          emoji: '🐟', desc: 'Seer, Pomfret, Sardine & more',  href: '/products?category=fin-fish', color: 'from-blue-50 to-blue-100' },
  { name: 'Prawns',            emoji: '🦐', desc: 'Tiger, Vannamei & King Prawns',   href: '/products?category=prawns',   color: 'from-orange-50 to-orange-100' },
  { name: 'Crabs',             emoji: '🦀', desc: 'Mud Crab, Blue Crab & more',      href: '/products?category=crabs',    color: 'from-red-50 to-red-100' },
  { name: 'Squid & Cuttlefish',emoji: '🦑', desc: 'Fresh & cleaned',                 href: '/products?category=squid',    color: 'from-purple-50 to-purple-100' },
  { name: 'Dried Fish',        emoji: '🍤', desc: 'Sun-dried traditional varieties', href: '/products?category=dried',    color: 'from-yellow-50 to-yellow-100' },
  { name: 'Ready to Cook',     emoji: '🍳', desc: 'Marinated & cleaned cuts',         href: '/products?category=ready',    color: 'from-green-50 to-green-100' },
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Seer Fish (Vanjaram)',    category_name: 'Fin Fish', price_per_kg: 850, stock_kg: 5.5, is_available: true, avg_rating: 5, review_count: 42, freshness_status: 'very_fresh', image_url: null },
  { id: 2, name: 'Tiger Prawns',           category_name: 'Prawns',   price_per_kg: 650, stock_kg: 3.0, is_available: true, avg_rating: 4, review_count: 28, freshness_status: 'very_fresh', image_url: null },
  { id: 3, name: 'Pearl Spot (Karimeen)',  category_name: 'Fin Fish', price_per_kg: 700, stock_kg: 1.5, is_available: true, avg_rating: 5, review_count: 35, freshness_status: 'very_fresh', image_url: null },
  { id: 4, name: 'Pomfret (Avoli)',        category_name: 'Fin Fish', price_per_kg: 550, stock_kg: 4.0, is_available: true, avg_rating: 4, review_count: 19, freshness_status: 'fresh',      image_url: null },
  { id: 5, name: 'Mud Crab',              category_name: 'Crabs',    price_per_kg: 900, stock_kg: 2.0, is_available: true, avg_rating: 5, review_count: 22, freshness_status: 'very_fresh', image_url: null },
  { id: 6, name: 'Squid (Koonthal)',      category_name: 'Squid',    price_per_kg: 350, stock_kg: 6.0, is_available: true, avg_rating: 4, review_count: 15, freshness_status: 'fresh',      image_url: null },
  { id: 7, name: 'Sardine (Mathi)',       category_name: 'Fin Fish', price_per_kg: 120, stock_kg: 10.0,is_available: true, avg_rating: 4, review_count: 50, freshness_status: 'very_fresh', image_url: null },
  { id: 8, name: 'Mackerel (Ayala)',      category_name: 'Fin Fish', price_per_kg: 180, stock_kg: 8.0, is_available: true, avg_rating: 4, review_count: 33, freshness_status: 'fresh',      image_url: null },
];

const FEATURES = [
  { icon: FiTrendingUp, title: 'Premium Quality', desc: 'Handpicked daily catch from trusted Trivandrum fishermen',    grad: 'from-primary to-primary-light',   bg: 'bg-primary-bg' },
  { icon: FiTruck,      title: 'Same-Day Delivery', desc: 'Order before 10 AM for same-day delivery to your doorstep', grad: 'from-teal to-teal-dark',           bg: 'bg-teal-bg'    },
  { icon: FiSmile,      title: 'Fair Pricing',    desc: 'Direct from fishermen — no middlemen, better prices',          grad: 'from-accent to-accent-dark',       bg: 'bg-accent-bg'  },
  { icon: FiShield,     title: 'Safe & Hygienic', desc: 'Cleaned, packed & delivered in hygienic conditions',           grad: 'from-coral to-coral-light',        bg: 'bg-coral-bg'   },
];

const TESTIMONIALS = [
  { name: 'Anjali M.', role: 'Regular Customer', text: 'FreshMongers never disappoints! The fish is always fresh, and delivery is super quick. Best seafood service in Trivandrum!', rating: 5, emoji: '👩' },
  { name: 'Ramesh K.', role: 'Loyal Customer',   text: 'Hygienic, reliable, and convenient. Perfect for busy households. I especially love the Vanjaram — always top quality.',       rating: 5, emoji: '👨' },
  { name: 'Priya S.', role: 'Happy Shopper',     text: 'I can\'t imagine going back to regular shopping. They have everything I need and the WhatsApp ordering is so easy.',            rating: 5, emoji: '👩' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📱', title: 'Browse & Choose',       desc: 'Explore daily fresh catches on our website or WhatsApp group. See live stock & prices.' },
  { step: '02', icon: '🛒', title: 'Place Your Order',      desc: 'Add to cart online or order via WhatsApp. Simple checkout, no hassle.' },
  { step: '03', icon: '🚚', title: 'Hygienic Packing',      desc: 'Your order is cleaned, portioned & packed in hygienic food-safe packaging.' },
  { step: '04', icon: '🏠', title: 'Delivered Fresh',       desc: 'Receive your order at your doorstep within hours. Ocean fresh, guaranteed.' },
];

/* ─── Animation helpers ───────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

/* ─── Component ───────────────────────────────────────────────────── */
export default function Home() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products?limit=8');
      if (res?.data?.data?.length) setProducts(res.data.data);
    } catch {
      // fallback to mock
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Hero />

      {/* ══════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════ */}
      <section className="section-pad max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="label-section">Explore</p>
            <h2 className="font-display">Shop by Category</h2>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-1.5 text-primary font-bold text-sm group">
            All Products <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.name} {...fadeUp(i * 0.06)}>
              <Link
                href={cat.href}
                className="category-card flex flex-col items-center gap-2.5"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                  <span className="text-3xl">{cat.emoji}</span>
                </div>
                <p className="font-bold text-sm text-gray-900 font-display">{cat.name}</p>
                <p className="text-2xs text-gray-400 leading-tight text-center">{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════ */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="label-section">Today's Pick</p>
            <h2 className="font-display">Featured Products</h2>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-1.5 text-primary font-bold text-sm group">
            View All <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <motion.div key={product.id} {...fadeUp(i * 0.07)}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products" className="btn btn-primary text-base px-10 py-3.5">
            View All Products <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="section-pad bg-organic-mint">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="label-section">Simple Process</p>
            <h2 className="font-display">How FreshMongers Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line — desktop only */}
            <div className="hidden lg:block absolute top-10 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)} className="feature-card relative">
                <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-primary">
                  {step.step}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-base font-display">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY US — FEATURES
      ══════════════════════════════════════════════ */}
      <section className="section-pad bg-organic-sky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="label-section">Why Choose Us</p>
            <h2 className="font-display">Why FreshMongers?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.1)} className="feature-card">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${f.grad} flex items-center justify-center shadow-sm`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 font-display">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section className="section-pad max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="label-section">Happy Customers</p>
          <h2 className="font-display">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="card space-y-4">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <FiStar key={j} size={14} className="fill-accent text-accent" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-gray-600 leading-relaxed italic">"{t.text}"</p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-bg to-teal-bg flex items-center justify-center text-xl">
                  {t.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm font-display">{t.name}</p>
                  <p className="text-2xs text-gray-400 font-semibold uppercase tracking-wide">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section className="bg-cta-gradient py-20 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div {...fadeUp()}>
            <p className="label-section text-white/70">Limited Time</p>
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
              Ready to Taste Freshness?
            </h2>
            <p className="text-lg opacity-85 mb-10 max-w-xl mx-auto leading-relaxed">
              Join 500+ happy customers enjoying FreshMongers. Free delivery on orders above ₹500.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn btn-accent text-base px-10 py-3.5">
                Start Shopping Now <FiArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-white/15 text-white border border-white/30 hover:bg-white/25 text-base px-8 py-3.5"
              >
                <FiPhone size={15} /> Order on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
