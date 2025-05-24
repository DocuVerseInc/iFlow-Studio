import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface PropertiesPanelProps {
  selectedElement: any;
}

const assigneeOptions = [
  { value: "unassigned", label: "Select assignee..." },
  { value: "john.doe", label: "John Doe" },
  { value: "jane.smith", label: "Jane Smith" },
  { value: "mike.johnson", label: "Mike Johnson" },
  { value: "sarah.wilson", label: "Sarah Wilson" },
  { value: "david.brown", label: "David Brown" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  const [elementName, setElementName] = useState("");
  const [elementDescription, setElementDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [isAsync, setIsAsync] = useState(false);
  const [formFields, setFormFields] = useState<Array<{id: string, name: string, type: string, required: boolean}>>([]);
  const [candidateGroups, setCandidateGroups] = useState("");
  const [candidateUsers, setCandidateUsers] = useState("");

  useEffect(() => {
    if (selectedElement) {
      const businessObject = selectedElement.businessObject;
      setElementName(businessObject.name || "");
      setElementDescription(businessObject.documentation?.[0]?.text || "");
      setAssignee(businessObject.assignee || "unassigned");
      setPriority(businessObject.priority || "medium");
      setDueDate(businessObject.dueDate || "");
      setIsAsync(businessObject.asyncBefore || false);
      setCandidateGroups(businessObject.candidateGroups || "");
      setCandidateUsers(businessObject.candidateUsers || "");
      
      // Parse form fields if they exist
      if (businessObject.formFields) {
        try {
          setFormFields(JSON.parse(businessObject.formFields));
        } catch {
          setFormFields([]);
        }
      } else {
        setFormFields([]);
      }
    } else {
      setElementName("");
      setElementDescription("");
      setAssignee("unassigned");
      setPriority("medium");
      setDueDate("");
      setIsAsync(false);
      setFormFields([]);
      setCandidateGroups("");
      setCandidateUsers("");
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
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.assignee = value;
    }
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.priority = value;
    }
  };

  const handleDueDateChange = (value: string) => {
    setDueDate(value);
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.dueDate = value;
    }
  };

  const handleAsyncChange = (checked: boolean) => {
    setIsAsync(checked);
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.asyncBefore = checked;
    }
  };

  const addFormField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: "",
      type: "string",
      required: false
    };
    const updatedFields = [...formFields, newField];
    setFormFields(updatedFields);
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.formFields = JSON.stringify(updatedFields);
    }
  };

  const removeFormField = (index: number) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.formFields = JSON.stringify(updatedFields);
    }
  };

  const updateFormField = (index: number, field: string, value: any) => {
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setFormFields(updatedFields);
    if (selectedElement?.businessObject) {
      selectedElement.businessObject.formFields = JSON.stringify(updatedFields);
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
  const isServiceTask = elementType === "bpmn:ServiceTask";
  const isTask = isUserTask || isServiceTask || elementType === "bpmn:Task";

  return (
    <div className="space-y-4 max-h-full overflow-y-auto">
      <div className="pb-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900">{elementType.replace("bpmn:", "")}</h4>
        <p className="text-sm text-gray-500">Element ID: {selectedElement.id}</p>
      </div>

      {/* Basic Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Basic Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Task-specific Properties */}
      {isTask && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Task Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="async"
                checked={isAsync}
                onCheckedChange={handleAsyncChange}
              />
              <Label htmlFor="async">Asynchronous execution</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Task specific Properties */}
      {isUserTask && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div>
              <Label htmlFor="candidate-groups">Candidate Groups</Label>
              <Input
                id="candidate-groups"
                value={candidateGroups}
                onChange={(e) => setCandidateGroups(e.target.value)}
                placeholder="manager,finance"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated group names</p>
            </div>

            <div>
              <Label htmlFor="candidate-users">Candidate Users</Label>
              <Input
                id="candidate-users"
                value={candidateUsers}
                onChange={(e) => setCandidateUsers(e.target.value)}
                placeholder="john.doe,jane.smith"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated usernames</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields for User Tasks */}
      {isUserTask && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Form Fields
              <Button size="sm" variant="outline" onClick={addFormField}>
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formFields.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No form fields defined. Click "Add Field" to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {formFields.map((field, index) => (
                  <div key={field.id} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{field.type}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFormField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateFormField(index, 'name', e.target.value)}
                      />
                      
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateFormField(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">Text</SelectItem>
                          <SelectItem value="long">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="enum">Dropdown</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateFormField(index, 'required', checked)}
                        />
                        <Label className="text-sm">Required field</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Task Properties */}
      {isServiceTask && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Service Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="implementation">Implementation</Label>
              <Select defaultValue="java-class">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java-class">Java Class</SelectItem>
                  <SelectItem value="expression">Expression</SelectItem>
                  <SelectItem value="delegate-expression">Delegate Expression</SelectItem>
                  <SelectItem value="external">External Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="implementation-value">Implementation Value</Label>
              <Input
                id="implementation-value"
                placeholder="com.example.MyDelegate"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Element Type Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Element Information</CardTitle>
        </CardHeader>
        <CardContent>
          {elementType === "bpmn:StartEvent" && (
            <p className="text-sm text-gray-600">
              Start events trigger the beginning of workflow processes. They can be triggered by timers, messages, or manual starts.
            </p>
          )}

          {elementType === "bpmn:EndEvent" && (
            <p className="text-sm text-gray-600">
              End events mark the completion of workflow processes. They can produce results or send messages.
            </p>
          )}

          {elementType === "bpmn:ExclusiveGateway" && (
            <p className="text-sm text-gray-600">
              Exclusive gateways route process flow based on conditions. Only one outgoing path is taken.
            </p>
          )}

          {elementType === "bpmn:ParallelGateway" && (
            <p className="text-sm text-gray-600">
              Parallel gateways split process flow into multiple concurrent paths or merge them back together.
            </p>
          )}

          {isUserTask && (
            <p className="text-sm text-gray-600">
              User tasks require human interaction. Assign them to users or groups and define forms for data collection.
            </p>
          )}

          {isServiceTask && (
            <p className="text-sm text-gray-600">
              Service tasks execute automated operations like API calls, calculations, or system integrations.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
