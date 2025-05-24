import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Flag, Workflow, Eye, Play, CheckCircle } from "lucide-react";
import type { TaskWithWorkflow } from "@shared/schema";

interface TaskCardProps {
  task: TaskWithWorkflow;
  onStart: () => void;
  onComplete: (formData?: any) => void;
  isStarting?: boolean;
  isCompleting?: boolean;
}

export default function TaskCard({ 
  task, 
  onStart, 
  onComplete, 
  isStarting = false, 
  isCompleting = false 
}: TaskCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="status-badge pending">Pending</Badge>;
      case 'in_progress':
        return <Badge className="status-badge in-progress">In Progress</Badge>;
      case 'completed':
        return <Badge className="status-badge completed">Completed</Badge>;
      case 'failed':
        return <Badge className="status-badge failed">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'text-gray-500';
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return 'No due date';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const canStart = task.status === 'pending';
  const canComplete = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
              {getStatusBadge(task.status)}
            </div>
            
            {task.description && (
              <p className="text-gray-600 mb-3">{task.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {task.workflowName && (
                <div className="flex items-center space-x-1">
                  <Workflow className="h-4 w-4" />
                  <span>{task.workflowName}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDueDate(task.dueDate)}</span>
              </div>
              
              <div className={`flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                <Flag className="h-4 w-4" />
                <span className="capitalize">{task.priority} Priority</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {canStart && (
              <Button 
                onClick={onStart}
                disabled={isStarting}
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                {isStarting ? "Starting..." : "Start Task"}
              </Button>
            )}
            
            {canComplete && (
              <Button 
                onClick={() => onComplete()}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {isCompleting ? "Completing..." : "Complete"}
              </Button>
            )}
            
            {isCompleted && (
              <Button variant="outline" size="sm" disabled>
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
