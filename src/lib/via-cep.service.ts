interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export const fetchAddressByCep = async (cep: string): Promise<ViaCepResponse | null> => {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro na requisição');
    }
    
    const data = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

export const formatCep = (cep: string): string => {
  const cleanCep = cep.replace(/\D/g, '');
  return cleanCep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}; 