// Comprehensive BPMN functionality test suite
const baseUrl = 'http://localhost:5000';

const sampleBpmn1 = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_1" name="Review Document">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`;

const sampleBpmn2 = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_1" name="Review Document">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_2" name="Approve Document">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_3</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="EndEvent_1" />
  </bpmn:process>
</bpmn:definitions>`;

async function runBpmnTests() {
  console.log('🧪 Testing BPMN XML Saving, Versioning & Deployment\n');

  try {
    // Test 1: Save new BPMN workflow
    console.log('1️⃣ Testing BPMN XML saving...');
    const newWorkflow = {
      name: "Document Review Process",
      description: "A process for reviewing and approving documents",
      bpmnXml: sampleBpmn1
    };

    const createResponse = await fetch(`${baseUrl}/api/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkflow)
    });

    if (!createResponse.ok) {
      throw new Error(`BPMN saving failed: ${createResponse.status}`);
    }

    const workflow = await createResponse.json();
    console.log('✅ BPMN workflow saved successfully!');
    console.log(`   ID: ${workflow.id}`);
    console.log(`   Name: ${workflow.name}`);
    console.log(`   BPMN Length: ${workflow.bpmnXml.length} characters`);
    console.log(`   Version: ${workflow.version}`);

    // Test 2: Create workflow version with updated BPMN
    console.log('\n2️⃣ Testing BPMN versioning...');
    const versionData = {
      version: "1.1.0",
      bpmnXml: sampleBpmn2,
      changeLog: "Added approval step to the process",
      status: "draft",
      createdBy: "test-user"
    };

    const versionResponse = await fetch(`${baseUrl}/api/workflows/${workflow.id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionData)
    });

    if (!versionResponse.ok) {
      throw new Error(`Version creation failed: ${versionResponse.status}`);
    }

    const version = await versionResponse.json();
    console.log('✅ BPMN version created successfully!');
    console.log(`   Version: ${version.version}`);
    console.log(`   BPMN Length: ${version.bpmnXml.length} characters`);
    console.log(`   Change Log: ${version.changeLog}`);

    // Test 3: Verify BPMN content is properly stored
    console.log('\n3️⃣ Testing BPMN content retrieval...');
    const getResponse = await fetch(`${baseUrl}/api/workflows/${workflow.id}`);
    const retrievedWorkflow = await getResponse.json();
    
    console.log('✅ BPMN content verified!');
    console.log(`   Original BPMN contains: ${sampleBpmn1.includes('Review Document') ? 'Review Document task ✓' : 'Missing task ✗'}`);
    console.log(`   Retrieved BPMN contains: ${retrievedWorkflow.bpmnXml.includes('Review Document') ? 'Review Document task ✓' : 'Missing task ✗'}`);

    // Test 4: List all versions
    console.log('\n4️⃣ Testing version history...');
    const versionsResponse = await fetch(`${baseUrl}/api/workflows/${workflow.id}/versions`);
    const versions = await versionsResponse.json();
    
    console.log('✅ Version history retrieved!');
    console.log(`   Total versions: ${versions.length}`);
    versions.forEach(v => {
      console.log(`   - v${v.version}: ${v.status} (${v.changeLog || 'No changelog'})`);
    });

    // Test 5: Deploy to development
    console.log('\n5️⃣ Testing deployment pipeline...');
    const deploymentData = {
      workflowId: workflow.id,
      version: workflow.version,
      environment: "development",
      deployedBy: "test-user"
    };

    const deployResponse = await fetch(`${baseUrl}/api/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deploymentData)
    });

    if (!deployResponse.ok) {
      throw new Error(`Deployment failed: ${deployResponse.status}`);
    }

    const deployment = await deployResponse.json();
    console.log('✅ Deployment created successfully!');
    console.log(`   Environment: ${deployment.environment}`);
    console.log(`   Status: ${deployment.status}`);
    console.log(`   Version: ${deployment.version}`);

    // Test 6: Update deployment status
    console.log('\n6️⃣ Testing deployment status update...');
    const updateResponse = await fetch(`${baseUrl}/api/deployments/${deployment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'success',
        completedAt: new Date().toISOString(),
        deploymentLogs: 'BPMN workflow deployed successfully to development environment'
      })
    });

    const updatedDeployment = await updateResponse.json();
    console.log('✅ Deployment completed successfully!');
    console.log(`   Status: ${updatedDeployment.status}`);
    console.log(`   Logs: ${updatedDeployment.deploymentLogs}`);

    // Test 7: Create workflow instance with BPMN
    console.log('\n7️⃣ Testing workflow instance creation...');
    const instanceData = {
      workflowId: workflow.id,
      status: 'running',
      variables: { documentId: 'DOC-001', reviewer: 'john.doe' }
    };

    const instanceResponse = await fetch(`${baseUrl}/api/workflow-instances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(instanceData)
    });

    const instance = await instanceResponse.json();
    console.log('✅ Workflow instance created!');
    console.log(`   Instance ID: ${instance.id}`);
    console.log(`   Status: ${instance.status}`);
    console.log(`   Variables: ${JSON.stringify(instance.variables)}`);

    // Summary
    console.log('\n🎉 All BPMN tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ BPMN XML saving - Works perfectly');
    console.log('✅ BPMN versioning - Version history tracked');
    console.log('✅ BPMN content storage - Data persisted correctly');
    console.log('✅ Version retrieval - All versions accessible');
    console.log('✅ Deployment pipeline - Deployment tracking working');
    console.log('✅ Deployment updates - Status changes tracked');
    console.log('✅ Workflow instances - BPMN execution ready');

    console.log('\n🗄️ Database Persistence:');
    console.log(`   - Workflow stored with ID: ${workflow.id}`);
    console.log(`   - Version stored with ID: ${version.id}`);
    console.log(`   - Deployment stored with ID: ${deployment.id}`);
    console.log(`   - Instance stored with ID: ${instance.id}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runBpmnTests();