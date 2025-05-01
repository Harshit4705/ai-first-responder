import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Analysis results table to store injury assessments
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url"),
  injuryType: text("injury_type").notNull(),
  severity: decimal("severity", { precision: 3, scale: 1 }).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  firstAidInstructions: jsonb("first_aid_instructions").notNull(),
  recommendedAction: text("recommended_action").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Medical facilities table
export const medicalFacilities = pgTable("medical_facilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  phone: text("phone"),
  openHours: text("open_hours"),
  facilityType: text("facility_type").notNull(),
  emergencyServices: boolean("emergency_services").default(false),
});

// Chat history for chatbot assistant
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const analysesInsertSchema = createInsertSchema(analyses, {
  severity: (schema) => schema.refine((val) => val >= 0 && val <= 10, "Severity must be between 0 and 10"),
  confidence: (schema) => schema.refine((val) => val >= 0 && val <= 1, "Confidence must be between 0 and 1"),
});
export type AnalysisInsert = z.infer<typeof analysesInsertSchema>;
export type Analysis = typeof analyses.$inferSelect;

export const medicalFacilitiesInsertSchema = createInsertSchema(medicalFacilities);
export type MedicalFacilityInsert = z.infer<typeof medicalFacilitiesInsertSchema>;
export type MedicalFacility = typeof medicalFacilities.$inferSelect;

export const chatMessagesInsertSchema = createInsertSchema(chatMessages);
export type ChatMessageInsert = z.infer<typeof chatMessagesInsertSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Analysis input schema for API validation
export const analysisInputSchema = z.object({
  image: z.string().min(1, "Image is required"),
});

// Chatbot input schema
export const chatInputSchema = z.object({
  message: z.string().min(1, "Message is required"),
  userId: z.number().optional(),
});

// Location input schema
export const locationInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
