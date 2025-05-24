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
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <header className="header-modern px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Workflow</h1>
            <p className="text-gray-600 font-medium">Monitor workflow performance and system health</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select defaultValue="24h">
              <SelectTrigger className="w-40 bg-white border-gray-200 rounded-xl shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} className="btn-secondary-modern">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="metric-display">{metrics?.activeWorkflows || 0}</div>
                <div className="metric-label">Active Workflows</div>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="stat-card group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="metric-display">{metrics?.pendingTasks || 0}</div>
                <div className="metric-label">Pending Tasks</div>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-orange-600 font-medium">+5</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          <div className="stat-card group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="metric-display">{metrics?.completedToday || 0}</div>
                <div className="metric-label">Completed Today</div>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          <div className="stat-card group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Heart className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="metric-display">{metrics?.systemHealth || 0}%</div>
                <div className="metric-label">System Health</div>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-emerald-600 font-medium">Excellent</span>
              <span className="text-gray-500 ml-1">performance</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clipboard Section */}
          <div className="lg:col-span-2">
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="section-header mb-0">Clipboard</h3>
                  <div className="flex space-x-6 mt-3">
                    <button className="text-gray-900 font-medium border-b-2 border-blue-500 pb-1">My Clipboard</button>
                    <button className="text-gray-500 font-medium pb-1">Dept. Clipboard</button>
                    <button className="text-gray-500 font-medium pb-1">My Action Plan</button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="data-table">
                  <div className="table-header">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                      <div>Dept</div>
                      <div>LBR Hrs</div>
                      <div>Start</div>
                      <div>Due</div>
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-2">⭐</span>
                        <span className="font-medium">Dept Walk with Store Director</span>
                      </div>
                      <div className="text-gray-600">20 min</div>
                      <div className="text-gray-600">05:20a</div>
                      <div className="text-gray-600">08:00a</div>
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="font-medium">Set Up Cheese Case</div>
                      <div className="text-gray-600">35 min</div>
                      <div className="text-gray-600">05:00a</div>
                      <div className="text-gray-600">07:45a</div>
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="font-medium">Vendor Meeting - SYSCO REP</div>
                      <div className="text-gray-600">20 min</div>
                      <div className="text-gray-600">04:45a</div>
                      <div className="text-gray-600">08:00a</div>
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="font-medium">Store Manager Huddle</div>
                      <div className="text-gray-600">35 min</div>
                      <div className="text-gray-600">04:30a</div>
                      <div className="text-gray-600">05:30a</div>
                    </div>
                  </div>
                  <div className="table-row border-b-0">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="font-medium">Easter Dinner Orders Due</div>
                      <div className="text-gray-600">-</div>
                      <div className="text-gray-600">-</div>
                      <div className="text-gray-600">-</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
