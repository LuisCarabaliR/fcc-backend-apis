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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}`);
});
