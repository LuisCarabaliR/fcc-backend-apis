// Exercise Tracker - freeCodeCamp, Back End Development and APIs
//
// El proyecto mas grande de los cinco: dos tablas relacionadas, un historial
// y filtros. Aca es donde el ejercicio deja de ser "una ruta que responde" y
// empieza a parecerse a una API de verdad.

const express = require('express');
const cors = require('cors');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Base de datos
// ---------------------------------------------------------------------------
const db = new DatabaseSync(path.join(__dirname, 'tracker.db'));

// FOREIGN KEY deja la relacion declarada en el esquema, no solo en el codigo:
// SQLite impide crear un ejercicio cuyo usuario no exista.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    _id      TEXT PRIMARY KEY,
    username TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL,
    description TEXT NOT NULL,
    duration    INTEGER NOT NULL,
    date        TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(_id)
  );
`);
db.exec('PRAGMA foreign_keys = ON');

const insertUser = db.prepare('INSERT INTO users (_id, username) VALUES (?, ?)');
const findUser = db.prepare('SELECT * FROM users WHERE _id = ?');
const allUsers = db.prepare('SELECT _id, username FROM users');
const insertExercise = db.prepare(
  'INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)',
);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ---------------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------------
// freeCodeCamp exige el formato de toDateString(): "Mon Jan 01 1990".
// Se guarda en la base como ISO (yyyy-mm-dd), que ordena y compara bien como
// texto, y se convierte al formato pedido solo al responder. Guardar ya
// formateado haria imposible filtrar por rango.
//
// CUIDADO CON LA ZONA HORARIA. Aca hay un bug clasico, y se cayo en el:
//   - new Date("1990-01-01") interpreta la cadena como medianoche UTC.
//   - toDateString() imprime en hora LOCAL.
// En Colombia (UTC-5) esa medianoche UTC son las 19:00 del dia anterior, asi
// que "1990-01-01" se imprimia como "Sun Dec 31 1989": un dia menos.
//
// La solucion es no mezclar los dos mundos. Una fecha de calendario no es un
// instante en el tiempo: no tiene hora ni zona. Por eso se construye y se lee
// siempre con los componentes locales (getFullYear/getMonth/getDate y el
// constructor new Date(y, m, d)), nunca con toISOString ni con sufijo Z.

/** Fecha -> "yyyy-mm-dd" usando los componentes locales. */
const aISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
};

/** "yyyy-mm-dd" -> "Mon Jan 01 1990" */
const aRespuesta = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toDateString();
};

/**
 * Interpreta lo que mande el usuario. Las cadenas yyyy-mm-dd se arman a mano
 * en hora local; cualquier otro formato se delega a Date. Devuelve null si no
 * se pudo interpretar.
 */
const parseFecha = (texto) => {
  if (!texto) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto).trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(texto);
  return Number.isNaN(d.getTime()) ? null : d;
};

// ---------------------------------------------------------------------------
// POST /api/users  -> crea usuario
// ---------------------------------------------------------------------------
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ error: 'username is required' });

  // Se imita el formato de id de MongoDB (24 caracteres hexadecimales) porque
  // es lo que espera la interfaz de pruebas de freeCodeCamp.
  const _id = crypto.randomBytes(12).toString('hex');
  insertUser.run(_id, username);

  res.json({ username, _id });
});

// ---------------------------------------------------------------------------
// GET /api/users  -> lista todos
// ---------------------------------------------------------------------------
app.get('/api/users', (req, res) => {
  res.json(allUsers.all());
});

// ---------------------------------------------------------------------------
// POST /api/users/:_id/exercises  -> agrega ejercicio
// ---------------------------------------------------------------------------
app.post('/api/users/:_id/exercises', (req, res) => {
  const user = findUser.get(req.params._id);
  if (!user) return res.json({ error: 'user not found' });

  const { description, duration, date } = req.body;
  if (!description || !duration) {
    return res.json({ error: 'description and duration are required' });
  }

  // Sin fecha, se usa hoy. Con fecha invalida, tambien: la especificacion no
  // pide rechazarla.
  const iso = aISO(parseFecha(date) ?? new Date());

  // duration tiene que salir como NUMERO en la respuesta, no como texto.
  // Del formulario llega siempre como string.
  const minutos = Number(duration);

  insertExercise.run(user._id, description, minutos, iso);

  res.json({
    _id: user._id,
    username: user.username,
    date: aRespuesta(iso),
    duration: minutos,
    description,
  });
});

// ---------------------------------------------------------------------------
// GET /api/users/:_id/logs  -> historial, con filtros opcionales
// ---------------------------------------------------------------------------
app.get('/api/users/:_id/logs', (req, res) => {
  const user = findUser.get(req.params._id);
  if (!user) return res.json({ error: 'user not found' });

  const { from, to, limit } = req.query;

  // La consulta se arma por partes para no interpolar valores en el SQL:
  // cada filtro agrega su condicion y su parametro. Concatenar los valores
  // directamente seria una inyeccion SQL de manual.
  let sql = 'SELECT description, duration, date FROM exercises WHERE user_id = ?';
  const params = [user._id];

  const desde = parseFecha(from);
  if (desde) {
    sql += ' AND date >= ?';
    params.push(aISO(desde));
  }
  const hasta = parseFecha(to);
  if (hasta) {
    sql += ' AND date <= ?';
    params.push(aISO(hasta));
  }

  sql += ' ORDER BY date ASC';

  if (limit && Number(limit) > 0) {
    sql += ' LIMIT ?';
    params.push(Number(limit));
  }

  const filas = db.prepare(sql).all(...params);

  const log = filas.map((f) => ({
    description: f.description,
    duration: f.duration,
    date: aRespuesta(f.date),
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log,
  });
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}`);
});
