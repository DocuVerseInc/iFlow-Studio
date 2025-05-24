import { useState, useEffect, useRef } from "react";
import { HelpCircle, X, Lightbulb, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HelpOverlayProps {
  selectedElement: any;
  isVisible: boolean;
  onClose: () => void;
}

const getElementHelp = (element: any) => {
  if (!element) {
    return {
      title: "Workflow Canvas",
      description: "Design your business process by adding and connecting BPMN elements",
      instructions: [
        "Drag elements from the palette to create your workflow",
        "Connect elements by clicking and dragging between them",
        "Select elements to configure their properties",
        "Use the properties panel to set names, conditions, and assignments"
      ],
      tips: [
        "Start with a Start Event and end with an End Event",
        "Use descriptive names for all elements",
        "Test your workflow before deploying to production"
      ]
    };
  }

  const elementType = element.type || element.businessObject?.$type;
  
  const helpContent: Record<string, any> = {
    'bpmn:StartEvent': {
      title: "Start Event",
      description: "Every workflow begins with a Start Event. This defines when and how your process starts.",
      instructions: [
        "Configure the trigger type (Manual, Timer, Message, etc.)",
        "Set any required input parameters",
        "Connect to the first task or gateway in your process",
        "Name it clearly to indicate what starts this workflow"
      ],
      tips: [
        "A workflow can have multiple start events for different triggers",
        "Timer start events can run workflows on schedules",
        "Message start events wait for external signals"
      ]
    },
    'bpmn:EndEvent': {
      title: "End Event",
      description: "End Events mark the completion of a workflow path and can trigger final actions.",
      instructions: [
        "Choose the appropriate end event type (None, Message, Terminate)",
        "Configure any final notifications or cleanup actions",
        "Ensure all workflow paths lead to an end event",
        "Use descriptive names to indicate the outcome"
      ],
      tips: [
        "Multiple end events can represent different outcomes",
        "Terminate end events stop all active workflow instances",
        "Message end events can notify external systems"
      ]
    },
    'bpmn:Task': {
      title: "Task",
      description: "Tasks represent work that needs to be completed as part of your process.",
      instructions: [
        "Set a clear, action-oriented name",
        "Choose the appropriate task type (User, Service, Send, etc.)",
        "Configure assignee or assignment rules",
        "Set due dates and priority levels"
      ],
      tips: [
        "Break down complex work into smaller, manageable tasks",
        "Provide clear instructions in the documentation",
        "Consider who will perform this task when designing"
      ]
    },
    'bpmn:UserTask': {
      title: "User Task",
      description: "User Tasks require human interaction and appear in users' task lists.",
      instructions: [
        "Assign to specific users, groups, or roles",
        "Create forms for data collection if needed",
        "Set realistic due dates and priorities",
        "Provide clear instructions and context"
      ],
      tips: [
        "Use role-based assignments for flexibility",
        "Include all necessary information for task completion",
        "Consider approval workflows for important decisions"
      ]
    },
    'bpmn:ServiceTask': {
      title: "Service Task",
      description: "Service Tasks are automated and execute system functions or API calls.",
      instructions: [
        "Configure the service or API endpoint",
        "Set up authentication and connection details",
        "Define input and output parameters",
        "Configure error handling and retry logic"
      ],
      tips: [
        "Test API connections before deploying",
        "Handle potential failures gracefully",
        "Use timeouts to prevent hanging workflows"
      ]
    },
    'bpmn:ExclusiveGateway': {
      title: "Exclusive Gateway (XOR)",
      description: "Routes the workflow down exactly one path based on conditions.",
      instructions: [
        "Define clear, mutually exclusive conditions",
        "Set up sequence flow conditions on outgoing paths",
        "Always provide a default path",
        "Test all possible routing scenarios"
      ],
      tips: [
        "Use simple, boolean conditions when possible",
        "Document the decision logic clearly",
        "Ensure conditions cover all possible cases"
      ]
    },
    'bpmn:ParallelGateway': {
      title: "Parallel Gateway (AND)",
      description: "Splits workflow into parallel paths or waits for multiple paths to complete.",
      instructions: [
        "Use to execute tasks simultaneously",
        "Ensure joining gateway waits for all paths",
        "Consider resource allocation for parallel tasks",
        "Plan for different completion times"
      ],
      tips: [
        "Parallel execution can significantly speed up processes",
        "Monitor resource usage with parallel tasks",
        "Handle errors in parallel branches appropriately"
      ]
    }
  };

  return helpContent[elementType] || {
    title: element.businessObject?.name || "BPMN Element",
    description: "Configure this element to define its behavior in your workflow.",
    instructions: [
      "Select the element to view its properties",
      "Use the properties panel to configure settings",
      "Connect to other elements to build your workflow",
      "Test the configuration before deploying"
    ],
    tips: [
      "Use meaningful names for all elements",
      "Document complex logic for future reference",
      "Test edge cases and error scenarios"
    ]
  };
};

export default function HelpOverlay({ selectedElement, isVisible, onClose }: HelpOverlayProps) {
  const [helpContent, setHelpContent] = useState<any>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      setHelpContent(getElementHelp(selectedElement));
    }
  }, [selectedElement, isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !helpContent) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card ref={overlayRef} className="w-full max-w-2xl max-h-[80vh] overflow-auto card-modern">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{helpContent.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">
              {helpContent.description}
            </p>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Configuration Steps</h3>
            </div>
            <ol className="space-y-2">
              {helpContent.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Pro Tips</h3>
            </div>
            <ul className="space-y-2">
              {helpContent.tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <Zap className="h-3 w-3 text-amber-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Element Properties Preview */}
          {selectedElement && selectedElement.businessObject && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Element</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedElement.type?.replace('bpmn:', '') || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedElement.businessObject.name || 'Unnamed'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">ID:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">
                    {selectedElement.businessObject.id}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Connections:</span>
                  <span className="ml-2 text-gray-900">
                    {(selectedElement.incoming?.length || 0) + (selectedElement.outgoing?.length || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="btn-primary-modern">
              Configure Element
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}