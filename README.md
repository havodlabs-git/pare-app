# Pare! - Aplicativo de Controle de Vícios

Aplicativo de celular, extensão do navegador e executável Windows que ajuda você a controlar seus vícios.

##  🎯 Objetivo

Inicialmente focado no controle de pornografia, o aplicativo redireciona o usuário quando ele tenta acessar sites pornográficos, levando-o para uma plataforma com instruções e motivação para parar de ver pornografia.

## 🚀 Funcionalidades

- **Dashboard Moderno**: Acompanhe seu progresso diário
- **Sistema de Conquistas**: Ganhe pontos e níveis conforme progride
- **Estatísticas Detalhadas**: Visualize seu histórico e streaks
- **Fórum Comunitário**: Compartilhe experiências e apoie outros usuários
- **Frases Motivacionais**: Receba inspiração diária
- **Múltiplos Módulos**: Controle diferentes vícios (pornografia, redes sociais, cigarro, álcool, compras compulsivas)
- **Planos Premium**: Recursos adicionais para usuários pagantes

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **TailwindCSS 4** para estilização
- **Radix UI** para componentes acessíveis
- **Lucide React** para ícones
- **LocalStorage** para persistência de dados

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

## 🎨 Estrutura do Projeto

```
pare-app/
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes UI reutilizáveis
│   │   ├── Dashboard.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── Achievements.tsx
│   │   ├── Stats.tsx
│   │   ├── Forum.tsx
│   │   └── ...
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Ponto de entrada
├── styles/
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 📱 Planos Futuros

- [ ] Extensão para navegadores (Chrome, Firefox, Edge)
- [ ] Aplicativo mobile (iOS e Android)
- [ ] Executável Windows
- [ ] Sistema de bloqueio de sites
- [ ] Integração com terapeutas
- [ ] Grupos de apoio online

## 📄 Licença

Este projeto está em desenvolvimento.
