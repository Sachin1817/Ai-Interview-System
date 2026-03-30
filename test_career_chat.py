import requests
import json

def test_chatbot():
    url = "http://localhost:5000/api/career/chat"
    payload = {
        "message": "What skills do I need for a Cloud Engineer role in my IT branch?",
        "userSkills": ["Python", "Linux"],
        "predictedRole": "Cloud Engineer",
        "hiringLevel": "Junior",
        "branch": "IT"
    }
    
    print(f"Testing Chatbot Endpoint: {url}")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: Received AI response")
            print("-" * 30)
            print(f"AI Reply: {data.get('reply')}")
            print("-" * 30)
        else:
            print(f"FAILED: Status Code {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_chatbot()
