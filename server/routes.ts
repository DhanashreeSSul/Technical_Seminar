import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertNgoSchema, insertEventSchema, insertRoadmapSchema, type ChatMessage } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

interface AuthRequest extends Request {
  userId?: string;
  ngoId?: string;
  userType?: "user" | "ngo";
}

const sessions: Map<string, { id: string; type: "user" | "ngo"; expiresAt: Date }> = new Map();

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const session = sessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    sessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  
  if (session.type === "user") {
    req.userId = session.id;
  } else {
    req.ngoId = session.id;
  }
  req.userType = session.type;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedSchemes();

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = z.object({ phone: z.string().min(10) }).parse(req.body);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await storage.createOtp(phone, code, expiresAt);
      console.log(`OTP for ${phone}: ${code}`);
      res.json({ success: true, message: "OTP sent successfully", devOtp: code });
    } catch (error) {
      res.status(400).json({ error: "Invalid phone number" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phone, code, type } = z.object({
        phone: z.string().min(10),
        code: z.string().length(6),
        type: z.enum(["user", "ngo"]).default("user")
      }).parse(req.body);

      const otp = await storage.getValidOtp(phone, code);
      if (!otp) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      await storage.markOtpUsed(otp.id);

      if (type === "ngo") {
        let ngo = await storage.getNgoByPhone(phone);
        if (!ngo) {
          return res.status(404).json({ error: "NGO not found. Please register first.", needsRegistration: true });
        }
        const token = generateSessionToken();
        sessions.set(token, { id: ngo.id, type: "ngo", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        return res.json({ success: true, token, ngo, isNewUser: false });
      }

      let user = await storage.getUserByPhone(phone);
      const isNewUser = !user;
      
      if (!user) {
        user = await storage.createUser({ phone, role: "user" });
      }

      const token = generateSessionToken();
      sessions.set(token, { id: user.id, type: "user", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

      res.json({ success: true, token, user, isNewUser });
    } catch (error) {
      res.status(400).json({ error: "Verification failed" });
    }
  });

  app.post("/api/auth/complete-profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const data = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.userId, data);
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/user/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await storage.getUser(req.userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/user/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const data = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.userId, data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/user/roadmaps", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const roadmaps = await storage.getRoadmaps(req.userId);
      res.json(roadmaps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roadmaps" });
    }
  });

  app.post("/api/user/roadmaps", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const data = insertRoadmapSchema.parse({ ...req.body, userId: req.userId });
      const roadmap = await storage.createRoadmap(data);
      res.json(roadmap);
    } catch (error) {
      res.status(400).json({ error: "Failed to create roadmap" });
    }
  });

  app.patch("/api/user/roadmaps/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const roadmap = await storage.updateRoadmap(req.params.id, req.body);
      res.json(roadmap);
    } catch (error) {
      res.status(400).json({ error: "Failed to update roadmap" });
    }
  });

  app.get("/api/user/saved-events", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const saved = await storage.getSavedOpportunities(req.userId);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved events" });
    }
  });

  app.post("/api/user/saved-events", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { eventId } = z.object({ eventId: z.string() }).parse(req.body);
      const saved = await storage.saveOpportunity({ userId: req.userId, eventId });
      res.json(saved);
    } catch (error) {
      res.status(400).json({ error: "Failed to save event" });
    }
  });

  app.delete("/api/user/saved-events/:eventId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      await storage.unsaveOpportunity(req.userId, req.params.eventId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to unsave event" });
    }
  });

  app.get("/api/user/recommendations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await storage.getUser(req.userId);
      const allEvents = await storage.getEvents();
      
      let recommendations = allEvents;
      if (user?.state) {
        recommendations = allEvents.filter(e => e.state === user.state || e.mode === "online");
      }
      if (user?.interests?.length) {
        recommendations = recommendations.filter(e => 
          user.interests?.some(interest => e.category?.toLowerCase().includes(interest.toLowerCase()))
        );
      }
      
      res.json(recommendations.slice(0, 10));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/chat/history", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const session = await storage.getChatSession(req.userId);
      res.json(session?.messages || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  app.post("/api/chat/message", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { message, language } = z.object({
        message: z.string().min(1),
        language: z.enum(["en", "hi"]).default("en")
      }).parse(req.body);

      const user = await storage.getUser(req.userId);
      let session = await storage.getChatSession(req.userId);
      
      if (!session) {
        session = await storage.createChatSession({
          userId: req.userId,
          messages: [],
          language
        });
      }

      const currentMessages = (session.messages as ChatMessage[]) || [];
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      };
      currentMessages.push(userMessage);

      let assistantContent: string;

      if (process.env.OPENAI_API_KEY) {
        const systemPrompt = language === "hi" 
          ? `आप EmpowerHer की एक सहायक AI हैं, जो महिला सशक्तिकरण प्लेटफॉर्म है। आप महिलाओं को करियर मार्गदर्शन, कौशल विकास, सरकारी योजनाओं की जानकारी, और प्रेरणादायक सलाह प्रदान करती हैं। कृपया हिंदी में उत्तर दें। उपयोगकर्ता का नाम ${user?.name || 'दीदी'} है।`
          : `You are a helpful AI assistant for EmpowerHer, a women empowerment platform. You help women with career guidance, skill development advice, information about government schemes, and motivational support. The user's name is ${user?.name || 'there'}. Be warm, supportive, and encouraging.`;

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              ...currentMessages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
            ],
            max_tokens: 500
          });
          assistantContent = completion.choices[0].message.content || "I'm here to help you!";
        } catch (aiError) {
          assistantContent = language === "hi" 
            ? "मैं अभी आपकी मदद करने में असमर्थ हूं। कृपया बाद में पुनः प्रयास करें।"
            : "I'm having trouble responding right now. Please try again later.";
        }
      } else {
        const responses = language === "hi" ? {
          greeting: "नमस्ते! मैं EmpowerHer AI हूं। मैं आपकी करियर, कौशल विकास, और सरकारी योजनाओं के बारे में मदद कर सकती हूं।",
          career: "करियर चुनने के लिए, पहले अपनी रुचियों और कौशलों की सूची बनाएं। फिर उन क्षेत्रों की खोज करें जहां ये कौशल उपयोगी हों।",
          skills: "कौशल विकास के लिए, ऑनलाइन कोर्स, सरकारी प्रशिक्षण कार्यक्रम, और स्थानीय NGO कार्यशालाएं देखें।",
          schemes: "महिलाओं के लिए कई सरकारी योजनाएं हैं जैसे स्टैंड अप इंडिया, मुद्रा योजना, और महिला ई-हाट।",
          default: "मैं आपकी मदद के लिए यहां हूं। कृपया अपना प्रश्न विस्तार से बताएं।"
        } : {
          greeting: "Hello! I'm EmpowerHer AI. I can help you with career guidance, skill development, and government schemes for women.",
          career: "To choose a career, first list your interests and skills. Then explore fields where these skills are valuable. Consider online courses to build expertise.",
          skills: "For skill development, explore online courses on platforms like Coursera, government training programs, and local NGO workshops.",
          schemes: "There are many government schemes for women like Stand Up India, Mudra Yojana, and Mahila E-Haat for entrepreneurs.",
          default: "I'm here to help you succeed! Please tell me more about what you'd like to know."
        };

        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("नमस्ते")) {
          assistantContent = responses.greeting;
        } else if (lowerMessage.includes("career") || lowerMessage.includes("करियर") || lowerMessage.includes("job")) {
          assistantContent = responses.career;
        } else if (lowerMessage.includes("skill") || lowerMessage.includes("कौशल") || lowerMessage.includes("learn")) {
          assistantContent = responses.skills;
        } else if (lowerMessage.includes("scheme") || lowerMessage.includes("योजना") || lowerMessage.includes("government")) {
          assistantContent = responses.schemes;
        } else {
          assistantContent = responses.default;
        }
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date().toISOString()
      };
      currentMessages.push(assistantMessage);

      await storage.updateChatSession(session.id, currentMessages);

      res.json({ message: assistantMessage, history: currentMessages });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  app.post("/api/ngo/register", async (req, res) => {
    try {
      const data = insertNgoSchema.parse(req.body);
      
      const existing = await storage.getNgoByPhone(data.phone);
      if (existing) {
        return res.status(400).json({ error: "NGO with this phone already exists" });
      }

      const ngo = await storage.createNgo(data);
      
      const token = generateSessionToken();
      sessions.set(token, { id: ngo.id, type: "ngo", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

      res.json({ success: true, ngo, token });
    } catch (error) {
      console.error("NGO registration error:", error);
      res.status(400).json({ error: "Failed to register NGO" });
    }
  });

  app.get("/api/ngo/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.ngoId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const ngo = await storage.getNgo(req.ngoId);
      res.json(ngo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/ngo/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.ngoId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const data = insertNgoSchema.partial().parse(req.body);
      const ngo = await storage.updateNgo(req.ngoId, data);
      res.json(ngo);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/ngo/events", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.ngoId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const events = await storage.getEventsByNgo(req.ngoId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/ngo/events", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.ngoId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const data = insertEventSchema.parse({ ...req.body, ngoId: req.ngoId });
      const event = await storage.createEvent(data);
      res.json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(400).json({ error: "Failed to create event" });
    }
  });

  app.patch("/api/ngo/events/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.ngoId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const event = await storage.getEvent(req.params.id);
      if (!event || event.ngoId !== req.ngoId) {
        return res.status(403).json({ error: "Not authorized to update this event" });
      }
      const updated = await storage.updateEvent(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/ngo/events/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.ngoId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const event = await storage.getEvent(req.params.id);
      if (!event || event.ngoId !== req.ngoId) {
        return res.status(403).json({ error: "Not authorized to delete this event" });
      }
      await storage.deleteEvent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete event" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const { category, mode, state } = req.query;
      const filters: { category?: string; mode?: string; state?: string } = {};
      if (category) filters.category = category as string;
      if (mode) filters.mode = mode as string;
      if (state) filters.state = state as string;
      
      const events = await storage.getEvents(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      await storage.incrementEventViews(req.params.id);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events/:id/click", async (req, res) => {
    try {
      await storage.incrementEventClicks(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  app.get("/api/schemes", async (req, res) => {
    try {
      const { category, targetGroup } = req.query;
      const filters: { category?: string; targetGroup?: string } = {};
      if (category) filters.category = category as string;
      if (targetGroup) filters.targetGroup = targetGroup as string;
      
      const schemes = await storage.getSchemes(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(schemes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schemes" });
    }
  });

  return httpServer;
}
