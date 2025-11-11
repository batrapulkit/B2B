import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, Square, Download, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface TravelInfo {
  destination?: string;
  days?: number;
  budget?: string;
  travelers?: string;
  dates?: string;
}

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Hi! I’m **Tono**, your Triponic B2B AI Assistant.\n\nLet's craft a perfect itinerary for your client. I’ll ask you a few quick questions first — then I’ll build the proposal. Ready?",
    },
  ]);
  const [input, setInput] = useState("");
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({});
  const [isCollectingInfo, setIsCollectingInfo] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);
  const abortController = useRef<AbortController | null>(null);

  const nextQuestion = () => {
    if (!travelInfo.destination) return "🌍 What’s the destination?";
    if (!travelInfo.days) return "📅 How many days will the trip be?";
    if (!travelInfo.budget) return "💰 What’s the estimated budget per person?";
    if (!travelInfo.travelers) return "👥 Who are the travelers? (e.g., couple, family, solo)";
    if (!travelInfo.dates) return "🗓️ When are they planning to travel?";
    return null;
  };

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Discovery Phase
    if (isCollectingInfo) {
      if (!travelInfo.destination) setTravelInfo((p) => ({ ...p, destination: input }));
      else if (!travelInfo.days && /\d/.test(input))
        setTravelInfo((p) => ({ ...p, days: parseInt(input) }));
      else if (!travelInfo.budget) setTravelInfo((p) => ({ ...p, budget: input }));
      else if (!travelInfo.travelers) setTravelInfo((p) => ({ ...p, travelers: input }));
      else if (!travelInfo.dates) setTravelInfo((p) => ({ ...p, dates: input }));

      const next = nextQuestion();
      if (next) {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: next },
        ]);
        return;
      }

      // All info collected → move to proposal generation
      setIsCollectingInfo(false);
      generateProposal();
    }
  };

  const generateProposal = async () => {
    setIsTyping(true);
    setIsStreaming(true);
    abortController.current = new AbortController();

    const { destination, days, budget, travelers, dates } = travelInfo;

    try {
      const prompt = `
You are **Tono**, the Triponic B2B AI Assistant**.
Create a concise, client-ready travel proposal in **markdown format** based on this information:

Destination: ${destination}
Duration: ${days} days
Budget: ${budget}
Travelers: ${travelers}
Dates: ${dates}

Follow this format strictly:
✈️ **Trip Summary**
🗓️ **Day-by-Day Plan** (short and practical)
🏨 **Hotel Suggestions** (table with name, rating, price range)
💰 **Estimated Cost Per Person**
✅ **Inclusions / Exclusions**
✨ **Closing line encouraging customization**

Keep it short, polished, and client-presentable. No generic guides.
`;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: abortController.current.signal,
      });

      const data = await response.json();
      const aiText =
        data?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ I couldn’t generate a response. Try again.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: aiText },
      ]);
    } catch (err: any) {
      console.error("Gemini error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Something went wrong while generating. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortController.current) {
      abortController.current.abort();
      setIsStreaming(false);
      setIsTyping(false);
    }
  };

  const handleExportPDF = () => {
    if (!proposalRef.current) return;
    const element = proposalRef.current;
    const opt = {
      margin: 0.5,
      filename: "triponic_proposal.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleExportDoc = () => {
    const content = messages[messages.length - 1]?.content || "";
    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    saveAs(blob, "triponic_proposal.docx");
  };

  return (
    <div className="flex flex-col w-full h-[700px] bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 text-white">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-lg font-semibold tracking-wide">Triponic B2B AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <button
              onClick={handleStop}
              className="text-white/90 hover:text-white flex items-center gap-1 text-sm"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="text-white/80 hover:text-white transition p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div
        ref={chatRef}
        className="flex-1 p-5 overflow-y-auto bg-gradient-to-br from-white to-gray-50 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            ref={idx === messages.length - 1 ? proposalRef : null}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-5 py-4 rounded-2xl text-sm leading-relaxed shadow ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-xl font-semibold mt-3 mb-2 text-blue-700" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-gray-800 leading-relaxed my-2" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
                    ),
                    li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                    table: ({ node, ...props }) => (
                      <table
                        className="border-collapse border border-gray-300 my-3 w-full text-sm"
                        {...props}
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-semibold"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-gray-300 px-2 py-1 text-gray-700" {...props} />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            isCollectingInfo
              ? "Answer Tono’s questions..."
              : "Ask Tono to adjust or regenerate..."
          }
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 outline-none text-sm"
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          disabled={isStreaming}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-t">
        <div className="text-xs text-gray-500">© Triponic B2B Assistant · AI Travel Proposals</div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              navigator.clipboard.writeText(messages[messages.length - 1]?.content || "")
            }
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            <FileText className="w-4 h-4" /> Copy
          </button>
          <button
            onClick={handleExportDoc}
            className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:underline"
          >
            <FileText className="w-4 h-4" /> DOCX
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 text-sm font-medium text-pink-600 hover:underline"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}
