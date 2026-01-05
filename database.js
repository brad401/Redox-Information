const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = new Database(path.join(__dirname, 'redox.db'));
    this.initializeTables();
  }

  initializeTables() {
    // Create submissions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table for access code
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Initialize access code if not exists
    const accessCodeExists = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('access_code');
    if (!accessCodeExists) {
      const initialCode = process.env.INITIAL_ACCESS_CODE || 'REDOX2024';
      this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('access_code', initialCode);
    }
  }

  // Submission operations
  addSubmission(firstName, lastName) {
    const stmt = this.db.prepare('INSERT INTO submissions (first_name, last_name) VALUES (?, ?)');
    return stmt.run(firstName, lastName);
  }

  getAllSubmissions() {
    const stmt = this.db.prepare(`
      SELECT id, first_name, last_name, timestamp
      FROM submissions
      ORDER BY timestamp DESC
    `);
    return stmt.all();
  }

  getSubmissionStats() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM submissions').get();

    // Get submissions by day for the last 30 days
    const byDay = this.db.prepare(`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM submissions
      WHERE timestamp >= datetime('now', '-30 days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `).all();

    // Get submissions by month for the last 12 months
    const byMonth = this.db.prepare(`
      SELECT
        strftime('%Y-%m', timestamp) as month,
        COUNT(*) as count
      FROM submissions
      WHERE timestamp >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', timestamp)
      ORDER BY month DESC
    `).all();

    return {
      total: total.count,
      byDay,
      byMonth
    };
  }

  // Access code operations
  getAccessCode() {
    const result = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('access_code');
    return result ? result.value : null;
  }

  updateAccessCode(newCode) {
    const stmt = this.db.prepare('UPDATE settings SET value = ? WHERE key = ?');
    return stmt.run(newCode, 'access_code');
  }

  verifyAccessCode(code) {
    const currentCode = this.getAccessCode();
    return currentCode === code;
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;
