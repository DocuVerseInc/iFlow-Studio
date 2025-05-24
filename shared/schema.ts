import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  bpmnXml: text("bpmn_xml").notNull(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export type AdminMetrics = {
  activeWorkflows: number;
  pendingTasks: number;
  completedToday: number;
  systemHealth: number;
  apiCallsToday: number;
  failedApiCalls: number;
  recentActivity: {
    type: 'workflow_completed' | 'task_assigned' | 'workflow_deployed' | 'workflow_failed' | 'api_call_success' | 'api_call_failed';
    message: string;
    timestamp: Date;
  }[];
};
