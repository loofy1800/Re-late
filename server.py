#!/usr/bin/env python3
"""
RELATE - Local Development Web Server
Serves the web application on loopback with module MIME types and clean cache headers.
"""

import http.server
import json
import socketserver
import os
import sys
import errno
import urllib.error
import urllib.parse
import urllib.request

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

HOST = "127.0.0.1"
PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
API_NINJAS_URL = "https://api.api-ninjas.com/v2"
API_NINJAS_PAGE_SIZE = 100


def request_ninjas(path, params):
    api_key = os.environ.get("API_NINJAS_KEY")
    if not api_key:
        raise RuntimeError("API_NINJAS_KEY is not configured.")

    url = f"{API_NINJAS_URL}/{path}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"X-Api-Key": api_key})
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_ninjas_collection(path, params):
    results = []
    offset = 0
    while True:
        page = request_ninjas(path, {
            **params,
            "limit": API_NINJAS_PAGE_SIZE,
            "offset": offset
        })
        if not isinstance(page, list):
            raise ValueError("Vehicle provider returned an invalid catalog response.")
        if any(not isinstance(item, dict) or not isinstance(item.get("name"), str) for item in page):
            raise ValueError("Vehicle provider returned an invalid catalog item.")
        results.extend(page)
        if len(page) < API_NINJAS_PAGE_SIZE:
            return results
        offset += API_NINJAS_PAGE_SIZE


def fetch_ninjas_image(make, model, year):
    vehicles = request_ninjas("cars", {
        "make": make,
        "model": model,
        "year": year,
        "limit": 10
    })
    if not isinstance(vehicles, list):
        raise ValueError("Vehicle provider returned an invalid image response.")

    for vehicle in vehicles:
        if not isinstance(vehicle, dict):
            raise ValueError("Vehicle provider returned an invalid image item.")
        image_url = vehicle.get("image_url")
        if isinstance(image_url, str):
            image = urllib.parse.urlsplit(image_url)
            if image.scheme == "https" and image.netloc == "media.api-ninjas.com":
                return image_url
    return None

class RelateHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def send_json(self, status, data):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed_url = urllib.parse.urlsplit(self.path)
        if not parsed_url.path.startswith("/api/vehicles/"):
            return super().do_GET()

        query = urllib.parse.parse_qs(parsed_url.query)
        try:
            if parsed_url.path == "/api/vehicles/makes":
                self.send_json(200, fetch_ninjas_collection("carmakes", {}))
            elif parsed_url.path == "/api/vehicles/models":
                make = query.get("make", [""])[0].strip()
                if not make or len(make) > 100:
                    self.send_json(400, {"error": "A valid make is required."})
                    return
                self.send_json(200, fetch_ninjas_collection("carmodels", {"make": make}))
            elif parsed_url.path == "/api/vehicles/image":
                make = query.get("make", [""])[0].strip()
                model = query.get("model", [""])[0].strip()
                year = query.get("year", [""])[0].strip()
                if (not make or not model or len(make) > 100 or len(model) > 100
                        or len(year) != 4 or not year.isascii() or not year.isdigit()
                        or not 1886 <= int(year) <= 2100):
                    self.send_json(400, {"error": "A valid make, model, and year are required."})
                    return
                self.send_json(200, {"image_url": fetch_ninjas_image(make, model, year)})
            else:
                self.send_json(404, {"error": "Vehicle API endpoint not found."})
        except RuntimeError as error:
            self.send_json(503, {"error": str(error)})
        except urllib.error.HTTPError as error:
            self.send_json(error.code, {"error": f"Vehicle provider returned HTTP {error.code}."})
        except (urllib.error.URLError, TimeoutError) as error:
            self.send_json(502, {"error": f"Vehicle provider request failed: {error.reason if isinstance(error, urllib.error.URLError) else error}"})
        except (json.JSONDecodeError, ValueError):
            self.send_json(502, {"error": "Vehicle provider returned an invalid response."})

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
