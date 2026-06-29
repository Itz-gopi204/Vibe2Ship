import os

def load_env():
    # Look for .env in current and parent directory
    for path in ['.env', '../.env']:
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

DB_URL = os.environ.get("SUPABASE_DB_URL") or os.environ.get("DATABASE_URL")
IS_POSTGRES = DB_URL is not None and DB_URL.strip() != ""
DB_PATH = "civic_hero.db"
GEMINI_API_KEY = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
