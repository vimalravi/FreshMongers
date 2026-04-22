// frontend/src/components/ProductCard.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiDroplet } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCartStore } from '@/utils/store';
import { formatPrice } from '@/utils/helpers';
import clsx from 'clsx';

const FRESHNESS_CONFIG = {
  very_fresh: { label: 'Very Fresh',  dot: 'fresh',   badge: 'badge-green' },
  fresh:      { label: 'Fresh',       dot: 'fresh',   badge: 'badge-teal'  },
  default:    { label: 'Available',   dot: 'limited', badge: 'badge-blue'  },
};

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 0.5);
    toast.success(`${product.name} added! 🛒`, {
      style: { borderRadius: '1rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 },
    });
  };

  const freshness = FRESHNESS_CONFIG[product.freshness_status] ?? FRESHNESS_CONFIG.default;
  const isLowStock = product.stock_kg < 2;
  const rating = product.avg_rating || 0;
  const fullStars = Math.floor(rating);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      className="product-card flex flex-col group"
    >
      <Link href={`/products/${product.id}`} className="flex flex-col flex-1">

        {/* ── Image area ── */}
        <div className="relative w-full h-48 bg-gradient-to-br from-primary-bg to-teal-bg overflow-hidden rounded-t-card">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">🐟</span>
            </div>
          )}

          {/* Top-left: freshness */}
          <span className={clsx('badge absolute top-3 left-3 shadow-sm', freshness.badge)}>
            <span className={clsx('freshness-dot', freshness.dot)} />
            {freshness.label}
          </span>

          {/* Top-right: stock warning */}
          {isLowStock && (
            <span className="badge badge-orange absolute top-3 right-3 shadow-sm">
              Low Stock
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* ── Content ── */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Category */}
          <p className="label-section text-teal text-[10px]">{product.category_name}</p>

          {/* Name */}
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 text-sm font-display">
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={11}
                  className={i < fullStars ? 'fill-accent text-accent' : 'text-gray-200'}
                />
              ))}
            </div>
            <span className="text-2xs text-gray-400 font-semibold">
              {rating > 0 ? rating.toFixed(1) : '—'} ({product.review_count || 0})
            </span>
          </div>

          {/* Price + stock */}
          <div className="flex items-end justify-between mt-auto pt-2">
            <div className="price-tag">
              <span className="currency">₹</span>
              <span className="text-xl font-black">{product.price_per_kg?.toLocaleString()}</span>
              <span className="unit"> / kg</span>
            </div>
            <p className="text-2xs text-gray-400 flex items-center gap-1">
              <FiDroplet size={10} className="text-teal" />
              {product.stock_kg?.toFixed(1)} kg left
            </p>
          </div>
        </div>
      </Link>

      {/* ── Add to cart ── */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!product.is_available}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200',
            product.is_available
              ? 'bg-accent text-gray-900 hover:bg-accent-dark hover:shadow-accent active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <FiShoppingCart size={15} />
          {product.is_available ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
}
