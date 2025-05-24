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

export type AdminMetrics = {
  activeWorkflows: number;
  pendingTasks: number;
  completedToday: number;
  systemHealth: number;
  recentActivity: {
    type: 'workflow_completed' | 'task_assigned' | 'workflow_deployed' | 'workflow_failed';
    message: string;
    timestamp: Date;
  }[];
};
