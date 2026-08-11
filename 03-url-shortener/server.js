// URL Shortener Microservice - freeCodeCamp, Back End Development and APIs
//
// Primer proyecto que GUARDA datos: hasta ahora todo se calculaba al vuelo.
// Se usa node:sqlite, que viene incluido en Node desde la 22, asi que no hay
// dependencia externa ni servidor de base de datos que levantar.

const express = require('express');
const cors = require('cors');
const dns = require('node:dns');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));

// Necesario para leer el cuerpo de un formulario (POST con url=...).
// Sin esto req.body llega undefined y todo falla sin decir por que.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Base de datos
// ---------------------------------------------------------------------------
const db = new DatabaseSync(path.join(__dirname, 'urls.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    short_url INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL UNIQUE
  )
`);

const findByUrl = db.prepare('SELECT * FROM urls WHERE original_url = ?');
const findByShort = db.prepare('SELECT * FROM urls WHERE short_url = ?');
const insertUrl = db.prepare('INSERT INTO urls (original_url) VALUES (?)');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ---------------------------------------------------------------------------
// Validacion de la URL
// ---------------------------------------------------------------------------
/**
 * No alcanza con que el texto "parezca" una URL: freeCodeCamp comprueba que
 * "ftp:/john-doe.org" sea rechazada. Se valida en dos pasos:
 *   1. Que sea sintacticamente valida Y de protocolo http/https.
 *   2. Que el dominio exista de verdad, resolviendolo por DNS.
 */
function validarUrl(texto, callback) {
  let parsed;
  try {
    parsed = new URL(texto);
  } catch {
    return callback(false); // ni siquiera es una URL bien formada
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return callback(false);
  }

  // dns.lookup pregunta al sistema si ese dominio resuelve a una IP.
  // Es asincrono porque implica salir a la red.
  dns.lookup(parsed.hostname, (err) => callback(!err));
}

// ---------------------------------------------------------------------------
// POST /api/shorturl  -> acorta
// ---------------------------------------------------------------------------
app.post('/api/shorturl', (req, res) => {
  const original = req.body.url;

  validarUrl(original, (esValida) => {
    if (!esValida) {
      return res.json({ error: 'invalid url' });
    }

    // Si ya la habiamos acortado, se devuelve el mismo codigo en vez de
    // crear uno nuevo. Ademas evita chocar con el UNIQUE de la tabla.
    const existente = findByUrl.get(original);
    if (existente) {
      return res.json({
        original_url: existente.original_url,
        short_url: existente.short_url,
      });
    }

    const { lastInsertRowid } = insertUrl.run(original);
    res.json({
      original_url: original,
      short_url: Number(lastInsertRowid),
    });
  });
});

// ---------------------------------------------------------------------------
// GET /api/shorturl/:short  -> redirige
// ---------------------------------------------------------------------------
app.get('/api/shorturl/:short', (req, res) => {
  const fila = findByShort.get(Number(req.params.short));
  if (!fila) {
    return res.json({ error: 'No short URL found for the given input' });
  }
  res.redirect(fila.original_url);
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}`);
});
