const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const app = express();
app.use(express.json());

// Configurando Logger com Winston
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // Registra erros em um arquivo
  ],
});

// Configurando Firebase Admin com Service Account
const serviceAccount = require('./firebase-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Configurando chave secreta para o JWT
const SECRET = './firebase-credentials'; 

// Rota principal da página
app.get('/', (req, res) => {
  res.json({ info: 'Bem-vindos(as) à página inicial!' });
});

// Rota de Signup para criar um novo usuário
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    res.status(200).json({
      statusCode: 200,
      message: 'Usuário criado com sucesso!',
      data: {
        uid: userRecord.uid,
      },
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Erro ao criar usuário.',
    });
  }
});

// Rota de Login para obter um token JWT
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Autenticando usuário no Firebase
    const user = await admin.auth().getUserByEmail(email);
    // Gerar um token JWT com o UID do usuário
    const token = jwt.sign({ uid: user.uid }, SECRET, {
      expiresIn: '2h', // O Token deve expirar em 2 horas
    });

    res.status(200).json({
      statusCode: 200,
      message: 'Login realizado com sucesso!',
      data: {
        token,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(401).json({
      statusCode: 401,
      message: 'Não autorizado! Usuário não encontrado ou senha incorreta.',
    });
  }
});

// Middleware para verificar o token JWT
const verificarToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  const token = tokenHeader && tokenHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Não autorizado! Token não fornecido.',
    });
  }

  try {
    const decodedToken = jwt.verify(token, SECRET);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    res.status(401).json({
      statusCode: 401,
      message: 'Não autorizado! Token inválido.',
    });
  }
};

// Rota protegida que requer token JWT
app.get('/rotaProtegida', verificarToken, (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: 'Rota protegida: acesso permitido!',
    data: {
      uid: req.uid,
    },
  });
});

// Rota protegida para listar todos os currículos
app.get('/curriculos', verificarToken, (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: 'Lista de currículos protegida: acesso permitido!',
    data: {
      uid: req.uid,
    },
  });
});

// Rota protegida para obter um currículo por nome
app.get('/curriculos/pessoa/:nome', verificarToken, (req, res) => {
  const nome = req.params.nome;
  res.status(200).json({
    statusCode: 200,
    message: `Currículo de ${nome}: acesso permitido!`,
    data: {
      uid: req.uid,
    },
  });
});

// Rota protegida para criar um currículo
app.post('/curriculos', verificarToken, (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: 'Currículo criado com sucesso!',
    data: {
      uid: req.uid,
      novoCurriculo: req.body,
    },
  });
});

// Rota protegida para atualizar um currículo por ID
app.put('/curriculos/:id', verificarToken, (req, res) => {
  const id = req.params.id;
  res.status(200).json({
    statusCode: 200,
    message: `Currículo com ID ${id} atualizado com sucesso!`,
    data: {
      uid: req.uid,
      currículoAtualizado: req.body,
    },
  });
});

// Rota protegida para excluir um currículo por ID
app.delete('/curriculos/:id', verificarToken, (req, res) => {
  const id = req.params.id;
  res.status(200).json({
    statusCode: 200,
    message: `Currículo com ID ${id} excluído com sucesso!`,
    data: {
      uid: req.uid,
    },
  });
});

// Servidor rodando na porta 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Aplicativo em execução na porta ${port}.`);
});
