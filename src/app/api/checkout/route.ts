import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite-server';
import { APPWRITE_CONFIG } from '@/lib/constants';

/**
 * Cria uma sessão de checkout do Stripe para uma assinatura.
 * 
 * Este método realiza as seguintes operações:
 * 1. Valida o priceId recebido na requisição
 * 2. Configura os dados da sessão de checkout, incluindo URLs de sucesso e cancelamento
 * 3. Verifica se o usuário está autenticado e associa o Stripe Customer ID a ele, 
 * 4. Se o usuario não estiver autenticado cria o checkout mesmo assim, o Stripe cria o customer automaticamente
 * 5. Cria uma sessão de checkout no Stripe
 * 6. Retorna a URL do checkout ou um erro em caso de falha
 * 
 * @param request - Objeto NextRequest contendo os dados da requisição
 * @returns Uma resposta JSON com a URL da sessão de checkout ou uma mensagem de erro
 * 
 * NOTA: O Stripe cria automaticamente um customer para compras sem conta. Ao criar uma conta com o mesmo email da compra, associamos a assinatura existente ao novo usuário.
 */
export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'PriceId é obrigatório' }, { status: 400 });
    }

    let checkoutSessionData: any = {
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    };
  
    if (userId) {
      try {
        const user = await databases.getDocument(
          APPWRITE_CONFIG.SERVER.DATABASE_ID,
          APPWRITE_CONFIG.SERVER.COLLECTIONS.USERS, // Substitua pelo ID da sua collection de usuários
          userId
        );

        if (user.stripeCustomerId) {
          checkoutSessionData.client_reference_id = userId;
          checkoutSessionData.customer = user.stripeCustomerId;
          checkoutSessionData.success_url = `${process.env.APP_URL}/dashboard?payment=success`;
          checkoutSessionData.cancel_url = `${process.env.APP_URL}/dashboard?payment=cancelled`;
        } else {
          // Usuário existe mas não tem stripeCustomerId ainda
          checkoutSessionData.client_reference_id = userId;
          checkoutSessionData.success_url = `${process.env.APP_URL}/dashboard?payment=success`;
          checkoutSessionData.cancel_url = `${process.env.APP_URL}/dashboard?payment=cancelled`;
        }
      } catch (error) {
        console.error('Erro ao buscar usuário no Appwrite:', error);
        // Se não conseguir buscar o usuário, trata como não autenticado
        checkoutSessionData.success_url = `${process.env.APP_URL}/register?session_id={CHECKOUT_SESSION_ID}`;
        checkoutSessionData.cancel_url = `${process.env.APP_URL}/?payment=cancelled`;
      }
    } else {
      // Usuário não autenticado
      checkoutSessionData.success_url = `${process.env.APP_URL}/register?session_id={CHECKOUT_SESSION_ID}`;
      checkoutSessionData.cancel_url = `${process.env.APP_URL}/?payment=cancelled`;
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionData);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o checkout', details: (error as Error).message },
      { status: 500 }
    );
  }
}
