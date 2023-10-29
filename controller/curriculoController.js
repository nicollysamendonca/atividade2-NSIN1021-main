const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Criar currículo
async function createCurriculo(req, res) {
  try {
    const { nome, email, contato, formacao, experiencia } = req.body;
    const query = 'INSERT INTO curriculo (nome, email, contato, formacao, experiencia) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const valores = [nome, email, contato, formacao, experiencia];

    // Exibindo querys no console
    console.log('Query:', query);
    console.log('Values:', valores);

    const result = await pool.query(query, valores);
    console.log('Insert result:', result.rows[0]);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Ocorreu um erro ao criar esse currículo.' });
  }
}

// Atualizar o currículo
async function updateCurriculo(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, contato, formacao, experiencia } = req.body;
    const query = 'UPDATE curriculo SET nome = $1, email = $2, contato = $3, formacao = $4, experiencia = $5 WHERE id = $6 RETURNING *';
    const valores = [nome, email, contato, formacao, experiencia, id];

    const result = await pool.query(query, valores);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Esse currículo não foi encontrado.' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Ocorreu um erro ao atualizar esse currículo.' });
  }
}

// Retornar o currículo por ID
async function getCurriculoById(req, res) {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM curriculo WHERE id = $1';
    const valores = [id];

    const result = await pool.query(query, valores);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Currículo não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar currículo por ID.' });
  }
}

// Deletar currículo por ID
async function deleteCurriculo(req, res) {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM curriculo WHERE id = $1';
    const valores = [id];

    const result = await pool.query(query, valores);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Currículo não encontrado.' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao apagar currículo por ID.' });
  }
}

// Listar currículos
async function listCurriculo(req, res) {
  try {
    const query = 'SELECT * FROM curriculo';
    const result = await pool.query(query);

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar currículos.' });
  }
}

// Módulo para exportar funções
module.exports = {
  createCurriculo,
  updateCurriculo,
  getCurriculoById,
  deleteCurriculo,
  listCurriculo,
};
