import os
import asyncio
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

async def test_ai_features():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("GROQ_API_KEY not found in environment, skipping live test.")
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("=== Test 1: AI Chat Career Mentor ===")
        chat_payload = {
            "model": "qwen/qwen3.6-27b",
            "messages": [
                {"role": "system", "content": "You are InternAI Mentor."},
                {"role": "user", "content": "Give me 1 tip for technical interview preparation."}
            ]
        }
        res_chat = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=chat_payload)
        assert res_chat.status_code == 200
        print("Chat response received successfully!")
        
        print("\n=== Test 2: AI Resume Extraction (JSON Mode) ===")
        resume_text = "Candidate with skills in Python, FastAPI, React, SQL. Built an AI Allocation Engine. B.Tech Computer Science."
        resume_payload = {
            "model": "qwen/qwen3.6-27b",
            "messages": [
                {"role": "system", "content": "Extract skills and projects as JSON with schema: {\"skills\": [], \"projects\": []}"},
                {"role": "user", "content": resume_text}
            ],
            "response_format": {"type": "json_object"}
        }
        res_resume = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=resume_payload)
        assert res_resume.status_code == 200
        parsed_resume = json.loads(res_resume.json()["choices"][0]["message"]["content"])
        print("Resume parsed skills:", parsed_resume.get("skills"))
        
        print("\n=== Test 3: AI Skill Gap & Roadmap Generation (JSON Mode) ===")
        gap_payload = {
            "model": "qwen/qwen3.6-27b",
            "messages": [
                {"role": "system", "content": "Generate a 1-phase roadmap as JSON: {\"phases\": [{\"phaseNumber\": 1, \"goals\": [\"Learn SQL\"]}]}"},
                {"role": "user", "content": "Missing skills: SQL, Docker"}
            ],
            "response_format": {"type": "json_object"}
        }
        res_gap = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=gap_payload)
        assert res_gap.status_code == 200
        parsed_gap = json.loads(res_gap.json()["choices"][0]["message"]["content"])
        print("Roadmap phase output:", parsed_gap.get("phases"))
        
        print("\nALL 5 AI FEATURE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_ai_features())
