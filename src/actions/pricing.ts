'use server'

import { databases, Query } from "@/lib/appwrite-server"
import { APPWRITE_CONFIG } from "@/lib/constants"
import { Models } from 'node-appwrite';

export interface Price extends Models.Document {
  amount: number
  interval: string
  currency: string
  product: Product
  active: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Product extends Models.Document {
  name: string
  description?: string
  active: boolean
  marketing_features: string
  prices: Price[]
  plans: Plan[]
  createdAt: string
  updatedAt: string
}

export interface Plan extends Models.Document {
  nickname?: string
  amount: number
  currency: string
  interval: string
  intervalCount: number
  active: boolean
  product: Product
  createdAt: string
  updatedAt: string
}


export async function getProductsWithPrices() {
  try {
    const productsResult = await databases.listDocuments(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      [
        Query.equal('active', true),
        Query.orderAsc('name'),
      ]
    )

    const products = productsResult.documents

    const pricesResult = await databases.listDocuments(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRICES,
      [
        Query.equal('active', true),
        Query.orderAsc('amount'),
      ]
    )

    const prices = pricesResult.documents

    const productsWithPrices = products.map(product => {
      const relatedPrices = prices.filter(price => price.productId === product.$id)
      return {
        ...product,
        prices: relatedPrices,
      }
    })

    console.log(productsWithPrices)

    return productsWithPrices
  } catch (error) {
    console.error('Erro ao buscar produtos com preços:', error)
    throw new Error('Falha ao carregar os produtos')
  }
}


export async function getProductsWithPlans(): Promise<Product[]> {
  try {
    // 1. Buscar produtos ativos, ordenados por criação
    const products = await databases.listDocuments<Product>(
      APPWRITE_CONFIG.SERVER.DATABASE_ID,
      APPWRITE_CONFIG.SERVER.COLLECTIONS.PRODUCTS,
      [
        Query.equal('active', true),
        Query.orderAsc('createdAt'),
      ]
    )

    if(!products) return [];

    return products.documents
  } catch (error) {
    console.error('Erro ao buscar produtos com planos:', error)
    throw new Error('Falha ao carregar os produtos')
  }
}