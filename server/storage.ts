import {
  users,
  portfolios,
  programs,
  demands,
  projects,
  phases,
  statuses,
  assignments,
  auditLog,
  type User,
  type UpsertUser,
  type Portfolio,
  type InsertPortfolio,
  type Program,
  type InsertProgram,
  type Demand,
  type InsertDemand,
  type Project,
  type InsertProject,
  type Phase,
  type InsertPhase,
  type Status,
  type InsertStatus,
  type Assignment,
  type InsertAssignment,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Portfolio operations
  getPortfolios(): Promise<Portfolio[]>;
  getPortfolio(id: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: string, portfolio: Partial<InsertPortfolio>): Promise<Portfolio>;
  deletePortfolio(id: string): Promise<void>;

  // Program operations
  getPrograms(portfolioId?: string): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program>;
  deleteProgram(id: string): Promise<void>;

  // Demand operations
  getDemands(programId?: string): Promise<Demand[]>;
  getDemand(id: string): Promise<Demand | undefined>;
  createDemand(demand: InsertDemand): Promise<Demand>;
  updateDemand(id: string, demand: Partial<InsertDemand>): Promise<Demand>;
  deleteDemand(id: string): Promise<void>;

  // Project operations
  getProjects(programId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Phase operations
  getPhases(type?: string): Promise<Phase[]>;
  getPhase(id: string): Promise<Phase | undefined>;
  createPhase(phase: InsertPhase): Promise<Phase>;
  updatePhase(id: string, phase: Partial<InsertPhase>): Promise<Phase>;

  // Status operations
  getStatuses(type?: string): Promise<Status[]>;
  getStatus(id: string): Promise<Status | undefined>;
  createStatus(status: InsertStatus): Promise<Status>;
  updateStatus(id: string, status: Partial<InsertStatus>): Promise<Status>;

  // Assignment operations
  getAssignments(projectId: string): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;

  // Audit log operations
  getAuditLogs(entityId?: string, entityType?: string): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeProjects: number;
    pendingDemands: number;
    budgetUtilized: number;
    atRiskProjects: number;
  }>;

  // User search
  searchUsers(query: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Portfolio operations
  async getPortfolios(): Promise<Portfolio[]> {
    return await db.select().from(portfolios).orderBy(asc(portfolios.name));
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return newPortfolio;
  }

  async updatePortfolio(id: string, portfolio: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set({ ...portfolio, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return updatedPortfolio;
  }

  async deletePortfolio(id: string): Promise<void> {
    await db.delete(portfolios).where(eq(portfolios.id, id));
  }

  // Program operations
  async getPrograms(portfolioId?: string): Promise<Program[]> {
    if (portfolioId) {
      return await db.select().from(programs).where(eq(programs.portfolioId, portfolioId)).orderBy(asc(programs.name));
    }
    return await db.select().from(programs).orderBy(asc(programs.name));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  }

  async updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program> {
    const [updatedProgram] = await db
      .update(programs)
      .set({ ...program, updatedAt: new Date() })
      .where(eq(programs.id, id))
      .returning();
    return updatedProgram;
  }

  async deleteProgram(id: string): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // Demand operations
  async getDemands(programId?: string): Promise<Demand[]> {
    if (programId) {
      return await db.select().from(demands).where(eq(demands.programId, programId)).orderBy(desc(demands.createdAt));
    }
    return await db.select().from(demands).orderBy(desc(demands.createdAt));
  }

  async getDemand(id: string): Promise<Demand | undefined> {
    const [demand] = await db.select().from(demands).where(eq(demands.id, id));
    return demand;
  }

  async createDemand(demand: InsertDemand): Promise<Demand> {
    const [newDemand] = await db.insert(demands).values(demand).returning();
    return newDemand;
  }

  async updateDemand(id: string, demand: Partial<InsertDemand>): Promise<Demand> {
    const [updatedDemand] = await db
      .update(demands)
      .set({ ...demand, updatedAt: new Date() })
      .where(eq(demands.id, id))
      .returning();
    return updatedDemand;
  }

  async deleteDemand(id: string): Promise<void> {
    await db.delete(demands).where(eq(demands.id, id));
  }

  // Project operations
  async getProjects(programId?: string): Promise<Project[]> {
    if (programId) {
      return await db.select().from(projects).where(eq(projects.programId, programId)).orderBy(desc(projects.createdAt));
    }
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Phase operations
  async getPhases(type?: string): Promise<Phase[]> {
    if (type) {
      return await db.select().from(phases).where(and(eq(phases.type, type), eq(phases.isActive, true))).orderBy(asc(phases.order));
    }
    return await db.select().from(phases).where(eq(phases.isActive, true)).orderBy(asc(phases.order));
  }

  async getPhase(id: string): Promise<Phase | undefined> {
    const [phase] = await db.select().from(phases).where(eq(phases.id, id));
    return phase;
  }

  async createPhase(phase: InsertPhase): Promise<Phase> {
    const [newPhase] = await db.insert(phases).values(phase).returning();
    return newPhase;
  }

  async updatePhase(id: string, phase: Partial<InsertPhase>): Promise<Phase> {
    const [updatedPhase] = await db
      .update(phases)
      .set(phase)
      .where(eq(phases.id, id))
      .returning();
    return updatedPhase;
  }

  // Status operations
  async getStatuses(type?: string): Promise<Status[]> {
    if (type) {
      return await db.select().from(statuses).where(and(eq(statuses.type, type), eq(statuses.isActive, true))).orderBy(asc(statuses.name));
    }
    return await db.select().from(statuses).where(eq(statuses.isActive, true)).orderBy(asc(statuses.name));
  }

  async getStatus(id: string): Promise<Status | undefined> {
    const [status] = await db.select().from(statuses).where(eq(statuses.id, id));
    return status;
  }

  async createStatus(status: InsertStatus): Promise<Status> {
    const [newStatus] = await db.insert(statuses).values(status).returning();
    return newStatus;
  }

  async updateStatus(id: string, status: Partial<InsertStatus>): Promise<Status> {
    const [updatedStatus] = await db
      .update(statuses)
      .set(status)
      .where(eq(statuses.id, id))
      .returning();
    return updatedStatus;
  }

  // Assignment operations
  async getAssignments(projectId: string): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.projectId, projectId));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }

  // Audit log operations
  async getAuditLogs(entityId?: string, entityType?: string): Promise<AuditLog[]> {
    let query = db.select().from(auditLog);
    
    if (entityId && entityType) {
      query = query.where(and(eq(auditLog.entityId, entityId), eq(auditLog.entityType, entityType)));
    } else if (entityId) {
      query = query.where(eq(auditLog.entityId, entityId));
    } else if (entityType) {
      query = query.where(eq(auditLog.entityType, entityType));
    }
    
    return await query.orderBy(desc(auditLog.timestamp));
  }

  async createAuditLog(auditLogData: InsertAuditLog): Promise<AuditLog> {
    const [newAuditLog] = await db.insert(auditLog).values(auditLogData).returning();
    return newAuditLog;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    activeProjects: number;
    pendingDemands: number;
    budgetUtilized: number;
    atRiskProjects: number;
  }> {
    // Active projects count
    const [activeProjectsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .innerJoin(statuses, eq(projects.statusId, statuses.id))
      .where(eq(statuses.name, 'Active'));

    // Pending demands count  
    const [pendingDemandsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(demands)
      .innerJoin(statuses, eq(demands.statusId, statuses.id))
      .where(or(eq(statuses.name, 'Pending'), eq(statuses.name, 'Under Review')));

    // At risk projects count
    const [atRiskProjectsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .innerJoin(statuses, eq(projects.statusId, statuses.id))
      .where(eq(statuses.name, 'At Risk'));

    return {
      activeProjects: activeProjectsResult?.count ?? 0,
      pendingDemands: pendingDemandsResult?.count ?? 0,
      budgetUtilized: 68, // This would need more complex calculation based on actual budget data
      atRiskProjects: atRiskProjectsResult?.count ?? 0,
    };
  }

  // User search
  async searchUsers(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          like(users.firstName, `%${query}%`),
          like(users.lastName, `%${query}%`),
          like(users.email, `%${query}%`)
        )
      )
      .limit(20);
  }
}

export const storage = new DatabaseStorage();
