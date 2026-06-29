from fastapi import APIRouter, HTTPException, Depends
from database.connection import get_db
from repositories import user_repository
from models.schemas import UserResponse
from typing import List

router = APIRouter(prefix="/api", tags=["users"])

@router.get("/leaderboard", response_model=List[UserResponse])
def get_leaderboard():
    conn = get_db()
    try:
        leaders = user_repository.get_leaderboard(conn)
        return leaders
    finally:
        conn.close()

@router.get("/profile", response_model=UserResponse)
def get_profile():
    conn = get_db()
    try:
        profile = user_repository.get_profile(conn)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    finally:
        conn.close()
