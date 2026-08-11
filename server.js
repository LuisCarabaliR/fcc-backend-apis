// Aplicacion combinada para el despliegue.
//
// Los cinco proyectos siguen siendo independientes y se pueden correr por
// separado (cada uno tiene su carpeta, su puerto y su npm start). Este archivo
// existe solo para el despliegue: monta los cinco en UNA sola aplicacion, para
// no tener que sostener cinco servicios distintos en el plan gratuito, cada uno
// con su propio arranque en frio.
//
// ORDEN DE LAS RUTAS: importa, y mucho.
// El proyecto 1 define /api/:date?, que es un COMODIN: casa con cualquier cosa
// que cuelgue de /api/, incluidas /api/whoami y /api/shorturl. Express prueba
// las rutas en el orden en que se registran y se queda con la primera que casa,
// asi que el comodin tiene que ir el ULTIMO. Si se sube de sitio, se traga las
// rutas de los demas proyectos y todo lo demas devuelve fechas invalidas.

const express = require('express');
const cors = require('cors');
const path = require('node:path');

const app = express();

// En produccion la aplicacion no recibe las peticiones directamente: entran por
// el proxy de la plataforma. Sin esta linea, req.ip devuelve la direccion del
// proxy (::1) en vez de la de quien visita, y /api/whoami informa siempre lo
// mismo. Con 'trust proxy' activo, Express lee la IP real de la cabecera
// X-Forwarded-For que agrega el proxy.
//
// Ojo: confiar en esa cabecera solo es seguro cuando el unico camino hacia la
// aplicacion pasa por un proxy controlado, como aqui. Si la app fuera
// alcanzable directamente, cualquiera podria falsear su IP mandando la
// cabecera a mano.
app.set('trust proxy', true);

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Portada con enlaces a los cinco
app.use(express.static(path.join(__dirname, 'public')));

// --- Rutas especificas primero -------------------------------------------
app.use(require('./02-request-header-parser/routes'));
app.use(require('./03-url-shortener/routes'));
app.use(require('./04-exercise-tracker/routes'));
app.use(require('./05-file-metadata/routes'));

// --- El comodin, al final ------------------------------------------------
app.use(require('./01-timestamp-microservice/routes'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}`);
});
