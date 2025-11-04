import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Tag, Trash2, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "@supabase/supabase-js";
import EventDialog from "./EventDialog";
import EventList from "./EventList";
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

interface CalendarViewProps {
  user: User | null;
}

const CalendarView = ({ user }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", startOfMonth.toISOString().split("T")[0])
        .lte("date", endOfMonth.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to load events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDateEvents = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateStr);
  };

  const hasEvent = (date: Date | null) => {
    return getDateEvents(date).length > 0;
  };

  const getEventIndicatorColor = (date: Date | null) => {
    if (!date) return null;
    const dateEvents = getDateEvents(date);
    if (dateEvents.length === 0) return null;
    
    const category = dateEvents[0].category;
    return getCategoryColor(category, []);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setIsEventDialogOpen(true);
    }
  };

  const handleEventAdded = () => {
    fetchEvents();
  };

  const handleEventDeleted = () => {
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event deleted successfully");
      fetchEvents();
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
      fetchEvents();
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error("Failed to update event");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      month: "long",
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

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`
            );
            const data = await response.json();
            if (data.results?.[0]?.components?.city) {
              setUserLocation(data.results[0].components.city);
            }
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span>{currentTime.toLocaleDateString([], { 
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</span>
            {userLocation && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{userLocation}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => handleDateClick(new Date())}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthYear}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-medium text-sm text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`
                        w-full aspect-square p-1 rounded-lg text-sm transition-colors border group relative
                        ${!day ? "invisible" : ""}
                        ${isToday(day) ? "bg-primary/10 text-primary font-bold border-2 border-primary" : "border-gray-200 hover:bg-muted dark:border-gray-800"}
                        ${hasEvent(day) && !isToday(day) ? "bg-accent/5 font-medium" : ""}
                        overflow-hidden
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <button
                          onClick={() => handleDateClick(day)}
                          disabled={!day}
                          className="text-left p-1 hover:bg-transparent"
                        >
                          {day?.getDate()}
                        </button>
                        {day && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDateClick(day);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {day && (
                        <div className="space-y-1 max-h-12 overflow-hidden text-xs">
                          {getDateEvents(day).slice(0, 2).map((event) => (
                            <Popover key={event.id}>
                              <PopoverTrigger asChild>
                                <div
                                  className="px-1 py-0.5 rounded truncate cursor-pointer hover:ring-1 hover:ring-primary"
                                  style={{
                                    backgroundColor: `${getCategoryColor(event.category, [])}20`,
                                    color: getCategoryColor(event.category, [])
                                  }}
                                >
                                  {event.title}
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="start">
                                <div className="space-y-2">
                                  <h4 className="font-medium">{event.title}</h4>
                                  <div className="text-xs space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {formatDate(event.date)}
                                        {event.time && ` • ${formatTime(event.time)}`}
                                      </span>
                                    </div>
                                    {event.category && (
                                      <div className="flex items-center gap-2">
                                        <Tag className="h-3 w-3" />
                                        <span>{event.category}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 pt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleDelete(event.id)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={event.completed ? 'text-primary' : ''}
                                      onClick={() => handleToggleComplete(event)}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      {event.completed ? 'Completed' : 'Mark Complete'}
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ))}
                          {getDateEvents(day).length > 2 && (
                            <div className="text-xs text-muted-foreground px-1">
                              +{getDateEvents(day).length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className={`transition-all duration-300 ${
          isSidebarOpen ? 'w-96 opacity-100' : 'w-0 opacity-0'
        } overflow-hidden`}>
          <div className={`w-96`}>
            <EventList
              events={events}
              loading={loading}
              onEventDeleted={handleEventDeleted}
              isOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </div>
        </div>
      </div>

      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        selectedDate={selectedDate}
        onEventAdded={handleEventAdded}
      />
    </div>
  );
};

export default CalendarView;
