// Rutas del Request Header Parser, aisladas en un Router.

const express = require('express');

const router = express.Router();

// Ruta de exploracion: no la pide freeCodeCamp, sirve para ver que trae la
// peticion antes de escribir nada.
router.get('/api/debug', (req, res) => {
  res.json({
    ip_segun_express: req.ip,
    todas_las_cabeceras: req.headers,
  });
});

router.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.ip,
    // Los nombres de cabecera llevan guion, y en JavaScript el guion es una
    // resta: req.headers.accept-language se leeria como una operacion y falla.
    // Por eso se accede con corchetes y comillas.
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
  });
});

module.exports = router;
