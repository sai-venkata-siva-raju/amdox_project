# Amdox ERP Suite Backend

A comprehensive NestJS-based backend API for the Amdox ERP Suite, built with TypeScript, MongoDB, and Mongoose.

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
- **Database**: MongoDB with Mongoose ODM

## Database Recommendation

### MongoDB (Recommended)
MongoDB is the recommended database for this backend implementation. The app is now configured to use Mongoose models and a Mongo connection string from `MONGODB_URI`.

#### Setup Options:

**Option 1: Local MongoDB**
```bash
mongod --dbpath /path/to/data
```

**Option 2: Docker MongoDB**
```bash
docker run --name amdox-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=amdox \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  -p 27017:27017 \
  -d mongo:7
```

**Option 3: MongoDB Atlas**
Use your Atlas connection string in `MONGODB_URI`.

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
# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/amdox_erp
MONGODB_DB_NAME=amdox_erp

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
Seed data is created automatically for the demo tenant and admin user on startup.

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
| `MONGODB_URI` | Mongo connection string | mongodb://127.0.0.1:27017/amdox_erp |
| `MONGODB_DB_NAME` | Mongo database name | amdox_erp |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## License

MIT
