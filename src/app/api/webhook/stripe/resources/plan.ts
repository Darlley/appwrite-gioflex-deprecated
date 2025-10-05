
import { databases, ID, Query } from "@/lib/appwrite-server";
import { APPWRITE_CONFIG } from "@/lib/constants";
import Stripe from "stripe";

export async function createPlan(plan: Stripe.Plan) {
  const stripeProductId = plan.product as string;
  
  let product;

  try {
    product = await databases.getDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      stripeProductId
    );
  } catch (error) {
    console.log(`Produto ${stripeProductId} não encontrado (createPlan). Aguardando criação...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return createPlan(plan); // retry após delay
  }

  try {
    const createdPlan = await databases.createDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PLANS,
      plan.id,
      {
        product: product.$id,
        nickname: plan.nickname || undefined,
        amount: plan.amount ? plan.amount / 100 : 0,
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.interval_count,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    )

    await databases.updateDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      stripeProductId,
      {
        plans: [createdPlan.$id],
      }
    )
    console.log(`Plano criado com sucesso: ${createdPlan.stripeId}`);
    return createdPlan;
  } catch (error) {
    console.error(`Erro ao criar plano ${plan.id}:`, error);
    throw error;
  }
}

export async function updatePlan(plan: Stripe.Plan) {
  try {
    const updatedPlan = await databases.updateDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PLANS,
      plan.id,
      {
        nickname: plan.nickname || undefined,
        amount: plan.amount ? plan.amount / 100 : 0,
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.interval_count,
      }
    )
    console.log(`Plano atualizado com sucesso: ${updatedPlan.stripeId}`);
    return updatedPlan;
  } catch (error) {
    console.error(`Erro ao atualizar plano ${plan.id}:`, error);
    throw error;
  }
}

export async function deletePlan(plan: Stripe.Plan) {
  try {
    const deletedPlan = await databases.updateDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PLANS,
      plan.id,
      {
        active: false
      }
    )
    console.log(`Plano marcado como inativo: ${deletedPlan.stripeId}`);
    return deletedPlan;
  } catch (error) {
    console.error(`Erro ao marcar plano como inativo ${plan.id}:`, error);
    throw error;
  }
}
