
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Tag, Check, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCategoryColor } from "@/lib/category-colors";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  category: string | null;
  reminder: boolean;
  completed?: boolean;
  completed_at?: string | null;
}

interface EventListProps {
  events: Event[];
  loading: boolean;
  onEventDeleted: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

const EventList = ({ events, loading, onEventDeleted, isOpen, onToggleSidebar }: EventListProps) => {
  const getCategoryStats = () => {
    return events.reduce((acc, event) => {
      const cat = event.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event deleted successfully");
      onEventDeleted();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleToggleComplete = async (event: Event) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("events")
        .update({
          completed: !event.completed,
          completed_at: !event.completed ? now : null
        })
        .eq("id", event.id);

      if (error) throw error;
      toast.success(event.completed ? "Event marked as incomplete" : "Event marked as complete");
      onEventDeleted(); 
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error("Failed to update event");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleSidebar()}
            className="h-8 w-8"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold">{events.length}</span>
          <span className="text-muted-foreground">Total Events</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Category Statistics */}
        <div className="mb-6 space-y-3">
          {Object.entries(getCategoryStats()).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full ring-1 ring-black/10"
                  style={{
                    backgroundColor: getCategoryColor(category === 'Uncategorized' ? null : category, [])
                  }}
                />
                <span className="text-sm">{category}</span>
              </div>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-4 text-muted-foreground">
              No events this month
            </div>
            
            {/* Event Statistics */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="text-sm font-medium">Event Statistics</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{events.length}</span>
                <span className="text-muted-foreground text-sm">Total Events</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Categories</div>
                {Object.entries(events.reduce((acc, event) => {
                  const cat = event.category || 'Uncategorized';
                  acc[cat] = (acc[cat] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: cat === 'Uncategorized' ? '#6b7280' : 
                            getCategoryColor(cat, []),
                          border: '2px solid white',
                          boxShadow: '0 0 0 1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <span className="text-sm">{cat}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
                              <div
                key={event.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${event.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {event.title}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.date)}
                        {event.time && ` • ${formatTime(event.time)}`}
                      </span>
                      {event.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {event.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        event.completed 
                        ? 'text-primary hover:text-primary hover:bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                      }`}
                      onClick={() => handleToggleComplete(event)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventList;
