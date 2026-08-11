# freeCodeCamp — Back End Development and APIs

Los cinco proyectos de la certificación *Back End Development and APIs*.

Luis Alberto Carabalí Rivera · [luiscarabalir.github.io](https://luiscarabalir.github.io/)

## Proyectos

| # | Proyecto | Puerto | Qué practica | Estado |
|---|----------|--------|--------------|--------|
| 1 | [Timestamp Microservice](01-timestamp-microservice) | 3000 | parámetros de ruta, fechas | ✅ 7/7 |
| 2 | [Request Header Parser](02-request-header-parser) | 3001 | cabeceras HTTP | ✅ 3/3 |
| 3 | [URL Shortener](03-url-shortener) | 3002 | POST, persistencia, validación por DNS | ✅ 6/6 |
| 4 | [Exercise Tracker](04-exercise-tracker) | 3003 | dos tablas, historial, filtros | ✅ 22/22 |
| 5 | [File Metadata](05-file-metadata) | 3004 | subida de archivos (multipart) | ✅ 4/4 |

## Cómo correr cualquiera

```bash
cd 0X-nombre-del-proyecto
npm install
npm run dev
```

`npm run dev` usa `node --watch`: reinicia solo al guardar.

## Stack

Node.js y Express, sin framework por encima. Los proyectos 3 y 4 guardan datos
con **`node:sqlite`**, el módulo de SQLite que viene incluido en Node desde la
versión 22 — sin dependencia externa ni servidor de base de datos que levantar.
El 5 usa `multer` para leer `multipart/form-data`.

Cada proyecto es independiente: tiene su propio `package.json` y su propio
puerto, así que se pueden correr varios a la vez.

## Cosas que valen la pena mirar en el código

**Proyecto 1 — el parámetro de ruta siempre llega como texto.**
`new Date("1451001600000")` no es lo mismo que `new Date(1451001600000)`: con
texto intenta interpretarlo como fecha con formato y falla. Y una fecha
inválida no lanza error, devuelve un `Date` cuyo `getTime()` es `NaN`.

**Proyecto 2 — las cabeceras llevan guion.**
`req.headers.accept-language` no funciona porque JavaScript lee el guion como
una resta. Hay que usar corchetes.

**Proyecto 3 — validar no es comprobar el formato.**
Que el texto tenga forma de URL no significa que el dominio exista. Se valida
en dos pasos: protocolo `http/https`, y resolución real por DNS.

**Proyecto 4 — el bug de zona horaria.**
Una fecha de calendario no es un instante: no tiene hora ni zona.
`new Date("1990-01-01")` se interpreta como medianoche **UTC**, pero
`toDateString()` imprime en hora **local**. En Colombia (UTC−5) eso convertía
`1990-01-01` en `Sun Dec 31 1989`. La solución es no mezclar los dos mundos y
usar siempre componentes locales. Está documentado en el código.

**Proyecto 5 — por qué el archivo no toca el disco.**
Solo hacen falta los metadatos, así que se usa `memoryStorage`. Guardarlo sería
acumular basura y regalar un problema de seguridad.

## Despliegue

Los cinco corren desde una sola aplicación:
**https://fcc-backend-apis-j7lg.onrender.com**

| # | Endpoint | Validado por freeCodeCamp |
|---|----------|---------------------------|
| 1 | `/api/:date?` | ✅ |
| 2 | `/api/whoami` | ✅ |
| 3 | `/api/shorturl` | ✅ |
| 4 | `/api/users/...` | ✅ |
| 5 | `/api/fileanalyse` | ⚠️ ver abajo |

## Sobre el proyecto 5 y la certificación V8

El File Metadata Microservice **funciona correctamente** — verificado en
producción replicando el payload exacto del evaluador:

```
$ curl -F "upfile=@01d.png;filename=icon;type=image/png" \
       https://fcc-backend-apis-j7lg.onrender.com/api/fileanalyse
{"name":"icon","type":"image/png","size":1148}
```

Aun así, el test 4 de freeCodeCamp lo marca como fallido. La causa es un **bug
del evaluador de freeCodeCamp**, no del código:

```
Error: blob is not implemented yet
  at Object.blob (dom-test-evaluator.js:2:103360)
```

Su sandbox no implementa `Response.blob()`, así que el test falla al preparar
el archivo y **nunca llega a enviar la petición**. Se comprobó con los registros
del servidor: durante cada ejecución sólo entran los dos `GET /` de los tests 2
y 3, y ningún `POST /api/fileanalyse`.

El equipo de freeCodeCamp ha respondido en el foro que esta certificación está
**archivada, sin mantenimiento y sin opción de revisión manual**, y recomienda
la versión vigente
([back-end-development-and-apis-v9](https://www.freecodecamp.org/learn/back-end-development-and-apis-v9/)).

El código queda aquí porque funciona y sirve como referencia, aunque el
certificado V8 ya no sea obtenible.
