import os
import json
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import httpx
from app.core.config import settings
from app.models.schemas import Student, Internship

router = APIRouter()

# Models available on Groq
GROQ_MODELS = [
    "qwen/qwen3.6-27b",
    "groq/compound",
    "groq/compound-mini",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
]

async def call_groq(messages: List[Dict[str, str]], temperature: float = 0.5, json_mode: bool = False) -> str:
    """Call Groq chat completions API with fallback through available models."""
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload: Dict[str, Any] = {
        "messages": messages,
        "temperature": temperature,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in GROQ_MODELS:
            payload["model"] = model
            try:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    return content
                else:
                    print(f"Groq model {model} returned status {response.status_code}: {response.text}")
            except Exception as e:
                print(f"Error calling Groq model {model}: {e}")
                continue

    raise RuntimeError("All Groq models failed to return a valid response")


# ----------------------------------------------------
# 1. AI Career Assistant & Chat
# ----------------------------------------------------

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    studentId: Optional[int] = None

@router.post("/chat")
async def chat(request: ChatRequest):
    user_msg = request.message
    
    student_context = ""
    if request.studentId:
        try:
            student = await Student.find_one(Student.id == request.studentId)
            if student:
                student_context = f"""
Student Profile Context:
- Name: {student.name}
- Career Goals: {student.careerGoals or 'Not specified'}
- Key Skills: {', '.join(student.skills) if student.skills else 'None listed'}
- Qualifications: {', '.join(student.qualifications) if student.qualifications else 'None listed'}
- Industry Focus: {', '.join(student.industryFocus) if student.industryFocus else 'None specified'}
- Preferred Location: {student.locationPreference or 'Any'}
- Target Org Size: {student.preferredCompanySize or 'Any'}
"""
        except Exception as e:
            print(f"Error fetching student context: {e}")

    system_prompt = f"""You are 'InternAI Mentor', an intelligent and encouraging AI Career Assistant for the Prime Minister's Internship Scheme.
Your mission is to provide high-impact career guidance, resume suggestions, interview tips, and skill development advice.

{student_context}

Guidelines:
- Be highly actionable, encouraging, and clear.
- Tailor advice to the student's background and goals.
- If asked about resume tips, suggest specific impactful bullet points and metrics (STAR method).
- If asked about interview preparation, provide role-relevant technical and behavioral questions.
- If asked about skill roadmap or upskilling, suggest exact practical steps.
- Use markdown formatting with bullet points, bold highlights, and clean structure.
"""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history:
        role = "user" if msg.role in ["user", "human"] else "assistant"
        messages.append({"role": role, "content": msg.content})
    messages.append({"role": "user", "content": user_msg})

    try:
        reply = await call_groq(messages, temperature=0.7)
        return {"response": reply}
    except Exception as e:
        print(f"Groq chat error: {e}")
        return {"response": get_simulated_response(user_msg)}


# ----------------------------------------------------
# 2. Resume Analysis
# ----------------------------------------------------

class ResumeAnalysisRequest(BaseModel):
    resumeText: str
    studentId: Optional[int] = None

class ProjectItem(BaseModel):
    title: str
    description: str
    technologies: List[str] = []

class EducationItem(BaseModel):
    degree: str
    institution: str
    yearOrGrade: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summaryBio: str
    skills: List[str]
    projects: List[ProjectItem]
    certifications: List[str]
    education: List[EducationItem]
    strengths: List[str]
    improvementSuggestions: List[str]

@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    text = request.resumeText.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Resume text is required")

    system_prompt = """You are an expert AI Resume Parser and Career Evaluator.
Analyze the provided resume text thoroughly and extract structured information in strictly valid JSON format.

JSON Schema required:
{
  "name": "Extracted student name or null",
  "email": "Extracted email or null",
  "phone": "Extracted phone or null",
  "summaryBio": "A polished 2-3 sentence professional summary based on the resume",
  "skills": ["Skill 1", "Skill 2", ...],
  "projects": [
    {
      "title": "Project Title",
      "description": "Short 1-2 sentence description of what was built and impact",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "certifications": ["Certification 1", ...],
  "education": [
    {
      "degree": "e.g. B.Tech in Computer Science",
      "institution": "e.g. ABC Institute of Technology",
      "yearOrGrade": "e.g. 2024 / CGPA 8.5"
    }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "improvementSuggestions": ["Suggestion 1", "Suggestion 2"]
}

Output ONLY pure JSON. Do not include markdown wraps unless needed.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Here is the resume content:\n\n{text[:6000]}"}
    ]

    try:
        raw_output = await call_groq(messages, temperature=0.2, json_mode=True)
        # Clean JSON if model added code blocks
        clean_json = re.sub(r"^```json\s*", "", raw_output.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json.strip())
        parsed = json.loads(clean_json)
        return parsed
    except Exception as e:
        print(f"Error in Groq resume analysis: {e}")
        # Rule-based fallback extraction
        return fallback_resume_parser(text)


# ----------------------------------------------------
# 3. Skill Gap Analysis
# ----------------------------------------------------

class SkillGapRequest(BaseModel):
    studentSkills: List[str]
    targetInternshipId: Optional[int] = None
    targetSkills: Optional[List[str]] = None
    careerGoal: Optional[str] = None

class MissingSkillDetail(BaseModel):
    skill: str
    priority: str  # 'High' | 'Medium' | 'Low'
    reason: str
    estimatedTimeToLearn: str

class SkillGapResponse(BaseModel):
    matchPercentage: int
    possessedSkills: List[str]
    missingSkills: List[MissingSkillDetail]
    recommendationSummary: str

@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest):
    target_skills: List[str] = []
    internship_title = "Target Internship"

    if request.targetInternshipId:
        internship = await Internship.find_one(Internship.id == request.targetInternshipId)
        if internship:
            target_skills = internship.requiredSkills
            internship_title = internship.title
    elif request.targetSkills:
        target_skills = request.targetSkills
    else:
        # Aggregate skills from top available internships
        top_internships = await Internship.find_all().limit(5).to_list()
        for i in top_internships:
            target_skills.extend(i.requiredSkills)
        target_skills = list(set(target_skills))

    student_skills_set = set(s.strip().lower() for s in request.studentSkills)
    possessed = [s for s in target_skills if s.strip().lower() in student_skills_set]
    missing = [s for s in target_skills if s.strip().lower() not in student_skills_set]

    # Calculate match percentage
    total_target = max(len(target_skills), 1)
    match_pct = int(min(100, max(15, (len(possessed) / total_target) * 100)))

    # Use AI for detailed breakdown and reasons
    system_prompt = """You are an AI Skill Gap Specialist.
Analyze the target required skills vs the student's currently possessed skills.
For each missing skill, evaluate its priority ('High', 'Medium', or 'Low'), why it is crucial for this domain, and realistic estimated time to learn (e.g. '1-2 weeks', '3-4 weeks').

Provide the output in strictly valid JSON:
{
  "missingSkills": [
    {
      "skill": "Skill Name",
      "priority": "High|Medium|Low",
      "reason": "Brief explanation why it is critical",
      "estimatedTimeToLearn": "1-2 weeks"
    }
  ],
  "recommendationSummary": "Concise 1-2 sentence advice on where to start"
}
"""

    user_content = f"""Target Role: {internship_title}
Career Goal: {request.careerGoal or 'Tech Professional'}
Student Possessed Skills: {', '.join(request.studentSkills)}
Required Target Skills: {', '.join(target_skills)}
Identified Missing Skills: {', '.join(missing)}
"""

    try:
        raw_output = await call_groq(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_content}],
            temperature=0.3,
            json_mode=True
        )
        clean_json = re.sub(r"^```json\s*", "", raw_output.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json.strip())
        parsed = json.loads(clean_json)
        
        return {
            "matchPercentage": match_pct,
            "possessedSkills": list(set(possessed)),
            "missingSkills": parsed.get("missingSkills", [
                {"skill": s, "priority": "High", "reason": f"Required for {internship_title}", "estimatedTimeToLearn": "2 weeks"}
                for s in missing
            ]),
            "recommendationSummary": parsed.get("recommendationSummary", f"Focus on acquiring core missing skills to boost your match from {match_pct}% to 90%+.")
        }
    except Exception as e:
        print(f"Error in Groq skill gap analysis: {e}")
        return {
            "matchPercentage": match_pct,
            "possessedSkills": list(set(possessed)),
            "missingSkills": [
                {
                    "skill": s,
                    "priority": "High" if idx < 2 else "Medium",
                    "reason": f"Essential core skill for {internship_title}",
                    "estimatedTimeToLearn": "2-3 weeks"
                }
                for idx, s in enumerate(missing)
            ],
            "recommendationSummary": f"Acquiring {len(missing)} missing skills will significantly improve your profile ranking."
        }


# ----------------------------------------------------
# 4. Personalized Learning Roadmap
# ----------------------------------------------------

class CourseSuggestion(BaseModel):
    title: str
    provider: str
    duration: str
    level: str
    skillsCovered: List[str]

class ProjectSuggestion(BaseModel):
    title: str
    description: str
    techStack: List[str]
    portfolioValue: str

class CertificationSuggestion(BaseModel):
    name: str
    issuingOrg: str
    recognition: str

class RoadmapPhase(BaseModel):
    phaseNumber: int
    phaseTitle: str
    duration: str
    goals: List[str]
    courses: List[CourseSuggestion]
    projects: List[ProjectSuggestion]
    certifications: List[CertificationSuggestion]

class RoadmapResponse(BaseModel):
    studentName: str
    careerGoal: str
    totalDurationWeeks: int
    phases: List[RoadmapPhase]
    keyTakeaway: str

class RoadmapRequest(BaseModel):
    studentId: Optional[int] = None
    missingSkills: List[str] = []
    careerGoal: Optional[str] = None
    currentSkills: List[str] = []

@router.post("/roadmap", response_model=RoadmapResponse)
async def generate_learning_roadmap(request: RoadmapRequest):
    student_name = "Candidate"
    career_goal = request.careerGoal or "Software & AI Engineering"
    current_skills = request.currentSkills
    missing_skills = request.missingSkills

    if request.studentId:
        student = await Student.find_one(Student.id == request.studentId)
        if student:
            student_name = student.name
            career_goal = student.careerGoals or career_goal
            if not current_skills:
                current_skills = student.skills

    if not missing_skills:
        missing_skills = ["Python", "SQL", "Machine Learning", "System Design", "Cloud Basics"]

    system_prompt = """You are a Senior Principal Engineering Mentor and Career Architect.
Create a high-impact, actionable, personalized 3-phase Step-by-Step Learning Roadmap to help the student master their missing skills and achieve their career goal.

Required JSON Schema:
{
  "studentName": "Student Name",
  "careerGoal": "Career Goal",
  "totalDurationWeeks": 12,
  "keyTakeaway": "A motivating statement summarizing the learning journey",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseTitle": "Foundations & Core Competencies",
      "duration": "Weeks 1-4",
      "goals": ["Goal 1", "Goal 2"],
      "courses": [
        {
          "title": "Course Name",
          "provider": "Coursera / freeCodeCamp / edX / NPTEL",
          "duration": "15 hours",
          "level": "Beginner / Intermediate",
          "skillsCovered": ["Skill A", "Skill B"]
        }
      ],
      "projects": [
        {
          "title": "Project Title",
          "description": "Practical hands-on project description",
          "techStack": ["Python", "FastAPI"],
          "portfolioValue": "Highlights backend API engineering"
        }
      ],
      "certifications": [
        {
          "name": "Certification Name",
          "issuingOrg": "AWS / Meta / Google / DeepLearning.AI",
          "recognition": "Industry Recognized"
        }
      ]
    },
    {
      "phaseNumber": 2,
      "phaseTitle": "Advanced Specialization & Real-World Systems",
      "duration": "Weeks 5-8",
      "goals": ["Goal 1", "Goal 2"],
      "courses": [...],
      "projects": [...],
      "certifications": [...]
    },
    {
      "phaseNumber": 3,
      "phaseTitle": "Portfolio Mastery & Interview Readiness",
      "duration": "Weeks 9-12",
      "goals": ["Goal 1", "Goal 2"],
      "courses": [...],
      "projects": [...],
      "certifications": [...]
    }
  ]
}

Ensure all fields are fully populated with realistic, high-quality recommendations. Output pure JSON.
"""

    user_prompt = f"""Generate a personalized learning roadmap for:
Student Name: {student_name}
Career Goal: {career_goal}
Current Skills: {', '.join(current_skills) if current_skills else 'Beginner fundamentals'}
Target Missing Skills to Learn: {', '.join(missing_skills)}
"""

    try:
        raw_output = await call_groq(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.4,
            json_mode=True
        )
        clean_json = re.sub(r"^```json\s*", "", raw_output.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json.strip())
        parsed = json.loads(clean_json)
        return parsed
    except Exception as e:
        print(f"Error generating roadmap via Groq: {e}")
        return fallback_roadmap(student_name, career_goal, missing_skills)


# ----------------------------------------------------
# Fallbacks & Helpers
# ----------------------------------------------------

def fallback_resume_parser(text: str) -> Dict[str, Any]:
    """Basic keyword-based fallback if Groq API is temporarily unreachable"""
    common_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL",
        "MongoDB", "Machine Learning", "Data Analysis", "FastAPI", "Docker", "AWS",
        "Git", "Java", "C++", "HTML", "CSS", "TailwindCSS", "Figma"
    ]
    extracted_skills = [s for s in common_skills if re.search(rf"\b{re.escape(s)}\b", text, re.IGNORECASE)]
    if not extracted_skills:
        extracted_skills = ["Problem Solving", "Communication", "Python", "SQL"]

    return {
        "name": None,
        "email": None,
        "phone": None,
        "summaryBio": "Aspiring technology professional with strong analytical and problem-solving skills, seeking high-impact internship opportunities.",
        "skills": extracted_skills,
        "projects": [
            {
                "title": "Full Stack Application / Data Project",
                "description": "Developed and deployed an end-to-end solution utilizing modern frameworks and databases.",
                "technologies": extracted_skills[:3]
            }
        ],
        "certifications": ["Foundational Developer Certificate"],
        "education": [
            {
                "degree": "Bachelor of Technology / Science",
                "institution": "University / Institute",
                "yearOrGrade": "Expected 2025"
            }
        ],
        "strengths": ["Quick learner", "Hands-on project experience"],
        "improvementSuggestions": ["Quantify project metrics", "Add live deployment links to projects"]
    }

def fallback_roadmap(student_name: str, career_goal: str, missing_skills: List[str]) -> Dict[str, Any]:
    return {
        "studentName": student_name,
        "careerGoal": career_goal,
        "totalDurationWeeks": 12,
        "keyTakeaway": "Follow this structured 12-week roadmap to build in-demand skills and an industry-ready portfolio.",
        "phases": [
            {
                "phaseNumber": 1,
                "phaseTitle": "Foundations & Core Competencies",
                "duration": "Weeks 1-4",
                "goals": [f"Master fundamentals of {', '.join(missing_skills[:2]) if missing_skills else 'core skills'}", "Complete hands-on code exercises daily"],
                "courses": [
                    {
                        "title": f"Complete {missing_skills[0] if missing_skills else 'Programming'} Masterclass",
                        "provider": "freeCodeCamp / Coursera",
                        "duration": "20 hours",
                        "level": "Beginner to Intermediate",
                        "skillsCovered": missing_skills[:2] if missing_skills else ["Core Programming"]
                    }
                ],
                "projects": [
                    {
                        "title": "Interactive Data / Web Application",
                        "description": "Build an end-to-end application integrating REST APIs and persistent storage.",
                        "techStack": missing_skills[:2] if missing_skills else ["Python", "SQL"],
                        "portfolioValue": "Demonstrates full-stack and architectural understanding"
                    }
                ],
                "certifications": [
                    {
                        "name": "Foundational Specialization Certificate",
                        "issuingOrg": "Coursera / Meta",
                        "recognition": "Global Industry Standard"
                    }
                ]
            },
            {
                "phaseNumber": 2,
                "phaseTitle": "Applied Engineering & System Integration",
                "duration": "Weeks 5-8",
                "goals": ["Build advanced projects with deployment", "Integrate databases, caching, and APIs"],
                "courses": [
                    {
                        "title": "Production Engineering & Backend Systems",
                        "provider": "Udemy / edX",
                        "duration": "25 hours",
                        "level": "Intermediate",
                        "skillsCovered": missing_skills[2:4] if len(missing_skills) > 2 else ["System Design"]
                    }
                ],
                "projects": [
                    {
                        "title": "Cloud-Native Microservice / Machine Learning Pipeline",
                        "description": "Deploy a containerized API with automated CI/CD and cloud monitoring.",
                        "techStack": ["FastAPI", "Docker", "PostgreSQL"],
                        "portfolioValue": "Proves production-readiness to top internship recruiters"
                    }
                ],
                "certifications": [
                    {
                        "name": "Cloud Practitioner / Developer Associate",
                        "issuingOrg": "AWS / Google Cloud",
                        "recognition": "High Recruiter Value"
                    }
                ]
            },
            {
                "phaseNumber": 3,
                "phaseTitle": "Portfolio Showcase & Interview Mastery",
                "duration": "Weeks 9-12",
                "goals": ["Polish GitHub repositories and documentation", "Practice mock technical and behavioral interviews"],
                "courses": [
                    {
                        "title": "Technical Interview & Data Structures Mastery",
                        "provider": "LeetCode / NeetCode",
                        "duration": "30 hours",
                        "level": "Advanced",
                        "skillsCovered": ["Algorithms", "System Design", "Communication"]
                    }
                ],
                "projects": [
                    {
                        "title": "Capstone Flagship Project",
                        "description": "A comprehensive real-world open-source solution addressing a genuine industry challenge.",
                        "techStack": missing_skills[:4] if missing_skills else ["Full Stack", "AI"],
                        "portfolioValue": "Standout centerpiece for resume and portfolio"
                    }
                ],
                "certifications": [
                    {
                        "name": "Professional Certified Engineer",
                        "issuingOrg": "DeepLearning.AI / Linux Foundation",
                        "recognition": "Top-tier Recognition"
                    }
                ]
            }
        ]
    }

def get_simulated_response(message: str) -> str:
    msg = message.lower()
    if "resume" in msg or "cv" in msg:
        return "To optimize your resume for PM Internship Scheme recruiters:\n- **Quantify Impact**: Use numbers (e.g. 'Improved efficiency by 25%')\n- **Highlight Core Skills**: List matching skills at the top\n- **Project Details**: Use the STAR method (Situation, Task, Action, Result) for each project."
    elif "interview" in msg:
        return "For interview readiness:\n- **Technical Prep**: Review your core programming languages and data structures\n- **Behavioral Questions**: Prepare stories demonstrating leadership and problem-solving\n- Try out our **AI Mock Interview** tab to practice live!"
    elif "skill" in msg or "learn" in msg:
        return "Check out the **Upskilling Hub** to see your personalized Skill Gap analysis and step-by-step roadmap with recommended courses and project ideas."
    else:
        return "I'm your AI Career Mentor. I can assist you with resume evaluation, mock interview prep, skill gap analysis, and tailored career roadmaps. How can I help you take your next career step?"
