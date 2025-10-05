import { WebsiteType } from '@/lib/schemas/website.schema';
import { WebsiteService } from '@/services/website.service';
import { Models } from 'appwrite';
import { create } from 'zustand';

interface WebsiteStoreState {
  website: Models.Document & WebsiteType | null;
  isLoading: boolean;
  error: string | null;
  fetchWebsite: (companyId: string) => Promise<Models.Document & WebsiteType | null>;
  updateWebsite: (companyId: string, data: WebsiteType) => Promise<void>;
  updateWebsiteActive: (companyId: string, active_website: string) => Promise<void>;
};

export const useWebsiteStore = create<WebsiteStoreState>((set, get) => ({
  website: null,
  isLoading: false,
  error: null,

  fetchWebsite: async (companyId: string): Promise<Models.Document & WebsiteType | null> => {
    set({ isLoading: true, error: null });
    try {
      const response = await WebsiteService.fetchWebsite();
      set({
        website: response,
        isLoading: false,
      });
      return response
    } catch (error) {
      set({ error: 'Failed to fetch companies', isLoading: false });
      throw error
    }
  },

  updateWebsite: async (companyId: string, data: WebsiteType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await WebsiteService.updateWebsite(companyId, data);
      set({
        website: response,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch companies', isLoading: false });
    }
  },

  updateWebsiteActive: async (companyId: string, active_website: string) => {
    console.log('await WebsiteService.updateWebsiteActive()')
    console.log(companyId, active_website)
  }
}));