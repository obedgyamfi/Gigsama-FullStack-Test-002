// components/chat/ChatInterface.tsx
"use client"; // Marks this as a Client Component in Next.js

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "./Header";
import WelcomeMessage from "./WelcomeMessage";
import SchemaDisplay from "./SchemaDisplay";
import MessageDisplay from "./MessageDisplay";
import ChatInput from "./ChatInput";
import ProjectHistory from "./ProjectHistory";
import { ChatInterfaceProps, Message, Project } from "../types/chatTypes";

// Base API URL, fallback to localhost for development
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ChatInterface({ initialProjectId }: ChatInterfaceProps) {
  const router = useRouter();
  const params = useParams();
  const projectIdFromParams = params?.projectId as string | undefined;
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
    initialProjectId || projectIdFromParams
  );
  const [projectName, setProjectName] = useState<string>("");

  // Fetch projects and history on mount or when currentProjectId changes
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/projects`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const existingProjects: Project[] = await res.json();
        // Clean up project names by removing surrounding quotes
        const cleanedProjects = existingProjects.map(project => ({
          ...project,
          name: project.name.replace(/^"|"$/g, ""),
        }));
        setProjects(cleanedProjects);

        if (currentProjectId && initialProjectId === currentProjectId) {
          const historyRes = await fetch(`${BASE_API_URL}/api/projects/${currentProjectId}/history`);
          if (!historyRes.ok) throw new Error("Failed to fetch history");
          const { history, projectName: fetchedName } = await historyRes.json();
          setMessages(history);
          setProjectName(fetchedName.replace(/^"|"$/g, ""));
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    fetchProjects();
  }, [currentProjectId, initialProjectId]);

  // Handle sending a new message to the chat API
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      question: input.trim(),
      response: "typing...",
      schema: null,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");

    try {
      const res = await fetch(`${BASE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.question, projectId: currentProjectId }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();

      // Update the latest message with the response and schema
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          response: data.response,
          schema: data.schema,
        };
        return updatedMessages;
      });

      // Navigate to new project ID if none exists yet
      if (!currentProjectId) {
        router.replace(`/${data.projectId}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error:", error);
      // Update the latest message with an error response
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          response: "Failed to fetch response."
        };
        return updatedMessages;
      });
    }
  };

  const latestSchema = messages.length > 0 ? messages[messages.length - 1].schema : null;

  return (
    // Grid layout for header, main content, and input
    <div className="grid grid-rows-[auto_1fr_auto] justify-items-center min-h-screen pb-40">
      <Header
        projectName={projectName}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />

      {showHistory ? (
        <ProjectHistory
          projects={projects}
          setCurrentProjectId={setCurrentProjectId}
          setProjectName={setProjectName}
          setMessages={setMessages}
          setShowHistory={setShowHistory}
        />
      ) : (
        <>
          {!messages.length && <WelcomeMessage />}
          {messages.length > 0 && (
            // Main content area for schema and messages
            <main className="flex mt-12 flex-col gap-8 text-center">
              <div className="w-full max-w-4xl flex flex-col items-center">
                <SchemaDisplay schema={latestSchema} />
              </div>
            </main>
          )}
          {messages.length > 0 && <MessageDisplay messages={messages} />}
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
          />
        </>
      )}
    </div>
  );
}