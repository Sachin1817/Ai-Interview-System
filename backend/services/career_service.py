from .question_bank import QUESTION_BANK
from utils.db import get_db
import json
from .ai_service import generate_ai_response
import datetime

def _clean_json_response(raw_text):
    """Utility to extract JSON from model response that may contain markdown or extra text."""
    try:
        # 1. Clean up whitespace and find the JSON structure
        raw_text = raw_text.strip()
        
        # 2. Try to find JSON array or object
        start_arr = raw_text.find('[')
        start_obj = raw_text.find('{')
        
        # Determine which one appears first (if both exist) or only one
        if start_arr != -1 and (start_obj == -1 or start_arr < start_obj):
            start = start_arr
            end = raw_text.rfind(']')
        elif start_obj != -1:
            start = start_obj
            end = raw_text.rfind('}')
        else:
            return json.loads(raw_text) # Fallback to original
            
        if start != -1 and end != -1:
            json_str = raw_text[start:end+1]
            return json.loads(json_str)
            
        return json.loads(raw_text)
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        return None



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
    Generate personalized career advice using Groq AI based on branch and detected skills.
    Returns recommended roles, skill gaps, projects, and roadmap.
    """
    try:
        skills_str = ", ".join(skills) if skills else "No specific skills detected yet."
        score_info = f"Latest Interview Score: {assessment_score}/100" if assessment_score else "No interview taken yet."
        
        prompt = f"""
        You are a World-Class Career Advisor and Industry Expert for {branch} students.
        Based on the user's profile, provide a highly personalized career matching analysis.

        USER PROFILE:
        - Engineering Branch: {branch}
        - Current Skills: {skills_str}
        - {score_info}

        Provide your analysis strictly in JSON format with these exact keys:
        - branch: (String) {branch}
        - top_roles: (List of Objects) Top 3 matching roles. Each object must have:
            - role: (String) Job title
            - match_percentage: (Integer 0-100)
            - matched_skills: (List of strings)
            - missing_skills: (List of strings)
            - nice_to_have: (List of strings)
            - projects: (List of strings) 2-3 specific project ideas for this role
            - internships: (List of strings) Typical internship titles for this role
            - certifications: (List of strings) Recommended certifications
        - best_role: (String) The single best matching role name
        - improvement_roadmap: (List of strings) A 6-step personalized roadmap to success
        - free_resources: (List of strings) 3 free learning platforms or specific courses
        - paid_resources: (List of strings) 3 premium courses or bootcamps

        Specific Instruction: If the user has few skills, be encouraging but realistic in the match percentage.
        Your response must be ONLY the JSON object.
        """
        
        raw_text = generate_ai_response(prompt)
        if not raw_text:
            print("LOG [CareerService]: AI returned empty text for advice.")
            raise ValueError("AI failed to return career advice")
            
        advice = _clean_json_response(raw_text)
        if advice:
            # Ensure branch is consistent
            advice["branch"] = branch
            return advice
            
        print(f"LOG [CareerService]: Failed to parse JSON from AI response. Raw text snippet: {raw_text[:100]}...")
        raise ValueError("Failed to parse AI career advice JSON")

    except Exception as e:
        print(f"LOG [CareerService]: AI Error: {e}. Falling back to static logic.")
        # FALLBACK to static logic if AI fails
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
        best_role = role_matches[0] if role_matches else {}
        
        roadmap = []
        if best_role.get("missing_skills"):
            roadmap.append(f"Learn {', '.join(best_role['missing_skills'][:3])} to qualify for {best_role.get('role', 'your target role')}")
        
        roadmap.extend([
            f"Build 2-3 projects: {', '.join(best_role.get('projects', ['Domain project'])[:2])}",
            f"Get certified: {', '.join(best_role.get('certifications', ['Domain certification'])[:1])}",
            "Practice DSA on LeetCode (100+ problems at your level)",
            "Apply for internships 6 months before placement season"
        ])
        
        if assessment_score and assessment_score < 60:
            roadmap.append("Boost your assessment score: take 2 mock tests per week on assessment hub")
        
        resources = branch_data.get("learning_resources", {})
        
        return {
            "branch": branch,
            "top_roles": role_matches[:3],
            "best_role": best_role.get("role", "Software Engineer"),
            "improvement_roadmap": roadmap,
            "free_resources": resources.get("free", []),
            "paid_resources": resources.get("paid", []),
        }

def _get_fallback_jobs(branch, role=None, location=None):
    import random
    
    search_role = role if role else f"{branch} Engineer"
    search_location = location if location else "India"
    
    # Base lists for realistic jobs
    companies = {
        "CSE": ["Google", "Microsoft", "Meta", "Stripe", "Vercel", "Amazon", "Netflix", "Uber"],
        "IT": ["Amazon Web Services", "Cisco", "Cloudflare", "Accenture", "TCS", "Infosys", "IBM"],
        "ECE": ["Intel", "NVIDIA", "Qualcomm", "Apple", "Texas Instruments", "Samsung", "AMD"],
        "Mechanical": ["Tesla", "Boeing", "SpaceX", "Ford", "General Electric", "Lockheed Martin"],
        "Civil": ["AECOM", "Bechtel", "L&T", "Jacob Engineering", "Turner Construction"],
        "EEE": ["Siemens", "GE Vernova", "Schneider Electric", "ABB", "Tesla Energy"],
        "Chemical": ["ExxonMobil", "Dow Chemical", "BASF", "Shell", "Chevron"],
        "Aerospace": ["NASA", "SpaceX", "Boeing", "Blue Origin", "Airbus", "Northrop Grumman"]
    }
    
    job_titles = {
        "CSE": ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "DevOps Intern"],
        "IT": ["Cloud Engineer", "Network Administrator", "Systems Analyst", "Cybersecurity Analyst", "IT Specialist"],
        "ECE": ["Embedded Software Intern", "VLSI Design Engineer", "IoT System Developer", "Hardware Design Intern", "Firmware Engineer"],
        "Mechanical": ["CAD Design Engineer", "Mechanical Design Intern", "Robotics Research Engineer", "Product Design Engineer"],
        "Civil": ["Structural Design Intern", "Site Engineer", "BIM Modeler", "Civil Project Assistant"],
        "EEE": ["Power Systems Engineer", "Electrical Design Intern", "Control Systems Developer", "Smart Grid Analyst"],
        "Chemical": ["Process Engineer", "Chemical Plant Intern", "Refinery Process Developer", "Environmental Analyst"],
        "Aerospace": ["Aerodynamics Research Intern", "Avionics Systems Engineer", "Propulsion Developer", "Structural Test Engineer"]
    }
    
    skills_map = {
        "CSE": ["React.js", "Node.js", "Python", "MongoDB", "TypeScript", "Docker", "Git"],
        "IT": ["AWS", "Linux", "Networking", "Azure", "Docker", "Cybersecurity"],
        "ECE": ["C/C++", "Verilog", "Embedded Systems", "Microcontrollers", "RTOS"],
        "Mechanical": ["SolidWorks", "AutoCAD", "ANSYS", "GD&T", "MATLAB"],
        "Civil": ["STAAD Pro", "AutoCAD", "Revit", "BIM", "Structural Analysis"],
        "EEE": ["MATLAB", "Simulink", "Power Systems", "Electrical Machines", "SCADA"],
        "Chemical": ["ASPEN Plus", "HYSYS", "Process Design", "HAZOP", "Heat Transfer"],
        "Aerospace": ["CFD", "ANSYS Fluent", "MATLAB", "Simulink", "Aerodynamics"]
    }

    branch_key = branch if branch in companies else "CSE"
    selected_companies = companies[branch_key]
    selected_titles = job_titles[branch_key]
    selected_skills = skills_map[branch_key]
    
    mock_jobs = []
    for i in range(10):
        comp = selected_companies[i % len(selected_companies)]
        title = selected_titles[i % len(selected_titles)]
        if role and i == 0:
            title = role
            
        j_type = "Internship" if i in [0, 2] else "Full-time"
        posted_days = random.randint(1, 6)
        posted_date = f"{posted_days} days ago" if posted_days > 1 else "Yesterday"
        
        salary_range = "$90,000 - $120,000" if j_type == "Full-time" else "$30 - $45 per hour"
        if "India" in search_location or not search_location:
            salary_range = "₹8,00,000 - ₹12,00,000/yr" if j_type == "Full-time" else "₹25,000 - ₹40,000/mo"
            
        # Select random skills safely
        try:
            req_skills = random.sample(selected_skills, min(4, len(selected_skills)))
        except Exception:
            req_skills = selected_skills[:4]
        
        # Resolve company careers URL directly
        import urllib.parse
        
        company_careers_urls = {
            "google": "https://careers.google.com",
            "microsoft": "https://careers.microsoft.com",
            "meta": "https://www.metacareers.com",
            "stripe": "https://stripe.com/jobs",
            "vercel": "https://vercel.com/careers",
            "amazon": "https://www.amazon.jobs",
            "netflix": "https://jobs.netflix.com",
            "uber": "https://www.uber.com/careers",
            "amazon web services": "https://www.amazon.jobs",
            "cisco": "https://www.cisco.com/c/en/us/about/careers.html",
            "cloudflare": "https://www.cloudflare.com/careers",
            "accenture": "https://www.accenture.com/careers",
            "tcs": "https://www.tcs.com/careers",
            "infosys": "https://www.infosys.com/careers.html",
            "ibm": "https://www.ibm.com/careers",
            "intel": "https://www.intel.com/content/www/us/en/jobs/careers.html",
            "nvidia": "https://www.nvidia.com/en-us/about-nvidia/careers",
            "qualcomm": "https://www.qualcomm.com/company/careers",
            "apple": "https://www.apple.com/careers",
            "texas instruments": "https://careers.ti.com",
            "samsung": "https://www.samsung.com/us/careers",
            "amd": "https://www.amd.com/en/corporate/careers",
            "tesla": "https://www.tesla.com/careers",
            "boeing": "https://jobs.boeing.com",
            "spacex": "https://www.spacex.com/careers",
            "ford": "https://corporate.ford.com/careers.html",
            "general electric": "https://www.ge.com/careers",
            "lockheed martin": "https://www.lockheedmartinjobs.com",
            "aecom": "https://aecom.com/careers",
            "bechtel": "https://www.bechtel.com/careers",
            "l&t": "https://www.larsentoubro.com/corporate/careers",
            "jacob engineering": "https://www.jacobs.com/careers",
            "turner construction": "https://www.turnerconstruction.com/careers",
            "siemens": "https://new.siemens.com/global/en/company/jobs.html",
            "ge vernova": "https://www.gevernova.com/careers",
            "schneider electric": "https://www.se.com/ww/en/about-us/careers",
            "abb": "https://careers.abb/global/en",
            "tesla energy": "https://www.tesla.com/careers",
            "exxonmobil": "https://corporate.exxonmobil.com/careers",
            "dow chemical": "https://careers.dow.com",
            "basf": "https://www.basf.com/global/en/careers.html",
            "shell": "https://www.shell.com/careers.html",
            "chevron": "https://careers.chevron.com",
            "nasa": "https://www.nasa.gov/careers",
            "blue origin": "https://www.blueorigin.com/careers",
            "airbus": "https://www.airbus.com/en/careers",
            "northrop grumman": "https://www.northropgrumman.com/careers"
        }
        
        comp_lower = comp.lower()
        apply_link = None
        for name, url in company_careers_urls.items():
            if name in comp_lower or comp_lower in name:
                apply_link = url
                break
        
        if not apply_link:
            clean_name = "".join(c for c in comp_lower if c.isalnum())
            apply_link = f"https://www.{clean_name}.com/careers"

        mock_jobs.append({
            "_id": f"mock_job_{branch_key.lower()}_{i}",
            "title": title,
            "company": comp,
            "location": f"{search_location or 'India'}",
            "jobType": j_type,
            "postedDate": posted_date,
            "salary": salary_range,
            "applyLink": apply_link,
            "skills": req_skills,
            "description": f"Exciting opportunity at {comp} to work as a {title}. You will collaborate with cross-functional teams to design, build, and deploy next-generation solutions using modern technologies including {', '.join(req_skills)}.",
            "is_external": True,
            "is_mock": True
        })
        
    return mock_jobs

def fetch_detailed_apply_link(job_id, api_key, fallback_link, via_platform, company, title):
    import requests
    import urllib.parse
    
    # Standard general job boards to deprioritize in favor of company websites
    job_boards = ["linkedin", "indeed", "glassdoor", "ziprecruiter", "simplyhired", 
                  "monster", "careerbuilder", "jooble", "dice", "lensa", "upwork", 
                  "fiverr", "flexjobs", "snagajob", "workingnomads", "wellfound", 
                  "angel.co", "remote.co", "remotive", "naukri", "foundit", "shine"]

    company_careers_urls = {
        "google": "https://careers.google.com",
        "microsoft": "https://careers.microsoft.com",
        "meta": "https://www.metacareers.com",
        "stripe": "https://stripe.com/jobs",
        "vercel": "https://vercel.com/careers",
        "amazon": "https://www.amazon.jobs",
        "netflix": "https://jobs.netflix.com",
        "uber": "https://www.uber.com/careers",
        "amazon web services": "https://www.amazon.jobs",
        "cisco": "https://www.cisco.com/c/en/us/about/careers.html",
        "cloudflare": "https://www.cloudflare.com/careers",
        "accenture": "https://www.accenture.com/careers",
        "tcs": "https://www.tcs.com/careers",
        "infosys": "https://www.infosys.com/careers.html",
        "ibm": "https://www.ibm.com/careers",
        "intel": "https://www.intel.com/content/www/us/en/jobs/careers.html",
        "nvidia": "https://www.nvidia.com/en-us/about-nvidia/careers",
        "qualcomm": "https://www.qualcomm.com/company/careers",
        "apple": "https://www.apple.com/careers",
        "texas instruments": "https://careers.ti.com",
        "samsung": "https://www.samsung.com/us/careers",
        "amd": "https://www.amd.com/en/corporate/careers",
        "tesla": "https://www.tesla.com/careers",
        "boeing": "https://jobs.boeing.com",
        "spacex": "https://www.spacex.com/careers",
        "ford": "https://corporate.ford.com/careers.html",
        "general electric": "https://www.ge.com/careers",
        "lockheed martin": "https://www.lockheedmartinjobs.com",
        "aecom": "https://aecom.com/careers",
        "bechtel": "https://www.bechtel.com/careers",
        "l&t": "https://www.larsentoubro.com/corporate/careers",
        "jacob engineering": "https://www.jacobs.com/careers",
        "turner construction": "https://www.turnerconstruction.com/careers",
        "siemens": "https://new.siemens.com/global/en/company/jobs.html",
        "ge vernova": "https://www.gevernova.com/careers",
        "schneider electric": "https://www.se.com/ww/en/about-us/careers",
        "abb": "https://careers.abb/global/en",
        "tesla energy": "https://www.tesla.com/careers",
        "exxonmobil": "https://corporate.exxonmobil.com/careers",
        "dow chemical": "https://careers.dow.com",
        "basf": "https://www.basf.com/global/en/careers.html",
        "shell": "https://www.shell.com/careers.html",
        "chevron": "https://careers.chevron.com",
        "nasa": "https://www.nasa.gov/careers",
        "blue origin": "https://www.blueorigin.com/careers",
        "airbus": "https://www.airbus.com/en/careers",
        "northrop grumman": "https://www.northropgrumman.com/careers"
    }

    # Build a clean default fallback link pointing directly to Company Careers website
    cleaned_fallback = fallback_link
    company_lower = company.lower() if company else ""
    
    # Check if we have mapped careers page
    matched_careers_url = None
    if company_lower:
        for name, url in company_careers_urls.items():
            if name in company_lower or company_lower in name:
                matched_careers_url = url
                break
        
        if not matched_careers_url:
            clean_name = "".join(c for c in company_lower if c.isalnum())
            matched_careers_url = f"https://www.{clean_name}.com/careers"
            
    if matched_careers_url:
        cleaned_fallback = matched_careers_url

    if not job_id or not api_key:
        return cleaned_fallback

    try:
        params = {
            "engine": "google_jobs_listing",
            "q": job_id,
            "api_key": api_key
        }
        res = requests.get("https://serpapi.com/search.json", params=params, timeout=3)
        if res.status_code == 200:
            data = res.json()
            apply_options = data.get("apply_options", [])
            if apply_options and len(apply_options) > 0:
                # 1. High priority: Look for explicitly marked "company site" or "company website"
                for option in apply_options:
                    link = option.get("link")
                    title_opt = option.get("title", "").lower()
                    if link and ("company site" in title_opt or "company website" in title_opt or "direct" in title_opt):
                        return link
                
                # 2. Medium priority: Look for any link that is NOT in the general job boards list (usually company career portals)
                for option in apply_options:
                    link = option.get("link")
                    title_opt = option.get("title", "").lower()
                    if link and not any(board in title_opt for board in job_boards):
                        return link
                
                # 3. Low priority: Return the first available link (even if it's a job board)
                return apply_options[0].get("link", cleaned_fallback)
    except Exception as e:
        print(f"LOG: Error fetching detailed apply link for {job_id}: {e}")
    
    return cleaned_fallback

def get_job_recommendations(branch, role=None, user_skills=None, location=None):
    """
    Fetch relevant job opportunities from SerpApi (Google Jobs) dynamically.
    Integrates live listings based on role and location.
    Returns strictly real-time listings or an empty list if no results are found or if the external API fails.
    """
    import requests
    import os
    from concurrent.futures import ThreadPoolExecutor
    
    api_key = os.getenv("SERP_API_KEY")
    if not api_key:
        print("LOG: SERP_API_KEY not found in environment, returning empty list.")
        return []

    # Use Best Fit Role if provided, else fallback to branch
    search_role = role if role else f"{branch} Developer"
    search_location = location if location else "India"

    print(f"LOG: Role used: {search_role}")
    print(f"LOG: Location used: {search_location}")

    params = {
        "engine": "google_jobs",
        "q": search_role,
        "location": search_location,
        "api_key": api_key
    }

    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            # 5 second timeout requirement
            response = requests.get("https://serpapi.com/search.json", params=params, timeout=5)
            print(f"LOG: API response status: {response.status_code} (Attempt {attempt + 1})")
            
            if response.status_code == 200:
                data = response.json()
                
                if "error" in data:
                    print(f"LOG: SerpApi Error in response: {data['error']}. Returning empty list.")
                    return []
                
                jobs_results = data.get("jobs_results", [])
                print(f"LOG: Found {len(jobs_results)} raw results")

                if not jobs_results:
                    return []

                # Limit to 10 results for parallel details fetch
                jobs_to_process = jobs_results[:10]

                def process_single_job(job):
                    # Extract job type and posted date from extensions
                    extensions = job.get("extensions", [])
                    detected = job.get("detected_extensions", {})
                    
                    job_type = "Full-time" 
                    posted_date = detected.get("posted_at") or next((ext for ext in extensions if "ago" in ext.lower() or "yesterday" in ext.lower()), "Recently")
                    salary = detected.get("salary")
                    
                    for ext in extensions:
                        if any(x in ext.lower() for x in ["time", "internship", "contract"]):
                            job_type = ext
                        if not salary and any(x in ext.lower() for x in ["a year", "an hour", "a month"]):
                            salary = ext

                    via_platform = job.get("via", "")
                    company = job.get("company_name", "")
                    title = job.get("title", "")
                    job_id = job.get("job_id")
                    share_link = job.get("share_link")
                    
                    # Fetch the direct apply link (e.g. company careers or direct job board page)
                    apply_link = fetch_detailed_apply_link(job_id, api_key, share_link, via_platform, company, title)

                    # Generate realistic skill tag recommendations based on job title/description
                    branch_key = branch if branch in ["CSE", "IT", "ECE", "Mechanical", "Civil", "EEE", "Chemical", "Aerospace"] else "CSE"
                    fallback_skills = ["React.js", "Node.js", "Python", "Docker"] if branch_key == "CSE" else ["Engineering"]
                    
                    return {
                        "_id": job_id if job_id else os.urandom(8).hex(),
                        "title": title,
                        "company": company,
                        "location": job.get("location"),
                        "jobType": job_type,
                        "postedDate": posted_date,
                        "salary": salary,
                        "applyLink": apply_link,
                        "skills": fallback_skills, 
                        "description": job.get("description", ""),
                        "is_external": True
                    }

                with ThreadPoolExecutor(max_workers=10) as executor:
                    formatted_jobs = list(executor.map(process_single_job, jobs_to_process))

                return formatted_jobs
            
            # If status not 200, retry
            continue

        except Exception as e:
            print(f"LOG: SerpApi Error on attempt {attempt + 1}: {e}")
            if attempt == max_retries:
                return []
    
    return []


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
        
        # Call new centralized service
        raw_text = generate_ai_response(prompt)
        
        if not raw_text:
            raise ValueError("Failed to get match results from AI")
            
        result = _clean_json_response(raw_text)
        
        if result:
            return result
            
        raise ValueError("Failed to parse AI response as JSON")
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
from .ai_service import generate_ai_response, generate_chat_completion

def chat_with_career_assistant(message, user_skills=None, branch="General", role=None, hiring_level=None, history=None, language="English"):
    """
    Generate a helpful, conversational, and interactive response for the career assistant.
    Maintains memory by processing previous message history and respects language selection.
    """
    try:
        skills_str = ", ".join(user_skills) if user_skills else "General student"
        
        # 1. Define the persistent Mentor System Prompt (High-Clarity style)
        system_prompt = f"""
        You are a friendly, professional AI Career Mentor. 
        Your goal is to provide **easy-to-scan, points-wise** career coaching.

        USER CONTEXT:
        - Engineering Branch: {branch}
        - Current Skills: {skills_str}
        - Targeted Role: {role or 'Exploring'}
        - PREFERRED LANGUAGE: {language}

        STRICT RESPONSE RULES:
        1. **Language**: You MUST respond in {language}. If {language} is not English, you can still use English for technical terms (like 'React', 'Cloud', 'Data Structures') but the surrounding explanation must be in {language}.
        2. **Points-Wise Only**: Never write long paragraphs. Use clear bullet points (•) for every piece of advice.
        3. **Visual Gaps**: Use **double line breaks** (\n\n) between every point and every section.
        4. **Emoji Rich**: Use 1-2 relevant emojis (🚀, 💡, 🎯, 🎓, 💻) in every response.
        5. **Interactive Curiosity**: End every response with a **short, easy follow-up question in {language}**.
        6. **No Formal Fluff**: Skip formal introductions. Jump straight to the points.

        Respond as the Mentor in {language}.
        """


        # 2. Build the message list for the AI
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history if provided (filtered to last 10 messages for context efficiency)
        if history and isinstance(history, list):
            # Groq/AI expects 'user' and 'assistant' roles. 
            messages.extend(history[-10:])
            
        # Add the current user message
        messages.append({"role": "user", "content": message})
        
        # 3. Generate response using llama-3.1-8b-instant for fast interaction
        response = generate_chat_completion(messages, model_id="llama-3.1-8b-instant")
        
        if response:
            return {"reply": response}
            
        raise ValueError("Empty response from Interactive Advisor service")
        
    except Exception as e:
        print(f"Interactive Career Chatbot Error: {e}")
        return {"reply": "I'm having a little trouble connecting. Could you try your question again? 🚀"}
