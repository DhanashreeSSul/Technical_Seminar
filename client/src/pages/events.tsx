import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink,
  Filter,
  Globe
} from "lucide-react";
import type { Event } from "@shared/schema";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "course", label: "Courses" },
  { value: "workshop", label: "Workshops" },
  { value: "job", label: "Job Opportunities" },
  { value: "awareness", label: "Awareness Programs" },
];

const modes = [
  { value: "all", label: "All Modes" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];

const states = [
  { value: "all", label: "All States" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Delhi", label: "Delhi" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "West Bengal", label: "West Bengal" },
];

export default function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const [state, setState] = useState("all");

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", { category, mode, state, search }],
  });

  const filteredEvents = events?.filter(event => {
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all" && event.category !== category) return false;
    if (mode !== "all" && event.mode !== mode) return false;
    if (state !== "all" && event.state !== state) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Discover Opportunities
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore courses, workshops, job opportunities, and awareness programs from our partner NGOs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-events"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[160px]" data-testid="select-category">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="w-[140px]" data-testid="select-mode">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="w-[160px]" data-testid="select-state">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents?.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Card key={event.id} className="flex flex-col hover-elevate" data-testid={`card-event-${event.id}`}>
                {event.flyerUrl && (
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img 
                      src={event.flyerUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{event.category}</Badge>
                    <Badge variant="outline">{event.mode}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.startDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {event.targetAudience && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.targetAudience}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 gap-2">
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" data-testid={`button-view-event-${event.id}`}>
                      View Details
                    </Button>
                  </Link>
                  {event.websiteLink && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={event.websiteLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new opportunities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
