import { 
  workflows, 
  workflowInstances, 
  tasks,
  apiIntegrations,
  apiCalls,
  type Workflow, 
  type WorkflowInstance, 
  type Task,
  type ApiIntegration,
  type ApiCall,
  type InsertWorkflow, 
  type InsertWorkflowInstance, 
  type InsertTask,
  type InsertApiIntegration,
  type InsertApiCall,
  type WorkflowWithInstance,
  type TaskWithWorkflow,
  type AdminMetrics
} from "@shared/schema";

export interface IStorage {
  // Workflow operations
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Workflow versioning
  getWorkflowVersions(workflowId: number): Promise<WorkflowVersion[]>;
  createWorkflowVersion(version: InsertWorkflowVersion): Promise<WorkflowVersion>;
  getWorkflowVersion(id: number): Promise<WorkflowVersion | undefined>;
  
  // Deployment pipeline
  getDeploymentPipelines(workflowId?: number): Promise<DeploymentPipeline[]>;
  createDeploymentPipeline(deployment: InsertDeploymentPipeline): Promise<DeploymentPipeline>;
  updateDeploymentPipeline(id: number, deployment: Partial<InsertDeploymentPipeline>): Promise<DeploymentPipeline | undefined>;
  getDeploymentPipeline(id: number): Promise<DeploymentPipeline | undefined>;

  // Workflow instance operations
  getWorkflowInstances(): Promise<WorkflowInstance[]>;
  getWorkflowInstance(id: number): Promise<WorkflowInstance | undefined>;
  getWorkflowInstancesByWorkflowId(workflowId: number): Promise<WorkflowInstance[]>;
  createWorkflowInstance(instance: InsertWorkflowInstance): Promise<WorkflowInstance>;
  updateWorkflowInstance(id: number, instance: Partial<InsertWorkflowInstance>): Promise<WorkflowInstance | undefined>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByAssignee(assignee: string): Promise<TaskWithWorkflow[]>;
  getTasksByWorkflowInstance(instanceId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;

  // API Integration operations
  getApiIntegrations(): Promise<ApiIntegration[]>;
  getApiIntegration(id: number): Promise<ApiIntegration | undefined>;
  createApiIntegration(integration: InsertApiIntegration): Promise<ApiIntegration>;
  updateApiIntegration(id: number, integration: Partial<InsertApiIntegration>): Promise<ApiIntegration | undefined>;
  deleteApiIntegration(id: number): Promise<boolean>;

  // API Call operations
  getApiCalls(): Promise<ApiCall[]>;
  getApiCall(id: number): Promise<ApiCall | undefined>;
  getApiCallsByWorkflowInstance(instanceId: number): Promise<ApiCall[]>;
  createApiCall(apiCall: InsertApiCall): Promise<ApiCall>;
  updateApiCall(id: number, apiCall: Partial<InsertApiCall>): Promise<ApiCall | undefined>;

  // Dashboard metrics
  getAdminMetrics(): Promise<AdminMetrics>;
  getWorkflowsWithInstances(): Promise<WorkflowWithInstance[]>;
}

export class MemStorage implements IStorage {
  private workflows: Map<number, Workflow>;
  private workflowInstances: Map<number, WorkflowInstance>;
  private tasks: Map<number, Task>;
  private apiIntegrations: Map<number, ApiIntegration>;
  private apiCalls: Map<number, ApiCall>;
  private workflowVersions: Map<number, WorkflowVersion>;
  private deploymentPipelines: Map<number, DeploymentPipeline>;
  private currentWorkflowId: number;
  private currentInstanceId: number;
  private currentTaskId: number;
  private currentIntegrationId: number;
  private currentApiCallId: number;
  private currentVersionId: number;
  private currentDeploymentId: number;
  private recentActivity: AdminMetrics['recentActivity'];

  constructor() {
    this.workflows = new Map();
    this.workflowInstances = new Map();
    this.tasks = new Map();
    this.apiIntegrations = new Map();
    this.apiCalls = new Map();
    this.currentWorkflowId = 1;
    this.currentInstanceId = 1;
    this.currentTaskId = 1;
    this.currentIntegrationId = 1;
    this.currentApiCallId = 1;
    this.recentActivity = [];
    
    // Add some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample workflow
    const sampleWorkflow = {
      id: 1,
      name: "Invoice Approval Process",
      description: "Standard process for approving invoices",
      bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Invoice Received">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="UserTask_1" name="Review Invoice" assignee="John Doe">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="Invoice Processed">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`,
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workflows.set(1, sampleWorkflow);
    this.currentWorkflowId = 2;

    // Sample workflow instance
    const sampleInstance = {
      id: 1,
      workflowId: 1,
      status: "running",
      currentStep: "UserTask_1",
      variables: null,
      startedAt: new Date(),
      completedAt: null,
    };
    this.workflowInstances.set(1, sampleInstance);
    this.currentInstanceId = 2;

    // Sample tasks
    const sampleTasks = [
      {
        id: 1,
        workflowInstanceId: 1,
        taskDefinitionKey: "UserTask_1",
        name: "Review Invoice #INV-001",
        description: "Review and approve invoice for $1,200 from Acme Corp",
        assignee: "John Doe",
        status: "pending",
        priority: "high",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        createdAt: new Date(),
        completedAt: null,
        formData: null,
      },
      {
        id: 2,
        workflowInstanceId: 1,
        taskDefinitionKey: "UserTask_2",
        name: "Process Payment Authorization",
        description: "Authorize payment for approved invoice",
        assignee: "John Doe",
        status: "in_progress",
        priority: "medium",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        createdAt: new Date(),
        completedAt: null,
        formData: null,
      },
    ];
    
    sampleTasks.forEach(task => this.tasks.set(task.id, task));
    this.currentTaskId = 3;

    // Sample activity
    this.recentActivity = [
      {
        type: 'workflow_deployed',
        message: 'Invoice Approval Process deployed',
        timestamp: new Date(),
      },
      {
        type: 'task_assigned',
        message: 'Review Invoice #INV-001 assigned to John Doe',
        timestamp: new Date(),
      },
    ];

    // Sample API integrations
    const sampleIntegrations = [
      {
        id: 1,
        name: "Customer API",
        baseUrl: "https://api.example.com",
        authType: "bearer",
        authConfig: { token: "your-api-token" },
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
        retryAttempts: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Payment Gateway",
        baseUrl: "https://payments.example.com",
        authType: "api_key",
        authConfig: { key: "your-api-key", header: "X-API-Key" },
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
        retryAttempts: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleIntegrations.forEach(integration => this.apiIntegrations.set(integration.id, integration));
    this.currentIntegrationId = 3;
  }

  // Workflow operations
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentWorkflowId++;
    const now = new Date();
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      version: insertWorkflow.version || 1,
      description: insertWorkflow.description || null,
      isActive: insertWorkflow.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.workflows.set(id, workflow);
    
    this.addActivity('workflow_deployed', `New workflow "${workflow.name}" deployed`);
    
    return workflow;
  }

  async updateWorkflow(id: number, updateData: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;

    const updatedWorkflow: Workflow = {
      ...workflow,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  // Workflow instance operations
  async getWorkflowInstances(): Promise<WorkflowInstance[]> {
    return Array.from(this.workflowInstances.values());
  }

  async getWorkflowInstance(id: number): Promise<WorkflowInstance | undefined> {
    return this.workflowInstances.get(id);
  }

  async getWorkflowInstancesByWorkflowId(workflowId: number): Promise<WorkflowInstance[]> {
    return Array.from(this.workflowInstances.values()).filter(
      instance => instance.workflowId === workflowId
    );
  }

  async createWorkflowInstance(insertInstance: InsertWorkflowInstance): Promise<WorkflowInstance> {
    const id = this.currentInstanceId++;
    const instance: WorkflowInstance = {
      ...insertInstance,
      id,
      currentStep: insertInstance.currentStep || null,
      variables: insertInstance.variables || null,
      startedAt: new Date(),
      completedAt: null,
    };
    this.workflowInstances.set(id, instance);
    
    const workflow = await this.getWorkflow(instance.workflowId);
    if (workflow) {
      this.addActivity('workflow_deployed', `Workflow "${workflow.name}" instance started`);
    }
    
    return instance;
  }

  async updateWorkflowInstance(id: number, updateData: Partial<InsertWorkflowInstance>): Promise<WorkflowInstance | undefined> {
    const instance = this.workflowInstances.get(id);
    if (!instance) return undefined;

    const updatedInstance: WorkflowInstance = {
      ...instance,
      ...updateData,
      completedAt: updateData.status === 'completed' ? new Date() : instance.completedAt,
    };
    
    this.workflowInstances.set(id, updatedInstance);
    
    if (updateData.status === 'completed') {
      const workflow = await this.getWorkflow(instance.workflowId);
      if (workflow) {
        this.addActivity('workflow_completed', `Workflow "${workflow.name}" completed`);
      }
    } else if (updateData.status === 'failed') {
      const workflow = await this.getWorkflow(instance.workflowId);
      if (workflow) {
        this.addActivity('workflow_failed', `Workflow "${workflow.name}" failed validation`);
      }
    }
    
    return updatedInstance;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByAssignee(assignee: string): Promise<TaskWithWorkflow[]> {
    const userTasks = Array.from(this.tasks.values()).filter(
      task => task.assignee === assignee
    );
    
    const tasksWithWorkflow: TaskWithWorkflow[] = [];
    
    for (const task of userTasks) {
      const instance = await this.getWorkflowInstance(task.workflowInstanceId);
      if (instance) {
        const workflow = await this.getWorkflow(instance.workflowId);
        tasksWithWorkflow.push({
          ...task,
          workflowName: workflow?.name,
          workflowId: workflow?.id,
        });
      }
    }
    
    return tasksWithWorkflow;
  }

  async getTasksByWorkflowInstance(instanceId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.workflowInstanceId === instanceId
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      description: insertTask.description || null,
      assignee: insertTask.assignee || null,
      priority: insertTask.priority || 'medium',
      dueDate: insertTask.dueDate || null,
      formData: insertTask.formData || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.tasks.set(id, task);
    
    if (task.assignee) {
      this.addActivity('task_assigned', `Task "${task.name}" assigned to ${task.assignee}`);
    }
    
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      ...updateData,
      completedAt: updateData.status === 'completed' ? new Date() : task.completedAt,
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // API Integration operations
  async getApiIntegrations(): Promise<ApiIntegration[]> {
    return Array.from(this.apiIntegrations.values());
  }

  async getApiIntegration(id: number): Promise<ApiIntegration | undefined> {
    return this.apiIntegrations.get(id);
  }

  async createApiIntegration(insertIntegration: InsertApiIntegration): Promise<ApiIntegration> {
    const id = this.currentIntegrationId++;
    const now = new Date();
    const integration: ApiIntegration = {
      ...insertIntegration,
      id,
      authConfig: insertIntegration.authConfig || {},
      headers: insertIntegration.headers || {},
      timeout: insertIntegration.timeout || 30000,
      retryAttempts: insertIntegration.retryAttempts || 3,
      isActive: insertIntegration.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.apiIntegrations.set(id, integration);
    
    this.addActivity('workflow_deployed', `API integration "${integration.name}" created`);
    
    return integration;
  }

  async updateApiIntegration(id: number, updateData: Partial<InsertApiIntegration>): Promise<ApiIntegration | undefined> {
    const integration = this.apiIntegrations.get(id);
    if (!integration) return undefined;

    const updatedIntegration: ApiIntegration = {
      ...integration,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.apiIntegrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteApiIntegration(id: number): Promise<boolean> {
    return this.apiIntegrations.delete(id);
  }

  // API Call operations
  async getApiCalls(): Promise<ApiCall[]> {
    return Array.from(this.apiCalls.values());
  }

  async getApiCall(id: number): Promise<ApiCall | undefined> {
    return this.apiCalls.get(id);
  }

  async getApiCallsByWorkflowInstance(instanceId: number): Promise<ApiCall[]> {
    return Array.from(this.apiCalls.values()).filter(
      call => call.workflowInstanceId === instanceId
    );
  }

  async createApiCall(insertApiCall: InsertApiCall): Promise<ApiCall> {
    const id = this.currentApiCallId++;
    const apiCall: ApiCall = {
      ...insertApiCall,
      id,
      requestHeaders: insertApiCall.requestHeaders || {},
      requestBody: insertApiCall.requestBody || null,
      responseHeaders: insertApiCall.responseHeaders || null,
      responseBody: insertApiCall.responseBody || null,
      responseStatus: insertApiCall.responseStatus || null,
      errorMessage: insertApiCall.errorMessage || null,
      duration: insertApiCall.duration || null,
      attempts: insertApiCall.attempts || 1,
      createdAt: new Date(),
      completedAt: null,
    };
    this.apiCalls.set(id, apiCall);
    
    return apiCall;
  }

  async updateApiCall(id: number, updateData: Partial<InsertApiCall>): Promise<ApiCall | undefined> {
    const apiCall = this.apiCalls.get(id);
    if (!apiCall) return undefined;

    const updatedApiCall: ApiCall = {
      ...apiCall,
      ...updateData,
      completedAt: updateData.status && updateData.status !== 'pending' ? new Date() : apiCall.completedAt,
    };
    
    this.apiCalls.set(id, updatedApiCall);
    
    if (updateData.status === 'success') {
      this.addActivity('api_call_success', `API call to ${apiCall.endpoint} succeeded`);
    } else if (updateData.status === 'failed') {
      this.addActivity('api_call_failed', `API call to ${apiCall.endpoint} failed`);
    }
    
    return updatedApiCall;
  }

  // Dashboard metrics
  async getAdminMetrics(): Promise<AdminMetrics> {
    const allInstances = await this.getWorkflowInstances();
    const allTasks = await this.getTasks();
    const allApiCalls = await this.getApiCalls();
    
    const activeWorkflows = allInstances.filter(i => i.status === 'running').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = allTasks.filter(t => 
      t.status === 'completed' && 
      t.completedAt && 
      t.completedAt >= today
    ).length;

    const apiCallsToday = allApiCalls.filter(call => 
      call.createdAt >= today
    ).length;

    const failedApiCalls = allApiCalls.filter(call => 
      call.status === 'failed'
    ).length;
    
    // Simulate system health (in real app, this would check actual system metrics)
    const systemHealth = 98.5;
    
    const deploymentsToday = Array.from(this.deploymentPipelines.values()).filter(deployment => 
      deployment.createdAt >= today
    ).length;
    
    const failedDeployments = Array.from(this.deploymentPipelines.values()).filter(deployment => 
      deployment.status === 'failed' && deployment.createdAt >= today
    ).length;

    return {
      activeWorkflows,
      pendingTasks,
      completedToday,
      systemHealth,
      apiCallsToday,
      failedApiCalls,
      deploymentsToday,
      failedDeployments,
      recentActivity: this.recentActivity.slice(-10).reverse(), // Last 10 activities, newest first
    };
  }

  async getWorkflowsWithInstances(): Promise<WorkflowWithInstance[]> {
    const allWorkflows = await this.getWorkflows();
    const result: WorkflowWithInstance[] = [];
    
    for (const workflow of allWorkflows) {
      const instances = await this.getWorkflowInstancesByWorkflowId(workflow.id);
      const activeTasks = (await this.getTasks()).filter(task => {
        const instanceIds = instances.map(i => i.id);
        return instanceIds.includes(task.workflowInstanceId) && 
               (task.status === 'pending' || task.status === 'in_progress');
      }).length;
      
      result.push({
        ...workflow,
        instances,
        activeTasks,
      });
    }
    
    return result;
  }

  private addActivity(type: AdminMetrics['recentActivity'][0]['type'], message: string): void {
    this.recentActivity.push({
      type,
      message,
      timestamp: new Date(),
    });
    
    // Keep only last 50 activities
    if (this.recentActivity.length > 50) {
      this.recentActivity = this.recentActivity.slice(-50);
    }
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  workflows, 
  workflowInstances, 
  tasks, 
  apiIntegrations, 
  apiCalls,
  workflowVersions,
  deploymentPipeline
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  async getWorkflows(): Promise<Workflow[]> {
    return db.select().from(workflows);
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow || undefined;
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db
      .insert(workflows)
      .values(insertWorkflow)
      .returning();
    return workflow;
  }

  async updateWorkflow(id: number, updateData: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const [workflow] = await db
      .update(workflows)
      .set(updateData)
      .where(eq(workflows.id, id))
      .returning();
    return workflow || undefined;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id));
    return result.rowCount > 0;
  }

  // Workflow versioning methods
  async getWorkflowVersions(workflowId: number): Promise<WorkflowVersion[]> {
    return db.select().from(workflowVersions).where(eq(workflowVersions.workflowId, workflowId));
  }

  async createWorkflowVersion(insertVersion: InsertWorkflowVersion): Promise<WorkflowVersion> {
    const [version] = await db
      .insert(workflowVersions)
      .values(insertVersion)
      .returning();
    return version;
  }

  async getWorkflowVersion(id: number): Promise<WorkflowVersion | undefined> {
    const [version] = await db.select().from(workflowVersions).where(eq(workflowVersions.id, id));
    return version || undefined;
  }

  // Deployment pipeline methods
  async getDeploymentPipelines(workflowId?: number): Promise<DeploymentPipeline[]> {
    if (workflowId) {
      return db.select().from(deploymentPipeline).where(eq(deploymentPipeline.workflowId, workflowId));
    }
    return db.select().from(deploymentPipeline);
  }

  async createDeploymentPipeline(insertDeployment: InsertDeploymentPipeline): Promise<DeploymentPipeline> {
    const [deployment] = await db
      .insert(deploymentPipeline)
      .values(insertDeployment)
      .returning();
    return deployment;
  }

  async updateDeploymentPipeline(id: number, updateData: Partial<InsertDeploymentPipeline>): Promise<DeploymentPipeline | undefined> {
    const [deployment] = await db
      .update(deploymentPipeline)
      .set(updateData)
      .where(eq(deploymentPipeline.id, id))
      .returning();
    return deployment || undefined;
  }

  async getDeploymentPipeline(id: number): Promise<DeploymentPipeline | undefined> {
    const [deployment] = await db.select().from(deploymentPipeline).where(eq(deploymentPipeline.id, id));
    return deployment || undefined;
  }

  // Workflow instance operations
  async getWorkflowInstances(): Promise<WorkflowInstance[]> {
    return db.select().from(workflowInstances);
  }

  async getWorkflowInstance(id: number): Promise<WorkflowInstance | undefined> {
    const [instance] = await db.select().from(workflowInstances).where(eq(workflowInstances.id, id));
    return instance || undefined;
  }

  async getWorkflowInstancesByWorkflowId(workflowId: number): Promise<WorkflowInstance[]> {
    return db.select().from(workflowInstances).where(eq(workflowInstances.workflowId, workflowId));
  }

  async createWorkflowInstance(insertInstance: InsertWorkflowInstance): Promise<WorkflowInstance> {
    const [instance] = await db
      .insert(workflowInstances)
      .values(insertInstance)
      .returning();
    return instance;
  }

  async updateWorkflowInstance(id: number, updateData: Partial<InsertWorkflowInstance>): Promise<WorkflowInstance | undefined> {
    const [instance] = await db
      .update(workflowInstances)
      .set(updateData)
      .where(eq(workflowInstances.id, id))
      .returning();
    return instance || undefined;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByAssignee(assignee: string): Promise<TaskWithWorkflow[]> {
    const result = await db
      .select({
        id: tasks.id,
        workflowInstanceId: tasks.workflowInstanceId,
        taskDefinitionKey: tasks.taskDefinitionKey,
        name: tasks.name,
        description: tasks.description,
        assignee: tasks.assignee,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        completedAt: tasks.completedAt,
        formData: tasks.formData,
        workflowName: workflows.name,
        workflowId: workflows.id,
      })
      .from(tasks)
      .leftJoin(workflowInstances, eq(tasks.workflowInstanceId, workflowInstances.id))
      .leftJoin(workflows, eq(workflowInstances.workflowId, workflows.id))
      .where(eq(tasks.assignee, assignee));

    return result;
  }

  async getTasksByWorkflowInstance(instanceId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.workflowInstanceId, instanceId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  // API Integration operations
  async getApiIntegrations(): Promise<ApiIntegration[]> {
    return db.select().from(apiIntegrations);
  }

  async getApiIntegration(id: number): Promise<ApiIntegration | undefined> {
    const [integration] = await db.select().from(apiIntegrations).where(eq(apiIntegrations.id, id));
    return integration || undefined;
  }

  async createApiIntegration(insertIntegration: InsertApiIntegration): Promise<ApiIntegration> {
    const [integration] = await db
      .insert(apiIntegrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateApiIntegration(id: number, updateData: Partial<InsertApiIntegration>): Promise<ApiIntegration | undefined> {
    const [integration] = await db
      .update(apiIntegrations)
      .set(updateData)
      .where(eq(apiIntegrations.id, id))
      .returning();
    return integration || undefined;
  }

  async deleteApiIntegration(id: number): Promise<boolean> {
    const result = await db.delete(apiIntegrations).where(eq(apiIntegrations.id, id));
    return result.rowCount > 0;
  }

  // API Call operations
  async getApiCalls(): Promise<ApiCall[]> {
    return db.select().from(apiCalls);
  }

  async getApiCall(id: number): Promise<ApiCall | undefined> {
    const [apiCall] = await db.select().from(apiCalls).where(eq(apiCalls.id, id));
    return apiCall || undefined;
  }

  async getApiCallsByWorkflowInstance(instanceId: number): Promise<ApiCall[]> {
    return db.select().from(apiCalls).where(eq(apiCalls.workflowInstanceId, instanceId));
  }

  async createApiCall(insertApiCall: InsertApiCall): Promise<ApiCall> {
    const [apiCall] = await db
      .insert(apiCalls)
      .values(insertApiCall)
      .returning();
    return apiCall;
  }

  async updateApiCall(id: number, updateData: Partial<InsertApiCall>): Promise<ApiCall | undefined> {
    const [apiCall] = await db
      .update(apiCalls)
      .set(updateData)
      .where(eq(apiCalls.id, id))
      .returning();
    return apiCall || undefined;
  }

  // Dashboard metrics
  async getAdminMetrics(): Promise<AdminMetrics> {
    const allWorkflows = await this.getWorkflows();
    const allInstances = await this.getWorkflowInstances();
    const allTasks = await this.getTasks();
    const allApiCalls = await this.getApiCalls();
    const allDeployments = await this.getDeploymentPipelines();
    
    const activeWorkflows = allInstances.filter(i => i.status === 'running').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = allTasks.filter(t => 
      t.status === 'completed' && 
      t.completedAt && 
      t.completedAt >= today
    ).length;

    const apiCallsToday = allApiCalls.filter(call => 
      call.createdAt >= today
    ).length;

    const failedApiCalls = allApiCalls.filter(call => 
      call.status === 'failed'
    ).length;

    const deploymentsToday = allDeployments.filter(deployment => 
      deployment.createdAt >= today
    ).length;
    
    const failedDeployments = allDeployments.filter(deployment => 
      deployment.status === 'failed' && deployment.createdAt >= today
    ).length;
    
    const systemHealth = 98.5;
    
    return {
      activeWorkflows,
      pendingTasks,
      completedToday,
      systemHealth,
      apiCallsToday,
      failedApiCalls,
      deploymentsToday,
      failedDeployments,
      recentActivity: []
    };
  }

  async getWorkflowsWithInstances(): Promise<WorkflowWithInstance[]> {
    const allWorkflows = await this.getWorkflows();
    const result: WorkflowWithInstance[] = [];
    
    for (const workflow of allWorkflows) {
      const instances = await this.getWorkflowInstancesByWorkflowId(workflow.id);
      const activeTasks = (await this.getTasks()).filter(task => {
        const instanceIds = instances.map(i => i.id);
        return instanceIds.includes(task.workflowInstanceId) && 
               (task.status === 'pending' || task.status === 'in_progress');
      }).length;
      
      result.push({
        ...workflow,
        instances,
        activeTasks
      });
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();
