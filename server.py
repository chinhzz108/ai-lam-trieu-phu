import http.server
import socketserver
import webbrowser
import threading
import mimetypes
import sys
import os

# Đảm bảo MIME type chuẩn cho JavaScript ES Module trên Windows
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("audio/mpeg", ".mp3")

# Chuyển thư mục làm việc về thư mục chứa file này
os.chdir(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_PORT = 5500
MAX_PORT = 5520

class GameRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

def run_server():
    server = None
    selected_port = DEFAULT_PORT
    for p in range(DEFAULT_PORT, MAX_PORT + 1):
        try:
            server = socketserver.ThreadingTCPServer(("127.0.0.1", p), GameRequestHandler)
            selected_port = p
            break
        except OSError:
            continue

    if not server:
        print(f"[LOI] Khong the mo port tu {DEFAULT_PORT} den {MAX_PORT}.")
        sys.exit(1)

    url = f"http://localhost:{selected_port}"
    print("")
    print(" ============================================")
    print("   AI LA TRIEU PHU - WHO WANTS TO BE A MILLIONAIRE")
    print(" ============================================")
    print(f"  Thu muc game: {os.getcwd()}")
    print(f"  Server dang chay tai: {url}")
    print("  Trinh duyet se tu dong mo trang game...")
    print("  De TAT game: Nhan Ctrl+C trong cua so nay")
    print(" ============================================")
    print("")

    threading.Timer(0.8, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Da dung server.")
    finally:
        server.server_close()

if __name__ == "__main__":
    run_server()
