import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/header";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Chatbot from "@/pages/chatbot";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Jobs from "@/pages/jobs";
import Training from "@/pages/training";
import NgoRegister from "@/pages/ngo-register";
import NgoLogin from "@/pages/ngo-login";
import NgoDashboard from "@/pages/ngo-dashboard";
import Schemes from "@/pages/schemes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chatbot" component={Chatbot} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/training" component={Training} />
      <Route path="/schemes" component={Schemes} />
      <Route path="/ngo/register" component={NgoRegister} />
      <Route path="/ngo/login" component={NgoLogin} />
      <Route path="/ngo/dashboard" component={NgoDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Header />
              <Router />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
