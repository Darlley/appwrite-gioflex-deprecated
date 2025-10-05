import { Models } from 'appwrite';

export type UserRole = 'saas_owner' | 'saas_client' | 'company_owner' | 'company_employee' | 'company_client';

export interface UserInterface extends Models.Document {
  name: string;
  fullName?: string;
  email: string;
  mobilePhone: string,
  invitedBy: string | null;
  google_access_token?: string;
  google_refresh_token?: string;
  google_token_expiry?: number;
  teamId?: string;
  completeOnboarding?: boolean;
  profileImage?: string;
  birthDate?: string;
  stripeCustomerId?: string;
}

export interface AuthUser extends Models.User<Models.Preferences> {}