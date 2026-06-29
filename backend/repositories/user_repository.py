import json
from database.connection import format_query

def get_profile(conn):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM users WHERE isMe = 1"))
    row = cursor.fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "points": row["points"],
        "badges": json.loads(row["badges"]),
        "issuesCount": row["issuesCount"],
        "verifiedCount": row["verifiedCount"],
        "isMe": bool(row["isMe"])
    }

def get_leaderboard(conn):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM users ORDER BY points DESC"))
    rows = cursor.fetchall()
    leaderboard = []
    for r in rows:
        leaderboard.append({
            "id": r["id"],
            "name": r["name"],
            "points": r["points"],
            "badges": json.loads(r["badges"]),
            "issuesCount": r["issuesCount"],
            "verifiedCount": r["verifiedCount"],
            "isMe": bool(r["isMe"])
        })
    return leaderboard

def update_user_points(conn, points_change: int, verified_change: int = 0, issues_change: int = 0, badge_check_type: str = ""):
    cursor = conn.cursor()
    cursor.execute(format_query("SELECT * FROM users WHERE isMe = 1"))
    me = cursor.fetchone()
    if not me:
        return
    
    new_points = max(0, me["points"] + points_change)
    new_verified = me["verifiedCount"] + verified_change
    new_issues = me["issuesCount"] + issues_change
    
    badges = json.loads(me["badges"])
    if badge_check_type == "issue" and new_issues >= 5 and "super-citizen" not in badges:
        badges.append("super-citizen")
    elif badge_check_type == "verify" and new_verified >= 10 and "master-verifier" not in badges:
        badges.append("master-verifier")
        
    cursor.execute(format_query("""
    UPDATE users
    SET points = ?, verifiedCount = ?, issuesCount = ?, badges = ?
    WHERE isMe = 1
    """), (new_points, new_verified, new_issues, json.dumps(badges)))
    conn.commit()
