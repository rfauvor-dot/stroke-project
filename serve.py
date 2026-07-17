"""Dev server for Reclaim that disables caching entirely.

Plain `python -m http.server` sets no Cache-Control headers, which lets phones
and browsers cache app.js/tts.js/etc. indefinitely using heuristics. That
already caused one bug (a fix to app.js appeared to "not work" on a phone that
had the old file cached) and is the prime suspect for the ElevenLabs voice
still sounding like the old Web Speech fallback after the key was added.
Every file this app serves changes during active development, so always
serving fresh bytes is strictly better than debugging phantom stale-cache
issues repeatedly.
"""
import http.server
import functools

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

if __name__ == "__main__":
    import sys, os
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8317
    directory = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "app")
    handler = functools.partial(NoCacheHandler, directory=directory)
    http.server.ThreadingHTTPServer(("0.0.0.0", port), handler).serve_forever()
