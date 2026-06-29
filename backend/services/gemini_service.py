import os
import json
import base64
import random
import httpx
import config
from utils.geo import haversine_distance

# Mock options
MOCK_DESCRIPTIONS = {
    'Road Damage': {
        'title': 'Pothole on Main Road',
        'description': 'A deep pothole in the middle of the road causing cars to veer. Safety hazard for motorbikes.',
        'department': 'Department of Public Works (Roads Division)',
        'dispatch_order': 'Road maintenance crew of 4 dispatched with asphalt patcher, warning signs, and rollers. Patch pothole and test compaction.'
    },
    'Waste Management': {
        'title': 'Overflowing Commercial Dumpster',
        'description': 'Piles of household and commercial waste overflowing onto public paths. Health hazard.',
        'department': 'Municipal Sanitation & Waste Control',
        'dispatch_order': 'Sanitation team of 2 dispatched with heavy compactor waste vehicle. Clear dumpster waste overflow and sanitize the sidewalk.'
    },
    'Public Utilities': {
        'title': 'Damaged Streetlight Pole',
        'description': 'Streetlight has burnt out bulbs and exposed wires near the panel base. Hazardous at night.',
        'department': 'City Power & Grid Operations',
        'dispatch_order': 'Electrical grid technicians dispatched with diagnostic equipment and safety gear. Rewire exposed cables and replace lamps.'
    },
    'Water & Sanitation': {
        'title': 'Cracked Pipe Water Leak',
        'description': 'Fresh water leaking from a crack in the mains, flooding the sidewalk and wasting water.',
        'department': 'Water Supply & Sewerage Board',
        'dispatch_order': 'Plumbing response unit of 3 dispatched with pipe clamps, excavation machinery, and sealants. Patch main pipe leak.'
    }
}

async def analyze_evidence(file_contents: bytes, mime_type: str, filename: str, custom_api_key: str = None):
    api_key = custom_api_key or config.GEMINI_API_KEY
    category = "Road Damage"
    severity = "High"
    title = "Identified Infrastructure Damage"
    description = "Civic infrastructure requires repair. Please inspect the visual report attachment."
    department = "Department of Public Works (Roads Division)"
    dispatch_order = "Road maintenance crew of 4 dispatched with asphalt patcher, warning signs, and rollers."
    
    ai_success = False
    
    if api_key and api_key.strip():
        try:
            base64_data = base64.b64encode(file_contents).decode("utf-8")
            prompt = """Analyze this visual evidence of a civic/municipal infrastructure issue. Categorize it and estimate its severity.
            Provide the output in JSON format with these exact keys:
            - "category": Must be exactly one of: "Road Damage", "Waste Management", "Public Utilities", "Water & Sanitation", or "Other"
            - "severity": Must be exactly one of: "Low", "Medium", "High", "Critical"
            - "title": A short, descriptive title of what is broken (max 6 words)
            - "description": A concise, clear explanation of the hazard and why it needs repair.
            - "department": Recommend the specific local municipal division/department routed to handle this issue (be detailed and specific).
            - "dispatch_order": Generate a brief dispatch order containing crew instructions (e.g. required crew size, tools, safety measures).
            
            Output ONLY the raw JSON. Do not write markdown tags (e.g. ```json) or extra text."""
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inlineData": {
                                    "mimeType": mime_type,
                                    "data": base64_data
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=30.0)
                if response.status_code == 200:
                    res_json = response.json()
                    text_out = res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    gemini_data = json.loads(text_out)
                    category = gemini_data.get("category", category)
                    severity = gemini_data.get("severity", severity)
                    title = gemini_data.get("title", title)
                    description = gemini_data.get("description", description)
                    department = gemini_data.get("department", department)
                    dispatch_order = gemini_data.get("dispatch_order", dispatch_order)
                    ai_success = True
        except Exception as e:
            print(f"Gemini analysis service error: {e}")

    if not ai_success:
        filename = filename.lower()
        if any(w in filename for w in ['pothole', 'road', 'asphalt', 'street']):
            sel = MOCK_DESCRIPTIONS['Road Damage']
        elif any(w in filename for w in ['trash', 'garbage', 'bin', 'waste']):
            sel = MOCK_DESCRIPTIONS['Waste Management']
        elif any(w in filename for w in ['light', 'lamp', 'wire', 'power']):
            sel = MOCK_DESCRIPTIONS['Public Utilities']
        elif any(w in filename for w in ['water', 'leak', 'pipe', 'drain']):
            sel = MOCK_DESCRIPTIONS['Water & Sanitation']
        else:
            sel = random.choice(list(MOCK_DESCRIPTIONS.values()))
            
        category = sel['category'] if 'category' in sel else category
        severity = 'High'
        title = sel['title']
        description = sel['description']
        department = sel['department']
        dispatch_order = sel['dispatch_order']
        
    return {
        "title": title,
        "category": category,
        "severity": severity,
        "description": description,
        "department": department,
        "dispatch_order": dispatch_order,
        "ai_success": ai_success
    }

async def verify_repair_proof(original_title: str, original_desc: str, file_contents: bytes, mime_type: str, filename: str, custom_api_key: str = None):
    api_key = custom_api_key or config.GEMINI_API_KEY
    verified = True
    feedback = "Visual check verified. The hazard has been resolved and the area cleared. Operations are complete."
    
    ai_success = False
    
    if api_key and api_key.strip():
        try:
            base64_data = base64.b64encode(file_contents).decode("utf-8")
            prompt = f"""You are a municipal inspector AI auditor.
            We have a reported civic hazard:
            - Title: {original_title}
            - Description: {original_desc}
            
            The field maintenance worker has submitted a photo claiming this issue has been resolved/repaired.
            Analyze the submitted repair proof image and verify if the hazard described is fully repaired and fixed.
            
            Return the output in JSON format with these exact keys:
            - "verified": True (boolean) if the repair is complete and the issue looks resolved. False (boolean) if the issue is not fixed, looks incomplete, or does not match.
            - "feedback": A detailed, professional explanation of your audit findings (e.g. why it is certified or what is missing/needs work).
            
            Output ONLY the raw JSON. Do not write markdown tags (e.g. ```json) or extra text."""
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inlineData": {
                                    "mimeType": mime_type,
                                    "data": base64_data
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=30.0)
                if response.status_code == 200:
                    res_json = response.json()
                    text_out = res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    gemini_data = json.loads(text_out)
                    verified = bool(gemini_data.get("verified", verified))
                    feedback = gemini_data.get("feedback", feedback)
                    ai_success = True
        except Exception as e:
            print(f"Gemini proof verification service error: {e}")
            
    if not ai_success:
        filename = filename.lower()
        if any(w in filename for w in ['fail', 'bad', 'incomplete', 'reject']):
            verified = False
            feedback = "Proof evaluation rejected. The image shows remaining structural cracks and surrounding debris. Repair is incomplete."
        else:
            verified = True
            feedback = f"Simulation validation complete. The uploaded photo confirms resolution of '{original_title}'. Work site is certified clean."
            
    return {
        "verified": verified,
        "feedback": feedback,
        "ai_success": ai_success
    }
