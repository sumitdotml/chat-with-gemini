from abc import ABC, abstractmethod
from typing import AsyncGenerator


class BaseModel(ABC):
    @abstractmethod
    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        pass
