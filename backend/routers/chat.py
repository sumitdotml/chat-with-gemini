from fastapi import APIRouter, HTTPException
import json
from fastapi.responses import StreamingResponse
from models.gemini import GeminiModel
from models.chat import ChatRequest

router = APIRouter()
model = GeminiModel()


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Convert previous messages to format Gemini expects
        conversation_history = "\n".join(
            [
                f"{msg.role}: {msg.content}"
                for msg in request.messages[:-1]  # Exclude the latest message
            ]
        )

        # Combine history with current prompt
        full_prompt = f"{conversation_history}\nUser: {request.prompt}"

        async def generate():
            try:
                async for chunk in model.generate_stream(
                    full_prompt,
                    temperature=request.settings.temperature,
                    max_output_tokens=request.settings.maxOutputTokens,
                ):
                    yield f"data: {json.dumps({'text': chunk})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
