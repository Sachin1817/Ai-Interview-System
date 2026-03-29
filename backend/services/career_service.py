from .question_bank import QUESTION_BANK
from utils.db import get_db
import json
import google.generativeai as genai
import datetime

db = get_db()
jobs_col = db['jobs']

# Role-to-skill mapping for gap analysis per branch
BRANCH_CAREER_MAP = {
    "CSE": {
        "roles": {
            "Full Stack Developer": {
                "required": ["html", "css", "javascript", "react", "node", "express", "mongodb", "git"],
                "nice_to_have": ["typescript", "docker", "aws", "graphql"],
                "projects": ["E-Commerce Website", "Real-time Chat App", "Task Management Dashboard"],
                "internships": ["Software Engineer Intern", "Web Developer Intern"],
                "certifications": ["AWS Certified Developer", "Meta Frontend Certificate (Coursera)"],
            },
            "Data Scientist": {
                "required": ["python", "pandas", "numpy", "machine learning", "sql", "matplotlib"],
                "nice_to_have": ["tensorflow", "pytorch", "spark", "tableau"],
                "projects": ["Movie Recommendation System", "Stock Price Predictor", "Sentiment Analysis Tool"],
                "internships": ["Data Science Intern", "ML Research Intern"],
                "certifications": ["Google Data Analytics Certificate", "IBM Data Science Certificate"],
            },
            "DevOps Engineer": {
                "required": ["linux", "docker", "kubernetes", "git", "ci/cd", "aws"],
                "nice_to_have": ["terraform", "ansible", "prometheus", "grafana"],
                "projects": ["CI/CD Pipeline with Jenkins", "Kubernetes Cluster Setup", "Infrastructure with Terraform"],
                "internships": ["DevOps Intern", "Cloud Engineer Intern"],
                "certifications": ["AWS Solutions Architect", "Docker Certified Associate"],
            },
            "Backend Engineer": {
                "required": ["python", "flask", "sql", "mongodb", "rest api", "git"],
                "nice_to_have": ["redis", "kafka", "microservices", "docker"],
                "projects": ["REST API with Flask", "Microservices App", "Real-time Notification Service"],
                "internships": ["Backend Developer Intern", "API Developer Intern"],
                "certifications": ["Python Institute PCEP", "MongoDB University Certificate"],
            },
        },
        "learning_resources": {
            "free": ["freeCodeCamp", "The Odin Project", "CS50 Harvard (edX)"],
            "paid": ["Udemy Full Stack Bootcamp", "Coursera Meta Certificates", "Scaler Academy"],
        }
    },
    "IT": {
        "roles": {
            "Cloud Engineer": {
                "required": ["aws", "azure", "linux", "networking", "docker"],
                "nice_to_have": ["kubernetes", "terraform", "python scripting"],
                "projects": ["AWS Serverless App", "Multi-cloud Setup", "Cloud Cost Optimization Dashboard"],
                "internships": ["Cloud Intern", "Infrastructure Intern"],
                "certifications": ["AWS Cloud Practitioner", "Microsoft Azure Fundamentals"],
            },
            "Network Engineer": {
                "required": ["networking", "tcp/ip", "routing", "switching", "firewalls"],
                "nice_to_have": ["python automation", "sdn", "network security"],
                "projects": ["Network Monitoring System", "VLAN Setup Simulation", "Network Automation Script"],
                "internships": ["Network Intern", "IT Support Intern"],
                "certifications": ["CCNA (Cisco)", "CompTIA Network+"],
            },
            "Cybersecurity Analyst": {
                "required": ["networking", "linux", "security", "vulnerabilities", "firewalls"],
                "nice_to_have": ["penetration testing", "siem", "python scripting", "splunk"],
                "projects": ["Vulnerability Scanner", "CTF Challenges", "Security Audit Report"],
                "internships": ["SOC Analyst Intern", "Cyber Security Intern"],
                "certifications": ["CompTIA Security+", "CEH (Certified Ethical Hacker)"],
            },
        },
        "learning_resources": {
            "free": ["Cisco NetAcad", "TryHackMe", "Google IT Support (Coursera)"],
            "paid": ["INE Security (eLearnSecurity)", "SANS Institute"],
        }
    },
    "ECE": {
        "roles": {
            "Embedded Engineer": {
                "required": ["c", "c++", "microcontroller", "embedded", "uart", "spi", "i2c"],
                "nice_to_have": ["rtos", "python", "linux kernel", "bluetooth"],
                "projects": ["Smart Home Automation with Arduino", "IoT Weather Station", "RTOS-based Task Scheduler"],
                "internships": ["Embedded Firmware Intern", "IoT Intern"],
                "certifications": ["ARM Cortex-M Basics", "Texas Instruments Embedded Certificate"],
            },
            "VLSI Engineer": {
                "required": ["verilog", "vlsi", "digital electronics", "cmos"],
                "nice_to_have": ["system verilog", "fpga", "cadence tools"],
                "projects": ["4-bit ALU in Verilog", "FPGA-based CNN Accelerator", "SoC Design"],
                "internships": ["VLSI Design Intern", "Physical Design Intern"],
                "certifications": ["VLSI System Design Certificate", "NPTEL VLSI Design"],
            },
        },
        "learning_resources": {
            "free": ["NPTEL ECE Courses", "EEVblog", "Embedded.fm"],
            "paid": ["Udemy Embedded Systems", "MATLAB Onramp (Free)", "Mentor Graphics Training"],
        }
    },
    "Mechanical": {
        "roles": {
            "Design Engineer": {
                "required": ["autocad", "solidworks", "catia", "engineering drawing", "fea"],
                "nice_to_have": ["ansys", "matlab", "topology optimization"],
                "projects": ["RC Car Design in SolidWorks", "FEA Analysis of Bike Frame", "Drone Propeller Design"],
                "internships": ["Design Engineer Intern", "CAD Intern"],
                "certifications": ["CSWA (Certified SolidWorks Associate)", "ANSYS Certified"],
            },
            "Manufacturing Engineer": {
                "required": ["cnc", "manufacturing processes", "gd&t", "lean manufacturing"],
                "nice_to_have": ["six sigma", "additive manufacturing", "plc programming"],
                "projects": ["CNC Programming Project", "Lean Process Map", "3D Printed Functional Part"],
                "internships": ["Production Intern", "Manufacturing Intern"],
                "certifications": ["Six Sigma Green Belt", "SME Manufacturing Certification"],
            },
        },
        "learning_resources": {
            "free": ["NPTEL Mechanical", "MIT OpenCourseWare", "Paul McWhorter SolidWorks"],
            "paid": ["Udemy SolidWorks", "Coursera Manufacturing Courses"],
        }
    },
    "Civil": {
        "roles": {
            "Structural Engineer": {
                "required": ["autocad", "staad pro", "rcc design", "structural analysis"],
                "nice_to_have": ["etabs", "revit", "bim", "python for civil"],
                "projects": ["G+3 Building Design in STAAD Pro", "Bridge Load Analysis", "BIM Model in Revit"],
                "internships": ["Site Engineer Intern", "Structural Design Intern"],
                "certifications": ["STAAD Pro Certified", "Autodesk Revit Certified"],
            },
        },
        "learning_resources": {
            "free": ["NPTEL Civil", "CivilMDC", "SkillShare Civil free courses"],
            "paid": ["Autodesk Training", "STAAD Pro Online Course"],
        }
    },
    "EEE": {
        "roles": {
            "Power Systems Engineer": {
                "required": ["power systems", "electrical machines", "matlab", "simulink", "protection"],
                "nice_to_have": ["scada", "smart grid", "power electronics"],
                "projects": ["Grid Simulation in MATLAB/Simulink", "Solar MPPT Controller", "Smart Meter Project"],
                "internships": ["Power Systems Intern", "Substation Intern"],
                "certifications": ["NPTEL Electrical Machines", "IEEE PES Young Professional"],
            },
        },
        "learning_resources": {
            "free": ["NPTEL EEE", "All About Circuits", "Texas Instruments LaunchPad Tutorials"],
            "paid": ["Udemy MATLAB", "Coursera Power Electronics"],
        }
    },
    "Chemical": {
        "roles": {
            "Process Engineer": {
                "required": ["process design", "hysys", "aspen", "heat transfer", "mass transfer"],
                "nice_to_have": ["python scripting", "matlab", "hazop", "p&id"],
                "projects": ["Distillation Column Design", "Heat Exchanger Network", "Reactor Design"],
                "internships": ["Chemical Process Intern", "Refinery Intern"],
                "certifications": ["ASPEN Plus Certified", "AIChE Student Membership"],
            },
        },
        "learning_resources": {
            "free": ["NPTEL Chemical", "MIT OCW Chemical Engineering", "Coursera Chemical Processes"],
            "paid": ["Udemy ASPEN HYSYS", "AIChE e-Learning"],
        }
    },
    "Aerospace": {
        "roles": {
            "Aerospace Engineer": {
                "required": ["aerodynamics", "matlab", "simulink", "cad", "fea"],
                "nice_to_have": ["ansys fluent", "openfoam", "python scripting", "avionics"],
                "projects": ["CFD Simulation of Airfoil", "Rocket Trajectory Simulation", "Glider Design & Testing"],
                "internships": ["Aerospace Research Intern", "Avionics Intern"],
                "certifications": ["NPTEL Aerospace", "AIAA Student Member"],
            },
        },
        "learning_resources": {
            "free": ["NPTEL Aerospace", "NASA OpenCourseWare", "MIT Aeroastro YouTube"],
            "paid": ["Udemy ANSYS Fluent", "Coursera Robotics & Aerospace"],
        }
    },
}

def get_career_advice(branch, skills, assessment_score=None):
    """
    Generate personalized career advice based on branch and detected skills.
    Returns recommended roles, skill gaps, projects, and roadmap.
    """
    branch_data = BRANCH_CAREER_MAP.get(branch, BRANCH_CAREER_MAP.get("CSE"))
    skills_lower = [s.lower() for s in skills]
    
    role_matches = []
    for role_name, role_data in branch_data["roles"].items():
        required = role_data["required"]
        matched = [s for s in required if any(s in skill for skill in skills_lower)]
        match_pct = round(len(matched) / len(required) * 100) if required else 0
        missing = [s for s in required if not any(s in skill for skill in skills_lower)]
        
        role_matches.append({
            "role": role_name,
            "match_percentage": match_pct,
            "matched_skills": matched,
            "missing_skills": missing[:5],
            "nice_to_have": role_data.get("nice_to_have", []),
            "projects": role_data.get("projects", []),
            "internships": role_data.get("internships", []),
            "certifications": role_data.get("certifications", []),
        })
    
    # Sort by match %
    role_matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    # Best match
    best_role = role_matches[0] if role_matches else {}
    
    # Generate personalized roadmap
    roadmap = []
    if best_role.get("missing_skills"):
        roadmap.append(f"Learn {', '.join(best_role['missing_skills'][:3])} to qualify for {best_role.get('role', 'your target role')}")
    
    roadmap.append(f"Build 2-3 projects: {', '.join(best_role.get('projects', ['Domain project'])[:2])}")
    roadmap.append(f"Get certified: {', '.join(best_role.get('certifications', ['Domain certification'])[:1])}")
    roadmap.append("Practice DSA on LeetCode (100+ problems at your level)")
    roadmap.append("Apply for internships 6 months before placement season")
    
    if assessment_score and assessment_score < 60:
        roadmap.append("Boost your assessment score: take 2 mock tests per week on assessment hub")
    
    # Resources
    resources = branch_data.get("learning_resources", {})
    
    return {
        "branch": branch,
        "top_roles": role_matches[:3],
        "best_role": best_role.get("role", "Software Engineer"),
        "improvement_roadmap": roadmap,
        "free_resources": resources.get("free", []),
        "paid_resources": resources.get("paid", []),
    }

def get_job_recommendations(branch, role=None, user_skills=None, location=None):
    """
    Fetch relevant job opportunities from the database with location prioritization.
    Filters for verified active status and future deadlines.
    """
    today = datetime.date.today().isoformat()
    
    # 1. Base Query: Only active and future deadlines
    query = {
        "status": {"$ne": "expired"},
        "deadline": {"$gte": today}
    }

    if role:
        query["role"] = {"$regex": role, "$options": "i"}
    elif branch:
        query["title"] = {"$regex": branch, "$options": "i"}

    # Fetch all relevant jobs
    all_jobs = list(jobs_col.find(query))
    
    # 2. Prioritize: State match first, then rest
    def sort_score(job):
        score = 0
        if location:
            # Simple state-level match (e.g., "Bangalore, India" matches "Karnataka")
            # Improved: check if state name (user location) is in job location
            if location.lower() in job.get("location", "").lower():
                score += 100
        
        # Closing soon priority (next 48h)
        deadline = job.get("deadline", "")
        if deadline:
            try:
                days_left = (datetime.date.fromisoformat(deadline) - datetime.date.today()).days
                if days_left <= 2:
                    score += 50
            except:
                pass
        return score

    all_jobs.sort(key=sort_score, reverse=True)
    
    # If no specific matches, get general active ones
    if not all_jobs:
        all_jobs = list(jobs_col.find({"deadline": {"$gte": today}}).limit(10))

    # Format for frontend
    for j in all_jobs:
        j["_id"] = str(j["_id"])
        # Add deadline status
        try:
            days_left = (datetime.date.fromisoformat(j["deadline"]) - datetime.date.today()).days
            j["is_closing_soon"] = days_left <= 2
            j["days_remaining"] = days_left
        except:
            j["is_closing_soon"] = False
    
    return all_jobs[:8]

def match_job_with_ai(job, user_skills, resume_score=0):
    """
    Use Gemini AI to calculate match score and provide tailored advice for a specific job.
    """
    try:
        prompt = f"""
        You are an AI Career Matcher.
        Compare this User Profile to the Job Requirement and calculate a match score.
        
        USER PROFILE:
        - Skills: {', '.join(user_skills or ['General Engineering skills'])}
        - Resume ATS Score: {resume_score}/100
        
        JOB REQUIREMENT:
        - Title: {job.get('title')}
        - Company: {job.get('company')}
        - Required Skills: {', '.join(job.get('skills', []))}
        - Description: {job.get('description')}
        
        Output MUST be pure JSON with these keys:
        - match_score: (Integer 0-100)
        - why_match: (String, 1-2 points why they fit)
        - missing_skills: (Array of strings)
        - improvement_advice: (String, 1 specific action to take)
        """
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        raw_text = response.text.strip()
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        result = json.loads(raw_text)
        return result
    except Exception as e:
        print(f"Job Matching AI Error: {e}")
        # Basic fallback matching
        job_skills = [s.lower() for s in job.get('skills', [])]
        user_skills_lower = [s.lower() for s in (user_skills or [])]
        matched = [s for s in job_skills if s in user_skills_lower]
        score = int((len(matched) / len(job_skills) * 100)) if job_skills else 50
        
        return {
            "match_score": score,
            "why_match": f"You have {len(matched)} matching skills for this role.",
            "missing_skills": [s for s in job_skills if s not in user_skills_lower][:3],
            "improvement_advice": "Focus on building a project using the missing skills."
        }
