import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("contributor"), // admin, portfolio_manager, program_manager, project_manager, contributor
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SPM Core Entities
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("active"), // active, on_hold, completed, cancelled
  budget: integer("budget"), // in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  portfolioId: varchar("portfolio_id").notNull().references(() => portfolios.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("active"),
  budget: integer("budget"), // in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const phases = pgTable("phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // demand, project
  order: integer("order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const statuses = pgTable("statuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // demand, project
  color: varchar("color").notNull().default("gray"),
  isActive: boolean("is_active").notNull().default(true),
});

export const demands = pgTable("demands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  programId: varchar("program_id").notNull().references(() => programs.id),
  phaseId: varchar("phase_id").references(() => phases.id),
  statusId: varchar("status_id").references(() => statuses.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  priority: varchar("priority").notNull().default("medium"), // high, medium, low
  requestedDate: timestamp("requested_date").defaultNow(),
  estimatedEffort: integer("estimated_effort"), // in hours
  businessValue: text("business_value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  programId: varchar("program_id").notNull().references(() => programs.id),
  demandId: varchar("demand_id").references(() => demands.id), // nullable - project can exist without demand
  phaseId: varchar("phase_id").references(() => phases.id),
  statusId: varchar("status_id").references(() => statuses.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  projectManagerId: varchar("project_manager_id").references(() => users.id),
  priority: varchar("priority").notNull().default("medium"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: integer("budget"), // in cents
  progress: integer("progress").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull(), // team_member, contributor, reviewer
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // portfolio, program, demand, project
  entityId: varchar("entity_id").notNull(),
  changeType: varchar("change_type").notNull(), // created, updated, deleted, status_changed
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  programs: many(programs),
  demands: many(demands),
  projects: many(projects),
  managedProjects: many(projects),
  assignments: many(assignments),
  auditLogs: many(auditLog),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  owner: one(users, {
    fields: [portfolios.ownerId],
    references: [users.id],
  }),
  programs: many(programs),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  portfolio: one(portfolios, {
    fields: [programs.portfolioId],
    references: [portfolios.id],
  }),
  owner: one(users, {
    fields: [programs.ownerId],
    references: [users.id],
  }),
  demands: many(demands),
  projects: many(projects),
}));

export const demandsRelations = relations(demands, ({ one, many }) => ({
  program: one(programs, {
    fields: [demands.programId],
    references: [programs.id],
  }),
  owner: one(users, {
    fields: [demands.ownerId],
    references: [users.id],
  }),
  phase: one(phases, {
    fields: [demands.phaseId],
    references: [phases.id],
  }),
  status: one(statuses, {
    fields: [demands.statusId],
    references: [statuses.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  program: one(programs, {
    fields: [projects.programId],
    references: [programs.id],
  }),
  demand: one(demands, {
    fields: [projects.demandId],
    references: [demands.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  projectManager: one(users, {
    fields: [projects.projectManagerId],
    references: [users.id],
  }),
  phase: one(phases, {
    fields: [projects.phaseId],
    references: [phases.id],
  }),
  status: one(statuses, {
    fields: [projects.statusId],
    references: [statuses.id],
  }),
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  project: one(projects, {
    fields: [assignments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [assignments.userId],
    references: [users.id],
  }),
}));

export const phasesRelations = relations(phases, ({ many }) => ({
  demands: many(demands),
  projects: many(projects),
}));

export const statusesRelations = relations(statuses, ({ many }) => ({
  demands: many(demands),
  projects: many(projects),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  changedBy: one(users, {
    fields: [auditLog.changedBy],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;

export type Demand = typeof demands.$inferSelect;
export type InsertDemand = typeof demands.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type Phase = typeof phases.$inferSelect;
export type InsertPhase = typeof phases.$inferInsert;

export type Status = typeof statuses.$inferSelect;
export type InsertStatus = typeof statuses.$inferInsert;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// Schemas
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDemandSchema = createInsertSchema(demands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhaseSchema = createInsertSchema(phases).omit({
  id: true,
});

export const insertStatusSchema = createInsertSchema(statuses).omit({
  id: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  assignedAt: true,
});
