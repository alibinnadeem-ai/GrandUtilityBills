// Vercel Serverless Function to Seed Initial Data
// Run this once to populate the database with initial bills data

import pkg from 'pg';

const { Pool } = pkg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initial bills data - ALL 28 bills
const initialBills = [
  // Electricity - Eurobiz Corporation (Plaza Buildings)
  { companyName: 'Eurobiz Corporation', buildingNumber: '170', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 1, billType: 'Electricity', customerId: '10497621', consumerNumber: '44115635517000 U', accountNumber: '0.00', referenceNumber: '44115635517000 U', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '171', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 2, billType: 'Electricity', customerId: '10498361', consumerNumber: '44115635517100 U', accountNumber: '0.00', referenceNumber: '44115635517100 U', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '172', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 3, billType: 'Electricity', customerId: '10499431', consumerNumber: '44115635517200 U', accountNumber: '0.00', referenceNumber: '44115635517200 U', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },

  // Electricity - Eurobiz Corporation (7 D Buildings)
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: 'GF', unitNumber: '1', ownerId: 4, billType: 'Electricity', customerId: '526712', consumerNumber: '408769', accountNumber: '', referenceNumber: '408769', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: 'GF', unitNumber: '2', ownerId: 4, billType: 'Electricity', customerId: '526713', consumerNumber: '408770', accountNumber: '', referenceNumber: '408770', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: 'GF', unitNumber: '3', ownerId: 4, billType: 'Electricity', customerId: '526714', consumerNumber: '408771', accountNumber: '', referenceNumber: '408771', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: 'GF', unitNumber: '4', ownerId: 4, billType: 'Electricity', customerId: '526715', consumerNumber: '408772', accountNumber: '', referenceNumber: '408772', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '1st', unitNumber: '1', ownerId: 4, billType: 'Electricity', customerId: '526716', consumerNumber: '408773', accountNumber: '', referenceNumber: '408773', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '1st', unitNumber: '2', ownerId: 4, billType: 'Electricity', customerId: '526717', consumerNumber: '408774', accountNumber: '', referenceNumber: '408774', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '1st', unitNumber: '3', ownerId: 4, billType: 'Electricity', customerId: '526718', consumerNumber: '408775', accountNumber: '', referenceNumber: '408775', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '1st', unitNumber: '4', ownerId: 4, billType: 'Electricity', customerId: '526719', consumerNumber: '408776', accountNumber: '', referenceNumber: '408776', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '2nd', unitNumber: '1', ownerId: 4, billType: 'Electricity', customerId: '526720', consumerNumber: '408777', accountNumber: '', referenceNumber: '408777', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '2nd', unitNumber: '2', ownerId: 4, billType: 'Electricity', customerId: '526721', consumerNumber: '408778', accountNumber: '', referenceNumber: '408778', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '2nd', unitNumber: '3', ownerId: 4, billType: 'Electricity', customerId: '526722', consumerNumber: '408779', accountNumber: '', referenceNumber: '408779', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '2nd', unitNumber: '4', ownerId: 4, billType: 'Electricity', customerId: '526723', consumerNumber: '408780', accountNumber: '', referenceNumber: '408780', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '3rd', unitNumber: '1', ownerId: 4, billType: 'Electricity', customerId: '526724', consumerNumber: '408781', accountNumber: '', referenceNumber: '408781', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '3rd', unitNumber: '2', ownerId: 4, billType: 'Electricity', customerId: '526725', consumerNumber: '408782', accountNumber: '', referenceNumber: '408782', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '3rd', unitNumber: '3', ownerId: 4, billType: 'Electricity', customerId: '526726', consumerNumber: '408783', accountNumber: '', referenceNumber: '408783', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '3rd', unitNumber: '4', ownerId: 4, billType: 'Electricity', customerId: '526727', consumerNumber: '408784', accountNumber: '', referenceNumber: '408784', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '4th', unitNumber: '1', ownerId: 4, billType: 'Electricity', customerId: '526728', consumerNumber: '408785', accountNumber: '', referenceNumber: '408785', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },

  // PTCL Bills
  { companyName: 'Eurobiz Corporation', buildingNumber: '170', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 1, billType: 'PTCL', customerId: '07221955150', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '171', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 2, billType: 'PTCL', customerId: '07221955151', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '172', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 3, billType: 'PTCL', customerId: '07221955152', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },

  // Gas Bills
  { companyName: 'Eurobiz Corporation', buildingNumber: '170', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 1, billType: 'Gas', customerId: '4020168093', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '171', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 2, billType: 'Gas', customerId: '4020168094', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '172', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 3, billType: 'Gas', customerId: '4020168095', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },

  // Water Bills
  { companyName: 'Eurobiz Corporation', buildingNumber: '170', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 1, billType: 'Water', customerId: '246070276067', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '171', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 2, billType: 'Water', customerId: '61000610470441700000', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '172', buildingName: 'Plaza', floor: '', unitNumber: '', ownerId: 3, billType: 'Water', customerId: '7588780228693', consumerNumber: '', accountNumber: '', referenceNumber: '', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },

  // Additional Electricity Bills
  { companyName: 'Eurobiz Corporation', buildingNumber: '38', buildingName: 'N CANTT VIEW', floor: '', unitNumber: '', ownerId: 4, billType: 'Electricity', customerId: '7095254', consumerNumber: '9115610437705', accountNumber: '', referenceNumber: '9115610437705', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
  { companyName: 'Eurobiz Corporation', buildingNumber: '129', buildingName: '7 D', floor: '', unitNumber: '', ownerId: 4, billType: 'Electricity', customerId: '526712', consumerNumber: '408769', accountNumber: '', referenceNumber: '408769', dueDate: '2025-12-16', billMonth: '2025-11', status: 'Pending', billAmount: 0, paidBy: 'Company', notes: '' },
];

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

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleOptions(req, res)) return;

  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = await pool.connect();

  try {
    // Check if bills already exist
    const existingBills = await client.query('SELECT COUNT(*) FROM bills');
    if (parseInt(existingBills.rows[0].count) > 0) {
      await client.release();
      return res.status(400).json({
        error: 'Database already contains bills data',
        count: existingBills.rows[0].count,
        message: 'Delete existing data first if you want to re-seed'
      });
    }

    // Insert bills
    let insertedCount = 0;
    for (const bill of initialBills) {
      const result = await client.query(
        `INSERT INTO bills (
          company_name, building_number, building_name, floor, unit_number,
          owner_id, bill_type, customer_id, consumer_number, account_number,
          reference_number, due_date, bill_month, status, bill_amount, paid_by, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          bill.companyName, bill.buildingNumber, bill.buildingName, bill.floor, bill.unitNumber,
          bill.ownerId, bill.billType, bill.customerId, bill.consumerNumber, bill.accountNumber,
          bill.referenceNumber, bill.dueDate, bill.billMonth, bill.status, bill.billAmount, bill.paidBy, bill.notes
        ]
      );
      insertedCount++;
    }

    await client.release();

    res.status(200).json({
      success: true,
      message: `Successfully seeded ${insertedCount} bills into the database`,
      count: insertedCount
    });
  } catch (error) {
    await client.release();
    console.error('Seed error:', error);
    res.status(500).json({
      error: 'Failed to seed database',
      message: error.message
    });
  }
}
