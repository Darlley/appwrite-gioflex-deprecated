import { databases, ID, Query } from "@/lib/appwrite-server";
import { APPWRITE_CONFIG } from "@/lib/constants";
import Stripe from "stripe";

/**
 * Manipula o evento de criação de preço.
 * @param price - O preço do Stripe.
 */
export async function createPrice(price: Stripe.Price) {
  const stripeProductId = price.product as string;
  
  let product;

  try {
    product = await databases.getDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      stripeProductId
    );
  } catch (error) {
    console.log(`Produto ${stripeProductId} não encontrado (createPrice). Aguardando criação...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return createPrice(price); // retry
  }

  try {
    const createdPrice = await databases.createDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRICES,
      price.id,
      {
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        interval: price.recurring?.interval || 'one_time',
        currency: price.currency,
        active: price.active,
        product: product.$id,
        metadata: JSON.stringify(price.metadata) || "{}", // Adicionando metadados,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );

    await databases.updateDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      stripeProductId,
      {
        prices: [createdPrice.$id],
      }
    )
    console.log(`Preço criado com sucesso: ${createdPrice.stripePriceId}`);
    return createdPrice;
  } catch (error) {
    console.error(`Erro ao criar preço ${price.id}:`, error);
    throw error;
  }
}

/**
 * Manipula o evento de exclusão de preço.
 * @param price - O preço do Stripe.
 */
export async function deletePrice(price: Stripe.Price) {
  try {
    // Ao invés de deletar, podemos marcar como inativo ou fazer soft delete
    const deletedPrice = await databases.updateDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRICES,
      price.id,
      {
        active: false,
      },
    );
    console.log(`Preço marcado como inativo: ${deletedPrice.stripePriceId}`);
    return deletedPrice;
  } catch (error) {
    console.error(`Erro ao marcar preço como inativo ${price.id}:`, error);
    throw error;
  }
}

/**
 * Manipula o evento de atualização de preço.
 * @param price - O preço do Stripe.
 */
export async function updatePrice(price: Stripe.Price) {
  try {
    const updatedPrice = await databases.updateDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRICES,
      price.id,
      {
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        interval: price.recurring?.interval || 'one_time',
        currency: price.currency,
        metadata: price.metadata || {}, // Adicionando metadados
      },
    );
    console.log(`Preço atualizado com sucesso: ${updatedPrice.stripePriceId}`);
    return updatedPrice;
  } catch (error) {
    console.error(`Erro ao atualizar preço ${price.id}:`, error);
    throw error;
  }
}
