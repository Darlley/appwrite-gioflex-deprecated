import { create } from 'zustand';
import { CompanyService } from '@/services/company.service';
import type { Models } from 'appwrite';
import { CompanyCollection } from '@/types/company.type';

interface CompanyState {
  companies: Models.Team<{}>[];
  currentCompany: Models.Team<{}> | null;
  members: Models.Membership[];
  isLoading: boolean;
  error: string | null;
  fetchCompanies: (teamId?: string) => Promise<void>;
  fetchMembers: (teamId: string) => Promise<void>;
  createCompanyTeam: (name: string) => Promise<Models.Team<{}>>;
  createCompanyCollection: (data: Pick<CompanyCollection, "name" | "userId">, teamId: string) => Promise<void>;
  validateCompany: (name: string) => Promise<{ message: string, isValid: boolean }>;
  setCurrentCompany: (company: Models.Team<{}> | null) => void;
  getCompanyById: (id: string) => Promise<Models.Team<{}> | null>;
  updateCompany: (teamId: string, name: string) => Promise<void>;
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  currentCompany: null,
  members: [],
  isLoading: false,
  error: null,

  fetchCompanies: async (teamId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await CompanyService.listUserCompanies();

      set({
        companies: response,
        isLoading: false,
        currentCompany: response.filter((c) => c.$id === teamId)[0] || response[0] || null,
      });
    } catch (error) {
      set({ error: 'Failed to fetch companies', isLoading: false });
    }
  },

  fetchMembers: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const members = await CompanyService.listMembers(teamId);
      set({ members, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch members', isLoading: false });
    }
  },

  createCompanyTeam: async (name: string): Promise<Models.Team<{}>> => {
    try {
      const company = await CompanyService.createCompanyTeam(name);
      await get().fetchCompanies();
      return company
    } catch (error: any) {
      throw error;
    }
  },

  createCompanyCollection: async (data: Pick<CompanyCollection, "name" | "userId">, teamId: string) => {
    try {
      await CompanyService.createCompanyCollection(data, teamId);
    } catch (error: any) {
      throw error;
    }
  },

  async validateCompany(name: string): Promise<{ message: string, isValid: boolean }> {
    return await CompanyService.validate(name);
  },

  setCurrentCompany: (company) => {
    set({ currentCompany: company });
  },

  getCompanyById: async (id: string): Promise<Models.Team<{}> | null> => {
    set({ isLoading: true, error: null });
    try {
      const company = await CompanyService.getById(id);
      set({ currentCompany: company, isLoading: false });
      return company
    } catch (error) {
      set({ currentCompany: null, isLoading: false, error: "Failed to fetch company" });
      throw Error;
    }
  },

  updateCompany: async (teamId: string, name: string) => {
    try {
      const updatedCompany = await CompanyService.update(teamId, name);
      set((state) => ({
        currentCompany: updatedCompany,
        companies: state.companies.map((c) =>
          c.$id === teamId ? updatedCompany : c
        ),
      }));
    } catch (error: any) {
      throw error;
    }
  },
})
);