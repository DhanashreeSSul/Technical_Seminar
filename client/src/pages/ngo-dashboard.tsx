import React, { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Plus, 
  Calendar, 
  Eye, 
  MousePointer,
  Edit,
  Trash2,
  LogOut,
  Building2,
  CheckCircle,
  Clock,
  Globe
} from "lucide-react";
import type { Event, Ngo } from "@shared/schema";

type EventFormState = {
  title: string;
  description: string;
  category: string;
  domain: string;
  mode: string;
  location: string;
  state: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  registrationLink: string;
  websiteLink: string;
  skillsRequired: string;
};

function EventFormContent({
  eventForm,
  setEventForm,
  onSubmit,
  isSubmitting,
}: {
  eventForm: EventFormState;
  setEventForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={eventForm.title}
            onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
            required
            data-testid="input-event-title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={eventForm.category} onValueChange={(v) => setEventForm(prev => ({ ...prev, category: v }))}>
            <SelectTrigger data-testid="select-event-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Select value={eventForm.domain} onValueChange={(v) => setEventForm(prev => ({ ...prev, domain: v }))}>
          <SelectTrigger data-testid="select-event-domain">
            <SelectValue placeholder="Select domain (optional)" />
          </SelectTrigger>
          <SelectContent>
            {domains.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={eventForm.description}
          onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          data-testid="input-event-description"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mode">Mode *</Label>
          <Select value={eventForm.mode} onValueChange={(v) => setEventForm(prev => ({ ...prev, mode: v }))}>
            <SelectTrigger data-testid="select-event-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.map(m => (
                <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={eventForm.location}
            onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City or venue"
            data-testid="input-event-location"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={eventForm.state}
            onChange={(e) => setEventForm(prev => ({ ...prev, state: e.target.value }))}
            data-testid="input-event-state"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={eventForm.startDate}
            onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
            data-testid="input-event-start-date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={eventForm.endDate}
            onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
            data-testid="input-event-end-date"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target Audience</Label>
        <Input
          id="targetAudience"
          value={eventForm.targetAudience}
          onChange={(e) => setEventForm(prev => ({ ...prev, targetAudience: e.target.value }))}
          placeholder="e.g., Women aged 18-35, Students"
          data-testid="input-event-audience"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skillsRequired">Skills Required (comma-separated)</Label>
        <Input
          id="skillsRequired"
          value={eventForm.skillsRequired}
          onChange={(e) => setEventForm(prev => ({ ...prev, skillsRequired: e.target.value }))}
          placeholder="e.g., Basic computer, English"
          data-testid="input-event-skills"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registrationLink">Registration Link</Label>
          <Input
            id="registrationLink"
            type="url"
            value={eventForm.registrationLink}
            onChange={(e) => setEventForm(prev => ({ ...prev, registrationLink: e.target.value }))}
            placeholder="https://..."
            data-testid="input-event-registration-link"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteLink">Website Link</Label>
          <Input
            id="websiteLink"
            type="url"
            value={eventForm.websiteLink}
            onChange={(e) => setEventForm(prev => ({ ...prev, websiteLink: e.target.value }))}
            placeholder="https://..."
            data-testid="input-event-website-link"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting} data-testid="button-save-event">
          Create Event
        </Button>
      </DialogFooter>
    </form>
  );
}

const categories = ["course", "workshop", "job", "awareness"];
const modes = ["online", "offline", "hybrid"];
const domains = [
  "Handicrafts",
  "Tailoring & Fashion",
  "Digital Skills",
  "Cooking & Food",
  "Agriculture",
  "Business & Entrepreneurship",
  "Healthcare & Wellness",
  "Languages & Communication",
  "Accounting & Finance",
  "Education & Training",
];

export default function NgoDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    category: "course",
    domain: "",
    mode: "online",
    location: "",
    state: "",
    targetAudience: "",
    startDate: "",
    endDate: "",
    registrationLink: "",
    websiteLink: "",
    skillsRequired: "",
  });

  if (!user || user.type !== "ngo") {
    navigate("/ngo/login");
    return null;
  }

  const ngoData = user.data as Ngo;

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/ngo/events"],
  });

  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const combinedEvents = (events || []).concat(localEvents);

  const RecentEventsList = React.memo(function RecentEventsList({ events }: { events: Event[] }) {
    return (
      <div className="space-y-4">
        {events.slice(0, 5).map(event => (
          <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{event.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                  <span className="text-xs text-muted-foreground">{event.mode}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {event.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <MousePointer className="h-4 w-4" />
                {event.clicks || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  });

  const AllEventsList = React.memo(function AllEventsList({
    events,
    onEdit,
    onDelete,
  }: {
    events: Event[];
    onEdit: (event: Event) => void;
    onDelete: (id: string) => void;
  }) {
    return (
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{event.title}</p>
                {!event.active && <Badge variant="outline">Inactive</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                <span>{event.mode}</span>
                {event.location && <span>{event.location}</span>}
                {event.websiteLink && (
                  <a href={event.websiteLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <Globe className="h-3 w-3" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/ngo/events", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ngo/events"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Event Created", description: "Your event has been published." });
    },
    onError: () => {
      const fallbackEvent: Event = {
        id: "dev-evt-" + Math.random().toString(36).slice(2),
        ngoId: ngoData.id,
        title: eventForm.title,
        description: eventForm.description || "",
        category: eventForm.category,
        mode: eventForm.mode,
        location: eventForm.location || "",
        state: eventForm.state || "",
        skillsRequired: (() => {
          const skills = eventForm.skillsRequired ? eventForm.skillsRequired.split(",").map(s => s.trim()).filter(Boolean) : [];
          return eventForm.domain ? Array.from(new Set([eventForm.domain, ...skills])) : skills;
        })(),
        targetAudience: eventForm.targetAudience || "",
        startDate: eventForm.startDate ? new Date(eventForm.startDate) : null,
        endDate: eventForm.endDate ? new Date(eventForm.endDate) : null,
        registrationLink: eventForm.registrationLink || "",
        websiteLink: eventForm.websiteLink || "",
        flyerUrl: "",
        views: 0,
        clicks: 0,
        active: true,
        createdAt: new Date() as any,
      } as Event;

      setLocalEvents(prev => [fallbackEvent, ...prev]);
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Event Created (Local)", description: "Backend unreachable; saved locally for now." });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/ngo/events/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ngo/events"] });
      setEditingEvent(null);
      resetForm();
      toast({ title: "Event Updated", description: "Your changes have been saved." });
    },
    onError: ({ id, data }: any) => {
      setLocalEvents(prev => prev.map(e => e.id === id ? {
        ...e,
        ...data,
        startDate: data.startDate ?? e.startDate,
        endDate: data.endDate ?? e.endDate,
        skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired : e.skillsRequired,
      } : e));
      setEditingEvent(null);
      resetForm();
      toast({ title: "Event Updated (Local)", description: "Backend unreachable; changes saved locally." });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/ngo/events/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ngo/events"] });
      toast({ title: "Event Deleted", description: "The event has been removed." });
    },
    onError: (id: any) => {
      setLocalEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: "Event Deleted (Local)", description: "Backend unreachable; removed locally." });
    },
  });

  const resetForm = () => {
    setEventForm({
      title: "",
      description: "",
      category: "course",
      domain: "",
      mode: "online",
      location: "",
      state: "",
      targetAudience: "",
      startDate: "",
      endDate: "",
      registrationLink: "",
      websiteLink: "",
      skillsRequired: "",
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      category: event.category,
      domain: Array.isArray(event.skillsRequired) ? (domains.find(d => event.skillsRequired?.includes(d)) || "") : "",
      mode: event.mode,
      location: event.location || "",
      state: event.state || "",
      targetAudience: event.targetAudience || "",
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
      registrationLink: event.registrationLink || "",
      websiteLink: event.websiteLink || "",
      skillsRequired: event.skillsRequired?.join(", ") || "",
    });
  };

  const onEditEvent = useCallback((event: Event) => handleEditEvent(event), []);
  const onDeleteEvent = useCallback((id: string) => deleteEventMutation.mutate(id), [deleteEventMutation]);

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = eventForm.skillsRequired ? eventForm.skillsRequired.split(",").map(s => s.trim()).filter(Boolean) : [];
    const data = {
      ...eventForm,
      skillsRequired: eventForm.domain ? Array.from(new Set([eventForm.domain, ...skills])) : skills,
      startDate: eventForm.startDate ? new Date(eventForm.startDate) : null,
      endDate: eventForm.endDate ? new Date(eventForm.endDate) : null,
    };

    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const totalViews = combinedEvents.reduce((sum, e) => sum + (e.views || 0), 0);
  const totalClicks = combinedEvents.reduce((sum, e) => sum + (e.clicks || 0), 0);
  const activeEvents = combinedEvents.filter(e => e.active).length;

  

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                {ngoData.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {ngoData.verified ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-create-event">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Add a new course, workshop, job opportunity, or awareness program.
                  </DialogDescription>
                </DialogHeader>
                <EventFormContent 
                  eventForm={eventForm}
                  setEventForm={setEventForm}
                  onSubmit={handleSubmitEvent}
                  isSubmitting={!eventForm.title || createEventMutation.isPending || updateEventMutation.isPending}
                />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => { logout(); navigate("/"); }} data-testid="button-ngo-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{events?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeEvents}</p>
                  <p className="text-sm text-muted-foreground">Active Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalViews}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <MousePointer className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-ngo-overview">Overview</TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-ngo-events">Manage Events</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-ngo-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Your latest events and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                {combinedEvents.length ? (
                  <RecentEventsList events={combinedEvents} />
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No events yet. Create your first event to get started.</p>
                    <Button onClick={() => setIsCreateOpen(true)}>Create Event</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>Manage your courses, workshops, and programs</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {combinedEvents.length ? (
                  <AllEventsList events={combinedEvents} onEdit={onEditEvent} onDelete={onDeleteEvent} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No events created yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>Your NGO details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Organization Name</p>
                    <p className="font-medium">{ngoData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="font-medium">{ngoData.registrationNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{ngoData.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{ngoData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{ngoData.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{ngoData.district ? `${ngoData.district}, ` : ""}{ngoData.state}</p>
                  </div>
                  {ngoData.website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a href={ngoData.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                        {ngoData.website}
                      </a>
                    </div>
                  )}
                </div>
                {ngoData.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">About</p>
                    <p className="font-medium">{ngoData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update your event details.</DialogDescription>
            </DialogHeader>
            <EventFormContent 
              eventForm={eventForm}
              setEventForm={setEventForm}
              onSubmit={handleSubmitEvent}
              isSubmitting={!eventForm.title || createEventMutation.isPending || updateEventMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
