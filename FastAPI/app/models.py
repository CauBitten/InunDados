# backend/app/models.py

from pydantic import BaseModel, EmailStr
from datetime import datetime

class FormResponse(BaseModel):
    Timestamp: datetime
    Nome: str
    Email: EmailStr
    # Adicione aqui outros campos que seu formulário tiver:
    # Por exemplo:
    # Idade: int
    # Comentario: str
