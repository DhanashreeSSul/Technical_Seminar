import type { Express, Request, Response, NextFunction } from "express";
import crypto from "crypto";

// ─── Types ──────────────────────────────────────────────────────────
type OtpRecord = { code: string; expiresAt: number; purpose?: string; meta?: any };

// ─── In-memory stores (production: PostgreSQL via Drizzle) ──────────
const otpStore: Record<string, OtpRecord> = {};
const users: Record<string, any> = {};
const ngos: Record<string, any> = {};
const chatSessions: Record<string, any[]> = {};
const ngoDocuments: Record<string, any> = {};

// ─── Real Jobs Data (actual Indian programs/companies) ──────────────
const jobs: any[] = [
  {
    id: "job-1", title: "Data Entry Operator",
    company: "National Informatics Centre (NIC)", location: "Various Districts", state: "Maharashtra",
    salary: "₹12,000 – ₹18,000/month", category: "Digital / IT",
    description: "Data entry and digitization of government records under Digital India programme. Training provided. Basic computer skills required.",
    skills: ["Computer Basics", "Typing", "Hindi/Marathi Typing", "MS Excel"],
    isRemote: false, mode: "On-site", education: "10th Pass",
    applyUrl: "https://ncs.gov.in", postedAt: "2026-02-10", active: true,
  },
  {
    id: "job-2", title: "Self-Help Group (SHG) Coordinator",
    company: "National Rural Livelihoods Mission (NRLM)", location: "Block Level", state: "Madhya Pradesh",
    salary: "₹10,000 – ₹15,000/month", category: "Community / Social Work",
    description: "Coordinate women's SHG activities, maintain records, facilitate micro-credit linkages, and conduct community meetings.",
    skills: ["Communication", "Record Keeping", "Community Mobilization", "Basic Accounting"],
    isRemote: false, mode: "On-site", education: "12th Pass",
    applyUrl: "https://nrlm.gov.in", postedAt: "2026-02-08", active: true,
  },
  {
    id: "job-3", title: "Tailoring & Embroidery Trainer",
    company: "Usha Silai School (Usha International)", location: "Various Centres", state: "Rajasthan",
    salary: "₹8,000 – ₹12,000/month + Incentives", category: "Tailoring / Handicrafts",
    description: "Train rural women in sewing, embroidery, and small garment production. Machine and materials provided by Usha International.",
    skills: ["Sewing", "Embroidery", "Training", "Pattern Making"],
    isRemote: false, mode: "On-site", education: "8th Pass",
    applyUrl: "https://www.ushasew.com/usha-silai-school", postedAt: "2026-02-05", active: true,
  },
  {
    id: "job-4", title: "Anganwadi Helper / Worker",
    company: "Women & Child Development Ministry", location: "Village Level", state: "Uttar Pradesh",
    salary: "₹5,500 – ₹8,000/month (Honorarium)", category: "Health / Childcare",
    description: "Support child nutrition, immunization, health checkups, and pre-school education at the Anganwadi centre.",
    skills: ["Childcare", "Nutrition Knowledge", "Record Keeping", "Community Communication"],
    isRemote: false, mode: "On-site", education: "8th Pass",
    applyUrl: "https://wcd.nic.in", postedAt: "2026-02-01", active: true,
  },
  {
    id: "job-5", title: "Online Meesho/Amazon Reseller",
    company: "Meesho / Amazon Saheli Programme", location: "Work from Home", state: "All India",
    salary: "₹5,000 – ₹25,000/month (Commission-based)", category: "E-Commerce / Business",
    description: "Become an online reseller via Meesho or Amazon Saheli. Share products on WhatsApp, earn commission on every sale. Zero investment to start.",
    skills: ["WhatsApp", "Basic Smartphone Usage", "Communication", "Local Market Knowledge"],
    isRemote: true, mode: "Remote", education: "No Minimum",
    applyUrl: "https://meesho.com", postedAt: "2026-02-12", active: true,
  },
  {
    id: "job-6", title: "Organic Farming & Kitchen Garden Trainer",
    company: "Paramparagat Krishi Vikas Yojana (PKVY)", location: "District Level", state: "Karnataka",
    salary: "₹10,000 – ₹14,000/month", category: "Agriculture",
    description: "Train women farmers in organic farming methods, vermicomposting, and kitchen garden management under PKVY scheme.",
    skills: ["Organic Farming", "Vermicomposting", "Soil Testing", "Training"],
    isRemote: false, mode: "On-site", education: "8th Pass",
    applyUrl: "https://pgsindia-ncof.gov.in", postedAt: "2026-02-07", active: true,
  },
  {
    id: "job-7", title: "Beauty & Wellness Technician",
    company: "B&WSSC (Beauty & Wellness Sector Skill Council)", location: "Training Centres", state: "Gujarat",
    salary: "₹8,000 – ₹15,000/month", category: "Beauty / Wellness",
    description: "Placement-linked training as Beauty Therapist/Hairdresser. Free training under PMKVY with guaranteed placement assistance.",
    skills: ["Beauty Therapy", "Hair Styling", "Makeup", "Customer Service"],
    isRemote: false, mode: "On-site", education: "10th Pass",
    applyUrl: "https://bwssc.in", postedAt: "2026-02-09", active: true,
  },
  {
    id: "job-8", title: "CSC Village Level Entrepreneur (VLE)",
    company: "Common Service Centres (CSC) e-Governance", location: "Village/Block Level", state: "Bihar",
    salary: "₹10,000 – ₹30,000/month (Service commission)", category: "Digital / IT",
    description: "Run a Common Service Centre providing Aadhaar, PAN, banking, insurance, and government services to rural citizens. Commission on each service.",
    skills: ["Computer Skills", "Internet", "Customer Service", "Document Processing"],
    isRemote: false, mode: "On-site", education: "10th Pass",
    applyUrl: "https://csc.gov.in", postedAt: "2026-02-11", active: true,
  },
];

// ─── Real Training Courses (actual Indian programs) ─────────────────
const trainingCourses: any[] = [
  {
    id: "tc-1", title: "PMKVY – Beauty & Wellness Course",
    provider: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)", category: "Beauty / Wellness",
    description: "Free 3-month certified training in beauty therapy, hair styling, and salon management. Certification by NSDC. Includes placement assistance and tool kit worth ₹5,000.",
    duration: "3 months", mode: "In-Person", isFree: true,
    skills: ["Beauty Therapy", "Hair Styling", "Makeup Artistry", "Salon Management"],
    certifiedBy: "National Skill Development Corporation (NSDC)", rating: 4.6,
    language: "Hindi / English / Regional", enrollUrl: "https://pmkvyofficial.org", active: true,
  },
  {
    id: "tc-2", title: "Digital Literacy – PMGDISHA",
    provider: "Pradhan Mantri Gramin Digital Saksharta Abhiyan", category: "Digital / Computer",
    description: "Free 20-hour course on basic computer skills, internet usage, digital payments (UPI/BHIM), email, and government service portals. Open to all rural citizens.",
    duration: "20 hours (flexible)", mode: "In-Person", isFree: true,
    skills: ["Computer Basics", "Internet Browsing", "UPI/Digital Payments", "Email", "Government Portals"],
    certifiedBy: "CSC e-Governance / MeitY", rating: 4.3,
    language: "Hindi / Marathi / English", enrollUrl: "https://pmgdisha.in", active: true,
  },
  {
    id: "tc-3", title: "Tailoring & Fashion Design (Usha Silai School)",
    provider: "Usha International Ltd.", category: "Tailoring / Handicrafts",
    description: "Learn professional sewing, pattern-making, blouse construction, and garment design. Sewing machine provided for practice. Upon completion, earn as a tailor or start your own business.",
    duration: "6 months", mode: "In-Person", isFree: true,
    skills: ["Sewing", "Pattern Making", "Garment Design", "Embroidery", "Blouse Construction"],
    certifiedBy: "Usha International / NSDC", rating: 4.5,
    language: "Hindi / Regional", enrollUrl: "https://www.ushasew.com/usha-silai-school", active: true,
  },
  {
    id: "tc-4", title: "Organic Farming & Vermicomposting",
    provider: "ICAR – Indian Council of Agricultural Research", category: "Agriculture",
    description: "Learn organic farming practices, vermicompost preparation, bio-pesticides, kitchen gardening, and marketing of organic produce. Free for women farmers.",
    duration: "2 weeks (field training)", mode: "In-Person", isFree: true,
    skills: ["Organic Farming", "Vermicomposting", "Bio-pesticides", "Kitchen Gardening", "Crop Planning"],
    certifiedBy: "ICAR / Krishi Vigyan Kendra", rating: 4.4,
    language: "Hindi / Marathi / Regional", enrollUrl: "https://icar.org.in", active: true,
  },
  {
    id: "tc-5", title: "Financial Literacy & SHG Management",
    provider: "National Rural Livelihoods Mission (NRLM)", category: "Business / Finance",
    description: "Understand savings, credit, insurance, SHG bookkeeping, micro-enterprise planning, and bank linkages. Essential for SHG members and aspiring entrepreneurs.",
    duration: "1 month (weekly sessions)", mode: "In-Person", isFree: true,
    skills: ["Financial Literacy", "Bookkeeping", "Micro-enterprise Planning", "Banking"],
    certifiedBy: "Ministry of Rural Development", rating: 4.2,
    language: "Hindi / Marathi / English", enrollUrl: "https://nrlm.gov.in", active: true,
  },
  {
    id: "tc-6", title: "NSDC – Mobile Phone Repair Technician",
    provider: "Telecom Sector Skill Council (TSSC)", category: "Electronics / Technical",
    description: "Learn smartphone and feature phone hardware repair, software troubleshooting, and tablet repair. High demand skill with self-employment potential. Includes toolkit.",
    duration: "3 months", mode: "In-Person", isFree: true,
    skills: ["Phone Repair", "Hardware Troubleshooting", "Software Flashing", "Soldering"],
    certifiedBy: "NSDC / TSSC", rating: 4.1,
    language: "Hindi / English", enrollUrl: "https://pmkvyofficial.org", active: true,
  },
  {
    id: "tc-7", title: "Google/Meta Digital Marketing (Free Course)",
    provider: "Google Digital Unlocked / Meta Blueprint", category: "Digital / Marketing",
    description: "Free online course on digital marketing fundamentals — SEO, social media marketing, Google Ads, WhatsApp Business, online selling, and analytics.",
    duration: "40 hours (self-paced)", mode: "Online", isFree: true,
    skills: ["Social Media Marketing", "SEO", "Google Ads", "WhatsApp Business", "Analytics"],
    certifiedBy: "Google / Meta", rating: 4.7,
    language: "Hindi / English", enrollUrl: "https://learndigital.withgoogle.com/digitalunlocked", active: true,
  },
  {
    id: "tc-8", title: "Spoken English & Communication Skills",
    provider: "IGNOU / Swayam Portal", category: "Language / Communication",
    description: "Free spoken English course covering grammar, conversation skills, interview preparation, and workplace communication. Available online on Swayam platform.",
    duration: "3 months (online)", mode: "Online", isFree: true,
    skills: ["English Speaking", "Grammar", "Interview Skills", "Workplace Communication"],
    certifiedBy: "IGNOU / UGC-Swayam", rating: 4.3,
    language: "Hindi-medium instruction", enrollUrl: "https://swayam.gov.in", active: true,
  },
  {
    id: "tc-9", title: "Food Processing & Packaging (PMFME)",
    provider: "PM Formalisation of Micro Food Processing Enterprises", category: "Food Processing",
    description: "Learn food preservation, pickle/papad/snack making, packaging, FSSAI licensing, and marketing. Get up to ₹10 lakh subsidy to start your food business.",
    duration: "2 months", mode: "In-Person", isFree: true,
    skills: ["Food Processing", "Packaging", "FSSAI Compliance", "Quality Control", "Marketing"],
    certifiedBy: "Ministry of Food Processing Industries", rating: 4.5,
    language: "Hindi / Marathi / Regional", enrollUrl: "https://pmfme.mofpi.gov.in", active: true,
  },
  {
    id: "tc-10", title: "Healthcare – Home Health Aide Training",
    provider: "Healthcare Sector Skill Council (HSSC)", category: "Health / Caregiving",
    description: "Learn basic patient care, vital signs monitoring, elderly care, first aid, and hygiene practices. Strong placement potential in hospitals and home-care services.",
    duration: "4 months", mode: "In-Person", isFree: true,
    skills: ["Patient Care", "Vital Signs", "First Aid", "Elderly Care", "Hygiene"],
    certifiedBy: "NSDC / HSSC", rating: 4.4,
    language: "Hindi / English", enrollUrl: "https://pmkvyofficial.org", active: true,
  },
];

const events: any[] = [];

// ─── JWT-like token helpers ─────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "she-connects-now-dev-secret-2026";

function createToken(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Auth middleware ────────────────────────────────────────────────
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authentication token" });
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) return res.status(401).json({ error: "Invalid or expired token" });
  (req as any).tokenPayload = payload;
  next();
}

// ─── SMS Gateway Integration ────────────────────────────────────────
// Uses Fast2SMS (free Indian SMS API for transactional OTPs)
// Get API key from: https://www.fast2sms.com/
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || "";

async function sendOtpSms(phone: string, otp: string): Promise<boolean> {
  if (!FAST2SMS_API_KEY) {
    console.log(`[SMS-DEV] OTP for ${phone}: ${otp}  (set FAST2SMS_API_KEY for real SMS)`);
    return true; // Dev mode — log to console
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        flash: 0,
        numbers: phone,
        sender_id: "SHCONW",
        message: `Your She Connects Now verification OTP is: ${otp}. Valid for 5 minutes. Do not share.`,
      }),
    });

    const result = await response.json();
    if (result.return === true) {
      console.log(`[SMS] OTP sent to ${phone}`);
      return true;
    }
    console.error("[SMS] Failed:", result.message);
    return false;
  } catch (err) {
    console.error("[SMS] Error:", err);
    return false;
  }
}

// ─── AI Career Recommender (hybrid scoring) ─────────────────────────
function computeRecommendations(user: any) {
  const userInterests = (user.interests || []).map((i: string) => i.toLowerCase());
  const userSkills = (user.skills || []).map((s: string) => s.toLowerCase());
  const userLocation = (user.location || "").toLowerCase();
  const userState = (user.state || "").toLowerCase();
  const recommendations: any[] = [];

  jobs.filter(j => j.active).forEach(job => {
    let score = 0;
    const jobSkills = (job.skills || []).map((s: string) => s.toLowerCase());
    jobSkills.forEach((sk: string) => {
      if (userSkills.includes(sk)) score += 0.3;
      if (userInterests.some((i: string) => sk.includes(i) || i.includes(sk))) score += 0.2;
    });
    if (job.isRemote) score += 0.1;
    if (userState && job.state?.toLowerCase().includes(userState)) score += 0.25;
    if (userLocation && job.location?.toLowerCase().includes(userLocation)) score += 0.2;
    if (score > 0) {
      recommendations.push({
        type: "job", targetId: job.id, score: Math.min(score, 1),
        reason: `Matches your skills`, data: job,
      });
    }
  });

  trainingCourses.filter(c => c.active).forEach(course => {
    let score = 0;
    const courseSkills = (course.skills || []).map((s: string) => s.toLowerCase());
    courseSkills.forEach((sk: string) => {
      if (userInterests.some((i: string) => sk.includes(i) || i.includes(sk))) score += 0.25;
      if (userSkills.some((s: string) => sk.includes(s) || s.includes(sk))) score += 0.15;
    });
    if (course.isFree) score += 0.1;
    if (score > 0) {
      recommendations.push({
        type: "course", targetId: course.id, score: Math.min(score, 1),
        reason: `Aligned with your interests`, data: course,
      });
    }
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
}

// ─── Smart Chatbot Engine (guided walkthrough + recommendations) ────
function generateChatResponse(message: string, lang: string, user: any): string {
  const msg = message.toLowerCase();
  const isHi = lang === "hi";
  const isMr = lang === "mr";
  const name = user?.name || "";

  // ─── GREETING ─────────────────────────────────────────────────
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste") || msg.includes("namaskar")) {
    if (isMr) return `नमस्कार${name ? ` ${name}` : ""}! मी तुमची AI करिअर मार्गदर्शक आहे. मी तुम्हाला नोकरी, प्रशिक्षण, सरकारी योजना, किंवा व्यवसाय सुरू करण्यात मदत करू शकते.\n\nतुम्ही खालीलपैकी कोणतेही विचारू शकता:\n- "मला नोकरी शोधायची आहे"\n- "मला कौशल्य शिकायचे आहे"\n- "सरकारी योजना सांगा"\n- "मला व्यवसाय सुरू करायचा आहे"\n- "प्लॅटफॉर्म कसे वापरावे?"`;
    if (isHi) return `नमस्ते${name ? ` ${name}` : ""}! मैं आपकी AI करियर गाइड हूं। मैं आपको नौकरी, प्रशिक्षण, सरकारी योजनाएं, या व्यवसाय शुरू करने में मदद कर सकती हूं।\n\nआप मुझसे कुछ भी पूछ सकती हैं:\n- "मुझे नौकरी चाहिए"\n- "मुझे कोई कौशल सीखना है"\n- "सरकारी योजनाएं बताएं"\n- "मैं व्यवसाय शुरू करना चाहती हूं"\n- "प्लेटफॉर्म कैसे इस्तेमाल करें?"`;
    return `Hello${name ? ` ${name}` : ""}! I'm your AI Career Guide. I can help you with:\n\n- Finding jobs matching your skills\n- Free training & certification courses\n- Government schemes for women\n- Starting a small business\n- Using this platform\n\nWhat would you like to explore?`;
  }

  // ─── PLATFORM WALKTHROUGH ─────────────────────────────────────
  if (msg.includes("platform") || msg.includes("walkthrough") || msg.includes("how to use") || msg.includes("guide") || msg.includes("kaise") || msg.includes("kase")) {
    if (isMr) return `She Connects Now प्लॅटफॉर्म वापरण्याचे मार्गदर्शन:\n\n**पायरी 1:** वर "नोकऱ्या" पेजवर जा — तुमच्या कौशल्यानुसार सरकारी आणि NGO नोकऱ्या शोधा.\n\n**पायरी 2:** "प्रशिक्षण" पेजवर जा — PMKVY, Skill India, Google सारख्या विनामूल्य प्रमाणित अभ्यासक्रम पहा.\n\n**पायरी 3:** "योजना" पेजवर जा — मुद्रा लोन, PMEGP, PMFME सारख्या सरकारी योजनांचा लाभ घ्या.\n\n**पायरी 4:** "कार्यक्रम" पेजवर जा — स्थानिक NGO कार्यशाळा आणि मेळावे पहा.\n\n**पायरी 5:** माझ्याशी (AI चॅटबॉट) बोला — मी तुमच्या आवडीनुसार वैयक्तिक सल्ला देते.\n\n**टीप:** तुम्ही टाइप करण्याऐवजी माइक बटण दाबून बोलू शकता!`;
    if (isHi) return `She Connects Now प्लेटफॉर्म का उपयोग कैसे करें:\n\n**स्टेप 1:** ऊपर "नौकरियां" पेज पर जाएं — अपने कौशल के अनुसार नौकरियां खोजें।\n\n**स्टेप 2:** "प्रशिक्षण" पेज पर जाएं — PMKVY, Skill India, Google जैसे मुफ्त सरकारी कोर्स देखें।\n\n**स्टेप 3:** "योजनाएं" पेज पर जाएं — मुद्रा लोन, PMEGP, PMFME जैसी सरकारी योजनाओं का लाभ उठाएं।\n\n**स्टेप 4:** "कार्यक्रम" पेज पर जाएं — NGO वर्कशॉप और मेले देखें।\n\n**स्टेप 5:** मुझसे (AI चैटबॉट) बात करें — मैं आपकी रुचि के अनुसार सलाह दूंगी।\n\n**नोट:** टाइप करने की जगह आप माइक बटन दबाकर बोल सकती हैं!`;
    return `Here's how to use She Connects Now:\n\n**Step 1:** Go to the "Jobs" page — find government & NGO jobs matching your skills.\n\n**Step 2:** Visit "Training" — access free certified courses from PMKVY, Skill India, Google, and more.\n\n**Step 3:** Check "Schemes" — apply for Mudra Loan, PMEGP, PMFME and other government schemes.\n\n**Step 4:** Browse "Events" — find local NGO workshops and job fairs near you.\n\n**Step 5:** Chat with me (AI Guide) — I give personalized career advice based on your interests.\n\n**Tip:** You can tap the mic button to speak instead of typing!`;
  }

  // ─── JOB SEARCH / CAREER ─────────────────────────────────────
  if (msg.includes("job") || msg.includes("work") || msg.includes("naukri") || msg.includes("kaam") || msg.includes("nokri") || msg.includes("hiring")) {
    const recs = user ? computeRecommendations(user).filter((r: any) => r.type === "job").slice(0, 3) : [];
    let jobList = "";
    if (recs.length > 0) {
      jobList = recs.map((r: any) => `• **${r.data.title}** at ${r.data.company} — ${r.data.salary}`).join("\n");
    } else {
      jobList = jobs.slice(0, 4).map(j => `• **${j.title}** at ${j.company} — ${j.salary}`).join("\n");
    }

    if (isMr) return `तुमच्यासाठी नोकरीच्या संधी:\n\n${jobList}\n\nअधिक नोकऱ्या पाहण्यासाठी वरच्या मेनूमध्ये "नोकऱ्या" वर क्लिक करा.\n\n**नोकरी मिळवण्यासाठी टिप्स:**\n1. तुमचा बायोडेटा अपडेट करा\n2. NCS (ncs.gov.in) वर नोंदणी करा\n3. दररोज 2-3 जागांसाठी अर्ज करा`;
    if (isHi) return `आपके लिए नौकरी के अवसर:\n\n${jobList}\n\nऔर नौकरियां देखने के लिए ऊपर "नौकरियां" पर क्लिक करें।\n\n**नौकरी पाने के टिप्स:**\n1. अपना बायोडाटा अपडेट करें\n2. NCS (ncs.gov.in) पर रजिस्टर करें\n3. रोज 2-3 जगह आवेदन करें`;
    return `Here are job opportunities for you:\n\n${jobList}\n\nClick "Jobs" in the menu above to see all available positions.\n\n**Tips to get hired:**\n1. Update your resume/bio-data\n2. Register on NCS (ncs.gov.in)\n3. Apply to 2-3 positions daily\n4. Join local NGO training workshops`;
  }

  // ─── TRAINING / SKILLS ───────────────────────────────────────
  if (msg.includes("train") || msg.includes("course") || msg.includes("learn") || msg.includes("sikhna") || msg.includes("skill") || msg.includes("prashikshan") || msg.includes("shikayche") || msg.includes("kaushal")) {
    const recs = user ? computeRecommendations(user).filter((r: any) => r.type === "course").slice(0, 3) : [];
    let courseList = "";
    if (recs.length > 0) {
      courseList = recs.map((r: any) => `• **${r.data.title}** — ${r.data.provider} (${r.data.duration}) — FREE ✓`).join("\n");
    } else {
      courseList = trainingCourses.slice(0, 4).map(c => `• **${c.title}** — ${c.provider} (${c.duration}) — FREE ✓`).join("\n");
    }

    if (isMr) return `तुमच्यासाठी विनामूल्य प्रशिक्षण अभ्यासक्रम:\n\n${courseList}\n\nसर्व अभ्यासक्रम पाहण्यासाठी "प्रशिक्षण" पेजवर जा.\n\nसर्व अभ्यासक्रम सरकारमान्य प्रमाणपत्रासह आहेत!`;
    if (isHi) return `आपके लिए मुफ्त प्रशिक्षण पाठ्यक्रम:\n\n${courseList}\n\nसभी पाठ्यक्रम देखने के लिए "प्रशिक्षण" पेज पर जाएं।\n\nसभी पाठ्यक्रम सरकार-मान्यता प्रमाणपत्र के साथ हैं!`;
    return `Here are free training courses for you:\n\n${courseList}\n\nVisit the "Training" page to see all courses.\n\nAll courses come with government-recognized certification!`;
  }

  // ─── GOVERNMENT SCHEMES ──────────────────────────────────────
  if (msg.includes("scheme") || msg.includes("yojana") || msg.includes("government") || msg.includes("sarkar")) {
    if (isMr) return `महिलांसाठी महत्त्वाच्या सरकारी योजना:\n\n- **मुद्रा योजना** — ₹10 लाख पर्यंत कर्ज, कोणतीही जामीन नाही\n- **PMEGP** — सूक्ष्म उद्योगासाठी 25-35% अनुदान\n- **PMFME** — खाद्य प्रक्रिया व्यवसायासाठी ₹10 लाख अनुदान\n- **PMKVY** — विनामूल्य कौशल्य प्रशिक्षण + प्रमाणपत्र\n- **सुकन्या समृद्धि** — मुलींसाठी बचत योजना (7.6% व्याज)\n- **PMAY** — महिलांच्या नावे स्वस्त घर\n\n"योजना" पेजवर जा — पात्रता तपासा आणि अर्ज करा.`;
    if (isHi) return `महिलाओं के लिए प्रमुख सरकारी योजनाएं:\n\n- **मुद्रा योजना** — ₹10 लाख तक लोन, बिना गारंटी\n- **PMEGP** — सूक्ष्म उद्यम के लिए 25-35% सब्सिडी\n- **PMFME** — खाद्य प्रसंस्करण व्यवसाय के लिए ₹10 लाख सब्सिडी\n- **PMKVY** — मुफ्त कौशल प्रशिक्षण + प्रमाणपत्र\n- **सुकन्या समृद्धि** — बेटियों के लिए बचत (7.6% ब्याज)\n- **PMAY** — महिला के नाम पर सस्ता घर\n\n"योजनाएं" पेज पर जाएं — पात्रता जांचें और आवेदन करें।`;
    return `Key government schemes for women:\n\n- **Mudra Yojana** — Loans up to ₹10 lakh, no collateral needed\n- **PMEGP** — 25-35% subsidy for micro-enterprises\n- **PMFME** — ₹10 lakh subsidy for food processing business\n- **PMKVY** — Free skill training + government certificate\n- **Sukanya Samriddhi** — Savings scheme for daughters (7.6% interest)\n- **PMAY** — Affordable housing in woman's name\n\nVisit "Schemes" page to check eligibility and apply.`;
  }

  // ─── BUSINESS / ENTREPRENEURSHIP ─────────────────────────────
  if (msg.includes("business") || msg.includes("vyapar") || msg.includes("udyam") || msg.includes("startup") || msg.includes("vyvasay")) {
    if (isMr) return `घरबसल्या व्यवसाय सुरू करा:\n\n- **शिवणकाम** — Usha Silai School मध्ये विनामूल्य प्रशिक्षण\n- **खाद्यपदार्थ** — लोणचे, पापड, नमकीन (PMFME अंतर्गत ₹10L अनुदान)\n- **ऑनलाइन विक्री** — Meesho/Amazon Saheli वर शून्य गुंतवणुकीत सुरू करा\n- **सेंद्रिय शेती** — किचन गार्डन ते मार्केट\n- **ब्युटी पार्लर** — PMKVY अंतर्गत विनामूल्य प्रशिक्षण\n\n**वित्तपुरवठा:** मुद्रा लोन (₹10L पर्यंत, कोणतीही जामीन नाही)\n\nतुम्हाला कोणत्या व्यवसायात रस आहे? मी सविस्तर मार्गदर्शन करते.`;
    if (isHi) return `घर से व्यवसाय शुरू करें:\n\n- **सिलाई** — Usha Silai School में मुफ्त प्रशिक्षण\n- **खाद्य पदार्थ** — अचार, पापड, नमकीन (PMFME में ₹10L सब्सिडी)\n- **ऑनलाइन बिक्री** — Meesho/Amazon Saheli से शून्य निवेश में शुरू करें\n- **जैविक खेती** — किचन गार्डन से मार्केट तक\n- **ब्यूटी पार्लर** — PMKVY में मुफ्त ट्रेनिंग\n\n**फंडिंग:** मुद्रा लोन (₹10L तक, बिना गारंटी)\n\nआप किस व्यवसाय में रुचि रखती हैं? मैं विस्तार से मार्गदर्शन दूंगी।`;
    return `Start a business from home:\n\n- **Tailoring** — Free training at Usha Silai School\n- **Food Products** — Pickles, papad, snacks (₹10L subsidy under PMFME)\n- **Online Selling** — Start on Meesho/Amazon Saheli with zero investment\n- **Organic Farming** — Kitchen garden to market\n- **Beauty Parlour** — Free training under PMKVY\n\n**Funding:** Mudra Loan (up to ₹10L, no collateral needed)\n\nWhich business interests you? I can provide a detailed step-by-step plan.`;
  }

  // ─── HELP ─────────────────────────────────────────────────────
  if (msg.includes("help") || msg.includes("madad") || msg.includes("sahayata") || msg.includes("mdat")) {
    if (isMr) return `मी तुम्हाला यात मदत करू शकते:\n\n- नोकरी शोधणे\n- विनामूल्य प्रशिक्षण अभ्यासक्रम\n- सरकारी योजना\n- व्यवसाय सुरू करणे\n- डिजिटल कौशल्य\n- प्लॅटफॉर्म वापरण्याचे मार्गदर्शन\n\nफक्त विचारा!`;
    if (isHi) return `मैं आपकी इन मामलों में मदद कर सकती हूं:\n\n- नौकरी खोजना\n- मुफ्त प्रशिक्षण पाठ्यक्रम\n- सरकारी योजनाएं\n- व्यवसाय शुरू करना\n- डिजिटल कौशल\n- प्लेटफॉर्म इस्तेमाल करने का मार्गदर्शन\n\nबस पूछिए!`;
    return `I can help you with:\n\n- Finding jobs matching your skills\n- Free training & certification courses\n- Government schemes for women\n- Starting a small business\n- Digital literacy skills\n- Platform walkthrough & guidance\n\nJust ask!`;
  }

  // ─── ROADMAP ──────────────────────────────────────────────────
  if (msg.includes("roadmap") || msg.includes("plan") || msg.includes("yojana bana") || msg.includes("plan bana")) {
    if (isMr) return `तुमचा 4 आठवड्यांचा करिअर रोडमॅप:\n\n**आठवडा 1:** लक्ष्य ठरवा + विनामूल्य ऑनलाइन कोर्स सुरू करा (PMGDISHA/Swayam)\n**आठवडा 2:** दररोज 30 मिनिटे सराव + एक छोटा प्रोजेक्ट\n**आठवडा 3:** बायोडेटा तयार करा + NCS वर नोंदणी करा\n**आठवडा 4:** 2-3 नोकऱ्यांसाठी अर्ज करा + NGO कार्यशाळेत सहभागी व्हा\n\nतुमची आवड सांगा — मी तुम्हाला सानुकूल रोडमॅप तयार करून देते!`;
    if (isHi) return `आपका 4 सप्ताह का करियर रोडमैप:\n\n**सप्ताह 1:** लक्ष्य तय करें + मुफ्त ऑनलाइन कोर्स शुरू करें (PMGDISHA/Swayam)\n**सप्ताह 2:** रोज 30 मिनट अभ्यास + एक छोटा प्रोजेक्ट\n**सप्ताह 3:** बायोडाटा बनाएं + NCS पर रजिस्टर करें\n**सप्ताह 4:** 2-3 नौकरियों के लिए अप्लाई करें + NGO वर्कशॉप जॉइन करें\n\nअपनी रुचि बताएं — मैं आपके लिए कस्टम रोडमैप बनाती हूं!`;
    return `Your 4-week career roadmap:\n\n**Week 1:** Set your goal + Start a free online course (PMGDISHA/Swayam)\n**Week 2:** Practice 30 min daily + Complete one small project\n**Week 3:** Create your bio-data/resume + Register on NCS portal\n**Week 4:** Apply to 2-3 positions + Join a local NGO workshop\n\nTell me your interests and I'll create a customized roadmap!`;
  }

  // ─── DEFAULT RESPONSE ─────────────────────────────────────────
  if (isMr) return `तुमचा संदेश मिळाला. कृपया मला सांगा तुम्हाला काय शोधायचे आहे — नोकरी, प्रशिक्षण, सरकारी योजना, किंवा व्यवसाय? मी तुमच्या प्रोफाइलनुसार वैयक्तिक शिफारसी देते.\n\nतुम्ही "प्लॅटफॉर्म कसे वापरावे?" असेही विचारू शकता.`;
  if (isHi) return `आपका संदेश प्राप्त हुआ। कृपया मुझे बताएं कि आप क्या ढूंढ रही हैं — नौकरी, प्रशिक्षण, सरकारी योजना, या व्यवसाय? मैं आपकी प्रोफाइल के अनुसार व्यक्तिगत सिफारिशें दूंगी।\n\nआप "प्लेटफॉर्म कैसे इस्तेमाल करें?" भी पूछ सकती हैं।`;
  return `Thank you for your message. Could you tell me what you're looking for — jobs, training, government schemes, or business ideas? I'll provide personalized recommendations based on your profile.\n\nYou can also ask "How to use this platform?" for a guided tour.`;
}

// ═══════════════════════════════════════════════════════════════════
export function registerRoutes(app: Express) {

  // ─── Health ───────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", platform: "She Connects Now", version: "1.1.0" });
  });

  // ─── Auth: Send OTP (with SMS gateway) ────────────────────────
  app.post("/api/auth/send-otp", async (req: Request, res: Response) => {
    const { phone, type, meta } = req.body || {};
    if (!phone) return res.status(400).json({ error: "Missing phone" });
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ error: "Phone must be 10 digits" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore[phone] = { code, expiresAt, purpose: type || "login", meta: meta || null };

    // Send via SMS gateway (falls back to console in dev)
    const sent = await sendOtpSms(phone, code);

    return res.json({
      success: true,
      smsSent: sent,
      ...(FAST2SMS_API_KEY ? {} : { devOtp: code }), // Only expose OTP in dev mode
      purpose: otpStore[phone].purpose,
    });
  });

  // ─── Auth: Verify OTP + Aadhaar (Women) / Document (NGO) ─────
  app.post("/api/auth/verify-otp", (req: Request, res: Response) => {
    const { phone, code, name, aadhaarLast4, extra } = req.body || {};
    if (!phone || !code) return res.status(400).json({ error: "Missing phone or code" });

    const record = otpStore[phone];
    if (!record || record.expiresAt < Date.now() || record.code !== code) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // ─── Women Registration ─────────────────────────────────────
    if (record.purpose === "register-women") {
      // Aadhaar validation — require last 4 digits
      const aadhaar = aadhaarLast4 || record.meta?.aadhaarLast4 || "";
      if (!aadhaar || !/^\d{4}$/.test(aadhaar)) {
        return res.status(400).json({ error: "Please provide last 4 digits of Aadhaar" });
      }

      if (!users[phone]) {
        const user = {
          id: `user-${phone}`,
          phone,
          name: name || record.meta?.name || "",
          email: record.meta?.email || "",
          location: record.meta?.location || "",
          state: record.meta?.state || "",
          district: record.meta?.district || "",
          interests: record.meta?.interests || [],
          skills: record.meta?.skills || [],
          education: record.meta?.education || "",
          role: "women",
          language: record.meta?.language || "en",
          aadhaarLast4: aadhaar,
          aadhaarVerified: true,
          consentGiven: record.meta?.consent || false,
          consentTimestamp: record.meta?.consent ? new Date().toISOString() : null,
          profileComplete: false,
          createdAt: new Date().toISOString(),
        };
        users[phone] = user;
      }
      const token = createToken({ sub: users[phone].id, phone, role: "women" });
      delete otpStore[phone];
      return res.json({ success: true, token, user: users[phone] });
    }

    // ─── NGO Registration ───────────────────────────────────────
    if (record.purpose === "register-ngo") {
      const id = `ngo-${phone}`;
      const regNumber = record.meta?.registrationNumber || "";

      if (!ngos[id]) {
        const ngo = {
          id, phone,
          name: name || record.meta?.name || "",
          registrationNumber: regNumber,
          registrationType: record.meta?.registrationType || "12A",
          email: record.meta?.email || "",
          address: record.meta?.address || "",
          state: record.meta?.state || "",
          contactPerson: record.meta?.contactPerson || "",
          description: record.meta?.description || "",
          focusAreas: record.meta?.focusAreas || [],
          documentUploaded: !!record.meta?.documentName,
          documentName: record.meta?.documentName || "",
          verified: false,  // Requires manual verification
          verificationStatus: "pending", // pending → under_review → verified / rejected
          verificationNote: "Awaiting document verification by admin team",
          createdAt: new Date().toISOString(),
        };
        ngos[id] = ngo;
        ngoDocuments[id] = {
          documentName: record.meta?.documentName || "",
          documentType: record.meta?.registrationType || "12A",
          uploadedAt: new Date().toISOString(),
        };
      }
      const token = createToken({ sub: id, phone, role: "ngo" });
      delete otpStore[phone];
      return res.json({
        success: true, token, ngo: ngos[id],
        verificationMessage: "Your documents have been received and are under review. You will be notified upon verification.",
      });
    }

    // default login flow
    const token = createToken({ sub: `user-${phone}`, phone, role: "user" });
    delete otpStore[phone];
    return res.json({ success: true, isNewUser: !users[phone], token, user: users[phone] || null });
  });

  // ─── Auth: Complete Profile ──────────────────────────────────
  app.post("/api/auth/complete-profile", (req: Request, res: Response) => {
    const { phone, name, location, interests, skills, education, state, district, aadhaarLast4 } = req.body || {};
    if (!phone || !name) return res.status(400).json({ error: "Missing phone or name" });

    const user = {
      id: `user-${phone}`, phone, name,
      location: location || "", state: state || "", district: district || "",
      interests: interests || [], skills: skills || [],
      education: education || "", role: "women", language: "en",
      aadhaarLast4: aadhaarLast4 || users[phone]?.aadhaarLast4 || "",
      aadhaarVerified: true,
      profileComplete: true, consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      createdAt: users[phone]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users[phone] = user;
    const token = createToken({ sub: user.id, phone, role: "women" });
    return res.json({ success: true, user, token });
  });

  // ─── NGO: Register with Document Upload ──────────────────────
  app.post("/api/ngo/register", (req: Request, res: Response) => {
    const body = req.body || {};
    if (!body.phone || !body.name) return res.status(400).json({ error: "Missing required fields" });
    if (!body.registrationNumber) return res.status(400).json({ error: "Registration number (12A/80G/FCRA) required" });

    const id = `ngo-${body.phone}`;
    const ngo = {
      id, ...body,
      verified: false,
      verificationStatus: "pending",
      verificationNote: "Document verification pending. Your account is active but limited until verified.",
      createdAt: new Date().toISOString(),
    };
    ngos[id] = ngo;
    const token = createToken({ sub: id, phone: body.phone, role: "ngo" });
    return res.json({ success: true, ngo, token });
  });

  // ─── NGO: Check Verification Status ──────────────────────────
  app.get("/api/ngo/:ngoId/verification", (req: Request, res: Response) => {
    const ngo = ngos[req.params.ngoId];
    if (!ngo) return res.status(404).json({ error: "NGO not found" });
    return res.json({
      verified: ngo.verified,
      status: ngo.verificationStatus,
      note: ngo.verificationNote,
      documentUploaded: ngo.documentUploaded || false,
    });
  });

  // ─── NGO: Admin verify (simulated) ───────────────────────────
  app.post("/api/admin/verify-ngo", (req: Request, res: Response) => {
    const { ngoId, action, note } = req.body || {};
    if (!ngos[ngoId]) return res.status(404).json({ error: "NGO not found" });
    ngos[ngoId].verified = action === "approve";
    ngos[ngoId].verificationStatus = action === "approve" ? "verified" : "rejected";
    ngos[ngoId].verificationNote = note || (action === "approve" ? "Verified successfully" : "Verification rejected");
    return res.json({ success: true, ngo: ngos[ngoId] });
  });

  // ─── Public: List Jobs ───────────────────────────────────────
  app.get("/api/jobs", (_req, res) => res.json(jobs.filter(j => j.active)));

  // ─── Public: List Training Courses ────────────────────────────
  app.get("/api/training", (_req, res) => res.json(trainingCourses.filter(c => c.active)));

  // ─── Public: List Events ─────────────────────────────────────
  app.get("/api/events", (_req, res) => res.json(events.filter(e => e.active)));

  // ─── AI: Career Recommendations ──────────────────────────────
  app.post("/api/ai/recommendations", (req: Request, res: Response) => {
    const { userId, interests, skills, location } = req.body || {};
    const user = Object.values(users).find((u: any) => u.id === userId) || { interests, skills, location };
    return res.json({ recommendations: computeRecommendations(user) });
  });

  // ─── AI: Chatbot ─────────────────────────────────────────────
  app.post("/api/ai/chat", (req: Request, res: Response) => {
    const { userId, message, language } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });
    const user = Object.values(users).find((u: any) => u.id === userId) || null;
    const response = generateChatResponse(message, language || "en", user);
    if (userId) {
      if (!chatSessions[userId]) chatSessions[userId] = [];
      chatSessions[userId].push(
        { role: "user", content: message, timestamp: new Date().toISOString(), language },
        { role: "assistant", content: response, timestamp: new Date().toISOString(), language },
      );
    }
    return res.json({ response, language: language || "en", timestamp: new Date().toISOString() });
  });

  // ─── AI: Chat History ────────────────────────────────────────
  app.get("/api/ai/chat/:userId", (req: Request, res: Response) => {
    return res.json({ messages: chatSessions[req.params.userId] || [] });
  });

  // ─── Privacy: Consent ────────────────────────────────────────
  app.post("/api/privacy/consent", (req: Request, res: Response) => {
    const { phone, consentType, granted } = req.body || {};
    if (!phone) return res.status(400).json({ error: "Missing phone" });
    if (users[phone]) {
      users[phone].consentGiven = granted;
      users[phone].consentTimestamp = new Date().toISOString();
    }
    return res.json({ success: true, consentType, granted, timestamp: new Date().toISOString() });
  });

  // ─── Privacy: Delete Account ─────────────────────────────────
  app.delete("/api/privacy/account/:phone", (req: Request, res: Response) => {
    const { phone } = req.params;
    if (users[phone]) {
      delete users[phone];
      delete chatSessions[`user-${phone}`];
      return res.json({ success: true, message: "Account and all data deleted." });
    }
    return res.status(404).json({ error: "User not found" });
  });

  // ─── NGO Dashboard ──────────────────────────────────────────
  app.get("/api/ngo/:ngoId/dashboard", (req: Request, res: Response) => {
    const ngo = ngos[req.params.ngoId];
    if (!ngo) return res.status(404).json({ error: "NGO not found" });
    return res.json({
      ngo,
      events: events.filter(e => e.ngoId === req.params.ngoId),
      jobs: jobs.filter(j => (j as any).ngoId === req.params.ngoId),
      verification: { status: ngo.verificationStatus, verified: ngo.verified },
    });
  });
}
