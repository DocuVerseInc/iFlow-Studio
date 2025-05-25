import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  workflowId: text("workflow_id").notNull().unique(), // User-entered unique ID (max 10 chars, alphanumeric + hyphen/underscore)
  name: text("name").notNull(), // Human-readable name
  description: text("description"), // Brief description of workflow purpose
  bpmnXml: text("bpmn_xml").notNull(),
  version: text("version").notNull().default("1.0"), // Auto-generated version starting at 1.0, increments by 0.1
  status: text("status").notNull().default("Draft"), // Draft, Active, Inactive, Archived
  createdBy: text("created_by").notNull(), // Auto-filled, user cannot modify
  createdAt: timestamp("created_at").notNull().defaultNow(), // Auto-filled, user cannot modify
  lastModifiedBy: text("last_modified_by").notNull(), // Auto-filled, user cannot modify
  lastModifiedAt: timestamp("last_modified_at").notNull().defaultNow(), // Auto-filled, user cannot modify
  // Legacy fields for backward compatibility
  isActive: boolean("is_active").notNull().default(true),
  isLatest: boolean("is_latest").notNull().default(true),
  parentWorkflowId: integer("parent_workflow_id"),
  deploymentStatus: text("deployment_status").notNull().default("not_deployed"),
  deployedAt: timestamp("deployed_at"),
  deployedBy: text("deployed_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workflowInstances = pgTable("workflow_instances", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  status: text("status").notNull(), // 'running', 'completed', 'failed', 'paused'
  currentStep: text("current_step"),
  variables: jsonb("variables").$type<Record<string, any>>().default({}),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  workflowInstanceId: integer("workflow_instance_id").notNull(),
  taskDefinitionKey: text("task_definition_key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  assignee: text("assignee"),
  status: text("status").notNull(), // 'pending', 'in_progress', 'completed', 'failed'
  priority: text("priority").notNull().default('medium'), // 'low', 'medium', 'high'
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  formData: jsonb("form_data").$type<Record<string, any>>().default({}),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastModifiedAt: true,
  version: true, // Auto-generated
  createdBy: true, // Auto-filled
  lastModifiedBy: true, // Auto-filled
}).extend({
  workflowId: z.string()
    .min(1, "Workflow ID is required")
    .max(10, "Workflow ID must be 10 characters or less")
    .regex(/^[a-zA-Z0-9_-]+$/, "Workflow ID can only contain letters, numbers, hyphens, and underscores"),
  status: z.enum(["Draft", "Active", "Inactive", "Archived"]).default("Draft"),
  version: z.string().default("1.0.0"),
});

export const insertWorkflowInstanceSchema = createInsertSchema(workflowInstances).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertWorkflowInstance = z.infer<typeof insertWorkflowInstanceSchema>;
export type WorkflowInstance = typeof workflowInstances.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Extended types for API responses
export type WorkflowWithInstance = Workflow & {
  instances?: WorkflowInstance[];
  activeTasks?: number;
};

export type TaskWithWorkflow = Task & {
  workflowName?: string;
  workflowId?: number;
};

// API Integration types
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  authType: text("auth_type").notNull(), // 'none', 'bearer', 'basic', 'api_key'
  authConfig: jsonb("auth_config").$type<Record<string, any>>().default({}),
  headers: jsonb("headers").$type<Record<string, string>>().default({}),
  timeout: integer("timeout").default(30000),
  retryAttempts: integer("retry_attempts").default(3),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const apiCalls = pgTable("api_calls", {
  id: serial("id").primaryKey(),
  workflowInstanceId: integer("workflow_instance_id").notNull(),
  taskId: integer("task_id").notNull(),
  integrationId: integer("integration_id").notNull(),
  method: text("method").notNull(), // 'GET', 'POST', 'PUT', 'DELETE'
  endpoint: text("endpoint").notNull(),
  requestHeaders: jsonb("request_headers").$type<Record<string, string>>().default({}),
  requestBody: jsonb("request_body").$type<Record<string, any>>(),
  responseStatus: integer("response_status"),
  responseHeaders: jsonb("response_headers").$type<Record<string, string>>(),
  responseBody: jsonb("response_body").$type<Record<string, any>>(),
  errorMessage: text("error_message"),
  duration: integer("duration"), // in milliseconds
  attempts: integer("attempts").default(1),
  status: text("status").notNull(), // 'pending', 'success', 'failed', 'retrying'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertApiIntegrationSchema = createInsertSchema(apiIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiCallSchema = createInsertSchema(apiCalls).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertApiIntegration = z.infer<typeof insertApiIntegrationSchema>;
export type ApiIntegration = typeof apiIntegrations.$inferSelect;

export type InsertApiCall = z.infer<typeof insertApiCallSchema>;
export type ApiCall = typeof apiCalls.$inferSelect;

// Deployment Pipeline types
export const deploymentPipeline = pgTable("deployment_pipeline", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  version: text("version").notNull(),
  environment: text("environment").notNull(), // development, staging, production
  status: text("status").notNull().default("pending"), // pending, running, success, failed, cancelled
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  deployedBy: text("deployed_by").notNull(),
  deploymentLogs: text("deployment_logs"),
  rollbackVersion: text("rollback_version"),
  approvals: jsonb("approvals").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workflowVersions = pgTable("workflow_versions", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  version: text("version").notNull(),
  bpmnXml: text("bpmn_xml").notNull(),
  changeLog: text("change_log"),
  status: text("status").notNull().default("draft"), // draft, deployed, archived
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDeploymentPipelineSchema = createInsertSchema(deploymentPipeline).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowVersionSchema = createInsertSchema(workflowVersions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDeploymentPipeline = z.infer<typeof insertDeploymentPipelineSchema>;
export type DeploymentPipeline = typeof deploymentPipeline.$inferSelect;

export type InsertWorkflowVersion = z.infer<typeof insertWorkflowVersionSchema>;
export type WorkflowVersion = typeof workflowVersions.$inferSelect;

export type AdminMetrics = {
  activeWorkflows: number;
  pendingTasks: number;
  completedToday: number;
  systemHealth: number;
  apiCallsToday: number;
  failedApiCalls: number;
  deploymentsToday: number;
  failedDeployments: number;
  recentActivity: {
    type: 'workflow_completed' | 'task_assigned' | 'workflow_deployed' | 'workflow_failed' | 'api_call_success' | 'api_call_failed' | 'deployment_started' | 'deployment_completed' | 'deployment_failed';
    message: string;
    timestamp: Date;
  }[];
};
