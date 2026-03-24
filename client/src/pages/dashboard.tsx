import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import {
  MessageSquare,
  Calendar,
  Bookmark,
  User,
  Target,
  CheckCircle,
  Clock,
  ArrowRight,
  LogOut,
  MapPin,
  Sparkles
} from "lucide-react";
import type { Event, Roadmap } from "@shared/schema";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user || user.type !== "user") {
    navigate("/auth");
    return null;
  }

  const userData = user.data;

  const { data: roadmaps } = useQuery<Roadmap[]>({
    queryKey: ["/api/user/roadmaps"],
  });

  const { data: savedEvents } = useQuery<Event[]>({
    queryKey: ["/api/user/saved-events"],
  });

  const { data: recommendations } = useQuery<Event[]>({
    queryKey: ["/api/user/recommendations"],
  });

  const currentRoadmap = roadmaps?.[0];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
              Welcome back, {userData.name || "there"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Continue your journey to success
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/chatbot">
              <Button className="gap-2" data-testid="button-open-chatbot">
                <MessageSquare className="h-4 w-4" />
                AI Guidance
              </Button>
            </Link>
            <Button variant="outline" onClick={() => { logout(); navigate("/"); }} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile</p>
                  <p className="font-semibold">{userData.name || "Complete Profile"}</p>
                </div>
              </div>
              {userData.location && (
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {userData.location}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Goal</p>
                  <p className="font-semibold">{currentRoadmap?.goal || "Set a goal"}</p>
                </div>
              </div>
              {currentRoadmap && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{currentRoadmap.progress}%</span>
                  </div>
                  <Progress value={currentRoadmap.progress || 0} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <Bookmark className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saved</p>
                  <p className="font-semibold">{savedEvents?.length || 0} Opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="roadmap" data-testid="tab-roadmap">My Roadmap</TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved">Saved</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recommended for You
                  </CardTitle>
                  <CardDescription>Based on your interests and goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations?.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                          <span className="text-xs text-muted-foreground">{event.mode}</span>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button size="icon" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )) || (
                      <p className="text-muted-foreground text-center py-4">
                        Chat with our AI to get personalized recommendations
                      </p>
                    )}
                  <Link href="/events">
                    <Button variant="outline" className="w-full" data-testid="button-view-all-events">
                      View All Events
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-chart-2" />
                    AI Career Guidance
                  </CardTitle>
                  <CardDescription>Get personalized advice in Hindi or English</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border">
                    <p className="text-sm mb-4">
                      Our AI assistant can help you:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Find the right career path
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Discover skill-building courses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Learn about government schemes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Create a personalized roadmap
                      </li>
                    </ul>
                  </div>
                  <Link href="/chatbot">
                    <Button className="w-full gap-2" data-testid="button-start-chat">
                      <MessageSquare className="h-4 w-4" />
                      Start Conversation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Link href="/jobs">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="font-medium">Browse Jobs</p>
                      <p className="text-xs text-muted-foreground">Find work matching your skills</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/training">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-chart-5" />
                    </div>
                    <div>
                      <p className="font-medium">Training Courses</p>
                      <p className="text-xs text-muted-foreground">Free & certified courses</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/schemes">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="font-medium">Government Schemes</p>
                      <p className="text-xs text-muted-foreground">Schemes for women empowerment</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="roadmap">
            <Card>
              <CardHeader>
                <CardTitle>Your Career Roadmap</CardTitle>
                <CardDescription>
                  {currentRoadmap
                    ? `${currentRoadmap.title} - ${currentRoadmap.progress}% complete`
                    : "Chat with our AI to create your personalized roadmap"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentRoadmap ? (
                  <div className="space-y-6">
                    {(currentRoadmap.weeks as any[])?.map((week: any, index: number) => (
                      <div key={index} className="relative pl-8 pb-6 last:pb-0">
                        <div className="absolute left-0 top-0 h-full w-px bg-border" />
                        <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary -translate-x-[3px]" />
                        <div className="space-y-2">
                          <h4 className="font-semibold">Week {week.week}: {week.title}</h4>
                          <ul className="space-y-2">
                            {week.tasks?.map((task: any) => (
                              <li key={task.id} className="flex items-center gap-2 text-sm">
                                {task.completed ? (
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                  {task.task}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You don't have a roadmap yet. Chat with our AI to create one based on your goals.
                    </p>
                    <Link href="/chatbot">
                      <Button data-testid="button-create-roadmap">Create My Roadmap</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Opportunities</CardTitle>
                <CardDescription>Events and courses you've bookmarked</CardDescription>
              </CardHeader>
              <CardContent>
                {savedEvents?.length ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedEvents.map((event) => (
                      <div key={event.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="secondary">{event.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {event.description}
                        </p>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't saved any opportunities yet.
                    </p>
                    <Link href="/events">
                      <Button data-testid="button-browse-events">Browse Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{userData.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{userData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{userData.location || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Language</p>
                    <p className="font-medium">{userData.language === "hi" ? "Hindi" : "English"}</p>
                  </div>
                </div>
                {Array.isArray(userData.interests) && userData.interests.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(userData.interests) && userData.interests.map((interest) => (
                        <Badge key={interest} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
