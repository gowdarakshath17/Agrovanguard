import express from "express";
import path from "path";
import cors from "cors";
import http from "http";
import { createServer as createViteServer } from "vite";
import { requireAuth, type AuthRequest } from "./src/middleware/auth.ts";
import weatherRouter from "./src/api/weather.ts";
import farmsRouter from "./src/api/farms.ts";
import aiRouter from "./src/api/ai.ts";
import usersRouter from "./src/api/users.ts";
import voiceRouter from "./src/api/voice.ts";
import iotRouter from "./src/api/iot.ts";
import placesRouter from "./src/api/places.ts";
import notificationsRouter from "./src/api/notifications.ts";
import pushRouter from "./src/api/push.ts";
import authRouter from "./src/api/auth.ts";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // --- API Routes ---
  
  // Health checks
  app.get("/api/health", (req, res) => {
    res.json({ status: "UP", timestamp: new Date().toISOString() });
  });

  app.get("/api/health/dependencies", (req, res) => {
    res.json({
      database: "UP",
      ai_service: "UP",
      weather_service: "UP",
      sync_subsystem: "UP"
    });
  });

  app.use("/api/users", usersRouter);
  app.use("/api/weather", weatherRouter);
  app.use("/api/farms", farmsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/voice", voiceRouter);
  app.use("/api/iot", iotRouter);
  app.use("/api/places", placesRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/push", pushRouter);
  app.use("/api/auth", authRouter);

  // --- Vite Middleware for Development vs Production Static Serving ---
  const isProd = process.env.NODE_ENV === "production" || (process.env.PORT && process.env.PORT !== '3000');
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: server,
          protocol: 'wss',
          clientPort: 443,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  let isShuttingDown = false;
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log("Shutting down gracefully...");
    
    // Set a hard exit timeout in case connections or pool are lingering
    const forceExitTimeout = setTimeout(() => {
      process.exit(0);
    }, 2000);
    forceExitTimeout.unref();

    try {
      const { closePool } = await import("./src/db/index.ts");
      await closePool();
    } catch {}

    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch(console.error);
