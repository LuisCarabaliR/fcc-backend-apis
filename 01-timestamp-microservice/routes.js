// Rutas del Timestamp Microservice, aisladas en un Router.
//
// Un Router es un mini-app de Express: agrupa rutas y se monta donde haga
// falta. Asi el mismo codigo sirve para el servidor propio de este proyecto
// (server.js, puerto 3000) y para la aplicacion combinada del despliegue,
// sin duplicar nada.
//
// OJO: la ruta /api/:date? es un COMODIN. En la app combinada debe montarse
// la ULTIMA, o se traga /api/whoami, /api/shorturl y las demas.

const express = require('express');

const router = express.Router();

router.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

router.get('/api/:date?', (req, res) => {
  const { date } = req.params;

  let parsed;

  if (!date) {
    // CASO VACIO. Sin parametro, req.params.date es undefined, y new Date()
    // sin argumentos devuelve la hora actual. Va primero porque undefined
    // fallaria las dos comprobaciones de abajo.
    parsed = new Date();
  } else if (/^\d+$/.test(date)) {
    // TIMESTAMP UNIX. El parametro SIEMPRE llega como texto, asi que
    // "1451001600000" es un string. new Date("1451001600000") intenta leerlo
    // como fecha con formato y da Invalid Date; hay que convertirlo a numero
    // para que Date lo tome como milisegundos.
    parsed = new Date(Number(date));
  } else {
    // FECHA CON FORMATO. "2015-12-25" y similares los interpreta Date solo.
    parsed = new Date(date);
  }

  // FECHA INVALIDA. new Date("basura") NO lanza error: devuelve un objeto Date
  // cuyo getTime() da NaN. Por eso hay que preguntarlo explicitamente.
  if (Number.isNaN(parsed.getTime())) {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: parsed.getTime(),
    utc: parsed.toUTCString(),
  });
});

module.exports = router;
