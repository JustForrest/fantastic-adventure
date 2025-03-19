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

## PostGIS Integration

The schema includes PostGIS support for geospatial queries. However, Prisma doesn't natively support PostGIS types, so we use the `Unsupported` type:

```prisma
model Location {
  id          String    @id @default(cuid())
  propertyId  String    @unique
  property    Property  @relation(fields: [propertyId], references: [id])
  // PostGIS geometry field, will be used via raw SQL
  geom        Unsupported("geometry(Point, 4326)")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Working with PostGIS in Code

Since Prisma doesn't support PostGIS types natively, you'll need to use raw SQL queries for geospatial operations:

```typescript
import { prisma } from '@repo/database';

// Example: Create a location with PostGIS point
export async function createLocation(propertyId: string, lat: number, lng: number) {
  // Use raw SQL to insert a point
  return prisma.$executeRaw`
    INSERT INTO "Location" (id, "propertyId", geom, "createdAt", "updatedAt")
    VALUES (
      ${cuid()},
      ${propertyId},
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
      NOW(),
      NOW()
    )
  `;
}

// Example: Find properties within a certain distance (in meters)
export async function findPropertiesNearby(lat: number, lng: number, radiusInMeters: number) {
  const properties = await prisma.$queryRaw`
    SELECT p.*, 
           ST_Distance(
             l.geom::geography, 
             ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
           ) as distance
    FROM "Property" p
    JOIN "Location" l ON p.id = l."propertyId"
    WHERE ST_DWithin(
      l.geom::geography,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ${radiusInMeters}
    )
    ORDER BY distance
  `;
  
  return properties;
}
```

### Useful PostGIS Functions

Here are some common PostGIS functions that you may use in your application:

1. **Create a point**:
   ```sql
   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
   ```

2. **Calculate distance between points (in meters)**:
   ```sql
   ST_Distance(
     geom1::geography,
     geom2::geography
   )
   ```

3. **Find points within a radius**:
   ```sql
   ST_DWithin(
     geom1::geography,
     geom2::geography,
     radius_in_meters
   )
   ```

4. **Convert from PostGIS to GeoJSON**:
   ```sql
   ST_AsGeoJSON(geom)
   ```

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