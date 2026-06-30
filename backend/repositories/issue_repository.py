import json
from datetime import datetime
from repositories.user_repository import update_user_points


def parse_issue_row(r):
    if not r:
        return None

    if isinstance(r, dict) or getattr(r, "_id", None) is not None:
        # MongoDB document
        return {
            "id": str(r.get("_id") if isinstance(r, dict) else r["_id"]),
            "title": r.get("title", ""),
            "description": r.get("description", ""),
            "category": r.get("category", ""),
            "severity": r.get("severity", ""),
            "status": r.get("status", "Reported"),
            "latitude": float(r.get("latitude", 0.0)),
            "longitude": float(r.get("longitude", 0.0)),
            "image": r.get("image", ""),
            "isVideo": bool(r.get("isVideo", False)),
            "reporter": r.get("reporter", ""),
            "upvotes": int(r.get("upvotes", 0)),
            "flags": int(r.get("flags", 0)),
            "timestamp": r.get("timestamp", ""),
            "verifiedBy": r.get("verifiedBy", []) or [],
            "flaggedBy": r.get("flaggedBy", []) or [],
            "history": r.get("history", []) or [],
            "proofImage": r.get("proofImage", "") or "",
            "aiResolutionFeedback": r.get("aiResolutionFeedback", "") or "",
            "priorityScore": float(r.get("priorityScore", 0.0) or 0.0),
            "estimatedCompletion": r.get("estimatedCompletion", "") or ""
        }

    # SQLite row fallback
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
        "aiResolutionFeedback": d.get("aiResolutionFeedback", "") or "",
        "priorityScore": float(d.get("priorityScore", 0.0) or 0.0),
        "estimatedCompletion": d.get("estimatedCompletion", "") or ""
    }


def is_mongo(conn):
    return hasattr(conn, "db")


def get_issues(conn):
    if is_mongo(conn):
        rows = conn.db.issues.find().sort("timestamp", -1)
        return [parse_issue_row(r) for r in rows]

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    return [parse_issue_row(r) for r in rows]


def get_issue_by_id(conn, issue_id: str):
    if is_mongo(conn):
        row = conn.db.issues.find_one({"_id": issue_id})
        return parse_issue_row(row)

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
    row = cursor.fetchone()
    return parse_issue_row(row)


def get_active_issues_by_category(conn, category: str):
    if is_mongo(conn):
        rows = conn.db.issues.find({"category": category, "status": {"$ne": "Resolved"}})
        return [parse_issue_row(r) for r in rows]

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE category = ? AND status != 'Resolved'", (category,))
    rows = cursor.fetchall()
    return [parse_issue_row(r) for r in rows]


def create_issue(conn, issue):
    issue_id = f"issue-{int(datetime.now().timestamp() * 1000)}"
    timestamp = datetime.now().isoformat()

    if is_mongo(conn):
        issue_doc = {
            "_id": issue_id,
            "title": issue.title,
            "description": issue.description,
            "category": issue.category,
            "severity": issue.severity,
            "status": "Reported",
            "latitude": issue.latitude,
            "longitude": issue.longitude,
            "image": issue.image,
            "isVideo": bool(issue.isVideo),
            "reporter": issue.reporter,
            "upvotes": 0,
            "flags": 0,
            "timestamp": timestamp,
            "verifiedBy": [],
            "flaggedBy": [],
            "history": [h.dict() for h in issue.history],
            "proofImage": "",
            "aiResolutionFeedback": "",
            "priorityScore": float(issue.priorityScore or 0.0),
            "estimatedCompletion": issue.estimatedCompletion or ""
        }
        conn.db.issues.insert_one(issue_doc)
        update_user_points(conn, points_change=25, issues_change=1, badge_check_type="issue")
        return get_issue_by_id(conn, issue_id)

    cursor = conn.cursor()
    verified_by = json.dumps([])
    flagged_by = json.dumps([])
    history_data = json.dumps([h.dict() for h in issue.history])

    cursor.execute(
        """
        INSERT INTO issues (id, title, description, category, severity, status, latitude, longitude, image, isVideo, reporter, upvotes, flags, timestamp, verifiedBy, flaggedBy, history, proofImage, aiResolutionFeedback, priorityScore, estimatedCompletion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            issue_id,
            issue.title,
            issue.description,
            issue.category,
            issue.severity,
            "Reported",
            issue.latitude,
            issue.longitude,
            issue.image,
            int(issue.isVideo),
            issue.reporter,
            0,
            0,
            timestamp,
            verified_by,
            flagged_by,
            history_data,
            "",
            "",
            issue.priorityScore if hasattr(issue, "priorityScore") else 0.0,
            issue.estimatedCompletion if hasattr(issue, "estimatedCompletion") else ""
        )
    )
    update_user_points(conn, points_change=25, issues_change=1, badge_check_type="issue")
    conn.commit()
    return get_issue_by_id(conn, issue_id)


def verify_issue(conn, issue_id: str):
    if is_mongo(conn):
        issue_doc = conn.db.issues.find_one({"_id": issue_id})
        if not issue_doc:
            return None

        verified_by = issue_doc.get("verifiedBy", []) or []
        upvotes = int(issue_doc.get("upvotes", 0))

        if "user-me" in verified_by:
            verified_by.remove("user-me")
            upvotes = max(0, upvotes - 1)
            update_user_points(conn, points_change=-10, verified_change=0)
        else:
            verified_by.append("user-me")
            upvotes += 1
            update_user_points(conn, points_change=10, verified_change=1, badge_check_type="verify")

        conn.db.issues.update_one(
            {"_id": issue_id},
            {"$set": {"verifiedBy": verified_by, "upvotes": upvotes}}
        )
        return get_issue_by_id(conn, issue_id)

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
    issue_row = cursor.fetchone()
    if not issue_row:
        return None

    verified_by = json.loads(issue_row["verifiedBy"])
    upvotes = issue_row["upvotes"]

    if "user-me" in verified_by:
        verified_by.remove("user-me")
        upvotes = max(0, upvotes - 1)
        update_user_points(conn, points_change=-10, verified_change=0)
    else:
        verified_by.append("user-me")
        upvotes += 1
        update_user_points(conn, points_change=10, verified_change=1, badge_check_type="verify")

    cursor.execute(
        """
        UPDATE issues
        SET verifiedBy = ?, upvotes = ?
        WHERE id = ?
        """,
        (json.dumps(verified_by), upvotes, issue_id)
    )
    conn.commit()
    return get_issue_by_id(conn, issue_id)


def flag_issue(conn, issue_id: str):
    if is_mongo(conn):
        issue_doc = conn.db.issues.find_one({"_id": issue_id})
        if not issue_doc:
            return None

        flagged_by = issue_doc.get("flaggedBy", []) or []
        flags = int(issue_doc.get("flags", 0))

        if "user-me" in flagged_by:
            flagged_by.remove("user-me")
            flags = max(0, flags - 1)
        else:
            flagged_by.append("user-me")
            flags += 1

        conn.db.issues.update_one(
            {"_id": issue_id},
            {"$set": {"flaggedBy": flagged_by, "flags": flags}}
        )
        return get_issue_by_id(conn, issue_id)

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
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

    cursor.execute(
        """
        UPDATE issues
        SET flaggedBy = ?, flags = ?
        WHERE id = ?
        """,
        (json.dumps(flagged_by), flags, issue_id)
    )
    conn.commit()
    return get_issue_by_id(conn, issue_id)


def advance_status(conn, issue_id: str, new_status: str = "", message: str = ""):
    status_sequence = ['Reported', 'Verified', 'Work Assigned', 'In Progress', 'Resolved']

    if is_mongo(conn):
        issue_doc = conn.db.issues.find_one({"_id": issue_id})
        if not issue_doc:
            return None

        current_status = issue_doc.get("status", "Reported")
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
                message = f"Assigned task to local municipal division for {issue_doc.get('category', '')}."
            elif next_status == 'In Progress':
                message = 'Maintenance team dispatched. Field operations are underway.'
            elif next_status == 'Resolved':
                message = 'Issue resolved. Site inspection cleared by Civic Co-pilot.'
            else:
                message = f"Status updated to {next_status}"

        history = issue_doc.get("history", []) or []
        history.append({
            "status": next_status,
            "message": message,
            "time": datetime.now().isoformat()
        })

        conn.db.issues.update_one(
            {"_id": issue_id},
            {"$set": {"status": next_status, "history": history}}
        )
        return get_issue_by_id(conn, issue_id)

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
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

    cursor.execute(
        """
        UPDATE issues
        SET status = ?, history = ?
        WHERE id = ?
        """,
        (next_status, json.dumps(history), issue_id)
    )
    conn.commit()
    return get_issue_by_id(conn, issue_id)


def resolve_issue_with_proof(conn, issue_id: str, proof_image_url: str, feedback: str, is_verified: bool):
    if is_mongo(conn):
        issue_doc = conn.db.issues.find_one({"_id": issue_id})
        if not issue_doc:
            return None

        history = issue_doc.get("history", []) or []
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

        conn.db.issues.update_one(
            {"_id": issue_id},
            {"$set": {
                "status": next_status,
                "history": history,
                "proofImage": proof_image_url,
                "aiResolutionFeedback": feedback
            }}
        )
        return get_issue_by_id(conn, issue_id)

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
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

    cursor.execute(
        """
        UPDATE issues
        SET status = ?, history = ?, proofImage = ?, aiResolutionFeedback = ?
        WHERE id = ?
        """,
        (next_status, json.dumps(history), proof_image_url, feedback, issue_id)
    )
    conn.commit()
    return get_issue_by_id(conn, issue_id)
