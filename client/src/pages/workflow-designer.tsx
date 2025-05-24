import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BpmnModeler from "@/components/workflow/bpmn-modeler";
import PropertiesPanel from "@/components/workflow/properties-panel";
import { Download, Upload, Save, Play, UserCheck, GitBranch, Square } from "lucide-react";
import type { InsertWorkflow } from "@shared/schema";

export default function WorkflowDesigner() {
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [bpmnXml, setBpmnXml] = useState("");
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflow: InsertWorkflow) => {
      const response = await apiRequest("POST", "/api/workflows", workflow);
      return response.json();
    },
    onSuccess: () => {
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

    saveWorkflowMutation.mutate({
      name: workflowName,
      description: workflowDescription,
      bpmnXml: bpmnXml,
      version: 1,
      isActive: true,
    });
  };

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workflow Designer</h2>
            <p className="text-gray-600 mt-1">Create and edit BPMN workflows visually</p>
          </div>
          <div className="flex items-center space-x-3">
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
              disabled={saveWorkflowMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveWorkflowMutation.isPending ? "Saving..." : "Save Workflow"}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* BPMN Canvas */}
        <div className="flex-1 relative">
          <BpmnModeler 
            onXmlChange={setBpmnXml}
            onElementSelect={setSelectedElement}
            xml={bpmnXml}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
            
            {/* Workflow Properties */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Element Properties */}
            <PropertiesPanel selectedElement={selectedElement} />
          </div>
        </div>
      </div>
    </div>
  );
}
