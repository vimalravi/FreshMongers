// frontend/src/components/Navbar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/utils/store';
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';

const mainNavLinks = [
  { href: '/', label: 'Home' },
  {
    label: 'Shop',
    submenu: [
      { href: '/products', label: 'All Products' },
      { href: '/products?category=seafood', label: 'Fresh Seafood' },
      { href: '/products?category=vegetables', label: 'Vegetables' },
      { href: '/products?category=fruits', label: 'Fruits' },
    ],
  },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen]        = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled]    = useState(false);
  const router                     = useRouter();
  const pathname                   = usePathname();
  const { user, logout }           = useAuthStore();
  const { cart }                   = useCartStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-nav py-0'
          : 'bg-white/85 backdrop-blur-sm py-1'
      )}
    >
      {/* Top accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-teal to-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center shadow-sm group-hover:shadow-primary/40 transition-shadow">
              <span className="text-lg leading-none">🐟</span>
            </div>
            <div className="leading-none">
              <span className="block text-base font-black tracking-tight text-gray-900 font-display">
                Fresh<span className="text-primary">Mongers</span>
              </span>
              <span className="block text-[10px] text-teal font-semibold tracking-widest uppercase -mt-0.5">
                Ocean to Door
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-0">
            {mainNavLinks.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href || '#'}
                  className={clsx(
                    'nav-link relative px-4 py-2',
                    pathname === item.href ? 'active' : ''
                  )}
                >
                  <span className="flex items-center gap-1">
                    {item.label}
                    {item.submenu && <FiChevronDown size={14} className="group-hover:rotate-180 transition-transform" />}
                  </span>
                </Link>

                {/* Desktop Dropdown */}
                {item.submenu && (
                  <div className="absolute left-0 mt-0 w-48 rounded-lg bg-white shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-bg hover:text-primary rounded-lg first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="nav-link text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-4 py-2"
              >
                Admin
              </Link>
            )}
          </div>

          {/* ── Right actions ── */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                {/* Orders */}
                <Link
                  href="/orders"
                  className="relative p-2.5 rounded-xl hover:bg-primary-bg text-gray-600 hover:text-primary transition-all"
                  title="My Orders"
                  aria-label="Orders"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-2.5 rounded-xl hover:bg-primary-bg text-gray-600 hover:text-primary transition-all"
                  aria-label="Cart"
                >
                  <FiShoppingCart size={20} />
                  {cart.length > 0 && (
                    <span className="cart-badge">{cart.length}</span>
                  )}
                </Link>

                {/* Profile */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition text-sm font-semibold text-gray-700"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-bg to-teal-bg flex items-center justify-center">
                    <FiUser size={13} className="text-primary" />
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-gray-500 hover:border-coral hover:text-coral hover:bg-coral-bg transition-all"
                >
                  <FiLogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-primary text-sm py-2.5 px-5">
                Login
              </Link>
            )}
          </div>

          {/* ── Mobile toggle ── */}
          <button
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 text-gray-700 transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-white/98 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg">
          {/* Mobile Main Navigation */}
          {mainNavLinks.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                  pathname === item.href
                    ? 'bg-primary-bg text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{item.label}</span>
                {item.submenu && (
                  <FiChevronDown
                    size={16}
                    className={clsx(
                      'transition-transform',
                      openDropdown === item.label ? 'rotate-180' : ''
                    )}
                  />
                )}
              </button>

              {/* Mobile Dropdown */}
              {item.submenu && openDropdown === item.label && (
                <div className="pl-4 space-y-1 mt-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.href}
                      href={subitem.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-primary-bg hover:text-primary transition-colors"
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Admin Link */}
          {user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-semibold text-orange-600 hover:bg-orange-50"
            >
              Admin Panel
            </Link>
          )}

          <div className="pt-2 mt-2 border-t border-border space-y-1">
            {user ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="bg-coral text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cart.length}
                    </span>
                  )}
                </Link>
                <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <FiUser size={15} /> {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-coral hover:bg-coral-bg"
                >
                  <FiLogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="block text-center btn btn-primary w-full"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
