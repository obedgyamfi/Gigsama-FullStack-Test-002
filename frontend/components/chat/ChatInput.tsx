// components/chat/ChatInput.tsx
"use client"; // Marks this as a Client Component in Next.js

import { Input } from "@/components/ui/input"; // Custom Input component from UI library
import { Button } from "@/components/ui/button"; // Custom Button component from UI library
import Image from "next/image"; // Next.js Image component for optimized image rendering

/**
 * Props interface for the ChatInput component.
 * Defines the expected properties for handling chat input and submission.
 * 
 * @interface ChatInputProps
 * @property {string} input - The current value of the input field.
 * @property {(value: string) => void} setInput - Function to update the input state.
 * @property {() => void} handleSendMessage - Function to handle sending the message.
 */
interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
}

/**
 * ChatInput component - Renders an input field and send button for chat functionality.
 * This is a client-side component that handles user input and message submission.
 * 
 * @param {ChatInputProps} props - The props for managing input and sending messages.
 */
export default function ChatInput({ input, setInput, handleSendMessage }: ChatInputProps) {
  return (
    // Container div with responsive width and padding
    <div className="w-full max-w-6xl px-4 sm:px-8 relative">
      {/* Input field for typing messages */}
      <Input
        type="text"
        placeholder="Ask anything"
        value={input}
        onChange={(e) => setInput(e.target.value)} // Updates input state on change
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} // Triggers send on Enter key
        className="w-full rounded-3xl shadow-md px-4 py-12 placeholder:text-2xl !text-2xl !caret-gray-700 !caret-[1.5em]"
      />
      {/* Send button with an arrow icon */}
      <Button
        onClick={handleSendMessage} // Triggers message send on click
        className="absolute right-4 top-[50%] -translate-y-[50%] -translate-x-[50%] bg-black text-white rounded-full h-14 w-14 flex items-center justify-center cursor-pointer"
      >
        <Image
          src="/up_arrow_vector.svg"
          alt="Arrow"
          width={20}
          height={20}
          className="w-6 h-6" // Overrides width/height for consistent rendering
        />
      </Button>
    </div>
  );
}