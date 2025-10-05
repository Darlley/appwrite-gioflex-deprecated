'use client';

import { AddressForm } from '@/components/address-form';
import PageContainer from "@/components/page-container";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAddressStore } from '@/stores/address-store';
import { useAuthStore } from '@/stores';
import usePermissions from '@/hooks/use-permissions';
import { Address } from '@/types/address.type';
import { cn } from '@/lib/utils';
import { Plus, RotateCw, Edit, Trash2, MapPin, Home, Building } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const AddressMap = dynamic(() => import('@/components/address-map').then(mod => mod.AddressMap), { ssr: false });

export default function MapaPage() {
  const { isLoading: authLoading, user } = useAuthStore();
  const { isCompanyOwner, isCompanyClient, getUserRoles } = usePermissions();
  const { 
    addresses, 
    isLoading, 
    error, 
    fetchAddresses, 
    createAddress, 
    updateAddress, 
    deleteAddress,
    clearError 
  } = useAddressStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [focusedAddressId, setFocusedAddressId] = useState<string | null>(null);

  // Determinar o role do usuário
  const userRoles = getUserRoles();
  const userRole = isCompanyOwner() ? 'company_owner' : 
                   isCompanyClient() ? 'company_client' : 
                   'company_employee';

  // Carregar endereços quando o componente montar
  useEffect(() => {
    if (user?.$id) {
      fetchAddresses(user.$id, userRole);
    }
  }, [user?.$id, userRole, fetchAddresses]);

  // Limpar erro quando necessário
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (authLoading || !user) {
    return (
      <PageContainer title="Gerenciador de Endereços" className='flex items-center justify-center h-full'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando endereços...</p>
        </div>
      </PageContainer>
    );
  }

  const handleAddAddress = async (addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>) => {
    try {
      await createAddress(addressData, user.$id, userRole);
      setShowForm(false);
      toast.success(
        userRole === 'company_owner' 
          ? 'Guarita de segurança adicionada com sucesso!' 
          : 'Endereço residencial adicionado com sucesso!'
      );
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Erro ao adicionar endereço.');
    }
  };

  const handleUpdateAddress = async (addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>) => {
    if (editingAddress) {
      try {
        await updateAddress(editingAddress.id, addressData);
        setEditingAddress(null);
        toast.success('Endereço atualizado com sucesso!');
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error?.message || 'Erro ao atualizar endereço.');
      }
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const address = addresses.find(addr => addr.id === id);
    const addressType = address?.isAdminAddress ? 'guarita de segurança' : 'endereço residencial';
    
    if (window.confirm(`Tem certeza que deseja excluir esta ${addressType}?`)) {
      try {
        await deleteAddress(id);
        toast.success(`${addressType.charAt(0).toUpperCase() + addressType.slice(1)} excluída com sucesso!`);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error?.message || 'Erro ao excluir endereço.');
      }
    }
  };

  const handleRefreshAddresses = async () => {
    try {
      await fetchAddresses(user.$id, userRole);
      toast.success('Endereços atualizados!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Erro ao atualizar endereços.');
    }
  };

  const handleFocusOnMap = (addressId: string) => {
    setFocusedAddressId(addressId);
    setTimeout(() => setFocusedAddressId(null), 100);
  };

  return (
    <PageContainer title="Gerenciador de Endereços" className="h-full overflow-hidden ">
      <div className="flex flex-col lg:flex-row-reverse h-full relative content md:gap-4">
        {/* Mapa em cima */}
        <div className="w-full lg:w-8/12 2xl:w-9/12">
          <AddressMap addresses={addresses} focusedAddressId={focusedAddressId} />
        </div>

        {/* Grid de endereços abaixo */}
        <div className="w-full lg:w-4/12 2xl:w-3/12 max-h-full h-full relative space-y-4 md:mt-4 p-4 md:p-0">
          {/* Botão de adicionar novo endereço como card */}
          <div className='flex gap-4 items-center'>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setShowForm(true);
                setEditingAddress(null);
              }}
              aria-label="Adicionar novo endereço"
              className='sticky bottom-4 right-4 cursor-pointer'
            >
              <p>Adicionar novo endereço</p>
              <Plus className="stroke-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                refreshAddresses();
              }}
              aria-label="Recarregar"
              className='sticky bottom-4 right-4 cursor-pointer'
            >
              <p>Recarregar</p>
              <RotateCw className="stroke-1" />
            </Button>
          </div>

          <ScrollArea className='h-full'>
            {/* Cards de endereços */}
            {addresses?.map((address) => (
              <div key={address.id} className="bg-white rounded-md border p-4 flex flex-col justify-between mb-4">
                <button onClick={() => handleFocusOnMap(address.id)} className='cursor-pointer text-left'>
                  <h3 className={clsx("text-gray-800 mb-1", address.isAdminAddress ? "font-bold" : "font-medium")}>
                    {address.isAdminAddress ? 'Guarita' : address.userId?.name!}
                  </h3>
                  <p className="text-gray-600 text-sm">{address.street}, {address.number}{address.complement && `, ${address.complement}`}</p>
                  <p className="text-gray-600 text-sm">{address.neighborhood} • {address.city}/{address.state}</p>
                  <div className='break-words whitespace-break-space mt-2'>
                    <p
                      className="text-gray-500 text-sm break-words whitespace-break-space"
                      style={{
                        "whiteSpace": "break-spaces"
                      }}
                    >
                      {address.description}
                    </p>
                  </div>
                </button>
                <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button onClick={() => setEditingAddress(address)} title="Editar endereço" variant="outline">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z"></path></svg>
                        <span>Editar</span>
                      </Button>
                      <Button onClick={() => handleDeleteAddress(address.id)} title="Excluir endereço" variant="outline">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 012 2v2H8V5a2 2 0 012-2z"></path></svg>
                        <span>Excluir</span>
                      </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Modal para formulário de endereço */}
        <Dialog
          open={showForm || !!editingAddress}
          onOpenChange={(open) => { setShowForm(open); if (!open) setEditingAddress(null); }}
        >
          <DialogContent showCloseButton className='sm:max-w-1/2'>
            <AddressForm
              onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
              onCancel={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
              initialData={editingAddress || undefined}
              isEditing={!!editingAddress}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}