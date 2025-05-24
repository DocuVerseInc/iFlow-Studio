import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";

interface PropertiesPanelProps {
  selectedElement: any;
}

interface FormField {
  id: string;
  name: string;
  type: string;
}

interface Listener {
  index: string;
  event: string;
  type: string;
  value: string;
  actions: string;
}

interface ExtensionProperty {
  index: string;
  name: string;
  value: string;
  actions: string;
}

const assigneeOptions = [
  { value: "unassigned", label: "Select assignee..." },
  { value: "john.doe", label: "John Doe" },
  { value: "jane.smith", label: "Jane Smith" },
  { value: "mike.johnson", label: "Mike Johnson" },
  { value: "sarah.wilson", label: "Sarah Wilson" },
  { value: "david.brown", label: "David Brown" },
];

const loopOptions = [
  { value: "Null", label: "Null" },
  { value: "Sequential", label: "Sequential" },
  { value: "Parallel", label: "Parallel" },
];

const fieldTypes = [
  { value: "string", label: "String" },
  { value: "long", label: "Long" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "enum", label: "Enum" },
];

const eventTypes = [
  { value: "start", label: "Start" },
  { value: "end", label: "End" },
  { value: "take", label: "Take" },
  { value: "create", label: "Create" },
  { value: "assignment", label: "Assignment" },
  { value: "complete", label: "Complete" },
];

const listenerTypes = [
  { value: "class", label: "Java Class" },
  { value: "expression", label: "Expression" },
  { value: "delegateExpression", label: "Delegate Expression" },
];

export default function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  const [elementId, setElementId] = useState("");
  const [elementName, setElementName] = useState("");
  const [loopCharacteristics, setLoopCharacteristics] = useState("Null");
  const [assignee, setAssignee] = useState("unassigned");
  const [candidateGroups, setCandidateGroups] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [extensionProperties, setExtensionProperties] = useState<ExtensionProperty[]>([]);
  
  // Collapsible section states
  const [informationOpen, setInformationOpen] = useState(true);
  const [assignmentOpen, setAssignmentOpen] = useState(true);
  const [listenersOpen, setListenersOpen] = useState(false);
  const [formInfoOpen, setFormInfoOpen] = useState(false);
  const [extensionOpen, setExtensionOpen] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      const businessObject = selectedElement.businessObject;
      setElementId(selectedElement.id || "");
      setElementName(businessObject.name || "");
      setAssignee(businessObject.assignee || "unassigned");
      setCandidateGroups(businessObject.candidateGroups || "");
      setFormKey(businessObject.formKey || "");
      setLoopCharacteristics(businessObject.loopCharacteristics ? "Sequential" : "Null");
      
      // Parse stored data
      try {
        setFormFields(businessObject.formFields ? JSON.parse(businessObject.formFields) : []);
        setListeners(businessObject.listeners ? JSON.parse(businessObject.listeners) : []);
        setExtensionProperties(businessObject.extensionProperties ? JSON.parse(businessObject.extensionProperties) : []);
      } catch {
        setFormFields([]);
        setListeners([]);
        setExtensionProperties([]);
      }
    } else {
      setElementId("");
      setElementName("");
      setAssignee("unassigned");
      setCandidateGroups("");
      setFormKey("");
      setLoopCharacteristics("Null");
      setFormFields([]);
      setListeners([]);
      setExtensionProperties([]);
    }
  }, [selectedElement]);

  const updateBusinessObject = (property: string, value: any) => {
    if (selectedElement?.businessObject) {
      selectedElement.businessObject[property] = value;
    }
  };

  const addFormField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: "",
      type: "string"
    };
    const updatedFields = [...formFields, newField];
    setFormFields(updatedFields);
    updateBusinessObject('formFields', JSON.stringify(updatedFields));
  };

  const removeFormField = (index: number) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    updateBusinessObject('formFields', JSON.stringify(updatedFields));
  };

  const updateFormField = (index: number, field: keyof FormField, value: string) => {
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setFormFields(updatedFields);
    updateBusinessObject('formFields', JSON.stringify(updatedFields));
  };

  const addListener = () => {
    const newListener: Listener = {
      index: `${listeners.length}`,
      event: "start",
      type: "class",
      value: "",
      actions: ""
    };
    const updatedListeners = [...listeners, newListener];
    setListeners(updatedListeners);
    updateBusinessObject('listeners', JSON.stringify(updatedListeners));
  };

  const removeListener = (index: number) => {
    const updatedListeners = listeners.filter((_, i) => i !== index);
    setListeners(updatedListeners);
    updateBusinessObject('listeners', JSON.stringify(updatedListeners));
  };

  const updateListener = (index: number, field: keyof Listener, value: string) => {
    const updatedListeners = [...listeners];
    updatedListeners[index] = { ...updatedListeners[index], [field]: value };
    setListeners(updatedListeners);
    updateBusinessObject('listeners', JSON.stringify(updatedListeners));
  };

  const addExtensionProperty = () => {
    const newProperty: ExtensionProperty = {
      index: `${extensionProperties.length}`,
      name: "",
      value: "",
      actions: ""
    };
    const updatedProperties = [...extensionProperties, newProperty];
    setExtensionProperties(updatedProperties);
    updateBusinessObject('extensionProperties', JSON.stringify(updatedProperties));
  };

  const removeExtensionProperty = (index: number) => {
    const updatedProperties = extensionProperties.filter((_, i) => i !== index);
    setExtensionProperties(updatedProperties);
    updateBusinessObject('extensionProperties', JSON.stringify(updatedProperties));
  };

  const updateExtensionProperty = (index: number, field: keyof ExtensionProperty, value: string) => {
    const updatedProperties = [...extensionProperties];
    updatedProperties[index] = { ...updatedProperties[index], [field]: value };
    setExtensionProperties(updatedProperties);
    updateBusinessObject('extensionProperties', JSON.stringify(updatedProperties));
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
    <div className="h-full bg-white">
      {/* Header */}
      <div className="bg-blue-500 text-white p-3 text-center font-medium">
        {elementType.replace("bpmn:", "")}
      </div>

      <div className="overflow-y-auto h-full pb-16">
        {/* Information Section */}
        <Collapsible open={informationOpen} onOpenChange={setInformationOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 border-b hover:bg-gray-100">
            <span className="font-medium text-sm">Information</span>
            {informationOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-3 space-y-3">
            <div>
              <Label className="text-xs text-gray-600">Element ID</Label>
              <Input
                value={elementId}
                onChange={(e) => {
                  setElementId(e.target.value);
                  // Note: ID changes require special handling in BPMN.js
                }}
                className="mt-1 text-sm"
                readOnly
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Element Name</Label>
              <Input
                value={elementName}
                onChange={(e) => {
                  setElementName(e.target.value);
                  updateBusinessObject('name', e.target.value);
                }}
                className="mt-1 text-sm"
                placeholder="This is a test task"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Loop Characteristics</Label>
              <Select value={loopCharacteristics} onValueChange={(value) => {
                setLoopCharacteristics(value);
                updateBusinessObject('loopCharacteristics', value !== "Null");
              }}>
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {loopOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* User Assignment Section */}
        {isUserTask && (
          <Collapsible open={assignmentOpen} onOpenChange={setAssignmentOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 border-b hover:bg-gray-100">
              <span className="font-medium text-sm">User Assignment</span>
              {assignmentOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Assignee</Label>
                <Select value={assignee} onValueChange={(value) => {
                  setAssignee(value);
                  updateBusinessObject('assignee', value === "unassigned" ? "" : value);
                }}>
                  <SelectTrigger className="mt-1 text-sm">
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
                <Label className="text-xs text-gray-600">Candidate Groups</Label>
                <Input
                  value={candidateGroups}
                  onChange={(e) => {
                    setCandidateGroups(e.target.value);
                    updateBusinessObject('candidateGroups', e.target.value);
                  }}
                  className="mt-1 text-sm"
                  placeholder="manager,finance"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Listeners Section */}
        <Collapsible open={listenersOpen} onOpenChange={setListenersOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 border-b hover:bg-gray-100">
            <span className="font-medium text-sm">Listeners</span>
            {listenersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-3">
            {listeners.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 mb-3">No Data</p>
                <Button
                  onClick={addListener}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                >
                  + Add
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 text-xs text-gray-600 font-medium border-b pb-2">
                  <span>Index</span>
                  <span>Event</span>
                  <span>Type</span>
                  <span>Value</span>
                  <span>Actions</span>
                </div>
                {listeners.map((listener, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 text-xs">
                    <Input
                      value={listener.index}
                      onChange={(e) => updateListener(index, 'index', e.target.value)}
                      className="text-xs"
                    />
                    <Select value={listener.event} onValueChange={(value) => updateListener(index, 'event', value)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={listener.type} onValueChange={(value) => updateListener(index, 'type', value)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {listenerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={listener.value}
                      onChange={(e) => updateListener(index, 'value', e.target.value)}
                      className="text-xs"
                    />
                    <Button
                      onClick={() => removeListener(index)}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={addListener}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                >
                  + Add
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Form Information Section */}
        {isUserTask && (
          <Collapsible open={formInfoOpen} onOpenChange={setFormInfoOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 border-b hover:bg-gray-100">
              <span className="font-medium text-sm">Form Information</span>
              {formInfoOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Form Key</Label>
                <Input
                  value={formKey}
                  onChange={(e) => {
                    setFormKey(e.target.value);
                    updateBusinessObject('formKey', e.target.value);
                  }}
                  className="mt-1 text-sm"
                  placeholder="next-Done"
                />
              </div>
              
              {formFields.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 mb-3">No Data</p>
                  <Button
                    onClick={addFormField}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                  >
                    + Add
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 font-medium border-b pb-2">
                    <span>ID</span>
                    <span>Type</span>
                    <span>Name</span>
                    <span>Actions</span>
                  </div>
                  {formFields.map((field, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 text-xs">
                      <Input
                        value={field.id}
                        onChange={(e) => updateFormField(index, 'id', e.target.value)}
                        className="text-xs"
                      />
                      <Select value={field.type} onValueChange={(value) => updateFormField(index, 'type', value)}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={field.name}
                        onChange={(e) => updateFormField(index, 'name', e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        onClick={() => removeFormField(index)}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addFormField}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                  >
                    + Add
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Extension Group Properties Section */}
        <Collapsible open={extensionOpen} onOpenChange={setExtensionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 border-b hover:bg-gray-100">
            <span className="font-medium text-sm">Extension Group Properties</span>
            {extensionOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-3">
            {extensionProperties.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 mb-3">No Data</p>
                <Button
                  onClick={addExtensionProperty}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                >
                  + Add
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 font-medium border-b pb-2">
                  <span>Index</span>
                  <span>Name</span>
                  <span>Value</span>
                  <span>Actions</span>
                </div>
                {extensionProperties.map((property, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-xs">
                    <Input
                      value={property.index}
                      onChange={(e) => updateExtensionProperty(index, 'index', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      value={property.name}
                      onChange={(e) => updateExtensionProperty(index, 'name', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      value={property.value}
                      onChange={(e) => updateExtensionProperty(index, 'value', e.target.value)}
                      className="text-xs"
                    />
                    <Button
                      onClick={() => removeExtensionProperty(index)}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={addExtensionProperty}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                >
                  + Add
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}