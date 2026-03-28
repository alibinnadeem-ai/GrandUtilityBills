// Vercel Serverless Function for Owners CRUD operations

import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function parseBuildings(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    // JSON array format
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    // Postgres text[] literal format, e.g. {170,171}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((v) => v.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
    }

    // Comma-separated fallback
    return trimmed.split(',').map((v) => v.trim()).filter(Boolean);
  }

  return [];
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
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
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  try {
    const { id } = req.query;

    if (req.method === 'GET') {
      if (id) {
        const result = await pool.query('SELECT * FROM owners WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Owner not found' });
        }
        const owner = result.rows[0];
        owner.buildings = parseBuildings(owner.buildings);
        return res.status(200).json(owner);
      } else {
        const result = await pool.query('SELECT * FROM owners ORDER BY name ASC');
        const owners = result.rows.map(owner => ({
          ...owner,
          buildings: parseBuildings(owner.buildings)
        }));
        return res.status(200).json(owners);
      }
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      const { name, mobile, email, buildings, notes } = body;

      const buildingsArray = Array.isArray(buildings)
        ? buildings
        : typeof buildings === 'string'
          ? buildings.split(',').map(b => b.trim()).filter(b => b)
          : [];

      const result = await pool.query(
        'INSERT INTO owners (name, mobile, email, buildings, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, mobile, email, buildingsArray, notes]
      );

      const newOwner = result.rows[0];
      newOwner.buildings = parseBuildings(newOwner.buildings);

      return res.status(201).json(newOwner);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing owner id' });
      }

      const body = await getRequestBody(req);
      const { name, mobile, email, buildings, notes } = body;

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

      const updatedOwner = result.rows[0];
      updatedOwner.buildings = parseBuildings(updatedOwner.buildings);

      return res.status(200).json(updatedOwner);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing owner id' });
      }

      const result = await pool.query('DELETE FROM owners WHERE id = $1 RETURNING *', [id]);

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

async function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}
