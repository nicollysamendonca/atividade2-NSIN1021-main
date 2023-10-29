const { Pool } = require('pg');

// Conexão com o BD
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;