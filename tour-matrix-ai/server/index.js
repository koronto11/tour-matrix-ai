const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

function readData(file) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function writeData(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// Serve website static files at /home (with index.html support)
app.use('/home', express.static(path.join(__dirname, '..', 'website'), { index: 'index.html' }));

// Serve admin static files at /home/admin (with index.html support)
app.use('/home/admin', express.static(path.join(__dirname, '..', 'admin'), { index: 'admin.html' }));

// Fallback: /home -> index.html
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'website', 'index.html'));
});

// Fallback: /home/admin -> admin.html
app.get('/home/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'admin.html'));
});

// API endpoints at /home/api
app.post('/home/api/demo', (req, res) => {
  const { full_name, email, company_name, interest_role, message } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const data = readData('demos.json');
  data.unshift({
    date: new Date().toISOString().slice(0, 10),
    name: full_name,
    email,
    company: company_name || '',
    role: interest_role || '',
    message: message || '',
    status: 'new'
  });
  writeData('demos.json', data);
  res.json({ success: true });
});

app.post('/home/api/dmc', (req, res) => {
  const { full_name, email, company_name, primary_destinations, specialization_note } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const data = readData('dmcs.json');
  data.unshift({
    date: new Date().toISOString().slice(0, 10),
    name: full_name,
    email,
    company: company_name || '',
    destinations: primary_destinations || '',
    specialization: specialization_note || '',
    status: 'new'
  });
  writeData('dmcs.json', data);
  res.json({ success: true });
});

app.get('/home/api/demo', (req, res) => {
  res.json(readData('demos.json'));
});

app.patch('/home/api/demo/:index', (req, res) => {
  const data = readData('demos.json');
  const idx = parseInt(req.params.index, 10);
  if (idx < 0 || idx >= data.length) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  data[idx].status = req.body.status;
  writeData('demos.json', data);
  res.json({ success: true });
});

app.get('/home/api/dmc', (req, res) => {
  res.json(readData('dmcs.json'));
});

app.patch('/home/api/dmc/:index', (req, res) => {
  const data = readData('dmcs.json');
  const idx = parseInt(req.params.index, 10);
  if (idx < 0 || idx >= data.length) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  data[idx].status = req.body.status;
  writeData('dmcs.json', data);
  res.json({ success: true });
});

// Redirect root to /home
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Website: http://localhost:${PORT}/home`);
  console.log(`Admin:   http://localhost:${PORT}/home/admin`);
});