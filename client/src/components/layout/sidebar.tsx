import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  PenTool, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Globe,
  GitBranch
} from "lucide-react";
import SynapseLogo from "@/components/ui/synapse-logo";

const navigation = [
  {
    name: "iFlow Designer",
    href: "/designer",
    icon: PenTool,
  },
  {
    name: "Task Management", 
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "API Integrations",
    href: "/integrations",
    icon: Globe,
  },
  {
    name: "Versions & Deployments",
    href: "/versions",
    icon: GitBranch,
  },
  {
    name: "Admin Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: "/help",
    icon: HelpCircle,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 sidebar-modern flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <SynapseLogo size="md" showText={true} className="justify-start" />
        <p className="text-xs text-gray-500 mt-2 ml-11 font-medium">iFlow Engine</p>
      </div>
      
      {/* Main Navigation */}
      <nav className="px-3 py-4 space-y-1 flex-1">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/designer" && location === "/");
          
          return (
            <a 
              key={item.name} 
              href={item.href} 
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", item.href);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          {secondaryNavigation.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", item.href);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
