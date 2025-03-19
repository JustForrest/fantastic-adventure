<div align="center">
  <h1>Fantastic Adventure</h1>
  <p><em>A ready-to-use web application boilerplate with multi-tenancy support</em></p>
  
  <p>
    <a href="#getting-started">Getting Started</a> •
    <a href="#customization">Customization</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#features">Features</a> •
    <a href="#prerequisites">Prerequisites</a>
  </p>
</div>

---

## 🚀 Overview

This boilerplate provides a production-ready foundation for building scalable web applications with built-in multi-tenant capabilities. Use this template to accelerate development of your next SaaS project or custom web application.

## 🏁 Getting Started

```bash
# Clone this repository
git clone https://github.com/yourusername/fantastic-adventure.git
cd fantastic-adventure

# Run the setup script to configure your environment
npm run setup

# Start development mode
npm run dev
```

After running the setup script, you'll have a fully configured development environment with sample data. Access the application at http://localhost:3000 with default credentials:
- Email: admin@example.com
- Password: admin123

## 🔧 Customization

### Adding New Features

1. **Create a new database model**:
   - Add your model to `packages/database/prisma/schema.prisma`
   - Run `npm run db:generate` to update Prisma client
   - Run `npm run db:migrate` to update your database

2. **Add a new API endpoint**:
   - Create a new route in `apps/api/src/routes/`
   - Register the route in `apps/api/src/app.ts`

3. **Create a new UI component**:
   - Add components to `packages/ui/src/components/`
   - Import in your Next.js pages or components

### Multi-tenant Customization

The application supports multi-tenant configuration out-of-the-box:

1. **Add a new tenant**:
   - Use the admin interface or directly through Prisma
   - Configure domain, theme colors, and other settings
   
2. **Configure tenant-specific features**:
   - Each tenant can have unique branding, permissions, and data
   - Tenant isolation is handled at the database and application levels

## 📦 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Or use production-specific profile
docker-compose --profile prod up -d
```

### Cloud Deployment

The application is designed to be easily deployed to cloud providers:

1. **Database**: Use managed PostgreSQL services
2. **API & Web**: Deploy as containerized services or serverless functions
3. **Search**: Use managed search services or deploy Typesense standalone

## ✨ Features

- **Multi-tenant Architecture** — Securely host multiple organizations
- **Role-based Permissions** — Flexible access control
- **Integrated Search** — Fast, responsive search capability
- **Type Safety** — End-to-end TypeScript with Prisma
- **Modern Frontend** — Next.js with Tailwind CSS
- **Docker Ready** — Containerized for easy deployment

## 📋 Prerequisites

- Node.js 18 LTS (v18.18.0 or later)
- Docker and Docker Compose for containerized development
- PostgreSQL 14+ (auto-configured with Docker)

## PostgreSQL Extensions

This project includes the following PostgreSQL extensions:

- **pgcrypto**: Cryptographic functions for secure data storage
- **PostGIS**: Spatial and geographic objects support
- **pg_stat_statements**: SQL query performance tracking
- **pg_trgm**: Text similarity search and indexing

### Example Usage

#### pgcrypto
```sql
-- Encrypt sensitive data
SELECT encrypt('sensitive data', 'key', 'aes');
```

#### PostGIS
```sql
-- Create a point from latitude and longitude
SELECT ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
```

#### pg_stat_statements
```sql
-- View performance statistics for queries
SELECT query, calls, total_exec_time, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

#### pg_trgm
```sql
-- Create a GIN index for fast text search
CREATE INDEX trgm_idx ON your_table USING GIN (column gin_trgm_ops);

-- Find similar strings
SELECT * FROM your_table WHERE column % 'search term';
```
```

These changes will add support for all the PostgreSQL extensions you requested. The extensions will be automatically enabled when the database container is first initialized, and the documentation will help your users understand how to use these powerful features.

Would you like me to make any additional changes to support these extensions more fully in your application code?

## 📄 License

This project is licensed under the [MIT License](LICENSE).