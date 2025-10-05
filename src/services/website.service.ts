import { ID, teams, Query, account, databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG, USER_LABELS } from '@/lib/constants';
import { WebsiteType } from '@/lib/schemas/website.schema';
import { CompanyCollection } from '@/types/company.type';
import { Models } from 'appwrite';

export const WebsiteService = {

  async fetchWebsite(): Promise<Models.Document & WebsiteType | null> {
    // Busca um team pelo id
    const currentUser = await account.get();
    const companies = await databases.listDocuments<Models.Document & WebsiteType>(
      APPWRITE_CONFIG.CLIENT.DATABASE_ID,
      APPWRITE_CONFIG.CLIENT.COLLECTIONS.COMPANIES,
      [
        Query.equal('userId', currentUser?.$id)
      ]
    )

    if (!companies) throw new Error("Not found")

    return companies.documents[0]
  },

  async updateWebsite(companyId: string, data: WebsiteType): Promise<Models.Document & WebsiteType> {
    const company = await databases.updateDocument<Models.Document & WebsiteType>(
      APPWRITE_CONFIG.CLIENT.DATABASE_ID,
      APPWRITE_CONFIG.CLIENT.COLLECTIONS.COMPANIES,
      companyId,
      data
    )

    return company
  }
}; 