// frontend/src/app/products/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import { formatPrice } from '@/utils/helpers';
import { useCartStore } from '@/utils/store';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FiShoppingCart, FiStar, FiTruck, FiShield,
  FiMinus, FiPlus, FiArrowLeft, FiDroplet, FiCheck,
} from 'react-icons/fi';
import clsx from 'clsx';

const FRESHNESS_CONFIG = {
  very_fresh: { label: 'Very Fresh',  badge: 'badge-green', dot: 'fresh' },
  fresh:      { label: 'Fresh',       badge: 'badge-teal',  dot: 'fresh' },
  default:    { label: 'Available',   badge: 'badge-blue',  dot: 'limited' },
};

const TRUST_ITEMS = [
  { icon: FiTruck,  text: 'Same-day delivery on orders before 10 AM' },
  { icon: FiShield, text: 'Hygienically cleaned & packed' },
  { icon: FiCheck,  text: 'Direct from Trivandrum fishermen' },
];

export default function ProductDetailPage() {
  const { id }      = useParams();
  const { addItem } = useCartStore();
  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [qty,      setQty]      = useState(0.5);
  const [added,    setAdded]    = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, qty);
    toast.success(`${product.name} added to cart! 🛒`, {
      style: { borderRadius: '1rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const freshness = FRESHNESS_CONFIG[product?.freshness_status] ?? FRESHNESS_CONFIG.default;

  return (
    <>
      <Navbar />

      {/* Page shell */}
      <div className="min-h-screen pt-20 pb-16 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back link */}
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary transition mt-8 mb-8">
            <FiArrowLeft size={15} /> Back to Products
          </Link>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="skeleton rounded-card h-80" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-5 rounded" style={{ width: `${70 - i * 10}%` }} />)}
              </div>
            </div>
          )}

          {error && (
            <div className="card text-center py-16">
              <p className="text-5xl mb-4">🐠</p>
              <p className="text-coral font-bold mb-4">{error}</p>
              <Link href="/products" className="btn btn-primary">Back to Shop</Link>
            </div>
          )}

          {product && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
            >
              {/* ── Image panel ── */}
              <div className="space-y-4">
                <div className="relative w-full aspect-square bg-gradient-to-br from-primary-bg to-teal-bg rounded-card overflow-hidden shadow-card">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[120px] select-none">🐟</span>
                    </div>
                  )}
                  {/* Freshness badge */}
                  <span className={clsx('badge absolute top-4 left-4 shadow-sm', freshness.badge)}>
                    <span className={clsx('freshness-dot', freshness.dot)} />
                    {freshness.label}
                  </span>
                </div>
              </div>

              {/* ── Info panel ── */}
              <div className="space-y-6">
                {/* Category + name */}
                <div>
                  <p className="label-section text-teal">{product.category_name}</p>
                  <h1 className="font-display text-3xl md:text-4xl font-black leading-tight">{product.name}</h1>
                </div>

                {/* Rating row */}
                {product.avg_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={14}
                          className={i < Math.floor(product.avg_rating) ? 'fill-accent text-accent' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-500">
                      {product.avg_rating.toFixed(1)} ({product.review_count || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-end gap-3">
                  <div className="price-tag text-4xl font-black">
                    <span className="currency text-xl">₹</span>
                    {product.price_per_kg?.toLocaleString()}
                    <span className="unit text-base"> / kg</span>
                  </div>
                  {product.stock_kg > 0 && (
                    <span className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <FiDroplet size={12} className="text-teal" />
                      {Number(product.stock_kg).toFixed(1)} kg in stock
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>
                )}

                {/* Quantity picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quantity (kg)</label>
                  <div className="inline-flex items-center gap-0 border-2 border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(0.25, +(q - 0.25).toFixed(2)))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-primary-bg text-gray-700 hover:text-primary transition"
                    >
                      <FiMinus size={15} />
                    </button>
                    <div className="w-20 h-11 flex items-center justify-center font-bold text-gray-900 bg-white border-x-2 border-border text-sm">
                      {qty.toFixed(2)} kg
                    </div>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock_kg, +(q + 0.25).toFixed(2)))}
                      className="w-11 h-11 flex items-center justify-center hover:bg-primary-bg text-gray-700 hover:text-primary transition"
                    >
                      <FiPlus size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Total: <span className="font-bold text-primary">₹{(product.price_per_kg * qty).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </p>
                </div>

                {/* Add to cart CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={handleAdd}
                    disabled={!product.is_available || added}
                    className={clsx(
                      'flex-1 btn text-base py-3.5 transition-all',
                      product.is_available
                        ? added
                          ? 'bg-green-500 text-white shadow-md'
                          : 'btn-accent'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    {added ? (
                      <><FiCheck size={16} /> Added to Cart!</>
                    ) : (
                      <><FiShoppingCart size={16} /> {product.is_available ? 'Add to Cart' : 'Out of Stock'}</>
                    )}
                  </button>
                  <Link href="/cart" className="btn btn-secondary text-base py-3.5 px-6">
                    View Cart
                  </Link>
                </div>

                {/* Trust signals */}
                <div className="pt-4 border-t border-border space-y-2.5">
                  {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-gray-500">
                      <div className="w-7 h-7 rounded-lg bg-teal-bg flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-teal" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
