import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WorkflowDesigner from "@/pages/workflow-designer";
import TaskManagement from "@/pages/task-management";
import AdminDashboard from "@/pages/admin-dashboard";
import ApiIntegrations from "@/pages/api-integrations";
import WorkflowVersions from "@/pages/workflow-versions";
import Sidebar from "@/components/layout/sidebar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={WorkflowDesigner} />
          <Route path="/designer" component={WorkflowDesigner} />
          <Route path="/tasks" component={TaskManagement} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/integrations" component={ApiIntegrations} />
          <Route path="/versions" component={WorkflowVersions} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
