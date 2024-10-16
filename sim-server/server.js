const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// SQLite database setup
const db = new sqlite3.Database('./drone_data.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS flights (
      flight_id TEXT PRIMARY KEY,
      drone_id TEXT,
      tracker_id TEXT,
      start TEXT,
      end TEXT,
      company_id TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flight_id TEXT,
      ua_id TEXT,
      ua_telem_type TEXT,
      t TEXT,
      lat TEXT,
      lng TEXT,
      alt INTEGER,
      v INTEGER,
      a INTEGER,
      head INTEGER,
      status INTEGER,
      FOREIGN KEY(flight_id) REFERENCES flights(flight_id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      waypoints TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS geofences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      coordinates TEXT
    )`);
  }
});

// API Routes
app.get('/api/flights', (req, res) => {
  db.all('SELECT * FROM flights', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ status: 'success', data: { flights: rows } });
  });
});

app.get('/api/flights/:flightId/telemetry', (req, res) => {
  const { flightId } = req.params;
  db.all('SELECT * FROM telemetry WHERE flight_id = ?', [flightId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ status: 'success', data: { flight: { flight_id: flightId, telemetry: rows } } });
  });
});

app.post('/api/flights', (req, res) => {
  const { flight_id, drone_id, tracker_id, start, end, company_id, telemetry } = req.body;
  db.run(`INSERT INTO flights (flight_id, drone_id, tracker_id, start, end, company_id) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    [flight_id, drone_id, tracker_id, start, end, company_id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const stmt = db.prepare(`INSERT INTO telemetry (flight_id, ua_id, ua_telem_type, t, lat, lng, alt, v, a, head, status) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      telemetry.forEach(item => {
        stmt.run([flight_id, item.ua_id, item.ua_telem_type, item.t, item.lat, item.lng, item.alt, item.v, item.a, item.head, item.status]);
      });
      stmt.finalize();
      
      res.json({ status: 'success', message: 'Flight added successfully' });
    }
  );
});

// Routes and Geofences API
app.get('/api/routes', (req, res) => {
  db.all('SELECT * FROM routes', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ status: 'success', data: { routes: rows } });
  });
});

app.post('/api/routes', (req, res) => {
  const { name, waypoints } = req.body;
  db.run('INSERT INTO routes (name, waypoints) VALUES (?, ?)', [name, JSON.stringify(waypoints)], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ status: 'success', message: 'Route added successfully', id: this.lastID });
  });
});

app.get('/api/geofences', (req, res) => {
  db.all('SELECT * FROM geofences', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ status: 'success', data: { geofences: rows } });
  });
});

app.post('/api/geofences', (req, res) => {
  const { name, coordinates } = req.body;
  db.run('INSERT INTO geofences (name, coordinates) VALUES (?, ?)', [name, JSON.stringify(coordinates)], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ status: 'success', message: 'Geofence added successfully', id: this.lastID });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});