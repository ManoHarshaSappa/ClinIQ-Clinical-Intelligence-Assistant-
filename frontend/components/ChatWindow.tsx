"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendChat } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

// Web Speech API type declarations
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
interface ISpeechRecognitionResult { 0: { transcript: string } }
interface ISpeechRecognitionEvent { results: ISpeechRecognitionResult[] }

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function ChatWindow({ patientId }: { patientId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Text-to-Speech ──────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Google US English") ||
        v.name.includes("Alex") ||
        v.lang === "en-US"
    );
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // ── Speech-to-Text ──────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r: ISpeechRecognitionResult) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ── Send message ─────────────────────────────────────────────────
  const submit = async () => {
    const question = input.trim();
    if (!question || isLoading) return;
    stopSpeaking();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    try {
      const res = await sendChat(question, patientId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, sources: res.sources },
      ]);
      if (autoSpeak && res.answer) speak(res.answer);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error contacting the server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="bg-blue-50 px-3 md:px-4 py-2.5 md:py-3 border-b flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-blue-800">AI Clinical Chat</p>
          <p className="text-xs text-blue-500 truncate">Answers grounded in patient records only</p>
        </div>
        {/* Auto-speak toggle */}
        <button
          onClick={() => { setAutoSpeak((v) => !v); stopSpeaking(); }}
          className={`flex items-center gap-1.5 text-xs px-2.5 md:px-3 py-1.5 rounded-full border transition-colors touch-target flex-shrink-0
            ${autoSpeak
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-500 border-gray-300 hover:border-blue-400"}`}
          title={autoSpeak ? "AI voice ON — click to turn off" : "AI voice OFF — click to turn on"}
        >
          <span className="hidden sm:inline">{autoSpeak ? "🔊 Voice ON" : "🔇 Voice OFF"}</span>
          <span className="sm:hidden">{autoSpeak ? "🔊" : "🔇"}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 md:p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 md:space-y-4 px-2 md:px-4">
            <p className="text-3xl md:text-4xl">💬</p>
            <p className="text-sm font-medium text-slate-600">Ask anything about this patient</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {[
                "What medications are they on?",
                "Any allergies I should know?",
                "What do their lab results show?",
                "What's their diagnosis?",
                "Summarize this patient's history",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs md:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 md:py-1.5 rounded-full transition-colors touch-target text-center"
                >
                  {q.length > 25 ? `${q.substring(0, 25)}...` : q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-sm leading-relaxed
                ${msg.role === "user"
                  ? "max-w-[85%] md:max-w-[75%] bg-blue-500 text-white rounded-br-sm"
                  : "w-full bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"}`}
            >
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                <div className="space-y-1 text-sm text-slate-800">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Sections get good spacing
                      h2: ({ children }) => (
                        <div className="mt-6 mb-2 first:mt-0 pt-4 border-t border-slate-100 first:border-t-0 first:pt-0">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-1">
                            {children}
                          </p>
                        </div>
                      ),
                      h3: ({ children }) => (
                        <p className="font-bold text-slate-800 mt-3 mb-1">{children}</p>
                      ),
                      // Paragraphs with breathing room
                      p: ({ children }) => (
                        <p className="text-slate-700 leading-relaxed my-2">{children}</p>
                      ),
                      // Bullet lists with spacing
                      ul: ({ children }) => (
                        <ul className="space-y-1.5 my-2 ml-1">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start gap-2 text-slate-700">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          <span className="flex-1">{children}</span>
                        </li>
                      ),
                      // Smart blockquotes — color by emoji content
                      blockquote: ({ children }) => {
                        const text = String(children);
                        const isRed    = text.includes("🚨") || text.includes("DANGER") || text.includes("Never") || text.includes("NOT safe") || text.includes("contraindicated");
                        const isGreen  = text.includes("✅") || text.includes("safe") || text.includes("Safe") || text.includes("Clear");
                        const isAmber  = text.includes("⚠") || text.includes("WARNING") || text.includes("Caution") || text.includes("monitor");

                        const style = isRed
                          ? "border-l-4 border-red-500 bg-red-50 text-red-900 px-4 py-3 rounded-r-xl my-3"
                          : isGreen
                          ? "border-l-4 border-emerald-500 bg-emerald-50 text-emerald-900 px-4 py-3 rounded-r-xl my-3"
                          : isAmber
                          ? "border-l-4 border-amber-400 bg-amber-50 text-amber-900 px-4 py-3 rounded-r-xl my-3"
                          : "border-l-4 border-blue-400 bg-blue-50 text-blue-900 px-4 py-3 rounded-r-xl my-3";

                        return <div className={style}>{children}</div>;
                      },
                      // Bold text
                      strong: ({ children }) => (
                        <strong className="font-semibold text-slate-900">{children}</strong>
                      ),
                      // Proper table
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm">
                          <table className="w-full text-xs border-collapse">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-800 text-white">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-slate-700 last:border-r-0">
                          {children}
                        </th>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-100">{children}</tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-blue-50 transition-colors even:bg-slate-50">
                          {children}
                        </tr>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-slate-700 border-r border-slate-100 last:border-r-0">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Speak this message button */}
              {msg.role === "assistant" && (
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => speak(msg.content)}
                    className="text-xs md:text-sm text-slate-400 hover:text-blue-500 transition-colors touch-target py-1"
                    title="Read aloud"
                  >
                    🔊 Read
                  </button>
                  {msg.sources && msg.sources.length > 0 && (
                    <details className="text-xs md:text-sm text-slate-400">
                      <summary className="cursor-pointer hover:text-blue-500 select-none touch-target py-1">
                        ▶ Sources ({msg.sources.length})
                      </summary>
                      <div className="mt-2 space-y-1.5">
                        {msg.sources.map((s, j) => (
                          <p key={j} className="bg-slate-50 rounded-lg p-2 md:p-3 border border-slate-200 text-xs md:text-sm text-slate-500 leading-relaxed">
                            {s}...
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl md:rounded-2xl rounded-bl-sm px-3 md:px-4 py-2.5 text-sm text-gray-400 animate-pulse">
              <span className="hidden sm:inline">Searching patient records...</span>
              <span className="sm:hidden">Searching...</span>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="flex justify-center">
            <button
              onClick={stopSpeaking}
              className="text-xs md:text-sm bg-red-50 text-red-500 border border-red-200 px-3 py-2 md:py-1 rounded-full hover:bg-red-100 transition-colors touch-target"
            >
              🔴 <span className="hidden sm:inline">Speaking... tap to stop</span>
              <span className="sm:hidden">Tap to stop</span>
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t p-2 md:p-3 flex gap-2 bg-gray-50 items-center">
        {/* Mic button */}
        <button
          onClick={toggleMic}
          disabled={isLoading}
          className={`flex-shrink-0 w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg transition-all border touch-target
            ${isListening
              ? "bg-red-500 text-white border-red-500 animate-pulse shadow-lg shadow-red-200"
              : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-500"}`}
          title={isListening ? "Stop listening" : "Speak your question"}
        >
          🎤
        </button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
          placeholder={isListening ? "Listening... speak now" : "Ask about medications, diagnoses, lab results..."}
          disabled={isLoading}
          className={`bg-white transition-colors min-h-[44px] text-base md:text-sm ${isListening ? "border-red-300 ring-1 ring-red-200" : ""}`}
        />

        <Button
          onClick={submit}
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 touch-target px-4 md:px-3 py-3 md:py-2 text-sm font-medium"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
