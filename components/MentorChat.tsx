import React, { useState, useRef, useEffect } from "react";
import { getChatbotResponse } from "../services/aiService";
import Button from "./common/Button";
import { PaperAirplaneIcon, SparklesIcon, AcademicCapIcon, BriefcaseIcon, LightBulbIcon } from "./common/Icons";
import { Student } from "../types";

interface Message {
  text: string;
  sender: "user" | "ai";
  timestamp?: string;
}

interface MentorChatProps {
  student: Student;
}

const MentorChat: React.FC<MentorChatProps> = ({ student }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: `Hello ${
        student.name.split(" ")[0]
      }! I'm your AI Career Assistant powered by Groq. 🚀\n\nI can help you with:\n- **Resume Review & Enhancements**\n- **Mock Interview Questions (STAR Method)**\n- **Skill Gap & Learning Roadmaps**\n- **Career Strategy & Opportunity Advice**\n\nHow can I support your career journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (textToSend.trim() === "" || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { text: textToSend, sender: "user", timestamp: time };
    const historyForAPI = [...messages];

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setIsLoading(true);

    try {
      const aiResponseText = await getChatbotResponse(
        textToSend,
        historyForAPI,
        student
      );
      const aiMessage: Message = {
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having a brief issue connecting. Please feel free to ask again in a moment.",
          sender: "ai"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionCategories = [
    { label: "📄 Review My Resume", text: "How can I improve my resume bullet points for high-tier internship roles?" },
    { label: "🎯 Mock Interview Prep", text: "Can you ask me 3 common interview questions for a tech internship and evaluate my responses?" },
    { label: "💡 Skill Gap Strategy", text: "What are the most in-demand skills I should learn this month based on my profile?" },
    { label: "🚀 PM Scheme Advice", text: "What makes an applicant stand out during the PM Internship Scheme allocation process?" }
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[650px] bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <span>AI Career Assistant</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                Online • Groq AI
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Personalized mentor for {student.name}</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xl px-5 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.timestamp && (
                <div className={`text-[10px] mt-1.5 text-right opacity-60`}>
                  {msg.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none text-xs text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span>Thinking with Groq AI...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2 overflow-x-auto">
        {suggestionCategories.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s.text)}
            disabled={isLoading}
            className="px-3 py-1 text-[11px] font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:border-indigo-400 hover:text-indigo-600 transition-all disabled:opacity-50 whitespace-nowrap shadow-sm"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything about resumes, interview answers, or career roadmaps..."
          className="flex-grow px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
        />
        <Button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          variant="primary"
          className="!rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MentorChat;
