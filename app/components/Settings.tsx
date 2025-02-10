import { useState } from "react";

interface SettingsProps {
  onSettingsChange: (settings: {
    temperature: number;
    maxOutputTokens: number;
    systemMessage: string;
  }) => void;
}

export default function Settings({ onSettingsChange }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxOutputTokens, setMaxOutputTokens] = useState(4096);
  const [systemMessage, setSystemMessage] = useState(
    "You are a knowledgeable and articulate AI assistant. Maintain a natural, conversational tone while providing accurate and thoughtful responses. Aim for clarity and precision in your explanations, using plain language that's easy to understand. Create some sort of opening sentence or two that sets the tone for the conversation. While you can occasionally use an emoji when truly appropriate, prefer clear writing over decorative elements. Structure your responses in a logical way, and feel free to use examples or analogies when they help illustrate complex concepts. Of course, you can be approachable and friendly, but do not try to sound too enthusiastic or casual. Always respond in English, unless the user asks you to respond in a different language.",
  );

  const handleChange = <T extends number | string>(
    setter: (value: T) => void,
    value: T,
  ) => {
    setter(value);
    onSettingsChange({
      temperature,
      maxOutputTokens,
      systemMessage,
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors border-t border-white/10"
      >
        <div className="flex items-center gap-2">
          <span>⚙️</span>
          <span>Settings</span>
        </div>
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 border-t border-white/10 bg-gray-900/50">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">Temperature: {temperature}</label>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={temperature}
              onChange={(e) =>
                handleChange(setTemperature, parseFloat(e.target.value))
              }
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">Max Tokens: {maxOutputTokens}</label>
            </div>
            <input
              type="range"
              min="100"
              max="8192"
              step="1"
              value={maxOutputTokens}
              onChange={(e) =>
                handleChange(setMaxOutputTokens, parseInt(e.target.value))
              }
              className="w-full accent-blue-500"
            />
          </div>

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            🔧 Advanced Settings
            <svg
              className={`w-4 h-4 transform transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isAdvancedOpen && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm block mb-2">System Message</label>
                <textarea
                  value={systemMessage}
                  onChange={(e) =>
                    handleChange(setSystemMessage, e.target.value)
                  }
                  className="w-full h-32 bg-gray-800/50 text-white rounded-xl px-4 py-3 
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50
                           placeholder-gray-400 text-sm resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
