import requests
import json

url = "http://127.0.0.1:5000/api/assessment/generate"
data = {
    "category": "Technical",
    "branch": "CSE",
    "topic": "Python",
    "difficulty": "Beginner"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
