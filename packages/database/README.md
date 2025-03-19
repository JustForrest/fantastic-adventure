# Database Package

This package contains the database schema and client for the application, using Prisma as an ORM.

## Features

- PostgreSQL database with PostGIS extension
- Type-safe queries with Prisma client
- Multi-tenant data isolation
- Database migrations and seeding

## Setup

The database package is automatically set up when you run:

```bash
# From the root directory
npm run setup
```

This will:
1. Generate the Prisma client
2. Run database migrations
3. Seed the database with initial data

## Geospatial Support

The schema includes support for geospatial data. We're using standard latitude and longitude fields with PostGIS extension for advanced geospatial queries:

```prisma
model Location {
  id          String    @id @default(cuid())
  propertyId  String    @unique
  property    Property  @relation(fields: [propertyId], references: [id])
  // Store coordinates as separate fields
  latitude    Float
  longitude   Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Working with Locations in Code

You can use standard Prisma operations for basic CRUD:

```typescript
import { prisma } from '@repo/database';

// Example: Create a location
export async function createLocation(propertyId: string, lat: number, lng: number) {
  return prisma.location.create({
    data: {
      propertyId,
      latitude: lat,
      longitude: lng
    }
  });
}

// Example: Find locations within radius (requires PostGIS functions via raw SQL)
export async function findLocationsWithinRadius(lat: number, lng: number, radiusInMeters: number) {
  // Using prisma.$queryRaw to execute PostGIS functions
  return prisma.$queryRaw`
    SELECT l.*, p.*,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ST_SetSRID(ST_MakePoint(l."longitude", l."latitude"), 4326)::geography
    ) as distance
    FROM "Location" l
    JOIN "Property" p ON p.id = l."propertyId"
    WHERE ST_DWithin(
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ST_SetSRID(ST_MakePoint(l."longitude", l."latitude"), 4326)::geography,
      ${radiusInMeters}
    )
    ORDER BY distance ASC
  `;
}

## Multi-tenant Data Isolation

The schema is designed with multi-tenancy in mind. Each table that needs tenant isolation includes a `tenantId` field and appropriate indexes.

```prisma
model Property {
  id          String      @id @default(cuid())
  tenantId    String
  // ...other fields
  tenant      Tenant      @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}
```

When querying the database, always include the tenant ID in your queries to ensure data isolation:

```typescript
const properties = await prisma.property.findMany({
  where: {
    tenantId: currentTenantId,
    // ...other filters
  },
});
``` 