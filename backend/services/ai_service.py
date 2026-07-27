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
    If the primary model fails or is rate limited, falls back to a secondary model.
    """
    fallback_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
    models_to_try = [model_id] if model_id not in fallback_models else []
    models_to_try.extend([m for m in fallback_models if m != model_id])

    for current_model in models_to_try:
        attempt = 0
        current_delay = delay
        while attempt < retries:
            try:
                print(f"DEBUG [Groq]: Generating AI response with model: {current_model} (Attempt {attempt+1})")
                
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
                    model=current_model,
                    temperature=0.85,
                    max_tokens=4096,
                )
                
                response_text = chat_completion.choices[0].message.content
                
                if response_text:
                    return response_text.strip()
                    
                print(f"ERROR [Groq]: Model {current_model} returned empty response.")
                break # Try next model
                
            except Exception as e:
                err_msg = str(e)
                if "rate_limit_exceeded" in err_msg.lower() or "429" in err_msg:
                    print(f"WARNING [Groq]: Rate limit exceeded for {current_model}. Retrying in {current_delay}s... ({attempt+1}/{retries})")
                    time.sleep(current_delay)
                    attempt += 1
                    current_delay *= 2
                else:
                    print(f"CRITICAL [Groq]: API Failure for {current_model}: {err_msg}. Trying fallback model.")
                    break # Break retry loop to try next model
                    
    print("ERROR [Groq]: All models and retries failed. AI service is unavailable.")
    return None

def generate_chat_completion(messages, model_id="llama-3.3-70b-versatile", retries=3, delay=5):
    """
    New function to handle full message list for multi-turn conversations.
    Messages format: [{'role': 'system', 'content': '...'}, {'role': 'user', 'content': '...'}]
    Handles fallbacks.
    """
    fallback_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
    models_to_try = [model_id] if model_id not in fallback_models else []
    models_to_try.extend([m for m in fallback_models if m != model_id])

    for current_model in models_to_try:
        attempt = 0
        current_delay = delay
        while attempt < retries:
            try:
                print(f"DEBUG [Groq]: Generating Chat Completion with model: {current_model} (Attempt {attempt+1})")
                
                chat_completion = client.chat.completions.create(
                    messages=messages,
                    model=current_model,
                    temperature=0.85,
                    max_tokens=4096,
                )
                
                response_text = chat_completion.choices[0].message.content
                
                if response_text:
                    return response_text.strip()
                    
                print(f"ERROR [Groq]: Model {current_model} returned empty response.")
                break # Try next model
                
            except Exception as e:
                err_msg = str(e)
                if "rate_limit_exceeded" in err_msg.lower() or "429" in err_msg:
                    print(f"WARNING [Groq]: Rate limit exceeded for {current_model}. Retrying in {current_delay}s... ({attempt+1}/{retries})")
                    time.sleep(current_delay)
                    attempt += 1
                    current_delay *= 2
                else:
                    print(f"CRITICAL [Groq]: Chat API Failure for {current_model}: {err_msg}. Trying fallback model.")
                    break # Break retry loop to try next model
    return None

