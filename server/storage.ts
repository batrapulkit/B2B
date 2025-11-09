import { db } from "./db";
import { 
  users, clients, itineraries, invoices, chatSessions,
  type User, type UpsertUser,
  type Client, type InsertClient,
  type Itinerary, type InsertItinerary,
  type Invoice, type InsertInvoice,
  type ChatSession, type InsertChatSession
} from "@shared/schema";
import { eq, desc, like, or, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  searchClients(query: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  
  // Itineraries
  getItinerary(id: string): Promise<Itinerary | undefined>;
  getAllItineraries(): Promise<Itinerary[]>;
  getItinerariesByClient(clientId: string): Promise<Itinerary[]>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  updateItinerary(id: string, itinerary: Partial<InsertItinerary>): Promise<Itinerary | undefined>;
  deleteItinerary(id: string): Promise<boolean>;
  
  // Invoices
  getInvoice(id: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  getInvoicesByClient(clientId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  
  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsByUser(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession | undefined>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async searchClients(query: string): Promise<Client[]> {
    const searchPattern = `%${query}%`;
    return await db.select().from(clients).where(
      or(
        like(clients.name, searchPattern),
        like(clients.email, searchPattern),
        like(clients.company, searchPattern)
      )
    );
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(insertClient).returning();
    return result[0];
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db.update(clients)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  // Itineraries
  async getItinerary(id: string): Promise<Itinerary | undefined> {
    const result = await db.select().from(itineraries).where(eq(itineraries.id, id));
    return result[0];
  }

  async getAllItineraries(): Promise<Itinerary[]> {
    return await db.select().from(itineraries).orderBy(desc(itineraries.createdAt));
  }

  async getItinerariesByClient(clientId: string): Promise<Itinerary[]> {
    return await db.select().from(itineraries)
      .where(eq(itineraries.clientId, clientId))
      .orderBy(desc(itineraries.createdAt));
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const dataToInsert = {
      ...insertItinerary,
      startDate: typeof insertItinerary.startDate === 'string' 
        ? new Date(insertItinerary.startDate) 
        : insertItinerary.startDate,
      endDate: typeof insertItinerary.endDate === 'string' 
        ? new Date(insertItinerary.endDate) 
        : insertItinerary.endDate,
    };
    const result = await db.insert(itineraries).values(dataToInsert).returning();
    return result[0];
  }

  async updateItinerary(id: string, updateData: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const dataToUpdate: any = { ...updateData, updatedAt: new Date() };
    if (dataToUpdate.startDate && typeof dataToUpdate.startDate === 'string') {
      dataToUpdate.startDate = new Date(dataToUpdate.startDate);
    }
    if (dataToUpdate.endDate && typeof dataToUpdate.endDate === 'string') {
      dataToUpdate.endDate = new Date(dataToUpdate.endDate);
    }
    const result = await db.update(itineraries)
      .set(dataToUpdate)
      .where(eq(itineraries.id, id))
      .returning();
    return result[0];
  }

  async deleteItinerary(id: string): Promise<boolean> {
    const result = await db.delete(itineraries).where(eq(itineraries.id, id)).returning();
    return result.length > 0;
  }

  // Invoices
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.createdAt));
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const dataToInsert = {
      ...insertInvoice,
      dueDate: typeof insertInvoice.dueDate === 'string' 
        ? new Date(insertInvoice.dueDate) 
        : insertInvoice.dueDate,
    };
    const result = await db.insert(invoices).values(dataToInsert).returning();
    return result[0];
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const dataToUpdate: any = { ...updateData, updatedAt: new Date() };
    if (dataToUpdate.dueDate && typeof dataToUpdate.dueDate === 'string') {
      dataToUpdate.dueDate = new Date(dataToUpdate.dueDate);
    }
    const result = await db.update(invoices)
      .set(dataToUpdate)
      .where(eq(invoices.id, id))
      .returning();
    return result[0];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id)).returning();
    return result.length > 0;
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const result = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return result[0];
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.createdAt));
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const result = await db.insert(chatSessions).values(insertSession).returning();
    return result[0];
  }

  async updateChatSession(id: string, updateData: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const result = await db.update(chatSessions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
