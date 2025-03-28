import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default role
  const adminRole = await prisma.role.upsert({
    where: { id: 'admin-role' },
    update: {},
    create: {
      id: 'admin-role',
      name: 'Admin',
      permissions: [
        'manage_users',
        'manage_properties',
        'manage_listings',
        'manage_settings',
      ],
    },
  });

  const userRole = await prisma.role.upsert({
    where: { id: 'user-role' },
    update: {},
    create: {
      id: 'user-role',
      name: 'User',
      permissions: [
        'manage_properties',
        'manage_listings',
      ],
    },
  });

  console.log('Roles created:', { adminRole, userRole });

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { domain: 'localhost' },
    update: {},
    create: {
      name: 'Demo Organization',
      domain: 'localhost',
      schemaName: 'default',
      logoUrl: '/assets/logo.svg',
      themeColors: {
        primary: '#4f46e5',
        secondary: '#10b981',
        accent: '#f59e0b',
      },
    },
  });

  console.log('Default tenant created:', defaultTenant);

  // Create admin user
  const passwordHash = await hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'admin@example.com',
        tenantId: defaultTenant.id,
      },
    },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      tenantId: defaultTenant.id,
      roleId: adminRole.id,
    },
  });

  console.log('Admin user created:', adminUser);

  // Create sample property
  const sampleProperty = await prisma.property.upsert({
    where: { id: 'sample-property' },
    update: {},
    create: {
      id: 'sample-property',
      tenantId: defaultTenant.id,
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 2200,
      yearBuilt: 2010,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      coordinates: {
        lat: 40.7128,
        lng: -74.0060,
      },
    },
  });

  console.log('Sample property created:', sampleProperty);
  
  // Create corresponding location with latitude and longitude
  try {
    await prisma.location.upsert({
      where: { propertyId: sampleProperty.id },
      update: {
        latitude: 40.7128,
        longitude: -74.0060,
        updatedAt: new Date()
      },
      create: {
        id: 'sample-location',
        propertyId: sampleProperty.id,
        latitude: 40.7128,
        longitude: -74.0060,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('Sample location with coordinates created');
  } catch (error) {
    console.error('Error creating location:', error);
  }

  // Create sample listing
  const sampleListing = await prisma.listing.upsert({
    where: { id: 'sample-listing' },
    update: {},
    create: {
      id: 'sample-listing',
      propertyId: sampleProperty.id,
      price: 500000,
      listingType: 'Sample',
      status: 'Active',
      description: 'This is a sample listing description.',
      agentId: adminUser.id,
    },
  });

  console.log('Sample listing created:', sampleListing);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 