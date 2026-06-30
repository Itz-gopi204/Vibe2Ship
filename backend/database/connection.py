import sqlite3
import config

def format_query(q: str) -> str:
    if config.IS_POSTGRES:
        return q.replace("?", "%s")
    return q

def get_db():
    if config.IS_POSTGRES:
        import psycopg2
        from psycopg2.extras import DictCursor
        try:
            return psycopg2.connect(config.DB_URL, cursor_factory=DictCursor)
        except Exception as e:
            print(f"Postgres connection failed using DB_URL='{config.DB_URL}': {e}")
            raise
    else:
        conn = sqlite3.connect(config.DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
