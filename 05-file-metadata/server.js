// File Metadata Microservice - freeCodeCamp, Back End Development and APIs
//
// Hasta ahora los datos llegaban como texto: parametros de ruta, cabeceras o
// campos de formulario. Aca llega un ARCHIVO, que viaja en un formato distinto
// (multipart/form-data) que express no sabe leer por si solo. De eso se encarga
// multer.

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));

// storage en memoria: el archivo nunca toca el disco. Para este servicio solo
// hacen falta sus metadatos, asi que guardarlo seria acumular basura y, si
// alguien sube algo grande o malicioso, un problema de seguridad de regalo.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ---------------------------------------------------------------------------
// POST /api/fileanalyse
// ---------------------------------------------------------------------------
// upload.single('upfile') es un middleware: se ejecuta ANTES del handler,
// interpreta el cuerpo multipart y deja el archivo en req.file. El nombre
// 'upfile' tiene que coincidir con el atributo name del input del formulario;
// si no coincide, req.file llega undefined y no hay error que lo explique.
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.json({ error: 'No file uploaded' });
  }

  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size, // en bytes, y como numero
  });
});

// Manejador de errores de multer (por ejemplo, archivo demasiado grande).
// Sin esto, superar el limite devuelve una pagina de error HTML en vez de JSON.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}`);
});
