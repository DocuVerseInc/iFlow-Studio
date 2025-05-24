import { useState } from "react";
import { HelpCircle, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HelpButtonProps {
  onShowHelp: () => void;
  selectedElement?: any;
}

export default function HelpButton({ onShowHelp, selectedElement }: HelpButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getHelpText = () => {
    if (selectedElement) {
      const elementName = selectedElement.businessObject?.name || 'element';
      return `Get help for ${elementName}`;
    }
    return 'Get iFlow design help';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onShowHelp}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 z-40"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isHovered && selectedElement ? (
              <Lightbulb className="h-6 w-6 text-white animate-pulse" />
            ) : (
              <HelpCircle className="h-6 w-6 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2"
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{getHelpText()}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}