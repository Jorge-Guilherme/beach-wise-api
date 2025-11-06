# app/api/status_routes.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/status", tags=["Status"])
def get_status():
    return {"status": "ok", "message": "API runing"}