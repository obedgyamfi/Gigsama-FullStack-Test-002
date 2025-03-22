// components/chat/Header.tsx
"use client"; // Marks this as a Client Component in Next.js

import Image from "next/image"; // Next.js Image component for optimized image rendering
import { motion } from "framer-motion"; // Framer Motion for animations
import { useRouter } from "next/navigation"; // Next.js hook for programmatic navigation

/**
 * Props interface for the Header component.
 * Defines the properties for displaying project info and toggling history.
 * 
 * @interface HeaderProps
 * @property {string} projectName - The name of the current project.
 * @property {boolean} showHistory - Indicates whether the history panel is visible.
 * @property {(value: boolean) => void} setShowHistory - Function to toggle history visibility.
 */
interface HeaderProps {
  projectName: string;
  showHistory: boolean;
  setShowHistory: (value: boolean) => void;
}

/**
 * Header component - Renders the top navigation bar for the chat interface.
 * This is a client-side component with navigation, project title, and history toggle.
 * 
 * @param {HeaderProps} props - The props for project name and history state management.
 */
export default function Header({ projectName, showHistory, setShowHistory }: HeaderProps) {
  // Hook to access Next.js router for navigation
  const router = useRouter();

  return (
    // Header container with fixed height and border
    <header className="w-full h-[96px] flex justify-between items-center border-b border-gray-200 px-8">
      {/* Logo section with clickable navigation to home */}
      <h1
        className="text-2xl font-semibold flex items-end cursor-pointer hover:opacity-90"
        onClick={() => router.push("/")} // Navigates to root on click
      >
        <Image src="/keymap_icon.svg" alt="Key Map" width={24} height={24} />
        <Image src="/KeyMap_icon2.svg" alt="Key Map" width={72} height={72} />
      </h1>

      {/* Animated project name centered in the header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} // Starting animation state
        animate={{ opacity: 1, y: 0 }} // Ending animation state
        transition={{ duration: 0.4, ease: "easeIn" }} // Animation timing and easing
        className="absolute left-1/2 transform -translate-x-1/2 text-2xl"
      >
        {projectName}
      </motion.div>

      {/* Right-side controls: history toggle and user avatar */}
      <div className="flex items-center gap-6">
        {/* Button to toggle history visibility */}
        <button className="cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
          <Image
            src={showHistory ? "/close-line.svg" : "/history_button_icon.svg"} // Conditional icon based on history state
            alt="History"
            width={showHistory ? 15 : 25} // Smaller icon when closing history
            height={showHistory ? 15 : 25}
          />
        </button>
        {/* User avatar image */}
        <Image
          src="/avatar_image.png"
          alt="User Avatar"
          width={40}
          height={40}
          className="rounded-full object-cover cursor-pointer" // Circular styling with object-fit
        />
      </div>
    </header>
  );
}