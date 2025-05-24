import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BpmnModeler from "@/components/workflow/bpmn-modeler";
import PropertiesPanel from "@/components/workflow/properties-panel";
import CollaborativeCursors from "@/components/collaboration/collaborative-cursors";
import UserPresence from "@/components/collaboration/user-presence";
import { useCollaboration } from "@/hooks/use-collaboration";
import { Download, Upload, Save, Play, UserCheck, GitBranch, Square, FolderOpen, Plus, Edit } from "lucide-react";
import type { InsertWorkflow } from "@shared/schema";

export default function WorkflowDesigner() {
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [bpmnXml, setBpmnXml] = useState("");
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<number | null>(null);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isNewWorkflow, setIsNewWorkflow] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate a unique user ID for this session
  const userId = useRef(`user-${Math.random().toString(36).substr(2, 9)}`).current;
  const userName = useRef(`User ${userId.slice(-4)}`).current;

  // Fetch saved workflows for loading
  const { data: savedWorkflows = [] } = useQuery({
    queryKey: ['/api/workflows'],
  });

  // Real-time collaboration
  const { activeUsers, isConnected, sendCursorPosition, broadcastElementUpdate } = useCollaboration(
    currentWorkflowId,
    userId,
    userName,
    {
      onUserJoined: (user) => {
        toast({
          title: "User Joined",
          description: `${user.userName} is now collaborating`,
        });
      },
      onUserLeft: (user) => {
        toast({
          title: "User Left",
          description: `${user.userName} stopped collaborating`,
        });
      },
      onElementChanged: (data) => {
        if (data.bpmnXml && data.bpmnXml !== bpmnXml) {
          setBpmnXml(data.bpmnXml);
          toast({
            title: "Workflow Updated",
            description: `${data.userName} made changes to the workflow`,
          });
        }
      }
    }
  );

  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflow: InsertWorkflow) => {
      const response = await apiRequest("POST", "/api/workflows", workflow);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentWorkflowId(data.id);
      setIsNewWorkflow(false);
      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, workflow }: { id: number; workflow: Partial<InsertWorkflow> }) => {
      const response = await apiRequest("PUT", `/api/workflows/${id}`, workflow);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    },
  });

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    if (!bpmnXml.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please create a workflow diagram first",
        variant: "destructive",
      });
      return;
    }

    if (isNewWorkflow || !currentWorkflowId) {
      // Create new workflow
      saveWorkflowMutation.mutate({
        name: workflowName,
        description: workflowDescription,
        bpmnXml: bpmnXml,
        version: 1,
      });
    } else {
      // Update existing workflow
      updateWorkflowMutation.mutate({ 
        id: currentWorkflowId, 
        workflow: {
          name: workflowName,
          description: workflowDescription,
          bpmnXml: bpmnXml,
        }
      });
    }
  };

  const handleLoadWorkflow = (workflowId: string) => {
    const workflow = savedWorkflows.find((w: any) => w.id.toString() === workflowId);
    if (workflow) {
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description);
      setBpmnXml(workflow.bpmnXml);
      setCurrentWorkflowId(workflow.id);
      setIsNewWorkflow(false);
      setIsLoadDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Loaded workflow: ${workflow.name}`,
      });
    }
  };

  const handleNewWorkflow = () => {
    setWorkflowName("");
    setWorkflowDescription("");
    setBpmnXml("");
    setCurrentWorkflowId(null);
    setIsNewWorkflow(true);
    setSelectedElement(null);
    
    toast({
      title: "New Workflow",
      description: "Started a new workflow",
    });
  };

  // Handle mouse movement for collaborative cursors
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (canvasRef.current && currentWorkflowId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sendCursorPosition(x, y);
    }
  }, [currentWorkflowId, sendCursorPosition]);

  // Handle BPMN XML changes and broadcast to collaborators
  const handleBpmnXmlChange = useCallback((xml: string) => {
    setBpmnXml(xml);
    if (currentWorkflowId && selectedElement) {
      broadcastElementUpdate(selectedElement.id || 'canvas', {}, xml);
    }
  }, [currentWorkflowId, selectedElement, broadcastElementUpdate]);

  const handleExport = () => {
    if (!bpmnXml) {
      toast({
        title: "Nothing to Export",
        description: "Please create a workflow diagram first",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName || 'workflow'}.bpmn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const xml = e.target?.result as string;
      setBpmnXml(xml);
      
      // Extract workflow name from BPMN if not set
      if (!workflowName) {
        const match = xml.match(/name="([^"]+)"/);
        if (match) {
          setWorkflowName(match[1]);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <header className="header-modern px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
              <p className="text-gray-600 font-medium">Build and configure your automation workflows</p>
            </div>
            
            {/* User Presence Indicator */}
            <UserPresence 
              users={activeUsers} 
              currentUserId={userId} 
              isConnected={isConnected} 
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleNewWorkflow} className="btn-secondary-modern">
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
            
            <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-secondary-modern">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Load Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Load Saved Workflow</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="workflow-select">Select a workflow to load:</Label>
                    <Select onValueChange={handleLoadWorkflow}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a workflow..." />
                      </SelectTrigger>
                      <SelectContent>
                        {savedWorkflows.map((workflow: any) => (
                          <SelectItem key={workflow.id} value={workflow.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{workflow.name}</span>
                              <span className="text-sm text-gray-500">{workflow.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".bpmn,.xml"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <Button 
              onClick={handleSaveWorkflow}
              disabled={saveWorkflowMutation.isPending || updateWorkflowMutation.isPending}
              className="btn-primary-modern"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveWorkflowMutation.isPending || updateWorkflowMutation.isPending 
                ? "Saving..." 
                : isNewWorkflow 
                ? "Save Workflow" 
                : "Update Workflow"}
            </Button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
            <Button variant="ghost" size="sm" title="Start Event">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="User Task">
              <UserCheck className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Gateway">
              <GitBranch className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="End Event">
              <Square className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="100">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100%</SelectItem>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Workflow Details Form */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="workflow-name" className="text-sm font-medium text-gray-700">
              Workflow Name *
            </Label>
            <Input
              id="workflow-name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name..."
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="workflow-description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Input
              id="workflow-description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Enter workflow description..."
              className="mt-1"
            />
          </div>
        </div>
        {currentWorkflowId && (
          <div className="mt-2 text-sm text-blue-600">
            Currently editing: {workflowName} (ID: {currentWorkflowId})
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Build Blocks */}
        <div className="w-80 sidebar-modern border-r border-gray-200/60 flex-shrink-0">
          <div className="p-6">
            {/* Build Block Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Square className="h-4 w-4 text-orange-600" />
                  </div>
                  Build Block
                </h3>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* Rules Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Rules</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="card-modern p-3 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center">
                      <GitBranch className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">True/false</span>
                    </div>
                  </div>
                  <div className="card-modern p-3 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center">
                      <GitBranch className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Multi-split</span>
                    </div>
                  </div>
                  <div className="card-modern p-3 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center">
                      <GitBranch className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Delay</span>
                    </div>
                  </div>
                  <div className="card-modern p-3 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center">
                      <GitBranch className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Exit</span>
                    </div>
                  </div>
                  <div className="card-modern p-3 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center">
                      <GitBranch className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Cond. match</span>
                    </div>
                  </div>
                  <div className="card-modern p-3 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center">
                      <GitBranch className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Wait event</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Line Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Subject Line</h4>
                <div className="space-y-2">
                  <div className="card-modern p-3 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Manage sequences</span>
                    </div>
                  </div>
                  <div className="card-modern p-3 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Manage lists</span>
                    </div>
                  </div>
                  <div className="card-modern p-3 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Manage deals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="bg-white border-b border-gray-200/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Automation Workflow</h2>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium">When this happens</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </div>

          {/* BPMN Canvas with Collaborative Features */}
          <div 
            ref={canvasRef}
            className="flex-1 relative bg-white"
            onMouseMove={handleMouseMove}
          >
            <BpmnModeler 
              onXmlChange={handleBpmnXmlChange}
              onElementSelect={setSelectedElement}
              xml={bpmnXml}
            />
            
            {/* Collaborative Cursors Overlay */}
            <CollaborativeCursors 
              users={activeUsers} 
              currentUserId={userId} 
            />
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 bg-white border-l border-gray-200/60 flex-shrink-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
            <PropertiesPanel selectedElement={selectedElement} />
          </div>
        </div>
      </div>
    </div>
  );
}
