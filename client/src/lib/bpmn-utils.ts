// Utility functions for BPMN diagram creation and manipulation

export const createBpmnDiagram = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="UserTask_1" name="Review Application">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="158" y="145" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="UserTask_1_di" bpmnElement="UserTask_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="392" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="400" y="145" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="392" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
};

export const parseBpmnXml = (xml: string) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    
    // Extract workflow name from process element
    const processElement = xmlDoc.querySelector('bpmn\\:process, process');
    const workflowName = processElement?.getAttribute('name') || 'Untitled Workflow';
    
    // Extract user tasks
    const userTasks = Array.from(xmlDoc.querySelectorAll('bpmn\\:userTask, userTask')).map(task => ({
      id: task.getAttribute('id'),
      name: task.getAttribute('name'),
      assignee: task.getAttribute('assignee'),
    }));
    
    return {
      workflowName,
      userTasks,
    };
  } catch (error) {
    console.error('Error parsing BPMN XML:', error);
    return null;
  }
};

export const validateBpmnXml = (xml: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    
    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      errors.push('Invalid XML format');
      return { isValid: false, errors };
    }
    
    // Check for required BPMN elements
    const processElement = xmlDoc.querySelector('bpmn\\:process, process');
    if (!processElement) {
      errors.push('Missing process element');
    }
    
    const startEvents = xmlDoc.querySelectorAll('bpmn\\:startEvent, startEvent');
    if (startEvents.length === 0) {
      errors.push('Process must have at least one start event');
    }
    
    const endEvents = xmlDoc.querySelectorAll('bpmn\\:endEvent, endEvent');
    if (endEvents.length === 0) {
      errors.push('Process must have at least one end event');
    }
    
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    errors.push('Failed to parse XML');
    return { isValid: false, errors };
  }
};
