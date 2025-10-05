"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth-layout";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { loginFormSchema, type LoginFormData } from "@/lib/schemas/auth.schemas";
import { useAuthStore } from "@/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, login, isAuthenticated } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "darlleybrito@gmail.com",
      password: "mudar1234@L",
    },
  });

  useEffect(() => {
    // Só redireciona se o usuário estiver autenticado, não estiver carregando
    // e não estiver na página de signin (evita loops)
    if (!isLoading && isAuthenticated && user) {
      // Redireciona para o dashboard apropriado baseado no role
      if (user.teamId) {
        router.push(`/dashboard`);
      } else {
        router.push(`/dashboard`);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  async function handleLogin(data: LoginFormData) {
    try {
      await login({
        teamId: APPWRITE_CONFIG.CLIENT.TEAMS.SAAS_TEAM_ID,
        email: data.email,
        password: data.password,
      });
      toast.success("Login realizado com sucesso!");

      return router.push(`/dashboard`);
    } catch (err: unknown) {
      if (err instanceof Error && 'type' in err && (err as any).type === "user_session_already_exists") {
        toast.error("Faça logout primeiro");
      } else if (err instanceof Error) {
        toast.error(err.message || "Erro ao fazer login");
      }

      console.error("Erro ao fazer login:", err);
      throw err;
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Faça login em sua conta para continuar"
    >
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                {...field}
              />
            )}
          />
          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                {...field}
              />
            )}
          />
          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="text-center text-sm space-y-2">
        <div>
          <span className="text-muted-foreground">
            Não tem uma conta?{' '}
          </span>
          <a href="/register" className="font-medium text-primary hover:underline">
            Criar conta
          </a>
        </div>
        <div>
          <a href="/dashboard" className="text-muted-foreground hover:text-primary">
            Ir para Dashboard
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
