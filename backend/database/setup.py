import json
from datetime import datetime
import config
from database.connection import get_db

SEED_ISSUES = [
    {
        "_id": "issue-1",
        "title": "Major Pothole on Inner Ring Road",
        "description": "A deep pothole is causing severe traffic congestion and endangering motorcyclists near the Koramangala flyover. Needs immediate patching.",
        "category": "Road Damage",
        "severity": "High",
        "status": "In Progress",
        "latitude": 12.9344,
        "longitude": 77.6192,
        "image": "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
        "isVideo": 0,
        "reporter": "Rahul Sharma",
        "upvotes": 24,
        "flags": 0,
        "timestamp": datetime.now().isoformat(),
        "verifiedBy": ["user-123"],
        "flaggedBy": [],
        "history": [
            {"status": "Reported", "message": "Issue registered by Rahul Sharma. Gemini AI routed ticket to Department of Public Works (Roads Division).", "time": datetime.now().isoformat()},
            {"status": "Verified", "message": "AI Civic Agent verified report. Geolocation matches traffic patterns.", "time": datetime.now().isoformat()},
            {"status": "Work Assigned", "message": "Dispatched to Department of Transportation (Road Maintenance Div 4).", "time": datetime.now().isoformat()},
            {"status": "In Progress", "message": "Maintenance team dispatched. Patch work scheduled.", "time": datetime.now().isoformat()}
        ],
        "proofImage": "",
        "aiResolutionFeedback": "",
        "priorityScore": 0.0,
        "estimatedCompletion": ""
    },
    {
        "_id": "issue-2",
        "title": "Broken Streetlight Panel - 5th Cross",
        "description": "Entire row of streetlights is dark, making the street unsafe for pedestrians after 7 PM. Possible wiring damage in the junction box.",
        "category": "Public Utilities",
        "severity": "Medium",
        "status": "Resolved",
        "latitude": 12.9372,
        "longitude": 77.6210,
        "image": "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600",
        "isVideo": 0,
        "reporter": "Priya Nair",
        "upvotes": 15,
        "flags": 0,
        "timestamp": datetime.now().isoformat(),
        "verifiedBy": [],
        "flaggedBy": [],
        "history": [
            {"status": "Reported", "message": "Issue registered by Priya Nair. Gemini AI routed ticket to City Power & Grid Operations.", "time": datetime.now().isoformat()},
            {"status": "Verified", "message": "AI Civic Agent verified. Report matches local grid nodes.", "time": datetime.now().isoformat()},
            {"status": "Work Assigned", "message": "Dispatched to Electricity Board (Area 2 Grid Operations).", "time": datetime.now().isoformat()},
            {"status": "In Progress", "message": "Crew replacing street lamp ballast and check cables.", "time": datetime.now().isoformat()},
            {"status": "Resolved", "message": "Bulbs replaced, circuit tested. Streetlights are fully operational.", "time": datetime.now().isoformat()}
        ],
        "proofImage": "",
        "aiResolutionFeedback": "",
        "priorityScore": 0.0,
        "estimatedCompletion": ""
    },
    {
        "_id": "issue-3",
        "title": "Overflowing Garbage Bin - Koramangala",
        "description": "Commercial waste has piled up outside the designated bin, blocking the pedestrian pathway and attracting stray dogs and flies.",
        "category": "Waste Management",
        "severity": "Critical",
        "status": "Reported",
        "latitude": 12.9312,
        "longitude": 77.6150,
        "image": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
        "isVideo": 0,
        "reporter": "Amit Khare",
        "upvotes": 8,
        "flags": 0,
        "timestamp": datetime.now().isoformat(),
        "verifiedBy": [],
        "flaggedBy": [],
        "history": [
            {"status": "Reported", "message": "Issue registered by Amit Khare. Multimodal analysis confirms commercial waste. Assigned to Municipal Sanitation & Waste Control.", "time": datetime.now().isoformat()}
        ],
        "proofImage": "",
        "aiResolutionFeedback": "",
        "priorityScore": 0.0,
        "estimatedCompletion": ""
    }
]

SEED_USERS = [
    {"_id": "user-1", "name": "Karan Mehra", "points": 340, "badges": ["super-citizen", "pothole-hunter"], "issuesCount": 15, "verifiedCount": 22, "isMe": False},
    {"_id": "user-2", "name": "Priya Nair", "points": 260, "badges": ["reporter-badge", "green-activist"], "issuesCount": 9, "verifiedCount": 14, "isMe": False},
    {"_id": "user-3", "name": "Amit Khare", "points": 195, "badges": ["verify-badge"], "issuesCount": 6, "verifiedCount": 9, "isMe": False},
    {"_id": "user-me", "name": "Aarav Patel (You)", "points": 180, "badges": ["reporter-badge", "verify-badge"], "issuesCount": 4, "verifiedCount": 7, "isMe": True},
    {"_id": "user-5", "name": "Siddharth Sen", "points": 120, "badges": ["reporter-badge"], "issuesCount": 3, "verifiedCount": 5, "isMe": False}
]


def init_db():
    conn = get_db()
    if hasattr(conn, "db"):
        db = conn.db
        db.issues.create_index("category")
        db.issues.create_index("status")
        db.issues.create_index("timestamp")
        db.users.create_index("isMe")
        db.users.create_index("points")

        if db.issues.count_documents({}) == 0:
            db.issues.insert_many(SEED_ISSUES)

        if db.users.count_documents({}) == 0:
            db.users.insert_many(SEED_USERS)

        conn.close()
        return

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS issues (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT,
        description TEXT,
        category TEXT,
        severity TEXT,
        status TEXT,
        latitude REAL,
        longitude REAL,
        image TEXT,
        isVideo INTEGER,
        reporter TEXT,
        upvotes INTEGER,
        flags INTEGER,
        timestamp TEXT,
        verifiedBy TEXT,
        flaggedBy TEXT,
        history TEXT,
        proofImage TEXT,
        aiResolutionFeedback TEXT,
        priorityScore REAL,
        estimatedCompletion TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        points INTEGER,
        badges TEXT,
        issuesCount INTEGER,
        verifiedCount INTEGER,
        isMe INTEGER
    )
    """)

    try:
        cursor.execute("ALTER TABLE issues ADD COLUMN proofImage TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE issues ADD COLUMN aiResolutionFeedback TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE issues ADD COLUMN priorityScore REAL")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE issues ADD COLUMN estimatedCompletion TEXT")
    except Exception:
        pass

    cursor.execute("SELECT COUNT(*) FROM issues")
    if cursor.fetchone()[0] == 0:
        for issue in SEED_ISSUES:
            cursor.execute(
                """
                INSERT INTO issues (id, title, description, category, severity, status, latitude, longitude, image, isVideo, reporter, upvotes, flags, timestamp, verifiedBy, flaggedBy, history, proofImage, aiResolutionFeedback, priorityScore, estimatedCompletion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    issue["_id"], issue["title"], issue["description"], issue["category"], issue["severity"], issue["status"],
                    issue["latitude"], issue["longitude"], issue["image"], issue["isVideo"], issue["reporter"], issue["upvotes"],
                    issue["flags"], issue["timestamp"], json.dumps(issue["verifiedBy"]), json.dumps(issue["flaggedBy"]), json.dumps(issue["history"]),
                    issue["proofImage"], issue["aiResolutionFeedback"], issue["priorityScore"], issue["estimatedCompletion"]
                )
            )

    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        for usr in SEED_USERS:
            cursor.execute(
                """
                INSERT INTO users (id, name, points, badges, issuesCount, verifiedCount, isMe)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (usr["_id"], usr["name"], usr["points"], json.dumps(usr["badges"]), usr["issuesCount"], usr["verifiedCount"], int(usr["isMe"]))
            )

    conn.commit()
    conn.close()


def run_setup():
    try:
        init_db()
        print("Database schemas setup complete.")
    except Exception as e:
        print(f"Error during setup setup_db: {e}")
        print("Falling back to local SQLite schema...")
        config.IS_MONGODB = False
        init_db()
