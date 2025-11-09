import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Extend Node's IncomingMessage to include rawBody
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Parse JSON and store raw body for webhook or signature verification
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const originalResJson = res.json;
  let captured: any;

  res.json = function (body, ...args) {
    captured = body;
    return originalResJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (captured) logLine += ` :: ${JSON.stringify(captured)}`;
      if (logLine.length > 100) logLine = logLine.slice(0, 99) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler
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

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({ port, host: "0.0.0.0" }, () =>
    log(`✅ Server running with Clerk v1.7 (requireAuth/getAuth) on port ${port}`)
  );
})();
