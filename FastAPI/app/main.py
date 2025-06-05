# backend/app/main.py

from fastapi import FastAPI, HTTPException
from typing import List
import os

from sheets import get_sheet_data
from models import FormResponse

app = FastAPI(
    title="API de Respostas do Google Forms",
    description="Exemplo de backend em FastAPI que retorna dados de um Google Form (Google Sheets).",
    version="1.0.0"
)

# 1. Variáveis de ambiente (para evitar hardcode)
#    Defina, por exemplo, em .env ou no ambiente:
#    GOOGLE_SHEET_ID = "SEU_ID_DE_PLANILHA"
SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
WORKSHEET_NAME = os.getenv("GOOGLE_WORKSHEET_NAME", None)  # Ex: "Form Responses 1"

if not SHEET_ID:
    raise RuntimeError("A variável de ambiente GOOGLE_SHEET_ID precisa estar definida.")

@app.get("/responses", response_model=List[FormResponse])
def read_responses():
    """
    Retorna todas as respostas do Google Form como uma lista de objetos FormResponse.
    """
    try:
        # I. Busca os registros na planilha
        raw_records = get_sheet_data(spreadsheet_id=SHEET_ID, worksheet_name=WORKSHEET_NAME)
        
        # II. Converte cada dicionário para modelo Pydantic (validação automática)
        responses = [FormResponse(**record) for record in raw_records]
        
        return responses
    except Exception as e:
        # Se algo der errado (credenciais, falta de planilha, erro de parsing, etc.)
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dados: {e}")
