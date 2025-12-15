import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, ngos, events, chatSessions, roadmaps, savedOpportunities, governmentSchemes, otpCodes,
  type User, type InsertUser, type Ngo, type InsertNgo, type Event, type InsertEvent,
  type ChatSession, type InsertChatSession, type Roadmap, type InsertRoadmap,
  type SavedOpportunity, type InsertSavedOpportunity, type GovernmentScheme,
  type OtpCode, type ChatMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  getNgo(id: string): Promise<Ngo | undefined>;
  getNgoByPhone(phone: string): Promise<Ngo | undefined>;
  createNgo(ngo: InsertNgo): Promise<Ngo>;
  updateNgo(id: string, data: Partial<InsertNgo>): Promise<Ngo | undefined>;
  
  getEvents(filters?: { category?: string; mode?: string; state?: string }): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByNgo(ngoId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  incrementEventViews(id: string): Promise<void>;
  incrementEventClicks(id: string): Promise<void>;
  
  getChatSession(userId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | undefined>;
  
  getRoadmaps(userId: string): Promise<Roadmap[]>;
  createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap>;
  updateRoadmap(id: string, data: Partial<InsertRoadmap>): Promise<Roadmap | undefined>;
  
  getSavedOpportunities(userId: string): Promise<(SavedOpportunity & { event: Event })[]>;
  saveOpportunity(data: InsertSavedOpportunity): Promise<SavedOpportunity>;
  unsaveOpportunity(userId: string, eventId: string): Promise<boolean>;
  
  getSchemes(filters?: { category?: string; targetGroup?: string }): Promise<GovernmentScheme[]>;
  
  createOtp(phone: string, code: string, expiresAt: Date): Promise<OtpCode>;
  getValidOtp(phone: string, code: string): Promise<OtpCode | undefined>;
  markOtpUsed(id: string): Promise<void>;
  
  seedSchemes(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getNgo(id: string): Promise<Ngo | undefined> {
    const [ngo] = await db.select().from(ngos).where(eq(ngos.id, id));
    return ngo;
  }

  async getNgoByPhone(phone: string): Promise<Ngo | undefined> {
    const [ngo] = await db.select().from(ngos).where(eq(ngos.phone, phone));
    return ngo;
  }

  async createNgo(ngo: InsertNgo): Promise<Ngo> {
    const [newNgo] = await db.insert(ngos).values(ngo).returning();
    return newNgo;
  }

  async updateNgo(id: string, data: Partial<InsertNgo>): Promise<Ngo | undefined> {
    const [updated] = await db.update(ngos).set(data).where(eq(ngos.id, id)).returning();
    return updated;
  }

  async getEvents(filters?: { category?: string; mode?: string; state?: string }): Promise<Event[]> {
    const conditions = [eq(events.active, true)];
    
    if (filters?.category) {
      conditions.push(eq(events.category, filters.category));
    }
    if (filters?.mode) {
      conditions.push(eq(events.mode, filters.mode));
    }
    if (filters?.state) {
      conditions.push(eq(events.state, filters.state));
    }
    
    return await db.select().from(events).where(and(...conditions)).orderBy(desc(events.createdAt));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByNgo(ngoId: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.ngoId, ngoId)).orderBy(desc(events.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updated] = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return true;
  }

  async incrementEventViews(id: string): Promise<void> {
    await db.update(events).set({ views: sql`${events.views} + 1` }).where(eq(events.id, id));
  }

  async incrementEventClicks(id: string): Promise<void> {
    await db.update(events).set({ clicks: sql`${events.clicks} + 1` }).where(eq(events.id, id));
  }

  async getChatSession(userId: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.createdAt));
    return session;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | undefined> {
    const [updated] = await db.update(chatSessions).set({ messages, updatedAt: new Date() }).where(eq(chatSessions.id, id)).returning();
    return updated;
  }

  async getRoadmaps(userId: string): Promise<Roadmap[]> {
    return await db.select().from(roadmaps).where(eq(roadmaps.userId, userId)).orderBy(desc(roadmaps.createdAt));
  }

  async createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap> {
    const [newRoadmap] = await db.insert(roadmaps).values(roadmap).returning();
    return newRoadmap;
  }

  async updateRoadmap(id: string, data: Partial<InsertRoadmap>): Promise<Roadmap | undefined> {
    const [updated] = await db.update(roadmaps).set(data).where(eq(roadmaps.id, id)).returning();
    return updated;
  }

  async getSavedOpportunities(userId: string): Promise<(SavedOpportunity & { event: Event })[]> {
    const saved = await db.select().from(savedOpportunities).where(eq(savedOpportunities.userId, userId));
    const result: (SavedOpportunity & { event: Event })[] = [];
    
    for (const s of saved) {
      const [event] = await db.select().from(events).where(eq(events.id, s.eventId));
      if (event) {
        result.push({ ...s, event });
      }
    }
    
    return result;
  }

  async saveOpportunity(data: InsertSavedOpportunity): Promise<SavedOpportunity> {
    const [saved] = await db.insert(savedOpportunities).values(data).returning();
    return saved;
  }

  async unsaveOpportunity(userId: string, eventId: string): Promise<boolean> {
    await db.delete(savedOpportunities).where(and(eq(savedOpportunities.userId, userId), eq(savedOpportunities.eventId, eventId)));
    return true;
  }

  async getSchemes(filters?: { category?: string; targetGroup?: string }): Promise<GovernmentScheme[]> {
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(governmentSchemes.category, filters.category));
    }
    if (filters?.targetGroup) {
      conditions.push(eq(governmentSchemes.targetGroup, filters.targetGroup));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(governmentSchemes).where(and(...conditions));
    }
    return await db.select().from(governmentSchemes);
  }

  async createOtp(phone: string, code: string, expiresAt: Date): Promise<OtpCode> {
    const [otp] = await db.insert(otpCodes).values({ phone, code, expiresAt }).returning();
    return otp;
  }

  async getValidOtp(phone: string, code: string): Promise<OtpCode | undefined> {
    const [otp] = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.phone, phone),
        eq(otpCodes.code, code),
        eq(otpCodes.used, false)
      )
    );
    if (otp && new Date(otp.expiresAt) > new Date()) {
      return otp;
    }
    return undefined;
  }

  async markOtpUsed(id: string): Promise<void> {
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, id));
  }

  async seedSchemes(): Promise<void> {
    const existingSchemes = await db.select().from(governmentSchemes);
    if (existingSchemes.length > 0) return;

    const schemesData = [
      {
        name: "Beti Bachao Beti Padhao",
        nameHindi: "बेटी बचाओ बेटी पढ़ाओ",
        description: "A comprehensive scheme aimed at addressing the declining Child Sex Ratio and related issues of women empowerment over a life-cycle continuum.",
        descriptionHindi: "घटते बाल लिंग अनुपात और महिला सशक्तिकरण से संबंधित मुद्दों को संबोधित करने के लिए एक व्यापक योजना।",
        ministry: "Ministry of Women and Child Development",
        eligibility: "All girl children from birth to 10 years of age",
        benefits: "Education support, awareness campaigns, survival and protection of girl child",
        applicationLink: "https://wcd.nic.in/bbbp-schemes",
        category: "education",
        targetGroup: "girl_child"
      },
      {
        name: "Pradhan Mantri Matru Vandana Yojana",
        nameHindi: "प्रधानमंत्री मातृ वंदना योजना",
        description: "Cash incentive scheme for pregnant women and lactating mothers for the first living child.",
        descriptionHindi: "पहले जीवित बच्चे के लिए गर्भवती महिलाओं और स्तनपान कराने वाली माताओं के लिए नकद प्रोत्साहन योजना।",
        ministry: "Ministry of Women and Child Development",
        eligibility: "Pregnant women and lactating mothers for first child",
        benefits: "Rs. 5000 cash incentive in three installments",
        applicationLink: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
        category: "health",
        targetGroup: "pregnant_women"
      },
      {
        name: "Stand Up India Scheme",
        nameHindi: "स्टैंड अप इंडिया योजना",
        description: "Bank loans between Rs. 10 lakh and Rs. 1 crore to at least one SC/ST borrower and one woman borrower per bank branch.",
        descriptionHindi: "प्रति बैंक शाखा कम से कम एक एससी/एसटी उधारकर्ता और एक महिला उधारकर्ता को 10 लाख रुपये से 1 करोड़ रुपये के बीच बैंक ऋण।",
        ministry: "Ministry of Finance",
        eligibility: "Women entrepreneurs above 18 years for greenfield enterprise",
        benefits: "Loans from Rs. 10 lakh to Rs. 1 crore for manufacturing, services or trading sector",
        applicationLink: "https://www.standupmitra.in/",
        category: "entrepreneurship",
        targetGroup: "women_entrepreneurs"
      },
      {
        name: "Mahila Shakti Kendra",
        nameHindi: "महिला शक्ति केंद्र",
        description: "One-stop convergent support services for empowering rural women with opportunities for skill development and employment.",
        descriptionHindi: "कौशल विकास और रोजगार के अवसरों के साथ ग्रामीण महिलाओं को सशक्त बनाने के लिए एक-स्टॉप अभिसरण सहायता सेवाएं।",
        ministry: "Ministry of Women and Child Development",
        eligibility: "Rural women seeking skill development",
        benefits: "Skill training, digital literacy, health awareness",
        applicationLink: "https://wcd.nic.in/schemes/mahila-shakti-kendra",
        category: "skill_development",
        targetGroup: "rural_women"
      },
      {
        name: "Working Women Hostel",
        nameHindi: "कामकाजी महिला छात्रावास",
        description: "Safe and affordable accommodation for working women in urban areas.",
        descriptionHindi: "शहरी क्षेत्रों में कामकाजी महिलाओं के लिए सुरक्षित और किफायती आवास।",
        ministry: "Ministry of Women and Child Development",
        eligibility: "Working women with monthly income up to Rs. 50,000",
        benefits: "Subsidized hostel accommodation with daycare facilities",
        applicationLink: "https://wcd.nic.in/schemes/working-women-hostel",
        category: "housing",
        targetGroup: "working_women"
      },
      {
        name: "Sukanya Samriddhi Yojana",
        nameHindi: "सुकन्या समृद्धि योजना",
        description: "Small deposit scheme for girl child with high interest rate and tax benefits.",
        descriptionHindi: "उच्च ब्याज दर और कर लाभ के साथ बालिकाओं के लिए छोटी जमा योजना।",
        ministry: "Ministry of Finance",
        eligibility: "Parents/guardians of girl child below 10 years",
        benefits: "8.2% annual interest, tax exemption under 80C, maturity at girl's 21st birthday",
        applicationLink: "https://www.india.gov.in/sukanya-samriddhi-yojna",
        category: "financial",
        targetGroup: "girl_child"
      },
      {
        name: "Mahila E-Haat",
        nameHindi: "महिला ई-हाट",
        description: "Online marketing platform for women entrepreneurs and SHGs to showcase products.",
        descriptionHindi: "महिला उद्यमियों और स्वयं सहायता समूहों के लिए उत्पादों को प्रदर्शित करने हेतु ऑनलाइन मार्केटिंग प्लेटफॉर्म।",
        ministry: "Ministry of Women and Child Development",
        eligibility: "Women entrepreneurs, SHGs, NGOs working with women",
        benefits: "Free online platform to sell products, no commission charges",
        applicationLink: "http://mahilaehaat-rmk.gov.in/",
        category: "entrepreneurship",
        targetGroup: "women_entrepreneurs"
      },
      {
        name: "One Stop Centre Scheme",
        nameHindi: "वन स्टॉप सेंटर योजना",
        description: "Integrated support to women affected by violence, both in private and public spaces.",
        descriptionHindi: "निजी और सार्वजनिक स्थानों पर हिंसा से प्रभावित महिलाओं को एकीकृत सहायता।",
        ministry: "Ministry of Women and Child Development",
        eligibility: "All women affected by violence including domestic violence",
        benefits: "Medical, legal, psychological counselling, police assistance, shelter",
        applicationLink: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1",
        category: "safety",
        targetGroup: "all_women"
      }
    ];

    await db.insert(governmentSchemes).values(schemesData);
  }
}

export const storage = new DatabaseStorage();
