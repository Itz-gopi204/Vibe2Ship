import json

def is_mongo(conn):
    return hasattr(conn, "db")


def get_profile(conn):
    if is_mongo(conn):
        row = conn.db.users.find_one({"isMe": True})
        if not row:
            return None
        return {
            "id": row.get("_id"),
            "name": row.get("name"),
            "points": int(row.get("points", 0)),
            "badges": row.get("badges", []),
            "issuesCount": int(row.get("issuesCount", 0)),
            "verifiedCount": int(row.get("verifiedCount", 0)),
            "isMe": bool(row.get("isMe", False))
        }

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE isMe = 1")
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
    leaderboard = []
    if is_mongo(conn):
        rows = conn.db.users.find().sort("points", -1)
        for r in rows:
            leaderboard.append({
                "id": r.get("_id"),
                "name": r.get("name"),
                "points": int(r.get("points", 0)),
                "badges": r.get("badges", []),
                "issuesCount": int(r.get("issuesCount", 0)),
                "verifiedCount": int(r.get("verifiedCount", 0)),
                "isMe": bool(r.get("isMe", False))
            })
        return leaderboard

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY points DESC")
    rows = cursor.fetchall()
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
    if is_mongo(conn):
        me = conn.db.users.find_one({"isMe": True})
        if not me:
            return

        new_points = max(0, int(me.get("points", 0)) + points_change)
        new_verified = int(me.get("verifiedCount", 0)) + verified_change
        new_issues = int(me.get("issuesCount", 0)) + issues_change
        badges = me.get("badges", []) or []

        if badge_check_type == "issue" and new_issues >= 5 and "super-citizen" not in badges:
            badges.append("super-citizen")
        elif badge_check_type == "verify" and new_verified >= 10 and "master-verifier" not in badges:
            badges.append("master-verifier")

        conn.db.users.update_one(
            {"isMe": True},
            {"$set": {"points": new_points, "verifiedCount": new_verified, "issuesCount": new_issues, "badges": badges}}
        )
        return

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE isMe = 1")
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

    cursor.execute(
        """
        UPDATE users
        SET points = ?, verifiedCount = ?, issuesCount = ?, badges = ?
        WHERE isMe = 1
        """,
        (new_points, new_verified, new_issues, json.dumps(badges))
    )
    conn.commit()
