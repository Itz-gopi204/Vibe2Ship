import json
from datetime import datetime
import config
from database.connection import get_db, format_query

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create Issues Table (Compatible with PostgreSQL and SQLite)
    # Includes proofImage and aiResolutionFeedback for AI repair verification
    cursor.execute(format_query("""
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
    """))
    
    # Create Users Table
    cursor.execute(format_query("""
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        points INTEGER,
        badges TEXT,
        issuesCount INTEGER,
        verifiedCount INTEGER,
        isMe INTEGER
    )
    """))
    
    # Auto-migration Alter Queries to upgrade older SQLite tables
    try:
        cursor.execute(format_query("ALTER TABLE issues ADD COLUMN proofImage TEXT"))
    except Exception:
        pass
    try:
        cursor.execute(format_query("ALTER TABLE issues ADD COLUMN aiResolutionFeedback TEXT"))
    except Exception:
        pass
    try:
        cursor.execute(format_query("ALTER TABLE issues ADD COLUMN priorityScore REAL"))
    except Exception:
        pass
    try:
        cursor.execute(format_query("ALTER TABLE issues ADD COLUMN estimatedCompletion TEXT"))
    except Exception:
        pass
    
    # Check if database is empty to seed initial data
    cursor.execute(format_query("SELECT COUNT(*) FROM issues"))
    if cursor.fetchone()[0] == 0:
        # Seed Issues
        seed_issues = [
            {
                "id": "issue-1",
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
                "verifiedBy": json.dumps(["user-123"]),
                "flaggedBy": json.dumps([]),
                "history": json.dumps([
                    {"status": "Reported", "message": "Issue registered by Rahul Sharma. Gemini AI routed ticket to Department of Public Works (Roads Division).", "time": datetime.now().isoformat()},
                    {"status": "Verified", "message": "AI Civic Agent verified report. Geolocation matches traffic patterns.", "time": datetime.now().isoformat()},
                    {"status": "Work Assigned", "message": "Dispatched to Department of Transportation (Road Maintenance Div 4).", "time": datetime.now().isoformat()},
                    {"status": "In Progress", "message": "Maintenance team dispatched. Patch work scheduled.", "time": datetime.now().isoformat()}
                ])
            },
            {
                "id": "issue-2",
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
                "verifiedBy": json.dumps([]),
                "flaggedBy": json.dumps([]),
                "history": json.dumps([
                    {"status": "Reported", "message": "Issue registered by Priya Nair. Gemini AI routed ticket to City Power & Grid Operations.", "time": datetime.now().isoformat()},
                    {"status": "Verified", "message": "AI Civic Agent verified. Report matches local grid nodes.", "time": datetime.now().isoformat()},
                    {"status": "Work Assigned", "message": "Dispatched to Electricity Board (Area 2 Grid Operations).", "time": datetime.now().isoformat()},
                    {"status": "In Progress", "message": "Crew replacing street lamp ballast and check cables.", "time": datetime.now().isoformat()},
                    {"status": "Resolved", "message": "Bulbs replaced, circuit tested. Streetlights are fully operational.", "time": datetime.now().isoformat()}
                ])
            },
            {
                "id": "issue-3",
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
                "verifiedBy": json.dumps([]),
                "flaggedBy": json.dumps([]),
                "history": json.dumps([
                    {"status": "Reported", "message": "Issue registered by Amit Khare. Multimodal analysis confirms commercial waste. Assigned to Municipal Sanitation & Waste Control.", "time": datetime.now().isoformat()}
                ])
            }
        ]
        
        for issue in seed_issues:
            cursor.execute(format_query("""
            INSERT INTO issues (id, title, description, category, severity, status, latitude, longitude, image, isVideo, reporter, upvotes, flags, timestamp, verifiedBy, flaggedBy, history, proofImage, aiResolutionFeedback, priorityScore, estimatedCompletion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """), (
                issue["id"], issue["title"], issue["description"], issue["category"], issue["severity"], issue["status"],
                issue["latitude"], issue["longitude"], issue["image"], issue["isVideo"], issue["reporter"], issue["upvotes"],
                issue["flags"], issue["timestamp"], issue["verifiedBy"], issue["flaggedBy"], issue["history"], "", "", issue.get("priorityScore", 0), issue.get("estimatedCompletion", "")
            ))
            
    cursor.execute(format_query("SELECT COUNT(*) FROM users"))
    if cursor.fetchone()[0] == 0:
        # Seed Users
        seed_users = [
            {"id": "user-1", "name": "Karan Mehra", "points": 340, "badges": json.dumps(["super-citizen", "pothole-hunter"]), "issuesCount": 15, "verifiedCount": 22, "isMe": 0},
            {"id": "user-2", "name": "Priya Nair", "points": 260, "badges": json.dumps(["reporter-badge", "green-activist"]), "issuesCount": 9, "verifiedCount": 14, "isMe": 0},
            {"id": "user-3", "name": "Amit Khare", "points": 195, "badges": json.dumps(["verify-badge"]), "issuesCount": 6, "verifiedCount": 9, "isMe": 0},
            {"id": "user-me", "name": "Aarav Patel (You)", "points": 180, "badges": json.dumps(["reporter-badge", "verify-badge"]), "issuesCount": 4, "verifiedCount": 7, "isMe": 1},
            {"id": "user-5", "name": "Siddharth Sen", "points": 120, "badges": json.dumps(["reporter-badge"]), "issuesCount": 3, "verifiedCount": 5, "isMe": 0}
        ]
        for usr in seed_users:
            cursor.execute(format_query("""
            INSERT INTO users (id, name, points, badges, issuesCount, verifiedCount, isMe)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """), (usr["id"], usr["name"], usr["points"], usr["badges"], usr["issuesCount"], usr["verifiedCount"], usr["isMe"]))
            
    conn.commit()
    conn.close()

def run_setup():
    try:
        init_db()
        print("Database schemas setup complete.")
    except Exception as e:
        print(f"Error during setup setup_db: {e}")
        # Try local SQLite fallback
        print("Falling back to local SQLite schema...")
        config.IS_POSTGRES = False
        init_db()
