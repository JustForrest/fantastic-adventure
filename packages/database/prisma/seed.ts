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

  const agentRole = await prisma.role.upsert({
    where: { id: 'agent-role' },
    update: {},
    create: {
      id: 'agent-role',
      name: 'Agent',
      permissions: [
        'manage_properties',
        'manage_listings',
      ],
    },
  });

  console.log('Roles created:', { adminRole, agentRole });

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { domain: 'localhost' },
    update: {},
    create: {
      name: 'Demo Agency',
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
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 2200,
      yearBuilt: 2005,
      features: ['Garage', 'Fireplace', 'Backyard'],
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
  });

  console.log('Sample property created:', sampleProperty);

  // Create sample listing
  const sampleListing = await prisma.listing.upsert({
    where: { id: 'sample-listing' },
    update: {},
    create: {
      id: 'sample-listing',
      propertyId: sampleProperty.id,
      price: 1250000,
      listingType: 'Sale',
      status: 'Active',
      description: 'Beautiful 3-bedroom home in a prime location.',
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