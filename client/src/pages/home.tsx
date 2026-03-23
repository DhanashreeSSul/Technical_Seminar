import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  GraduationCap, 
  Briefcase, 
  Users,
  Shield,
  Lock,
  Trash2,
  CheckCircle,
  ArrowRight,
  Heart
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI-Powered Guidance",
    description: "Get personalized career advice in your language. Our chatbot understands your needs and suggests the best path forward.",
  },
  {
    icon: GraduationCap,
    title: "Skill Development",
    description: "Access curated courses, workshops, and learning resources from trusted NGOs and government portals.",
  },
  {
    icon: Briefcase,
    title: "Job & Business Opportunities",
    description: "Discover job openings, internships, and micro-enterprise ideas tailored to your skills and location.",
  },
  {
    icon: Users,
    title: "NGO Network",
    description: "Connect with verified NGOs and foundations offering courses, mentorship, and support programs.",
  },
];

const steps = [
  {
    number: "01",
    title: "Share Your Goals",
    description: "Tell us about your interests, skills, and what you're looking for - a job, skill, or business idea.",
  },
  {
    number: "02",
    title: "Get Personalized Guidance",
    description: "Our AI analyzes your profile and matches you with the best opportunities and learning paths.",
  },
  {
    number: "03",
    title: "Follow Your Roadmap",
    description: "Receive a week-by-week action plan to achieve your goals with clear milestones.",
  },
  {
    number: "04",
    title: "Connect & Grow",
    description: "Join NGO programs, attend workshops, and build your skills with community support.",
  },
];

const trustFeatures = [
  { icon: Shield, text: "No sensitive data stored (no Aadhaar)" },
  { icon: Lock, text: "Your conversations stay private" },
  { icon: Trash2, text: "Delete your account anytime" },
  { icon: CheckCircle, text: "Consent-based data collection" },
  { icon: Shield, text: "Secure OTP verification" },
];

const stats = [
  { value: "100+", label: "Partner NGOs" },
  { value: "50K+", label: "Women Guided" },
  { value: "500+", label: "Courses Available" },
  { value: "28", label: "States Covered" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const domains = [
    { label: "Handicrafts", emoji: "🧵" },
    { label: "Tailoring & Fashion", emoji: "✂️" },
    { label: "Digital Skills", emoji: "💻" },
    { label: "Cooking & Food", emoji: "👩‍🍳" },
    { label: "Agriculture", emoji: "🌾" },
    { label: "Business & Entrepreneurship", emoji: "💼" },
    { label: "Healthcare & Wellness", emoji: "⚕️" },
    { label: "Languages & Communication", emoji: "🗣️" },
    { label: "Accounting & Finance", emoji: "📊" },
    { label: "Education & Training", emoji: "📚" },
  ];

  const toggleDomain = (label: string) => {
    setSelectedDomains(prev =>
      prev.includes(label) ? prev.filter(d => d !== label) : [...prev, label]
    );
  };

  const navigateToEvents = (domain?: string) => {
    const q = encodeURIComponent((domain ? [domain] : selectedDomains).join(", "));
    navigate(`/events?search=${q}`);
  };

  const navigateToSchemes = (domain?: string) => {
    const q = encodeURIComponent((domain ? [domain] : selectedDomains).join(", "));
    navigate(`/schemes?search=${q}`);
  };
  return (
    <div className="min-h-screen">
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Heart className="h-4 w-4 fill-current" />
                Free AI-Powered Career Guidance
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                Discover Your Path to{" "}
                <span className="text-primary">Success</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Whether you want to learn a skill, find a job, or start a small business — 
                we guide you step by step through trusted NGOs and government schemes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-hero-guidance">
                    Get Guidance <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/ngo/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-hero-ngo">
                    Register as NGO
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl p-4 shadow-sm border">
                      <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  {["Skills", "Jobs", "Learning"].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💚</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
              Discover Your Opportunities
            </h2>
            <p className="text-muted-foreground mt-2">
              Select your interests to find personalized NGO courses and government schemes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((d) => {
              const selected = selectedDomains.includes(d.label);
              return (
                <Card
                  key={d.label}
                  className={`cursor-pointer transition hover-elevate ${selected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => navigateToEvents(d.label)}
                  data-testid={`card-domain-${d.label.slice(0,8)}`}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                      {d.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{d.label}</div>
                      <div className="text-xs text-muted-foreground">Click to see NGO courses</div>
                    </div>
                    <Button
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleDomain(d.label); }}
                    >
                      {selected ? "Selected" : "Select"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-background border rounded-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 text-sm text-muted-foreground">
              {selectedDomains.length === 0 ? "Select at least one interest" : `Selected: ${selectedDomains.join(", ")}`}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigateToEvents()}
                disabled={selectedDomains.length === 0}
                className="gap-2"
                data-testid="button-explore-events"
              >
                Explore Courses
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigateToSchemes()}
                disabled={selectedDomains.length === 0}
                className="gap-2"
                data-testid="button-explore-schemes"
              >
                Explore Schemes
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Everything You Need to Grow
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete platform connecting you to opportunities, skills, and support systems.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Start your journey in just a few simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-1/2 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                <Lock className="h-4 w-4" />
                Your Privacy Matters
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
                Built with Trust & Safety
              </h2>
              <p className="text-muted-foreground mb-8">
                We are committed to protecting your privacy. EmpowerHer is a guidance platform — 
                we connect you to opportunities, not collect your data.
              </p>
              <ul className="space-y-4">
                {trustFeatures.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of women who have discovered new paths to success through our platform.
          </p>
          <Link href="/auth">
            <Button size="lg" className="gap-2" data-testid="button-cta-start">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                <span className="font-semibold text-lg">EmpowerHer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering women through AI-powered career guidance and trusted connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/events">Events & Courses</Link></li>
                <li><Link href="/schemes">Government Schemes</Link></li>
                <li><Link href="/auth">Get Guidance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For NGOs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/ngo/register">Register</Link></li>
                <li><Link href="/ngo/login">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            2024 EmpowerHer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
