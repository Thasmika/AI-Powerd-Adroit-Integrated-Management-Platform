import re
import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_groq_client() -> Groq:
    """Lazy-initialize the Groq client so a missing/invalid key produces a
    clean error message instead of crashing the backend on startup."""
    return Groq(api_key=settings.GROQ_API_KEY)

DB_SCHEMA_PROMPT = """
You are an AI assistant that translates natural language questions into SQL queries.
The database is PostgreSQL. Use only SELECT statements. Never modify data.

CRITICAL PostgreSQL Rules:
- Current date: CURRENT_DATE
- Current time: NOW()
- You may use INTERVAL (e.g., NOW() - INTERVAL '30 days')
- You may use :: for type casting (e.g., column::date)

Here is the schema:

Table: employees
- id (Integer)
- employee_id (String, e.g. EMP 0115)
- first_name (String)
- last_name (String)
- nationality (String)
- date_of_birth (Date)
- contact_number (String)
- employment_status (String, e.g. Active, Inactive)
- designation (String)
- joining_date (Date)
- department_id (Integer)
- is_active (Boolean)

Table: assets
- id (Integer)
- fleet_number (String)
- registration_number (String)
- category (String, e.g. Heavy Vehicle, Light Vehicle)
- make_model (String)
- year (Integer)
- color (String)
- operational_status (String, e.g. Active, Inactive)
- is_active (Boolean)

Table: document_types
- id (Integer)
- name (String, e.g. Passport, Visa, Vehicle Registration)
- module (String, HR or Fleet)

Table: employee_documents
- id (Integer)
- employee_id (Integer, FK to employees)
- document_type_id (Integer, FK to document_types)
- document_number (String)
- issue_date (Date)
- expiry_date (Date)
- status (String, e.g. VALID, RENEWAL DUE, EXPIRED)

Table: asset_documents
- id (Integer)
- asset_id (Integer, FK to assets)
- document_type_id (Integer, FK to document_types)
- expiry_date (Date)
- status (String)

IMPORTANT: Respond ONLY with a valid raw SQL SELECT query.
No markdown, no backticks, no explanations, no reasoning text.
The response must start with the word SELECT.
"""


def _extract_sql(raw: str) -> str:
    """
    Robustly extract the first SELECT statement from a model response,
    handling verbose reasoning models like groq/compound that prepend
    explanation text before the actual SQL.
    """
    # 1. Strip markdown code fences (```sql ... ``` or ``` ... ```)
    raw = re.sub(r"```(?:sql)?", "", raw, flags=re.IGNORECASE).strip()

    # 2. Try to find a SELECT statement anywhere in the response using regex
    #    This handles cases where the model outputs reasoning before the SQL.
    match = re.search(r"(SELECT\b.+?)(?:;?\s*$)", raw, re.IGNORECASE | re.DOTALL)
    if match:
        sql = match.group(1).strip()
        # Trim any trailing prose after a semicolon or newline+text block
        sql = re.split(r";\s*\n|;\s*$", sql)[0].strip()
        return sql + ";"

    # 3. Fallback: return as-is so the SELECT check below can reject it cleanly
    return raw.strip()


class AIService:
    @staticmethod
    def process_natural_language_query(query: str, db: Session) -> str:
        try:
            client = _get_groq_client()

            # ── Step 1: NL → SQL ─────────────────────────────────────────────
            sql_response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": DB_SCHEMA_PROMPT},
                    {"role": "user", "content": query},
                ],
                model=settings.GROQ_SQL_MODEL,
                temperature=0.1,
            )

            raw_sql = sql_response.choices[0].message.content.strip()
            sql = _extract_sql(raw_sql)

            logger.info("Generated SQL: %s", sql)

            # Security guard: only allow SELECT statements
            if not sql.strip().lower().startswith("select"):
                return (
                    "I can only process read-only queries (SELECT). "
                    "Please rephrase your question."
                )



            # ── Step 2: Execute SQL ───────────────────────────────────────────
            result = db.execute(text(sql))
            rows = result.fetchall()

            if not rows:
                data_string = "No results found for the given query."
            else:
                data_string = "\n".join(
                    [str(dict(row._mapping)) for row in rows]
                )

            # ── Step 3: SQL results → Natural Language ────────────────────────
            nl_response = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful business assistant. "
                            "Use the provided database query results to answer "
                            "the user's question clearly and concisely. "
                            "Present numbers and lists in a readable format."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"User Question: {query}\n\n"
                            f"Database Results:\n{data_string}"
                        ),
                    },
                ],
                model=settings.GROQ_NL_MODEL,
                temperature=0.5,
            )

            return nl_response.choices[0].message.content.strip()

        except Exception as e:
            logger.error("AI service error: %s", str(e), exc_info=True)
            return f"An error occurred while processing your request: {str(e)}"


ai_service = AIService()
