import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
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
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };
    
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
}
