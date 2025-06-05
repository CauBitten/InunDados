# README.md

## Visão Geral do Projeto

Este projeto consiste em um site com frontend em React que consome dados de um formulário Google (armazenados em uma planilha Google Sheets) por meio de um backend em Python utilizando FastAPI. A aplicação obtém as respostas do formulário e as expõe como um endpoint REST, para que o frontend possa exibi-las.

A seguir, estão as instruções para que seus amigos (colaboradores) configurem corretamente o projeto após efetuarem o clone do repositório.

---

## 1. Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

1. **Git** (para clonar o repositório)
2. **Python 3.9+** (recomendado) e **pip**
3. **Node.js 16+** e **npm** (ou **yarn**) para o frontend React
4. Conta Google com acesso à Google Cloud Console para gerar credenciais de Service Account
5. Acesso de edição (ou leitura, dependendo do uso) à planilha do Google Forms

Opcionalmente, recomenda-se o uso de um ambiente virtual Python (virtualenv ou `venv`) para isolar dependências.

---

## 2. Configuração do Backend (FastAPI)

### 2.1. Clonar o Repositório

```bash
# No terminal, navegue até o diretório desejado e execute:
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO/backend
```

> **Observação:** Ajuste a URL conforme o repositório real.

### 2.2. Criar o Ambiente Virtual Python

```bash
# No diretório `backend/`, execute:
python3 -m venv venv         # Cria o virtualenv
source venv/bin/activate     # Linux/macOS
# ou
venv\Scripts\activate      # Windows

# Após ativar, você deve ver algo como: (venv) usuario@máquina backend$
```

### 2.3. Instalar Dependências Python

Com o ambiente virtual ativado:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

O arquivo `requirements.txt` contém as versões das bibliotecas necessárias:

```text
fastapi==0.100.0
uvicorn==0.24.0
gspread==5.11.0
oauth2client==4.1.3
pydantic==2.0.1
```

### 2.4. Preparar Credenciais do Google Sheets

1. No **Google Cloud Console**, crie um **projeto** (ou use um já existente) e ative a **Google Sheets API**.
2. No menu **APIs e Serviços → Credenciais**, crie uma **Service Account**.
3. Após criar, entre na conta de serviço e clique em **Chaves → Adicionar chave → Criar nova chave → JSON**.
4. Baixe o arquivo `credentials.json` gerado.
5. Renomeie, se necessário, e coloque-o na pasta `backend/` (mesmo nível de `app/`).
6. Abra a planilha do Google Forms gerada automaticamente (onde estão as respostas) e clique em "Compartilhar".

   * Insira o **client\_email** da Service Account (por exemplo: `minha-sa@meu-projeto.iam.gserviceaccount.com`) como **Leitor** (ou **Editor**, se for gravar).

> **Dica de segurança:** Nunca comite `credentials.json` em repositórios públicos. Mantenha-o sempre fora do versionamento.

### 2.5. Definir Variáveis de Ambiente

No diretório `backend/`, crie um arquivo `.env` (ou defina as variáveis no sistema operacional). As variáveis principais são:

```dotenv
# .env
GOOGLE_SHEET_ID="<ID_DA_SUA_PLANILHA>"
GOOGLE_WORKSHEET_NAME="Form Responses 1"   # ou o nome da aba correspondente
# (Opcional) Se preferir usar a variável de ambiente para o JSON de credenciais:
# GOOGLE_SERVICE_ACCOUNT_JSON="{ ... conteúdo do JSON ... }"
```

* **GOOGLE\_SHEET\_ID**: obter da URL da planilha. Exemplo de URL:
  `https://docs.google.com/spreadsheets/d/1aBcDeFGhIJKlmnOPqR_stUvWxYz_ABCdEfGhIjKlMn/edit#gid=0`. O ID é tudo entre `/d/` e `/edit`.
* **GOOGLE\_WORKSHEET\_NAME**: nome da aba onde estão as respostas (geralmente "Form Responses 1"). Se omitido, o backend buscará a primeira aba.
* **GOOGLE\_SERVICE\_ACCOUNT\_JSON**: (opcional) se não quiser salvar o arquivo local `credentials.json`, copie todo o conteúdo do JSON gerado no Console como uma string e cole nesta variável. Nesse caso, comente a configuração de `credentials.json`, pois o código irá usar o JSON da variável.

> **Importante:** Se for usar `.env`, instale e configure o pacote `python-dotenv` (já incluso no `requirements.txt` se necessário) e modifique o `main.py` para carregar as variáveis de ambiente.

### 2.6. Executar o Servidor FastAPI

1. Ative o virtualenv (caso não esteja ativo).
2. Garanta que o arquivo `credentials.json` esteja em `backend/` e que as variáveis de ambiente estejam carregadas.
3. Execute o servidor:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

* O `--reload` garante recarregamento automático quando arquivos Python forem alterados.
* Se tudo estiver configurado corretamente, ao acessar [http://localhost:8000/docs](http://localhost:8000/docs) você verá a interface do Swagger com o endpoint `/responses`.

#### 2.6.1. Testar Manualmente

Para verificar, abra o navegador ou use o `curl`:

```bash
curl http://localhost:8000/responses
```

Você deverá visualizar um array JSON com as respostas do formulário, por exemplo:

```json
[
  {
    "Timestamp": "2025-06-01T12:34:56",
    "Nome": "Ana Silva",
    "Email": "ana.silva@example.com"
  },
  {
    "Timestamp": "2025-06-02T08:20:15",
    "Nome": "Bruno Souza",
    "Email": "bruno.souza@example.com"
  }
]
```

---

## 4. Estrutura de Pastas do Projeto

```text
SEU_REPOSITORIO/
│
├── FastAPI/               # Backend FastAPI
│   ├── app/
│   │   ├── main.py        # Ponto de entrada FastAPI
│   │   ├── sheets.py
│   │   └── models.py
│   ├── credentials.json   # Arquivo de credenciais (não comitar)
│   ├── requirements.txt
│   └── .env               # Variáveis de ambiente (opcional)
│
└── React/                 # Frontend React
    ├── public/
    ├── src/
    │   ├── App.jsx
    │   ├── index.jsx
    │   └── components/    # Componentes React
    ├── .env               # Variáveis do React (REACT_APP_API_URL)
    ├── package.json
    └── ...
```

> **Importante:**
>
> * Mantenha o `credentials.json` no diretório `backend/` apenas localmente. Não inclua no controle de versão (adicione ao `.gitignore`).
> * Se decidir usar a variável `GOOGLE_SERVICE_ACCOUNT_JSON`, ajuste `sheets_client.py` para ler dessa variável em vez do arquivo físico.

---

## 5. Como Submeter Alterações e Colaborar

1. Crie uma **branch** para suas modificações:

   ```bash
   git checkout -b minha-feature
   ```

2. Faça commits claros e concisos, sempre descrevendo o que mudou:

   ```bash
   git add .
   git commit -m "Adiciona endpoint adicional, aprimora validações"
   ```

3. Envie a branch para o repositório remoto:

   ```bash
   git push origin minha-feature
   ```

4. Abra um **Pull Request** (PR) descrevendo as mudanças, por que foram feitas e testes realizados.

> **Dica:** Utilize issues no GitHub/GitLab para discutir novas funcionalidades ou bugs antes de implementá-los.

---
