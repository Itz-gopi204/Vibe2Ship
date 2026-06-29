import json
from datetime import datetime
from database.connection import format_query
from repositories.user_repository import update_user_points

def parse_issue_row(r):
    if not r:
        return None
    d = dict(r)
    return {
        "id": d["id"],
        "title": d["title"],
        "description": d["description"],
        "category": d["category"],
        "severity": d["severity"],
        "status": d["status"],
        "latitude": d["latitude"],
        "longitude": d["longitude"],
        "image": d["image"],
        "isVideo": bool(d["isVideo"]),
        "reporter": d["reporter"],
        "upvotes": d["upvotes"],
        "flags": d["flags"],
        "timestamp": d["timestamp"],
        "verifiedBy": json.loads(d["verifiedBy"]),
        "flaggedBy": json.loads(d["flaggedBy"]),
        "history": json.loads(d["history"]),
        "proofImage": d.get("proofImage", "") or "",
        "aiResolutionFeedback": d.get("aiResolutionFeedback", "") or ""
    }

def get_issues(conn):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM issues ORDER BY timestamp DESC"))
    rows = cursor.fetchall()
    return [parse_issue_row(r) for r in rows]

def get_issue_by_id(conn, issue_id: str):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM issues WHERE id = ?"), (issue_id,))
    row = cursor.fetchone()
    return parse_issue_row(row)

def get_active_issues_by_category(conn, category: str):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM issues WHERE category = ? AND status != 'Resolved'"), (category,))
    rows = cursor.fetchall()
    return [parse_issue_row(r) for r in rows]

def create_issue(conn, issue):
    cursor = conn.cursor()
    issue_id = f"issue-{int(datetime.now().timestamp() * 1000)}"
    timestamp = datetime.now().isoformat()
    
    verified_by = json.dumps([])
    flagged_by = json.dumps([])
    history_data = json.dumps([h.dict() for h in issue.history])
    
    cursor.execute(format_query("""
    INSERT INTO issues (id, title, description, category, severity, status, latitude, longitude, image, isVideo, reporter, upvotes, flags, timestamp, verifiedBy, flaggedBy, history, proofImage, aiResolutionFeedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """), (
        issue_id, issue.title, issue.description, issue.category, issue.severity, "Reported",
        issue.latitude, issue.longitude, issue.image, int(issue.isVideo), issue.reporter,
        0, 0, timestamp, verified_by, flagged_by, history_data, "", ""
    ))
    
    # Award points (25 pts for reporting)
    update_user_points(conn, points_change=25, issues_change=1, badge_check_type="issue")
    
    conn.commit()
    return get_issue_by_id(conn, issue_id)

def verify_issue(conn, issue_id: str):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM issues WHERE id = ?"), (issue_id,))
    issue_row = cursor.fetchone()
    if not issue_row:
        return None
        
    verified_by = json.loads(issue_row["verifiedBy"])
    upvotes = issue_row["upvotes"]
    
    if "user-me" in verified_by:
        # Remove verification
        verified_by.remove("user-me")
        upvotes = max(0, upvotes - 1)
        update_user_points(conn, points_change=-10, verified_change=0)
    else:
        # Add verification
        verified_by.append("user-me")
        upvotes += 1
        update_user_points(conn, points_change=10, verified_change=1, badge_check_type="verify")
        
    cursor.execute(format_query("""
    UPDATE issues
    SET verifiedBy = ?, upvotes = ?
    WHERE id = ?
    """), (json.dumps(verified_by), upvotes, issue_id))
    conn.commit()
    
    return get_issue_by_id(conn, issue_id)

def flag_issue(conn, issue_id: str):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM issues WHERE id = ?"), (issue_id,))
    issue_row = cursor.fetchone()
    if not issue_row:
        return None
        
    flagged_by = json.loads(issue_row["flaggedBy"])
    flags = issue_row["flags"]
    
    if "user-me" in flagged_by:
        flagged_by.remove("user-me")
        flags = max(0, flags - 1)
    else:
        flagged_by.append("user-me")
        flags += 1
        
    cursor.execute(format_query("""
    UPDATE issues
    SET flaggedBy = ?, flags = ?
    WHERE id = ?
    """), (json.dumps(flagged_by), flags, issue_id))
    conn.commit()
    
    return get_issue_by_id(conn, issue_id)

def advance_status(conn, issue_id: str, new_status: str = "", message: str = ""):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM issues WHERE id = ?"), (issue_id,))
    issue_row = cursor.fetchone()
    if not issue_row:
        return None
        
    status_sequence = ['Reported', 'Verified', 'Work Assigned', 'In Progress', 'Resolved']
    current_status = issue_row["status"]
    
    if not new_status:
        current_idx = status_sequence.index(current_status)
        if current_idx == len(status_sequence) - 1:
            return get_issue_by_id(conn, issue_id)
        next_status = status_sequence[current_idx + 1]
    else:
        next_status = new_status
        
    if not message:
        if next_status == 'Verified':
            message = 'AI Civic Agent verified report. Geolocation verified by local mesh analysis.'
        elif next_status == 'Work Assigned':
            message = f"Assigned task to local municipal division for {issue_row['category']}."
        elif next_status == 'In Progress':
            message = 'Maintenance team dispatched. Field operations are underway.'
        elif next_status == 'Resolved':
            message = 'Issue resolved. Site inspection cleared by Civic Co-pilot.'
        else:
            message = f"Status updated to {next_status}"
            
    history = json.loads(issue_row["history"])
    history.append({
        "status": next_status,
        "message": message,
        "time": datetime.now().isoformat()
    })
    
    cursor.execute(format_query("""
    UPDATE issues
    SET status = ?, history = ?
    WHERE id = ?
    """), (next_status, json.dumps(history), issue_id))
    conn.commit()
    
    return get_issue_by_id(conn, issue_id)

def resolve_issue_with_proof(conn, issue_id: str, proof_image_url: str, feedback: str, is_verified: bool):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM issues WHERE id = ?"), (issue_id,))
    issue_row = cursor.fetchone()
    if not issue_row:
        return None
        
    history = json.loads(issue_row["history"])
    
    if is_verified:
        next_status = 'Resolved'
        log_message = f"[AI CERTIFIED RESOLUTION] Gemini Agent confirmed: {feedback}"
    else:
        next_status = 'In Progress'
        log_message = f"[AI REJECTED RESOLUTION] Gemini Agent flagged issues: {feedback}"
        
    history.append({
        "status": next_status,
        "message": log_message,
        "time": datetime.now().isoformat()
    })
    
    cursor.execute(format_query("""
    UPDATE issues
    SET status = ?, history = ?, proofImage = ?, aiResolutionFeedback = ?
    WHERE id = ?
    """), (next_status, json.dumps(history), proof_image_url, feedback, issue_id))
    conn.commit()
    
    return get_issue_by_id(conn, issue_id)
