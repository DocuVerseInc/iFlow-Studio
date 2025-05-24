import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeLabel: string;
  icon: LucideIcon;
  color: "blue" | "orange" | "green" | "red";
}

const colorClasses = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    changeColor: "text-green-600",
  },
  orange: {
    iconBg: "bg-orange-100", 
    iconColor: "text-orange-600",
    changeColor: "text-red-600",
  },
  green: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600", 
    changeColor: "text-green-600",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    changeColor: "text-red-600",
  },
};

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color 
}: MetricsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`${colors.iconColor} h-6 w-6`} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={colors.changeColor}>{change}</span>
          <span className="text-gray-500 ml-1">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
