# Proyecto 2 — Request Header Parser Microservice

freeCodeCamp · Back End Development and APIs

## Qué hay que construir

Un endpoint `GET /api/whoami` que devuelva quién está haciendo la petición.

## Los 3 casos que evalúa freeCodeCamp

| # | Requisito |
|---|-----------|
| 1 | La respuesta trae la clave `ipaddress` con la IP de quien pide |
| 2 | La respuesta trae la clave `language` con el idioma preferido del navegador |
| 3 | La respuesta trae la clave `software` con el navegador y sistema operativo |

Los tres en la **misma** respuesta JSON:

```json
{
  "ipaddress": "::1",
  "language": "es-ES,es;q=0.9",
  "software": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ..."
}
```

## Cómo correrlo

```bash
npm install
npm run dev
```

Luego abrí http://localhost:3001

**Empezá por [/api/debug](http://localhost:3001/api/debug)**, que ya está escrito.
Ahí vas a ver todo lo que trae la petición, con los nombres reales. De ahí salen
los tres datos: no hay que calcular nada, solo leer y reempaquetar.

## Qué es una cabecera

Cuando tu navegador pide una página, además de la URL manda una lista de datos
sobre sí mismo: qué idiomas entiende, qué navegador es, qué tipos de archivo
acepta. Eso son las **cabeceras** (*headers*). El usuario no las escribe: las
manda el navegador solo.

En Express las tenés todas en `req.headers`, que es un objeto normal. Los
nombres vienen **siempre en minúscula**, aunque el navegador los haya mandado
con mayúsculas.

## Lo que conviene saber

**La IP.** Express te la da en `req.ip`. En tu máquina vas a ver `::1`, que es
`localhost` en formato IPv6 — no está mal, es tu propia máquina.

Cuando lo despliegues, tu servidor va a estar detrás de un proxy, y `req.ip`
te devolverá la IP *del proxy*, no la del visitante. La IP real viaja entonces
en una cabecera aparte. Mirá `/api/debug` cuando esté desplegado y buscá cuál
es: es un problema real que vas a encontrar en cualquier trabajo de backend.

**El idioma y el software** salen directo de dos cabeceras. En `/api/debug` las
vas a reconocer por el nombre, son bastante literales.

## Pista sobre los nombres de clave

Igual que en el proyecto 1, freeCodeCamp compara las claves **literal**:
`ipaddress` (todo junto, sin guion ni mayúscula), `language` y `software`.
