import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Settings, Trash2, Play, Globe } from "lucide-react";
import type { ApiIntegration, InsertApiIntegration } from "@shared/schema";

export default function ApiIntegrations() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<ApiIntegration | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/integrations"],
    queryFn: async () => {
      const response = await fetch("/api/integrations", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch integrations");
      return response.json() as ApiIntegration[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (integration: InsertApiIntegration) => {
      const response = await apiRequest("POST", "/api/integrations", integration);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "API integration created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create integration", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: "Success", description: "Integration deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete integration", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const authConfig: Record<string, any> = {};
    const authType = formData.get("authType") as string;
    
    if (authType === "bearer") {
      authConfig.token = formData.get("token") as string;
    } else if (authType === "api_key") {
      authConfig.key = formData.get("key") as string;
      authConfig.header = formData.get("header") as string || "X-API-Key";
    } else if (authType === "basic") {
      authConfig.username = formData.get("username") as string;
      authConfig.password = formData.get("password") as string;
    }

    const integration: InsertApiIntegration = {
      name: formData.get("name") as string,
      baseUrl: formData.get("baseUrl") as string,
      authType,
      authConfig,
      headers: JSON.parse((formData.get("headers") as string) || "{}"),
      timeout: parseInt(formData.get("timeout") as string) || 30000,
      retryAttempts: parseInt(formData.get("retryAttempts") as string) || 3,
    };

    createMutation.mutate(integration);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">API Integrations</h2>
            <p className="text-gray-600 mt-1">Connect your workflows to external systems</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create API Integration</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Integration Name</Label>
                    <Input id="name" name="name" placeholder="Customer API" required />
                  </div>
                  <div>
                    <Label htmlFor="baseUrl">Base URL</Label>
                    <Input id="baseUrl" name="baseUrl" placeholder="https://api.example.com" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="authType">Authentication Type</Label>
                  <Select name="authType" defaultValue="none">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Authentication</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="token">Bearer Token</Label>
                    <Input id="token" name="token" type="password" placeholder="your-bearer-token" />
                  </div>
                  <div>
                    <Label htmlFor="key">API Key</Label>
                    <Input id="key" name="key" type="password" placeholder="your-api-key" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="header">Key Header Name</Label>
                    <Input id="header" name="header" placeholder="X-API-Key" />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" placeholder="username" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="password" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="headers">Default Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    name="headers"
                    placeholder='{"Content-Type": "application/json"}'
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input id="timeout" name="timeout" type="number" defaultValue="30000" />
                  </div>
                  <div>
                    <Label htmlFor="retryAttempts">Retry Attempts</Label>
                    <Input id="retryAttempts" name="retryAttempts" type="number" defaultValue="3" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Integration"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {integrations.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API integrations</h3>
            <p className="text-gray-500 mb-4">
              Connect your workflows to external systems and APIs
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first integration
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={integration.isActive ? "default" : "secondary"}>
                        {integration.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(integration.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Base URL</p>
                      <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                        {integration.baseUrl}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Auth Type</span>
                      <Badge variant="outline">{integration.authType}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Timeout</span>
                      <span>{integration.timeout}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Retry Attempts</span>
                      <span>{integration.retryAttempts}</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}