// Vercel Serverless Function for Bills CRUD operations
// This uses the Neon PostgreSQL database

import pkg from 'pg';

const { Pool } = pkg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon uses SSL
  }
});

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// Helper function to handle OPTIONS request for CORS
function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

// GET all bills or a specific bill by ID
export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleOptions(req, res)) return;

  setCorsHeaders(res);

  try {
    const { id } = req.query;
    const { search, status, building, billType } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // Get single bill
        const result = await pool.query(
          `SELECT b.*, o.name as owner_name, o.email as owner_email, o.mobile as owner_mobile
           FROM bills b
           LEFT JOIN owners o ON b.owner_id = o.id
           WHERE b.id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Bill not found' });
        }

        return res.status(200).json(result.rows[0]);
      } else {
        // Get all bills with optional filters
        let query = `
          SELECT b.*, o.name as owner_name, o.email as owner_email, o.mobile as owner_mobile
          FROM bills b
          LEFT JOIN owners o ON b.owner_id = o.id
          WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (search) {
          paramCount++;
          query += ` AND (
            b.company_name ILIKE $${paramCount} OR
            b.building_number ILIKE $${paramCount} OR
            b.building_name ILIKE $${paramCount} OR
            b.floor ILIKE $${paramCount} OR
            b.customer_id ILIKE $${paramCount} OR
            b.consumer_number ILIKE $${paramCount} OR
            b.bill_type ILIKE $${paramCount} OR
            o.name ILIKE $${paramCount}
          )`;
          params.push(`%${search}%`);
        }

        if (status && status !== 'all') {
          paramCount++;
          query += ` AND b.status = $${paramCount}`;
          params.push(status);
        }

        if (building && building !== 'all') {
          paramCount++;
          query += ` AND b.building_number = $${paramCount}`;
          params.push(building);
        }

        if (billType && billType !== 'all') {
          paramCount++;
          query += ` AND b.bill_type = $${paramCount}`;
          params.push(billType);
        }

        query += ' ORDER BY b.due_date ASC, b.created_at DESC';

        const result = await pool.query(query, params);
        return res.status(200).json(result.rows);
      }
    }

    if (req.method === 'POST') {
      const {
        companyName,
        buildingNumber,
        buildingName,
        floor,
        unitNumber,
        ownerId,
        billType,
        customerId,
        consumerNumber,
        accountNumber,
        referenceNumber,
        dueDate,
        billMonth,
        status,
        billAmount,
        paidBy,
        notes
      } = req.body;

      const result = await pool.query(
        `INSERT INTO bills (
          company_name, building_number, building_name, floor, unit_number,
          owner_id, bill_type, customer_id, consumer_number, account_number,
          reference_number, due_date, bill_month, status, bill_amount, paid_by, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          companyName, buildingNumber, buildingName, floor, unitNumber,
          ownerId || null, billType, customerId, consumerNumber, accountNumber,
          referenceNumber, dueDate, billMonth, status || 'Pending',
          billAmount || 0, paidBy || 'Company', notes
        ]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const {
        companyName,
        buildingNumber,
        buildingName,
        floor,
        unitNumber,
        ownerId,
        billType,
        customerId,
        consumerNumber,
        accountNumber,
        referenceNumber,
        dueDate,
        billMonth,
        status,
        billAmount,
        paidBy,
        notes
      } = req.body;

      const result = await pool.query(
        `UPDATE bills SET
          company_name = $1, building_number = $2, building_name = $3,
          floor = $4, unit_number = $5, owner_id = $6, bill_type = $7,
          customer_id = $8, consumer_number = $9, account_number = $10,
          reference_number = $11, due_date = $12, bill_month = $13,
          status = $14, bill_amount = $15, paid_by = $16, notes = $17
        WHERE id = $18
        RETURNING *`,
        [
          companyName, buildingNumber, buildingName, floor, unitNumber,
          ownerId || null, billType, customerId, consumerNumber, accountNumber,
          referenceNumber, dueDate, billMonth, status,
          billAmount, paidBy, notes, id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      const result = await pool.query(
        'DELETE FROM bills WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      return res.status(200).json({ message: 'Bill deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Bills API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
