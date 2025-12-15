import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  email: text("email"),
  location: text("location"),
  state: text("state"),
  interests: text("interests").array(),
  skills: text("skills").array(),
  role: text("role").notNull().default("user"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ngos = pgTable("ngos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  registrationNumber: text("registration_number"),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  address: text("address"),
  state: text("state"),
  district: text("district"),
  description: text("description"),
  contactPerson: text("contact_person"),
  website: text("website"),
  certificateUrl: text("certificate_url"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ngoId: varchar("ngo_id").notNull().references(() => ngos.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  mode: text("mode").notNull(),
  location: text("location"),
  state: text("state"),
  skillsRequired: text("skills_required").array(),
  targetAudience: text("target_audience"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  registrationLink: text("registration_link"),
  websiteLink: text("website_link"),
  flyerUrl: text("flyer_url"),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  messages: jsonb("messages").notNull().default([]),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const roadmaps = pgTable("roadmaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  goal: text("goal"),
  weeks: jsonb("weeks").notNull().default([]),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedOpportunities = pgTable("saved_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const governmentSchemes = pgTable("government_schemes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameHindi: text("name_hindi"),
  description: text("description"),
  descriptionHindi: text("description_hindi"),
  ministry: text("ministry"),
  eligibility: text("eligibility"),
  benefits: text("benefits"),
  applicationLink: text("application_link"),
  category: text("category"),
  targetGroup: text("target_group"),
});

export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  chatSessions: many(chatSessions),
  roadmaps: many(roadmaps),
  savedOpportunities: many(savedOpportunities),
}));

export const ngosRelations = relations(ngos, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  ngo: one(ngos, { fields: [events.ngoId], references: [ngos.id] }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertNgoSchema = createInsertSchema(ngos).omit({ id: true, createdAt: true, verified: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, views: true, clicks: true });
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRoadmapSchema = createInsertSchema(roadmaps).omit({ id: true, createdAt: true });
export const insertSavedOpportunitySchema = createInsertSchema(savedOpportunities).omit({ id: true, createdAt: true });
export const insertGovernmentSchemeSchema = createInsertSchema(governmentSchemes).omit({ id: true });
export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNgo = z.infer<typeof insertNgoSchema>;
export type Ngo = typeof ngos.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type Roadmap = typeof roadmaps.$inferSelect;
export type InsertSavedOpportunity = z.infer<typeof insertSavedOpportunitySchema>;
export type SavedOpportunity = typeof savedOpportunities.$inferSelect;
export type GovernmentScheme = typeof governmentSchemes.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type RoadmapWeek = {
  week: number;
  title: string;
  tasks: { id: string; task: string; completed: boolean }[];
};
