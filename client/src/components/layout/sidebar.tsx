import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  PenTool, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Workflow,
  Globe
} from "lucide-react";

const navigation = [
  {
    name: "Workflow Designer",
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
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Workflow className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WorkFlow</h1>
            <p className="text-sm text-gray-500">Engine</p>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/designer" && location === "/");
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              )}>
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          {secondaryNavigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
