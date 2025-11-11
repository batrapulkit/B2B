import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import fetch from "node-fetch";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Allow rawBody for webhook verification etc.
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Simple logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const originalJson = res.json;
  let captured: any;

  res.json = function (body, ...args) {
    captured = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (captured) line += ` :: ${JSON.stringify(captured).slice(0, 150)}`;
      log(line);
    }
  });

  next();
});

// -----------------------------------------------------------
// Gemini proxy with auto fallback + mock toggle
// -----------------------------------------------------------
const USE_MOCK = process.env.MOCK_MODE === "true";

app.post("/api/gemini", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt" });
    }

    // ✅ Mock mode for offline testing
    if (USE_MOCK) {
      const fake = {
        success: true,
        modelUsed: "mock",
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: `**Mock Gemini 2.5 Response**\n\nTrip plan for "${prompt}":\n- Day 1: Arrival and check-in.\n- Day 2: Excursions and departure.\nApprox. cost $950/person.`,
                  },
                ],
              },
            },
          ],
        },
      };
      return res.status(200).json(fake);
    }

    const callGemini = async (model: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await resp.text();
      return { ok: resp.ok, status: resp.status, text };
    };

    // ✅ Primary model → Gemini 2.5 Flash Exp
    let result = await callGemini("gemini-2.5-flash-lite");


    // Fallback if not accessible or limited
    if (!result.ok && [401, 403, 404, 429].includes(result.status)) {
      log(`⚠️ Gemini 2.5-flash-exp failed (${result.status}), trying 1.5-flash`);
      result = await callGemini("gemini-1.5-flash");
    }

    if (!result.ok) {
      log(`❌ Gemini proxy failed ${result.status}: ${result.text}`);
      return res.status(502).json({
        error: "Gemini proxy failed",
        status: result.status,
        body: result.text,
        hint:
          result.status === 401
            ? "Invalid API key"
            : result.status === 403
            ? "Model access denied (2.5 or 1.5)"
            : result.status === 404
            ? "Model not found"
            : result.status === 429
            ? "Quota exceeded or rate limited"
            : "Unknown error",
      });
    }

    let data;
    try {
      data = JSON.parse(result.text);
    } catch {
      data = { raw: result.text };
    }

    return res.status(200).json({ success: true, modelUsed: "2.5-flash-exp|fallback", data });
  } catch (err: any) {
    console.error("Gemini proxy error:", err);
    return res.status(500).json({ error: "Gemini proxy crashed", details: err.message });
  }
});

// -----------------------------------------------------------
// App setup and Vite integration
// -----------------------------------------------------------
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    console.error(err);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0" }, () =>
    log(`✅ Server running with Gemini 2.5-Flash-Exp Auto-Fallback Proxy on port ${port}`)
  );
})();
