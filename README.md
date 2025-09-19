# Finance Control - Sistema de Controle Financeiro

Um sistema moderno e completo de controle e relatório de finanças pessoais, desenvolvido com Next.js, TypeScript, PostgreSQL e Prisma.

## 🚀 Características

- **Upload de arquivos OFX**: Importe transações diretamente do seu banco
- **Categorização automática**: Sistema inteligente de categorização de transações
- **Gráficos interativos**: Visualizações profissionais com Recharts
- **Dark/Light Mode**: Interface adaptável ao seu gosto
- **Filtros avançados**: Filtre por data, categoria, tipo e descrição
- **Exportação**: Exporte dados para Excel e gráficos como imagem
- **Design responsivo**: Funciona perfeitamente em desktop e mobile
- **Interface moderna**: Design minimalista com animações suaves

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Gráficos**: Recharts
- **UI Components**: Radix UI, Lucide Icons
- **Exportação**: XLSX, html2canvas

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd finance-control
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   - Crie um banco PostgreSQL
   - Configure a variável `DATABASE_URL` no arquivo `.env`
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/finance_control"
   ```

4. **Execute as migrações**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Popule o banco com categorias padrão**
   ```bash
   npx tsx seed.ts
   ```

6. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

7. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📁 Estrutura do Projeto

```
finance-control/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── analytics/     # Dados analíticos
│   │   │   ├── categories/    # Gerenciamento de categorias
│   │   │   ├── export/        # Exportação de dados
│   │   │   ├── transactions/  # Gerenciamento de transações
│   │   │   └── upload-ofx/    # Upload de arquivos OFX
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes React
│   │   ├── charts/           # Componentes de gráficos
│   │   ├── ui/               # Componentes de UI reutilizáveis
│   │   ├── dashboard-stats.tsx
│   │   ├── export-buttons.tsx
│   │   ├── file-upload.tsx
│   │   ├── filters.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── transaction-list.tsx
│   └── lib/                   # Utilitários e configurações
│       ├── ofx-parser.ts      # Parser de arquivos OFX
│       ├── prisma.ts          # Cliente Prisma
│       └── utils.ts           # Funções utilitárias
├── prisma/
│   ├── migrations/            # Migrações do banco
│   └── schema.prisma          # Schema do banco de dados
├── public/                    # Arquivos estáticos
├── .env                       # Variáveis de ambiente
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Funcionalidades

### Upload de Arquivos OFX
- Suporte completo ao formato OFX
- Validação de arquivos
- Prevenção de duplicatas
- Feedback visual do processo

### Categorização Automática
- Sistema inteligente baseado em palavras-chave
- Categorias pré-definidas (Alimentação, Transporte, etc.)
- Possibilidade de criar novas categorias

### Dashboard Analítico
- Cards com estatísticas principais
- Gráfico de pizza por categoria
- Gráfico de barras da evolução mensal
- Lista de transações recentes

### Filtros Avançados
- Filtro por período (data início/fim)
- Filtro por categoria
- Filtro por tipo (receita/despesa)
- Busca por descrição

### Exportação
- Exportação para Excel (.xlsx)
- Impressão da página
- Exportação de gráficos como PNG

### Temas
- Modo claro e escuro
- Transições suaves
- Persistência da preferência

## 🔄 API Endpoints

### Transações
- `GET /api/transactions` - Lista transações com paginação e filtros
- `PUT /api/transactions` - Atualiza categoria de uma transação

### Categorias
- `GET /api/categories` - Lista todas as categorias
- `POST /api/categories` - Cria nova categoria

### Upload
- `POST /api/upload-ofx` - Faz upload e processa arquivo OFX

### Analytics
- `GET /api/analytics` - Retorna dados analíticos e estatísticas

### Exportação
- `GET /api/export/excel` - Exporta transações para Excel

## 🎨 Design System

O projeto utiliza um design system baseado em:
- **Cores**: Sistema de cores semânticas com suporte a dark mode
- **Tipografia**: Fonte Geist para uma aparência moderna
- **Espaçamento**: Sistema consistente baseado em múltiplos de 4px
- **Componentes**: Biblioteca de componentes reutilizáveis
- **Animações**: Transições suaves e micro-interações

## 🔒 Segurança

- Validação de tipos de arquivo
- Sanitização de dados de entrada
- Prevenção de SQL injection com Prisma
- Validação de dados no backend

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deploy

Para fazer deploy em produção:

1. **Configure as variáveis de ambiente de produção**
2. **Execute o build**
   ```bash
   npm run build
   ```
3. **Inicie o servidor**
   ```bash
   npm start
   ```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:
1. Verifique a documentação
2. Procure por issues similares
3. Crie uma nova issue com detalhes do problema

---

Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento web moderno.

