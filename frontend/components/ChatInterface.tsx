"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";

type Schema = {
  [tableName: string]: {
    [fieldName: string]: string;
  };
};

type Message = {
  question: string;
  response: string;
  schema: Schema | null;
};

type Project = {
  id: string;
  name: string;
  created_at: string;
};

interface ChatInterfaceProps {
  initialProjectId?: string;
}

export default function ChatInterface({ initialProjectId }: ChatInterfaceProps) {
  const router = useRouter();
  const params = useParams();
  const projectIdFromParams = params?.projectId as string | undefined;
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(initialProjectId || projectIdFromParams);
  const [projectName, setProjectName] = useState<string>("");

  // motion message variants
  const messageVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.15, duration: 0.4, ease: "easeOut" },
    }),
  };

  const tableVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1, duration: 0.3, ease: "easeInOut" },
    }),
  };

  const welcomeContainerVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2, duration: 0.5, ease: "easeInOut" },
    },
  };

  const welcomeTextVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const existingProjects: Project[] = await res.json();

        // clean quotes from project names
        const cleanedProjects = existingProjects.map((project) => ({
          ...project, name: project.name.replace(/^"|"$/g, ""),
        })); // strip quotes from name
        setProjects(cleanedProjects);

        // Only fetch history if currentProjectId existed at mount
        if (currentProjectId && initialProjectId === currentProjectId) {
          const historyRes = await fetch(`http://localhost:5000/api/projects/${currentProjectId}/history`);
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
  }, [currentProjectId, initialProjectId]); // Add initialProjectId to deps

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
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.question, projectId: currentProjectId }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data: { response: string; schema: Schema | null; projectId: string; projectName: string } = await res.json();

      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          response: data.response,
          schema: data.schema,
        };
        return updatedMessages;
      });

      if (!currentProjectId) {
        console.log("New project created with name:", data.projectName); // Debug
        router.replace(`/${data.projectId}`, { scroll: false });
      }

      setInput("");
    } catch (error) {
      console.error("Error:", error);
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

  const renderSchema = (schema: Schema | null) => {
    if (!schema) return null;
    return (
      <div className="w-full max-w-6xl flex flex-wrap gap-6">
        {Object.entries(schema).map(([tableName, fields], index) => (
          <motion.div
            key={tableName}
            variants={tableVariant}
            initial="hidden"
            animate="visible"
            custom={index}
            className="border border-gray-200 min-w-[200px] max-w-[250px]"
          >
            <h3 className="text-base text-lg font-semibold text-left p-3 text-gray-900 border-b bg-gray-100 border-gray-200 pb-2 mb-2 capitalize">
              {tableName}
            </h3>
            <div className="space-y-6 p-3">
              {Object.entries(fields).map(([field, type]) => (
                <div key={field} className="flex justify-between text-lg">
                  <span className="text-gray-900 text-semibold">{field}</span>
                  <span className="text-gray-500">{type}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Get the latest schema
  const latestSchema = messages.length > 0 ? messages[messages.length - 1].schema : null;

  return (
    <div className="grid grid-rows-[auto_1fr_auto] justify-items-center min-h-screen pb-40">
      <header className="w-full h-[96px] flex justify-between items-center border-b border-gray-200 px-8">
        <h1 className="text-2xl font-semibold flex items-end cursor-pointer hover:opacity-90"
          onClick={() => router.push("/")}>
          <Image src="/keymap_icon.svg" alt="Key Map Image" width={24} height={24} />
          <Image src="/KeyMap_icon2.svg" alt="Key Map Image" width={72} height={72} />
        </h1>
        {/* Center the project name */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
          className="absolute left-1/2 transform -translate-x-1/2 text-2xl ">
          {projectName}
        </motion.div>
        <div className="flex items-center gap-6">
          <button className="cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
            {!showHistory ? (
              <Image src="/history_button_icon.svg" alt="History" width={25} height={25} />
            ) : (
              <Image src="/close-line.svg" alt="History" width={15} height={15} />
            )}
          </button>
          <Image
            src="/avatar_image.png"
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full object-cover cursor-pointer"
          />
        </div>
      </header>

      {showHistory ? (
        <>
          <main className="w-full justify-center max-w-3xl flex flex-col items-center text-center space-y-6">
            <div className="space-y-8 text-4xl">
              {projects.map(project => (
                <p
                  key={project.id}
                  className="hover:text-blue-600 cursor-pointer"
                  onClick={() => {
                    router.replace(`/${project.id}`, { scroll: false });
                  }}
                >
                  {project.name}
                </p>
              ))}
            </div>
          </main>
          <div className="w-full max-w-6xl relative items-center text-center">
            <Button onClick={() => {
              setCurrentProjectId(undefined);
              setProjectName("");
              setMessages([]);
              router.replace('/', { scroll: false });
              setShowHistory(false);
            }}
              className="w-half rounded-full bg-black text-white px-14 py-10 text-2xl">
              + New Project
            </Button>
          </div>
        </>
      ) : (
        <>
          {!messages.length && (
            <main className="flex mt-8 flex-col gap-8 justify-center text-center ">
              <motion.div
                variants={welcomeContainerVariant}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center text-center space-y-2">
                <motion.h2 
                  variants={welcomeTextVariant}
                  className="text-3xl font-medium">
                  Welcome, <span className="italic font-medium">User.</span>
                </motion.h2>
                <motion.p variants={welcomeTextVariant} className="text-gray-500 text-4xl">What are we building today?</motion.p>
              </motion.div>
            </main>
          )}

          {messages.length > 0 && (
            <main className="flex mt-12 flex-col gap-8 text-center">
              <div className="w-full max-w-4xl flex flex-col items-center">
                {renderSchema(latestSchema)}
              </div>
            </main>
          )}

          {messages.length > 0 && (
            <div className=" w-full max-w-6xl flex flex-col items-center space-y-4 px-8">
              <div className="w-full max-w-4xl flex flex-col space-py-4 mb-4 items-center rounded-lg transition-all duration-300">
                {messages.slice(-1).map((msg, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={messageVariant}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center space-y-4 p-2"
                  >
                    <motion.div
                      variants={messageVariant}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      className="bg-gray-100 rounded-3xl px-8 py-4 text-xl max-w-xl text-center">
                      {msg.question}
                    </motion.div>
                    <motion.div
                      variants={messageVariant}
                      custom={index + 1}
                      initial="hidden"
                      animate="visible"
                      className="rounded-3xl py-4 text-xl max-w-xl text-center">
                      {msg.response === "typing..." ? (
                        <motion.div
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-gray-500"
                        >
                          ● ● ●
                        </motion.div>
                      ) : (
                        msg.response
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full max-w-6xl px-4 sm:px-8 max-w-6xl relative">
            <Input
              type="text"
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full rounded-3xl shadow-md px-4 py-12 placeholder:text-2xl !text-2xl !caret-gray-700 !caret-[1.5em]"
            />
            <Button
              onClick={handleSendMessage}
              className="absolute right-4 top-[50%] -translate-y-[50%] -translate-x-[50%] bg-black text-white rounded-full h-14 w-14 flex items-center justify-center cursor-pointer"
            >
              <Image src="/up_arrow_vector.svg" alt="Arrow" width={20} height={20} className="w-6 h-6" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}