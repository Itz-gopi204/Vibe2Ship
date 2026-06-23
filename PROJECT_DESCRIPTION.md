# Project Submission Description: Community Hero - Civic AI Co-Pilot

This document contains the required text structure for your Vibe2Ship Hackathon Project Description Google Doc. Copy and paste the contents below into your submission document.

---

## 1. Problem Statement Selected
**Problem Statement 2: Community Hero - Hyperlocal Problem Solver**
Our community faces challenges with local infrastructure issues (such as road potholes, garbage accumulation, damaged streetlights, and sewer leakages). Traditional reporting methods are fragmented, slow, and lack civic transparency. We selected this problem to empower citizens with an AI-enabled co-pilot to identify, validate, and track local issue resolutions transparently.

---

## 2. Solution Overview
**Community Hero** is a premium, dark-mode civic dashboard and reporting system built on React, Leaflet, and the Google AI Studio Gemini API. It introduces a visual, step-by-step **AI Civic Agent** workflow.
When a citizen uploads an image or video of a public hazard, the Gemini Agent runs a multi-stage cognitive pipeline to:
1. **Classify** the category and severity of the hazard.
2. **Generate** a concise title and description of the problem.
3. **Audit** the database for duplicate reports in the vicinity.
4. **Select** and route the ticket to the correct municipal department.
5. **Draft** a field worker dispatch order automatically.

The dashboard integrates real-time Leaflet geo-mapping, citizen gamification standing boards, and a predictive analytics model foretelling future infrastructure degradation.

---

## 3. Key Features

- **Multimodal AI Analysis & Form Auto-Fill**:
  - Drag-and-drop file uploader supporting both image and video uploads.
  - Integration with Gemini to auto-fill titles, categories, and descriptions, minimizing reporting friction.
- **AI Agentic Dispatch Monitor**:
  - Real-time command-line logging detailing the agent's database deduplication scans, department routing, and automated field dispatch orders.
- **Interactive OpenStreetMap Visualization**:
  - Dark-matter themed map displaying markers color-coded by hazard severity.
  - Drop-pin coordinates selector allowing citizens to place issues precisely on the map.
- **Real-Time Simulation Controls**:
  - Button to advance issue statuses (*Reported* ➔ *Verified* ➔ *Work Assigned* ➔ *In Progress* ➔ *Resolved*), showing live updates to the history logs.
- **Civic Gamification System**:
  - User profile with badge unlock tracking (e.g. *First Alert*, *Truth Seeker*, *City Guardian*).
  - Leaderboard matching active community contributors by "Impact Points".
- **AI Predictive Insights Panel**:
  - Forecasts infrastructure degradation hot-spots (e.g., predicting pipe bursts and pothole expansions based on historical report clustering and external indicators like weather).

---

## 4. Technologies Used

- **Frontend Core**: HTML5, CSS3, JavaScript (ES6+).
- **Framework**: React 19 (scaffolded via Vite).
- **Styling**: Vanilla CSS (Cyber Civic Dark Theme, glassmorphism, responsive grids, custom animations).
- **Interactions**: Lucide React (vector iconography).
- **Mapping**: Leaflet JS (OpenStreetMap API) for marker rendering and tile loading.
- **Persistence**: `localStorage` (ensuring database states, points, and API key preferences persist across reload).

---

## 5. Google Technologies Utilized

- **Google AI Studio (Gemini API)**:
  - Powered by the fast, highly capable **Gemini 1.5 Flash** model (`gemini-1.5-flash`).
  - Utilizes **multimodal visual input processing** to read raw binary stream uploads (JPG, PNG) and return structured JSON summaries via `responseMimeType: "application/json"`.
  - Serves as the cognitive engine for categorizing issues and drafting municipal work orders.
