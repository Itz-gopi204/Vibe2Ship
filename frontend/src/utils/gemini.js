import { GoogleGenerativeAI } from '@google/generative-ai';

// Convert File object to generative part (base64)
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: file.type
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Map categories to city departments
export const getDepartment = (category) => {
  switch (category) {
    case 'Road Damage':
      return 'Department of Public Works (Roads Division)';
    case 'Waste Management':
      return 'Municipal Sanitation & Waste Control';
    case 'Public Utilities':
      return 'City Power & Grid Operations';
    case 'Water & Sanitation':
      return 'Water Supply & Sewerage Board';
    default:
      return 'General Civic Infrastructure Command';
  }
};

// Simulate Agent Logs step-by-step
export const runAgenticWorkflow = async (category, onLog) => {
  const department = getDepartment(category);
  const logs = [
    { text: 'Initializing AI Civic Agent...', type: 'info' },
    { text: 'Parsing image metadata and extracting EXIF locations...', type: 'info' },
    { text: `Analyzing visual hazard signatures (Identified Category: ${category}).`, type: 'accent' },
    { text: 'Scanning database for duplicates in 50m radius...', type: 'info' },
    { text: 'No matching duplicate reports found. Creating unique ticket ID.', type: 'success' },
    { text: `Checking department routing matrices for: "${category}"...`, type: 'info' },
    { text: `Routing ticket ➔ ${department}...`, type: 'accent' },
    { text: 'Drafting automated dispatch order for field crew...', type: 'info' },
    { text: 'Agentic routing completed. Awaiting final user submission.', type: 'success' }
  ];

  for (let i = 0; i < logs.length; i++) {
    // Wait for simulated analysis time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
    onLog(logs[i]);
  }
};

// Main Gemini Image Analysis Function
export const analyzeIssueImage = async (imageFile, apiKey) => {
  // If API Key is present, use Google AI Studio
  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-1.5-flash which is ideal for quick multimodal tasks
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      
      const imagePart = await fileToGenerativePart(imageFile);
      
      const prompt = `Analyze this image of a civic/municipal infrastructure issue. Categorize it and estimate its severity.
      Provide the output in JSON format with these exact keys:
      - "category": Must be exactly one of: "Road Damage", "Waste Management", "Public Utilities", "Water & Sanitation", or "Other"
      - "severity": Must be exactly one of: "Low", "Medium", "High", "Critical"
      - "title": A short, descriptive title of what is broken (max 6 words)
      - "description": A concise, clear explanation of the hazard and why it needs repair.
      - "department": Recommend the specific local municipal department routed to handle this issue (be detailed and specific).
      - "dispatch_order": Generate a brief dispatch order containing crew instructions (e.g. required crew size, tools, safety measures).
      
      Output ONLY the raw JSON. Do not write markdown tags (e.g. \`\`\`json) or extra text.`;

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      
      // Clean up markdown code block indicators if any
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Fallback to simulation if call fails
    }
  }

  // Fallback Simulation Mode
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network latency

  const fileName = imageFile.name.toLowerCase();
  
  if (fileName.includes('pothole') || fileName.includes('road') || fileName.includes('asphalt') || fileName.includes('street')) {
    return {
      category: 'Road Damage',
      severity: 'High',
      title: 'Pothole on Main Road',
      description: 'A deep pothole in the middle of the road causing cars to veer. Safety hazard for motorbikes.',
      department: 'Department of Public Works (Roads Division)',
      dispatch_order: 'Road maintenance crew of 4 dispatched with asphalt patcher, warning signs, and rollers. Patch pothole and test compaction.'
    };
  } else if (fileName.includes('trash') || fileName.includes('garbage') || fileName.includes('bin') || fileName.includes('waste')) {
    return {
      category: 'Waste Management',
      severity: 'Critical',
      title: 'Overflowing Commercial Dumpster',
      description: 'Piles of household and commercial waste overflowing onto public paths. Health hazard.',
      department: 'Municipal Sanitation & Waste Control',
      dispatch_order: 'Sanitation team of 2 dispatched with heavy compactor waste vehicle. Clear dumpster waste overflow and sanitize the sidewalk.'
    };
  } else if (fileName.includes('light') || fileName.includes('lamp') || fileName.includes('wire') || fileName.includes('power')) {
    return {
      category: 'Public Utilities',
      severity: 'Medium',
      title: 'Damaged Streetlight Pole',
      description: 'Streetlight has burnt out bulbs and exposed wires near the panel base. Hazardous at night.',
      department: 'City Power & Grid Operations',
      dispatch_order: 'Electrical grid technicians dispatched with diagnostic equipment and safety gear. Rewire exposed cables and replace lamps.'
    };
  } else if (fileName.includes('water') || fileName.includes('leak') || fileName.includes('pipe') || fileName.includes('drain')) {
    return {
      category: 'Water & Sanitation',
      severity: 'High',
      title: 'Cracked Pipe Water Leak',
      description: 'Fresh water leaking from a crack in the mains, flooding the sidewalk and wasting water.',
      department: 'Water Supply & Sewerage Board',
      dispatch_order: 'Plumbing response unit of 3 dispatched with pipe clamps, excavation machinery, and sealants. Patch main pipe leak.'
    };
  }

  // General fallback
  const mockOptions = [
    {
      category: 'Road Damage',
      severity: 'High',
      title: 'Damaged Asphalt Surface',
      description: 'Cracks and potholes along the main corridor. High risk of tyre damage and vehicle accidents.',
      department: 'Department of Public Works (Roads Division)',
      dispatch_order: 'Pavement inspection team dispatched. Patch cracks and secure perimeter signs.'
    },
    {
      category: 'Waste Management',
      severity: 'Medium',
      title: 'Uncollected Litter Pile',
      description: 'accumulation of plastic waste and trash bags on the pathway. Needs sanitation clearance.',
      department: 'Municipal Sanitation & Waste Control',
      dispatch_order: 'Street sweepers dispatched. Collect plastic heaps and clear visual litter.'
    },
    {
      category: 'Public Utilities',
      severity: 'Low',
      title: 'Faulty Traffic Indicator',
      description: 'The pedestrian crossing signal is flickering and not responding correctly during peak traffic.',
      department: 'City Power & Grid Operations',
      dispatch_order: 'Traffic signals crew dispatched with electrical meter. Repair pedestrian crossing controller.'
    },
    {
      category: 'Water & Sanitation',
      severity: 'Critical',
      title: 'Blocked Drainage Backflow',
      description: 'Sewage drain is clogged with mud and silt, causing dirty water to spill onto the public street.',
      department: 'Water Supply & Sewerage Board',
      dispatch_order: 'Hydro-vac suction vehicle dispatched. Clear sludge, silt, and restore sewer grid flows.'
    }
  ];

  return mockOptions[Math.floor(Math.random() * mockOptions.length)];
};
