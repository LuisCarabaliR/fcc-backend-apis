// Request Header Parser Microservice - freeCodeCamp, Back End Development and APIs
//
// En el proyecto 1 leiste datos de la RUTA (req.params). Aca vas a leer datos
// que el navegador manda sin que el usuario escriba nada: las CABECERAS.
//
// LO QUE FALTA ES TUYO: el endpoint /api/whoami (mas abajo, marcado con TODO).

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ---------------------------------------------------------------------------
// AYUDA PARA EXPLORAR. Entra a /api/debug y mira lo que trae la peticion:
// ahi estan, con nombre y apellido, los tres datos que necesitas.
// Esta ruta no la pide freeCodeCamp; es para que veas antes de escribir.
// ---------------------------------------------------------------------------
app.get('/api/debug', (req, res) => {
  res.json({
    ip_segun_express: req.ip,
    todas_las_cabeceras: req.headers,
  });
});

// ---------------------------------------------------------------------------
// TODO: aca va TU codigo.
//
// Endpoint: GET /api/whoami
//
// Tiene que devolver un objeto con EXACTAMENTE estas tres claves:
//   ipaddress  -> la direccion IP de quien hace la peticion
//   language   -> el idioma que prefiere el navegador
//   software   -> que navegador y sistema operativo es
//
// Los tres salen de lo que viste en /api/debug. No hace falta calcular nada:
// es leer y reempaquetar.
// ---------------------------------------------------------------------------
app.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.ip,
    // Los nombres de cabecera llevan guion, y en JavaScript el guion es una
    // resta: req.headers.accept-language se leeria como una operacion y falla.
    // Por eso se accede con corchetes y comillas.
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}`);
});
