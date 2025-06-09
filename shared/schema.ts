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
