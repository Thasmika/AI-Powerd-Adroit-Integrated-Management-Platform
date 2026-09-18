"""
Governance / AI — AI Interaction Audit Log.

Records every prompt sent to an AI provider and the response received.
Rows are append-only — never update or delete.
Privacy: filter response before storing if it may contain PII.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class AIInteraction(Base):
    """
    Immutable record of a single AI request/response cycle.

    Fields
    ------
    session_id      : Client-supplied UUID grouping multi-turn chat.
    module          : 'HR' | 'FLEET' | 'SYSTEM' — which module triggered the query.
    entity_type     : Optional context entity class name (e.g. 'Employee', 'Asset').
    entity_id       : Optional PK of the context entity.
    model_used      : LLM model identifier e.g. "groq/compound".
    prompt_tokens   : Token count for the prompt (from provider response).
    completion_tokens: Token count for the completion.
    latency_ms      : Round-trip time in milliseconds.
    """
    __tablename__ = "ai_interactions"

    id = Column(Integer, primary_key=True, index=True)

    # Who / when
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String, nullable=True, index=True)       # UUID grouping multi-turn chat
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Context
    module = Column(String, nullable=False, index=True)          # HR | FLEET | SYSTEM
    entity_type = Column(String, nullable=True)                  # Employee | Asset | LeaveRequest
    entity_id = Column(Integer, nullable=True)

    # Payload
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=True)                       # Null if provider errored
    model_used = Column(String, nullable=True)                   # e.g. groq/compound

    # Telemetry
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)

    # Outcome
    success = Column(Integer, default=1, nullable=False)         # 1 = OK, 0 = error
    error_message = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
