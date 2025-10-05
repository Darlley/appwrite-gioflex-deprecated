import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AddressService } from '@/services/address.service';
import { Address } from '@/types/address.type';

interface AddressState {
  // Estado
  addresses: Address[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAddresses: (userId: string, userRole: string) => Promise<void>;
  createAddress: (addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>, userId: string, userRole: string) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  getAddressById: (id: string) => Address | undefined;
  clearError: () => void;
  reset: () => void;
}

/**
 * Store para gerenciamento de endereços
 */
export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      addresses: [],
      isLoading: false,
      error: null,

      /**
       * Busca endereços do usuário
       * @param userId - ID do usuário
       * @param userRole - Role do usuário
       */
      fetchAddresses: async (userId: string, userRole: string) => {
        try {
          set({ isLoading: true, error: null });
          const addresses = await AddressService.listAddresses(userId, userRole);
          set({ addresses, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar endereços';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Cria um novo endereço
       * @param addressData - Dados do endereço
       * @param userId - ID do usuário
       * @param userRole - Role do usuário
       */
      createAddress: async (
        addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>,
        userId: string,
        userRole: string
      ) => {
        try {
          set({ isLoading: true, error: null });
          const newAddress = await AddressService.createAddress(addressData, userId, userRole);
          
          set(state => ({
            addresses: [newAddress, ...state.addresses],
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao criar endereço';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Atualiza um endereço existente
       * @param id - ID do endereço
       * @param updates - Dados para atualização
       */
      updateAddress: async (id: string, updates: Partial<Address>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedAddress = await AddressService.updateAddress(id, updates);
          
          set(state => ({
            addresses: state.addresses.map(addr => 
              addr.id === id ? updatedAddress : addr
            ),
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar endereço';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Exclui um endereço
       * @param id - ID do endereço
       */
      deleteAddress: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await AddressService.deleteAddress(id);
          
          set(state => ({
            addresses: state.addresses.filter(addr => addr.id !== id),
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir endereço';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      /**
       * Busca um endereço por ID
       * @param id - ID do endereço
       * @returns Address | undefined
       */
      getAddressById: (id: string) => {
        const { addresses } = get();
        return addresses.find(addr => addr.id === id);
      },

      /**
       * Limpa o erro atual
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Reseta a store para o estado inicial
       */
      reset: () => {
        set({
          addresses: [],
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'address-store',
      partialize: (state) => ({ 
        addresses: state.addresses 
      }),
    }
  )
);