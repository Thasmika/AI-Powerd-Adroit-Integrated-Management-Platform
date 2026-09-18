from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.ai_service import ai_service

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)) -> Any:
    """
    Submit a natural language query to the AI Assistant.
    """
    reply = ai_service.process_natural_language_query(request.query, db)
    return {"reply": reply}
