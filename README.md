# 🛡️ Community Hero — Civic AI Co-Pilot

A premium, dark-themed, glassmorphic civic collaboration platform designed to empower citizens to identify, report, and track hyperlocal municipal issues, and enable municipal field crews to claim work orders and submit visual completion proofs audited by **Google Gemini 1.5 Flash**.

Built as a decoupled frontend-backend application using **React SPA (Vite)** and a modular **FastAPI** backend supporting **MongoDB** with persistent local **SQLite** auto-migration fallbacks.

---

## 📐 System Architecture & Data Flow Diagrams

The platform utilizes a structured **Repository Pattern** and a multi-stage **Agentic Visual Inspection Pipeline**.

### 1. Hazard Reporting & AI Pre-fill Flow (Citizen Role)
This diagram illustrates the data flow from when a citizen uploads visual evidence of a hazard, through Gemini multimodal classification, spatial deduplication checks, and final database submission.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant FE as React Frontend (Vite)
    participant BE as FastAPI Backend
    participant DB as MongoDB
    participant AI as Gemini 1.5 Flash

    Citizen->>FE: Upload hazard photo/video
    FE->>BE: POST /api/analyze (Multipart Form Data)
    Note over BE: Save media to static storage
    BE->>AI: Send image + Prompts (Mime Mapped)
    AI-->>BE: Return JSON (category, severity, routing, dispatch crew)
    BE->>DB: Check active reports within 50m (Haversine query)
    alt Duplicate Found
        BE-->>FE: Return pre-fill data + Duplicate Alert Log
    else Unique Issue
        BE-->>FE: Return pre-fill data + Auto-Dispatch Log
    end
    Citizen->>FE: Verify coordinates and Submit
    FE->>BE: POST /api/issues
    BE->>DB: Save ticket & award +25 Citizen points
    BE-->>FE: Ticket confirmed
```

---

### 2. Field Crew Claim & AI Visual Resolution Audit (Field Worker Role)
This diagram illustrates the role-based dispatch pipeline where a municipal worker claims a ticket, uploads a completion photo, and triggers a multimodal visual comparison audit.

```mermaid
sequenceDiagram
    autonumber
    actor Worker as Field Worker
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant DB as MongoDB
    participant AI as Gemini 1.5 Flash

    Worker->>FE: Toggle to Field Worker role
    FE->>BE: GET /api/issues (Status Filter)
    BE->>DB: Fetch active assignments
    DB-->>FE: Display Assigned Work Orders
    Worker->>FE: Click "Claim Task"
    FE->>BE: POST /api/issues/{id}/advance
    BE->>DB: Transition status to "In Progress" & log crew dispatch
    Worker->>FE: Upload Repair Proof Image
    FE->>BE: POST /api/issues/{id}/resolve (Multipart Form)
    Note over BE: Save proof media to static storage
    BE->>AI: Evaluate proof image against original title & description
    AI-->>BE: Return Audit Verification JSON (verified, feedback)
    alt Repair Verified
        BE->>DB: Set status = "Resolved", save proof & award citizen upvoters +10 points
        BE-->>FE: Return "Resolved & AI Certified"
    else Repair Rejected
        BE->>DB: Set status = "In Progress", log re-inspection feedback
        BE-->>FE: Return "Re-inspection Needed"
    end
```

---

## 📂 Project Directory Structure

```
Vibe2Ship/
├── backend/                       # FastAPI Application
│   ├── database/                  # Connection managers & schemas setup
│   │   ├── connection.py          # Handles MongoDB/SQLite connectivity
│   │   └── setup.py               # Collection creation & database seed injections
│   ├── models/                    # Pydantic validation models
│   │   └── schemas.py             # Issue and User schemas
│   ├── repositories/              # DB operations layer (CRUD queries)
│   │   ├── issue_repository.py    # Timelines, advancing states, proof uploads
│   │   └── user_repository.py     # Scores, standings, achievements
│   ├── routers/                   # Endpoint routers (Controllers)
│   │   ├── analysis.py            # Visual classification uploader
│   │   ├── issues.py              # Main ticket endpoints
│   │   └── users.py               # Profile & Leaderboard
│   ├── services/                  # Business logic (Gemini SDK integration)
│   │   └── gemini_service.py      # Prompt construction & multimodal API calls
│   ├── static/                    # Stored evidence & resolution proof images
│   ├── utils/                     # Python math & geo helpers
│   │   └── geo.py                 # Haversine distance algorithm
│   ├── main.py                    # Startup & router assemblies
│   └── requirements.txt           # Python dependencies
├── frontend/                      # React SPA Application (Vite-powered)
│   ├── src/
│   │   ├── components/            # UI components (Dashboard, IssueMap, Leaderboard, Settings)
│   │   ├── context/               # IssueContext.jsx (Global states, proxy fetchers, role config)
│   │   └── index.css              # Custom styled design system
│   ├── package.json               # Frontend package manager manifest
│   └── vite.config.js             # Vite configuration with proxy configurations
├── .env                           # Project credentials (MongoDB URI & Gemini API Key)
├── package.json                   # Root concurrently script configurations
└── README.md                      # General documentation
```

---

## 🛠️ Local Installation & Development

### 1. Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.10+) and **pip**

### 2. Setup Dependencies
From the root directory, run:
```bash
npm run install:all
```
This automatically installs the React frontend node modules and Python packages for FastAPI.

### 3. Configure Credentials
Create a `.env` file in the root of the project (template provided in `.env.example`):
```env
# Google AI Studio Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB connection URI
# Example: mongodb+srv://user:password@cluster0.mongodb.net/vibe2ship?retryWrites=true&w=majority
# Leave empty to automatically fall back to local SQLite "civic_hero.db"
MONGODB_URI=your_mongodb_uri_here
MONGODB_DB_NAME=vibe2ship
```

### 4. Start Development Servers
Launch both the FastAPI backend and React frontend server concurrently:
```bash
npm run dev
```
- Frontend will open at [http://localhost:5173](http://localhost:5173)
- Backend API will start at [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger API Docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 4.1 Vercel Deployment and Backend Connection
For Vercel production, set the frontend environment variable:
```env
VITE_API_BASE_URL=https://vibe2ship.onrender.com
```
This will make the frontend send all backend requests to your Render app.

In Vercel, configure the environment variable under **Project Settings > Environment Variables** with the same name.

Important:
- Do not include a trailing slash in `VITE_API_BASE_URL`.
- Set this variable for **Production** and **Preview** environments.

If you deploy locally or without `VITE_API_BASE_URL`, the frontend will continue to use the local development proxy and `/api` paths.

---

## 🌐 API Endpoint Specifications

### Issues Router (`/api/issues`)
* `GET /api/issues` — Retrieves a list of all active/resolved reports, sorting by timestamp.
* `POST /api/issues` — Creates a new report and awards +25 citizen impact points.
* `POST /api/issues/{issue_id}/verify` — Toggles citizen upvote status (+10 points).
* `POST /api/issues/{issue_id}/flag` — Flags reports for re-inspection.
* `POST /api/issues/{issue_id}/advance` — Advances status step-by-step (*Reported* ➔ *Verified* ➔ *Work Assigned* ➔ *In Progress* ➔ *Resolved*).
* `POST /api/issues/{issue_id}/resolve` — Accepts an uploaded resolution image, triggers Gemini visual audit, and updates ticket completion status.

### Users Router (`/api/users`)
* `GET /api/leaderboard` — Returns the gamified community standings.
* `GET /api/profile` — Returns the logged-in user profile.

### Analysis Router (`/api/analyze`)
* `POST /api/analyze` — Takes a photo/video file upload, saves it locally, performs Gemini classification, checks for duplicates inside a 50m radius, and generates automated dispatch orders.

---

## 🧪 Demonstration Steps for Evaluators

1. **Submit a New Hazard Report (Citizen Role)**:
   - Go to **Report Issue** and upload an image (e.g. `pothole.jpg` or `trash.png`).
   - Observe the **AI Civic Agent Console** logging the visual classification, proximity check, and department dispatch order draft.
   - Adjust Leaflet coordinates if necessary and submit.

2. **Claim the Repair (Field Worker Role)**:
   - Toggle to **Field Worker** mode in the header navbar.
   - Note the dashboard updates to "Municipal Assigned Work Orders".
   - Find your submitted issue card and click **Claim Task & Start Repair** (advances status to `In Progress`).

3. **Verify Resolution with AI Auditor**:
   - On the claimed issue, click the file input to upload a visual proof image (e.g., `clean_road.jpg` representing a fixed pothole).
   - Click **Verify & Resolve with AI Auditor**.
   - Watch the spinner process the visual check. The card status updates to `Resolved` with a green **AI Certified Resolution Proof** banner displaying Gemini's audit comments.
