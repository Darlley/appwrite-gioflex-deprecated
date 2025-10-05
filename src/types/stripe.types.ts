import { Models } from 'appwrite';

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
