// components/chat/WelcomeMessage.tsx
"use client"; // Marks this as a Client Component in Next.js

import { motion } from "framer-motion"; // Framer Motion for animation effects
import { variants } from "../utils/animationVariants"; // Custom animation variants for welcome message

/**
 * WelcomeMessage component - Displays an animated welcome message for the user.
 * This is a client-side component with a greeting and prompt.
 */
export default function WelcomeMessage() {
  return (
    // Main container for centering the welcome content
    <main className="flex mt-8 flex-col gap-8 justify-center text-center">
      {/* Animated container for welcome text */}
      <motion.div
        variants={variants.welcomeContainer} // Animation variants for the container
        initial="hidden" // Starting animation state
        animate="visible" // Ending animation state
        className="flex flex-col items-center text-center space-y-2" // Styling for layout
      >
        {/* Welcome heading */}
        <motion.h2
          variants={variants.welcomeText} // Animation variants for the heading
          className="text-3xl font-medium" // Styling for the heading
        >
          Welcome, <span className="italic font-medium">User.</span>
        </motion.h2>

        {/* Prompt text */}
        <motion.p
          variants={variants.welcomeText} // Animation variants for the paragraph
          className="text-gray-500 text-4xl" // Styling for the prompt
        >
          What are we building today?
        </motion.p>
      </motion.div>
    </main>
  );
}