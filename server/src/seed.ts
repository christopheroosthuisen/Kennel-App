
import { withDb } from './db';
import { DEFAULT_ORG_ID, DEFAULT_LOCATION_ID } from '../../shared/domain';
import { generateId, nowISO } from '../../shared/utils';
import { KennelUnit, CatalogItem, MembershipDefinition, PackageDefinition } from '../../shared/domain';
import { hashPassword } from './auth';

export async function seedIfNeeded() {
  await withDb(async (db) => {
    if (db.users.length > 0) return; // Already seeded

    console.log('🌱 Seeding database...');

    // Seed Admin User
    const adminPassword = await hashPassword('admin123');
    
    db.users.push({
      id: generateId('u'),
      orgId: DEFAULT_ORG_ID,
      locationId: DEFAULT_LOCATION_ID,
      email: 'admin@local',
      name: 'Local Admin',
      role: 'Admin',
      passwordHash: adminPassword,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: ['System']
    });

    // Seed Kennel Units
    const units: Partial<KennelUnit>[] = [
      { name: 'Run 101', type: 'Run', size: 'L' },
      { name: 'Run 102', type: 'Run', size: 'L' },
      { name: 'Suite A', type: 'Suite', size: 'XL' },
      { name: 'Cage S1', type: 'Cage', size: 'S' },
    ];

    units.forEach(u => {
      db.kennelUnits.push({
        id: generateId('unit'),
        orgId: DEFAULT_ORG_ID,
        locationId: DEFAULT_LOCATION_ID,
        name: u.name!,
        type: u.type!,
        size: u.size!,
        status: 'Active',
        createdAt: nowISO(),
        updatedAt: nowISO(),
        tags: []
      });
    });

    // Seed Catalog
    const items: Partial<CatalogItem>[] = [
      { name: 'Standard Boarding', type: 'Service', basePrice: 5500, category: 'Boarding' },
      { name: 'Full Day Daycare', type: 'Service', basePrice: 3500, category: 'Daycare' },
      { name: 'Exit Bath', type: 'AddOn', basePrice: 3000, category: 'Grooming' },
      { name: 'Kibble Bag', type: 'Retail', basePrice: 2499, category: 'Food' },
    ];

    items.forEach(i => {
      db.catalogItems.push({
        id: generateId('cat'),
        orgId: DEFAULT_ORG_ID,
        locationId: DEFAULT_LOCATION_ID,
        name: i.name!,
        type: i.type!,
        category: i.category!,
        basePrice: i.basePrice!,
        isActive: true,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        tags: []
      });
    });

    // Seed Memberships
    const goldMember: MembershipDefinition = {
      id: generateId('mem'),
      orgId: DEFAULT_ORG_ID,
      locationId: DEFAULT_LOCATION_ID,
      name: 'Gold Member',
      price: 4900,
      billingFrequency: 'MONTHLY',
      requiresSignature: true,
      colorHex: '#eab308',
      isActive: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      benefits: [
        { type: 'DISCOUNT_PERCENT', value: 10, targetCategory: 'RETAIL', description: '10% off Retail' },
        { type: 'DISCOUNT_PERCENT', value: 5, targetCategory: 'GROOMING', description: '5% off Grooming' }
      ]
    };
    db.membershipDefinitions.push(goldMember);

    // Seed Packages
    const dayPass: PackageDefinition = {
      id: generateId('pkg'),
      orgId: DEFAULT_ORG_ID,
      locationId: DEFAULT_LOCATION_ID,
      name: '10 Day Daycare Pass',
      price: 31500, // 315.00
      description: 'Pre-pay for 10 days and save.',
      expirationDays: 90,
      isActive: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      credits: [
        { serviceCategory: 'SERVICE', quantity: 10, isHourly: false }
      ]
    };
    db.packageDefinitions.push(dayPass);

    console.log('✅ Database seeded.');
  });
}
