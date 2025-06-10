# SystemPulse 📊

Monitor de Sistema em Tempo Real com Dashboard Interativo

## Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Chart.js
- **Backend**: Nest.js, Socket.io, TypeORM
- **Database**: PostgreSQL, Redis
- **Real-time**: WebSockets

## Como Executar

### 1. Clone o repositório
```bash
git clone <seu-repo>
cd systempulse
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

### 3. Inicie os serviços (PostgreSQL + Redis)
```bash
docker-compose up -d
```

### 4. Backend
```bash
cd backend
npm install
npm run start:dev
```

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

- 📈 Métricas em tempo real (CPU, Memória, Disco, Rede)
- 🔄 Atualizações automáticas via WebSocket
- 📊 Gráficos interativos e histórico
- 🚨 Sistema de alertas configuráveis
- 📱 Design responsivo
- 🌙 Tema escuro/claro

## Estrutura do Projeto

```
systempulse/
├── frontend/     # Next.js App
├── backend/      # Nest.js API
└── docker-compose.yml
```