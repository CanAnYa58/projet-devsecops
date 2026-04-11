# Stock Tracker - Microservices Architecture

A modern stock tracking application built with a microservices architecture using NestJS, Next.js, and PostgreSQL, deployable to AWS ECS.

## 🏗️ Architecture

This application follows a microservices architecture pattern with the following components:

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
│  Port 3000  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │
│  (NestJS)   │
│  Port 3001  │
└──────┬──────┘
       │
       ├────────────────┬────────────────┐
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Market     │ │  Portfolio   │ │  PostgreSQL  │
│   Service    │ │   Service    │ │   Database   │
│  (NestJS)    │ │  (NestJS)    │ │  Port 5432   │
│  Port 3002   │ │  Port 3003   │ └──────────────┘
└──────────────┘ └──────────────┘
```

### Services

- **Frontend (Next.js)**: User interface for viewing stocks, managing portfolios, and favorites
- **API Gateway (NestJS)**: Single entry point that routes requests to appropriate microservices
- **Market Service (NestJS)**: Handles all market data operations (quotes, search, historical data, ETFs)
- **Portfolio Service (NestJS)**: Manages user portfolios and favorites with PostgreSQL persistence

## 🚀 Features

- Real-time stock quotes and market data
- Search for stocks, ETFs, and indices
- Historical price charts
- Portfolio management
- Favorites tracking
- Responsive design with Tailwind CSS
- Microservices architecture
- Docker containerization
- AWS ECS deployment ready

## 🛠️ Technology Stack

### Backend
- **NestJS**: TypeScript framework for building scalable server-side applications
- **Yahoo Finance API**: Real-time market data
- **PostgreSQL**: Relational database for portfolio data
- **TypeORM**: ORM for database operations

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library
- **Zustand**: State management (for local state)

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Local development orchestration
- **Terraform**: Infrastructure as Code
- **AWS ECS**: Container orchestration
- **AWS RDS**: Managed PostgreSQL
- **GitHub Actions**: CI/CD pipeline

## 📋 Prerequisites

- **Node.js** 20 or higher
- **Docker** and **Docker Compose**
- **AWS Account** (for deployment)
- **Terraform** (for infrastructure provisioning)

## 🏃‍♂️ Quick Start

### Local Development with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd projet-devsecops
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:3001
   - Market Service: http://localhost:3002
   - Portfolio Service: http://localhost:3003

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

### Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml up
```

### Manual Setup (without Docker)

1. **Install PostgreSQL** and create database:
   ```sql
   CREATE DATABASE stocktracker;
   ```

2. **Setup each service:**

   **Market Service:**
   ```bash
   cd services/market-service
   npm install
   cp .env.example .env
   npm run start:dev
   ```

   **Portfolio Service:**
   ```bash
   cd services/portfolio-service
   npm install
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   npm run start:dev
   ```

   **API Gateway:**
   ```bash
   cd services/api-gateway
   npm install
   cp .env.example .env
   npm run start:dev
   ```

   **Frontend:**
   ```bash
   npm install
   cp .env.local.example .env.local
   npm run dev
   ```

## 🌐 AWS Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Setup AWS credentials:**
   ```bash
   aws configure
   ```

2. **Deploy infrastructure:**
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

3. **Configure GitHub Secrets:**
   - `AWS_ACCOUNT_ID`
   - `AWS_DEPLOY_ROLE_ARN` (output `github_actions_deploy_role_arn` from Terraform)

4. **Configure GitHub Variables:**
   - `DAST_TARGET_URL` (optional, URL scanned by OWASP ZAP after deployment)

4. **Push to main branch** to trigger deployment:
   ```bash
   git push origin main
   ```

## 📁 Project Structure

```
projet-devsecops/
├── app/                    # Next.js frontend
│   ├── api/               # Legacy API routes (deprecated)
│   ├── favorites/         # Favorites page
│   ├── portfolio/         # Portfolio page
│   └── stocks/            # Stock details page
├── components/            # React components
├── lib/                   # Shared utilities
│   ├── api.ts            # API client for microservices
│   ├── store.ts          # Local state management
│   └── utils.ts          # Utility functions
├── services/              # Microservices
│   ├── api-gateway/      # API Gateway service
│   ├── market-service/   # Market data service
│   └── portfolio-service/# Portfolio management service
├── terraform/             # Infrastructure as Code
│   ├── main.tf           # Main Terraform configuration
│   └── ecs.tf            # ECS resources
├── .github/
│   └── workflows/
│       └── deploy-aws.yml # CI/CD pipeline
├── docker-compose.yml     # Production compose file
├── docker-compose.dev.yml # Development compose file
├── Dockerfile             # Frontend Dockerfile
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### API Gateway (.env)
```env
PORT=3001
MARKET_SERVICE_URL=http://localhost:3002
PORTFOLIO_SERVICE_URL=http://localhost:3003
FRONTEND_URL=http://localhost:3000
```

#### Market Service (.env)
```env
PORT=3002
```

#### Portfolio Service (.env)
```env
PORT=3003
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=stocktracker
NODE_ENV=development
```

## 🧪 Testing

Run tests for each service:

```bash
# API Gateway
cd services/api-gateway
npm test

# Market Service
cd services/market-service
npm test

# Portfolio Service
cd services/portfolio-service
npm test
```

## 📊 Monitoring

### CloudWatch Logs (AWS)
- `/ecs/stocktracker/api-gateway`
- `/ecs/stocktracker/market-service`
- `/ecs/stocktracker/portfolio-service`
- `/ecs/stocktracker/frontend`

### Local Logs
```bash
docker-compose logs -f [service-name]
```

## 🔐 Security

- API Gateway handles CORS
- PostgreSQL password is injected from AWS Secrets Manager in ECS
- AWS Secrets Manager recommended for production
- VPC isolation for ECS tasks
- Security groups restrict network access

### DevSecOps Controls

- CI gates on every PR: lint + unit tests
- SAST: Semgrep
- Secret scanning: Gitleaks
- IaC scanning: Checkov
- Policy-as-code: OPA/Conftest rules for Terraform in [security/opa/terraform.rego](security/opa/terraform.rego)
- Container image scanning in pipeline: Trivy (HIGH/CRITICAL blocking)
- Registry hardening: ECR scan-on-push, immutable tags, encryption, lifecycle policies
- Deployment authentication: GitHub OIDC role assumption (no static AWS keys in CI)

## 🚦 API Endpoints

### Market Data
- `GET /api/market` - Get market indices and popular stocks
- `GET /api/quote?symbols=AAPL,MSFT` - Get quotes for symbols
- `GET /api/search?q=apple` - Search for stocks
- `GET /api/history/:symbol` - Get historical data
- `GET /api/etfs` - Get popular ETFs

### Portfolio
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:symbol` - Remove from favorites
- `GET /api/portfolio` - Get portfolio holdings
- `POST /api/portfolio` - Add holding
- `PUT /api/portfolio/:id` - Update holding
- `DELETE /api/portfolio/:id` - Remove holding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Yahoo Finance API for market data
- NestJS for the excellent framework
- Next.js team for the amazing React framework
- AWS for cloud infrastructure

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This application is for educational purposes. Always verify market data with official sources before making investment decisions.
