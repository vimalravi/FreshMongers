// frontend/src/utils/store.js
// FIX: cart now persists to localStorage so it survives page refresh.
// FIX: cart is loaded from localStorage on first render via loadFromStorage().
import { create } from 'zustand';

// ─── Auth Store ──────────────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAdmin: false,

  setUser: (user, token, isAdmin = false) => {
    set({ user, token, isAdmin });
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAdmin', String(isAdmin));
    }
  },

  logout: () => {
    set({ user: null, token: null, isAdmin: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      // Also clear cart on logout
      localStorage.removeItem('cart');
    }
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (token && userRaw) {
      try {
        set({ token, user: JSON.parse(userRaw), isAdmin });
      } catch {
        // corrupt storage — clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
}));

// ─── Cart Store ───────────────────────────────────────────────────────────────
// Persists cart[] to localStorage on every mutation.
const CART_KEY = 'cart';

const saveCart = (cart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
};

const loadCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useCartStore = create((set, get) => ({
  cart: [],   // AuthHydrator will call loadCartFromStorage on mount
  coupon: null,

  loadCartFromStorage: () => {
    set({ cart: loadCart() });
  },

  addItem: (product, quantity) => {
    const cart = get().cart;
    const existing = cart.find((item) => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }
    saveCart(newCart);
    set({ cart: newCart });
  },

  removeItem: (productId) => {
    const newCart = get().cart.filter((item) => item.id !== productId);
    saveCart(newCart);
    set({ cart: newCart });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
    } else {
      const newCart = get().cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      saveCart(newCart);
      set({ cart: newCart });
    }
  },

  setCoupon: (coupon) => {
    set({ coupon });
  },

  clearCart: () => {
    saveCart([]);
    set({ cart: [], coupon: null });
  },

  getTotal: () => {
    const cart = get().cart;
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price_per_kg * item.quantity,
      0
    );
    const coupon = get().coupon;
    const discount = coupon ? coupon.discount_amount : 0;
    const deliveryCharge = subtotal > 0 ? 50 : 0;   // FIX: no delivery charge on empty cart
    return { subtotal, discount, deliveryCharge, total: subtotal - discount + deliveryCharge };
  },
}));

// ─── Product Store ────────────────────────────────────────────────────────────
export const useProductStore = create((set) => ({
  products: [],
  categories: [],
  loading: false,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
}));
