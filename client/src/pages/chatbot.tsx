import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  ArrowLeft, 
  Bot, 
  User,
  Globe,
  Loader2,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import type { ChatMessage } from "@shared/schema";

const quickPrompts = {
  en: [
    "I want to learn a new skill",
    "Help me find a job",
    "I want to start a small business",
    "Show me government schemes",
    "Create a career roadmap for me",
  ],
  hi: [
    "मुझे नया कौशल सीखना है",
    "नौकरी खोजने में मदद करें",
    "मैं छोटा व्यवसाय शुरू करना चाहती हूं",
    "सरकारी योजनाएं दिखाएं",
    "मेरे लिए करियर रोडमैप बनाएं",
  ],
};

export default function Chatbot() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: chatHistory, isLoading: historyLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ["/api/chat/history"],
    enabled: !!user,
  });

  useEffect(() => {
    if (chatHistory?.messages) {
      setMessages(chatHistory.messages);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, lang }: { content: string; lang: string }) => {
      const res = await apiRequest("POST", "/api/chat/message", { message: content, language: lang });
      return res.json();
    },
    onMutate: async ({ content }) => {
      const userMessage: ChatMessage = {
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
    onError: () => {
      setMessages(prev => prev.slice(0, -1));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate({ content: message.trim(), lang: language });
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!sendMessageMutation.isPending) {
      sendMessageMutation.mutate({ content: prompt, lang: language });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">AI Career Guide</h1>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Here to help you grow" : "आपकी मदद के लिए यहां"}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(l => l === "en" ? "hi" : "en")}
            className="gap-2"
            data-testid="button-toggle-language"
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "हिंदी" : "English"}
          </Button>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4">
        <ScrollArea className="h-[calc(100vh-180px)]" ref={scrollRef}>
          <div className="py-6 space-y-4">
            {messages.length === 0 && !historyLoading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {language === "en" ? "Hello! How can I help you today?" : "नमस्ते! आज मैं आपकी कैसे मदद कर सकती हूं?"}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {language === "en" 
                    ? "I can help you find career opportunities, learn new skills, discover government schemes, and create a personalized roadmap."
                    : "मैं आपको करियर के अवसर खोजने, नए कौशल सीखने, सरकारी योजनाओं की खोज करने और व्यक्तिगत रोडमैप बनाने में मदद कर सकती हूं।"
                  }
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickPrompts[language].map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-sm"
                      data-testid={`button-quick-${prompt.slice(0, 10)}`}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <Card className={`max-w-[80%] p-4 ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </Card>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <Card className="p-4 bg-card">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {language === "en" ? "Thinking..." : "सोच रही हूं..."}
                    </span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0 bg-background border-t px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === "en" ? "Type your message..." : "अपना संदेश टाइप करें..."}
              className="resize-none min-h-[44px] max-h-[120px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              data-testid="input-chat-message"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {language === "en" 
              ? "Your conversations are private and secure"
              : "आपकी बातचीत निजी और सुरक्षित है"
            }
          </p>
        </form>
      </div>
    </div>
  );
}
