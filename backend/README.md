# Amdox ERP Suite Backend

A comprehensive NestJS-based backend API for the Amdox ERP Suite, built with TypeScript, PostgreSQL, and TypeORM.

## Features

- **Multi-tenant Architecture**: Support for multiple organizations
- **Role-Based Access Control**: SuperAdmin, TenantAdmin, Manager, Viewer roles
- **ERP Modules**:
  - Finance (Accounts Payable/Receivable, General Ledger)
  - HR & Payroll (Employee Management, Leave Tracking, Payroll Processing)
  - Supply Chain (Inventory, Purchase Orders, Vendor Management)
  - Project Management (Projects, Tasks, Milestones)
  - Business Intelligence (Analytics, Reports, KPIs)
  - Dashboard & Notifications
- **Authentication**: JWT-based authentication with tenant isolation
- **API Documentation**: Swagger/OpenAPI documentation
- **Database**: PostgreSQL with TypeORM ORM

## Database Recommendation

### PostgreSQL (Recommended)
PostgreSQL is the recommended database as it's already used by Supabase and provides excellent support for complex queries and transactions.

#### Setup Options:

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb amdox_erp

# Create user
sudo -u postgres psql
CREATE USER amdox_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE amdox_erp TO amdox_user;
```

**Option 2: Docker PostgreSQL**
```bash
docker run --name amdox-postgres \
  -e POSTGRES_DB=amdox_erp \
  -e POSTGRES_USER=amdox_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

**Option 3: Supabase (Recommended)**
Since your frontend already uses Supabase, you can:
1. Use the same Supabase project
2. Enable PostgreSQL connection pooling
3. Use the connection string in your backend

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your database configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amdox_erp
DB_USER=amdox_user
DB_PASSWORD=your_password_here
DB_SSL=false

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

3. **Database Setup**
Run the SQL migrations from your frontend Supabase migrations:
```bash
# Import all migration files
psql -h localhost -U amdox_user -d amdox_erp -f path/to/migrations/*.sql
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Documentation

Once running, visit:
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Profiles
- `GET /api/profiles` - List all profiles (tenant-scoped)
- `POST /api/profiles` - Create new profile
- `GET /api/profiles/:id` - Get specific profile
- `PATCH /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### ERP Modules (to be implemented)
- `/api/finance` - Finance module
- `/api/hr` - HR & Payroll module
- `/api/supply-chain` - Supply Chain module
- `/api/projects` - Project Management module
- `/api/bi` - Business Intelligence module
- `/api/dashboard` - Dashboard data
- `/api/notifications` - Notifications

## Database Schema

The backend is designed to work with the following main entities:

### Core Entities
- **Tenants**: Multi-tenant organizations
- **Profiles**: User profiles with role-based access
- **KPI Metrics**: Dashboard KPI data
- **Activities**: Activity feed entries
- **Notifications**: User notifications

### Finance Module
- Chart of Accounts
- Journal Entries
- AP/AR Invoices
- Fiscal Periods

### HR Module
- Employees
- Leave Requests & Balances
- Payroll Runs & Items

## Security Features

- **Tenant Isolation**: All data is scoped to the user's tenant
- **Role-Based Access Control**: Different permissions for different roles
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation with class-validator
- **Rate Limiting**: Built-in rate limiting to prevent abuse

## Development

### Adding New Modules

1. Create entity in `src/entities/`
2. Create module in `src/[module-name]/`
3. Add module to `app.module.ts`
4. Create controller, service, and DTOs

### Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | amdox_erp |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## License

MIT
