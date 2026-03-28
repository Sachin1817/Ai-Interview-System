from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "ai_placement_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def get_db():
    return db
