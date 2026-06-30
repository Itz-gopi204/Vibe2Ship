import sqlite3
import config


class MongoDBConnection:
    def __init__(self, db, client):
        self.db = db
        self._client = client

    def close(self):
        if self._client:
            self._client.close()


def get_db():
    if config.IS_MONGODB:
        try:
            from pymongo import MongoClient
            client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=5000)
            db = client[config.MONGODB_DB_NAME]
            db.command("ping")
            return MongoDBConnection(db, client)
        except Exception as e:
            print(f"MongoDB connection failed using MONGODB_URI='{config.MONGODB_URI}': {e}")
            print("Falling back to local SQLite.")
            config.IS_MONGODB = False

    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
