import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkflowVersionSchema, insertDeploymentPipelineSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, Rocket, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

const createVersionSchema = insertWorkflowVersionSchema.extend({
  workflowId: z.number(),
});

const createDeploymentSchema = insertDeploymentPipelineSchema.extend({
  workflowId: z.number(),
});

// Function to generate next version number
function getNextVersion(existingVersions: any[]): string {
  if (!existingVersions || existingVersions.length === 0) {
    return "1.0.0";
  }
  
  // Sort versions and get the latest
  const sortedVersions = existingVersions
    .map(v => v.version)
    .filter(v => v && typeof v === 'string')
    .sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart !== bPart) return bPart - aPart;
      }
      return 0;
    });
  
  if (sortedVersions.length === 0) {
    return "1.0.0";
  }
  
  const latestVersion = sortedVersions[0];
  const parts = latestVersion.split('.').map(Number);
  
  // Increment patch version by default
  if (parts.length >= 3) {
    parts[2] += 1;
  } else if (parts.length === 2) {
    parts.push(1);
  } else {
    parts.push(0, 1);
  }
  
  return parts.join('.');
}

export default function WorkflowVersions() {
  const { toast } = useToast();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isDeploymentDialogOpen, setIsDeploymentDialogOpen] = useState(false);

  // Fetch workflows
  const { data: workflows = [] } = useQuery({
    queryKey: ['/api/workflows'],
  });

  // Fetch versions for selected workflow
  const { data: versions = [] } = useQuery({
    queryKey: ['/api/workflows', selectedWorkflowId, 'versions'],
    enabled: !!selectedWorkflowId,
  });

  // Fetch deployment pipelines
  const { data: deployments = [] } = useQuery({
    queryKey: ['/api/deployments'],
  });

  // Create version mutation
  const createVersionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createVersionSchema>) => {
      const response = await fetch(`/api/workflows/${data.workflowId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create version');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      setIsVersionDialogOpen(false);
      toast({
        title: "Success",
        description: "Workflow version created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create version",
        variant: "destructive",
      });
    },
  });

  // Create deployment mutation
  const createDeploymentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createDeploymentSchema>) => {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create deployment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
      setIsDeploymentDialogOpen(false);
      toast({
        title: "Success",
        description: "Deployment started successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start deployment",
        variant: "destructive",
      });
    },
  });

  const versionForm = useForm<z.infer<typeof createVersionSchema>>({
    resolver: zodResolver(createVersionSchema),
    defaultValues: {
      workflowId: 0,
      version: "",
      bpmnXml: "",
      changeLog: "",
      status: "draft",
      createdBy: "current_user",
    },
  });

  // Auto-populate version when workflow is selected
  const handleWorkflowSelection = (workflowId: number) => {
    versionForm.setValue('workflowId', workflowId);
    
    // Get versions for this workflow and suggest next version
    const workflowVersions = versions.filter((v: any) => v.workflowId === workflowId);
    const nextVersion = getNextVersion(workflowVersions);
    versionForm.setValue('version', nextVersion);
  };

  const deploymentForm = useForm<z.infer<typeof createDeploymentSchema>>({
    resolver: zodResolver(createDeploymentSchema),
    defaultValues: {
      workflowId: 0,
      version: "",
      environment: "development",
      deployedBy: "current_user",
    },
  });

  const onVersionSubmit = (data: z.infer<typeof createVersionSchema>) => {
    createVersionMutation.mutate(data);
  };

  const onDeploymentSubmit = (data: z.infer<typeof createDeploymentSchema>) => {
    createDeploymentMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default",
      failed: "destructive",
      running: "secondary",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">iFlow Versions & Deployments</h1>
        <div className="flex gap-2">
          <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <GitBranch className="h-4 w-4 mr-2" />
                Create Version
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
              </DialogHeader>
              <Form {...versionForm}>
                <form onSubmit={versionForm.handleSubmit(onVersionSubmit)} className="space-y-4">
                  <FormField
                    control={versionForm.control}
                    name="workflowId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workflow</FormLabel>
                        <Select onValueChange={(value) => {
                          const workflowId = parseInt(value);
                          field.onChange(workflowId);
                          handleWorkflowSelection(workflowId);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workflow" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workflows.map((workflow: any) => (
                              <SelectItem key={workflow.id} value={workflow.id.toString()}>
                                {workflow.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={versionForm.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1.1.0" {...field} />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Auto-suggested based on existing versions. You can override this value.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={versionForm.control}
                    name="changeLog"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Change Log</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What changed in this version..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createVersionMutation.isPending}>
                    {createVersionMutation.isPending ? "Creating..." : "Create Version"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeploymentDialogOpen} onOpenChange={setIsDeploymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Start Deployment</DialogTitle>
              </DialogHeader>
              <Form {...deploymentForm}>
                <form onSubmit={deploymentForm.handleSubmit(onDeploymentSubmit)} className="space-y-4">
                  <FormField
                    control={deploymentForm.control}
                    name="workflowId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workflow</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workflow" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workflows.map((workflow: any) => (
                              <SelectItem key={workflow.id} value={workflow.id.toString()}>
                                {workflow.name} (v{workflow.version})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deploymentForm.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="Version to deploy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={deploymentForm.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Environment</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createDeploymentMutation.isPending}>
                    {createDeploymentMutation.isPending ? "Starting..." : "Start Deployment"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Versions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              iFlow Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select onValueChange={(value) => setSelectedWorkflowId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select iFlow to view versions" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow: any) => (
                    <SelectItem key={workflow.id} value={workflow.id.toString()}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedWorkflowId && (
                <div className="space-y-3">
                  {versions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No versions found for this workflow
                    </p>
                  ) : (
                    versions.map((version: any) => (
                      <div key={version.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">Version {version.version}</h4>
                            <p className="text-sm text-muted-foreground">
                              by {version.createdBy}
                            </p>
                          </div>
                          {getStatusBadge(version.status)}
                        </div>
                        {version.changeLog && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {version.changeLog}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created {new Date(version.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deployment Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Deployment Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deployments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No deployments found
                </p>
              ) : (
                deployments.map((deployment: any) => (
                  <div key={deployment.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          Workflow {deployment.workflowId} v{deployment.version}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          to {deployment.environment} by {deployment.deployedBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deployment.status)}
                        {getStatusBadge(deployment.status)}
                      </div>
                    </div>
                    {deployment.deploymentLogs && (
                      <p className="text-sm text-muted-foreground mt-2 font-mono">
                        {deployment.deploymentLogs}
                      </p>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Started {new Date(deployment.createdAt).toLocaleDateString()}</span>
                      {deployment.completedAt && (
                        <span>Completed {new Date(deployment.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}