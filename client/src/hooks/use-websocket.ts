import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Validate window.location is available and properly formed
    if (typeof window === 'undefined' || !window.location) {
      console.warn("WebSocket not available: window.location is undefined");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    
    // Validate host before constructing URL
    if (!host || host === 'undefined:undefined') {
      console.warn("WebSocket not available: invalid host", host);
      return;
    }
    
    const wsUrl = `${protocol}//${host}/ws`;
    console.log("Attempting WebSocket connection to:", wsUrl);
    
    const connect = () => {
      try {
        // Additional validation before WebSocket construction
        if (!wsUrl || wsUrl.includes('undefined')) {
          throw new Error(`Invalid WebSocket URL: ${wsUrl}`);
        }
        
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Invalidate relevant queries based on message type
            switch (message.type) {
              case 'workflow_created':
              case 'workflow_updated':
              case 'workflow_deleted':
                queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/workflows"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/metrics"] });
                break;
                
              case 'instance_created':
              case 'instance_updated':
                queryClient.invalidateQueries({ queryKey: ["/api/workflow-instances"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/workflows"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/metrics"] });
                break;
                
              case 'task_created':
              case 'task_updated':
              case 'task_started':
              case 'task_completed':
                queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/metrics"] });
                break;
                
              default:
                // Refresh all queries for unknown message types
                queryClient.invalidateQueries();
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
        
        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected, attempting to reconnect...");
          setIsConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connect, 3000);
        };
        
        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        setIsConnected(false);
        
        // Only retry if the error is not due to invalid URL construction
        if (!(error instanceof Error) || !error.message?.includes('Invalid WebSocket URL')) {
          console.log("Retrying WebSocket connection in 5 seconds...");
          setTimeout(connect, 5000);
        } else {
          console.error("WebSocket connection permanently disabled due to invalid URL");
        }
      }
    };
    
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsConnected(false);
    };
  }, [queryClient]);

  return {
    socket: wsRef.current,
    isConnected
  };
}
