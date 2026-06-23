# Community Hero - Civic AI Co-Pilot

A premium, dark-themed, glassmorphic civic collaboration platform designed to empower citizens to identify, report, validate, and track hyperlocal municipal issues (e.g. road damage, utilities, waste management, water leaks). 

Built as a React Single Page Application (SPA) utilizing Vite, Leaflet OpenStreetMap tiles, and **Google AI Studio (Gemini 1.5 Flash)**.

---

## 🌟 Hackathon Highlights & Core Focuses

### 1. Agentic Depth (20% Weightage)
When a citizen uploads visual hazard evidence, the application invokes a multi-stage **AI Civic Agent** workflow. The UI logs this process step-by-step in an authentic dev-style console, demonstrating agentic depth:
* **Visual Anomaly Analysis**: Scans images to detect structural dimensions, risk signatures, and categorize details.
* **Geographic Checks & Deduplication**: Queries the database to prevent duplicate ticketing within a 50m radius.
* **Civic Routing Matrix**: Selects the appropriate municipal department using intelligent categorization tags.
* **Automated Dispatch Drafting**: Generates a field maintenance order ticket containing technical work specifications.

### 2. Google Technologies (15% Weightage)
* Powered by the **Gemini 1.5 Flash** model (`gemini-1.5-flash`) via the Google AI Studio client SDK.
* Integrates **multimodal image analysis** with JSON schema outputs (`responseMimeType: "application/json"`) to automatically categorize hazards, assess severity (Low, Medium, High, Critical), and generate titles and descriptions.

### 3. Predictive Insights
Dashboard anomaly forecast metrics displaying predicted local infrastructure failures (e.g. electrical grid overload, sewage hydrological backup, and road pavement shear) based on historic clusters and degradation indices.

### 4. Interactive Geo-Mapping
A Leaflet map styled in premium dark themes overlaying report locations. Custom div-markers glow in correlation to issue severity. Features a drop-pin interactive mode where users can click anywhere on the map to set exact report coordinates.

### 5. Citizen Gamification
Empowers citizen contribution with "Impact Points" and achievements badge unlocks (e.g., *First Alert*, *Truth Seeker*, *City Guardian*, *Eco Hero*) integrated into a live community leaderboard.

---

## 📂 Project Directory Structure

```
Vibe2Ship/
├── dist/                          # Production compiled assets
├── public/                        # Static assets (favicons, etc.)
├── src/
│   ├── assets/                    # Standard image/logo templates
│   ├── components/                # UI Tabs & Elements
│   │   ├── Dashboard.jsx          # Statistics feed, filters, simulation triggers & insights
│   │   ├── IssueMap.jsx           # Leaflet interactive map & custom pin anchors
│   │   ├── Leaderboard.jsx        # Badges panel & community standings
│   │   ├── ReportIssue.jsx        # Drag-drop file uploader (image/video), AI Agent log streams
│   │   └── Settings.jsx           # Gemini API key credentials control panel
│   ├── context/
│   │   └── IssueContext.jsx       # State context managing issues, points, and localStorage
│   ├── utils/
│   │   └── gemini.js              # Base64 conversion, routing logs, Gemini SDK connector
│   ├── App.css                    # Cleared boilerplate stylesheet
│   ├── App.jsx                    # Navigation routing wrapper
│   ├── index.css                  # CSS Variables, fonts, glassmorphism design variables
│   └── main.jsx                   # StrictMode react entry point
├── .env.example                   # Environment variable template
├── index.html                     # Links Leaflet CSS and Outfit & Inter fonts
├── package.json                   # React, Leaflet, and Gemini dependencies
├── vite.config.js                 # Vite bundler options
└── PROJECT_DESCRIPTION.md         # Submission template for hackathon Google Doc
```

---

## 🛠️ Local Installation & Development

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your machine.

### 2. Setup Dependencies
From the project root, run:
```bash
npm install
```

### 3. Configure API Key
Create a `.env` file in the root of the project:
```env
VITE_GEMINI_API_KEY=your_google_ai_studio_api_key
```
*(Alternatively, you can leave this blank and use the in-app **Settings** panel to input your key. If no key is configured, the application automatically launches in **Simulation Mode** using pre-configured keywords to deliver visual categorization mockup outcomes!)*

### 4. Run Dev Server
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 5. Build for Production
To bundle and build the application for deployment (outputs static pages in `dist/`):
```bash
npm run build
```

---

## 🧪 Demonstration Steps for Evaluators

1. **Test Multimodal AI Analysis (Simulation Mode)**:
   - Go to **Report Issue**.
   - Drag and drop a photo or video. If you do not have an API key configured, name your file `pothole.jpg` or `trash.png` to let the system mock-identify it.
   - Watch the **AI Civic Agent Console** scroll in real-time as it executes visual scans, location checks, and department assignments.
   - Adjust the coordinates pin on the Leaflet map preview if needed, and review the pre-filled form fields before submitting.

2. **Upvote & Crowdsource Verify**:
   - Scroll through the **Dashboard** feed.
   - Click **Verify** on any reported issue. Your **Impact Points** (in the top-right header stats) will immediately increase by +10 pts.
   - Check the **Leaderboard** tab—your rank and progress indicators will adjust dynamically.

3. **Advance Resolution Timeline**:
   - In any issue card, click **Simulate Action**.
   - Click **View Timeline & Logs** to expand the card details.
   - You will see the active step (e.g. *Verified* ➔ *Work Assigned*) advance, and a new record appended to the agent history log!
