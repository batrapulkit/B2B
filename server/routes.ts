import type { Express } from "express";
import { getAuth } from "@clerk/express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertItinerarySchema, insertInvoiceSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth, requireRole } from "./clerkAuth"; // ✅ Clerk middleware

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ Clerk middleware is initialized globally in index.ts
  // No setupAuth() needed anymore

  // ---------------------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------------------

app.get("/api/auth/user", requireAuth, async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Directly fetch Clerk user info
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    const user = await response.json();
    res.json({
      id: user.id,
      email: user.email_addresses?.[0]?.email_address,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  } catch (error) {
    console.error("Error fetching Clerk user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});


  // ---------------------------------------------------------------------
  // CLIENT ROUTES
  // ---------------------------------------------------------------------
  app.get("/api/clients", requireAuth, requireRole("admin", "agent"), async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Client not found" });
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.patch("/api/clients/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const updateSchema = insertClientSchema.partial();
      const validated = updateSchema.parse(req.body);
      const client = await storage.updateClient(req.params.id, validated);
      if (!client) return res.status(404).json({ message: "Client not found" });
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const success = await storage.deleteClient(req.params.id);
      if (!success) return res.status(404).json({ message: "Client not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // ---------------------------------------------------------------------
  // ITINERARY ROUTES
  // ---------------------------------------------------------------------
  app.get("/api/itineraries", requireAuth, requireRole("admin", "agent"), async (_req, res) => {
    try {
      const itineraries = await storage.getAllItineraries();
      res.json(itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      res.status(500).json({ message: "Failed to fetch itineraries" });
    }
  });

  app.get("/api/itineraries/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const itinerary = await storage.getItinerary(req.params.id);
      if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });
      res.json(itinerary);
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      res.status(500).json({ message: "Failed to fetch itinerary" });
    }
  });

  app.post("/api/itineraries", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const validatedData = insertItinerarySchema.parse(req.body);
      const itinerary = await storage.createItinerary(validatedData);
      res.status(201).json(itinerary);
    } catch (error) {
      console.error("Error creating itinerary:", error);
      res.status(400).json({ message: "Invalid itinerary data" });
    }
  });

  app.patch("/api/itineraries/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const updateSchema = insertItinerarySchema.partial();
      const validated = updateSchema.parse(req.body);
      const itinerary = await storage.updateItinerary(req.params.id, validated);
      if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });
      res.json(itinerary);
    } catch (error) {
      console.error("Error updating itinerary:", error);
      res.status(400).json({ message: "Invalid itinerary data" });
    }
  });

  app.delete("/api/itineraries/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const success = await storage.deleteItinerary(req.params.id);
      if (!success) return res.status(404).json({ message: "Itinerary not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      res.status(500).json({ message: "Failed to delete itinerary" });
    }
  });

  // ---------------------------------------------------------------------
  // INVOICE ROUTES
  // ---------------------------------------------------------------------
  app.get("/api/invoices", requireAuth, requireRole("admin", "agent"), async (_req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  app.patch("/api/invoices/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const updateSchema = insertInvoiceSchema.partial();
      const validated = updateSchema.parse(req.body);
      const invoice = await storage.updateInvoice(req.params.id, validated);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  // ---------------------------------------------------------------------
  // AI ITINERARY GENERATION
  // ---------------------------------------------------------------------
  app.post("/api/llm/generate-itinerary", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const { messages, destination, budget, duration, travelers, preferences } = req.body;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an expert travel planner. Create a detailed itinerary based on:
Destination: ${destination}
Budget: ${budget}
Duration: ${duration}
Travelers: ${travelers}
Preferences: ${preferences || "None"}

${messages && messages.length ? `Conversation:\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}` : ''}

Provide:
1. Daily activities
2. Dining suggestions
3. Stay options
4. Local transport advice
5. Budget breakdown
6. Local insights
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      res.json({
        itinerary: text,
        destination,
        budget,
        duration,
        travelers,
      });
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ message: "Failed to generate itinerary" });
    }
  });

  // ---------------------------------------------------------------------
  // CHAT SESSIONS
  // ---------------------------------------------------------------------
  app.get("/api/chat-sessions", requireAuth, requireRole("admin", "agent"), async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const sessions = await storage.getChatSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat-sessions", requireAuth, requireRole("admin", "agent"), async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const session = await storage.createChatSession({
        userId,
        clientId: req.body.clientId || null,
        messages: req.body.messages || "[]",
      });
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.patch("/api/chat-sessions/:id", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const session = await storage.updateChatSession(req.params.id, req.body);
      if (!session) return res.status(404).json({ message: "Chat session not found" });
      res.json(session);
    } catch (error) {
      console.error("Error updating chat session:", error);
      res.status(500).json({ message: "Failed to update chat session" });
    }
  });

  // ---------------------------------------------------------------------
  // PAYMENTS
  // ---------------------------------------------------------------------
  app.post("/api/payments/create-intent", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) return res.status(400).json({ message: "Valid amount required" });

      const { createPaymentIntent } = await import("./stripe");
      const paymentIntent = await createPaymentIntent(amount);

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post("/api/invoices/:id/pay", requireAuth, requireRole("admin", "agent"), async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });

      const { createPaymentIntent } = await import("./stripe");
      const paymentIntent = await createPaymentIntent(parseFloat(invoice.amount));

      await storage.updateInvoice(req.params.id, { stripePaymentIntentId: paymentIntent.id });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Stripe webhook (no auth)
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const event = req.body;
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const invoices = await storage.getAllInvoices();
        const invoice = invoices.find(inv => inv.stripePaymentIntentId === paymentIntent.id);

        if (invoice) {
          await storage.updateInvoice(invoice.id, {
            status: "paid",
            paidAt: new Date(),
          } as any);
        }
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ message: "Webhook error" });
    }
  });

  // ---------------------------------------------------------------------
  // ANALYTICS
  // ---------------------------------------------------------------------
  app.get("/api/analytics/overview", requireAuth, requireRole("admin", "agent"), async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      const itineraries = await storage.getAllItineraries();
      const invoices = await storage.getAllInvoices();

      const totalRevenue = invoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);

      const activeClients = clients.filter(c => c.status === "active").length;
      const totalTrips = itineraries.length;
      const paidInvoices = invoices.filter(inv => inv.status === "paid").length;
      const conversionRate = invoices.length
        ? ((paidInvoices / invoices.length) * 100).toFixed(1)
        : "0";

      res.json({
        totalRevenue,
        activeClients,
        totalTrips,
        conversionRate: `${conversionRate}%`,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ---------------------------------------------------------------------
  // RETURN SERVER
  // ---------------------------------------------------------------------
  const httpServer = createServer(app);
  return httpServer;
}
