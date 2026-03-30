import subprocess
import os
import tempfile
import time
import shutil

class ExecutionService:
    @staticmethod
    def run_code(language, code):
        """
        Runs code in a temporary environment and returns stdout, stderr, execution time, and memory.
        """
        supported_languages = ['python', 'javascript', 'java', 'bash', 'cpp', 'html']
        
        if language not in supported_languages:
            return {"error": f"Language {language} is not supported."}

        # Handling HTML (Simulated execution)
        if language == 'html':
            return {
                "stdout": "Static HTML Processed Successfully.\n(Rendering is previewed in final report)",
                "stderr": "",
                "execution_time": 0.001,
                "exit_code": 0,
                "memory": "0 MB"
            }

        # Setup temporary file
        with tempfile.TemporaryDirectory() as temp_dir:
            file_name = f"solution.{ExecutionService._get_extension(language)}"
            file_path = os.path.join(temp_dir, file_name)
            
            with open(file_path, 'w') as f:
                f.write(code)

            # Command Selection
            cmd = ExecutionService._get_command(language, file_path, temp_dir)
            
            start_time = time.time()
            try:
                # Execute with 5s timeout
                process = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=5,
                    cwd=temp_dir
                )
                execution_time = time.time() - start_time
                
                return {
                    "stdout": process.stdout,
                    "stderr": process.stderr,
                    "execution_time": round(execution_time, 4),
                    "exit_code": process.returncode,
                    "memory": "8 MB" # Default for now as real memory tracking requires OS-specific libs
                }
            except subprocess.TimeoutExpired:
                return {"error": "Execution Timed Out (Maximum 5s allowed)"}
            except Exception as e:
                return {"error": str(e)}

    @staticmethod
    def _get_extension(language):
        mapping = {
            'python': 'py',
            'javascript': 'js',
            'java': 'java',
            'bash': 'sh',
            'cpp': 'cpp',
            'html': 'html'
        }
        return mapping.get(language, 'txt')

    @staticmethod
    def _get_command(language, file_path, temp_dir):
        if language == 'python':
            return ['python', file_path]
        elif language == 'javascript':
            return ['node', file_path]
        elif language == 'bash':
            return ['bash', file_path]
        elif language == 'java':
            # Compile then run
            compile_cmd = ['javac', file_path]
            subprocess.run(compile_cmd, cwd=temp_dir)
            return ['java', 'solution']
        elif language == 'cpp':
            # Compile then run
            compile_cmd = ['g++', file_path, '-o', 'solution']
            subprocess.run(compile_cmd, cwd=temp_dir)
            return ['./solution']
        return []
