import { UserCollectionType } from "./user.type";

export interface Address {
  id: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  userId?: UserCollectionType;
  isDefault: boolean;
  description?: string;
  isAdminAddress: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coordinates {
  lat: number;
  lng: number;
}