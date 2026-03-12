// Comprehensive Seed API for Grand City Dashboard
// Reads from SeedData JSON files and populates the database

import pkg from 'pg';

const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

// Read JSON file safely
function readJsonFile(filename) {
  try {
    const filePath = path.join(process.cwd(), 'SeedData', filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return null;
  }
}

// Get all seed data from files
function getAllSeedData() {
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
  if (!data.owners || data.owners.length === 0) {
    console.log('No owners to seed');
    return { seeded: 0, errors: [] };
  }

  const errors = [];
  let seeded = 0;

  for (const owner of data.owners) {
    try {
      const buildingsArray = Array.isArray(owner.buildings) ? owner.buildings : [];
      await client.query(
        'INSERT INTO owners (name, mobile, email, buildings, notes) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [owner.name, owner.mobile, owner.email, JSON.stringify(buildingsArray), owner.notes]
      );
      seeded++;
    } catch (error) {
      errors.push({ owner: owner.name, error: error.message });
    }
  }

  return { seeded, errors };
}

// Seed Bills
async function seedBills(client, data) {
  if (!data.bills || data.bills.length === 0) {
    console.log('No bills to seed');
    return { seeded: 0, errors: [] };
  }

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
        ON CONFLICT (owner_id, customer_id, consumer_number) DO NOTHING`,
        [
          bill.companyName,
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
      seeded++;
    } catch (error) {
      errors.push({ bill: `${bill.buildingNumber} - ${bill.billType}`, error: error.message });
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
    for (const bill of seedData.excelBillsParsed) {
      try {
        const buildingNumber = bill.location?.match(/\d+/)?.[0] || bill.buildingNumber || '';
        const ownerName = bill.companyName?.toLowerCase() || '';
        const ownerId = ownerName ? (ownerMap[ownerName] || null) : null;

        let billType = 'Electricity';
        if (bill.billType?.toLowerCase().includes('ptcl') || bill.billType?.toLowerCase().includes('phone')) {
          billType = 'PTCL';
        } else if (bill.billType?.toLowerCase().includes('gas')) {
          billType = 'Gas';
        } else if (bill.billType?.toLowerCase().includes('water')) {
          billType = 'Water';
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
            'Plaza',
            bill.floor || '',
            '',
            ownerId,
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
        seeded[billType.toLowerCase()]++;
      } catch (error) {
        errors.push({ bill: bill.location, error: error.message });
      }
    }
  }

  return { seeded, errors };
}

// Seed reference/account data (separate table for historical tracking)
async function seedReferenceData(client, seedData) {
  if (!seedData.referenceData) {
    return { seeded: 0, errors: [] };
  }

  const errors = [];
  let seeded = 0;

  // Check if reference_data table exists, if not, create it
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
    console.error('Error creating reference_data table:', error.message);
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

// Get current database status
async function getDatabaseStatus(client) {
  const billsCount = await client.query('SELECT COUNT(*) FROM bills');
  const ownersCount = await client.query('SELECT COUNT(*) FROM owners');
  const rentCount = await client.query('SELECT COUNT(*) FROM rent_tracking');
  const maintenanceCount = await client.query('SELECT COUNT(*) FROM maintenance_items');
  const commCount = await client.query('SELECT COUNT(*) FROM communications');

  return {
    bills: parseInt(billsCount.rows[0].count),
    owners: parseInt(ownersCount.rows[0].count),
    rentTracking: parseInt(rentCount.rows[0].count),
    maintenanceItems: parseInt(maintenanceCount.rows[0].count),
    communications: parseInt(commCount.rows[0].count),
  };
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleOptions(req, res)) return;

  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const client = await pool.connect();

  try {
    const action = req.query.action || 'all';

    // Read all seed data
    const seedData = getAllSeedData();

    // Get current status
    const beforeStatus = await getDatabaseStatus(client);

    const results = {
      before: beforeStatus,
      actions: [],
      after: null,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    if (action === 'status') {
      // Just return status
      results.actions.push({ name: 'Database Status', result: beforeStatus });
      return res.status(200).json(results);
    }

    if (action === 'all' || action === 'complete') {
      // Seed complete data
      const ownerResult = await seedOwners(client, seedData.completeBills);
      results.actions.push({ name: 'Seed Owners', result: ownerResult });
      results.errors.push(...ownerResult.errors.map(e => ({ ...e, table: 'owners' })));

      const billResult = await seedBills(client, seedData.completeBills);
      results.actions.push({ name: 'Seed Bills', result: billResult });
      results.errors.push(...billResult.errors.map(e => ({ ...e, table: 'bills' })));

      const additionalResult = await seedAdditionalBills(client, seedData);
      results.actions.push({ name: 'Seed Additional Bills', result: additionalResult });
      results.errors.push(...additionalResult.errors.map(e => ({ ...e, table: 'bills' })));

      const refResult = await seedReferenceData(client, seedData);
      results.actions.push({ name: 'Seed Reference Data', result: refResult });
      results.errors.push(...refResult.errors.map(e => ({ ...e, table: 'reference_data' })));
    }

    // Get final status
    const afterStatus = await getDatabaseStatus(client);
    results.after = afterStatus;

    await client.release();
    res.status(200).json(results);
  } catch (error) {
    await client.release();
    console.error('Seed error:', error);
    res.status(500).json({
      error: 'Seed failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
