'use client';

import { isAddressInTayamaPark } from '@/lib/geocoding.service';
import { fetchAddressByCep, formatCep } from '@/lib/via-cep.service';
import { Address } from '@/types/address.type';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, Car, Clock, Home, MapPin, Save, Search, Shield, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AddressFormProps {
  onSubmit: (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>) => void;
  onCancel?: () => void;
  initialData?: Address;
  isEditing?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    userId: undefined,
    isDefault: false,
    description: ''
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [cepError, setCepError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLocationValid, setIsLocationValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        cep: initialData.cep,
        street: initialData.street,
        number: initialData.number,
        complement: initialData.complement || '',
        neighborhood: initialData.neighborhood,
        city: initialData.city,
        state: initialData.state,
        userId: initialData.userId,
        isDefault: initialData.isDefault,
        description: initialData.description
      });
      setIsLocationValid(true); // Assume que endereços existentes são válidos
    }
  }, [initialData]);

  const validateAddressLocation = async () => {
    if (!formData.street || !formData.number || !formData.city || !formData.state) {
      return;
    }

    setIsValidatingLocation(true);
    setLocationError('');
    setIsLocationValid(null);

    const fullAddress = `${formData.street}, ${formData.number}, ${formData.neighborhood}, ${formData.city}, ${formData.state}, Brasil`;

    try {
      const result = await isAddressInTayamaPark(fullAddress);

      if (result.isValid) {
        setIsLocationValid(true);
        setLocationError('');
      } else {
        setIsLocationValid(false);
        setLocationError('Este endereço está fora da área permitida (Tayamã Park, Campo Grande/MS)');
      }
    } catch (error) {
      console.error('Erro ao validar localização:', error);
      setLocationError('Erro ao validar a localização do endereço');
      setIsLocationValid(false);
    } finally {
      setIsValidatingLocation(false);
    }
  };

  const handleCepSearch = async (cep: string) => {
    if (cep.replace(/\D/g, '').length === 8) {
      setIsLoadingCep(true);
      setCepError('');

      const addressData = await fetchAddressByCep(cep);

      if (addressData) {
        setFormData(prev => ({
          ...prev,
          cep: formatCep(addressData.cep),
          street: addressData.logradouro,
          neighborhood: addressData.bairro,
          city: addressData.localidade,
          state: addressData.uf,
        }));
      } else {
        setCepError('CEP não encontrado');
      }

      setIsLoadingCep(false);
    }
  };

  // Validar localização quando os campos principais mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.street && formData.number && formData.city && formData.state) {
        validateAddressLocation();
      } else {
        setIsLocationValid(null);
        setLocationError('');
      }
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timer);
  }, [formData.street, formData.number, formData.neighborhood, formData.city, formData.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cep || !formData.street || !formData.number ||
      !formData.neighborhood || !formData.city || !formData.state) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isLocationValid === false) {
      toast.error('Este endereço está fora da área permitida. Apenas endereços no Tayamã Park (Campo Grande/MS) são aceitos.');
      return;
    }

    if (isLocationValid === null && !isEditing) {
      toast.info('Aguarde a validação da localização do endereço.');
      return;
    }

    onSubmit({ ...formData });

    if (!isEditing) {
      setFormData({
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        userId: undefined,
        isDefault: false,
        description: ''
      });
      setIsLocationValid(null);
      setLocationError('');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'cep' && typeof value === 'string') {
      const formattedCep = formatCep(value);
      setFormData(prev => ({ ...prev, cep: formattedCep }));

      if (formattedCep.replace(/\D/g, '').length === 8) {
        handleCepSearch(formattedCep);
      }
    }
  };

  const getLocationStatusColor = () => {
    if (isLocationValid === true) return 'text-green-600';
    if (isLocationValid === false) return 'text-red-600';
    return 'text-gray-500';
  };

  const getLocationStatusIcon = () => {
    if (isValidatingLocation) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
    }
    if (isLocationValid === true) {
      return <MapPin className="w-4 h-4 text-green-600" />;
    }
    if (isLocationValid === false) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className='w-full max-h-[85vh] overflow-hidden'>
      {/* Cabeçalho - Sempre visível */}
      <div className='flex gap-2 items-center mb-4 px-1'>
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
        </h2>
      </div>

      {/* Formulário com scroll interno */}
      <form onSubmit={handleSubmit} className='h-full'>
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-1">
          {/* Layout responsivo: coluna única no mobile, duas colunas no desktop */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Formulário - Coluna principal */}
            <div className="space-y-4 sm:space-y-6 order-1 flex flex-col">
              {/* Aviso sobre restrição de área */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Área de Cobertura</h3>
                    <p className="text-xs sm:text-sm text-blue-700">
                      Atendemos exclusivamente o <strong>Tayamã Park, Campo Grande/MS</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* CEP */}
              <div>
                <label htmlFor="cep" className="block text-sm font-semibold text-gray-700 mb-2">
                  CEP *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${cepError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    maxLength={9}
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                    {isLoadingCep ? (
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                    ) : (
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {cepError && <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  {cepError}
                </p>}
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-3">
                  <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                    Rua *
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="number" className="block text-sm font-semibold text-gray-700 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Complemento e Bairro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="complement" className="block text-sm font-semibold text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Apt, Casa, Bloco..."
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-semibold text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all text-sm sm:text-base"
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              {/* Endereço Principal */}
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  Definir como endereço principal
                </label>
              </div>

              {/* Status da validação de localização */}
              {(isValidatingLocation || isLocationValid !== null || locationError) && (
                <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${isLocationValid === true ? 'bg-green-50 border-green-200' :
                  isLocationValid === false ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                  <div className="flex-shrink-0">
                    {getLocationStatusIcon()}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${getLocationStatusColor()}`}>
                    {isValidatingLocation ? 'Validando localização...' :
                      isLocationValid === true ? 'Endereço dentro da área permitida ✓' :
                        locationError || 'Validando localização...'}
                  </span>
                </div>
              )}

              {/* Instruções para Segurança - Mobile */}
              <div className="xl:hidden">
                <label htmlFor="description-mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Instruções para a Equipe de Segurança
                  </div>
                </label>
                <textarea
                  id="description-mobile"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Ex: Trabalho de segunda a sexta e chego em casa às 18h..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all resize-none text-sm sm:text-base"
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 mt-auto">
                <button
                  type="submit"
                  disabled={isValidatingLocation || isLocationValid === false}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm sm:text-base font-medium ${isValidatingLocation || isLocationValid === false
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </button>

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Visualização - Lado Direito (Desktop apenas) */}
            <div className="hidden xl:flex xl:flex-col gap-6 order-2">
              {/* Mapa/Casa */}
              <div className="space-y-4">
                <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex h-64 items-center justify-center overflow-hidden">
                  {/* Simulação de mapa com casa */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-8 h-6 bg-green-600 rounded"></div>
                    <div className="absolute top-12 right-8 w-12 h-8 bg-green-500 rounded"></div>
                    <div className="absolute bottom-8 left-12 w-6 h-10 bg-green-700 rounded"></div>
                    <div className="absolute bottom-4 right-4 w-10 h-6 bg-green-600 rounded"></div>
                  </div>

                  {/* Casa principal */}
                  <div className="relative z-10 text-center">
                    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-200">
                      <Home className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Sua Residência</p>
                      {formData.street && formData.number && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.street}, {formData.number}
                        </p>
                      )}
                    </div>

                    {/* Indicador de localização */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className={clsx(
                        "w-4 h-4 rounded-full border-2 border-white shadow-lg",
                        isLocationValid === true ? "bg-green-500" : "bg-red-500")}></div>
                    </div>
                  </div>

                  {/* Efeito de pulsação no marcador */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full opacity-30 animate-ping"></div>
                  </div>
                </div>

                {/* Instruções para Segurança - Desktop */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Instruções para a Equipe de Segurança
                    </div>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    placeholder={`Ex: Trabalho de segunda a sexta e chego em casa às 18h, mas minha família chega às 17h, então tome mais cuidado das 16:30 até às 18:30. Tenho um Honda Civic preto e minha mulher um Corolla branco.

Por favor, cuidado redobrado com o matagal nos fundos de casa.`}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Dicas de Segurança */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  Dicas para Instruções Eficazes
                </h3>

                <div className="space-y-3 text-sm text-amber-700">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Horários:</strong> Informe quando você e sua família chegam/saem</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <Car className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Veículos:</strong> Descreva modelo, cor e onde costuma estacionar</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Pontos de Atenção:</strong> Áreas que precisam de cuidado especial</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <Home className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p><strong>Características:</strong> Detalhes únicos da sua propriedade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};