#!/usr/bin/env node
/**
 * Local Database Seeding Script
 * Run this script locally to seed data from SeedData folder into Neon database
 *
 * Usage: node scripts/seed-database.js [action]
 *
 * Actions:
 *   status  - Check database status
 *   all     - Seed all data from SeedData folder
 *   owners  - Seed only owners
 *   bills   - Seed only bills
 */

import pkg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pkg;

// Read .env file
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.log('Please create .env file with your DATABASE_URL');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error('❌ Error: DATABASE_URL not found in .env');
  process.exit(1);
}

const DATABASE_URL = match[1].trim();

console.log('🔌 Connecting to Neon database...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Read JSON file safely
function readJsonFile(filename) {
  try {
    const filePath = path.join(process.cwd(), 'SeedData', filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    console.log(`⚠️  File not found: SeedData/${filename}`);
    return null;
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    return null;
  }
}

// Get all seed data
function getAllSeedData() {
  console.log('📁 Reading SeedData files...');
  return {
    completeBills: readJsonFile('complete_bills_data.json'),
    referenceData: readJsonFile('COMPLETE_REFERENCE_DATA.json'),
    electricityAccounts: readJsonFile('electricity-accounts-data.json'),
    electricityBillsExcel: readJsonFile('electricity_bills_excel_data.json'),
    excelBillsParsed: readJsonFile('excel_bills_parsed.json'),
  };
}

// Seed Owners
async function seedOwners(client, data) {
  if (!data || !data.owners || data.owners.length === 0) {
    console.log('⚠️  No owners to seed');
    return { seeded: 0, errors: [] };
  }

  console.log(`👤 Seeding ${data.owners.length} owners...`);
  const errors = [];
  let seeded = 0;

  for (const owner of data.owners) {
    try {
      const buildingsArray = Array.isArray(owner.buildings) ? owner.buildings : [];
      const result = await client.query(
        'INSERT INTO owners (name, mobile, email, buildings, notes) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name, email) DO NOTHING RETURNING *',
        [owner.name, owner.mobile, owner.email, JSON.stringify(buildingsArray), owner.notes]
      );

      if (result.rows.length > 0 && result.rows[0].__inserted === 1) {
        console.log(`  ✓ Owner: ${owner.name}`);
        seeded++;
      }
    } catch (error) {
      errors.push({ owner: owner.name, error: error.message });
      console.error(`  ✗ Owner: ${owner.name} - ${error.message}`);
    }
  }

  return { seeded, errors };
}

// Seed Bills
async function seedBills(client, data) {
  if (!data || !data.bills || data.bills.length === 0) {
    console.log('⚠️  No bills to seed');
    return { seeded: 0, errors: [] };
  }

  console.log(`📄 Seeding ${data.bills.length} bills...`);
  const errors = [];
  let seeded = 0;

  for (const bill of data.bills) {
    try {
      const result = await client.query(
        `INSERT INTO bills (
          company_name, building_number, building_name, floor, unit_number,
          owner_id, bill_type, customer_id, consumer_number, account_number,
          reference_number, due_date, bill_month, status, bill_amount, paid_by, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (customer_id, consumer_number) DO NOTHING RETURNING *`,
        [
          bill.companyName || 'Eurobiz Corporation',
          bill.buildingNumber,
          bill.buildingName,
          bill.floor || '',
          bill.unitNumber || '',
          bill.ownerId || null,
          bill.billType,
          bill.customerId || '',
          bill.consumerNumber || '',
          bill.accountNumber || '',
          bill.referenceNumber || '',
          bill.dueDate,
          bill.billMonth,
          bill.status || 'Pending',
          bill.billAmount || 0,
          bill.paidBy || 'Company',
          bill.notes || ''
        ]
      );

      if (result.rows.length > 0 && result.rows[0].__inserted === 1) {
        console.log(`  ✓ Bill: ${bill.billType} - Building ${bill.buildingNumber}`);
        seeded++;
      }
    } catch (error) {
      errors.push({ bill: `${bill.buildingNumber} - ${bill.billType}`, error: error.message });
      console.error(`  ✗ Bill: ${bill.billType} - Building ${bill.buildingNumber} - ${error.message}`);
    }
  }

  return { seeded, errors };
}

// Additional bill types from other seed files
async function seedAdditionalBills(client, seedData) {
  const errors = [];
  let seeded = { electricity: 0, ptcl: 0, gas: 0, water: 0 };

  // Get owner IDs for mapping
  const ownerResult = await client.query('SELECT id, name FROM owners');
  const ownerMap = {};
  for (const row of ownerResult.rows) {
    ownerMap[row.name.toLowerCase()] = row.id;
  }

  // Seed from excel_bills_parsed.json
  if (seedData.excelBillsParsed && seedData.excelBillsParsed.length > 0) {
    console.log(`📄 Seeding ${seedData.excelBillsParsed.length} additional bills...`);
    for (const bill of seedData.excelBillsParsed) {
      try {
        // Parse building number from location
        let buildingNumber = '';
        let buildingName = 'Plaza';
        const location = bill.location?.toLowerCase() || '';

        if (location.includes('170')) {
          buildingNumber = '170';
        } else if (location.includes('171')) {
          buildingNumber = '171';
        } else if (location.includes('172')) {
          buildingNumber = '172';
        } else if (location.includes('38') || location.includes('cantt')) {
          buildingNumber = '38';
          buildingName = 'N CANTT VIEW';
        } else if (location.includes('129') || location.includes('7 d')) {
          buildingNumber = '129';
          buildingName = '7 D';
        }

        // Parse floor from location
        let floor = '';
        if (location.includes('ground')) floor = 'Ground Floor';
        else if (location.includes('1st')) floor = '1st Floor';
        else if (location.includes('2nd')) floor = '2nd Floor';
        else if (location.includes('3rd')) floor = '3rd Floor';
        else if (location.includes('4th')) floor = '4th Floor';
        else if (location.includes('basement')) floor = 'Basement';
        else if (location.includes('lift')) floor = 'Lift';

        // Determine bill type
        const billTypeLower = bill.billType?.toLowerCase() || '';
        let billType = 'Electricity';
        if (billTypeLower.includes('ptcl') || billTypeLower.includes('phone')) {
          billType = 'PTCL';
          seeded.ptcl++;
        } else if (billTypeLower.includes('gas')) {
          billType = 'Gas';
          seeded.gas++;
        } else if (billTypeLower.includes('water')) {
          billType = 'Water';
          seeded.water++;
        } else {
          seeded.electricity++;
        }

        await client.query(
          `INSERT INTO bills (
            company_name, building_number, building_name, floor, unit_number,
            owner_id, bill_type, customer_id, consumer_number, account_number,
            reference_number, due_date, bill_month, status, bill_amount, paid_by, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT DO NOTHING`,
          [
            bill.companyName || 'Eurobiz Corporation',
            buildingNumber,
            buildingName,
            floor,
            '',
            null,
            billType,
            bill.customerId || '',
            '',
            '',
            bill.referenceNumber || '',
            '2025-12-16',
            '2025-11',
            'Pending',
            0,
            'Company',
            ''
          ]
        );
      } catch (error) {
        errors.push({ bill: bill.location, error: error.message });
      }
    }
  }

  return { seeded, errors };
}

// Seed reference/account data
async function seedReferenceData(client, seedData) {
  if (!seedData.referenceData) {
    return { seeded: 0, errors: [] };
  }

  console.log('📋 Seeding reference data...');
  const errors = [];
  let seeded = 0;

  // Check if reference_data table exists
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS reference_data (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255),
        location VARCHAR(255),
        reference_number VARCHAR(100),
        old_account_number VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Warning: Could not create reference_data table:', error.message);
  }

  const allReferences = [
    ...(seedData.referenceData.eurobizCorporation || []).map(r => ({
      company_name: 'Eurobiz Corporation',
      location: r.location,
      reference_number: r.referenceNumber,
      old_account_number: r.oldAccountNumber
    })),
    ...(seedData.referenceData.guardianDeveloper || []).map(r => ({
      company_name: 'Guardian Developer',
      location: r.location,
      reference_number: r.referenceNumber,
      old_account_number: r.oldAccountNumber
    })),
  ];

  for (const ref of allReferences) {
    try {
      await client.query(
        `INSERT INTO reference_data (company_name, location, reference_number, old_account_number)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [ref.company_name, ref.location, ref.reference_number, ref.oldAccount_number]
      );
      seeded++;
    } catch (error) {
      errors.push({ reference: ref.location, error: error.message });
    }
  }

  return { seeded, errors };
}

// Get database status
async function getDatabaseStatus(client) {
  const billsCount = await client.query('SELECT COUNT(*) FROM bills');
  const ownersCount = await client.query('SELECT COUNT(*) FROM owners');
  const rentCount = await client.query('SELECT COUNT(*) FROM rent_tracking');
  const maintenanceCount = await client.query('SELECT COUNT(*) FROM maintenance_items');
  const commCount = await client.query('SELECT COUNT(*) FROM communications');
  const refCount = await client.query('SELECT COUNT(*) FROM reference_data');

  return {
    bills: parseInt(billsCount.rows[0].count),
    owners: parseInt(ownersCount.rows[0].count),
    rentTracking: parseInt(rentCount.rows[0].count),
    maintenanceItems: parseInt(maintenanceCount.rows[0].count),
    communications: parseInt(commCount.rows[0].count),
    referenceData: parseInt(refCount.rows[0].count),
  };
}

// Main function
async function main() {
  const action = process.argv[2] || 'all';

  console.log('\n' + '='.repeat(50));
  console.log('🌱 Grand City Dashboard - Database Seeding Tool');
  console.log('='.repeat(50) + '\n');

  const client = await pool.connect();

  try {
    // Get all seed data
    const seedData = getAllSeedData();

    // Get before status
    console.log('\n📊 Before seeding status:');
    const beforeStatus = await getDatabaseStatus(client);
    console.log(`   Owners: ${beforeStatus.owners}`);
    console.log(`   Bills: ${beforeStatus.bills}`);
    console.log(`   Reference Data: ${beforeStatus.referenceData}`);

    const results = {
      before: beforeStatus,
      actions: [],
      errors: [],
      summary: { owners: 0, bills: 0, additional: 0, references: 0 },
    };

    if (action === 'status') {
      // Just show status
      console.log('\n✅ Status retrieved successfully');
    } else if (action === 'owners') {
      const result = await seedOwners(client, seedData.completeBills);
      results.actions.push({ name: 'Seed Owners', result });
      results.errors.push(...result.errors.map(e => ({ ...e, table: 'owners' })));
      results.summary.owners = result.seeded;
    } else if (action === 'bills') {
      const result = await seedBills(client, seedData.completeBills);
      results.actions.push({ name: 'Seed Bills', result });
      results.errors.push(...result.errors.map(e => ({ ...e, table: 'bills' })));
      results.summary.bills = result.seeded;
    } else {
      // Seed all
      const ownerResult = await seedOwners(client, seedData.completeBills);
      results.actions.push({ name: 'Seed Owners', result });
      results.errors.push(...ownerResult.errors.map(e => ({ ...e, table: 'owners' })));
      results.summary.owners = ownerResult.seeded;

      const billResult = await seedBills(client, seedData.completeBills);
      results.actions.push({ name: 'Seed Bills', result });
      results.errors.push(...billResult.errors.map(e => ({ ...e, table: 'bills' })));
      results.summary.bills = billResult.seeded;

      const additionalResult = await seedAdditionalBills(client, seedData);
      results.actions.push({ name: 'Seed Additional Bills', result });
      results.errors.push(...additionalResult.errors.map(e => ({ ...e, table: 'bills' })));
      results.summary.additional = additionalResult.seeded.electricity + additionalResult.seeded.ptcl + additionalResult.seeded.gas + additionalResult.seeded.water;

      const refResult = await seedReferenceData(client, seedData);
      results.actions.push({ name: 'Seed Reference Data', result });
      results.errors.push(...refResult.errors.map(e => ({ ...e, table: 'reference_data' })));
      results.summary.references = refResult.seeded;
    }

    // Get after status
    console.log('\n📊 After seeding status:');
    const afterStatus = await getDatabaseStatus(client);
    results.after = afterStatus;
    console.log(`   Owners: ${afterStatus.owners} (+${afterStatus.owners - beforeStatus.owners})`);
    console.log(`   Bills: ${afterStatus.bills} (+${afterStatus.bills - beforeStatus.bills})`);
    console.log(`   Reference Data: ${afterStatus.referenceData} (+${afterStatus.referenceData - beforeStatus.referenceData})`);

    // Summary
    console.log('\n' + '-'.repeat(50));
    console.log('📈 Seeding Summary:');
    console.log(`   ✓ Owners seeded: ${results.summary.owners}`);
    console.log(`   ✓ Bills seeded: ${results.summary.bills}`);
    console.log(`   ✓ Additional bills seeded: ${results.summary.additional}`);
    console.log(`   ✓ Reference records seeded: ${results.summary.references}`);
    console.log(`   Total records added: ${results.summary.owners + results.summary.bills + results.summary.additional + results.summary.references}`);

    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      results.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.table}: ${err.message}`);
      });
    }

    console.log('\n' + '-'.repeat(50));
    console.log('✅ Seeding completed!');
    console.log('-'.repeat(50) + '\n');

    await client.release();
    process.exit(results.errors.length > 0 ? 1 : 0);
  } catch (error) {
    await client.release();
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run
main();
