"use client"

import { getProductsWithPlans } from "@/actions/pricing";
import PricingList from "@/components/pricing-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { Product } from "@/types/stripe.types";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore()
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProducts = await getProductsWithPlans();
      setProduct(fetchedProducts[0]);
    }

    fetchProduct();
  }, []);

  const handleSubscribe = async (priceId: string, userId?: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId, 
          userId
        }),
      });

      if (response.status === 401) {
        // Usuário não está autenticado, redirecionar para login
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resposta do servidor:', errorText);
        throw new Error(
          `Falha ao iniciar o checkout: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.url) {
        router.push(data.url);
      } else {
        throw new Error('URL de checkout não encontrada na resposta');
      }
    } catch (error) {
      console.error('Erro ao processar a assinatura:', error);
      toast.error('Falha ao iniciar o checkout. Por favor, tente novamente.');
    }
  };

  return (
    <main>
      <div>
        <ul>
          <li>
            <Link href="/signin">Login</Link>
          </li>
          <li>
            <Link href="/register">Register</Link>
          </li>
          <li>
            <Link href="/68671bb0002a3ce95da0/dashboard">Dashboard SaaS</Link>
          </li>
          <li>
            <Link href="/68705de40033a2a59625/dashboard">Giroflex Test</Link>
          </li>
        </ul>
      </div>


      <section className="container flex flex-col gap-4 py-8 md:max-w-[64rem] md:py-12 lg:py-24 mx-auto">
        <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem]">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Premium
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Tenha o melhor controle da sua empresa
          </p>
        </div>

        {product && (
          <div className="grid w-full items-start gap-4 rounded-lg border p-10 grid-cols-12">
            <div className="grid cols-span-12 md:col-span-8 gap-6">
              <h3 className="text-xl font-bold sm:text-2xl">
                O que esta incluso na plataforma
              </h3>
              {product?.marketing_features &&
                product?.marketing_features?.length > 0 && (
                  <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    {product.marketing_features.split(',').map((feature: string) => (
                      <li key={feature} className="flex items-center">
                        <Check className="mr-2 size-4 stroke-blue-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <div className="flex cols-span-12 md:col-span-4  flex-col gap-4 text-center p-4">
              <div className="mt-5">
                <h4 className="text-6xl font-bold">{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: product.plans[0].currency,
                }).format(product.plans[0].amount)}</h4>
              </div>
              <Link href="#" className={cn(buttonVariants({ size: "lg" }))} onClick={() => handleSubscribe(product.plans[0].$id, user?.$id)}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </section>

    </main>
  );
}
