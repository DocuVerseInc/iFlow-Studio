import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaletteTooltipsProps {
  modelerRef: any;
}

const paletteHelp = {
  'create.start-event': {
    title: 'Start Event',
    description: 'Begin your workflow here',
    tip: 'Every workflow needs at least one start event'
  },
  'create.end-event': {
    title: 'End Event', 
    description: 'Mark workflow completion',
    tip: 'Use multiple end events for different outcomes'
  },
  'create.task': {
    title: 'Task',
    description: 'A unit of work to be performed',
    tip: 'Choose specific task types for better clarity'
  },
  'create.user-task': {
    title: 'User Task',
    description: 'Requires human interaction',
    tip: 'Assign to users or groups for manual work'
  },
  'create.service-task': {
    title: 'Service Task',
    description: 'Automated system task',
    tip: 'Perfect for API calls and automated processes'
  },
  'create.exclusive-gateway': {
    title: 'Exclusive Gateway',
    description: 'Choose one path based on conditions',
    tip: 'Use for decision points with mutually exclusive options'
  },
  'create.parallel-gateway': {
    title: 'Parallel Gateway',
    description: 'Split or merge parallel flows',
    tip: 'Great for tasks that can run simultaneously'
  },
  'create.subprocess-expanded': {
    title: 'Sub Process',
    description: 'Group related activities together',
    tip: 'Organize complex workflows into manageable sections'
  }
};

export default function PaletteTooltips({ modelerRef }: PaletteTooltipsProps) {
  useEffect(() => {
    if (!modelerRef?.current) return;

    const addTooltipsToPalette = () => {
      // Wait for palette to be rendered
      setTimeout(() => {
        const paletteContainer = document.querySelector('.djs-palette');
        if (!paletteContainer) return;

        const paletteEntries = paletteContainer.querySelectorAll('.entry');
        
        paletteEntries.forEach((entry: Element) => {
          const actionAttr = entry.getAttribute('data-action');
          if (!actionAttr || !paletteHelp[actionAttr as keyof typeof paletteHelp]) return;

          const helpInfo = paletteHelp[actionAttr as keyof typeof paletteHelp];
          
          // Remove existing tooltip if any
          const existingTooltip = entry.querySelector('.palette-tooltip');
          if (existingTooltip) existingTooltip.remove();

          // Create tooltip element
          const tooltip = document.createElement('div');
          tooltip.className = 'palette-tooltip absolute hidden bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-xs';
          tooltip.innerHTML = `
            <div class="font-semibold text-gray-900 mb-1">${helpInfo.title}</div>
            <div class="text-sm text-gray-700 mb-2">${helpInfo.description}</div>
            <div class="text-xs text-blue-600 font-medium">${helpInfo.tip}</div>
          `;

          // Position tooltip
          const entryRect = entry.getBoundingClientRect();
          tooltip.style.left = `${entryRect.width + 10}px`;
          tooltip.style.top = `0px`;

          // Add tooltip to entry
          (entry as HTMLElement).style.position = 'relative';
          entry.appendChild(tooltip);

          // Show/hide tooltip on hover
          entry.addEventListener('mouseenter', () => {
            tooltip.classList.remove('hidden');
          });

          entry.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
          });
        });
      }, 500);
    };

    // Initial setup
    addTooltipsToPalette();

    // Re-add tooltips when palette updates
    const observer = new MutationObserver(() => {
      addTooltipsToPalette();
    });

    const paletteContainer = document.querySelector('.djs-palette');
    if (paletteContainer) {
      observer.observe(paletteContainer, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
    };
  }, [modelerRef]);

  return null; // This component doesn't render anything directly
}