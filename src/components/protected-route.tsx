"use client"

import usePermissions from "@/hooks/use-permissions";
import { APPWRITE_CONFIG, USER_LABELS } from "@/lib/constants";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/stores";
import { useCompanyStore } from "@/stores/company-store";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const {isAuthenticated} = useAuthStore()
  const { fetchCompanies } = useCompanyStore();
  
  useEffect(() => {
    // Carrega as empresas do usuário se autenticado
    if (isAuthenticated) {
      fetchCompanies();
    }
  }, [isAuthenticated, fetchCompanies]);

  return <>{children}</>;
};

export default ProtectedRoute;
