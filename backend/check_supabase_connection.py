import os
import sys
import psycopg2

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

import config

if __name__ == "__main__":
    url = config.DB_URL
    if not url:
        print('No DB_URL configured. Set SUPABASE_DB_URL, DATABASE_URL, or DB_URL in environment.')
        raise SystemExit(1)

    print('Using DB_URL:', url)
    try:
        conn = psycopg2.connect(url)
        conn.close()
        print('Supabase DB connection succeeded.')
    except Exception as ex:
        print('Supabase DB connection failed:')
        print(type(ex).__name__ + ':', ex)
        raise SystemExit(1)
