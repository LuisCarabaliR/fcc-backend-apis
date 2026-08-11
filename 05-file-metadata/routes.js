// Rutas del File Metadata Microservice, aisladas en un Router.

const express = require('express');
const multer = require('multer');

const router = express.Router();

// storage en memoria: el archivo nunca toca el disco. Para este servicio solo
// hacen falta sus metadatos, asi que guardarlo seria acumular basura y, si
// alguien sube algo grande o malicioso, un problema de seguridad de regalo.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// upload.single('upfile') es un middleware: se ejecuta ANTES del handler,
// interpreta el cuerpo multipart y deja el archivo en req.file. El nombre
// 'upfile' tiene que coincidir con el atributo name del input del formulario;
// si no coincide, req.file llega undefined y no hay error que lo explique.
router.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
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
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
