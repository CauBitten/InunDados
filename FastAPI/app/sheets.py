# backend/app/sheets_client.py

import os
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from typing import List, Dict

# 1. Definimos o escopo de permissões: apenas leitura/edit se necessário.
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]  # ou "https://www.googleapis.com/auth/spreadsheets" para leitura/escrita

# 2. Carrega as credenciais do arquivo JSON e autentica com o Google.
def get_gspread_client(credentials_path: str = "credentials.json") -> gspread.Client:
    """
    Retorna um cliente gspread autenticado usando credenciais de service account.
    """
    # I. Carrega o arquivo JSON de credenciais
    creds_dict = json.load(open(credentials_path, "r"))
    
    # II. Cria credenciais do tipo ServiceAccount com o escopo desejado
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, SCOPES)
    
    # III. Autentica e retorna o cliente
    client = gspread.authorize(credentials)
    return client

# 3. Recupera parâmetros da planilha (spreadsheet)
def get_sheet_data(
    spreadsheet_id: str,
    worksheet_name: str = None
) -> List[Dict[str, str]]:
    """
    Busca todos os dados de uma worksheet dentro de um spreadsheet e
    retorna como lista de dicionários (cada dicionário é uma linha).
    - spreadsheet_id: ID do Google Sheets (parte da URL https://docs.google.com/spreadsheets/d/<ID>/edit)
    - worksheet_name: nome da aba (caso não seja informado, pega a primeira aba).
    
    Retorno: 
      [
        { "Timestamp": "2025-06-01 12:34:56", "Nome": "Fulano", "Email": "fulano@example.com", ... },
        { ... },
        ...
      ]
    """
    # I. Obtém cliente autenticado
    client = get_gspread_client()
    
    # II. Abre a planilha pelo ID
    spreadsheet = client.open_by_key(spreadsheet_id)
    
    # III. Seleciona a worksheet (caso não informe, pega a primeira)
    worksheet = spreadsheet.worksheet(worksheet_name) if worksheet_name else spreadsheet.get_worksheet(0)
    
    # IV. Obtém todos os registros como lista de dicionários
    records = worksheet.get_all_records()  # já retorna list[dict]
    
    return records

# Exemplo de uso (para testar localmente; não será executado no servidor)
if __name__ == "__main__":
    # Substitua pelo seu ID real de planilha
    TEST_SPREADSHEET_ID = "SEU_SPREADSHEET_ID_AQUI"
    # Se quiser especificar o nome da aba: "Form Responses 1"
    dados = get_sheet_data(TEST_SPREADSHEET_ID, worksheet_name="Form Responses 1")
    print(f"Total de linhas obtidas: {len(dados)}")
    # Exibe a primeira linha como exemplo
    if dados:
        print("Exemplo de registro:", dados[0])
