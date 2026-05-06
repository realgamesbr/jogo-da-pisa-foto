"""
Servidor local simples pra testar o test_local.html.
Roda em http://localhost:8000/test_local.html

Uso:
    python serve_test.py
    (entao abrir http://localhost:8000/test_local.html no browser)
"""
import http.server
import socketserver
import os
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Output mais limpo
        print(f"  {self.address_string()} - {format % args}")

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    print(f"Servindo {DIRECTORY}")
    print(f"Abrindo http://localhost:{PORT}/test_local.html ...")
    print("Ctrl+C para parar\n")

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        webbrowser.open(f"http://localhost:{PORT}/test_local.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor parado.")
