// Rutas del URL Shortener, aisladas en un Router.

const express = require('express');
const dns = require('node:dns');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const router = express.Router();

// ---------------------------------------------------------------------------
// Base de datos
// ---------------------------------------------------------------------------
// La ruta del fichero se ancla a __dirname y no al directorio de trabajo:
// asi la base es la misma tanto si arranca el servidor propio de este proyecto
// como si arranca la app combinada desde la raiz del repositorio.
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

// ---------------------------------------------------------------------------
// Validacion
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
    return callback(false);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return callback(false);
  }

  dns.lookup(parsed.hostname, (err) => callback(!err));
}

router.post('/api/shorturl', (req, res) => {
  const original = req.body.url;

  validarUrl(original, (esValida) => {
    if (!esValida) {
      return res.json({ error: 'invalid url' });
    }

    // Si ya la habiamos acortado, se devuelve el mismo codigo en vez de crear
    // uno nuevo. Ademas evita chocar con el UNIQUE de la tabla.
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

router.get('/api/shorturl/:short', (req, res) => {
  const fila = findByShort.get(Number(req.params.short));
  if (!fila) {
    return res.json({ error: 'No short URL found for the given input' });
  }
  res.redirect(fila.original_url);
});

module.exports = router;
