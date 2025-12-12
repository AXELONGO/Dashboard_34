import google.generativeai as genai
import os
import json
from typing import List, Dict, Any

class AIService:
    def __init__(self):
        # Access key directly from environment (no VITE_ prefix needed on backend)
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')

    async def generate_leads(self, location: str) -> List[Dict[str, Any]]:
        if not self.model:
            return []

        prompt = f"""
        Generate 3 fictional but realistic business leads located in {location}.
        Ensure the phone numbers are formatted for the region.
        The category must be one of: 'Transporte', 'Software', 'Consultoría', 'Industrial', or 'Otros'.
        
        Return ONLY a raw JSON array. Do not include markdown formatting like ```json ... ```.
        The JSON objects must have this exact structure:
        {{
            "name": "string",
            "address": "string",
            "phone": "string",
            "website": "string",
            "category": "string"
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Basic cleanup if markdown backticks are still present
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "")
            elif text.startswith("```"):
                text = text.replace("```", "")
                
            return json.loads(text)
        except Exception as e:
            print(f"Error generating leads with Gemini: {e}")
            return []
