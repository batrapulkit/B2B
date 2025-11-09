import { z } from "zod";

// User types
export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
  role: z.string().optional(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  role: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = z.infer<typeof userSchema>;

// Client types
export const insertClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["lead", "active", "inactive"]).optional(),
  notes: z.string().optional(),
});

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  status: z.string(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = z.infer<typeof clientSchema>;

// Itinerary types
export const insertItinerarySchema = z.object({
  clientId: z.string(),
  destination: z.string().min(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  travelers: z.number().int().positive().optional(),
  budget: z.string().optional(),
  status: z.enum(["draft", "confirmed", "completed"]).optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const itinerarySchema = z.object({
  id: z.string(),
  clientId: z.string(),
  destination: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  travelers: z.number(),
  budget: z.string().nullable(),
  status: z.string(),
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;

// Invoice types
export const insertInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  clientId: z.string(),
  itineraryId: z.string().optional(),
  amount: z.string(),
  status: z.enum(["pending", "paid", "overdue"]).optional(),
  dueDate: z.string().or(z.date()),
  stripePaymentIntentId: z.string().optional(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  clientId: z.string(),
  itineraryId: z.string().nullable(),
  amount: z.string(),
  status: z.string(),
  dueDate: z.date(),
  paidAt: z.date().nullable(),
  stripePaymentIntentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

// Chat Session types
export const insertChatSessionSchema = z.object({
  userId: z.string(),
  clientId: z.string().optional(),
  messages: z.string().optional(),
});

export const chatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  clientId: z.string().nullable(),
  messages: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
