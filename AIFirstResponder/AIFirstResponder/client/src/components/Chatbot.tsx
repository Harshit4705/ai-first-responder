import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Zap, X, Send, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  isUserMessage: boolean;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your First Aid Assistant. How can I help you today?",
      isUserMessage: false,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      addMessage(data.response, false);
    },
  });

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    addMessage(inputMessage, true);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const addMessage = (content: string, isUserMessage: boolean) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      isUserMessage,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={toggleChatbot}
        className="bg-secondary hover:bg-secondary/90 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition duration-300"
        aria-label="Open chatbot"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-card shadow-xl rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Zap className="h-6 w-6 mr-2" />
                <h3 className="font-medium">First Aid Assistant</h3>
              </div>
              <button
                onClick={toggleChatbot}
                className="text-white hover:text-white/80"
                aria-label="Close chatbot"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start ${
                  message.isUserMessage ? "justify-end" : ""
                }`}
              >
                {!message.isUserMessage && (
                  <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-2">
                    <Zap className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={`py-2 px-3 rounded-lg max-w-[80%] ${
                    message.isUserMessage
                      ? "bg-secondary bg-opacity-10 dark:bg-opacity-20"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.isUserMessage && (
                  <div className="bg-gray-300 dark:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 ml-2">
                    <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex">
              <input
                type="text"
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a first aid question..."
                className="flex-grow px-3 py-2 border border-input dark:border-input dark:bg-background rounded-l-md focus:outline-none focus:ring-1 focus:ring-secondary"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === "" || chatMutation.isPending}
                className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-r-md transition disabled:opacity-50"
              >
                {chatMutation.isPending ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              AI assistant provides general guidance only. Always seek
              professional medical help for emergencies.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
