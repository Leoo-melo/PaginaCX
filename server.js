const express = require('express');
const path = require('path');
const Database = require('better-sqlite3'); // Usa o pacote better-sqlite3 para operações rápidas e síncronas

const app = express();
const dbPath = path.join(__dirname, 'database.db'); // Caminho do banco de dados
const db = new Database(dbPath, { verbose: console.log });

// Middleware
app.use(express.urlencoded({ extended: true })); // Substitui body-parser
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'

// Cria tabelas no banco de dados, se ainda não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    anonimo INTEGER
  );

  CREATE TABLE IF NOT EXISTS respostas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    experiencia1 INTEGER,
    experiencia2 INTEGER,
    experiencia3 INTEGER,
    experiencia4 INTEGER,
    experiencia5 INTEGER,
    experiencia6 INTEGER,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
  );
`);

// Rota para salvar o cadastro
app.post('/cadastro', (req, res) => {
  const { name, email, anonymous } = req.body;
  const anonimo = anonymous === 'on' ? 1 : 0; // Converte checkbox para valor numérico

  try {
    const stmt = db.prepare(`INSERT INTO usuarios (nome, email, anonimo) VALUES (?, ?, ?)`);
    const result = stmt.run(name, email, anonimo);

    // Redireciona para a página de pesquisa com o ID do usuário
    res.redirect(`/pesquisa.html?usuario_id=${result.lastInsertRowid}`);
  } catch (err) {
    console.error('Erro ao salvar cadastro:', err.message);
    res.status(500).send('Erro ao salvar cadastro.');
  }
});

// Rota para salvar as respostas da pesquisa
app.post('/responder', (req, res) => {
  const { usuario_id, experiencia1, experiencia2, experiencia3, experiencia4, experiencia5, experiencia6 } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO respostas (usuario_id, experiencia1, experiencia2, experiencia3, experiencia4, experiencia5, experiencia6)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(usuario_id, experiencia1, experiencia2, experiencia3, experiencia4, experiencia5, experiencia6);

    // Redireciona para a página de confirmação
    res.redirect('/resposta_enviada.html');
  } catch (err) {
    console.error('Erro ao salvar respostas:', err.message);
    res.status(500).send('Erro ao salvar respostas.');
  }
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
