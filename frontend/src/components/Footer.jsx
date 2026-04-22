// frontend/src/components/Footer.jsx
'use client';

import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiClock } from 'react-icons/fi';

const SHOP_LINKS    = [['Products', '/products'], ['My Orders', '/orders'], ['Track Order', '/orders'], ['Offers', '/products']];
const SUPPORT_LINKS = [['About Us', '/about'], ['FAQ', '/faq'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Contact', '/contact']];

export default function Footer() {
  return (
    <footer className="bg-footer-dark text-white mt-20 relative overflow-hidden">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Top wave */}
      <div className="w-full overflow-hidden leading-none -mt-1">
        <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" className="w-full">
          <path d="M0 0L48 8C96 16 192 32 288 37.3C384 42.7 480 37.3 576 32C672 26.7 768 21.3 864 26.7C960 32 1056 48 1152 53.3C1248 58.7 1344 53.3 1392 50.7L1440 48V0H0Z" fill="#f7f9fc"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">

          {/* ── Brand col ── */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center shadow-primary">
                <span className="text-xl">🐟</span>
              </div>
              <div>
                <p className="text-lg font-black font-display tracking-tight">
                  Fresh<span className="text-teal">Mongers</span>
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Ocean to Door</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Bringing ocean-fresh fish from local Trivandrum fishermen directly to your doorstep. Hygienic, fast, and fair.
            </p>

            {/* Working hours */}
            <div className="flex items-start gap-2.5 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <FiClock size={15} className="text-teal mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Working Hours</p>
                <p className="text-xs text-gray-400 mt-0.5">Mon – Sat: 6:00 AM – 7:00 PM</p>
                <p className="text-xs text-gray-400">Sunday: 6:00 AM – 2:00 PM</p>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-2.5">
              {[FiFacebook, FiInstagram, FiTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Shop links ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-5">Shop</h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-teal transition flex items-center gap-1.5 group">
                    <span className="text-teal/50 group-hover:text-teal transition text-xs">›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support links ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-5">Support</h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-teal transition flex items-center gap-1.5 group">
                    <span className="text-teal/50 group-hover:text-teal transition text-xs">›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-5">Contact Us</h4>
            <div className="space-y-3.5">
              {[
                { Icon: FiPhone,  text: '+91 99999 99999',           href: 'tel:+919999999999' },
                { Icon: FiMail,   text: 'support@freshmongers.com',  href: 'mailto:support@freshmongers.com' },
                { Icon: FiMapPin, text: 'Trivandrum, Kerala, India', href: null },
              ].map(({ Icon, text, href }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-teal" />
                  </div>
                  {href
                    ? <a href={href} className="hover:text-teal transition">{text}</a>
                    : <span>{text}</span>
                  }
                </div>
              ))}
            </div>

            {/* WhatsApp CTA — inspired by FreshMart Kerala ordering pattern */}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#25D366]/20 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Order on WhatsApp
            </a>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} FreshMongers. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/terms"   className="hover:text-gray-300 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition">Privacy</Link>
            <span>Made with ❤️ in Trivandrum</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
