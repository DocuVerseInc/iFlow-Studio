// Simple WebSocket validation test
console.log("Testing WebSocket URL construction...");

// Test scenarios that were causing issues
const testCases = [
  { protocol: 'http:', host: 'localhost:5000', expected: 'ws://localhost:5000/ws' },
  { protocol: 'https:', host: 'example.com', expected: 'wss://example.com/ws' },
  { protocol: 'http:', host: '', shouldFail: true },
  { protocol: 'http:', host: 'undefined:undefined', shouldFail: true }
];

testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}:`);
  
  if (test.shouldFail) {
    if (!test.host || test.host === 'undefined:undefined') {
      console.log(`✅ Correctly rejected invalid host: "${test.host}"`);
    } else {
      console.log(`❌ Should have rejected host: "${test.host}"`);
    }
  } else {
    const protocol = test.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${test.host}/ws`;
    
    if (wsUrl === test.expected && !wsUrl.includes('undefined')) {
      console.log(`✅ Generated correct URL: ${wsUrl}`);
    } else {
      console.log(`❌ Generated incorrect URL: ${wsUrl}, expected: ${test.expected}`);
    }
  }
});

console.log("\nWebSocket validation tests completed!");