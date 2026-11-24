import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.ai_service import client

print("Listing available Groq models...")
try:
    models = client.models.list()
    for m in models.data:
        print(m.id)
except Exception as e:
    print(e)
