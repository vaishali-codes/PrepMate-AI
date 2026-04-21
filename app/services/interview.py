from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are PrepMate, an expert AI interviewer conducting a mock interview.
You have access to the candidate's resume. Your job is to:
1. Ask one question at a time — either technical or HR/behavioural
2. Listen to the candidate's answer
3. Give brief feedback on their answer (1-2 lines)
4. Then ask the next relevant question
5. Mix technical and HR questions naturally
6. Base technical questions on their actual resume skills and experience

Rules:
- Ask only ONE question per response
- Keep feedback short and constructive
- Be encouraging but honest
- Do not reveal you are an AI unless directly asked
- Start by greeting the candidate and asking the first question
"""

def build_messages(resume_text: str, conversation_history: list) -> list:
    messages = [
        {
            "role": "system",
            "content": f"{SYSTEM_PROMPT}\n\nCANDIDATE RESUME:\n{resume_text}"
        }
    ]
    messages.extend(conversation_history)
    return messages


def get_ai_response(resume_text: str, conversation_history: list) -> str:
    messages = build_messages(resume_text, conversation_history)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )

    return response.choices[0].message.content


def get_interview_summary(resume_text: str, conversation_history: list) -> str:
    messages = [
        {
            "role": "system",
            "content": """You are PrepMate, an expert interview coach.
            You have just completed a mock interview with a candidate.
            Review the entire conversation and provide a structured performance report with:

            1. **Overall Score** (X/10)
            2. **Strengths** (2-3 bullet points)
            3. **Areas for Improvement** (2-3 bullet points)
            4. **Best Answer** (which question they answered best and why)
            5. **Final Tip** (one actionable tip for their next interview)

            Be honest, specific, and encouraging."""
        },
        {
            "role": "user",
            "content": f"Here is the candidate's resume:\n{resume_text}\n\nHere is the full interview conversation:\n{str(conversation_history)}\n\nPlease provide the performance summary."
        }
    ]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=800
    )

    return response.choices[0].message.content