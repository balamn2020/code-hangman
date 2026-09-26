#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8081
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT_DIR)

class APKRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.endswith(".apk"):
            self.send_header("Content-Type", "application/vnd.android.package-archive")
            self.send_header("Content-Disposition", "attachment; filename=\"code-hangman.apk\"")
        super().end_headers()

if __name__ == "__main__":
    Handler = APKRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🚀 Download Server running at http://localhost:{PORT}/code-hangman.apk")
            httpd.serve_forever()
    except Exception as e:
        print(f"Server started or port in use: {e}")
