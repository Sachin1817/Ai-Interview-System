import os
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client['ai_placement_system']
jobs_col = db['jobs']

JOBS = [
    # CSE / IT
    {
        "title": "Software Engineer Intern",
        "company": "Google",
        "location": "Bangalore, India",
        "skills": ["Python", "Java", "Data Structures", "Algorithms"],
        "role": "Software Engineer",
        "deadline": "2026-06-30",
        "applyLink": "https://careers.google.com",
        "jobType": "Internship",
        "description": "Work on large-scale distributed systems and develop innovative solutions for global users."
    },
    {
        "title": "Full Stack Developer",
        "company": "Zomato",
        "location": "Gurgaon, India",
        "skills": ["React", "Node.js", "MongoDB", "JavaScript"],
        "role": "Full Stack Developer",
        "deadline": "2026-05-15",
        "applyLink": "https://zomato.com/careers",
        "jobType": "Full-time",
        "description": "Build and maintain highly scalable web applications for India's leading food delivery platform."
    },
    {
        "title": "Data Scientist",
        "company": "Amazon",
        "location": "Hyderabad, India",
        "skills": ["Python", "Machine Learning", "SQL", "Statistics"],
        "role": "Data Scientist",
        "deadline": "2026-07-20",
        "applyLink": "https://amazon.jobs",
        "jobType": "Full-time",
        "description": "Extract insights from massive datasets and build predictive models to optimize customer experience."
    },
    # ECE
    {
        "title": "Embedded Systems Intern",
        "company": "NVIDIA",
        "location": "Pune, India",
        "skills": ["C", "C++", "Microcontrollers", "RTOS"],
        "role": "Embedded Engineer",
        "deadline": "2026-08-10",
        "applyLink": "https://nvidia.com/careers",
        "jobType": "Internship",
        "description": "Develop low-level firmware and drivers for next-generation hardware accelerators."
    },
    {
        "title": "VLSI Design Engineer",
        "company": "Intel",
        "location": "Bangalore, India",
        "skills": ["Verilog", "VLSI", "Digital Electronics"],
        "role": "VLSI Designer",
        "deadline": "2026-09-05",
        "applyLink": "https://intel.com/careers",
        "jobType": "Full-time",
        "description": "Design and verify complex digital circuits for high-performance processors."
    },
    # Mechanical
    {
        "title": "Mechanical Design Intern",
        "company": "Tesla",
        "location": "Remote / USA",
        "skills": ["SolidWorks", "AutoCAD", "FEA"],
        "role": "Design Engineer",
        "deadline": "2026-10-01",
        "applyLink": "https://tesla.com/careers",
        "jobType": "Internship",
        "description": "Contribute to the mechanical design and analysis of electric vehicle components."
    },
    # EEE
    {
        "title": "Power Systems Engineer",
        "company": "ABB",
        "location": "Bangalore, India",
        "skills": ["Power Systems", "MATLAB", "Electrical Machines"],
        "role": "Power Systems Engineer",
        "deadline": "2026-04-30",
        "applyLink": "https://abb.com/careers",
        "jobType": "Full-time",
        "description": "Design and optimize electrical power grids and distribution systems."
    },
    # Civil
    {
        "title": "Structural Engineering Intern",
        "company": "L&T Construction",
        "location": "Mumbai, India",
        "skills": ["AutoCAD", "STAAD Pro", "RCC Design"],
        "role": "Structural Engineer",
        "deadline": "2026-05-25",
        "applyLink": "https://lntecc.com/careers",
        "jobType": "Internship",
        "description": "Work on the structural design and analysis of major infrastructure projects."
    },
    # Added more variety
    {
        "title": "Backend Intern",
        "company": "Razorpay",
        "location": "Bangalore, India",
        "skills": ["Node.js", "Go", "MySQL", "Redis"],
        "role": "Backend Engineer",
        "deadline": "2026-06-12",
        "applyLink": "https://razorpay.com/jobs",
        "jobType": "Internship",
        "description": "Contribute to building robust payment infrastructure for millions of businesses."
    },
    {
        "title": "Cloud Architect",
        "company": "Microsoft",
        "location": "Hyderabad, India",
        "skills": ["Azure", "Kubernetes", "Docker", "DevOps"],
        "role": "Cloud Engineer",
        "deadline": "2026-11-20",
        "applyLink": "https://careers.microsoft.com",
        "jobType": "Full-time",
        "description": "Lead the cloud transformation for enterprise clients using Microsoft Azure."
    }
]

def seed():
    print("Seeding jobs collection...")
    jobs_col.delete_many({}) # Clear existing
    result = jobs_col.insert_many(JOBS)
    print(f"Successfully seeded {len(result.inserted_ids)} jobs.")

if __name__ == "__main__":
    seed()
