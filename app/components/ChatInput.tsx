import { FormEvent, useState, useRef, useEffect } from "react";
import { Ellipsis, GitHub, Send } from "./Icons";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Function to adjust textarea height based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set the height to scrollHeight (content height)
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 50), 300);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Adjust height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Reset height after submission
  const resetTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "50px";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSubmit(input);
    setInput("");
    resetTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="w-full mx-auto mb-4">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative"
        >
          <textarea
            ref={textareaRef}
            className="w-full py-4 px-4 sm:px-6 pr-14 sm:pr-16 bg-gray-900/30 backdrop-blur-sm 
                     border border-gray-700/50 rounded-xl text-white placeholder-gray-400 
                     resize-none min-h-[50px] max-h-[300px] focus:outline-none focus:ring-2 
                     focus:ring-indigo-500/50 focus:border-indigo-500/50 overflow-y-auto"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          ></textarea>
          <button
            type="submit"
            disabled={disabled || input.trim() === ""}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg 
                     text-gray-300 disabled:text-gray-600 hover:text-white 
                     disabled:hover:text-gray-600 transition-colors"
          >
            {disabled ? (
              <Ellipsis />
            ) : (
              <Send />
            )}
          </button>
        </form>
        
        <div className="text-center mt-2">
          <a 
            href="https://github.com/sumitdotml/chat-with-gemini" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
          >
            <GitHub />
            source code
          </a>
        </div>
      </div>
    </div>
  );
}
