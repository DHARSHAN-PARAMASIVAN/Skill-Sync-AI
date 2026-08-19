import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from passlib.context import CryptContext
from app.models.schemas import Student, Internship, Company, Admin
from app.core.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

STUDENTS_DATA = [
    {
        "id": 1,
        "name": 'DHARSHAN P',
        "email": 'dharshan@example.com',
        "phoneNumber": "9000000001",
        "password": get_password_hash("password123"),
        "role": 'STUDENT',
        "profileImage": "https://i.pravatar.cc/150?u=dharshan",
        "careerGoals": 'Become a Product Manager in a high-growth tech company',
        "skills": ['React', 'Node.js', 'Python', 'Market Research', 'Agile Methodologies', 'Figma'],
        "qualifications": ['B.Tech in Computer Science', 'Certified Scrum Master'],
        "locationPreference": 'Bangalore',
        "preferredCompanySize": 'Mid-size',
        "industryFocus": ['Artificial Intelligence', 'Web Development'],
        "preferredDuration": '3 Months',
        "gender": 'Male',
        "background": 'Urban',
        "collegeTier": 'Tier-1',
    },
    {
        "id": 2,
        "name": 'Rohan Verma',
        "email": 'rohan.v@example.com',
        "phoneNumber": "9000000002",
        "password": get_password_hash("password123"),
        "role": 'STUDENT',
        "profileImage": "https://i.pravatar.cc/150?u=rohan",
        "careerGoals": 'AI/ML Engineer and Deep Learning Researcher',
        "skills": ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'FastAPI'],
        "qualifications": ['B.E. in Information Technology'],
        "locationPreference": 'Bangalore',
        "preferredCompanySize": 'Any',
        "industryFocus": ['Artificial Intelligence'],
        "preferredDuration": '6 Months',
        "gender": 'Male',
        "background": 'Urban',
        "collegeTier": 'Tier-1',
    },
    {
        "id": 3,
        "name": 'Priya Singh',
        "email": 'priya.s@example.com',
        "phoneNumber": "9000000003",
        "password": get_password_hash("password123"),
        "role": 'STUDENT',
        "profileImage": "https://i.pravatar.cc/150?u=priya",
        "careerGoals": 'Data Scientist and Business Analyst',
        "skills": ['Python', 'SQL', 'Data Analysis', 'Agile Methodologies'],
        "qualifications": ['B.Sc. in Statistics'],
        "locationPreference": 'Hyderabad',
        "preferredCompanySize": 'MNC',
        "industryFocus": ['Data Science'],
        "preferredDuration": '3 Months',
        "gender": 'Female',
        "background": 'Rural',
        "collegeTier": 'Tier-2',
    },
    {
        "id": 4,
        "name": 'Amit Kumar',
        "email": 'amit.k@example.com',
        "phoneNumber": "9000000004",
        "password": get_password_hash("password123"),
        "role": 'STUDENT',
        "profileImage": "https://i.pravatar.cc/150?u=amit",
        "careerGoals": 'Full Stack Developer',
        "skills": ['React', 'Node.js', 'MongoDB', 'REST APIs', 'TypeScript'],
        "qualifications": ['B.Tech in CSE'],
        "locationPreference": 'Remote',
        "preferredCompanySize": 'Startup',
        "industryFocus": ['Web Development'],
        "preferredDuration": '6 Months',
        "gender": 'Male',
        "background": 'Rural',
        "collegeTier": 'Tier-3',
    },
    {
        "id": 5,
        "name": 'Sunita Devi',
        "email": 'sunita.d@example.com',
        "phoneNumber": "9000000005",
        "password": get_password_hash("password123"),
        "role": 'STUDENT',
        "profileImage": "https://i.pravatar.cc/150?u=sunita",
        "careerGoals": 'Product Manager and UX Strategist',
        "skills": ['Market Research', 'Agile Methodologies', 'Figma', 'Product Roadmapping'],
        "qualifications": ['MBA in Technology Management'],
        "locationPreference": 'Bangalore',
        "preferredCompanySize": 'Mid-size',
        "industryFocus": ['Artificial Intelligence'],
        "preferredDuration": '3 Months',
        "gender": 'Female',
        "background": 'Urban',
        "collegeTier": 'Tier-2',
    },
]

COMPANIES_DATA = [
    {
        "id": 1,
        "name": "InnovateAI Corp",
        "email": "hr@innovateai.com",
        "password": get_password_hash("password123"),
        "role": "COMPANY",
        "description": "Leading artificial intelligence and product engineering enterprise.",
        "website": "https://innovateai.example.com",
        "location": "Bangalore",
        "size": "Mid-size"
    },
    {
        "id": 2,
        "name": "WebSolutions Ltd",
        "email": "contact@websolutions.com",
        "password": get_password_hash("password123"),
        "role": "COMPANY",
        "description": "Next-generation cloud and web application development agency.",
        "website": "https://websolutions.example.com",
        "location": "Remote",
        "size": "Startup"
    }
]

ADMINS_DATA = [
    {
        "id": 1,
        "name": "Scheme Administrator",
        "email": "admin@scheme.gov.in",
        "password": get_password_hash("admin123"),
        "role": "ADMIN"
    }
]

INTERNSHIPS_DATA = [
    {
        "id": 1,
        "title": 'AI Product Management Intern',
        "company": 'InnovateAI Corp',
        "description": 'Work with our AI team to define and launch new product features. A great opportunity to learn about machine learning products.',
        "requiredSkills": ['Market Research', 'Agile Methodologies', 'Data Analysis', 'Product Roadmapping'],
        "location": 'Bangalore',
        "sector": 'Artificial Intelligence',
        "deadline": '2026-08-15',
        "seats": 2,
        "duration": '3 Months',
        "companySize": 'Mid-size',
        "stipend": '₹25,000 / month',
    },
    {
        "id": 2,
        "title": 'Frontend Developer Intern (React)',
        "company": 'WebSolutions Ltd.',
        "description": 'Join our frontend team to build responsive and user-friendly interfaces for our flagship products using React and TypeScript.',
        "requiredSkills": ['React', 'TypeScript', 'CSS', 'REST APIs'],
        "location": 'Remote',
        "sector": 'Web Development',
        "deadline": '2026-08-20',
        "seats": 3,
        "duration": '6 Months',
        "companySize": 'Startup',
        "stipend": '₹20,000 / month',
    },
    {
        "id": 3,
        "title": 'Data Science Intern',
        "company": 'Data Insights Inc.',
        "description": 'Analyze large datasets to extract meaningful insights and contribute to our predictive modeling projects. Must know Python.',
        "requiredSkills": ['Python', 'SQL', 'Data Analysis', 'Machine Learning'],
        "location": 'Hyderabad',
        "sector": 'Data Science',
        "deadline": '2026-08-10',
        "seats": 1,
        "duration": '4 Months',
        "companySize": 'MNC',
        "stipend": '₹30,000 / month',
    },
    {
        "id": 4,
        "title": 'Backend Developer Intern (Node.js)',
        "company": 'ServerWorks',
        "description": 'Help build and maintain our scalable backend services. Experience with Node.js and databases is a plus.',
        "requiredSkills": ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
        "location": 'Bangalore',
        "sector": 'Backend Development',
        "deadline": '2026-08-17',
        "seats": 2,
        "duration": '3 Months',
        "companySize": 'Mid-size',
        "stipend": '₹22,000 / month',
    },
]

async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[Student, Internship, Company, Admin])

    print("Clearing existing data...")
    await Student.delete_all()
    await Internship.delete_all()
    await Company.delete_all()
    await Admin.delete_all()

    print("Seeding Students...")
    for student_data in STUDENTS_DATA:
        student = Student(**student_data)
        await student.insert()
    
    print("Seeding Companies...")
    for company_data in COMPANIES_DATA:
        company = Company(**company_data)
        await company.insert()

    print("Seeding Admins...")
    for admin_data in ADMINS_DATA:
        admin = Admin(**admin_data)
        await admin.insert()

    print("Seeding Internships...")
    for internship_data in INTERNSHIPS_DATA:
        internship = Internship(**internship_data)
        await internship.insert()

    print("Database seeded successfully with valid credentials!")

if __name__ == "__main__":
    asyncio.run(seed())
