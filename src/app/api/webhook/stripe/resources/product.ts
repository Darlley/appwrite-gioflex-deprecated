import { databases, ID } from '@/lib/appwrite-server';
import { APPWRITE_CONFIG } from '@/lib/constants';
import Stripe from 'stripe';

/**
 * Manipula o evento de criação de produto.
 * @param product - O produto do Stripe.
 */
export async function createProduct(product: Stripe.Product) {
  console.log('Iniciando handleProductCreated');
  console.log('Produto recebido:', JSON.stringify(product, null, 2));
  try {
    const createdProduct = await databases.createDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      product.id,
      {
        name: product.name,
        description: product.description || undefined,
        active: product.active,
        marketing_features: product.marketing_features?.map(feature => feature.name).filter((name): name is string => name !== undefined).join(',') || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );
    console.log(
      `Produto criado com sucesso no banco de dados:`,
      createdProduct
    );
  } catch (error) {
    console.error(`Erro ao criar produto ${product.id}:`, error);
    throw error;
  }
}

/**
 * Manipula o evento de exclusão de produto.
 * @param product - O produto do Stripe.
 */
export async function deleteProduct(product: Stripe.Product) {
  try {
    await databases.deleteDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      product.id,
    );
    console.log(`Produto excluído com sucesso: ${product.id}`);
  } catch (error) {
    console.error(`Erro ao excluir produto ${product.id}:`, error);
    throw error;
  }
}

/**
 * Manipula o evento de atualização de produto.
 * @param product - O produto do Stripe.
 */
export async function updateProduct(product: Stripe.Product) {
  console.log("features", product.marketing_features);
  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      product.id,
      {
        name: product.name,
        description: product.description || undefined,
        active: product.active,
        marketing_features: product.marketing_features?.map(feature => feature.name).filter((name): name is string => name !== undefined).join(',') || '',
      },
    );
    console.log(`Produto atualizado com sucesso: ${product.id}`);
  } catch (error) {
    console.error(`Erro ao atualizar produto ${product.id}:`, error);
    throw error;
  }
}
