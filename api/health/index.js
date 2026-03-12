// Vercel Serverless Function for Health Check

export default async function handler(req, res) {
  try {
    // Check database connection
    const pkg = await import('pg');
    const { Pool } = pkg;

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test database connection
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      await client.release();

      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (dbError) {
      await client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}
