// Vercel Serverless Function for Maintenance Items CRUD operations
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
    const { status, building, priority } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // Get single maintenance item
        const result = await pool.query(
          'SELECT * FROM maintenance_items WHERE id = $1',
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Maintenance item not found' });
        }

        return res.status(200).json(result.rows[0]);
      } else {
        // Get all maintenance items with optional filters
        let query = 'SELECT * FROM maintenance_items WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (status && status !== 'all') {
          paramCount++;
          query += ` AND status = $${paramCount}`;
          params.push(status);
        }

        if (building && building !== 'all') {
          paramCount++;
          query += ` AND building_number = $${paramCount}`;
          params.push(building);
        }

        if (priority && priority !== 'all') {
          paramCount++;
          query += ` AND priority = $${paramCount}`;
          params.push(priority);
        }

        query += ' ORDER BY priority DESC, due_date ASC, created_at DESC';

        const result = await pool.query(query, params);
        return res.status(200).json(result.rows);
      }
    }

    if (req.method === 'POST') {
      const {
        buildingNumber,
        floor,
        description,
        priority,
        dueDate,
        status,
        assignedTo,
        cost,
        notes
      } = req.body;

      const result = await pool.query(
        `INSERT INTO maintenance_items (
          building_number, floor, description, priority, due_date,
          status, assigned_to, cost, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          buildingNumber, floor, description, priority || 'Medium',
          dueDate, status || 'Pending', assignedTo, cost || 0, notes
        ]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const {
        buildingNumber,
        floor,
        description,
        priority,
        dueDate,
        status,
        assignedTo,
        cost,
        notes
      } = req.body;

      const result = await pool.query(
        `UPDATE maintenance_items SET
          building_number = $1, floor = $2, description = $3,
          priority = $4, due_date = $5, status = $6,
          assigned_to = $7, cost = $8, notes = $9
        WHERE id = $10
        RETURNING *`,
        [
          buildingNumber, floor, description, priority, dueDate, status,
          assignedTo, cost, notes, id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Maintenance item not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      const result = await pool.query(
        'DELETE FROM maintenance_items WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Maintenance item not found' });
      }

      return res.status(200).json({ message: 'Maintenance item deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Maintenance API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
