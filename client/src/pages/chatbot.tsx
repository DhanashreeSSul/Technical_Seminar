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

function localAssistantResponse(input: string, lang: "en" | "hi"): string {
  const t = input.toLowerCase();
  if (lang === "hi") {
    if (t.includes("कौशल") || t.includes("सीख") || t.includes("स्किल") || t.includes("course")) {
      return (
        "बहुत बढ़िया! यहां 4 सप्ताह की योजना है:\n" +
        "सप्ताह 1: एक कौशल चुनें और YouTube पर बेसिक्स सीखें।\n" +
        "सप्ताह 2: रोज़ 30–45 मिनट अभ्यास करें और छोटा प्रोजेक्ट शुरू करें।\n" +
        "सप्ताह 3: एक छोटा प्रोजेक्ट पूरा करें और अपना रेज़्यूमे अपडेट करें।\n" +
        "सप्ताह 4: She Connects Now पर NGO ईवेंट देखें और आवेदन करें।\n" +
        "अगला कदम: अपने मौजूदा कौशल और रुचियां बताएं।"
      );
    }
    if (t.includes("नौकरी") || t.includes("job") || t.includes("work")) {
      return (
        "नौकरी के लिए ये कदम अपनाएं:\n" +
        "1) अपना रेज़्यूमे बनाएं/अपडेट करें (Canva टेम्पलेट)।\n" +
        "2) NCS और Skill India पर रजिस्टर करें।\n" +
        "3) रोज़ 3 भूमिकाओं के लिए आवेदन करें।\n" +
        "4) NGO ट्रेनिंग/वर्कशॉप जॉइन करें।\n" +
        "क्या आप चाहें तो मैं 4 सप्ताह का रोडमैप बना दूं?"
      );
    }
    if (t.includes("व्यवसाय") || t.includes("business") || t.includes("startup") || t.includes("उद्यम")) {
      return (
        "छोटा व्यवसाय शुरू करने के स्टेप्स:\n" +
        "1) आइडिया चुनें और बेसिक लागत लिखें।\n" +
        "2) Mudra Loan/PMEGP विकल्प देखें।\n" +
        "3) सरल बजट और दैनिक योजना बनाएं।\n" +
        "4) लोकल और ऑनलाइन दोनों जगह मार्केटिंग करें।\n" +
        "मैं आपके लिए 4 सप्ताह की योजना बना सकती हूं।"
      );
    }
    if (t.includes("योजना") || t.includes("scheme") || t.includes("सरकार")) {
      return (
        "लोकप्रिय सरकारी योजनाएं:\n" +
        "• PMEGP: नए उद्यम के लिए सहायता।\n" +
        "• Mudra Loan: माइक्रो-उद्यम के लिए वित्त।\n" +
        "• Skill India/PMKVY: कौशल प्रशिक्षण।\n" +
        "बताएं कि आपका लक्ष्य क्या है, मैं सही विकल्प सुझाऊंगी।"
      );
    }
    if (t.includes("रोडमैप") || t.includes("roadmap") || t.includes("plan")) {
      return (
        "4 सप्ताह का रोडमैप:\n" +
        "सप्ताह 1: लक्ष्य तय करें, बेसिक्स सीखें।\n" +
        "सप्ताह 2: हर दिन अभ्यास, मिनी-प्रोजेक्ट।\n" +
        "सप्ताह 3: एक प्रोजेक्ट पूरा करें, रेज़्यूमे/प्रोफाइल अपडेट करें।\n" +
        "सप्ताह 4: अवसरों के लिए आवेदन, इंटरव्यू तैयारी।\n" +
        "अगर आप चाहें तो मैं इसे आपकी रुचि के अनुसार कस्टमाइज़ कर दूं।"
      );
    }
    return (
      "मैं आपकी मदद के लिए यहां हूं। अपने लक्ष्य, कौशल और शहर बताएं, ताकि मैं सही संसाधन, कोर्स, नौकरी या योजनाएं सुझा सकूं।"
    );
  }
  if (t.includes("learn") || t.includes("skill") || t.includes("course") || t.includes("upskill")) {
    return (
      "Great choice! Here’s a 4-week plan:\n" +
      "Week 1: Pick a skill and learn basics on YouTube.\n" +
      "Week 2: Practice 30–45 min daily; start a mini project.\n" +
      "Week 3: Complete one small project; update your resume.\n" +
      "Week 4: Check NGO events on She Connects Now and apply.\n" +
      "Next: Tell me your current skills and interests."
    );
  }
  if (t.includes("job") || t.includes("work") || t.includes("hiring") || t.includes("career")) {
    return (
      "To find jobs, follow these steps:\n" +
      "1) Create/refresh your resume (Canva template).\n" +
      "2) Register on NCS and Skill India portals.\n" +
      "3) Apply to 3 roles daily.\n" +
      "4) Join local NGO training/workshops.\n" +
      "Want me to generate a 4-week roadmap?"
    );
  }
  if (t.includes("business") || t.includes("startup") || t.includes("enterprise") || t.includes("shop")) {
    return (
      "Steps to start a small business:\n" +
      "1) Pick an idea and write basic costs.\n" +
      "2) Explore Mudra Loan/PMEGP.\n" +
      "3) Create a simple budget and daily plan.\n" +
      "4) Market locally and online.\n" +
      "I can build a 4-week plan for you."
    );
  }
  if (t.includes("scheme") || t.includes("government") || t.includes("pmegp") || t.includes("mudra")) {
    return (
      "Popular government schemes:\n" +
      "• PMEGP: Support for new enterprises.\n" +
      "• Mudra Loan: Finance for micro-enterprises.\n" +
      "• Skill India/PMKVY: Training programs.\n" +
      "Share your goal and I’ll suggest the best option."
    );
  }
  if (t.includes("roadmap") || t.includes("plan") || t.includes("guide")) {
    return (
      "4-week roadmap:\n" +
      "Week 1: Define goal, learn basics.\n" +
      "Week 2: Daily practice, mini project.\n" +
      "Week 3: Finish a project, update resume/profile.\n" +
      "Week 4: Apply to opportunities, prep interviews.\n" +
      "I can tailor this to your interests."
    );
  }
  return (
    "I’m here to help. Share your goal, skills, and city so I can suggest the right resources, courses, jobs, or schemes."
  );
}

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
    onError: (_err, variables) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: localAssistantResponse(variables.content, variables.lang as "en" | "hi"),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
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
