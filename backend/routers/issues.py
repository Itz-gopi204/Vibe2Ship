import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Header
from database.connection import get_db
from repositories import issue_repository
from models.schemas import IssueResponse, IssueCreate
from services import gemini_service
from typing import List, Optional

router = APIRouter(prefix="/api", tags=["issues"])

@router.get("/issues", response_model=List[IssueResponse])
def get_issues():
    conn = get_db()
    try:
        return issue_repository.get_issues(conn)
    finally:
        conn.close()

@router.post("/issues", response_model=IssueResponse)
def create_issue(issue: IssueCreate):
    conn = get_db()
    try:
        return issue_repository.create_issue(conn, issue)
    finally:
        conn.close()

@router.post("/issues/{issue_id}/verify", response_model=IssueResponse)
def verify_issue(issue_id: str):
    conn = get_db()
    try:
        updated = issue_repository.verify_issue(conn, issue_id)
        if not updated:
            raise HTTPException(status_code=404, detail="Issue not found")
        return updated
    finally:
        conn.close()

@router.post("/issues/{issue_id}/flag", response_model=IssueResponse)
def flag_issue(issue_id: str):
    conn = get_db()
    try:
        updated = issue_repository.flag_issue(conn, issue_id)
        if not updated:
            raise HTTPException(status_code=404, detail="Issue not found")
        return updated
    finally:
        conn.close()

@router.post("/issues/{issue_id}/advance", response_model=IssueResponse)
def advance_status(issue_id: str):
    conn = get_db()
    try:
        updated = issue_repository.advance_status(conn, issue_id)
        if not updated:
            raise HTTPException(status_code=404, detail="Issue not found")
        return updated
    finally:
        conn.close()

@router.post("/issues/{issue_id}/resolve", response_model=IssueResponse)
async def resolve_issue(
    issue_id: str,
    file: UploadFile = File(...),
    x_gemini_key: Optional[str] = Header(None)
):
    conn = get_db()
    try:
        issue = issue_repository.get_issue_by_id(conn, issue_id)
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
            
        contents = await file.read()
        
        # Save file to static directory
        os.makedirs("static", exist_ok=True)
        filename = f"proof-{issue_id}-{int(datetime.now().timestamp())}-{file.filename}"
        filepath = os.path.join("static", filename)
        with open(filepath, "wb") as f:
            f.write(contents)
            
        proof_image_url = f"/api/static/{filename}"
        
        # Call Gemini service to verify proof
        api_key = x_gemini_key or os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
        
        audit_result = await gemini_service.verify_repair_proof(
            original_title=issue["title"],
            original_desc=issue["description"],
            file_contents=contents,
            mime_type=file.content_type,
            filename=file.filename,
            custom_api_key=api_key
        )
        
        verified = audit_result["verified"]
        feedback = audit_result["feedback"]
        
        # Save details to database and update status
        updated_issue = issue_repository.resolve_issue_with_proof(
            conn, issue_id, proof_image_url, feedback, verified
        )
        return updated_issue
    finally:
        conn.close()
