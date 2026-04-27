from flask import Blueprint, request, jsonify
from services.ai_service import generate_ai_response
import os
import json
import uuid

def _clean_json_response(raw_text):
    """Utility to extract JSON from model response that may contain markdown or extra text."""
    try:
        if not raw_text:
            return None
            
        # 1. Clean up whitespace
        raw_text = raw_text.strip()
        
        # 2. Check if it's wrapped in markdown code blocks
        if raw_text.startswith("```"):
            # Find the first newline after ``` or ```json
            first_newline = raw_text.find('\n')
            if first_newline != -1:
                # Find the last ```
                last_backticks = raw_text.rfind("```")
                if last_backticks != -1 and last_backticks > first_newline:
                    raw_text = raw_text[first_newline:last_backticks].strip()

        # 3. Try to find JSON array or object
        start_arr = raw_text.find('[')
        start_obj = raw_text.find('{')
        
        start = -1
        end = -1

        if start_arr != -1 and (start_obj == -1 or start_arr < start_obj):
            start = start_arr
            end = raw_text.rfind(']')
        elif start_obj != -1:
            start = start_obj
            end = raw_text.rfind('}')
            
        if start != -1 and end != -1:
            json_str = raw_text[start:end+1]
            return json.loads(json_str)
            
        return json.loads(raw_text)
    except Exception as e:
        print(f"DEBUG [Assessment]: JSON Parsing Error: {e}")
        print(f"DEBUG [Assessment]: Raw Text was: {raw_text[:500]}...")
        return None


assessment_bp = Blueprint('assessment', __name__)

# genai configuration removed, handled by gemini_service

@assessment_bp.route('/generate', methods=['POST'])
def generate_assessment():
    try:
        data = request.json or {}
        cat = data.get('category', 'Technical')
        branch = data.get('branch', 'CSE')
        topic = data.get('topic', 'General')
        diff = data.get('difficulty', 'Beginner')
        
        # Define sub-topics to ensure variety
        sub_topics_map = {
            "Python": ["Generators", "Decorators", "Context Managers", "Metaclasses", "List Comprehensions", "Threading vs Multiprocessing", "Memory Management", "Type Hinting", "Asyncio", "Dunder Methods"],
            "Java": ["JVM Internals", "Garbage Collection", "Streams API", "Multithreading", "Spring Boot Basics", "Hibernate", "Generics", "Reflection API", "Design Patterns", "Lambda Expressions"],
            "DBMS": ["Normalization", "Indexing B-Trees", "Transaction Isolation Levels", "ACID vs BASE", "Query Optimization", "NoSQL Sharding", "Deadlocks", "Window Functions", "Stored Procedures", "CAP Theorem"],
            "Data Structures": ["AVL Trees", "Red-Black Trees", "Graph Traversal (DFS/BFS)", "Dynamic Programming", "Heap Sort", "Trie Data Structure", "Segment Trees", "Disjoint Set Union", "Bit Manipulation", "B+ Trees"]
        }
        
        specific_sub_topics = sub_topics_map.get(topic, ["Core Concepts", "Advanced Features", "Best Practices", "Common Pitfalls", "Optimization"])
        import random
        chosen_sub_topics = random.sample(specific_sub_topics, min(len(specific_sub_topics), 5))
        
        print(f"DEBUG [Assessment]: Generating for {cat} -> {branch} -> {topic} ({diff}). Sub-topics: {chosen_sub_topics}")
        
        prompt = f"""
        You are an elite technical interviewer and certification examiner.
        Generate exactly 10 high-quality, professional-grade multiple-choice questions for:
        Category: {cat}
        Branch: {branch}
        Topic: {topic}
        Difficulty: {diff}
        
        STRICT FOCUS AREAS (Pick questions from these): {', '.join(chosen_sub_topics)}
        
        CRITICAL REQUIREMENTS:
        1. **NO REPETITION**: Do not provide common "textbook" questions (e.g., "What is a list?").
        2. **SCENARIO-BASED**: At least 50% of questions must be "What happens if..." or "Which is better for..." scenarios.
        3. **CODE SNIPPETS**: For technical topics, include at least 3 questions involving short code snippets or logic analysis.
        4. **DEPTH**: Ensure questions test deep understanding, not just syntax.
        5. **DIVERSITY**: Use this unique seed to vary your logic: {uuid.uuid4().hex}.
        
        The output must be a valid JSON array of objects. Do not include any text outside the JSON array.
        Structure:
        [
            {{
                "q": "The question text or code snippet",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Option A",
                "topic": "{topic}"
            }}
        ]
        Crucial: "answer" MUST be the exact string from the "options" array.
        """

        raw_text_raw = generate_ai_response(prompt, model_id="llama-3.3-70b-versatile")
        if not raw_text_raw:
             print("DEBUG [Assessment]: AI failed to return anything.")
             raise ValueError("AI failed to generate assessment")

        
        print(f"DEBUG [Assessment]: AI returned raw text (first 100 chars): {raw_text_raw[:100]}...")
        
        try:
            questions = _clean_json_response(raw_text_raw)
            if not questions:
                print("DEBUG [Assessment]: Failed to clean JSON response.")
                raise ValueError("Could not extract valid JSON from AI response")
            
            # Extract questions if wrapped in a dict
            if isinstance(questions, dict) and "questions" in questions:
                questions = questions["questions"]
            elif isinstance(questions, dict):
                # if it is a dict but no questions key, maybe it's the single object
                questions = [questions]
                
            if not isinstance(questions, list):
                print(f"DEBUG [Assessment]: Response was not a list. Type: {type(questions)}")
                raise ValueError("AI response did not contain a list of questions")

            # Standardize and validate questions
            standardized_questions = []
            for item in questions:
                # 1. Map question text
                q_text = item.get('q') or item.get('question') or item.get('text')
                if not q_text: continue
                
                # 2. Map options
                options = item.get('options')
                if not options or not isinstance(options, list) or len(options) < 2:
                    continue
                    
                # 3. Map answer
                raw_answer = item.get('answer')
                correct_answer = ""
                
                if isinstance(raw_answer, int):
                    # If it's an index, map it to the option string
                    if 0 <= raw_answer < len(options):
                        correct_answer = options[raw_answer]
                else:
                    # If it's a string, use it
                    correct_answer = str(raw_answer)
                
                if not correct_answer: continue
                
                standardized_questions.append({
                    "id": f"ai_{uuid.uuid4().hex[:8]}",
                    "q": q_text,
                    "options": options,
                    "answer": correct_answer,
                    "topic": item.get('topic', topic)
                })
                
            print(f"DEBUG [Assessment]: Successfully standardized {len(standardized_questions)} questions.")
                
            if len(standardized_questions) < 5:
                print(f"DEBUG [Assessment]: Only {len(standardized_questions)} valid questions after standardization.")
                raise ValueError("AI failed to generate enough valid questions")
                
            return jsonify({"status": "success", "questions": standardized_questions}), 200

            
        except json.JSONDecodeError as je:
            print("DEBUG [Assessment]: JSON Decode Error:", je)
            return jsonify({"status": "error", "message": "AI returned malformed JSON"}), 500
            
    except Exception as e:
        print("DEBUG [Assessment]: Error:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500

