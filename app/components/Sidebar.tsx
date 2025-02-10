import { Conversation } from "@/lib/storage";
import Settings from "./Settings";

interface SidebarProps {
  conversations: Record<string, Conversation>;
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onSettingsChange: (settings: {
    temperature: number;
    maxOutputTokens: number;
    systemMessage: string;
  }) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function Sidebar({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  onSettingsChange,
  className = "",
  children,
}: SidebarProps) {
  return (
    <div
      className={`w-full sidebar-gradient border-r border-white/5 flex flex-col h-screen relative ${className}`}
    >
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Chat with Gemini</h1>
          {/* Replace X with chevron-double-left icon */}
          {children && (
            <div className="hover:bg-white/5 rounded-lg transition-colors">
              {children}
            </div>
          )}
        </div>
        <button
          onClick={onNew}
          className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl
                   transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(conversations)
          .sort(
            ([, a], [, b]) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map(([id, conversation]) => (
            <div
              key={id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer
                        transition-colors duration-200 mb-1
                        ${currentId === id ? "bg-white/10" : "hover:bg-white/5"}`}
            >
              <div
                className="flex-1 truncate mr-2"
                onClick={() => onSelect(id)}
              >
                {conversation.title || "New Chat"}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
      </div>

      <Settings onSettingsChange={onSettingsChange} />
    </div>
  );
}
