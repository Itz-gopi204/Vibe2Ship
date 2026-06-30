import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

import config
from pymongo import MongoClient

if __name__ == "__main__":
    uri = config.MONGODB_URI
    if not uri:
        print('No MongoDB URI configured. Set MONGODB_URI in environment.')
        raise SystemExit(1)

    print('Using MONGODB_URI:', uri)
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        client.close()
        print('MongoDB connection succeeded.')
    except Exception as ex:
        print('MongoDB connection failed:')
        print(type(ex).__name__ + ':', ex)
        raise SystemExit(1)
