import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricsCard from "@/components/admin/metrics-card";
import WorkflowTable from "@/components/admin/workflow-table";
import { useWebSocket } from "@/hooks/use-websocket";
import { RefreshCw, Activity, Clock, CheckCircle, Heart } from "lucide-react";
import type { AdminMetrics, WorkflowWithInstance } from "@shared/schema";

export default function AdminDashboard() {
  // Enable WebSocket for real-time updates
  useWebSocket();

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/admin/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/metrics", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json() as AdminMetrics;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: workflows = [], isLoading: workflowsLoading, refetch: refetchWorkflows } = useQuery({
    queryKey: ["/api/admin/workflows"],
    queryFn: async () => {
      const response = await fetch("/api/admin/workflows", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch workflows");
      return response.json() as WorkflowWithInstance[];
    },
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchMetrics();
    refetchWorkflows();
  };

  if (metricsLoading || workflowsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 mt-1">Monitor workflow health and system performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select defaultValue="24h">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Active Workflows"
            value={metrics?.activeWorkflows || 0}
            change="+12%"
            changeLabel="from last month"
            icon={Activity}
            color="blue"
          />
          <MetricsCard
            title="Pending Tasks"
            value={metrics?.pendingTasks || 0}
            change="+5"
            changeLabel="from yesterday"
            icon={Clock}
            color="orange"
          />
          <MetricsCard
            title="Completed Today"
            value={metrics?.completedToday || 0}
            change="+8%"
            changeLabel="from yesterday"
            icon={CheckCircle}
            color="green"
          />
          <MetricsCard
            title="System Health"
            value={`${metrics?.systemHealth || 0}%`}
            change="Excellent"
            changeLabel="performance"
            icon={Heart}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Status Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Workflow Execution Trends</CardTitle>
                  <Select defaultValue="7d">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2" />
                    <p className="font-medium">Workflow Analytics Chart</p>
                    <p className="text-sm">Chart visualization would be integrated here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`activity-dot ${
                      activity.type === 'workflow_completed' ? 'success' :
                      activity.type === 'task_assigned' ? 'warning' :
                      activity.type === 'workflow_deployed' ? 'info' :
                      'error'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Workflows Table */}
        <div className="mt-8">
          <WorkflowTable workflows={workflows} />
        </div>
      </div>
    </div>
  );
}
