import os

def load_env():
    # Look for .env and .env.local in current and parent directory
    for path in ['.env', '.env.local', '../.env', '../.env.local']:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            if '=' in line:
                                key, val = line.split('=', 1)
                                os.environ[key.strip()] = val.strip()
            except Exception as e:
                print(f"Error loading env from {path}: {e}")

load_env()

MONGODB_URI = os.environ.get("MONGODB_URI") or os.environ.get("MONGODB_URL")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME") or "vibe2ship"
IS_MONGODB = MONGODB_URI is not None and MONGODB_URI.strip() != ""
DB_PATH = "civic_hero.db"
GEMINI_API_KEY = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
