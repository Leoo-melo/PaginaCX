const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const Database = require('better-sqlite3');
const db = new Database('database.db', { verbose: console.log });


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Cria tabela de usuários e respostas, se não existirem
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT,
      anonimo INTEGER
    )
  `);

  db.run(`
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
    )
  `);
});

// Rota para salvar o cadastro
app.post('/cadastro', (req, res) => {
  const { name, email, anonymous } = req.body;
  const anonimo = anonymous ? 1 : 0;

  db.run(`INSERT INTO usuarios (nome, email, anonimo) VALUES (?, ?, ?)`, [name, email, anonimo], function(err) {
    if (err) {
      return res.status(500).send('Erro ao salvar cadastro');
    }
    // Redireciona para a pesquisa
    res.redirect(`/pesquisa.html?usuario_id=${this.lastID}`);
  });
});

// Rota para salvar as respostas da pesquisa
app.post('/responder', (req, res) => {
  const { usuario_id, experiencia1, experiencia2, experiencia3, experiencia4, experiencia5, experiencia6 } = req.body;

  db.run(`
    INSERT INTO respostas (usuario_id, experiencia1, experiencia2, experiencia3, experiencia4, experiencia5, experiencia6)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuario_id, experiencia1, experiencia2, experiencia3, experiencia4, experiencia5, experiencia6],
    (err) => {
      if (err) {
        return res.status(500).send('Erro ao salvar respostas');
      }
      // Redireciona para a página de confirmação
      res.redirect('/resposta_enviada.html');
    }
  );
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
