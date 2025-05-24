import { motion } from "framer-motion";
import { CollaborativeUser } from "@/hooks/use-collaboration";

interface CollaborativeCursorsProps {
  users: CollaborativeUser[];
  currentUserId: string;
}

const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#F4A460', '#87CEEB', '#FFB6C1', '#98FB98'
];

export default function CollaborativeCursors({ users, currentUserId }: CollaborativeCursorsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {users
        .filter(user => user.userId !== currentUserId && user.cursor)
        .map((user, index) => {
          const color = CURSOR_COLORS[index % CURSOR_COLORS.length];
          return (
            <motion.div
              key={user.userId}
              className="absolute"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: user.cursor!.x,
                y: user.cursor!.y
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* Cursor */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-md"
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill={color}
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              
              {/* User name label */}
              <div
                className="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
                style={{ backgroundColor: color }}
              >
                {user.userName}
              </div>
            </motion.div>
          );
        })}
    </div>
  );
}