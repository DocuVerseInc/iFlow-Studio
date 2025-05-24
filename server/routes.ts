import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWorkflowSchema, insertWorkflowInstanceSchema, insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  function broadcastUpdate(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Workflow routes
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      broadcastUpdate('workflow_created', workflow);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  app.put("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(id, validatedData);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      broadcastUpdate('workflow_updated', workflow);
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorkflow(id);
      if (!deleted) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      broadcastUpdate('workflow_deleted', { id });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  // Workflow instance routes
  app.get("/api/workflow-instances", async (req, res) => {
    try {
      const instances = await storage.getWorkflowInstances();
      res.json(instances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow instances" });
    }
  });

  app.get("/api/workflows/:workflowId/instances", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.workflowId);
      const instances = await storage.getWorkflowInstancesByWorkflowId(workflowId);
      res.json(instances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow instances" });
    }
  });

  app.post("/api/workflow-instances", async (req, res) => {
    try {
      const validatedData = insertWorkflowInstanceSchema.parse(req.body);
      const instance = await storage.createWorkflowInstance(validatedData);
      broadcastUpdate('instance_created', instance);
      res.status(201).json(instance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid instance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workflow instance" });
    }
  });

  app.put("/api/workflow-instances/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWorkflowInstanceSchema.partial().parse(req.body);
      const instance = await storage.updateWorkflowInstance(id, validatedData);
      if (!instance) {
        return res.status(404).json({ message: "Workflow instance not found" });
      }
      broadcastUpdate('instance_updated', instance);
      res.json(instance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid instance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workflow instance" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const assignee = req.query.assignee as string;
      if (assignee) {
        const tasks = await storage.getTasksByAssignee(assignee);
        res.json(tasks);
      } else {
        const tasks = await storage.getTasks();
        res.json(tasks);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      broadcastUpdate('task_created', task);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      broadcastUpdate('task_updated', task);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.post("/api/tasks/:id/start", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, { status: 'in_progress' });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      broadcastUpdate('task_started', task);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to start task" });
    }
  });

  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { formData } = req.body;
      const task = await storage.updateTask(id, { 
        status: 'completed',
        formData: formData || {}
      });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      broadcastUpdate('task_completed', task);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Admin dashboard routes
  app.get("/api/admin/metrics", async (req, res) => {
    try {
      const metrics = await storage.getAdminMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin metrics" });
    }
  });

  app.get("/api/admin/workflows", async (req, res) => {
    try {
      const workflows = await storage.getWorkflowsWithInstances();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows with instances" });
    }
  });

  return httpServer;
}
