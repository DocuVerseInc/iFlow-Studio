import { motion } from "framer-motion";

interface SynapseLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function SynapseLogo({ size = "md", showText = true, className = "" }: SynapseLogoProps) {
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-lg", container: "space-x-2" },
    md: { icon: "h-8 w-8", text: "text-xl", container: "space-x-3" },
    lg: { icon: "h-12 w-12", text: "text-3xl", container: "space-x-4" }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Animated Logo Icon */}
      <div className="relative">
        <motion.svg
          className={currentSize.icon}
          viewBox="0 0 100 100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Central Node */}
          <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="url(#gradient1)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 1, 
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
          />
          
          {/* Pulsating Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="15"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="2"
            opacity="0.6"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Connection Nodes */}
          <motion.circle
            cx="25"
            cy="25"
            r="4"
            fill="url(#gradient3)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.circle
            cx="75"
            cy="25"
            r="4"
            fill="url(#gradient3)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
          <motion.circle
            cx="25"
            cy="75"
            r="4"
            fill="url(#gradient3)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />
          <motion.circle
            cx="75"
            cy="75"
            r="4"
            fill="url(#gradient3)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          />

          {/* Animated Connection Lines */}
          <motion.path
            d="M 29 29 L 46 46"
            stroke="url(#gradient4)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          />
          <motion.path
            d="M 71 29 L 54 46"
            stroke="url(#gradient4)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          />
          <motion.path
            d="M 29 71 L 46 54"
            stroke="url(#gradient4)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          />
          <motion.path
            d="M 71 71 L 54 54"
            stroke="url(#gradient4)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Subtle Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-md opacity-20"
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Animated Text */}
      {showText && (
        <motion.span
          className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${currentSize.text}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Synapse
        </motion.span>
      )}
    </div>
  );
}