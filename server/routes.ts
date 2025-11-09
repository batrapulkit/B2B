import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import { insertClientSchema, insertItinerarySchema, insertInvoiceSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Client routes (Admin/Agent only)
  app.get("/api/clients", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.patch("/api/clients/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const updateSchema = insertClientSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const client = await storage.updateClient(req.params.id, validatedData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const success = await storage.deleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Itinerary routes (Admin/Agent only)
  app.get("/api/itineraries", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const itineraries = await storage.getAllItineraries();
      res.json(itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      res.status(500).json({ message: "Failed to fetch itineraries" });
    }
  });

  app.get("/api/itineraries/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const itinerary = await storage.getItinerary(req.params.id);
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      res.json(itinerary);
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      res.status(500).json({ message: "Failed to fetch itinerary" });
    }
  });

  app.post("/api/itineraries", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const validatedData = insertItinerarySchema.parse(req.body);
      const itinerary = await storage.createItinerary(validatedData);
      res.status(201).json(itinerary);
    } catch (error) {
      console.error("Error creating itinerary:", error);
      res.status(400).json({ message: "Invalid itinerary data" });
    }
  });

  app.patch("/api/itineraries/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const updateSchema = insertItinerarySchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const itinerary = await storage.updateItinerary(req.params.id, validatedData);
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      res.json(itinerary);
    } catch (error) {
      console.error("Error updating itinerary:", error);
      res.status(400).json({ message: "Invalid itinerary data" });
    }
  });

  app.delete("/api/itineraries/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const success = await storage.deleteItinerary(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      res.status(500).json({ message: "Failed to delete itinerary" });
    }
  });

  // Invoice routes (Admin/Agent only)
  app.get("/api/invoices", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  app.patch("/api/invoices/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const updateSchema = insertInvoiceSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const invoice = await storage.updateInvoice(req.params.id, validatedData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  // AI Itinerary Generation (Admin/Agent only)
  app.post("/api/llm/generate-itinerary", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const { messages, destination, budget, duration, travelers, preferences } = req.body;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert travel planner. Create a detailed travel itinerary based on the following information:

Destination: ${destination}
Budget: ${budget}
Duration: ${duration}
Number of travelers: ${travelers}
Preferences: ${preferences || "None specified"}

${messages && messages.length > 0 ? `Previous conversation:\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\n` : ''}

Please provide a comprehensive day-by-day itinerary that includes:
1. Daily activities and attractions
2. Recommended restaurants and dining options
3. Accommodation suggestions
4. Transportation tips
5. Budget breakdown
6. Packing recommendations
7. Local tips and cultural insights

Format the response in a clear, organized manner with headings and bullet points.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

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

  // Chat sessions (Admin/Agent only)
  app.get("/api/chat-sessions", isAuthenticated, requireRole("admin", "agent"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat-sessions", isAuthenticated, requireRole("admin", "agent"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.patch("/api/chat-sessions/:id", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const session = await storage.updateChatSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating chat session:", error);
      res.status(500).json({ message: "Failed to update chat session" });
    }
  });

  // Payment routes (Admin/Agent only)
  app.post("/api/payments/create-intent", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

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

  app.post("/api/invoices/:id/pay", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const { createPaymentIntent } = await import("./stripe");
      const paymentIntent = await createPaymentIntent(parseFloat(invoice.amount));

      await storage.updateInvoice(req.params.id, {
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Error processing invoice payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const event = req.body;

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const invoices = await storage.getAllInvoices();
        const invoice = invoices.find((inv) => inv.stripePaymentIntentId === paymentIntent.id);

        if (invoice) {
          await storage.updateInvoice(invoice.id, {
            status: "paid",
            paidAt: new Date().toISOString(),
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ message: "Webhook error" });
    }
  });

  // Analytics endpoints (Admin/Agent only)
  app.get("/api/analytics/overview", isAuthenticated, requireRole("admin", "agent"), async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const itineraries = await storage.getAllItineraries();
      const invoices = await storage.getAllInvoices();

      const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);

      const activeClients = clients.filter((c) => c.status === "active").length;
      const totalTrips = itineraries.length;

      const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
      const conversionRate = invoices.length > 0 
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

  const httpServer = createServer(app);
  return httpServer;
}
