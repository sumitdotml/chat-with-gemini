import { useState, useRef, useEffect } from "react";
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
  const [copiedBlockIndex, setCopiedBlockIndex] = useState<number | null>(null);
  const codeRefs = useRef<(HTMLPreElement | null)[]>([]);
  
  // Sanitize content to remove problematic HTML tags
  const sanitizedContent = content.replace(/<module.*?>|<\/module>/g, '');
  
  // Reset code refs on content change
  useEffect(() => {
    codeRefs.current = [];
  }, [content]);
  
  // Simple direct copy function that uses a global toast
  const copyCodeBlock = (index: number) => {
    const codeBlock = codeRefs.current[index];
    if (codeBlock) {
      try {
        // Get the code text
        const codeText = codeBlock.textContent || "";
        
        // Use the clipboard API with fallback
        if (navigator.clipboard && window.isSecureContext) {
          // Use modern clipboard API
          navigator.clipboard.writeText(codeText)
            .then(() => {
              showCopyToast(index);
            })
            .catch((err) => {
              console.error("Failed to copy!", err);
              fallbackCopyTextToClipboard(codeText, index);
            });
        } else {
          // Use fallback
          fallbackCopyTextToClipboard(codeText, index);
        }
      } catch (error) {
        console.error("Copy failed:", error);
      }
    }
  };
  
  // Fallback for clipboard API
  const fallbackCopyTextToClipboard = (text: string, index: number) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      
      // Select and copy
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          showCopyToast(index);
        } else {
          console.error('Failed to copy');
        }
      } catch (err) {
        console.error('Error during copy command', err);
      }
      
      // Clean up
      document.body.removeChild(textArea);
    } catch (err) {
      console.error('Failed to copy with fallback', err);
    }
  };
  
  // Show the copy toast
  const showCopyToast = (index: number) => {
    // First, update the state for the React UI
    setCopiedBlockIndex(index);
    
    // Create a fixed toast element
    const toast = document.createElement('div');
    toast.innerText = "Copied to clipboard";
    
    // Style it to be extremely visible in the center of the screen
    Object.assign(toast.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(0.8)',
      backgroundColor: 'rgba(16, 185, 129, 0.95)',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '18px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      zIndex: '99999',
      opacity: '0',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });
    
    // Add it to the body
    document.body.appendChild(toast);
    
    // Force a reflow
    toast.getBoundingClientRect();
    
    // Show the toast with animation
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    
    // Hide and remove after delay
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -50%) scale(0.8)';
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
        // Reset copy state
        setCopiedBlockIndex(null);
      }, 300);
    }, 2000);
  };
  
  // Common code block rendering component
  const codeBlockRenderer = (node: any, props: any) => {
    const preRef = (ref: HTMLPreElement) => {
      if (ref) codeRefs.current.push(ref);
    };
    
    const index = codeRefs.current.length;
    
    return (
      <div className="relative group">
        <div 
          className="absolute top-0 right-0 left-0 bg-gray-800/70 h-10 backdrop-blur-sm rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copyCodeBlock(index);
          }}
          type="button"
          className={`absolute top-2 right-2 p-2 rounded ${copiedBlockIndex === index ? 'bg-green-700/90 border-green-500/50' : 'bg-gray-700/90 border-gray-600/30'} hover:bg-gray-600 
                    transition-all duration-300 text-xs text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 z-50
                    shadow-md border cursor-pointer`}
          aria-label="Copy code"
        >
          {copiedBlockIndex === index ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
        <pre
          ref={preRef}
          className="rounded-lg overflow-x-auto max-w-full backdrop-blur-lg scrollbar-code mt-0"
          {...props}
        />
      </div>
    );
  };
  
  // Common inline code renderer
  const inlineCodeRenderer = (props: CodeProps) => (
    <code
      className="bg-gray-900/50 px-1.5 py-0.5 rounded-md"
      {...props}
    />
  );
  
  return (
    <div className="mb-6 w-full mx-auto">
      <div className={`flex items-start ${role === "user" ? "justify-end" : "justify-start"}`}>
        {role === "assistant" && (
          <div className="flex-shrink-0 mr-3 flex items-center avatar-appear self-start pt-[2px]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              <img src="/modelavatar.ico" alt="AI" className="w-full h-full object-contain" />
            </div>
          </div>
        )}
        
        {role === "user" ? (
          <div className="relative rounded-xl p-4 shadow-md message-gradient-user bg-indigo-900/30 border-indigo-500/30 max-w-[85%]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              className="prose prose-indigo max-w-none prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-gray-700/50"
              components={{
                pre: ({ node, ...props }) => codeBlockRenderer(node, props),
                code: ({ inline, ...props }: CodeProps) => inline ? inlineCodeRenderer(props) : <code {...props} />,
              }}
            >
              {sanitizedContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="w-full" style={{ maxWidth: "calc(100% - 80px)" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              className="prose prose-invert max-w-none prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-gray-700/50 overflow-hidden"
              components={{
                pre: ({ node, ...props }) => codeBlockRenderer(node, props),
                code: ({ inline, ...props }: CodeProps) => inline ? inlineCodeRenderer(props) : <code {...props} />,
                p: ({ children }) => <p className="mb-4">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {sanitizedContent}
            </ReactMarkdown>
          </div>
        )}
        
        {role === "user" && (
          <div className="flex-shrink-0 ml-3 flex items-center avatar-appear self-start pt-[2px]">
            <div className="w-10 h-10 rounded-full user-avatar flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
