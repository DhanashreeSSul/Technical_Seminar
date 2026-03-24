import { useRoute, Link, useLocation } from "wouter";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Clock,
  Building2,
  Globe
} from "lucide-react";
import type { Event, Ngo } from "@shared/schema";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery<Event & { ngo: Ngo }>({
    queryKey: ["/api/events", params?.id],
    enabled: !!params?.id,
  });

  const localEvent = useMemo(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("local_events") : null;
    const all = raw ? (JSON.parse(raw) as Event[]) : [];
    return all.find(e => e.id === params?.id);
  }, [params?.id]);
  const ev = event || localEvent;
  const ngo = (event as any)?.ngo as Ngo | undefined;

  const { data: savedStatus } = useQuery<{ saved: boolean }>({
    queryKey: ["/api/user/saved-events", params?.id],
    enabled: !!user && !!params?.id,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        savedStatus?.saved ? "DELETE" : "POST",
        `/api/user/saved-events/${params?.id}`
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-events"] });
      toast({
        title: savedStatus?.saved ? "Removed from saved" : "Saved!",
        description: savedStatus?.saved 
          ? "Event removed from your saved list"
          : "Event added to your saved list",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-6 rounded-lg" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Event not found</h3>
            <p className="text-muted-foreground mb-4">
              This event may have been removed or doesn't exist.
            </p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/events">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back-events">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        {ev.flyerUrl && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
            <img 
              src={ev.flyerUrl} 
              alt={ev.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              {ev.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{ev.category}</Badge>
              <Badge variant="outline">{ev.mode}</Badge>
              {Boolean(ev.active) && <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {user && (
              <Button
                variant="outline"
                onClick={() => toggleSaveMutation.mutate()}
                disabled={toggleSaveMutation.isPending}
                className="gap-2"
                data-testid="button-save-event"
              >
                {savedStatus?.saved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            )}
            {ev.registrationLink && (
              <Button asChild data-testid="button-register-event">
                <a href={ev.registrationLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Register Now
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About this Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {ev.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {Array.isArray(ev.skillsRequired) && ev.skillsRequired.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                {Array.isArray(ev.skillsRequired) && ev.skillsRequired.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ev.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ev.startDate).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {ev.endDate && ev.endDate !== ev.startDate && (
                          <> - {new Date(ev.endDate).toLocaleDateString("en-IN", {
                            month: "long",
                            day: "numeric",
                          })}</>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {ev.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {ev.location}
                        {ev.state && `, ${ev.state}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Mode</p>
                    <p className="text-sm text-muted-foreground capitalize">{ev.mode}</p>
                  </div>
                </div>

                {ev.targetAudience && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Target Audience</p>
                      <p className="text-sm text-muted-foreground">{ev.targetAudience}</p>
                    </div>
                  </div>
                )}

                {ev.websiteLink && (
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a 
                        href={ev.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {ngo && (
              <Card>
                <CardHeader>
                  <CardTitle>Organized by</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{ngo.name}</p>
                      {ngo.state && (
                        <p className="text-sm text-muted-foreground">{ngo.state}</p>
                      )}
                      {ngo.verified && (
                        <Badge variant="secondary" className="mt-2 text-xs">Verified NGO</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
