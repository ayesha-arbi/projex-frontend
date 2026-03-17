/* ═══════════════════════════════════════════
   PROJEX.PK — DASHBOARD CONSTANTS
   Tag lists, option arrays, mock data.
   No UI components — those come from design-system.
═══════════════════════════════════════════ */

/* ─── Tech & Industry Tags ─── */
export const TECH_TAGS = [
  "Python","JavaScript","React","Node.js","Flutter","Swift","Kotlin",
  "Java","C++","C#","PHP","Go","SQL","MongoDB","PostgreSQL","Firebase",
  "Machine Learning","Deep Learning","Computer Vision","NLP","Data Analysis",
  "Arduino","Raspberry Pi","IoT","Embedded Systems","PCB Design","MATLAB",
  "UI/UX Design","Figma","Blockchain","Smart Contracts","Cybersecurity",
  "Cloud (AWS)","Cloud (GCP)","Docker",
];

export const INDUSTRY_TAGS = [
  "Technology","Finance","Healthcare","Education","E-Commerce","Telecom",
  "Manufacturing","Media","Consulting","Agriculture","Logistics","Energy",
];

export const LOOKING_FOR_OPTIONS = ["Hiring","Collaboration","Investment","Mentoring"];
export const STATUS_OPTIONS      = ["In Progress","Completed"];

/* ─── Mock Data (replace with API calls later) ─── */
export const MOCK_REQUESTS = [
  { id:1, company:"TechFarm PK",        sector:"AgriTech",   logo:"TF", logoColor:"#7aaa1c", project:"AI Crop Disease Detection",  message:"We'd love to explore a pilot program with your team.", date:"2 days ago", status:"pending"  },
  { id:2, company:"AquaTech Solutions", sector:"CleanTech",  logo:"AQ", logoColor:"#0a5a96", project:"Smart Water Monitor",         message:"Interested in licensing your LoRaWAN implementation.", date:"5 days ago", status:"pending"  },
  { id:3, company:"Kaizen Labs",        sector:"Technology", logo:"KL", logoColor:"#6366f1", project:"AI Crop Disease Detection",  message:"We want to discuss a potential acquisition.",          date:"1 week ago", status:"approved" },
];

export const MOCK_PROJECTS = [
  { id:1, title:"AI-Powered Crop Disease Detection",      status:"In Progress", tags:["AI/ML","AgriTech","IoT"],      requests:3, views:47, date:"Mar 2, 2026"   },
  { id:2, title:"Smart Water Quality Monitor — LoRaWAN", status:"Completed",   tags:["IoT","CleanTech","Embedded"],  requests:1, views:29, date:"Feb 18, 2026" },
];

export const MOCK_MESSAGES = [
  { id:1, from:"TechFarm PK", avatar:"TF", avatarColor:"#7aaa1c", preview:"Following up on our interest request — would love to schedule a call this week.", time:"10:32 AM",  unread:true  },
  { id:2, from:"Projex Team", avatar:"Px", avatarColor:"#033e66", preview:"Welcome to Projex.pk! Here's how to get started with your first project listing.",  time:"Yesterday", unread:false },
];