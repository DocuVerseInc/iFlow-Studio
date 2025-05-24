import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Info, Zap, GitBranch, Timer, CheckCircle, AlertTriangle, Mail, User, Settings } from "lucide-react";

interface ElementTooltipProps {
  elementType: string;
  elementName?: string;
  properties?: any;
  children: React.ReactNode;
}

const getElementInfo = (elementType: string) => {
  const tooltips: Record<string, { 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    tips: string[];
    color: string;
  }> = {
    'bpmn:StartEvent': {
      icon: <Zap className="h-4 w-4" />,
      title: 'Start Event',
      description: 'Represents the beginning of a process or workflow',
      tips: [
        'Every workflow must have at least one start event',
        'Can be triggered by time, message, or manually',
        'Use different start event types for different triggers'
      ],
      color: 'text-green-600'
    },
    'bpmn:EndEvent': {
      icon: <CheckCircle className="h-4 w-4" />,
      title: 'End Event',
      description: 'Represents the completion of a process or workflow',
      tips: [
        'Marks the successful completion of a workflow path',
        'Can trigger notifications or cleanup actions',
        'Multiple end events are allowed for different outcomes'
      ],
      color: 'text-red-600'
    },
    'bpmn:Task': {
      icon: <Settings className="h-4 w-4" />,
      title: 'Task',
      description: 'A single unit of work within the process',
      tips: [
        'Assign to specific users or roles',
        'Set due dates and priorities',
        'Add detailed instructions in the description'
      ],
      color: 'text-blue-600'
    },
    'bpmn:UserTask': {
      icon: <User className="h-4 w-4" />,
      title: 'User Task',
      description: 'A task that requires human interaction to complete',
      tips: [
        'Requires manual completion by a user',
        'Can include forms and data collection',
        'Set appropriate assignees and due dates'
      ],
      color: 'text-purple-600'
    },
    'bpmn:ServiceTask': {
      icon: <Zap className="h-4 w-4" />,
      title: 'Service Task',
      description: 'An automated task executed by the system',
      tips: [
        'Executes automatically without user intervention',
        'Can call external APIs or services',
        'Configure connection details and error handling'
      ],
      color: 'text-indigo-600'
    },
    'bpmn:SendTask': {
      icon: <Mail className="h-4 w-4" />,
      title: 'Send Task',
      description: 'Sends a message to external participants',
      tips: [
        'Used for email notifications or messages',
        'Configure recipient details and message content',
        'Can trigger other processes or workflows'
      ],
      color: 'text-cyan-600'
    },
    'bpmn:ExclusiveGateway': {
      icon: <GitBranch className="h-4 w-4" />,
      title: 'Exclusive Gateway (XOR)',
      description: 'Routes the flow based on conditions - only one path is taken',
      tips: [
        'Define clear conditions for each outgoing path',
        'Ensure conditions are mutually exclusive',
        'Always provide a default path for safety'
      ],
      color: 'text-amber-600'
    },
    'bpmn:ParallelGateway': {
      icon: <GitBranch className="h-4 w-4" />,
      title: 'Parallel Gateway (AND)',
      description: 'Splits or joins parallel flows - all paths are taken',
      tips: [
        'Use for tasks that can run simultaneously',
        'Joining gateway waits for all incoming flows',
        'Improves workflow efficiency through parallelization'
      ],
      color: 'text-emerald-600'
    },
    'bpmn:InclusiveGateway': {
      icon: <GitBranch className="h-4 w-4" />,
      title: 'Inclusive Gateway (OR)',
      description: 'Routes flow based on conditions - multiple paths can be taken',
      tips: [
        'One or more outgoing paths can be activated',
        'Useful for optional parallel processes',
        'Joining gateway waits for all active incoming flows'
      ],
      color: 'text-orange-600'
    },
    'bpmn:TimerIntermediateEvent': {
      icon: <Timer className="h-4 w-4" />,
      title: 'Timer Event',
      description: 'Pauses the workflow for a specified duration or until a date',
      tips: [
        'Set specific durations (PT1H for 1 hour)',
        'Use for delays, reminders, or timeouts',
        'Can be recurring or one-time events'
      ],
      color: 'text-violet-600'
    },
    'bpmn:SubProcess': {
      icon: <Settings className="h-4 w-4" />,
      title: 'Sub Process',
      description: 'Contains a complete workflow within another workflow',
      tips: [
        'Use for complex, reusable process segments',
        'Can be expanded inline or reference external processes',
        'Helps organize large workflows into manageable parts'
      ],
      color: 'text-slate-600'
    },
    'bpmn:CallActivity': {
      icon: <Settings className="h-4 w-4" />,
      title: 'Call Activity',
      description: 'Calls and executes another process or case',
      tips: [
        'Reuses existing workflows or processes',
        'Pass data between parent and child processes',
        'Promotes modularity and reusability'
      ],
      color: 'text-rose-600'
    }
  };

  return tooltips[elementType] || {
    icon: <HelpCircle className="h-4 w-4" />,
    title: 'BPMN Element',
    description: 'A workflow element that performs a specific function',
    tips: [
      'Configure properties to define behavior',
      'Connect to other elements to create workflow flow',
      'Test thoroughly before deployment'
    ],
    color: 'text-gray-600'
  };
};

export default function ElementTooltip({ elementType, elementName, properties, children }: ElementTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementInfo = getElementInfo(elementType);

  return (
    <TooltipProvider>
      <Tooltip open={isVisible} onOpenChange={setIsVisible}>
        <TooltipTrigger asChild>
          <div className="relative group">
            {children}
            {/* Help indicator - only show on hover */}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className={`p-1 bg-white rounded-full shadow-md border ${elementInfo.color}`}>
                <Info className="h-3 w-3" />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="max-w-sm p-4 bg-white border border-gray-200 rounded-xl shadow-lg"
          sideOffset={10}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg bg-gray-100 ${elementInfo.color}`}>
                {elementInfo.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{elementInfo.title}</h4>
                {elementName && (
                  <p className="text-xs text-gray-500">"{elementName}"</p>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {elementInfo.description}
            </p>

            {/* Tips */}
            <div>
              <h5 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                Best Practices
              </h5>
              <ul className="space-y-1">
                {elementInfo.tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Properties info if available */}
            {properties && Object.keys(properties).length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <h5 className="text-xs font-medium text-gray-900 mb-1">Current Properties</h5>
                <div className="text-xs text-gray-600 space-y-1">
                  {Object.entries(properties).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span className="truncate ml-2">{String(value)}</span>
                    </div>
                  ))}
                  {Object.keys(properties).length > 3 && (
                    <p className="text-gray-500">+{Object.keys(properties).length - 3} more...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}