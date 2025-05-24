// Comprehensive test cases for BPMN workflow functionality
// Run this script to test saving, versioning, and deployment features

const baseUrl = 'http://localhost:5000';

// Test BPMN XML samples
const testBpmnXml1 = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Order Received">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="UserTask_1" name="Validate Order" assignee="validator">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="UserTask_2" name="Process Payment" assignee="finance">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="Order Completed">
      <bpmn:incoming>Flow_3</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="UserTask_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="UserTask_2" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`;

const testBpmnXml2 = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Order Received">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="UserTask_1" name="Validate Order" assignee="validator">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_1" name="Order Valid?">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="UserTask_2" name="Process Payment" assignee="finance">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="UserTask_3" name="Reject Order" assignee="support">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="Order Completed">
      <bpmn:incoming>Flow_5</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="EndEvent_2" name="Order Rejected">
      <bpmn:incoming>Flow_6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gateway_1" targetRef="UserTask_2" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Gateway_1" targetRef="UserTask_3" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="UserTask_2" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="UserTask_3" targetRef="EndEvent_2" />
  </bpmn:process>
</bpmn:definitions>`;

async function runTests() {
  console.log('🧪 Starting comprehensive workflow functionality tests...\n');

  try {
    // Test 1: Create a new workflow
    console.log('📝 Test 1: Creating new workflow...');
    const newWorkflow = {
      name: "Order Processing Workflow",
      description: "Complete order processing with validation and payment",
      bpmnXml: testBpmnXml1,
      version: "1.0.0"
    };

    const createResponse = await fetch(`${baseUrl}/api/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkflow)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create workflow: ${createResponse.status}`);
    }

    const createdWorkflow = await createResponse.json();
    console.log('✅ Workflow created successfully:', createdWorkflow.id);
    console.log('   Name:', createdWorkflow.name);
    console.log('   Version:', createdWorkflow.version);

    // Test 2: Create a workflow version
    console.log('\n📋 Test 2: Creating workflow version...');
    const versionData = {
      version: "1.1.0",
      bpmnXml: testBpmnXml2,
      changeLog: "Added gateway for order validation logic",
      status: "draft",
      createdBy: "test-user"
    };

    const versionResponse = await fetch(`${baseUrl}/api/workflows/${createdWorkflow.id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionData)
    });

    if (!versionResponse.ok) {
      throw new Error(`Failed to create version: ${versionResponse.status}`);
    }

    const createdVersion = await versionResponse.json();
    console.log('✅ Version created successfully:', createdVersion.id);
    console.log('   Version:', createdVersion.version);
    console.log('   Status:', createdVersion.status);

    // Test 3: List workflow versions
    console.log('\n📜 Test 3: Listing workflow versions...');
    const versionsResponse = await fetch(`${baseUrl}/api/workflows/${createdWorkflow.id}/versions`);
    
    if (!versionsResponse.ok) {
      throw new Error(`Failed to get versions: ${versionsResponse.status}`);
    }

    const versions = await versionsResponse.json();
    console.log('✅ Retrieved versions:', versions.length);
    versions.forEach(v => {
      console.log(`   - Version ${v.version}: ${v.status} (${v.changeLog || 'No changelog'})`);
    });

    // Test 4: Create deployment pipeline
    console.log('\n🚀 Test 4: Creating deployment pipeline...');
    const deploymentData = {
      workflowId: createdWorkflow.id,
      version: "1.0.0",
      environment: "development",
      deployedBy: "test-user"
    };

    const deployResponse = await fetch(`${baseUrl}/api/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deploymentData)
    });

    if (!deployResponse.ok) {
      throw new Error(`Failed to create deployment: ${deployResponse.status}`);
    }

    const deployment = await deployResponse.json();
    console.log('✅ Deployment created successfully:', deployment.id);
    console.log('   Environment:', deployment.environment);
    console.log('   Status:', deployment.status);

    // Test 5: Update deployment status
    console.log('\n🔄 Test 5: Updating deployment status...');
    const updateResponse = await fetch(`${baseUrl}/api/deployments/${deployment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'success',
        completedAt: new Date().toISOString(),
        deploymentLogs: 'Deployment completed successfully'
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update deployment: ${updateResponse.status}`);
    }

    const updatedDeployment = await updateResponse.json();
    console.log('✅ Deployment updated successfully');
    console.log('   Status:', updatedDeployment.status);
    console.log('   Completed:', updatedDeployment.completedAt);

    // Test 6: Create workflow instance
    console.log('\n⚙️ Test 6: Creating workflow instance...');
    const instanceData = {
      workflowId: createdWorkflow.id,
      status: 'running',
      variables: { orderId: 'ORD-001', customerId: 'CUST-123' }
    };

    const instanceResponse = await fetch(`${baseUrl}/api/workflow-instances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(instanceData)
    });

    if (!instanceResponse.ok) {
      throw new Error(`Failed to create instance: ${instanceResponse.status}`);
    }

    const instance = await instanceResponse.json();
    console.log('✅ Workflow instance created successfully:', instance.id);
    console.log('   Status:', instance.status);
    console.log('   Variables:', JSON.stringify(instance.variables));

    // Test 7: Create task for the instance
    console.log('\n📋 Test 7: Creating task...');
    const taskData = {
      workflowInstanceId: instance.id,
      taskDefinitionKey: 'UserTask_1',
      name: 'Validate Order',
      description: 'Validate the incoming order details',
      assignee: 'validator',
      status: 'pending',
      priority: 'high'
    };

    const taskResponse = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });

    if (!taskResponse.ok) {
      throw new Error(`Failed to create task: ${taskResponse.status}`);
    }

    const task = await taskResponse.json();
    console.log('✅ Task created successfully:', task.id);
    console.log('   Name:', task.name);
    console.log('   Assignee:', task.assignee);
    console.log('   Status:', task.status);

    // Test 8: Verify all data is persisted
    console.log('\n🔍 Test 8: Verifying data persistence...');
    
    const workflowsResponse = await fetch(`${baseUrl}/api/workflows`);
    const allWorkflows = await workflowsResponse.json();
    console.log('✅ Total workflows in database:', allWorkflows.length);
    
    const deploymentsResponse = await fetch(`${baseUrl}/api/deployments`);
    const allDeployments = await deploymentsResponse.json();
    console.log('✅ Total deployments in database:', allDeployments.length);

    const tasksResponse = await fetch(`${baseUrl}/api/tasks`);
    const allTasks = await tasksResponse.json();
    console.log('✅ Total tasks in database:', allTasks.length);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Created workflow: ${createdWorkflow.name}`);
    console.log(`   - Created version: ${createdVersion.version}`);
    console.log(`   - Created deployment: ${deployment.environment}`);
    console.log(`   - Created instance: ${instance.id}`);
    console.log(`   - Created task: ${task.name}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the tests
runTests();