/**
 * WebSocket Diagnostics Utility
 * Provides debugging and validation for WebSocket connections
 */

export interface WebSocketDiagnostics {
  isValidEnvironment: boolean;
  url: string;
  host: string;
  protocol: string;
  errors: string[];
  canConnect: boolean;
}

export function diagnoseWebSocketEnvironment(): WebSocketDiagnostics {
  const errors: string[] = [];
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    errors.push("Not in browser environment");
    return {
      isValidEnvironment: false,
      url: '',
      host: '',
      protocol: '',
      errors,
      canConnect: false
    };
  }

  // Check window.location availability
  if (!window.location) {
    errors.push("window.location is undefined");
    return {
      isValidEnvironment: false,
      url: '',
      host: '',
      protocol: '',
      errors,
      canConnect: false
    };
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  
  // Validate host
  if (!host || host === 'undefined:undefined') {
    errors.push(`Invalid host: "${host}"`);
  }
  
  const url = `${protocol}//${host}/ws`;
  
  // Check for undefined in URL
  if (url.includes('undefined')) {
    errors.push(`URL contains undefined: "${url}"`);
  }

  // Check WebSocket support
  if (typeof WebSocket === 'undefined') {
    errors.push("WebSocket is not supported in this environment");
  }

  const isValidEnvironment = errors.length === 0;
  
  return {
    isValidEnvironment,
    url,
    host,
    protocol,
    errors,
    canConnect: isValidEnvironment
  };
}

export function logWebSocketDiagnostics(): WebSocketDiagnostics {
  const diagnostics = diagnoseWebSocketEnvironment();
  
  console.group("🔍 WebSocket Diagnostics");
  console.log("Environment valid:", diagnostics.isValidEnvironment);
  console.log("URL:", diagnostics.url);
  console.log("Host:", diagnostics.host);
  console.log("Protocol:", diagnostics.protocol);
  
  if (diagnostics.errors.length > 0) {
    console.group("❌ Errors detected:");
    diagnostics.errors.forEach(error => console.error(error));
    console.groupEnd();
  } else {
    console.log("✅ No issues detected");
  }
  
  console.groupEnd();
  
  return diagnostics;
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).diagnoseWebSocket = logWebSocketDiagnostics;
}