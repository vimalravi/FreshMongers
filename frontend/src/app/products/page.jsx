// frontend/src/app/products/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_low',  label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search:   searchParams.get('search')   || '',
    sort:     'newest',
    page:     1,
  });

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products', { params: { ...filters, limit: 20 } }),
        api.get('/products/categories/list'),
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ category: '', search: '', sort: 'newest', page: 1 });
  const hasActiveFilters = filters.category || filters.search;

  return (
    <>
      <Navbar />

      {/* ── Page header ── */}
      <div className="pt-20 bg-organic-sky border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="label-section">Our Selection</p>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-2">Fresh Seafood</h1>
          <p className="text-gray-500 max-w-xl">
            Browse our daily catch — carefully sourced, cleaned, and ready for your kitchen.
          </p>
        </div>
      </div>

      <div className="min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* ── Mobile filter toggle ── */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-ghost flex items-center gap-2 text-sm"
            >
              <FiSliders size={15} /> Filters & Sort
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-coral font-semibold flex items-center gap-1">
                <FiX size={13} /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* ── Sidebar ── */}
            <>
              {/* Mobile drawer backdrop */}
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
              </AnimatePresence>

              {/* Sidebar panel */}
              <motion.aside
                className={`
                  lg:col-span-1 lg:block lg:static
                  fixed top-0 left-0 h-full w-72 z-50 bg-white shadow-float
                  lg:shadow-none lg:w-auto lg:h-auto lg:bg-transparent lg:z-auto
                  transition-transform duration-300
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
              >
                <div className="card lg:sticky lg:top-24 space-y-6 h-full lg:h-auto overflow-y-auto">
                  {/* Mobile close */}
                  <div className="flex items-center justify-between lg:hidden">
                    <h3 className="font-bold font-display">Filters</h3>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                      <FiX size={18} />
                    </button>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Search</label>
                    <div className="input-group">
                      <FiSearch size={15} className="input-icon" />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilter('search', e.target.value)}
                        placeholder="Search fish…"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Category</label>
                    <div className="space-y-1.5">
                      {[{ id: '', name: 'All Products', slug: '' }, ...categories].map((cat) => (
                        <button
                          key={cat.id ?? 'all'}
                          onClick={() => setFilter('category', cat.slug ?? '')}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            (filters.category === '' && cat.slug === '') || filters.category === cat.slug
                              ? 'bg-primary text-white shadow-primary/30 shadow-sm'
                              : 'text-gray-600 hover:bg-primary-bg hover:text-primary'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Sort By</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => setFilter('sort', e.target.value)}
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="btn btn-ghost w-full text-sm text-coral hover:bg-coral-bg"
                    >
                      <FiX size={14} /> Clear Filters
                    </button>
                  )}
                </div>
              </motion.aside>
            </>

            {/* ── Product grid ── */}
            <div className="lg:col-span-3">
              {/* Results bar */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500 font-semibold">
                  {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
                </p>
                {/* Desktop sort */}
                <div className="hidden lg:block">
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilter('sort', e.target.value)}
                    className="text-sm py-2 px-3 rounded-xl border-border w-auto"
                    style={{ width: 'auto' }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-0 overflow-hidden">
                      <div className="skeleton h-48 rounded-none" />
                      <div className="p-4 space-y-3">
                        <div className="skeleton h-3 w-1/3 rounded" />
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                        <div className="skeleton h-10 rounded-lg mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-24 card">
                  <p className="text-5xl mb-4">🐠</p>
                  <h3 className="font-display font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters.</p>
                  <button onClick={clearFilters} className="btn btn-primary text-sm">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
