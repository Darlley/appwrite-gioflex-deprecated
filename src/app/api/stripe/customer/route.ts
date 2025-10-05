import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar cliente existente com assinatura ativa
    const existingCustomer = await findCustomerWithActiveSubscription(email);
    
    if (existingCustomer) {
      return NextResponse.json({
        customerId: existingCustomer.id,
        existing: true
      });
    }

    // Criar novo cliente Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'giroflex_registration'
      }
    });

    return NextResponse.json({
      customerId: customer.id,
      existing: false
    });

  } catch (error) {
    console.error('Erro ao criar cliente Stripe:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para buscar cliente com assinatura ativa
async function findCustomerWithActiveSubscription(email: string): Promise<Stripe.Customer | null> {
  try {
    // Buscar clientes por email
    const customers = await stripe.customers.list({
      email,
      limit: 10
    });

    // Verificar se algum cliente tem assinatura ativa
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        return customer;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
}