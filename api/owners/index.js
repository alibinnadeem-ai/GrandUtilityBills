// Vercel Serverless Function for Owners CRUD operations
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

    if (req.method === 'GET') {
      if (id) {
        // Get single owner
        const result = await pool.query(
          'SELECT * FROM owners WHERE id = $1',
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Owner not found' });
        }

        return res.status(200).json(result.rows[0]);
      } else {
        // Get all owners
        const result = await pool.query(
          'SELECT * FROM owners ORDER BY name ASC'
        );

        return res.status(200).json(result.rows);
      }
    }

    if (req.method === 'POST') {
      const { name, mobile, email, buildings, notes } = req.body;

      // Convert buildings to array if it's a comma-separated string
      const buildingsArray = Array.isArray(buildings)
        ? buildings
        : typeof buildings === 'string'
          ? buildings.split(',').map(b => b.trim()).filter(b => b)
          : [];

      const result = await pool.query(
        'INSERT INTO owners (name, mobile, email, buildings, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, mobile, email, buildingsArray, notes]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, mobile, email, buildings, notes } = req.body;

      // Convert buildings to array if it's a comma-separated string
      const buildingsArray = Array.isArray(buildings)
        ? buildings
        : typeof buildings === 'string'
          ? buildings.split(',').map(b => b.trim()).filter(b => b)
          : [];

      const result = await pool.query(
        'UPDATE owners SET name = $1, mobile = $2, email = $3, buildings = $4, notes = $5 WHERE id = $6 RETURNING *',
        [name, mobile, email, buildingsArray, notes, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Owner not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      const result = await pool.query(
        'DELETE FROM owners WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Owner not found' });
      }

      return res.status(200).json({ message: 'Owner deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Owners API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
