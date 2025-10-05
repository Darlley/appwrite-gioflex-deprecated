import { stripe } from '@/lib/stripe';
import { RegisterForm } from '@/components/register-form';
import { AuthLayout } from '@/components/auth-layout';

interface RegisterPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { session_id } = await searchParams;
  let prefilledEmail: string | undefined;

  // Se há um session_id, recupera o email da sessão do Stripe
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      prefilledEmail = session.customer_details?.email || undefined;
    } catch (error) {
      console.error('Erro ao recuperar sessão do Stripe:', error);
      // Continua sem o email preenchido se houver erro
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Preencha os dados abaixo para criar sua conta"
    >
      <RegisterForm prefilledEmail={prefilledEmail} />

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          Já tem uma conta?{' '}
        </span>
        <a
          href="/signin"
          className="font-medium text-primary hover:underline"
        >
          Fazer login
        </a>
      </div>
    </AuthLayout>
  );
}