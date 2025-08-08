import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function initializeDefaultData() {
  try {
    // Initialize default phases for demands
    const demandPhases = [
      { name: 'Idea', type: 'demand', order: 1 },
      { name: 'Analysis', type: 'demand', order: 2 },
      { name: 'Approved', type: 'demand', order: 3 },
      { name: 'Rejected', type: 'demand', order: 4 }
    ];
    
    for (const phase of demandPhases) {
      try {
        await storage.createPhase(phase);
      } catch (error) {
        // Ignore if already exists
      }
    }
    
    // Initialize default statuses for demands  
    const demandStatuses = [
      { name: 'Pending', type: 'demand', color: 'yellow' },
      { name: 'Under Review', type: 'demand', color: 'blue' },
      { name: 'Approved', type: 'demand', color: 'green' },
      { name: 'Rejected', type: 'demand', color: 'red' },
      { name: 'On Hold', type: 'demand', color: 'orange' }
    ];
    
    for (const status of demandStatuses) {
      try {
        await storage.createStatus(status);
      } catch (error) {
        // Ignore if already exists
      }
    }

    // Initialize default phases for projects
    const projectPhases = [
      { name: 'Planning', type: 'project', order: 1 },
      { name: 'Development', type: 'project', order: 2 },
      { name: 'Testing', type: 'project', order: 3 },
      { name: 'Deployment', type: 'project', order: 4 },
      { name: 'Complete', type: 'project', order: 5 }
    ];
    
    for (const phase of projectPhases) {
      try {
        await storage.createPhase(phase);
      } catch (error) {
        // Ignore if already exists
      }
    }
    
    // Initialize default statuses for projects
    const projectStatuses = [
      { name: 'Active', type: 'project', color: 'green' },
      { name: 'On Hold', type: 'project', color: 'yellow' },
      { name: 'At Risk', type: 'project', color: 'red' },
      { name: 'Completed', type: 'project', color: 'blue' },
      { name: 'Cancelled', type: 'project', color: 'gray' }
    ];
    
    for (const status of projectStatuses) {
      try {
        await storage.createStatus(status);
      } catch (error) {
        // Ignore if already exists
      }
    }

    log('Default phases and statuses initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

(async () => {
  const server = await registerRoutes(app);

  // Initialize default data on startup
  await initializeDefaultData();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
