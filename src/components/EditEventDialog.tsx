import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
  category: string | null;
  reminder: boolean;
}

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onEventUpdated: () => void;
}

const EditEventDialog = ({ open, onOpenChange, event, onEventUpdated }: EditEventDialogProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [reminder, setReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setTime(event.time || "");
      setCategory(event.category || "");
      setReminder(event.reminder);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("events")
        .update({
          title: title.trim(),
          date,
          time: time || null,
          category: category || null,
          reminder,
        })
        .eq("id", event.id);

      if (error) throw error;

      toast.success("Event updated successfully!");
      onEventUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Work", "Personal", "Meeting", "Appointment", "Other"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Event Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Date *</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-time">Time</Label>
            <Input
              id="edit-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-reminder">Enable Reminder</Label>
            <Switch
              id="edit-reminder"
              checked={reminder}
              onCheckedChange={setReminder}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
