import { databases, ID, Query } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/lib/constants';
import { Address } from '@/types/address.type';
import { AppwriteError } from '@/types/appwrite-error.type';

const DATABASE_ID = APPWRITE_CONFIG.CLIENT.DATABASE_ID;
const ADDRESSES_COLLECTION_ID = APPWRITE_CONFIG.CLIENT.COLLECTIONS.ADDRESSES;

/**
 * Serviço para gerenciamento de endereços
 */
export class AddressService {
  /**
   * Lista endereços baseado no userId e role do usuário
   * @param userId - ID do usuário
   * @param userRole - Role do usuário (company_owner, company_client, etc.)
   * @returns Promise<Address[]>
   */
  static async listAddresses(userId: string, userRole: string): Promise<Address[]> {
    try {
      const queries = [Query.orderDesc('$createdAt')];
      
      // Se for colaborador, buscar apenas endereços admin
      if (userRole === 'company_employee') {
        queries.push(
          Query.equal('userId', userId),
          Query.equal('isAdminAddress', true)
        );
      } else if (userRole === 'company_owner') {
        // Company owner vê todos os endereços da empresa
        // Por enquanto, vamos buscar todos
      } else if (userRole === 'company_client') {
        // Company client vê apenas seus próprios endereços
        queries.push(Query.equal('userId', userId));
      }

      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        queries
      );

      return documents.map((doc: any) => ({
        id: doc.$id,
        cep: doc.cep,
        street: doc.street,
        number: doc.number,
        complement: doc.complement || '',
        neighborhood: doc.neighborhood,
        city: doc.city,
        state: doc.state,
        userId: doc.userId,
        isDefault: doc.isDefault,
        description: doc.description,
        createdAt: new Date(doc.$createdAt),
        updatedAt: new Date(doc.$updatedAt),
        isAdminAddress: doc.isAdminAddress ?? false,
      }));
    } catch (error) {
      console.error('Erro ao listar endereços:', error);
      throw new Error('Erro ao carregar endereços');
    }
  }

  /**
   * Cria um novo endereço
   * @param addressData - Dados do endereço
   * @param userId - ID do usuário
   * @param userRole - Role do usuário
   * @returns Promise<Address>
   */
  static async createAddress(
    addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>,
    userId: string,
    userRole: string
  ): Promise<Address> {
    try {
      const isAdminAddress = userRole === 'company_owner';

      const { $id, $createdAt, $updatedAt } = await databases.createDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        ID.unique(),
        {
          cep: addressData.cep.replace('-', ''),
          street: addressData.street,
          number: Number(addressData.number),
          complement: addressData.complement || null,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          userId: userId,
          isDefault: addressData.isDefault,
          description: addressData.description,
          isAdminAddress
        }
      );

      return {
        id: $id,
        cep: addressData.cep,
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement || '',
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        userId: addressData.userId,
        isDefault: addressData.isDefault,
        description: addressData.description,
        isAdminAddress,
        createdAt: new Date($createdAt),
        updatedAt: new Date($updatedAt),
      };
    } catch (error) {
      console.error('Erro ao criar endereço:', error);
      if (error instanceof Error && 'type' in error && error.type === 'document_already_exists') {
        throw new Error('Este endereço já foi cadastrado');
      }
      throw new Error('Erro ao criar endereço');
    }
  }

  /**
   * Atualiza um endereço existente
   * @param id - ID do endereço
   * @param updates - Dados para atualização
   * @returns Promise<Address>
   */
  static async updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
    try {
      const { $updatedAt } = await databases.updateDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        id,
        {
          cep: updates.cep,
          street: updates.street,
          number: updates.number,
          complement: updates.complement || null,
          neighborhood: updates.neighborhood,
          city: updates.city,
          state: updates.state,
          isDefault: updates.isDefault,
          description: updates.description,
        }
      );

      // Buscar o documento atualizado
      const updatedDoc = await databases.getDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        id
      );

      return {
        id: updatedDoc.$id,
        cep: updatedDoc.cep,
        street: updatedDoc.street,
        number: updatedDoc.number,
        complement: updatedDoc.complement || '',
        neighborhood: updatedDoc.neighborhood,
        city: updatedDoc.city,
        state: updatedDoc.state,
        userId: updatedDoc.userId,
        isDefault: updatedDoc.isDefault,
        description: updatedDoc.description,
        isAdminAddress: updatedDoc.isAdminAddress ?? false,
        createdAt: new Date(updatedDoc.$createdAt),
        updatedAt: new Date($updatedAt),
      };
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw new Error('Erro ao atualizar endereço');
    }
  }

  /**
   * Exclui um endereço
   * @param id - ID do endereço
   * @returns Promise<void>
   */
  static async deleteAddress(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        id
      );
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      throw new Error('Erro ao excluir endereço');
    }
  }

  /**
   * Busca um endereço por ID
   * @param id - ID do endereço
   * @returns Promise<Address>
   */
  static async getAddressById(id: string): Promise<Address> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        id
      );

      return {
        id: doc.$id,
        cep: doc.cep,
        street: doc.street,
        number: doc.number,
        complement: doc.complement || '',
        neighborhood: doc.neighborhood,
        city: doc.city,
        state: doc.state,
        userId: doc.userId,
        isDefault: doc.isDefault,
        description: doc.description,
        isAdminAddress: doc.isAdminAddress ?? false,
        createdAt: new Date(doc.$createdAt),
        updatedAt: new Date(doc.$updatedAt),
      };
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      throw new Error('Endereço não encontrado');
    }
  }
}