# Sistema de Gerenciamento de Endereços

Este sistema permite gerenciar endereços com validação de localização no Tayamã Park (Campo Grande/MS) e integração com Google Maps.

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_ADDRESSES_COLLECTION_ID=your_addresses_collection_id

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. Configuração do Appwrite

1. Crie um banco de dados no Appwrite
2. Crie uma coleção chamada `addresses` com os seguintes atributos:
   - `cep` (string, required)
   - `street` (string, required)
   - `number` (string, required)
   - `complement` (string, optional)
   - `neighborhood` (string, required)
   - `city` (string, required)
   - `state` (string, required)

3. Configure as permissões da coleção para permitir leitura/escrita para usuários autenticados

### 3. Google Maps API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative as seguintes APIs:
   - Maps JavaScript API
   - Geocoding API
4. Crie uma chave de API e configure as restrições necessárias

## Funcionalidades

- ✅ Cadastro de endereços com validação de CEP via ViaCEP
- ✅ Validação de localização (apenas endereços no Tayamã Park)
- ✅ Visualização no Google Maps
- ✅ Edição e exclusão de endereços
- ✅ Persistência de dados no Appwrite
- ✅ Interface responsiva integrada ao dashboard

## Estrutura de Arquivos

```
src/
├── app/dashboard/mapa/
│   └── page.tsx                 # Página principal do mapa
├── components/
│   ├── address-form.tsx         # Formulário de endereço
│   ├── address-list.tsx         # Lista de endereços
│   └── address-map.tsx          # Componente do mapa
├── hooks/
│   └── use-addresses.ts         # Hook para gerenciar endereços
├── lib/
│   ├── appwrite.ts              # Configuração do Appwrite
│   ├── geocoding.service.ts     # Serviços de geocodificação
│   └── via-cep.service.ts       # Serviço ViaCEP
└── types/
    └── address.type.ts          # Tipos TypeScript
```

## Uso

1. Acesse `/dashboard/mapa` após fazer login
2. Clique em "Adicionar Novo Endereço"
3. Preencha o CEP para busca automática
4. Complete os demais campos
5. O sistema validará se o endereço está no Tayamã Park
6. Visualize os endereços no mapa

## Área Restrita

O sistema aceita apenas endereços localizados no **Tayamã Park, Campo Grande/MS**. A validação é feita através de:

- Geocodificação do endereço
- Verificação se está dentro do polígono definido
- Validação de proximidade e nome do bairro 

https://github.com/user-attachments/assets/d61fc4c9-4f46-4cd0-9d6b-d1edf9f493af

## SETUP STRIPE

1. Vá para o site do Stripe `https://stripe.com/br`
2. Crie uma nova conta
3. Copie as API keys (Publishable key e Secret key)
4. Cole ela no arquivo `.env-example` e renomeie ele para `.env`
5. Baixe o [node](https://nodejs.org/pt/download) em sua maquina
5. Instale as dependencias com `npm install`
6. Execute o programa com `npm run dev`

### Stripe CLI

> [!NOTE]
> O webhook é necessário para que o Stripe possa enviar os eventos de atualizações de planos, produtos e preços para a aplicação.

1. Faça download do [Stripe CLI](https://docs.stripe.com/stripe-cli) (Webhook)
2. Execute `stripe login` e autentique sua conta
3. Execute `stripe listen --forward-to http://localhost:3000/api/webhook/stripe`
4. Copie o webhook secret key e adicione ele na chave `STRIPE_WEBHOOK_SECRET` do arquivo `.env`

> [!NOTE]
> Sugiro colocar os terminais da aplicação e do webhook um ao lado do outro.

5. Acesse o dashboard do stripe
6. Crie um novo produto e um novo preço em `Catalogo de Produtos`
7. A oferta ficará visivel na pagina `http://localhost:3000`