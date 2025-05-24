import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWorkflowSchema, insertWorkflowInstanceSchema, insertTaskSchema, insertApiIntegrationSchema, insertApiCallSchema } from "@shared/schema";
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

  // API Integration routes
  app.get("/api/integrations", async (req, res) => {
    try {
      const integrations = await storage.getApiIntegrations();
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API integrations" });
    }
  });

  app.get("/api/integrations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const integration = await storage.getApiIntegration(id);
      if (!integration) {
        return res.status(404).json({ message: "API integration not found" });
      }
      res.json(integration);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API integration" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const validatedData = insertApiIntegrationSchema.parse(req.body);
      const integration = await storage.createApiIntegration(validatedData);
      broadcastUpdate('integration_created', integration);
      res.status(201).json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create API integration" });
    }
  });

  app.put("/api/integrations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertApiIntegrationSchema.partial().parse(req.body);
      const integration = await storage.updateApiIntegration(id, validatedData);
      if (!integration) {
        return res.status(404).json({ message: "API integration not found" });
      }
      broadcastUpdate('integration_updated', integration);
      res.json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update API integration" });
    }
  });

  app.delete("/api/integrations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApiIntegration(id);
      if (!deleted) {
        return res.status(404).json({ message: "API integration not found" });
      }
      broadcastUpdate('integration_deleted', { id });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete API integration" });
    }
  });

  // API Call execution endpoint
  app.post("/api/integrations/:id/execute", async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const { method, endpoint, requestBody, workflowInstanceId, taskId } = req.body;
      
      const integration = await storage.getApiIntegration(integrationId);
      if (!integration) {
        return res.status(404).json({ message: "API integration not found" });
      }

      // Create API call record
      const apiCall = await storage.createApiCall({
        workflowInstanceId,
        taskId,
        integrationId,
        method: method.toUpperCase(),
        endpoint,
        requestHeaders: integration.headers,
        requestBody: requestBody || null,
        status: 'pending',
      });

      // Execute the actual API call
      const startTime = Date.now();
      try {
        const url = `${integration.baseUrl}${endpoint}`;
        const headers = { ...integration.headers };

        // Add authentication headers
        if (integration.authType === 'bearer' && integration.authConfig.token) {
          headers['Authorization'] = `Bearer ${integration.authConfig.token}`;
        } else if (integration.authType === 'api_key' && integration.authConfig.key) {
          const headerName = integration.authConfig.header || 'X-API-Key';
          headers[headerName] = integration.authConfig.key;
        } else if (integration.authType === 'basic' && integration.authConfig.username && integration.authConfig.password) {
          const credentials = Buffer.from(`${integration.authConfig.username}:${integration.authConfig.password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }

        const response = await fetch(url, {
          method: method.toUpperCase(),
          headers,
          body: requestBody ? JSON.stringify(requestBody) : undefined,
          signal: AbortSignal.timeout(integration.timeout),
        });

        const duration = Date.now() - startTime;
        const responseBody = response.headers.get('content-type')?.includes('application/json') 
          ? await response.json() 
          : await response.text();

        // Update API call with success
        await storage.updateApiCall(apiCall.id, {
          status: response.ok ? 'success' : 'failed',
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseBody: typeof responseBody === 'string' ? { data: responseBody } : responseBody,
          duration,
          errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
        });

        broadcastUpdate('api_call_completed', { apiCallId: apiCall.id, success: response.ok });
        res.json({ success: response.ok, data: responseBody, status: response.status });

      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await storage.updateApiCall(apiCall.id, {
          status: 'failed',
          duration,
          errorMessage,
        });

        broadcastUpdate('api_call_completed', { apiCallId: apiCall.id, success: false });
        res.status(500).json({ success: false, error: errorMessage });
      }

    } catch (error) {
      res.status(500).json({ message: "Failed to execute API call" });
    }
  });

  // API Call history routes
  app.get("/api/api-calls", async (req, res) => {
    try {
      const workflowInstanceId = req.query.workflowInstanceId as string;
      if (workflowInstanceId) {
        const calls = await storage.getApiCallsByWorkflowInstance(parseInt(workflowInstanceId));
        res.json(calls);
      } else {
        const calls = await storage.getApiCalls();
        res.json(calls);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API calls" });
    }
  });

  return httpServer;
}
