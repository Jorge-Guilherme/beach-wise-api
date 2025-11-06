# app/__init__.py
from fastapi import FastAPI
from app.api import status_routes

def create_app():
    app = FastAPI(
        title="Minha API de Dados",
        description="Serve dados coletados via web scraping.",
        version="0.1.0"
    )
    
    # Inclui a rota de status
    app.include_router(status_routes.router, prefix="/api/v1")
    
    return app