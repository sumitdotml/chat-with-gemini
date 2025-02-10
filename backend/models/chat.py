from pydantic import BaseModel
from typing import List


class Message(BaseModel):
    role: str
    content: str


class ChatSettings(BaseModel):
    temperature: float = 0.7
    maxOutputTokens: int = 4096


class ChatRequest(BaseModel):
    messages: List[Message]
    prompt: str
    settings: ChatSettings
