# SystemPulse 📊

> Monitor de Sistema em Tempo Real com Dashboard Interativo

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Socket.io-green)](https://socket.io/)

## 🚀 Funcionalidades

- **📈 Métricas em Tempo Real**: CPU, Memória, Disco, Rede
- **🔄 WebSocket**: Atualizações automáticas a cada 2 segundos
- **📊 Gráficos Interativos**: Histórico com Chart.js
- **🚨 Sistema de Alertas**: Configuráveis com limites personalizados
- **📱 Design Responsivo**: Otimizado para desktop e mobile
- **🌙 Tema Adaptativo**: Modo claro e escuro
- **💾 Persistência**: Histórico completo no PostgreSQL
- **⚡ Performance**: Redis para cache e otimizações

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Chart.js** - Gráficos interativos
- **Socket.io Client** - Comunicação em tempo real

### Backend
- **NestJS** - Framework Node.js escalável
- **TypeORM** - ORM para TypeScript
- **Socket.io** - WebSocket para tempo real
- **Class Validator** - Validação de dados

### Infraestrutura
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **Docker** - Containerização

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **Docker** & **Docker Compose**
- **Git**

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/BrunoGabriel123/systempulse.git
cd systempulse
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` conforme necessário:
```bash
# Database
DATABASE_URL="postgresql://admin:admin123@localhost:5433/systempulse"
DB_PORT=5433

# Backend
BACKEND_PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
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

**✅ Backend rodando em**: `http://localhost:3001`

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```

**✅ Frontend rodando em**: `http://localhost:3000`

## 📖 Como Usar

### Dashboard Principal
1. Acesse `http://localhost:3000`
2. Veja métricas em tempo real
3. Clique em **"Mostrar Gráficos"** para visualizações avançadas

### Testando Alertas
```bash
# Simular carga alta (gera alertas)
curl -X POST http://localhost:3001/metrics/simulate/high

# Triggerar alertas de teste
curl -X POST http://localhost:3001/metrics/alerts/test

# Voltar ao normal
curl -X POST http://localhost:3001/metrics/simulate/low
```

### API Endpoints
```bash
# Métricas atuais
GET http://localhost:3001/metrics

# Histórico de métricas
GET http://localhost:3001/metrics/history

# Status do coletor
GET http://localhost:3001/metrics/collector/status

# Performance do servidor
GET http://localhost:3001/metrics/performance
```

## 🏗️ Estrutura do Projeto

```
systempulse/
├── 📁 frontend/              # Next.js App
│   ├── 📁 src/
│   │   ├── 📁 app/           # App Router
│   │   ├── 📁 components/    # Componentes React
│   │   ├── 📁 hooks/         # Custom Hooks
│   │   └── 📁 lib/           # Utilitários
│   └── 📄 package.json
├── 📁 backend/               # NestJS API
│   ├── 📁 src/
│   │   ├── 📁 metrics/       # Módulo de métricas
│   │   ├── 📁 websocket/     # WebSocket Gateway
│   │   └── 📁 database/      # Configuração DB
│   └── 📄 package.json
├── 📄 docker-compose.yml     # PostgreSQL + Redis
├── 📄 .env.example          # Variáveis de ambiente
└── 📄 README.md
```

## 🎯 Features Implementadas

- [x] ✅ Coleta de métricas mock em tempo real
- [x] ✅ Dashboard responsivo com gráficos
- [x] ✅ WebSocket para atualizações automáticas
- [x] ✅ Sistema de alertas configuráveis
- [x] ✅ Persistência em PostgreSQL
- [x] ✅ API REST completa
- [x] ✅ Design mobile-first
- [x] ✅ Gráficos interativos (Line, Donut)
- [x] ✅ Histórico de métricas
- [x] ✅ Sistema de notificações

## 🔍 Screenshots

### Dashboard Principal
![Dashboard](docs/dashboard.png)

### Gráficos em Tempo Real
![Gráficos](docs/charts.png)

### Sistema de Alertas
![Alertas](docs/alerts.png)

## 🚀 Deploy

### Docker (Recomendado)
```bash
# Build e execute tudo
docker-compose up --build

# Para produção
docker-compose -f docker-compose.prod.yml up -d
```

### Manual
1. Configure PostgreSQL e Redis
2. Build do backend: `npm run build`
3. Build do frontend: `npm run build`
4. Configure nginx/proxy reverso
5. Execute: `npm run start:prod`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Bruno Gabriel**
- GitHub: [@BrunoGabriel123](https://github.com/BrunoGabriel123)
- LinkedIn: [Bruno Gabriel](https://www.linkedin.com/in/bruno-gabriel-ti/)

---

⭐ Se este projeto te ajudou, não esqueça de dar uma estrela!

## 📚 Próximas Features

- [ ] 🔐 Sistema de autenticação
- [ ] 📧 Notificações por email
- [ ] 🐳 Métricas de containers Docker
- [ ] 📊 Relatórios automatizados
- [ ] 🌍 Suporte multi-servidor
- [ ] 🔌 Integração com Prometheus