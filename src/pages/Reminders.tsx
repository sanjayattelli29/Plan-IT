import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import ReminderDialog from "@/components/ReminderDialog";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
  completed: boolean;
  priority: string | null;
}

const Reminders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error: any) {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({
          completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
      fetchReminders();
      toast.success(!completed ? "Reminder completed!" : "Reminder marked incomplete");
    } catch (error: any) {
      toast.error("Failed to update reminder");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
      toast.success("Reminder deleted");
      fetchReminders();
    } catch (error: any) {
      toast.error("Failed to delete reminder");
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

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const activeReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} currentPage="reminders" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Reminders</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Reminders ({activeReminders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : activeReminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active reminders
                </div>
              ) : (
                <div className="space-y-3">
                  {activeReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={reminder.completed}
                          onCheckedChange={() =>
                            toggleComplete(reminder.id, reminder.completed)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold">{reminder.title}</h3>
                            {reminder.priority && (
                              <Badge variant={getPriorityColor(reminder.priority)}>
                                {reminder.priority}
                              </Badge>
                            )}
                          </div>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDate(reminder.due_date)}
                            {reminder.due_time && ` • ${formatTime(reminder.due_time)}`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {completedReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed ({completedReminders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-4 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={reminder.completed}
                          onCheckedChange={() =>
                            toggleComplete(reminder.id, reminder.completed)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-through text-muted-foreground">
                            {reminder.title}
                          </h3>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground line-through">
                              {reminder.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <ReminderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onReminderAdded={fetchReminders}
      />
    </div>
  );
};

export default Reminders;
