// components/chat/MessageDisplay.tsx
"use client"; // Marks this as a Client Component in Next.js

import { motion } from "framer-motion"; // Framer Motion for animation effects
import { variants } from "../utils/animationVariants"; // Custom animation variants for messages
import { Message } from "../types/chatTypes"; // Type definition for chat messages

/**
 * Props interface for the MessageDisplay component.
 * Defines the properties for rendering chat messages.
 * 
 * @interface MessageDisplayProps
 * @property {Message[]} messages - Array of message objects to display.
 */
interface MessageDisplayProps {
  messages: Message[];
}

/**
 * MessageDisplay component - Renders the latest chat message with animations.
 * This is a client-side component that shows a question and its response.
 * 
 * @param {MessageDisplayProps} props - The props containing the messages array.
 */
export default function MessageDisplay({ messages }: MessageDisplayProps) {
  return (
    // Outer container for centering and spacing messages
    <div className="w-full max-w-6xl flex flex-col items-center space-y-4 px-8">
      {/* Inner container for the latest message with transition effects */}
      <div className="w-full max-w-4xl flex flex-col space-py-4 mb-4 items-center rounded-lg transition-all duration-300">
        {/* Display only the most recent message */}
        {messages.slice(-1).map((msg, index) => (
          <motion.div
            key={index} // Unique key for React reconciliation
            custom={index} // Custom prop for animation variants
            variants={variants.message} // Animation variants for entry
            initial="hidden" // Starting animation state
            animate="visible" // Ending animation state
            className="flex flex-col items-center space-y-4 p-2" // Styling for message container
          >
            {/* Question bubble */}
            <motion.div
              variants={variants.message} // Animation for question
              custom={index} // Custom index for staggered animation
              className="bg-gray-100 rounded-3xl px-8 py-4 text-xl max-w-xl text-center" // Styling for question bubble
            >
              {msg.question}
            </motion.div>

            {/* Response bubble */}
            <motion.div
              variants={variants.message} // Animation for response
              custom={index + 1} // Offset index for staggered effect
              className="rounded-3xl py-4 text-xl max-w-xl text-center" // Styling for response bubble
            >
              {/* Conditional rendering for typing indicator or response */}
              {msg.response === "typing..." ? (
                <motion.div
                  animate={{ opacity: [0.2, 1, 0.2] }} // Pulsing animation for typing dots
                  transition={{ duration: 1, repeat: Infinity }} // Infinite loop for effect
                  className="text-gray-500" // Styling for typing indicator
                >
                  ● ● ●
                </motion.div>
              ) : (
                msg.response // Display actual response when not typing
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}