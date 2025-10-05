'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, Route, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrazilianPhoneInput } from '@/components/ui/phone-input';
import { useAuthStore } from '@/stores/auth-store';
import { registerFormSchema, type RegisterFormData } from '@/lib/schemas/auth.schemas';
import { APPWRITE_CONFIG, USER_LABELS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
  prefilledEmail?: string;
}

export function RegisterForm({ prefilledEmail }: RegisterFormProps) {
  const route = useRouter()
  const { register: registerUser, isLoading } = useAuthStore();

  const [isValidPassword, setIsValidPassword] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: prefilledEmail || '',
      mobilePhone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const validatePassword = (password: string) => {
    setIsValidPassword({
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[\W_]/.test(password),
    });
  };

  // Preenche o email quando prefilledEmail é fornecido
  useEffect(() => {
    if (prefilledEmail) {
      setValue('email', prefilledEmail);
    }
  }, [prefilledEmail, setValue]);

  // Valida a senha em tempo real
  useEffect(() => {
    if (password) {
      validatePassword(password);
    }
  }, [password]);

  const handleRegister = async ({ confirmPassword, email, mobilePhone, name, password }: RegisterFormData) => {
    try {
      console.log('Iniciando registro com dados:', {
        email,
        mobilePhone,
        name,
        teamId: APPWRITE_CONFIG.CLIENT.TEAMS.SAAS_TEAM_ID,
        roles: [USER_LABELS.SAAS_CLIENT]
      });

      await registerUser({
        email,
        mobilePhone,
        name,
        password,
        teamId: APPWRITE_CONFIG.CLIENT.TEAMS.SAAS_TEAM_ID,
        roles: [USER_LABELS.SAAS_CLIENT]
      });
      toast.success('Conta criada com sucesso!');
      route.push(`/dashboard`);
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome"
              {...field}
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

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
              disabled={!!prefilledEmail}
              {...field}
            />
          )}
        />
        {prefilledEmail && (
          <p className="text-sm text-blue-600">
            Use o mesmo email fornecido durante o checkout.
          </p>
        )}
        {errors.email && (
          <p className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobilePhone">Celular</Label>
        <Controller
          name="mobilePhone"
          control={control}
          render={({ field }) => (
            <BrazilianPhoneInput
              id="mobilePhone"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.mobilePhone && (
          <p className="text-sm text-red-500">
            {errors.mobilePhone.message}
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

        <div className="space-y-1">
          <span
            className={`flex items-center gap-2 text-xs ${isValidPassword.minLength
                ? 'text-green-500'
                : 'text-destructive'
              }`}
          >
            {isValidPassword.minLength ? (
              <Check className="size-4 stroke-1" />
            ) : (
              <X className="size-4 stroke-1" />
            )}
            <span>Pelo menos 8 caracteres</span>
          </span>
          <span
            className={`flex items-center gap-2 text-xs ${isValidPassword.hasLowercase
                ? 'text-green-500'
                : 'text-destructive'
              }`}
          >
            {isValidPassword.hasLowercase ? (
              <Check className="size-4 stroke-1" />
            ) : (
              <X className="size-4 stroke-1" />
            )}
            <span>Uma letra minúscula</span>
          </span>
          <span
            className={`flex items-center gap-2 text-xs ${isValidPassword.hasUppercase
                ? 'text-green-500'
                : 'text-destructive'
              }`}
          >
            {isValidPassword.hasUppercase ? (
              <Check className="size-4 stroke-1" />
            ) : (
              <X className="size-4 stroke-1" />
            )}
            <span>Uma letra maiúscula</span>
          </span>
          <span
            className={`flex items-center gap-2 text-xs ${isValidPassword.hasNumber
                ? 'text-green-500'
                : 'text-destructive'
              }`}
          >
            {isValidPassword.hasNumber ? (
              <Check className="size-4 stroke-1" />
            ) : (
              <X className="size-4 stroke-1" />
            )}
            <span>Um número</span>
          </span>
          <span
            className={`flex items-center gap-2 text-xs ${isValidPassword.hasSpecialChar
                ? 'text-green-500'
                : 'text-destructive'
              }`}
          >
            {isValidPassword.hasSpecialChar ? (
              <Check className="size-4 stroke-1" />
            ) : (
              <X className="size-4 stroke-1" />
            )}
            <span>Um caractere especial</span>
          </span>
        </div>

        {errors.password && (
          <p className="text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              {...field}
            />
          )}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
        {isSubmitting || isLoading ? "Registrando..." : "Registrar"}
      </Button>
    </form>
  );
}