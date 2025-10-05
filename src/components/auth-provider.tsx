'use client';

import { useAuthStore } from '@/stores';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Verifica a autenticação quando o componente é montado
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
} 