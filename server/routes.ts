import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPortfolioSchema,
  insertProgramSchema,
  insertDemandSchema,
  insertProjectSchema,
  insertProductSchema,
  insertProjectProductSchema,
  insertPhaseSchema,
  insertStatusSchema,
  insertAssignmentSchema 
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Development bypass middleware
  const devAuth = process.env.NODE_ENV === 'development' 
    ? (req: any, res: any, next: any) => next()
    : isAuthenticated;

  // Auth routes  
  app.get('/api/auth/user', async (req: any, res) => {
    if (process.env.NODE_ENV === 'development') {
      // Development mode: Create a mock authenticated user
      try {
        const mockUser = {
          id: "dev-user-123",
          email: "dev@example.com",
          firstName: "Dev",
          lastName: "User",
          role: "admin",
          profileImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Ensure the user exists in the database
        try {
          await storage.upsertUser(mockUser);
        } catch (error) {
          // Ignore if already exists
        }
        
        return res.json(mockUser);
      } catch (error) {
        console.error("Error creating mock user:", error);
        return res.status(500).json({ message: "Failed to create mock user" });
      }
    }
    
    // Production mode: Use authentication
    return isAuthenticated(req, res, async () => {
      try {
        const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
        const user = await storage.getUser(userId);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });
  });

  // Portfolio routes
  app.get('/api/portfolios', devAuth, async (req, res) => {
    try {
      const portfolios = await storage.getPortfolios();
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.get('/api/portfolios/:id', devAuth, async (req, res) => {
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

  app.post('/api/portfolios', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === 'development' ? "dev-user-123" : req.user.claims.sub;
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

  app.put('/api/portfolios/:id', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
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

  app.delete('/api/portfolios/:id', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
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
  app.get('/api/programs', devAuth, async (req, res) => {
    try {
      const portfolioId = req.query.portfolioId as string;
      const programs = await storage.getPrograms(portfolioId);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.post('/api/programs', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
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
  app.get('/api/demands', devAuth, async (req, res) => {
    try {
      const programId = req.query.programId as string;
      const demands = await storage.getDemands(programId);
      res.json(demands);
    } catch (error) {
      console.error("Error fetching demands:", error);
      res.status(500).json({ message: "Failed to fetch demands" });
    }
  });

  app.post('/api/demands', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
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
  app.get('/api/projects', devAuth, async (req, res) => {
    try {
      const programId = req.query.programId as string;
      const projects = await storage.getProjects(programId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', devAuth, async (req, res) => {
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

  app.post('/api/projects', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
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

  app.put('/api/projects/:id', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
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
  app.get('/api/phases', devAuth, async (req, res) => {
    try {
      const type = req.query.type as string;
      const phases = await storage.getPhases(type);
      res.json(phases);
    } catch (error) {
      console.error("Error fetching phases:", error);
      res.status(500).json({ message: "Failed to fetch phases" });
    }
  });

  app.post('/api/phases', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
      const phaseData = insertPhaseSchema.parse(req.body);
      const phase = await storage.createPhase(phaseData);
      res.status(201).json(phase);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating phase:", error);
      res.status(500).json({ message: "Failed to create phase" });
    }
  });

  // Status routes
  app.get('/api/statuses', devAuth, async (req, res) => {
    try {
      const type = req.query.type as string;
      const statuses = await storage.getStatuses(type);
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      res.status(500).json({ message: "Failed to fetch statuses" });
    }
  });

  app.post('/api/statuses', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
      const statusData = insertStatusSchema.parse(req.body);
      const status = await storage.createStatus(statusData);
      res.status(201).json(status);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating status:", error);
      res.status(500).json({ message: "Failed to create status" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', devAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // User search
  app.get('/api/users/search', devAuth, async (req, res) => {
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
  app.get('/api/audit', devAuth, async (req, res) => {
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

  // User role update (Admin only)
  app.put('/api/users/:userId/role', devAuth, async (req: any, res) => {
    try {
      const currentUserId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Check if current user exists and is admin
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can update user roles" });
      }

      const { userId } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ['admin', 'portfolio_manager', 'program_manager', 'project_manager', 'contributor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Update user role
      const updatedUser = await storage.updateUser(userId, { role });
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'user',
        entityId: userId,
        changeType: 'updated',
        changedBy: currentUserId,
        details: { roleUpdate: { newRole: role } }
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Product routes
  app.get('/api/products', devAuth, async (req, res) => {
    try {
      const programId = req.query.programId as string;
      const products = await storage.getProducts(programId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', devAuth, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === 'development' ? "dev-user-123" : req.user.claims.sub;
      const productData = insertProductSchema.parse({
        ...req.body,
        ownerId: userId
      });
      const product = await storage.createProduct(productData);
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'product',
        entityId: product.id,
        changeType: 'created',
        changedBy: userId,
        details: { product }
      });
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'product',
        entityId: product.id,
        changeType: 'updated',
        changedBy: userId,
        details: { changes: productData }
      });
      
      res.json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', devAuth, async (req: any, res) => {
    try {
      const userId = process.env.NODE_ENV === "development" ? "dev-user-123" : req.user.claims.sub;
      await storage.deleteProduct(req.params.id);
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'product',
        entityId: req.params.id,
        changeType: 'deleted',
        changedBy: userId,
        details: {}
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Project-Product relationship routes
  app.get('/api/project-products', devAuth, async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const productId = req.query.productId as string;
      const projectProducts = await storage.getProjectProducts(projectId, productId);
      res.json(projectProducts);
    } catch (error) {
      console.error("Error fetching project-product relationships:", error);
      res.status(500).json({ message: "Failed to fetch project-product relationships" });
    }
  });

  app.post('/api/project-products', devAuth, async (req: any, res) => {
    try {
      const projectProductData = insertProjectProductSchema.parse(req.body);
      const projectProduct = await storage.addProjectToProduct(projectProductData);
      res.status(201).json(projectProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding project to product:", error);
      res.status(500).json({ message: "Failed to add project to product" });
    }
  });

  app.delete('/api/project-products/:id', devAuth, async (req, res) => {
    try {
      await storage.removeProjectFromProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing project from product:", error);
      res.status(500).json({ message: "Failed to remove project from product" });
    }
  });

  // Seed data initialization
  app.post('/api/seed-data', devAuth, async (req: any, res) => {
    try {
      // Add default phases for demands
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
      
      // Add default statuses for demands  
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

      // Add default phases for projects
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
      
      // Add default statuses for projects
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

      // Add some sample products
      try {
        const sampleProducts = [
          {
            name: "Customer Experience Portal",
            description: "Self-service portal for customer account management and omnichannel support",
            programId: "customer-experience-prog",
            ownerId: "dev-user-123",
            status: "active",
            version: "2.1.0",
            launchDate: new Date('2023-03-15'),
            businessValue: "Reduces customer service calls by 40% and improves customer satisfaction",
          },
          {
            name: "RPA Automation Platform",
            description: "Robotic Process Automation platform for business process optimization",
            programId: "process-automation-prog",
            ownerId: "dev-user-123",
            status: "in_development",
            version: "1.0.0",
            businessValue: "Expected to automate 15 critical business processes and save 200 hours/month",
          },
          {
            name: "Cloud Migration Dashboard",
            description: "Monitoring and management dashboard for AWS cloud infrastructure",
            programId: "cloud-migration-prog", 
            ownerId: "dev-user-123",
            status: "active",
            version: "1.5.2",
            launchDate: new Date('2024-01-10'),
            businessValue: "Provides real-time cloud infrastructure insights, reducing monitoring time by 60%",
          },
          {
            name: "Zero-Trust Security Gateway",
            description: "Advanced security platform implementing zero-trust network architecture",
            programId: "security-modernization-prog",
            ownerId: "dev-user-123", 
            status: "active",
            version: "3.2.1",
            launchDate: new Date('2023-08-01'),
            businessValue: "Enhances security posture and reduces security incidents by 70%",
          },
        ];

        for (const product of sampleProducts) {
          try {
            await storage.createProduct(product);
          } catch (error) {
            // Ignore if already exists
          }
        }
      } catch (error) {
        console.log("Sample products may already exist");
      }

      res.json({ message: "Seed data initialized successfully" });
    } catch (error) {
      console.error("Error initializing seed data:", error);
      res.status(500).json({ message: "Failed to initialize seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
