// ─── Shared Schema ────────────────────────────────────────────────────
// Single source of truth for all types used by both client and server.
// Modelled after the research project requirements:
//   • Users (Women) & Foundations/NGOs
//   • Jobs, Training Courses, Government Schemes
//   • AI Chat, Career Roadmaps, Recommendations
// ──────────────────────────────────────────────────────────────────────

// ─── User (Women) ────────────────────────────────────────────────────
export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  location: string;
  state?: string;
  district?: string;
  interests: string[];
  skills: string[];
  education?: string;
  age?: number;
  role: "user" | "women";
  language: "en" | "hi" | "ta" | "te" | "mr" | "bn";
  consentGiven?: boolean;
  consentTimestamp?: string;
  profileComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── NGO / Foundation / Organization ─────────────────────────────────
export interface Ngo {
  id: string;
  name: string;
  registrationNumber?: string;
  phone: string;
  email?: string;
  address?: string;
  state: string;
  district?: string;
  description?: string;
  contactPerson: string;
  website?: string;
  certificateUrl?: string;
  verified: boolean;
  focusAreas?: string[];
  createdAt: string;
  updatedAt?: string;
}

// ─── Event (Course / Workshop / Awareness Program) ───────────────────
export interface Event {
  id: string;
  ngoId: string;
  title: string;
  description?: string;
  category: string; // course, workshop, job, awareness, training
  domain?: string;
  mode: string; // online, offline, hybrid
  location?: string;
  state?: string;
  skillsRequired?: string[];
  targetAudience?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  registrationLink?: string;
  websiteLink?: string;
  flyerUrl?: string;
  views?: number;
  clicks?: number;
  active?: boolean;
  createdAt?: Date | string;
}

// ─── Job Posting ─────────────────────────────────────────────────────
export interface Job {
  id: string;
  ngoId?: string;
  title: string;
  company: string;
  description: string;
  category: string; // full-time, part-time, freelance, micro-enterprise
  skills: string[];
  location: string;
  state?: string;
  district?: string;
  isRemote: boolean;
  salary?: string;
  experienceRequired?: string;
  educationRequired?: string;
  applicationLink?: string;
  deadline?: string;
  postedAt: string;
  active: boolean;
}

// ─── Training Course ────────────────────────────────────────────────
export interface TrainingCourse {
  id: string;
  ngoId?: string;
  title: string;
  provider: string;
  description: string;
  category: string; // digital-literacy, vocational, professional, certification
  skills: string[];
  duration: string;
  mode: string; // online, offline, hybrid
  language: string;
  location?: string;
  state?: string;
  isCertified: boolean;
  certificateProvider?: string;
  fee?: string;
  isFree: boolean;
  enrollmentLink?: string;
  startDate?: string;
  rating?: number;
  enrollmentCount?: number;
  active: boolean;
}

// ─── Government Scheme ──────────────────────────────────────────────
export interface GovernmentScheme {
  id: string;
  name: string;
  nameHindi?: string;
  description: string;
  descriptionHindi?: string;
  category: string; // education, employment, entrepreneurship, health, financial, skill
  ministry?: string;
  targetGroup?: string;
  eligibility?: string;
  benefits?: string;
  applicationLink?: string;
  documentsRequired?: string[];
  state?: string; // if state-specific
  active?: boolean;
}

// ─── Career Roadmap ─────────────────────────────────────────────────
export interface RoadmapWeek {
  week: number;
  title: string;
  tasks: RoadmapTask[];
}

export interface RoadmapTask {
  id: string;
  task: string;
  completed: boolean;
  resourceUrl?: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  goal: string;
  weeks: RoadmapWeek[];
  progress: number;
  createdAt: string;
  updatedAt?: string;
}

// ─── Chat ───────────────────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
}

// ─── Application (Women applying to Jobs/Courses) ────────────────────
export interface Application {
  id: string;
  userId: string;
  targetId: string; // job or course id
  targetType: "job" | "course" | "scheme";
  status: "pending" | "accepted" | "rejected" | "enrolled";
  appliedAt: string;
  notes?: string;
}

// ─── Recommendation ─────────────────────────────────────────────────
export interface Recommendation {
  id: string;
  userId: string;
  type: "job" | "course" | "scheme" | "event";
  targetId: string;
  score: number; // 0-1 relevance score from AI/ML
  reason: string;
  createdAt: string;
}

// ─── Consent Record (Privacy-Preserving) ─────────────────────────────
export interface ConsentRecord {
  userId: string;
  consentType: "data-collection" | "analytics" | "communication";
  granted: boolean;
  timestamp: string;
  ipAddress?: string;
}

// ─── Notification ───────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "opportunity";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
