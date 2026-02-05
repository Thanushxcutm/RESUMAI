require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Analysis = require('./models/Analysis');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// In-memory storage fallback
let mockUsers = [];
let mockAnalyses = [];

const uri = process.env.MONGODB_URI;
let mongoConnected = false;

if (uri && uri !== 'mongodb+srv://thanushmasika_db_user:<db_password>@resumai.ibrpozd.mongodb.net/?appName=Resumai') {
  mongoose.connect(uri, { autoIndex: true })
    .then(() => {
      console.log('✅ Connected to MongoDB');
      mongoConnected = true;
    })
    .catch((err) => {
      console.warn('⚠️  MongoDB connection failed. Using in-memory storage.');
      console.warn('To enable MongoDB, update MONGODB_URI in server/.env with your actual credentials.');
    });
} else {
  console.warn('⚠️  No valid MongoDB URI. Using in-memory storage.');
  console.warn('To enable MongoDB, update MONGODB_URI in server/.env');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Token error' });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalid' });
  }
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    
    if (mongoConnected) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'User already exists' });
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const user = await User.create({ email, passwordHash: hash, name });
      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } else {
      // Mock signup
      if (mockUsers.find(u => u.email === email)) return res.status(409).json({ error: 'User already exists' });
      const userId = 'mock_' + Date.now();
      const user = { id: userId, email, name: name || email.split('@')[0] };
      mockUsers.push({ ...user, password });
      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    
    if (mongoConnected) {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = generateToken(user);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } else {
      // Mock login
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const userId = user.id;
      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: userId, email: user.email, name: user.name } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    if (mongoConnected) {
      const user = await User.findById(req.user.id).select('-passwordHash');
      if (!user) return res.status(404).json({ error: 'Not found' });
      res.json({ user: { id: user._id, email: user.email, name: user.name } });
    } else {
      const user = mockUsers.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ error: 'Not found' });
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/analysis', authMiddleware, async (req, res) => {
  try {
    const { resumeText, analysis } = req.body;
    if (mongoConnected) {
      const doc = await Analysis.create({ userId: req.user.id, resumeText, analysis });
      res.json({ id: doc._id, createdAt: doc.createdAt });
    } else {
      const analysisId = 'mock_analysis_' + Date.now();
      mockAnalyses.push({ id: analysisId, userId: req.user.id, resumeText, analysis, createdAt: new Date() });
      res.json({ id: analysisId, createdAt: new Date() });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/analysis/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (mongoConnected) {
      const list = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(50);
      res.json({ items: list });
    } else {
      const list = mockAnalyses.filter(a => a.userId === userId).sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
      res.json({ items: list });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`\n🚀 ResumAI server running on port ${PORT}\n${mongoConnected ? '✅ MongoDB connected' : '⚠️  Using in-memory storage'}\n`));
