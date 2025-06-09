import { pgTable, text, serial, integer, boolean, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  bedrooms: varchar("bedrooms", { length: 50 }).notNull(),
  rent: decimal("rent", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  available: boolean("available").default(true),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  source: varchar("source", { length: 100 }),
  preferences: text("preferences"),
  propertyId: integer("property_id").references(() => properties.id),
});

export const agentSchedules = pgTable("agent_schedules", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time", { length: 10 }).notNull(), // HH:MM format
  endTime: varchar("end_time", { length: 10 }).notNull(), // HH:MM format
  isActive: boolean("is_active").default(true),
});

export const showingRequests = pgTable("showing_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  requestedDate: varchar("requested_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  requestedTime: varchar("requested_time", { length: 10 }).notNull(), // HH:MM format
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const scheduledShowings = pgTable("scheduled_showings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  showingDate: varchar("showing_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  showingTime: varchar("showing_time", { length: 10 }).notNull(), // HH:MM format
  duration: integer("duration").default(30), // minutes
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbackSessions = pgTable("feedback_sessions", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => leads.id),
  propertyId: integer("property_id").references(() => properties.id),
  sessionType: varchar("session_type", { length: 20 }).notNull(), // 'discovery' | 'post_tour'
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active' | 'completed' | 'abandoned'
  preferredResponseMethod: varchar("preferred_response_method", { length: 20 }), // 'voice' | 'text' | 'dropdown' | 'emoji'
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  sessionData: text("session_data"), // JSON string for storing responses and context
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbackResponses = pgTable("feedback_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => feedbackSessions.id),
  questionText: text("question_text").notNull(),
  responseText: text("response_text"),
  responseMethod: varchar("response_method", { length: 20 }).notNull(),
  aiGeneratedQuestion: boolean("ai_generated_question").notNull().default(true),
  metadata: text("metadata"), // JSON for storing additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertyPerformance = pgTable("property_performance", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  vacancyDate: varchar("vacancy_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  inquiryCount: integer("inquiry_count").notNull().default(0),
  tourCount: integer("tour_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const feedbackSummaries = pgTable("feedback_summaries", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  category: varchar("category", { length: 50 }).notNull(), // 'price', 'amenities', 'location', 'size', 'comparison', 'suggestions'
  summaryText: text("summary_text").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  editedBy: varchar("edited_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull().unique(),
  isLicensedAgent: boolean("is_licensed_agent").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  
  // Licensed Agent Fields
  licenseNumber: varchar("license_number", { length: 50 }),
  licenseState: varchar("license_state", { length: 2 }),
  licenseExpiration: varchar("license_expiration", { length: 10 }), // YYYY-MM-DD
  brokerageName: varchar("brokerage_name", { length: 200 }),
  brokerageAddress: text("brokerage_address"),
  brokeragePhone: varchar("brokerage_phone", { length: 20 }),
  yearsExperience: integer("years_experience"),
  specialties: text("specialties"), // JSON array of specialties
  
  // Property Owner Fields
  companyName: varchar("company_name", { length: 200 }),
  businessAddress: text("business_address"),
  numberOfProperties: integer("number_of_properties"),
  propertyTypes: text("property_types"), // JSON array of property types
  
  // Common Fields
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  socialMediaLinks: text("social_media_links"), // JSON object
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
});

export const insertAgentScheduleSchema = createInsertSchema(agentSchedules).omit({
  id: true,
});

export const insertShowingRequestSchema = createInsertSchema(showingRequests).omit({
  id: true,
  createdAt: true,
});

export const insertScheduledShowingSchema = createInsertSchema(scheduledShowings).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSessionSchema = createInsertSchema(feedbackSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackResponseSchema = createInsertSchema(feedbackResponses).omit({
  id: true,
  createdAt: true,
});

export const insertPropertyPerformanceSchema = createInsertSchema(propertyPerformance).omit({
  id: true,
  lastUpdated: true,
});

export const insertFeedbackSummarySchema = createInsertSchema(feedbackSummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertAgentSchedule = z.infer<typeof insertAgentScheduleSchema>;
export type AgentSchedule = typeof agentSchedules.$inferSelect;
export type InsertShowingRequest = z.infer<typeof insertShowingRequestSchema>;
export type ShowingRequest = typeof showingRequests.$inferSelect;
export type InsertScheduledShowing = z.infer<typeof insertScheduledShowingSchema>;
export type ScheduledShowing = typeof scheduledShowings.$inferSelect;
export type InsertFeedbackSession = z.infer<typeof insertFeedbackSessionSchema>;
export type FeedbackSession = typeof feedbackSessions.$inferSelect;
export type InsertFeedbackResponse = z.infer<typeof insertFeedbackResponseSchema>;
export type FeedbackResponse = typeof feedbackResponses.$inferSelect;
export type InsertPropertyPerformance = z.infer<typeof insertPropertyPerformanceSchema>;
export type PropertyPerformance = typeof propertyPerformance.$inferSelect;
export type InsertFeedbackSummary = z.infer<typeof insertFeedbackSummarySchema>;
export type FeedbackSummary = typeof feedbackSummaries.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
