// Vercel Serverless Function for Rent Tracking CRUD operations
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

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleOptions(req, res)) return;

  setCorsHeaders(res);

  try {
    const { id } = req.query;
    const { status, building, month } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // Get single rent record
        const result = await pool.query(
          `SELECT r.*, o.name as owner_name
           FROM rent_tracking r
           LEFT JOIN owners o ON r.owner_id = o.id
           WHERE r.id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Rent record not found' });
        }

        return res.status(200).json(result.rows[0]);
      } else {
        // Get all rent records with optional filters
        let query = `
          SELECT r.*, o.name as owner_name
          FROM rent_tracking r
          LEFT JOIN owners o ON r.owner_id = o.id
          WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (status && status !== 'all') {
          paramCount++;
          query += ` AND r.status = $${paramCount}`;
          params.push(status);
        }

        if (building && building !== 'all') {
          paramCount++;
          query += ` AND r.building_number = $${paramCount}`;
          params.push(building);
        }

        if (month && month !== 'all') {
          paramCount++;
          query += ` AND r.rent_month = $${paramCount}`;
          params.push(month);
        }

        query += ' ORDER BY r.rent_month DESC, r.created_at DESC';

        const result = await pool.query(query, params);
        return res.status(200).json(result.rows);
      }
    }

    if (req.method === 'POST') {
      const {
        buildingNumber,
        buildingName,
        floor,
        unitNumber,
        ownerId,
        tenantName,
        monthlyRent,
        rentMonth,
        paidDate,
        status,
        amountPaid,
        paymentMethod,
        notes
      } = req.body;

      const result = await pool.query(
        `INSERT INTO rent_tracking (
          building_number, building_name, floor, unit_number, owner_id,
          tenant_name, monthly_rent, rent_month, paid_date, status,
          amount_paid, payment_method, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          buildingNumber, buildingName, floor, unitNumber, ownerId || null,
          tenantName, monthlyRent || 0, rentMonth, paidDate,
          status || 'Pending', amountPaid || 0, paymentMethod, notes
        ]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const {
        buildingNumber,
        buildingName,
        floor,
        unitNumber,
        ownerId,
        tenantName,
        monthlyRent,
        rentMonth,
        paidDate,
        status,
        amountPaid,
        paymentMethod,
        notes
      } = req.body;

      const result = await pool.query(
        `UPDATE rent_tracking SET
          building_number = $1, building_name = $2, floor = $3, unit_number = $4,
          owner_id = $5, tenant_name = $6, monthly_rent = $7, rent_month = $8,
          paid_date = $9, status = $10, amount_paid = $11, payment_method = $12, notes = $13
        WHERE id = $14
        RETURNING *`,
        [
          buildingNumber, buildingName, floor, unitNumber, ownerId || null,
          tenantName, monthlyRent, rentMonth, paidDate, status,
          amountPaid, paymentMethod, notes, id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Rent record not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      const result = await pool.query(
        'DELETE FROM rent_tracking WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Rent record not found' });
      }

      return res.status(200).json({ message: 'Rent record deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Rent API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
