# main.py
from app import create_app

app = create_app()

@app.get("/")
def read_root():
    return {"message": "Acesse /docs para a documentação da API."}