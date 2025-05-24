import { 
  workflows, 
  workflowInstances, 
  tasks,
  type Workflow, 
  type WorkflowInstance, 
  type Task,
  type InsertWorkflow, 
  type InsertWorkflowInstance, 
  type InsertTask,
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

  // Dashboard metrics
  getAdminMetrics(): Promise<AdminMetrics>;
  getWorkflowsWithInstances(): Promise<WorkflowWithInstance[]>;
}

export class MemStorage implements IStorage {
  private workflows: Map<number, Workflow>;
  private workflowInstances: Map<number, WorkflowInstance>;
  private tasks: Map<number, Task>;
  private currentWorkflowId: number;
  private currentInstanceId: number;
  private currentTaskId: number;
  private recentActivity: AdminMetrics['recentActivity'];

  constructor() {
    this.workflows = new Map();
    this.workflowInstances = new Map();
    this.tasks = new Map();
    this.currentWorkflowId = 1;
    this.currentInstanceId = 1;
    this.currentTaskId = 1;
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

  // Dashboard metrics
  async getAdminMetrics(): Promise<AdminMetrics> {
    const allInstances = await this.getWorkflowInstances();
    const allTasks = await this.getTasks();
    
    const activeWorkflows = allInstances.filter(i => i.status === 'running').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = allTasks.filter(t => 
      t.status === 'completed' && 
      t.completedAt && 
      t.completedAt >= today
    ).length;
    
    // Simulate system health (in real app, this would check actual system metrics)
    const systemHealth = 98.5;
    
    return {
      activeWorkflows,
      pendingTasks,
      completedToday,
      systemHealth,
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

export const storage = new MemStorage();
