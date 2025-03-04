import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()


class GeminiModel:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash")
        self.chat = self.model.start_chat(history=[])

    async def generate_stream(
        self,
        prompt: str,
        temperature: float = 0.7,
        top_p: float = 0.95,
        max_output_tokens: int = 8192,
    ):
        response = self.model.generate_content(
            prompt,
            stream=True,
            generation_config={
                "temperature": temperature,
                "top_p": top_p,
                "top_k": 40,
                "max_output_tokens": max_output_tokens,
            },
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text
