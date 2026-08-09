# Proyecto 1 — Timestamp Microservice

freeCodeCamp · Back End Development and APIs

## Qué hay que construir

Un endpoint `GET /api/:date?` que reciba una fecha y devuelva JSON con dos
representaciones de esa misma fecha.

## Los 7 casos que evalúa freeCodeCamp

| # | Petición | Respuesta esperada |
|---|----------|--------------------|
| 1 | `/api/2015-12-25` (fecha válida) | JSON con clave `unix` = timestamp en **milisegundos**, tipo **Number** |
| 2 | `/api/2015-12-25` (fecha válida) | JSON con clave `utc` = string con formato `Thu, 01 Jan 1970 00:00:00 GMT` |
| 3 | `/api/1451001600000` | exactamente `{ "unix": 1451001600000, "utc": "Fri, 25 Dec 2015 00:00:00 GMT" }` |
| 4 | Cualquier fecha que `new Date(cadena)` sepa interpretar | debe funcionar |
| 5 | `/api/esto-no-es-fecha` (inválida) | `{ "error": "Invalid Date" }` |
| 6 | `/api/` (parámetro vacío) | la hora **actual**, con clave `unix` |
| 7 | `/api/` (parámetro vacío) | la hora **actual**, con clave `utc` |

## Cómo correrlo

```bash
npm install
npm start
```

Luego abrí http://localhost:3000

## Las tres trampas de este proyecto

Las anoto porque son donde se atasca casi todo el mundo, no para darte la
solución:

1. **Unix en milisegundos, no en segundos.** Muchos lenguajes usan segundos;
   JavaScript usa milisegundos. Si tu número tiene 10 dígitos en vez de 13,
   ahí está el error.

2. **El parámetro de ruta siempre llega como texto.** `req.params.date` es un
   *string*, incluso cuando el usuario mandó `1451001600000`. `new Date("1451001600000")`
   NO es lo mismo que `new Date(1451001600000)`: el primero intenta leerlo como
   fecha con formato y falla. Tenés que distinguir el caso.

3. **Cómo se detecta una fecha inválida.** `new Date("cualquier basura")` no
   lanza error: devuelve un objeto Date especial cuyo `getTime()` da `NaN`.
   Buscá cómo se comprueba eso.

## Métodos que vas a necesitar

No los uses a ciegas, mirá qué devuelve cada uno:

- `new Date(...)`
- `.getTime()`
- `.toUTCString()`
- `Number.isNaN(...)`
- `req.params`
- `res.json(...)`
