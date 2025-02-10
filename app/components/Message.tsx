import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MessageProps {
  content: string;
  role: "user" | "assistant";
  onCopy?: () => void;
}

interface CodeProps extends React.ClassAttributes<HTMLElement> {
  inline?: boolean;
  children?: React.ReactNode;
}

export default function Message({ content, role, onCopy }: MessageProps) {
  return (
    <div className="mb-8 max-w-4xl mx-auto">
      <div
        className={`group relative rounded-xl p-6 ${
          role === "user"
            ? "message-gradient-user ml-16 mr-4"
            : "message-gradient-assistant mr-16 ml-4"
        }`}
      >
        {role === "assistant" && (
          <button
            onClick={onCopy}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 
                     transition-opacity p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </button>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          className="prose prose-invert max-w-none prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-gray-700/50"
          components={{
            pre: ({ node, ...props }) => (
              <pre
                className="rounded-lg overflow-auto backdrop-blur-lg"
                {...props}
              />
            ),
            code: ({ inline, ...props }: CodeProps) =>
              inline ? (
                <code
                  className="bg-gray-900/50 px-1.5 py-0.5 rounded-md"
                  {...props}
                />
              ) : (
                <code {...props} />
              ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
