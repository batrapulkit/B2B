import { supabase } from "./supabase";
import type {
  User, UpsertUser,
  Client, InsertClient,
  Itinerary, InsertItinerary,
  Invoice, InsertInvoice,
  ChatSession, InsertChatSession
} from "@shared/schema";

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

function mapUserFromDb(dbUser: any): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    profileImageUrl: dbUser.profile_image_url,
    role: dbUser.role,
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  };
}

function mapClientFromDb(dbClient: any): Client {
  return {
    id: dbClient.id,
    name: dbClient.name,
    email: dbClient.email,
    phone: dbClient.phone,
    company: dbClient.company,
    status: dbClient.status,
    notes: dbClient.notes,
    createdAt: new Date(dbClient.created_at),
    updatedAt: new Date(dbClient.updated_at),
  };
}

function mapItineraryFromDb(dbItinerary: any): Itinerary {
  return {
    id: dbItinerary.id,
    clientId: dbItinerary.client_id,
    destination: dbItinerary.destination,
    startDate: new Date(dbItinerary.start_date),
    endDate: new Date(dbItinerary.end_date),
    travelers: dbItinerary.travelers,
    budget: dbItinerary.budget,
    status: dbItinerary.status,
    content: dbItinerary.content,
    imageUrl: dbItinerary.image_url,
    createdAt: new Date(dbItinerary.created_at),
    updatedAt: new Date(dbItinerary.updated_at),
  };
}

function mapInvoiceFromDb(dbInvoice: any): Invoice {
  return {
    id: dbInvoice.id,
    invoiceNumber: dbInvoice.invoice_number,
    clientId: dbInvoice.client_id,
    itineraryId: dbInvoice.itinerary_id,
    amount: dbInvoice.amount,
    status: dbInvoice.status,
    dueDate: new Date(dbInvoice.due_date),
    paidAt: dbInvoice.paid_at ? new Date(dbInvoice.paid_at) : null,
    stripePaymentIntentId: dbInvoice.stripe_payment_intent_id,
    createdAt: new Date(dbInvoice.created_at),
    updatedAt: new Date(dbInvoice.updated_at),
  };
}

function mapChatSessionFromDb(dbSession: any): ChatSession {
  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    clientId: dbSession.client_id,
    messages: dbSession.messages,
    createdAt: new Date(dbSession.created_at),
    updatedAt: new Date(dbSession.updated_at),
  };
}

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return mapUserFromDb(data);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const dbData = {
      id: userData.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      profile_image_url: userData.profileImageUrl,
      role: userData.role || 'agent',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(dbData, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to upsert user: ${error.message}`);
    return mapUserFromDb(data);
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return mapClientFromDb(data);
  }

  async getAllClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get clients: ${error.message}`);
    return (data || []).map(mapClientFromDb);
  }

  async searchClients(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`);
    
    if (error) throw new Error(`Failed to search clients: ${error.message}`);
    return (data || []).map(mapClientFromDb);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: insertClient.name,
        email: insertClient.email,
        phone: insertClient.phone,
        company: insertClient.company,
        status: insertClient.status || 'lead',
        notes: insertClient.notes,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create client: ${error.message}`);
    return mapClientFromDb(data);
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const dbData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updateData.name !== undefined) dbData.name = updateData.name;
    if (updateData.email !== undefined) dbData.email = updateData.email;
    if (updateData.phone !== undefined) dbData.phone = updateData.phone;
    if (updateData.company !== undefined) dbData.company = updateData.company;
    if (updateData.status !== undefined) dbData.status = updateData.status;
    if (updateData.notes !== undefined) dbData.notes = updateData.notes;

    const { data, error } = await supabase
      .from('clients')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return mapClientFromDb(data);
  }

  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Itineraries
  async getItinerary(id: string): Promise<Itinerary | undefined> {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return mapItineraryFromDb(data);
  }

  async getAllItineraries(): Promise<Itinerary[]> {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get itineraries: ${error.message}`);
    return (data || []).map(mapItineraryFromDb);
  }

  async getItinerariesByClient(clientId: string): Promise<Itinerary[]> {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get itineraries: ${error.message}`);
    return (data || []).map(mapItineraryFromDb);
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const { data, error } = await supabase
      .from('itineraries')
      .insert({
        client_id: insertItinerary.clientId,
        destination: insertItinerary.destination,
        start_date: typeof insertItinerary.startDate === 'string' 
          ? insertItinerary.startDate 
          : insertItinerary.startDate.toISOString(),
        end_date: typeof insertItinerary.endDate === 'string' 
          ? insertItinerary.endDate 
          : insertItinerary.endDate.toISOString(),
        travelers: insertItinerary.travelers || 1,
        budget: insertItinerary.budget,
        status: insertItinerary.status || 'draft',
        content: insertItinerary.content,
        image_url: insertItinerary.imageUrl,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create itinerary: ${error.message}`);
    return mapItineraryFromDb(data);
  }

  async updateItinerary(id: string, updateData: Partial<InsertItinerary>): Promise<Itinerary | undefined> {
    const dbData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updateData.clientId !== undefined) dbData.client_id = updateData.clientId;
    if (updateData.destination !== undefined) dbData.destination = updateData.destination;
    if (updateData.startDate !== undefined) {
      dbData.start_date = typeof updateData.startDate === 'string' 
        ? updateData.startDate 
        : updateData.startDate.toISOString();
    }
    if (updateData.endDate !== undefined) {
      dbData.end_date = typeof updateData.endDate === 'string' 
        ? updateData.endDate 
        : updateData.endDate.toISOString();
    }
    if (updateData.travelers !== undefined) dbData.travelers = updateData.travelers;
    if (updateData.budget !== undefined) dbData.budget = updateData.budget;
    if (updateData.status !== undefined) dbData.status = updateData.status;
    if (updateData.content !== undefined) dbData.content = updateData.content;
    if (updateData.imageUrl !== undefined) dbData.image_url = updateData.imageUrl;

    const { data, error } = await supabase
      .from('itineraries')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return mapItineraryFromDb(data);
  }

  async deleteItinerary(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Invoices
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return mapInvoiceFromDb(data);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get invoices: ${error.message}`);
    return (data || []).map(mapInvoiceFromDb);
  }

  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get invoices: ${error.message}`);
    return (data || []).map(mapInvoiceFromDb);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: insertInvoice.invoiceNumber,
        client_id: insertInvoice.clientId,
        itinerary_id: insertInvoice.itineraryId,
        amount: insertInvoice.amount,
        status: insertInvoice.status || 'pending',
        due_date: typeof insertInvoice.dueDate === 'string' 
          ? insertInvoice.dueDate 
          : insertInvoice.dueDate.toISOString(),
        stripe_payment_intent_id: insertInvoice.stripePaymentIntentId,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create invoice: ${error.message}`);
    return mapInvoiceFromDb(data);
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const dbData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updateData.invoiceNumber !== undefined) dbData.invoice_number = updateData.invoiceNumber;
    if (updateData.clientId !== undefined) dbData.client_id = updateData.clientId;
    if (updateData.itineraryId !== undefined) dbData.itinerary_id = updateData.itineraryId;
    if (updateData.amount !== undefined) dbData.amount = updateData.amount;
    if (updateData.status !== undefined) dbData.status = updateData.status;
    if (updateData.dueDate !== undefined) {
      dbData.due_date = typeof updateData.dueDate === 'string' 
        ? updateData.dueDate 
        : updateData.dueDate.toISOString();
    }
    if (updateData.stripePaymentIntentId !== undefined) {
      dbData.stripe_payment_intent_id = updateData.stripePaymentIntentId;
    }
    if ((updateData as any).paidAt !== undefined) {
      dbData.paid_at = (updateData as any).paidAt instanceof Date
        ? (updateData as any).paidAt.toISOString()
        : (updateData as any).paidAt;
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return mapInvoiceFromDb(data);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return mapChatSessionFromDb(data);
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get chat sessions: ${error.message}`);
    return (data || []).map(mapChatSessionFromDb);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: insertSession.userId,
        client_id: insertSession.clientId,
        messages: insertSession.messages || '[]',
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create chat session: ${error.message}`);
    return mapChatSessionFromDb(data);
  }

  async updateChatSession(id: string, updateData: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const dbData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updateData.userId !== undefined) dbData.user_id = updateData.userId;
    if (updateData.clientId !== undefined) dbData.client_id = updateData.clientId;
    if (updateData.messages !== undefined) dbData.messages = updateData.messages;

    const { data, error } = await supabase
      .from('chat_sessions')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return mapChatSessionFromDb(data);
  }
}

import { MockStorage } from "./mockStorage";
const USE_MOCK = process.env.MOCK_MODE === "true";
export const storage = USE_MOCK ? new MockStorage() : new SupabaseStorage();


