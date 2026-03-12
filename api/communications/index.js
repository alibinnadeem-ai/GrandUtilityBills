// Vercel Serverless Function for Communications CRUD operations
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
    const { ownerId } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // Get single communication
        const result = await pool.query(
          `SELECT c.*, o.name as owner_name, o.email as owner_email
           FROM communications c
           LEFT JOIN owners o ON c.owner_id = o.id
           WHERE c.id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Communication not found' });
        }

        return res.status(200).json(result.rows[0]);
      } else {
        // Get all communications with optional filters
        let query = `
          SELECT c.*, o.name as owner_name, o.email as owner_email
          FROM communications c
          LEFT JOIN owners o ON c.owner_id = o.id
          WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (ownerId) {
          paramCount++;
          query += ` AND c.owner_id = $${paramCount}`;
          params.push(ownerId);
        }

        query += ' ORDER BY c.date DESC, c.timestamp DESC';

        const result = await pool.query(query, params);
        return res.status(200).json(result.rows);
      }
    }

    if (req.method === 'POST') {
      const { ownerId, subject, message, method, date, notes } = req.body;

      const result = await pool.query(
        `INSERT INTO communications (owner_id, subject, message, method, date, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [ownerId || null, subject, message, method || 'Email', date, notes]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      const result = await pool.query(
        'DELETE FROM communications WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Communication not found' });
      }

      return res.status(200).json({ message: 'Communication deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Communications API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
