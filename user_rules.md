# Regras do Usuário - Frontend Junior (Windows)

## 👨‍💻 Perfil do Desenvolvedor
- **Nível**: Frontend Junior
- **Sistema**: Windows
- **Linguagem Principal**: JavaScript/TypeScript
- **Foco**: Desenvolvimento de interfaces e componentes React

## 🛠️ Ambiente de Desenvolvimento

### Ferramentas Essenciais
- **Editor**: TRAE (VS Code) com extensões React/TypeScript
- **Terminal**: PowerShell ou Git Bash
- **Package Manager**: npm (padrão do projeto)
- **Browser**: Edge

### Comandos Básicos
```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificação de código
npm run start        # Servidor de produção

# Instalação de dependências
npm install          # Instala todas as dependências
npm install [pacote] # Instala novo pacote
```

## 📁 Estrutura de Arquivos (Padrões Detectados)

### Nomenclatura de Arquivos
- **Componentes**: `kebab-case.tsx` (ex: `auth-provider.tsx`)
- **Páginas**: `page.tsx`, `layout.tsx`, `[dynamic].tsx`
- **Hooks**: `use-nome.ts` (ex: `use-mobile.ts`)
- **Types**: `nome.type.ts`
- **Services**: `nome.service.ts`
- **Stores**: `nome-store.ts`

### Organização de Pastas
```
src/
├── app/           # Páginas (App Router Next.js)
├── components/    # Componentes React
│   └── ui/       # Componentes base (shadcn/ui)
├── hooks/        # Custom hooks
├── lib/          # Utilitários e configurações
├── services/     # Camada de serviços (Fetch de API e SDK Appwrite)
├── stores/       # Estado global (Zustand)
└── types/        # Definições TypeScript
```

## 🧩 Padrões de Componentes

### Estrutura Básica de Componente
```tsx
'use client'; // Apenas se necessário (interatividade)

// 1. Imports externos (React, bibliotecas)
import React from 'react';
import { SomeLibrary } from 'some-library';

// 2. Imports internos (sempre usar @/)
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 3. Definir tipos/interfaces
interface ComponentProps {
  children: React.ReactNode;
  className?: string;
  // Sempre definir props opcionais com ?
}

// 4. Componente principal
export function Component({ children, className }: ComponentProps) {
  return (
    <div className={cn('classes-padrão', className)}>
      {children}
    </div>
  );
}

// 5. Export default (se for componente principal)
export default Component;
```

### Regras para Props
- Sempre definir interface para props
- Usar destructuring: `{ prop1, prop2 }`
- Propriedades opcionais com `?`
- Usar `React.ComponentProps<'element'>` para estender props nativas

## 🎨 Styling (TailwindCSS)

### Padrões Detectados
- **Framework**: TailwindCSS 4
- **Utility Function**: `cn()` para combinar classes
- **Responsive**: Mobile-first (`sm:`, `md:`, `lg:`)
- **Dark Mode**: Suporte com `dark:` prefix

### Boas Práticas
```tsx
// ✅ Correto - usar cn() para combinar classes
<div className={cn('flex items-center gap-2', className)} />

// ✅ Correto - responsive design
<div className="w-full md:w-1/2 lg:w-1/3" />

// ✅ Correto - dark mode
<div className="bg-white dark:bg-gray-900" />

// ❌ Evitar - classes muito longas inline
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:text-white" />
```

## 📊 Estado e Dados

### Zustand Stores (Padrão do Projeto)
```typescript
// Estrutura padrão detectada
interface StoreState {
  // Estado
  data: DataType | null;
  isLoading: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  updateData: (data: DataType) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      data: null,
      isLoading: false,
      
      // Actions
      fetchData: async () => {
        set({ isLoading: true });
        try {
          // lógica aqui
        } catch (error) {
          // sempre tratar erros
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'store-name',
      partialize: (state) => ({ data: state.data }),
    }
  )
);
```

### Custom Hooks
```typescript
// Padrão detectado no projeto
export function useCustomHook() {
  const [state, setState] = React.useState<Type | undefined>(undefined);

  React.useEffect(() => {
    // lógica do hook
  }, []);

  return state;
}
```

## 🔧 TypeScript (Configuração Detectada)

### Configurações Ativas
- **Strict Mode**: Habilitado
- **Path Mapping**: `@/*` para `./src/*`
- **Target**: ES2017

### Boas Práticas para Junior
```typescript
// ✅ Usar interface para objetos
interface User {
  name: string;
  email: string;
  age?: number; // opcional
}

// ✅ Usar type para unions
type Status = 'loading' | 'success' | 'error';

// ✅ Sempre tipar props de componentes
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// ✅ Usar optional chaining
const userName = user?.name ?? 'Usuário';
```

## 🚨 Tratamento de Erros (Para Junior)

### Padrões Obrigatórios
```typescript
// ✅ Sempre usar try/catch em operações async
const handleSubmit = async () => {
  try {
    setLoading(true);
    await api.submit(data);
    toast.success('Sucesso!');
  } catch (error) {
    console.error('Erro:', error);
    toast.error('Erro ao enviar dados');
  } finally {
    setLoading(false);
  }
};

// ✅ Estados de loading
const [isLoading, setIsLoading] = useState(false);

// ✅ Feedback para usuário (toast detectado no projeto)
import { toast } from 'sonner';
```

## 📱 Responsividade

### Breakpoints (TailwindCSS)
- **sm**: 640px (tablet pequeno)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop pequeno)
- **xl**: 1280px (desktop)

### Abordagem Mobile-First
```tsx
// ✅ Correto - mobile primeiro
<div className="w-full md:w-1/2 lg:w-1/3">

// ❌ Evitar - desktop primeiro
<div className="w-1/3 lg:w-1/2 md:w-full">
```

## 🔍 Debugging para Junior

### Ferramentas Básicas
```typescript
// ✅ Console.log para debug básico
console.log('Estado atual:', state);

// ✅ React DevTools (instalar extensão)
// ✅ Network tab para verificar APIs
// ✅ Verificar erros no console
```

### Checklist de Debug
1. Verificar console do browser
2. Verificar Network tab para APIs
3. Usar React DevTools para estado
4. Verificar se imports estão corretos
5. Verificar se tipos TypeScript estão corretos

## 📝 Commits e Versionamento

### Padrão de Commits
```bash
# Formato: tipo: descrição breve
feat: adiciona novo componente de login
fix: corrige bug no formulário
style: ajusta espaçamento do header
refactor: reorganiza estrutura de pastas
docs: atualiza documentação
```

## 📚 Recursos de Aprendizado

### Documentação Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com)

### Dicas para Junior
1. Sempre testar mudanças localmente
2. Ler mensagens de erro com atenção
3. Usar TypeScript para evitar bugs
4. Fazer commits pequenos e frequentes
5. Pedir ajuda quando necessário

## ⚠️ Restrições e Cuidados

### O que EVITAR
- Modificar arquivos de configuração sem orientação
- Instalar pacotes sem verificar compatibilidade
- Fazer commits direto na main/master
- Ignorar warnings do TypeScript
- Usar `any` type sem necessidade

### O que SEMPRE FAZER
- Usar `@/` para imports internos
- Definir tipos para props
- Tratar erros em operações async
- Testar em diferentes tamanhos de tela
- Seguir padrões de nomenclatura do projeto