import type {
  User, UpsertUser,
  Client, InsertClient,
  Itinerary, InsertItinerary,
  Invoice, InsertInvoice,
  ChatSession, InsertChatSession
} from "@shared/schema";
import type { IStorage } from "./storage";

function now() { return new Date().toISOString(); }

const makeClient = (id: number): Client => ({
  id: id.toString(),
  name: `Client ${id}`,
  email: `client${id}@demo.com`,
  phone: "+1-555-0000",
  company: "DemoCorp",
  status: "active",
  notes: "Mock client",
  createdAt: new Date(),
  updatedAt: new Date(),
});


const makeItinerary = (id: number): Itinerary => ({
  id: id.toString(),
  clientId: "1",
  destination: ["Paris", "Tokyo", "Rome"][id % 3],
  startDate: new Date(),
  endDate: new Date(),
  travelers: 2,
  budget: "$2000",
  status: "draft",
  content: "Mock itinerary plan",
  imageUrl: "https://source.unsplash.com/random/800x600?travel",
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeInvoice = (id: number): Invoice => ({
  id: id.toString(),
  invoiceNumber: `INV-${1000 + id}`,
  clientId: "1",
  itineraryId: "1",
  amount: "1200",
  status: id % 2 ? "paid" : "pending",
  dueDate: new Date(),
  paidAt: id % 2 ? new Date() : null,
  stripePaymentIntentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeChat = (id: number): ChatSession => ({
  id: id.toString(),
  userId: "1",
  clientId: "1",
  messages: JSON.stringify([{ role: "assistant", content: "Welcome to Triponic B2B!" }]),
  createdAt: new Date(),
  updatedAt: new Date(),
});

export class MockStorage implements IStorage {
  async getUser() { return undefined; }
  async upsertUser(user: UpsertUser) { return { ...user, createdAt: new Date(), updatedAt: new Date() } as any; }

  async getClient(id: string) { return makeClient(parseInt(id) || 1); }
  async getAllClients() { return Array.from({ length: 5 }, (_, i) => makeClient(i + 1)); }
  async searchClients() { return Array.from({ length: 2 }, (_, i) => makeClient(i + 1)); }
  async createClient(client: InsertClient) { return { ...client, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() } as any; }
  async updateClient(id: string, client: Partial<InsertClient>) { return { id, ...client, updatedAt: new Date() } as any; }
  async deleteClient() { return true; }

  async getItinerary(id: string) { return makeItinerary(parseInt(id) || 1); }
  async getAllItineraries() { return Array.from({ length: 3 }, (_, i) => makeItinerary(i + 1)); }
  async getItinerariesByClient() { return Array.from({ length: 2 }, (_, i) => makeItinerary(i + 1)); }
  async createItinerary(itinerary: InsertItinerary) { return { ...itinerary, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() } as any; }
  async updateItinerary(id: string, it: Partial<InsertItinerary>) { return { id, ...it, updatedAt: new Date() } as any; }
  async deleteItinerary() { return true; }

  async getInvoice(id: string) { return makeInvoice(parseInt(id) || 1); }
  async getAllInvoices() { return Array.from({ length: 3 }, (_, i) => makeInvoice(i + 1)); }
  async getInvoicesByClient() { return Array.from({ length: 2 }, (_, i) => makeInvoice(i + 1)); }
  async createInvoice(inv: InsertInvoice) { return { ...inv, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() } as any; }
  async updateInvoice(id: string, inv: Partial<InsertInvoice>) { return { id, ...inv, updatedAt: new Date() } as any; }
  async deleteInvoice() { return true; }

  async getChatSession(id: string) { return makeChat(parseInt(id) || 1); }
  async getChatSessionsByUser() { return Array.from({ length: 2 }, (_, i) => makeChat(i + 1)); }
  async createChatSession(session: InsertChatSession) { return { ...session, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() } as any; }
  async updateChatSession(id: string, s: Partial<InsertChatSession>) { return { id, ...s, updatedAt: new Date() } as any; }
}

export async function getMockAnalytics() {
  return {
    totalRevenue: 123450,
    activeClients: 12,
    totalTrips: 36,
    conversionRate: "48.5%",
  };
}
