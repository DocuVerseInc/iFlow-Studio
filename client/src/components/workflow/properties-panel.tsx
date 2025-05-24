import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertiesPanelProps {
  selectedElement: any;
}

const assigneeOptions = [
  { value: "", label: "Select assignee..." },
  { value: "john.doe", label: "John Doe" },
  { value: "jane.smith", label: "Jane Smith" },
  { value: "mike.johnson", label: "Mike Johnson" },
];

export default function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  const [elementName, setElementName] = useState("");
  const [elementDescription, setElementDescription] = useState("");
  const [assignee, setAssignee] = useState("");

  useEffect(() => {
    if (selectedElement) {
      const businessObject = selectedElement.businessObject;
      setElementName(businessObject.name || "");
      setElementDescription(businessObject.documentation?.[0]?.text || "");
      setAssignee(businessObject.assignee || "");
    } else {
      setElementName("");
      setElementDescription("");
      setAssignee("");
    }
  }, [selectedElement]);

  const handleNameChange = (value: string) => {
    setElementName(value);
    // In a real implementation, this would update the BPMN element
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.name = value;
    }
  };

  const handleDescriptionChange = (value: string) => {
    setElementDescription(value);
    // In a real implementation, this would update the BPMN element documentation
  };

  const handleAssigneeChange = (value: string) => {
    setAssignee(value);
    // In a real implementation, this would update the BPMN element assignee
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.assignee = value;
    }
  };

  if (!selectedElement) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">Select an element to view its properties</p>
      </div>
    );
  }

  const elementType = selectedElement.type || "Unknown";
  const isUserTask = elementType === "bpmn:UserTask";

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900">{elementType.replace("bpmn:", "")}</h4>
        <p className="text-sm text-gray-500">Element ID: {selectedElement.id}</p>
      </div>

      <div>
        <Label htmlFor="element-name">Element Name</Label>
        <Input
          id="element-name"
          value={elementName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter element name"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="element-description">Description</Label>
        <Textarea
          id="element-description"
          value={elementDescription}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Enter description"
          rows={3}
          className="mt-1"
        />
      </div>

      {isUserTask && (
        <div>
          <Label htmlFor="assignee">Assignee</Label>
          <Select value={assignee} onValueChange={handleAssigneeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assigneeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Additional properties based on element type */}
      {elementType === "bpmn:StartEvent" && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            This is a start event. It triggers the beginning of the workflow process.
          </p>
        </div>
      )}

      {elementType === "bpmn:EndEvent" && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            This is an end event. It marks the completion of the workflow process.
          </p>
        </div>
      )}

      {elementType === "bpmn:ExclusiveGateway" && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            This is an exclusive gateway. It routes the process flow based on conditions.
          </p>
        </div>
      )}
    </div>
  );
}
