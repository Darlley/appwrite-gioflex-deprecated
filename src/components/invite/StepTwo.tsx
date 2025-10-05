import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { InviteCollectionType } from "@/types/invite.type";

// Validation schema
export const stepTwoSchema = z.object({
  email: z.string().email("Email inválido"),
  mobilePhone: z.string().min(14, "Telefone deve ter pelo menos 14 dígitos (Incluindo +55)"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export type StepTwoForm = z.infer<typeof stepTwoSchema>;

interface StepTwoProps {
  form: UseFormReturn<StepTwoForm>;
  onSubmit: (data: StepTwoForm) => Promise<void>;
  onBack: () => void;
  error: string | null;
  loading: boolean;
  inviteData: InviteCollectionType | null;
}

export function StepTwo({ form, onSubmit, onBack, error, loading, inviteData }: StepTwoProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="z-4">
      <Card className="w-full min-w-md py-8">
        <CardHeader>
          <CardTitle className="text-center">Dados de acesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  disabled={!!inviteData?.email}
                  {...field}
                />
              )}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobilePhone">Celular</Label>
            <Controller
              name="mobilePhone"
              control={form.control}
              rules={{
                required: "O celular é obrigatório",
                pattern: {
                  value: /^\+55\s\(\d{2}\)\s9\d{8}$/,
                  message: "Formato inválido. Ex: +55 (67) 993328678",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  id="mobilePhone"
                  placeholder="Digite seu celular"
                />
              )}
            />

            {form.formState.errors.mobilePhone && (
              <p className="text-sm text-red-500">
                {form.formState.errors.mobilePhone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Controller
              name="password"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  {...field}
                />
              )}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  {...field}
                />
              )}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || loading}
          >
            {form.formState.isSubmitting || loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}