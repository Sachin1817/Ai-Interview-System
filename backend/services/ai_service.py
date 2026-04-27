import os
import time
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Initialize the Groq Client
# Ensure GROQ_API_KEY is set in your .env file
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_ai_response(prompt, model_id="llama-3.3-70b-versatile", retries=3, delay=5):
    """
    Centralized function to generate AI responses using the Groq Cloud SDK.
    Handles client calls, error logging, and retry logic for rate limits.
    """
    attempt = 0
    while attempt < retries:
        try:
            print(f"DEBUG [Groq]: Generating AI response with model: {model_id} (Attempt {attempt+1})")
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a highly creative and precise AI assistant. Always provide unique, varied, and non-repetitive content. Avoid standard textbook examples unless specifically asked."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=model_id,
                temperature=0.85,
                max_tokens=4096,
            )
            
            response_text = chat_completion.choices[0].message.content
            
            if not response_text:
                print("ERROR [Groq]: AI returned an empty response.")
                return None
                
            return response_text.strip()
            
        except Exception as e:
            err_msg = str(e)
            if "rate_limit_exceeded" in err_msg.lower() or "429" in err_msg:
                print(f"WARNING [Groq]: Rate limit exceeded. Retrying in {delay}s... ({attempt+1}/{retries})")
                time.sleep(delay)
                attempt += 1
                delay *= 2
            else:
                print(f"CRITICAL [Groq]: API Failure: {err_msg}")
                return None
                
    print("ERROR [Groq]: Maximum retries reached. AI service is still unavailable.")
    return None

def generate_chat_completion(messages, model_id="llama-3.3-70b-versatile", retries=3, delay=5):
    """
    New function to handle full message list for multi-turn conversations.
    Messages format: [{'role': 'system', 'content': '...'}, {'role': 'user', 'content': '...'}]
    """
    attempt = 0
    while attempt < retries:
        try:
            print(f"DEBUG [Groq]: Generating Chat Completion with model: {model_id} (Attempt {attempt+1})")
            
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=model_id,
                temperature=0.85,
                max_tokens=4096,
            )
            
            response_text = chat_completion.choices[0].message.content
            
            if not response_text:
                print("ERROR [Groq]: AI returned an empty chat response.")
                return None
                
            return response_text.strip()
            
        except Exception as e:
            err_msg = str(e)
            if "rate_limit_exceeded" in err_msg.lower() or "429" in err_msg:
                print(f"WARNING [Groq]: Rate limit exceeded for Chat. Retrying... ({attempt+1}/{retries})")
                time.sleep(delay)
                attempt += 1
                delay *= 2
            else:
                print(f"CRITICAL [Groq]: Chat API Failure: {err_msg}")
                return None
    return None
