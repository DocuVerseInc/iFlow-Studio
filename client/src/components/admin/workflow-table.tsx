import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Workflow, Eye, Pause, Play } from "lucide-react";
import type { WorkflowWithInstance } from "@shared/schema";

interface WorkflowTableProps {
  workflows: WorkflowWithInstance[];
}

export default function WorkflowTable({ workflows }: WorkflowTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="status-badge running">In Progress</Badge>;
      case 'completed':
        return <Badge className="status-badge completed">Completed</Badge>;
      case 'failed':
        return <Badge className="status-badge blocked">Blocked</Badge>;
      case 'paused':
        return <Badge className="status-badge paused">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgress = (instances: any[] = []) => {
    if (!instances.length) return 0;
    
    const completed = instances.filter(i => i.status === 'completed').length;
    return Math.round((completed / instances.length) * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'warning';
    if (progress >= 25) return 'error';
    return 'error';
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  if (!workflows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-500">Create your first workflow to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Active Tasks</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => {
                const latestInstance = workflow.instances?.[0];
                const progress = getProgress(workflow.instances);
                const progressColor = getProgressColor(progress);
                
                return (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                          <Workflow className="text-white h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                          <div className="text-sm text-gray-500">WF-{workflow.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {latestInstance ? getStatusBadge(latestInstance.status) : (
                        <Badge variant="secondary">Not Started</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center">
                        <div className="progress-bar">
                          <div 
                            className={`progress-bar-fill ${progressColor}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{progress}%</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-gray-900">{workflow.activeTasks || 0}</span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {latestInstance ? formatTimeAgo(latestInstance.startedAt) : 'Never'}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {latestInstance?.status === 'running' ? (
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
