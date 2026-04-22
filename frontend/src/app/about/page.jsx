// frontend/src/app/about/page.jsx
'use client';

import Navbar    from '@/components/Navbar';
import Footer    from '@/components/Footer';
import Link      from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiAward, FiHeart, FiUsers } from 'react-icons/fi';

const MILESTONES = [
  { year: '2022', title: 'Founded', desc: 'Started with a simple mission — fresh fish direct from Trivandrum fishermen to homes.' },
  { year: '2023', title: 'Expanded', desc: 'Grew to serve over 500 happy households across Trivandrum.' },
  { year: '2024', title: 'Online Platform', desc: 'Launched FreshMongers web platform for easy ordering and delivery tracking.' },
];

const VALUES = [
  { icon: FiAward,  title: 'Quality First',     desc: 'We never compromise on freshness. Every catch is inspected before delivery.' },
  { icon: FiHeart,  title: 'Community',         desc: 'We support local fishermen with fair pricing and transparent partnerships.' },
  { icon: FiUsers,  title: 'Customer Trust',    desc: 'Your satisfaction drives everything we do — from sourcing to your doorstep.' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
  viewport: { once: true },
});

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="pt-20 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(0,102,204,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative">
          <p className="label-section">Our Story</p>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-6">
            Delivering Freshness<br /><span className="text-shimmer">Since 2022</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            FreshMongers was born from a simple belief: everyone deserves access to fresh, high-quality seafood at fair prices — with no middlemen and no compromise.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Mission */}
        <section className="section-pad">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div {...fadeUp()} className="space-y-5">
              <p className="label-section">Our Mission</p>
              <h2 className="font-display text-3xl font-black">From Ocean to Your Kitchen</h2>
              <p className="text-gray-500 leading-relaxed">
                We work directly with trusted local fishermen at Trivandrum's harbours. By removing middlemen, we ensure you get the freshest catch at fair prices — while fishermen receive better compensation for their work.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Every order is cleaned, hygienically packed, and dispatched within hours of catch. We're obsessed with freshness, because that's what you deserve.
              </p>
              <Link href="/products" className="btn btn-primary inline-flex">
                Shop Now <FiArrowRight size={15} />
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 gap-4">
              {[
                { emoji: '🎣', label: 'Local Fishermen',  val: '20+',   color: 'from-primary-bg to-teal-bg' },
                { emoji: '🏠', label: 'Happy Households', val: '500+',  color: 'from-teal-bg to-green-50' },
                { emoji: '🐟', label: 'Fish Varieties',   val: '30+',   color: 'from-accent-bg to-yellow-50' },
                { emoji: '🚚', label: 'Daily Deliveries', val: '50+',   color: 'from-coral-bg to-orange-50' },
              ].map((s) => (
                <div key={s.label} className={`card bg-gradient-to-br ${s.color} text-center p-5`}>
                  <span className="text-3xl">{s.emoji}</span>
                  <p className="font-black font-display text-2xl text-gray-900 mt-2">{s.val}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="section-pad-sm bg-organic-mint rounded-card px-8">
          <div className="text-center mb-10">
            <p className="label-section">What Drives Us</p>
            <h2 className="font-display text-3xl font-black">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.1)} className="feature-card">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="section-pad">
          <div className="text-center mb-10">
            <p className="label-section">Journey</p>
            <h2 className="font-display text-3xl font-black">Our Milestones</h2>
          </div>
          <div className="space-y-6 max-w-2xl mx-auto">
            {MILESTONES.map((m, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="flex gap-6 items-start">
                <div className="w-16 shrink-0 text-center">
                  <span className="inline-block bg-primary text-white text-sm font-black px-3 py-1.5 rounded-xl">{m.year}</span>
                </div>
                <div className="flex-1 card">
                  <h3 className="font-display font-bold text-gray-900">{m.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div {...fadeUp()} className="bg-cta-gradient rounded-card p-10 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <h2 className="font-display text-3xl font-black mb-3">Ready to taste the difference?</h2>
            <p className="text-white/80 mb-6 text-sm">Free delivery on orders above ₹500. Fresh every day.</p>
            <Link href="/products" className="btn btn-accent inline-flex">
              Shop Fresh Fish <FiArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
