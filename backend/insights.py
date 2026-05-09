import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)


def generate_insights(metrics):
    prompt = f"""
You are a business analyst helping a small e-commerce store owner.

Based on the KPI data below, write 3 short business insights.

Rules:
- Use plain English.
- Be practical.
- Focus on what a business owner should do next.
- Do not use technical jargon.
- Return the answer as 3 bullet points only.

KPI data:
{metrics}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt
        )

        text = response.text.strip()

        insights = [
            line.strip("- ").strip()
            for line in text.split("\n")
            if line.strip()
        ]

        return insights

    except Exception as e:
        return [
            "AI insights are currently unavailable.",
            f"Reason: {str(e)}"
        ]