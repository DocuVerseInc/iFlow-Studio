import { useRef, useEffect } from "react";
import { Workflow } from "lucide-react";

interface BpmnModelerProps {
  onXmlChange: (xml: string) => void;
  onElementSelect: (element: any) => void;
  xml?: string;
}

export default function BpmnModeler({ onXmlChange, onElementSelect, xml }: BpmnModelerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !propertiesPanelRef.current) return;

    const initModeler = async () => {
      try {
        // @ts-ignore - Libraries loaded via CDN
        if (typeof window !== 'undefined' && window.BpmnJS && window.BpmnPropertiesPanel) {
          // @ts-ignore
          const BpmnJS = window.BpmnJS;
          // @ts-ignore
          const propertiesPanelModule = window.BpmnPropertiesPanel.propertiesPanelModule;
          // @ts-ignore
          const propertiesProviderModule = window.BpmnPropertiesPanel.propertiesProviderModule;
          
          modelerRef.current = new BpmnJS({
            container: containerRef.current,
            keyboard: {
              bindTo: window
            },
            propertiesPanel: {
              parent: propertiesPanelRef.current
            },
            additionalModules: [
              propertiesPanelModule,
              propertiesProviderModule
            ],
            moddleExtensions: {
              activiti: window.activitiModdleDescriptor || {}
            }
          });

          // Create new diagram or import existing
          if (xml) {
            await modelerRef.current.importXML(xml);
          } else {
            await modelerRef.current.createDiagram();
          }

          // Listen for changes
          modelerRef.current.on('commandStack.changed', async () => {
            try {
              const { xml: newXml } = await modelerRef.current.saveXML({ format: true });
              onXmlChange(newXml);
            } catch (error) {
              console.error('Error saving XML:', error);
            }
          });

          // Listen for element selection
          modelerRef.current.on('selection.changed', (event: any) => {
            const element = event.newSelection[0];
            onElementSelect(element || null);
          });

          // Listen for element property changes
          modelerRef.current.on('element.changed', (event: any) => {
            if (event.element) {
              onElementSelect(event.element);
            }
          });
        }
      } catch (error) {
        console.error('Error initializing BPMN modeler:', error);
      }
    };

    // Check if required libraries are loaded
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window.BpmnJS && window.BpmnPropertiesPanel) {
        initModeler();
      } else {
        // Wait for scripts to load
        const checkLibraries = setInterval(() => {
          // @ts-ignore
          if (window.BpmnJS && window.BpmnPropertiesPanel) {
            clearInterval(checkLibraries);
            initModeler();
          }
        }, 100);

        return () => clearInterval(checkLibraries);
      }
    }

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (modelerRef.current && xml) {
      modelerRef.current.importXML(xml).catch((error: any) => {
        console.error('Error importing XML:', error);
      });
    }
  }, [xml]);

  return (
    <div className="h-full w-full flex">
      {/* BPMN Canvas */}
      <div className="flex-1 bg-gray-50 relative">
        <div ref={containerRef} className="h-full w-full bjs-container" />
        {/* Fallback content when BPMN.js is not available */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <Workflow className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">BPMN Canvas</p>
            <p className="text-sm">Drag elements from the toolbar to start designing</p>
          </div>
        </div>
      </div>
      
      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
        <div ref={propertiesPanelRef} className="h-full overflow-y-auto properties-panel-container" />
      </div>
    </div>
  );
}