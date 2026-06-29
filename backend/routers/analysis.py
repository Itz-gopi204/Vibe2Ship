import os
import random
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Header
from database.connection import get_db
from repositories import issue_repository
from services import gemini_service
from utils.geo import haversine_distance
from typing import Optional

router = APIRouter(prefix="/api", tags=["analysis"])

@router.post("/analyze")
async def analyze_file(
    file: UploadFile = File(...),
    x_gemini_key: Optional[str] = Header(None)
):
    contents = await file.read()
    filename = file.filename.lower()
    
    # Save visual artifact locally to serve via static files
    os.makedirs("static", exist_ok=True)
    stored_name = f"evidence-{int(datetime.now().timestamp())}-{file.filename}"
    filepath = os.path.join("static", stored_name)
    with open(filepath, "wb") as f:
        f.write(contents)
        
    image_url = f"/api/static/{stored_name}"
    
    # Call Gemini service to analyze visual details
    analysis_res = await gemini_service.analyze_evidence(
        file_contents=contents,
        mime_type=file.content_type,
        filename=file.filename,
        custom_api_key=x_gemini_key
    )
    
    category = analysis_res["category"]
    severity = analysis_res["severity"]
    title = analysis_res["title"]
    description = analysis_res["description"]
    department = analysis_res["department"]
    dispatch_order = analysis_res["dispatch_order"]
    
    # Setup coordinates
    lat_offset = (random.random() - 0.5) * 0.015
    lng_offset = (random.random() - 0.5) * 0.015
    mock_lat = 12.9344 + lat_offset
    mock_lng = 77.6192 + lng_offset
    
    # Perform Spatial Deduplication
    conn = get_db()
    try:
        active_issues = issue_repository.get_active_issues_by_category(conn, category)
    finally:
        conn.close()
        
    duplicate_found = False
    duplicate_info = None
    min_dist = float('inf')
    
    for issue in active_issues:
        dist = haversine_distance(mock_lat, mock_lng, issue["latitude"], issue["longitude"])
        if dist <= 50.0:
            duplicate_found = True
            if dist < min_dist:
                min_dist = dist
                duplicate_info = {
                    "title": issue["title"],
                    "distance": dist,
                    "latitude": issue["latitude"],
                    "longitude": issue["longitude"]
                }
                
    # Compile multi-stage agent logs
    agent_logs = [
        {"text": "Initializing AI Civic Agent...", "type": "info"},
        {"text": "Parsing visual metadata array parameters...", "type": "info"}
    ]
    
    if analysis_res["ai_success"]:
        agent_logs.append({"text": "Google AI Studio live analysis success. Model: gemini-1.5-flash.", "type": "success"})
    else:
        agent_logs.append({"text": "Google AI Studio unavailable or skipped. Initializing local visual simulation rules...", "type": "info"})
        
    agent_logs.append({"text": f"Visual anomaly signature check completed. Class: '{category}', Severity: '{severity}'", "type": "accent"})
    agent_logs.append({"text": "Scanning active municipal database nodes for proximity duplicate reports...", "type": "info"})
    
    if duplicate_found:
        agent_logs.append({
            "text": f"[WARNING] Potential duplicate report detected! '{duplicate_info['title']}' matches category '{category}' within {duplicate_info['distance']:.1f} meters.",
            "type": "warn"
        })
    else:
        agent_logs.append({"text": "No matching duplicate reports found in a 50-meter radius. Allocating unique ticket entry ID.", "type": "success"})
        
    agent_logs.append({"text": f"Routing report ➔ {department}...", "type": "accent"})
    agent_logs.append({"text": f"Drafting automated dispatcher specifications: '{dispatch_order}'", "type": "info"})
    agent_logs.append({"text": "Agentic inspection audit complete. Pre-filling dashboard parameters for user submission.", "type": "success"})
    
    return {
        "title": title,
        "category": category,
        "severity": severity,
        "description": description,
        "latitude": mock_lat,
        "longitude": mock_lng,
        "logs": agent_logs,
        "duplicate_found": duplicate_found,
        "duplicate_info": duplicate_info,
        "department": department,
        "dispatch_order": dispatch_order,
        "image_url": image_url
    }
