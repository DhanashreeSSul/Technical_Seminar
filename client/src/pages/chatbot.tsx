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
  Send, ArrowLeft, Bot, User, Globe, Loader2, Sparkles,
  Mic, MicOff, Briefcase, BookOpen, Building2, Map
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/language-provider";
import type { ChatMessage } from "@shared/schema";

const quickPrompts: Record<string, string[]> = {
  en: [
    "How to use this platform?",
    "Find me a job",
    "Show free training courses",
    "Government schemes for women",
    "I want to start a business",
    "Create my career roadmap",
  ],
  hi: [
    "प्लेटफॉर्म कैसे इस्तेमाल करें?",
    "मुझे नौकरी चाहिए",
    "मुफ्त प्रशिक्षण दिखाएं",
    "सरकारी योजनाएं बताएं",
    "मैं व्यवसाय शुरू करना चाहती हूं",
    "मेरे लिए करियर रोडमैप बनाएं",
  ],
  mr: [
    "प्लॅटफॉर्म कसे वापरावे?",
    "मला नोकरी शोधायची आहे",
    "विनामूल्य प्रशिक्षण दाखवा",
    "सरकारी योजना सांगा",
    "मला व्यवसाय सुरू करायचा आहे",
    "माझा करिअर रोडमॅप बनवा",
  ],
};

// Fallback local response engine (if API fails)
function localAssistantResponse(input: string, lang: string): string {
  const t = input.toLowerCase();
  if (lang === "mr") {
    if (t.includes("platform") || t.includes("कसे वापर")) {
      return "She Connects Now मध्ये तुम्ही नोकऱ्या, प्रशिक्षण, सरकारी योजना शोधू शकता. वरच्या मेनूमध्ये प्रत्येक पेज पहा किंवा माझ्याशी बोला — मी तुम्हाला वैयक्तिक मार्गदर्शन देते!";
    }
    if (t.includes("नोकरी") || t.includes("job")) {
      return "तुमच्यासाठी अनेक नोकऱ्या उपलब्ध आहेत — डेटा एंट्री, शिवणकाम, ब्युटी, शेती, ऑनलाइन विक्री. 'नोकऱ्या' पेजवर जा!";
    }
    if (t.includes("प्रशिक्षण") || t.includes("शिक") || t.includes("course")) {
      return "PMKVY, Skill India, Google Digital Unlocked सारखे विनामूल्य अभ्यासक्रम उपलब्ध आहेत. 'प्रशिक्षण' पेजवर जा!";
    }
    return "तुमचा संदेश मिळाला. कृपया नोकरी, प्रशिक्षण, योजना, किंवा व्यवसाय बद्दल विचारा.";
  }
  if (lang === "hi") {
    if (t.includes("platform") || t.includes("कैसे इस्तेमाल")) {
      return "She Connects Now में आप नौकरियां, प्रशिक्षण, सरकारी योजनाएं खोज सकती हैं। ऊपर मेनू में हर पेज देखें या मुझसे बात करें — मैं आपको व्यक्तिगत मार्गदर्शन दूंगी!";
    }
    if (t.includes("नौकरी") || t.includes("job") || t.includes("kaam")) {
      return "आपके लिए कई नौकरियां उपलब्ध हैं — डेटा एंट्री, सिलाई, ब्यूटी, कृषि, ऑनलाइन बिक्री। 'नौकरियां' पेज पर जाएं!";
    }
    if (t.includes("प्रशिक्षण") || t.includes("सीख") || t.includes("course")) {
      return "PMKVY, Skill India, Google Digital Unlocked जैसे मुफ्त पाठ्यक्रम उपलब्ध हैं। 'प्रशिक्षण' पेज पर जाएं!";
    }
    return "आपका संदेश प्राप्त हुआ। कृपया नौकरी, प्रशिक्षण, योजना या व्यवसाय के बारे में पूछें।";
  }
  if (t.includes("platform") || t.includes("how to use")) {
    return "On She Connects Now you can find jobs, training courses, and government schemes. Browse the menu above or chat with me for personalized guidance!";
  }
  if (t.includes("job") || t.includes("work")) {
    return "Many jobs are available — data entry, tailoring, beauty, agriculture, online selling. Visit the Jobs page!";
  }
  if (t.includes("train") || t.includes("course") || t.includes("learn")) {
    return "Free courses from PMKVY, Skill India, Google Digital Unlocked and more. Visit the Training page!";
  }
  return "Thank you for your message. Please ask about jobs, training, schemes, or business ideas.";
}

export default function Chatbot() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice input using Web Speech API
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const { data: chatHistory, isLoading: historyLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ["/api/chat/history"],
    enabled: !!user,
  });

  useEffect(() => {
    if (chatHistory?.messages) setMessages(chatHistory.messages);
  }, [chatHistory]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, lang }: { content: string; lang: string }) => {
      const res = await apiRequest("POST", "/api/ai/chat", {
        message: content,
        language: lang,
        userId: user?.data?.id || null,
      });
      return res.json();
    },
    onMutate: async ({ content }) => {
      const userMessage: ChatMessage = { role: "user", content, timestamp: new Date().toISOString() };
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
        content: localAssistantResponse(variables.content, variables.lang),
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

  const langLabels: Record<string, string> = { en: "English", hi: "हिंदी", mr: "मराठी" };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">{t("chat.title")}</h1>
                <p className="text-xs text-muted-foreground">{t("chat.subtitle")}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {(["en", "hi", "mr"] as const).map((l) => (
              <Button
                key={l}
                variant={language === l ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage(l)}
                className="text-xs px-2"
                data-testid={`button-lang-${l}`}
              >
                {langLabels[l]}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4">
        <ScrollArea className="h-[calc(100vh-180px)]" ref={scrollRef}>
          <div className="py-6 space-y-4">
            {messages.length === 0 && !historyLoading && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {t("chat.welcome").split(".")[0]}.
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                  {t("chat.welcome").split(".").slice(1).join(".")}
                </p>

                {/* Feature quick-access cards */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
                  <Link href="/jobs">
                    <Card className="p-3 hover-elevate cursor-pointer text-left">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-chart-1" />
                        <span className="text-sm font-medium">{t("nav.jobs")}</span>
                      </div>
                    </Card>
                  </Link>
                  <Link href="/training">
                    <Card className="p-3 hover-elevate cursor-pointer text-left">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-chart-2" />
                        <span className="text-sm font-medium">{t("nav.training")}</span>
                      </div>
                    </Card>
                  </Link>
                  <Link href="/schemes">
                    <Card className="p-3 hover-elevate cursor-pointer text-left">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-chart-3" />
                        <span className="text-sm font-medium">{t("nav.schemes")}</span>
                      </div>
                    </Card>
                  </Link>
                  <Link href="/events">
                    <Card className="p-3 hover-elevate cursor-pointer text-left">
                      <div className="flex items-center gap-2">
                        <Map className="h-5 w-5 text-chart-4" />
                        <span className="text-sm font-medium">{t("nav.events")}</span>
                      </div>
                    </Card>
                  </Link>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {(quickPrompts[language] || quickPrompts.en).map((prompt) => (
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
                <Card className={`max-w-[80%] p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
                    <span className="text-sm text-muted-foreground">{t("chat.thinking")}</span>
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
              placeholder={t("chat.placeholder")}
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
              type="button"
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              onClick={toggleVoiceInput}
              data-testid="button-voice-input"
              title="Voice input"
            >
              {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
            </Button>
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
            {t("chat.privacyNote")}
          </p>
        </form>
      </div>
    </div>
  );
}
