import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in backend/.env")
else:
    print(f"Key found: {api_key[:10]}...")
    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello")
        print(f"Success! Gemini response: {response.text}")
    except Exception as e:
        print(f"Error calling Gemini: {e}")
