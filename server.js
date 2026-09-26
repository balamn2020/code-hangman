#!/usr/bin/env node
/**
 * Code Hangman - Standalone App & API Server (Node.js Native Edition)
 * Serves static PWA assets, manages SQLite database authentication, settings, and player statistics,
 * and launches the standalone app window in Chrome, Edge, or default browser.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const { exec, spawn } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const ROOT_DIR = __dirname;
const DB_FILE = path.join(ROOT_DIR, 'code_hangman.db');

// ============================================================================
// SQLITE DATABASE MANAGER (Matches Python database.py schema & logic)
// ============================================================================

class NodeDatabaseManager {
  constructor(dbPath = DB_FILE) {
    this.dbPath = dbPath;
    this.db = new DatabaseSync(this.dbPath);
    this.initTables();
  }

  initTables() {
    this.db.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL COLLATE NOCASE,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        avatar TEXT DEFAULT '👨‍💻',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id INTEGER PRIMARY KEY,
        theme TEXT DEFAULT 'theme-cyberpunk',
        sound_enabled INTEGER DEFAULT 1,
        sound_volume REAL DEFAULT 0.7,
        crt_effect INTEGER DEFAULT 1,
        grid_bg INTEGER DEFAULT 1,
        gallows_view TEXT DEFAULT 'vector',
        default_lang TEXT DEFAULT 'all',
        default_diff TEXT DEFAULT 'all',
        hardcore_mode INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        total_guesses INTEGER DEFAULT 0,
        correct_guesses INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  hashPassword(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.createHash('sha256').update(salt + password, 'utf8').digest('hex');
    return { hash, salt };
  }

  createUser(username, email, password, avatar = '👨‍💻') {
    username = (username || '').trim();
    email = (email || '').trim().toLowerCase();

    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }
    if ((password || '').length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (!email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    const { hash: pwdHash, salt } = this.hashPassword(password);

    try {
      const insertUser = this.db.prepare(
        'INSERT INTO users (username, email, password_hash, salt, avatar) VALUES (?, ?, ?, ?, ?)'
      );
      const res = insertUser.run(username, email, pwdHash, salt, avatar);
      const userId = Number(res.lastInsertRowid);

      this.db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
      this.db.prepare('INSERT INTO user_stats (user_id) VALUES (?)').run(userId);

      const sessionToken = crypto.randomBytes(24).toString('hex');
      this.db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(sessionToken, userId);

      return {
        success: true,
        token: sessionToken,
        user: {
          id: userId,
          username,
          email,
          avatar,
          created_at: new Date().toISOString()
        },
        settings: this.getUserSettings(userId),
        stats: this.getUserStats(userId)
      };
    } catch (err) {
      const msg = String(err.message || '').toLowerCase();
      if (msg.includes('username')) {
        return { success: false, error: 'Username is already registered.' };
      } else if (msg.includes('email')) {
        return { success: false, error: 'Email is already registered.' };
      }
      return { success: false, error: 'An account with these credentials already exists.' };
    }
  }

  authenticateUser(usernameOrEmail, password) {
    const ident = (usernameOrEmail || '').trim();
    const row = this.db.prepare(
      'SELECT id, username, email, password_hash, salt, avatar, created_at FROM users WHERE username = ? OR email = ?'
    ).get(ident, ident.toLowerCase());

    if (!row) {
      return { success: false, error: 'Invalid username/email or password.' };
    }

    const { hash: checkHash } = this.hashPassword(password, row.salt);
    if (checkHash !== row.password_hash) {
      return { success: false, error: 'Invalid username/email or password.' };
    }

    const userId = Number(row.id);
    const sessionToken = crypto.randomBytes(24).toString('hex');
    this.db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(sessionToken, userId);

    return {
      success: true,
      token: sessionToken,
      user: {
        id: userId,
        username: row.username,
        email: row.email,
        avatar: row.avatar,
        created_at: row.created_at
      },
      settings: this.getUserSettings(userId),
      stats: this.getUserStats(userId)
    };
  }

  getUserByToken(token) {
    if (!token) return null;
    const row = this.db.prepare(`
      SELECT u.id, u.username, u.email, u.avatar, u.created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ?
    `).get(token);

    if (!row) return null;
    return {
      id: Number(row.id),
      username: row.username,
      email: row.email,
      avatar: row.avatar,
      created_at: row.created_at
    };
  }

  logoutSession(token) {
    if (!token) return false;
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return true;
  }

  getUserSettings(userId) {
    const row = this.db.prepare(`
      SELECT theme, sound_enabled, sound_volume, crt_effect, grid_bg,
             gallows_view, default_lang, default_diff, hardcore_mode
      FROM user_settings WHERE user_id = ?
    `).get(userId);

    if (!row) {
      return {
        theme: 'theme-cyberpunk',
        sound_enabled: true,
        sound_volume: 0.7,
        crt_effect: true,
        grid_bg: true,
        gallows_view: 'vector',
        default_lang: 'all',
        default_diff: 'all',
        hardcore_mode: false
      };
    }

    return {
      theme: row.theme,
      sound_enabled: Boolean(row.sound_enabled),
      sound_volume: Number(row.sound_volume),
      crt_effect: Boolean(row.crt_effect),
      grid_bg: Boolean(row.grid_bg),
      gallows_view: row.gallows_view,
      default_lang: row.default_lang,
      default_diff: row.default_diff,
      hardcore_mode: Boolean(row.hardcore_mode)
    };
  }

  updateUserSettings(userId, settings = {}) {
    const current = this.getUserSettings(userId);
    const theme = settings.theme !== undefined ? settings.theme : current.theme;
    const soundEnabled = settings.sound_enabled !== undefined ? (settings.sound_enabled ? 1 : 0) : (current.sound_enabled ? 1 : 0);
    const soundVolume = settings.sound_volume !== undefined ? Number(settings.sound_volume) : current.sound_volume;
    const crtEffect = settings.crt_effect !== undefined ? (settings.crt_effect ? 1 : 0) : (current.crt_effect ? 1 : 0);
    const gridBg = settings.grid_bg !== undefined ? (settings.grid_bg ? 1 : 0) : (current.grid_bg ? 1 : 0);
    const gallowsView = settings.gallows_view !== undefined ? settings.gallows_view : current.gallows_view;
    const defaultLang = settings.default_lang !== undefined ? settings.default_lang : current.default_lang;
    const defaultDiff = settings.default_diff !== undefined ? settings.default_diff : current.default_diff;
    const hardcoreMode = settings.hardcore_mode !== undefined ? (settings.hardcore_mode ? 1 : 0) : (current.hardcore_mode ? 1 : 0);

    this.db.prepare(`
      UPDATE user_settings
      SET theme = ?,
          sound_enabled = ?,
          sound_volume = ?,
          crt_effect = ?,
          grid_bg = ?,
          gallows_view = ?,
          default_lang = ?,
          default_diff = ?,
          hardcore_mode = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(theme, soundEnabled, soundVolume, crtEffect, gridBg, gallowsView, defaultLang, defaultDiff, hardcoreMode, userId);

    return true;
  }

  getUserStats(userId) {
    const row = this.db.prepare(`
      SELECT games_played, games_won, current_streak, best_streak,
             total_guesses, correct_guesses
      FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!row) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalGuesses: 0,
        correctGuesses: 0
      };
    }

    return {
      gamesPlayed: Number(row.games_played),
      gamesWon: Number(row.games_won),
      currentStreak: Number(row.current_streak),
      bestStreak: Number(row.best_streak),
      totalGuesses: Number(row.total_guesses),
      correctGuesses: Number(row.correct_guesses)
    };
  }

  updateUserStats(userId, stats = {}) {
    this.db.prepare(`
      UPDATE user_stats
      SET games_played = ?,
          games_won = ?,
          current_streak = ?,
          best_streak = ?,
          total_guesses = ?,
          correct_guesses = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      Number(stats.gamesPlayed || 0),
      Number(stats.gamesWon || 0),
      Number(stats.currentStreak || 0),
      Number(stats.bestStreak || 0),
      Number(stats.totalGuesses || 0),
      Number(stats.correctGuesses || 0),
      userId
    );
    return true;
  }

  resetUserStats(userId) {
    this.db.prepare(`
      UPDATE user_stats
      SET games_played = 0,
          games_won = 0,
          current_streak = 0,
          best_streak = 0,
          total_guesses = 0,
          correct_guesses = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(userId);
    return true;
  }
}

const db = new NodeDatabaseManager();

// ============================================================================
// MIME TYPES & STATIC FILE SERVING
// ============================================================================

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, statusCode, data) {
  const body = Buffer.from(JSON.stringify(data), 'utf8');
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(body);
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']).trim();
  }
  if (!token) return null;
  return db.getUserByToken(token);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// ============================================================================
// HTTP REQUEST HANDLER
// ============================================================================

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end();
    return;
  }

  // --- REST API ENDPOINTS ---
  if (pathname.startsWith('/api/')) {
    if (req.method === 'GET') {
      if (pathname === '/api/db/status') {
        return sendJson(res, 200, {
          status: 'connected',
          backend: 'SQLite 3 (Node.js Engine)',
          db_file: 'code_hangman.db'
        });
      }

      if (pathname === '/api/auth/session') {
        const user = getAuthUser(req);
        if (user) {
          return sendJson(res, 200, {
            authenticated: true,
            user,
            settings: db.getUserSettings(user.id),
            stats: db.getUserStats(user.id)
          });
        }
        return sendJson(res, 200, { authenticated: false });
      }

      if (pathname === '/api/user/settings') {
        const user = getAuthUser(req);
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        return sendJson(res, 200, { success: true, settings: db.getUserSettings(user.id) });
      }

      if (pathname === '/api/user/stats') {
        const user = getAuthUser(req);
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        return sendJson(res, 200, { success: true, stats: db.getUserStats(user.id) });
      }
    }

    if (req.method === 'POST') {
      const body = await readBody(req);

      if (pathname === '/api/auth/signup') {
        const result = db.createUser(body.username, body.email, body.password, body.avatar);
        return sendJson(res, result.success ? 200 : 400, result);
      }

      if (pathname === '/api/auth/login') {
        const result = db.authenticateUser(body.username, body.password);
        return sendJson(res, result.success ? 200 : 401, result);
      }

      if (pathname === '/api/auth/logout') {
        let token = body.token || '';
        if (!token) {
          const authHeader = req.headers['authorization'] || '';
          if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
          }
        }
        db.logoutSession(token);
        return sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
      }

      if (pathname === '/api/user/settings') {
        const user = getAuthUser(req);
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        db.updateUserSettings(user.id, body.settings || {});
        return sendJson(res, 200, { success: true, settings: db.getUserSettings(user.id) });
      }

      if (pathname === '/api/user/stats') {
        const user = getAuthUser(req);
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        db.updateUserStats(user.id, body.stats || {});
        return sendJson(res, 200, { success: true, stats: db.getUserStats(user.id) });
      }

      if (pathname === '/api/user/stats/reset') {
        const user = getAuthUser(req);
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        db.resetUserStats(user.id);
        return sendJson(res, 200, { success: true, stats: db.getUserStats(user.id) });
      }
    }

    return sendJson(res, 404, { error: `Endpoint ${pathname} not found.` });
  }

  // --- STATIC FILE SERVING ---
  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  // Prevent path traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// ============================================================================
// PORT FINDER & BROWSER LAUNCHER
// ============================================================================

function checkPort(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => {
      s.close(() => resolve(true));
    });
    s.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort = 8080) {
  for (let p = startPort; p < startPort + 100; p++) {
    if (await checkPort(p)) return p;
  }
  return startPort;
}

function launchAppWindow(url) {
  const isWin = process.platform === 'win32';
  if (!isWin) {
    exec(`xdg-open "${url}" || open "${url}"`);
    return;
  }

  const candidates = [
    process.env['ProgramFiles'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['ProgramFiles(x86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['LocalAppData'] + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['ProgramFiles(x86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env['ProgramFiles'] + '\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const exePath of candidates) {
    if (fs.existsSync(exePath)) {
      try {
        spawn(exePath, [`--app=${url}`], { detached: true, stdio: 'ignore' }).unref();
        console.log(` [*] Standalone Window launched via: ${path.basename(exePath)}`);
        return true;
      } catch (e) {
        // continue
      }
    }
  }

  // Fallback: use explorer.exe to open in default browser
  exec(`explorer.exe "${url}"`);
  return false;
}

async function main() {
  const port = await findAvailablePort(8080);
  const appUrl = `http://localhost:${port}/index.html`;

  server.listen(port, '127.0.0.1', () => {
    console.log('='.repeat(68));
    console.log(' ⚡ CODE HANGMAN - APPLICATION & SQL DATABASE ENGINE');
    console.log('='.repeat(68));
    console.log(` [*] Local Application Server running at: ${appUrl}`);
    console.log(` [*] SQLite Database: code_hangman.db (Authentication & Settings active)`);
    console.log(' [*] Launching Standalone Window...');
    console.log(' [*] Press Ctrl+C in this terminal to stop.');
    console.log('='.repeat(68));

    setTimeout(() => {
      launchAppWindow(appUrl);
    }, 600);
  });
}

main();
