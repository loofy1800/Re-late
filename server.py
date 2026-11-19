#!/usr/bin/env python3
"""
RELATE - Local Development Web Server
Serves the web application on loopback with module MIME types and clean cache headers.
"""

import http.server
import socketserver
import os
import sys
import errno

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

HOST = "127.0.0.1"
PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class RelateHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Disable aggressive caching for development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure proper MIME types for ES modules and SVGs
        if path.endswith(".js"):
            return "application/javascript"
        elif path.endswith(".css"):
            return "text/css"
        elif path.endswith(".svg"):
            return "image/svg+xml"
        elif path.endswith(".json"):
            return "application/json"
        return super().guess_type(path)

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer((HOST, PORT), RelateHTTPRequestHandler) as httpd:
            print(f"🚀 Relate Group Car-Buying Platform running at http://{HOST}:{PORT}")
            print(f"📂 Serving directory: {DIRECTORY}")
            sys.stdout.flush()
            httpd.serve_forever()
    except OSError as e:
        if e.errno != errno.EADDRINUSE:
            raise
        # If port 8080 is in use, try 8081
        PORT = 8081
        with socketserver.TCPServer((HOST, PORT), RelateHTTPRequestHandler) as httpd:
            print(f"🚀 Relate Group Car-Buying Platform running at http://{HOST}:{PORT}")
            print(f"📂 Serving directory: {DIRECTORY}")
            sys.stdout.flush()
            httpd.serve_forever()
