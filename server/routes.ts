import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPortfolioSchema,
  insertProgramSchema,
  insertDemandSchema,
  insertProjectSchema,
  insertPhaseSchema,
  insertStatusSchema,
  insertAssignmentSchema 
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolios', isAuthenticated, async (req, res) => {
    try {
      const portfolios = await storage.getPortfolios();
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.get('/api/portfolios/:id', isAuthenticated, async (req, res) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post('/api/portfolios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portfolioData = insertPortfolioSchema.parse({
        ...req.body,
        ownerId: userId
      });
      const portfolio = await storage.createPortfolio(portfolioData);
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'portfolio',
        entityId: portfolio.id,
        changeType: 'created',
        changedBy: userId,
        details: { portfolio }
      });
      
      res.status(201).json(portfolio);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating portfolio:", error);
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  app.put('/api/portfolios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portfolioData = insertPortfolioSchema.partial().parse(req.body);
      const portfolio = await storage.updatePortfolio(req.params.id, portfolioData);
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'portfolio',
        entityId: portfolio.id,
        changeType: 'updated',
        changedBy: userId,
        details: { updates: portfolioData }
      });
      
      res.json(portfolio);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });

  app.delete('/api/portfolios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deletePortfolio(req.params.id);
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'portfolio',
        entityId: req.params.id,
        changeType: 'deleted',
        changedBy: userId,
        details: {}
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      res.status(500).json({ message: "Failed to delete portfolio" });
    }
  });

  // Program routes
  app.get('/api/programs', isAuthenticated, async (req, res) => {
    try {
      const portfolioId = req.query.portfolioId as string;
      const programs = await storage.getPrograms(portfolioId);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.post('/api/programs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const programData = insertProgramSchema.parse({
        ...req.body,
        ownerId: userId
      });
      const program = await storage.createProgram(programData);
      
      await storage.createAuditLog({
        entityType: 'program',
        entityId: program.id,
        changeType: 'created',
        changedBy: userId,
        details: { program }
      });
      
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating program:", error);
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  // Demand routes
  app.get('/api/demands', isAuthenticated, async (req, res) => {
    try {
      const programId = req.query.programId as string;
      const demands = await storage.getDemands(programId);
      res.json(demands);
    } catch (error) {
      console.error("Error fetching demands:", error);
      res.status(500).json({ message: "Failed to fetch demands" });
    }
  });

  app.post('/api/demands', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const demandData = insertDemandSchema.parse({
        ...req.body,
        ownerId: userId
      });
      const demand = await storage.createDemand(demandData);
      
      await storage.createAuditLog({
        entityType: 'demand',
        entityId: demand.id,
        changeType: 'created',
        changedBy: userId,
        details: { demand }
      });
      
      res.status(201).json(demand);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating demand:", error);
      res.status(500).json({ message: "Failed to create demand" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req, res) => {
    try {
      const programId = req.query.programId as string;
      const projects = await storage.getProjects(programId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        ownerId: userId
      });
      const project = await storage.createProject(projectData);
      
      await storage.createAuditLog({
        entityType: 'project',
        entityId: project.id,
        changeType: 'created',
        changedBy: userId,
        details: { project }
      });
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, projectData);
      
      await storage.createAuditLog({
        entityType: 'project',
        entityId: project.id,
        changeType: 'updated',
        changedBy: userId,
        details: { updates: projectData }
      });
      
      res.json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Phase routes
  app.get('/api/phases', isAuthenticated, async (req, res) => {
    try {
      const type = req.query.type as string;
      const phases = await storage.getPhases(type);
      res.json(phases);
    } catch (error) {
      console.error("Error fetching phases:", error);
      res.status(500).json({ message: "Failed to fetch phases" });
    }
  });

  // Status routes
  app.get('/api/statuses', isAuthenticated, async (req, res) => {
    try {
      const type = req.query.type as string;
      const statuses = await storage.getStatuses(type);
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      res.status(500).json({ message: "Failed to fetch statuses" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // User search
  app.get('/api/users/search', isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Audit log routes
  app.get('/api/audit', isAuthenticated, async (req, res) => {
    try {
      const entityId = req.query.entityId as string;
      const entityType = req.query.entityType as string;
      const auditLogs = await storage.getAuditLogs(entityId, entityType);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
