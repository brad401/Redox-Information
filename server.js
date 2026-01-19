require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const DatabaseManager = require('./database');

const app = express();
const db = new DatabaseManager();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'redox-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Public API endpoints
// Verify access code
app.post('/api/verify-access', (req, res) => {
  try {
    const { accessCode, firstName, lastName } = req.body;

    if (!accessCode || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const isValid = db.verifyAccessCode(accessCode);

    if (isValid) {
      // Store submission
      db.addSubmission(firstName, lastName);

      res.json({
        success: true,
        message: 'Access granted',
        redirectUrl: process.env.REDIRECT_URL
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Invalid access code. Please check and try again.'
      });
    }
  } catch (error) {
    console.error('Error verifying access:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Admin authentication endpoints
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAuthenticated: !!req.session.isAdmin });
});

// Protected admin endpoints
app.get('/api/admin/submissions', requireAdmin, (req, res) => {
  try {
    const submissions = db.getAllSubmissions();
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const stats = db.getSubmissionStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/access-code', requireAdmin, (req, res) => {
  try {
    const accessCode = db.getAccessCode();
    res.json({ success: true, accessCode });
  } catch (error) {
    console.error('Error fetching access code:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/admin/access-code', requireAdmin, (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode || accessCode.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Access code cannot be empty'
      });
    }

    db.updateAccessCode(accessCode.trim());
    res.json({ success: true, message: 'Access code updated successfully' });
  } catch (error) {
    console.error('Error updating access code:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`Admin credentials: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});
