// components/chat/ProjectHistory.tsx
"use client"; // Marks this as a Client Component in Next.js

import { Button } from "@/components/ui/button"; // Custom Button component from UI library
import { Project, Message } from "../types/chatTypes"; // Type definitions for projects and messages
import { useRouter } from "next/navigation"; // Next.js hook for programmatic navigation

/**
 * Props interface for the ProjectHistory component.
 * Defines the properties for managing project history and state updates.
 * 
 * @interface ProjectHistoryProps
 * @property {Project[]} projects - Array of project objects to display.
 * @property {(id: string | undefined) => void} setCurrentProjectId - Function to set the current project ID.
 * @property {(name: string) => void} setProjectName - Function to set the current project name.
 * @property {(messages: Message[]) => void} setMessages - Function to set the chat messages.
 * @property {(value: boolean) => void} setShowHistory - Function to toggle history visibility.
 */
interface ProjectHistoryProps {
  projects: Project[];
  setCurrentProjectId: (id: string | undefined) => void;
  setProjectName: (name: string) => void;
  setMessages: (messages: Message[]) => void;
  setShowHistory: (value: boolean) => void;
}

/**
 * ProjectHistory component - Displays a list of projects and a new project button.
 * This is a client-side component for navigating project history and resetting state.
 * 
 * @param {ProjectHistoryProps} props - The props for managing projects and state.
 */
export default function ProjectHistory({
  projects,
  setCurrentProjectId,
  setProjectName,
  setMessages,
  setShowHistory,
}: ProjectHistoryProps) {
  // Hook to access Next.js router for navigation
  const router = useRouter();

  return (
    <>
      {/* Main content area for project list */}
      <main className="w-full justify-center max-w-3xl flex flex-col items-center text-center space-y-6">
        {/* List of projects with clickable names */}
        <div className="space-y-8 text-4xl">
          {projects.map(project => (
            <p
              key={project.id} // Unique key for React reconciliation
              className="hover:text-blue-600 cursor-pointer" // Styling for hover effect
              onClick={() => router.replace(`/${project.id}`, { scroll: false })} // Navigate to project page without scrolling
            >
              {project.name}
            </p>
          ))}
        </div>
      </main>

      {/* New project button container */}
      <div className="w-full max-w-6xl relative items-center text-center">
        <Button
          onClick={() => {
            setCurrentProjectId(undefined); // Clear current project ID
            setProjectName(""); // Reset project name
            setMessages([]); // Clear messages
            router.replace('/', { scroll: false }); // Navigate to root without scrolling
            setShowHistory(false); // Hide history panel
          }}
          className="w-half rounded-full bg-black text-white px-14 py-10 text-2xl" // Button styling
        >
          + New Project
        </Button>
      </div>
    </>
  );
}