#!/usr/bin/env python3
"""
Code Hangman - Standalone App & API Server
Serves static PWA assets, manages SQLite database authentication, settings, and player statistics,
and launches the standalone app window.
"""

import os
import sys
import json
import time
import socket
import threading
import subprocess
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Reconfigure stdout for UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Import SQLite database manager
from database import db


class AppServerHandler(SimpleHTTPRequestHandler):
    """Handles both static file serving and SQLite REST API endpoints."""

    def _send_json(self, status_code: int, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def _get_auth_user(self):
        """Extract user from Authorization Bearer header or X-Session-Token."""
        auth_header = self.headers.get("Authorization", "")
        token = ""
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
        elif "X-Session-Token" in self.headers:
            token = self.headers["X-Session-Token"].strip()
        
        if not token:
            return None
        return db.get_user_by_token(token)

    def _read_json_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw_body = self.rfile.read(content_length).decode("utf-8")
                return json.loads(raw_body)
        except Exception:
            pass
        return {}

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Token")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Database API status endpoint
        if path == "/api/db/status":
            self._send_json(200, {
                "status": "connected",
                "backend": "SQLite 3",
                "db_file": "code_hangman.db"
            })
            return

        # Check session
        if path == "/api/auth/session":
            user = self._get_auth_user()
            if user:
                settings = db.get_user_settings(user["id"])
                stats = db.get_user_stats(user["id"])
                self._send_json(200, {
                    "authenticated": True,
                    "user": user,
                    "settings": settings,
                    "stats": stats
                })
            else:
                self._send_json(200, {"authenticated": False})
            return

        # Get settings
        if path == "/api/user/settings":
            user = self._get_auth_user()
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            settings = db.get_user_settings(user["id"])
            self._send_json(200, {"success": True, "settings": settings})
            return

        # Get stats
        if path == "/api/user/stats":
            user = self._get_auth_user()
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            stats = db.get_user_stats(user["id"])
            self._send_json(200, {"success": True, "stats": stats})
            return

        # Fallback to standard static file serving
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        # Sign Up endpoint
        if path == "/api/auth/signup":
            username = body.get("username", "")
            email = body.get("email", "")
            password = body.get("password", "")
            avatar = body.get("avatar", "👨‍💻")

            result = db.create_user(username, email, password, avatar)
            status_code = 200 if result.get("success") else 400
            self._send_json(status_code, result)
            return

        # Log In endpoint
        if path == "/api/auth/login":
            username = body.get("username", "")
            password = body.get("password", "")

            result = db.authenticate_user(username, password)
            status_code = 200 if result.get("success") else 401
            self._send_json(status_code, result)
            return

        # Logout endpoint
        if path == "/api/auth/logout":
            token = body.get("token", "")
            if not token:
                auth_header = self.headers.get("Authorization", "")
                if auth_header.startswith("Bearer "):
                    token = auth_header[7:].strip()
            db.logout_session(token)
            self._send_json(200, {"success": True, "message": "Logged out successfully."})
            return

        # Update settings endpoint
        if path == "/api/user/settings":
            user = self._get_auth_user()
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            settings = body.get("settings", {})
            db.update_user_settings(user["id"], settings)
            updated = db.get_user_settings(user["id"])
            self._send_json(200, {"success": True, "settings": updated})
            return

        # Update stats endpoint
        if path == "/api/user/stats":
            user = self._get_auth_user()
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            stats = body.get("stats", {})
            db.update_user_stats(user["id"], stats)
            updated = db.get_user_stats(user["id"])
            self._send_json(200, {"success": True, "stats": updated})
            return

        # Reset stats endpoint
        if path == "/api/user/stats/reset":
            user = self._get_auth_user()
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            db.reset_user_stats(user["id"])
            updated = db.get_user_stats(user["id"])
            self._send_json(200, {"success": True, "stats": updated})
            return

        self._send_json(404, {"error": f"Endpoint {path} not found."})

    def log_message(self, format, *args):
        # Keep terminal log clean
        pass


def find_available_port(default_port=8080) -> int:
    """Find an available port starting from default_port."""
    port = default_port
    while port < default_port + 100:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
        port += 1
    return default_port


def launch_in_app_window(url: str):
    """Attempt to launch Chrome/Edge in standalone --app window mode, or fallback to default browser."""
    browser_candidates = [
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
    ]

    for path in browser_candidates:
        if os.path.isfile(path):
            try:
                subprocess.Popen([path, f"--app={url}"])
                return True
            except Exception:
                pass

    webbrowser.open(url)
    return False


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    port = find_available_port(8080)
    server_address = ('localhost', port)
    httpd = HTTPServer(server_address, AppServerHandler)

    app_url = f"http://localhost:{port}/index.html"
    print("=" * 68)
    print(" ⚡ CODE HANGMAN - FULL APPLICATION & SQL DATABASE ENGINE")
    print("=" * 68)
    print(f" [*] Local Application Server running at: {app_url}")
    print(f" [*] SQLite Database: code_hangman.db (Authentication & Settings active)")
    print(" [*] Launching Standalone Window...")
    print(" [*] Press Ctrl+C in this terminal to stop.")
    print("=" * 68)

    # Launch app window
    threading.Timer(0.6, lambda: launch_in_app_window(app_url)).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Shutting down server. Database saved.")
        httpd.server_close()


if __name__ == '__main__':
    main()
