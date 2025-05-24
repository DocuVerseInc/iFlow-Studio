import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CollaborativeUser } from "@/hooks/use-collaboration";
import { Users } from "lucide-react";

interface UserPresenceProps {
  users: CollaborativeUser[];
  currentUserId: string;
  isConnected: boolean;
}

const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
];

export default function UserPresence({ users, currentUserId, isConnected }: UserPresenceProps) {
  const otherUsers = users.filter(user => user.userId !== currentUserId);
  
  return (
    <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {otherUsers.length + 1} {otherUsers.length === 0 ? 'user' : 'users'}
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        {otherUsers.slice(0, 3).map((user, index) => (
          <Avatar key={user.userId} className="h-6 w-6">
            <AvatarFallback 
              className={`text-xs text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
            >
              {user.userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {otherUsers.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{otherUsers.length - 3}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
    </div>
  );
}