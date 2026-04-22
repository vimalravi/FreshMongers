'use client';
// frontend/src/components/AuthHydrator.jsx
// FIX: also rehydrates cart from localStorage on mount.

import { useEffect } from 'react';
import { useAuthStore, useCartStore } from '@/utils/store';

export default function AuthHydrator() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
  const loadCartFromStorage = useCartStore((state) => state.loadCartFromStorage);

  useEffect(() => {
    loadFromStorage();
    loadCartFromStorage();
  }, [loadFromStorage, loadCartFromStorage]);

  return null;
}
