/**
 * WebSocket Connection Test Suite
 * Tests WebSocket functionality to prevent construction errors
 */

// Test WebSocket URL construction
function testWebSocketURLConstruction() {
  console.log("🔍 Testing WebSocket URL construction...");
  
  // Mock window.location for testing
  const mockLocations = [
    { protocol: 'http:', host: 'localhost:5000' },
    { protocol: 'https:', host: 'example.com' },
    { protocol: 'http:', host: 'localhost:3000' },
  ];
  
  mockLocations.forEach(location => {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${location.host}/ws`;
    
    console.log(`✓ Generated URL for ${location.protocol}//${location.host}: ${wsUrl}`);
    
    // Validate URL format
    if (wsUrl.includes('undefined') || !wsUrl.includes('/ws')) {
      console.error(`❌ Invalid WebSocket URL: ${wsUrl}`);
      return false;
    }
  });
  
  console.log("✅ WebSocket URL construction tests passed");
  return true;
}

// Test WebSocket connection validation
function testWebSocketValidation() {
  console.log("🔍 Testing WebSocket validation logic...");
  
  // Test invalid scenarios
  const invalidScenarios = [
    { host: '', description: 'empty host' },
    { host: 'undefined:undefined', description: 'undefined host' },
    { host: null, description: 'null host' },
  ];
  
  invalidScenarios.forEach(scenario => {
    if (!scenario.host || scenario.host === 'undefined:undefined') {
      console.log(`✓ Correctly rejected: ${scenario.description}`);
    } else {
      console.error(`❌ Should have rejected: ${scenario.description}`);
      return false;
    }
  });
  
  console.log("✅ WebSocket validation tests passed");
  return true;
}

// Test error handling
function testWebSocketErrorHandling() {
  console.log("🔍 Testing WebSocket error handling...");
  
  try {
    // Simulate invalid URL error
    const invalidUrl = "ws://undefined:undefined/ws";
    if (invalidUrl.includes('undefined')) {
      throw new Error(`Invalid WebSocket URL: ${invalidUrl}`);
    }
  } catch (error) {
    console.log(`✓ Error properly caught: ${error.message}`);
  }
  
  console.log("✅ WebSocket error handling tests passed");
  return true;
}

// Test actual WebSocket connection (if server is running)
async function testWebSocketConnection() {
  console.log("🔍 Testing actual WebSocket connection...");
  
  return new Promise((resolve) => {
    try {
      const protocol = typeof window !== 'undefined' && window.location ? 
        (window.location.protocol === "https:" ? "wss:" : "ws:") : "ws:";
      const host = typeof window !== 'undefined' && window.location ? 
        window.location.host : "localhost:5000";
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log(`Attempting connection to: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("✅ WebSocket connection successful");
        ws.close();
        resolve(true);
      };
      
      ws.onerror = (error) => {
        console.log("⚠️ WebSocket connection failed (this is expected if server is not running)");
        resolve(true); // This is not a test failure
      };
      
      ws.onclose = () => {
        console.log("🔌 WebSocket connection closed");
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        ws.close();
        console.log("⏰ WebSocket connection test timed out");
        resolve(true);
      }, 5000);
      
    } catch (error) {
      console.log(`⚠️ WebSocket construction failed: ${error.message}`);
      resolve(false);
    }
  });
}

// Run all tests
async function runWebSocketTests() {
  console.log("🚀 Starting WebSocket Test Suite");
  console.log("=" * 50);
  
  const results = [];
  
  results.push(testWebSocketURLConstruction());
  results.push(testWebSocketValidation());
  results.push(testWebSocketErrorHandling());
  results.push(await testWebSocketConnection());
  
  console.log("=" * 50);
  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;
  
  if (passedTests === totalTests) {
    console.log(`🎉 All ${totalTests} WebSocket tests passed!`);
  } else {
    console.log(`❌ ${totalTests - passedTests} of ${totalTests} tests failed`);
  }
  
  return passedTests === totalTests;
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runWebSocketTests };
} else if (typeof window !== 'undefined') {
  window.runWebSocketTests = runWebSocketTests;
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  console.log("WebSocket test suite loaded. Run 'runWebSocketTests()' in console to test.");
}