'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      setLoading(false);
      router.push('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const isAdmin = user?.role === 'admin';
  const isPurchaser = user?.role === 'purchaser';

  return { user, loading, logout, isAdmin, isPurchaser };
}
