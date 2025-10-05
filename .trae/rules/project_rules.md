# Regras e Padrões do Projeto Giroflex

## 📋 Visão Geral do Projeto

**Giroflex** é uma aplicação Next.js para monitoramento tático, rondas, escoltas e vigilância patrimonial. O projeto utiliza tecnologias modernas e segue padrões estabelecidos para garantir qualidade e manutenibilidade.

## 🏗️ Arquitetura e Stack Tecnológica

### Stack Principal
- **Framework**: Next.js 15.3.4 (App Router)
- **Linguagem**: TypeScript 5 (Strict Mode)
- **UI Framework**: React 19
- **Styling**: TailwindCSS 4 + Shadcn/UI (New York Style)
- **State Management**: Zustand + Jotai
- **Backend**: Appwrite (BaaS)
- **Pagamentos**: Stripe
- **Validação**: Zod + React Hook Form
- **Ícones**: Lucide React
- **Notificações**: Sonner

### Dependências Principais Detectadas
```json
{
  "next": "15.3.4",
  "react": "^19.0.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "zustand": "^5.0.6",
  "appwrite": "^18.1.1",
  "stripe": "^18.4.0",
  "zod": "^3.25.76",
  "react-hook-form": "^7.60.0"
}
```

## 📁 Estrutura de Projeto (Padrão Estabelecido)

```
giroflex/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/            # Route groups para autenticação
│   │   ├── [id]/              # Dynamic routes
│   │   ├── api/               # API routes
│   │   ├── onboarding/        # Fluxo de onboarding
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout raiz
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── animations/       # Componentes de animação
│   │   ├── dashboard/        # Componentes do dashboard
│   │   ├── invite/           # Sistema de convites
│   │   └── [feature]/        # Componentes por feature
│   ├── hooks/                # Custom hooks
│   │   ├── use-mobile.ts     # Hook para detecção mobile
│   │   ├── use-addresses.ts  # Hook para endereços
│   │   └── use-permissions.ts # Hook para permissões
│   ├── lib/                  # Utilitários e configurações
│   │   ├── appwrite.ts       # Configuração Appwrite
│   │   ├── constants.ts      # Constantes do projeto
│   │   ├── utils.ts          # Utilitários (cn function)
│   │   └── schemas/          # Schemas de validação
│   ├── services/             # Camada de serviços
│   │   ├── auth.service.ts   # Serviços de autenticação
│   │   ├── company.service.ts # Serviços de empresa
│   │   └── website.service.ts # Serviços de website
│   ├── stores/               # Estado global (Zustand)
│   │   ├── auth-store.ts     # Store de autenticação
│   │   ├── company-store.ts  # Store de empresa
│   │   └── website-store.ts  # Store de website
│   └── types/                # Definições TypeScript
│       ├── user.type.ts      # Tipos de usuário
│       ├── company.type.ts   # Tipos de empresa
│       └── *.type.ts         # Outros tipos
├── public/                   # Arquivos estáticos
├── components.json           # Configuração shadcn/ui
├── tsconfig.json            # Configuração TypeScript
├── eslint.config.mjs        # Configuração ESLint
└── package.json             # Dependências e scripts
```

## 📝 Convenções de Nomenclatura

### Arquivos e Pastas
- **Componentes**: `kebab-case.tsx` (ex: `auth-provider.tsx`)
- **Páginas**: `page.tsx`, `layout.tsx`, `not-found.tsx`
- **Dynamic Routes**: `[id].tsx`, `[...slug].tsx`
- **Route Groups**: `(auth)`, `(dashboard)`
- **Types**: `nome.type.ts` ou `nome.ts`
- **Services**: `nome.service.ts`
- **Stores**: `nome-store.ts`
- **Hooks**: `use-nome.ts`
- **Utilitários**: `kebab-case.ts`

### Código TypeScript/JavaScript
- **Variáveis/Funções**: `camelCase`
- **Componentes**: `PascalCase`
- **Interfaces**: `PascalCase` + sufixo `Interface` (ex: `UserInterface`)
- **Types**: `PascalCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Enums**: `PascalCase`

## 🧩 Padrões de Componentes

### Estrutura Padrão Detectada
```tsx
'use client'; // Apenas quando necessário

// 1. Imports externos (React, bibliotecas)
import * as React from "react";
import { SomeLibrary } from "some-library";

// 2. Imports internos (sempre @/ paths)
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 3. Types/Interfaces locais
interface ComponentProps {
  children: React.ReactNode;
  className?: string;
}

// 4. Componente principal
function Component({ children, className }: ComponentProps) {
  return (
    <div className={cn("default-classes", className)}>
      {children}
    </div>
  );
}

// 5. Export (padrão detectado)
export { Component };
```

### Padrões de Props
- Sempre definir interface para props
- Usar `React.ComponentProps<'element'>` para estender props nativas
- Destructuring obrigatório para props
- `className` sempre opcional para customização
- Usar `data-slot` para identificação de componentes (padrão shadcn/ui)

## 🎨 Sistema de Design e Styling

### TailwindCSS (Configuração Detectada)
- **Versão**: TailwindCSS 4
- **Estilo**: New York (shadcn/ui)
- **Base Color**: Neutral
- **CSS Variables**: Habilitado
- **Dark Mode**: Suporte completo

### Utility Function
```typescript
// lib/utils.ts - Padrão obrigatório
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Padrões de Styling
```tsx
// ✅ Sempre usar cn() para combinar classes
<div className={cn("flex items-center gap-2", className)} />

// ✅ Responsive design (mobile-first)
<div className="w-full md:w-1/2 lg:w-1/3" />

// ✅ Dark mode support
<div className="bg-background text-foreground" />

// ✅ Usar CSS variables do tema
<div className="bg-primary text-primary-foreground" />
```

### Componentes UI (Shadcn/UI)
- **Estilo**: New York
- **RSC**: Habilitado
- **Aliases**: Configurados no `components.json`
- **Icon Library**: Lucide React

## 🔄 Gerenciamento de Estado

### Zustand (Padrão Principal)
```typescript
// Estrutura padrão detectada
interface StoreState {
  // Estado
  data: DataType | null;
  isLoading: boolean;
  isAuthenticated: boolean;

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
      isAuthenticated: false,

      // Actions com tratamento de erro
      fetchData: async () => {
        set({ isLoading: true });
        try {
          const data = await api.getData();
          set({ data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'store-name',
      partialize: (state) => ({
        // Apenas dados que devem persistir
        data: state.data,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
```

### Jotai (Estado Atômico)
- Usado para estado local complexo
- Complementa Zustand para casos específicos

## 🔐 Autenticação e Autorização

### Padrão Implementado
- **Provider**: `AuthProvider` no layout raiz
- **Store**: `useAuthStore` com persistência
- **Guards**: `ProtectedRoute` e `RoleGuard`
- **Service**: `AuthService` para operações

### Fluxo de Autenticação
1. `AuthProvider` verifica auth no mount
2. Estado persistido com Zustand
3. Guards protegem rotas sensíveis
4. Roles: `saas_owner`, `saas_client`, `company_owner`, etc.

## 🛠️ Services e API

### Padrão de Services
```typescript
// Estrutura padrão detectada
export class ServiceName {
  static async method(params: Type): Promise<ReturnType> {
    try {
      // Lógica do serviço
      return result;
    } catch (error) {
      // Tratamento de erro
      throw error;
    }
  }
}
```

### API Routes (Next.js)
- Localizadas em `src/app/api/`
- Seguem padrão REST
- Integração com Appwrite

## 📱 Responsividade

### Breakpoints (TailwindCSS)
```css
sm: 640px   /* Tablet pequeno */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeno */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### Abordagem Mobile-First
- Design responsivo obrigatório
- Testes em múltiplos dispositivos
- Hook `useIsMobile` para detecção

## 🧪 Qualidade e Testes

### ESLint (Configuração Detectada)
```javascript
// eslint.config.mjs
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

### TypeScript (Configuração Strict)
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🚀 Performance e Otimização

### Estratégias Implementadas
- **Code Splitting**: Automático com Next.js
- **Dynamic Imports**: Para componentes pesados
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Google Fonts (Geist)

### Monitoramento
- Core Web Vitals
- Bundle analysis
- Performance profiling

## 🔧 Scripts de Desenvolvimento

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 📚 Documentação e Recursos

### Documentação Oficial
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs)
- [Appwrite](https://appwrite.io/docs)

## 🔄 Workflow de Desenvolvimento

### Processo Padrão
1. Criar branch feature
2. Desenvolver seguindo padrões
3. Testar localmente (`npm run dev`)
4. Verificar lint (`npm run lint`)
5. Build de teste (`npm run build`)
6. Commit com mensagem descritiva
7. Pull request para review

### Padrão de Commits
```bash
feat: adiciona nova funcionalidade
fix: corrige bug específico
style: ajustes de estilo/formatação
refactor: refatoração de código
docs: atualização de documentação
perf: melhoria de performance
test: adição/correção de testes
```

## ⚠️ Restrições e Limitações

### Não Permitido
- Modificar configurações sem aprovação
- Usar `any` type sem justificativa
- Ignorar warnings do TypeScript
- Commits direto na branch principal
- Instalar dependências sem verificação

### Obrigatório
- Seguir padrões de nomenclatura
- Usar `@/` para imports internos
- Definir tipos para todas as props
- Tratar erros em operações async
- Testar responsividade
- Documentar componentes complexos

## 🔄 Atualizações e Manutenção

### Versionamento
- Seguir Semantic Versioning
- Documentar breaking changes
- Manter changelog atualizado

### Revisão de Código
- Code review obrigatório
- Verificar padrões estabelecidos
- Testar funcionalidades
- Validar performance

---

**Última atualização**: Dezembro 2024  
**Versão do Projeto**: 0.1.0  
**Responsável**: Equipe de Desenvolvimento Giroflex