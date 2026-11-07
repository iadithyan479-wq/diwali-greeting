const express = require('express'), multer = require('multer');
const path = require('path'), fs = require('fs'), crypto = require('crypto');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  const { DatabaseSync } = require('node:sqlite');
  Database = class {
    constructor(file) {
      return new DatabaseSync(file);
    }
  };
}
const app = express(), PORT = process.env.PORT || 3000;
const UP = path.join(__dirname, 'uploads'); fs.mkdirSync(UP, { recursive: true });
const db = new Database(path.join(__dirname, 'greetings.db'));
db.exec(`CREATE TABLE IF NOT EXISTS greetings(id TEXT PRIMARY KEY, sender TEXT, receiver TEXT,
  message TEXT, audio TEXT, views INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
const upload = multer({
  storage: multer.diskStorage({ destination: UP, filename: (r, f, cb) =>
    cb(null, crypto.randomBytes(8).toString('hex') + (path.extname(f.originalname) || '.webm').replace(/[^.\w]/g, '')) }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (r, f, cb) => cb(null, f.mimetype.startsWith('audio/') || f.mimetype === 'video/webm')
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UP));
app.post('/api/greetings', upload.single('audio'), (req, res) => {
  const clip = (v, n, d) => String(v || d).trim().slice(0, n) || d;
  const id = crypto.randomBytes(5).toString('base64url');
  db.prepare('INSERT INTO greetings(id,sender,receiver,message,audio) VALUES(?,?,?,?,?)').run(
    id, clip(req.body.sender, 60, 'Someone who cares'), clip(req.body.receiver, 60, 'Dear One'),
    clip(req.body.message, 600, 'Wishing you a beautiful and prosperous Diwali!'), req.file ? req.file.filename : null);
  res.json({ id, url: `/g/${id}` });
});
app.get('/api/greetings/:id', (req, res) => {
  const g = db.prepare('SELECT * FROM greetings WHERE id=?').get(req.params.id);
  if (!g) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE greetings SET views=views+1 WHERE id=?').run(g.id);
  res.json({ sender: g.sender, receiver: g.receiver, message: g.message, views: g.views + 1,
    audioUrl: g.audio ? `/uploads/${g.audio}` : null });
});
app.get('/g/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((err, req, res, next) => res.status(400).json({ error: err.message }));
app.listen(PORT, () => console.log(`Diwali Greeting running on http://localhost:${PORT}`));
