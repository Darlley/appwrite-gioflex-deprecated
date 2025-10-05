import { ID, Query, Models } from 'appwrite';
import { account, databases, teams } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/lib/constants';
import { UserInterface } from '@/types/user.type';

const SAAS_TEAM_ID = APPWRITE_CONFIG.CLIENT.TEAMS.SAAS_TEAM_ID;

export class AuthService {
  static async getCurrentUser(teamId: string = SAAS_TEAM_ID): Promise<{ user: UserInterface, membership: Models.Membership | null }> {
    // Obtem usuário autenticado
    const currentUser = await account.get();

    // Busca dados personalizados do seu banco
    const user = await databases.getDocument<UserInterface>(
      APPWRITE_CONFIG.CLIENT.DATABASE_ID,
      APPWRITE_CONFIG.CLIENT.COLLECTIONS.USERS,
      currentUser.$id
    );

    // Busca membership no contexto (SaaS ou empresa)
    const membership = await this.getUserMembership(teamId, currentUser!.$id);

    return {
      user,
      membership
    };
  }

  static async getUserMembership(teamId: string, accountId: string): Promise<Models.Membership | null> {
    if (!teamId) return null; // não tem contexto ainda

    const memberships = await teams.listMemberships(teamId);
    const membership = memberships.memberships.find(m => m.userId === accountId);

    return membership ?? null;
  }

  static async login(email: string, password: string): Promise<void> {
    await account.createEmailPasswordSession(email, password);
  }

  static async register({ name, email, mobilePhone, password }: { name: string; email: string; mobilePhone: string; password: string }) {
    // Criar usuário no Appwrite
    const user = await account.create(ID.unique(), email, password, name);

    // Buscar ou criar cliente Stripe via API
    let stripeCustomerId: string | undefined;
    
    try {
      const response = await fetch('/api/stripe/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (response.ok) {
        const data = await response.json();
        stripeCustomerId = data.customerId;
      } else {
        console.error('Erro ao criar cliente Stripe via API:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao chamar API do Stripe:', error);
      // Continuar sem o stripeCustomerId se houver erro
    }

    // Criar documento do usuário no banco de dados
    await databases.createDocument(
      APPWRITE_CONFIG.CLIENT.DATABASE_ID,
      APPWRITE_CONFIG.CLIENT.COLLECTIONS.USERS,
      user.$id,
      {
        name,
        email,
        mobilePhone,
        stripeCustomerId
      }
    );

    // Fazer login do usuário
    await account.createEmailPasswordSession(email, password);

    return { user };
  }

  static async logout(): Promise<void> {
    await account.deleteSession('current');
  }

  static async updateOnboarding(completeOnboarding: boolean): Promise<Models.Document> {
    const currentUser = await account.get();
    const user = await databases.updateDocument(
      APPWRITE_CONFIG.CLIENT.DATABASE_ID,
      APPWRITE_CONFIG.CLIENT.COLLECTIONS.USERS,
      currentUser.$id,
      {
        completeOnboarding
      }
    )
    return user
  }

  static async updateTeam(teamId: string): Promise<Models.Document> {
    const currentUser = await account.get();
    const user = await databases.updateDocument(
      APPWRITE_CONFIG.CLIENT.DATABASE_ID,
      APPWRITE_CONFIG.CLIENT.COLLECTIONS.USERS,
      currentUser.$id,
      {
        teamId
      }
    )
    return user
  }


}