"""
Code Hangman - SQLite Database Manager
Handles user authentication, password hashing, session tokens, settings, and game statistics.
"""

import sqlite3
import hashlib
import secrets
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "code_hangman.db")


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Hash password with a secure salt using SHA-256."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return hashed, salt


class DatabaseManager:
    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self._init_tables()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def _init_tables(self):
        """Create necessary tables if they don't exist."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Users Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                avatar TEXT DEFAULT '👨‍💻',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # 2. User Settings Table
            cursor.execute("""
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
            )
            """)

            # 3. User Statistics Table
            cursor.execute("""
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
            )
            """)

            # 4. User Sessions Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """)
            conn.commit()

    # -------------------------------------------------------------------------
    # Authentication Methods
    # -------------------------------------------------------------------------

    def create_user(self, username: str, email: str, password: str, avatar: str = '👨‍💻') -> Dict[str, Any]:
        """Sign up a new user, create their default settings and stats in SQL."""
        username = username.strip()
        email = email.strip().lower()

        if len(username) < 3:
            return {"success": False, "error": "Username must be at least 3 characters long."}
        if len(password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters long."}
        if "@" not in email or "." not in email:
            return {"success": False, "error": "Please provide a valid email address."}

        pwd_hash, salt = hash_password(password)

        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO users (username, email, password_hash, salt, avatar) VALUES (?, ?, ?, ?, ?)",
                    (username, email, pwd_hash, salt, avatar)
                )
                user_id = cursor.lastrowid

                # Create default settings and stats
                cursor.execute("INSERT INTO user_settings (user_id) VALUES (?)", (user_id,))
                cursor.execute("INSERT INTO user_stats (user_id) VALUES (?)", (user_id,))

                # Create session token
                session_token = secrets.token_hex(24)
                cursor.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (session_token, user_id))
                conn.commit()

                return {
                    "success": True,
                    "token": session_token,
                    "user": {
                        "id": user_id,
                        "username": username,
                        "email": email,
                        "avatar": avatar,
                        "created_at": datetime.utcnow().isoformat()
                    },
                    "settings": self.get_user_settings(user_id),
                    "stats": self.get_user_stats(user_id)
                }
        except sqlite3.IntegrityError as e:
            err_msg = str(e).lower()
            if "username" in err_msg:
                return {"success": False, "error": "Username is already registered."}
            elif "email" in err_msg:
                return {"success": False, "error": "Email is already registered."}
            return {"success": False, "error": "An account with these credentials already exists."}

    def authenticate_user(self, username_or_email: str, password: str) -> Dict[str, Any]:
        """Log in an existing user with username/email and password."""
        ident = username_or_email.strip()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, email, password_hash, salt, avatar, created_at FROM users WHERE username = ? OR email = ?",
                (ident, ident.lower())
            )
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "Invalid username/email or password."}

            hashed_check, _ = hash_password(password, row["salt"])
            if hashed_check != row["password_hash"]:
                return {"success": False, "error": "Invalid username/email or password."}

            user_id = row["id"]
            session_token = secrets.token_hex(24)
            cursor.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (session_token, user_id))
            conn.commit()

            return {
                "success": True,
                "token": session_token,
                "user": {
                    "id": user_id,
                    "username": row["username"],
                    "email": row["email"],
                    "avatar": row["avatar"],
                    "created_at": row["created_at"]
                },
                "settings": self.get_user_settings(user_id),
                "stats": self.get_user_stats(user_id)
            }

    def get_user_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate session token and return user details."""
        if not token:
            return None
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.id, u.username, u.email, u.avatar, u.created_at
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token = ?
            """, (token,))
            row = cursor.fetchone()
            if not row:
                return None
            return {
                "id": row["id"],
                "username": row["username"],
                "email": row["email"],
                "avatar": row["avatar"],
                "created_at": row["created_at"]
            }

    def logout_session(self, token: str) -> bool:
        """Remove active session from database."""
        if not token:
            return False
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
            return True

    # -------------------------------------------------------------------------
    # Settings Methods
    # -------------------------------------------------------------------------

    def get_user_settings(self, user_id: int) -> Dict[str, Any]:
        """Fetch settings row for user."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT theme, sound_enabled, sound_volume, crt_effect, grid_bg,
                       gallows_view, default_lang, default_diff, hardcore_mode
                FROM user_settings WHERE user_id = ?
            """, (user_id,))
            row = cursor.fetchone()
            if not row:
                # Return default settings
                return {
                    "theme": "theme-cyberpunk",
                    "sound_enabled": 1,
                    "sound_volume": 0.7,
                    "crt_effect": 1,
                    "grid_bg": 1,
                    "gallows_view": "vector",
                    "default_lang": "all",
                    "default_diff": "all",
                    "hardcore_mode": 0
                }
            return {
                "theme": row["theme"],
                "sound_enabled": bool(row["sound_enabled"]),
                "sound_volume": float(row["sound_volume"]),
                "crt_effect": bool(row["crt_effect"]),
                "grid_bg": bool(row["grid_bg"]),
                "gallows_view": row["gallows_view"],
                "default_lang": row["default_lang"],
                "default_diff": row["default_diff"],
                "hardcore_mode": bool(row["hardcore_mode"])
            }

    def update_user_settings(self, user_id: int, settings: Dict[str, Any]) -> bool:
        """Update settings for given user."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE user_settings
                SET theme = COALESCE(?, theme),
                    sound_enabled = COALESCE(?, sound_enabled),
                    sound_volume = COALESCE(?, sound_volume),
                    crt_effect = COALESCE(?, crt_effect),
                    grid_bg = COALESCE(?, grid_bg),
                    gallows_view = COALESCE(?, gallows_view),
                    default_lang = COALESCE(?, default_lang),
                    default_diff = COALESCE(?, default_diff),
                    hardcore_mode = COALESCE(?, hardcore_mode),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (
                settings.get("theme"),
                1 if settings.get("sound_enabled") else 0 if "sound_enabled" in settings else None,
                settings.get("sound_volume"),
                1 if settings.get("crt_effect") else 0 if "crt_effect" in settings else None,
                1 if settings.get("grid_bg") else 0 if "grid_bg" in settings else None,
                settings.get("gallows_view"),
                settings.get("default_lang"),
                settings.get("default_diff"),
                1 if settings.get("hardcore_mode") else 0 if "hardcore_mode" in settings else None,
                user_id
            ))
            conn.commit()
            return True

    # -------------------------------------------------------------------------
    # Statistics Methods
    # -------------------------------------------------------------------------

    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Fetch game stats for user."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT games_played, games_won, current_streak, best_streak,
                       total_guesses, correct_guesses
                FROM user_stats WHERE user_id = ?
            """, (user_id,))
            row = cursor.fetchone()
            if not row:
                return {
                    "gamesPlayed": 0,
                    "gamesWon": 0,
                    "currentStreak": 0,
                    "bestStreak": 0,
                    "totalGuesses": 0,
                    "correctGuesses": 0
                }
            return {
                "gamesPlayed": row["games_played"],
                "gamesWon": row["games_won"],
                "currentStreak": row["current_streak"],
                "bestStreak": row["best_streak"],
                "totalGuesses": row["total_guesses"],
                "correctGuesses": row["correct_guesses"]
            }

    def update_user_stats(self, user_id: int, stats: Dict[str, Any]) -> bool:
        """Update game stats in SQLite."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE user_stats
                SET games_played = ?,
                    games_won = ?,
                    current_streak = ?,
                    best_streak = ?,
                    total_guesses = ?,
                    correct_guesses = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (
                stats.get("gamesPlayed", 0),
                stats.get("gamesWon", 0),
                stats.get("currentStreak", 0),
                stats.get("bestStreak", 0),
                stats.get("totalGuesses", 0),
                stats.get("correctGuesses", 0),
                user_id
            ))
            conn.commit()
            return True

    def reset_user_stats(self, user_id: int) -> bool:
        """Reset statistics for user to 0."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE user_stats
                SET games_played = 0,
                    games_won = 0,
                    current_streak = 0,
                    best_streak = 0,
                    total_guesses = 0,
                    correct_guesses = 0,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (user_id,))
            conn.commit()
            return True


# Global database instance
db = DatabaseManager()
