// Timestamp Microservice - freeCodeCamp, Back End Development and APIs
//
// Esto es el andamiaje: servidor, middlewares y la pagina de prueba.
// LO QUE FALTA ES TUYO: el endpoint /api/:date? (mas abajo, marcado con TODO).

const express = require('express');
const cors = require('cors');

const app = express();

// cors permite que la pagina de pruebas de freeCodeCamp le pegue a tu API
// desde otro dominio. Sin esto, el navegador bloquea las peticiones.
app.use(cors({ optionsSuccessStatus: 200 }));

// Sirve los archivos estaticos (el CSS) desde la carpeta public/
app.use(express.static('public'));

// Ruta raiz: devuelve la pagina de prueba
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ---------------------------------------------------------------------------
// EJEMPLO (viene con el boilerplate). Fijate en el patron: req.params para leer
// parametros de la ruta, res.json() para responder con JSON.
// ---------------------------------------------------------------------------
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// ---------------------------------------------------------------------------
// TODO: aca va TU codigo.
//
// Endpoint: GET /api/:date?
// El signo ? hace que el parametro sea OPCIONAL: la ruta responde tanto a
// /api/2015-12-25 como a /api/ (sin nada).
//
// Los 7 casos que tienen que pasar estan en el README.md.
// ---------------------------------------------------------------------------
app.get('/api/:date?', (req, res) => {
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
    // La expresion regular pregunta: "¿son todos digitos, de principio a fin?"
    parsed = new Date(Number(date));
  } else {
    // FECHA CON FORMATO. "2015-12-25" y similares los interpreta Date solo.
    parsed = new Date(date);
  }

  // FECHA INVALIDA. new Date("basura") NO lanza error: devuelve un objeto Date
  // cuyo getTime() da NaN. Por eso hay que preguntarlo explicitamente.
  // Se usa Number.isNaN y no el isNaN global, que convierte antes de comparar
  // y da resultados enganosos.
  if (Number.isNaN(parsed.getTime())) {
    return res.json({ error: 'Invalid Date' });
  }

  // Las claves tienen que llamarse exactamente asi: freeCodeCamp las compara
  // literal. unix va en MILISEGUNDOS (13 digitos), no en segundos.
  res.json({
    unix: parsed.getTime(),
    utc: parsed.toUTCString(),
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}`);
});
