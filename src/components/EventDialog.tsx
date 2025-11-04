import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCategoryColor } from "@/lib/category-colors";

interface CustomCategory {
  id: string;
  name: string;
  color: string;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onEventAdded: () => void;
}

const EventDialog = ({ open, onOpenChange, selectedDate, onEventAdded }: EventDialogProps) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [reminder, setReminder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setTime("");
      setCategory("");
      setReminder(false);
    }
  }, [open]);

  useEffect(() => {
    const fetchCustomCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_categories")
          .select("*")
          .order("name");
        
        if (error) throw error;
        setCustomCategories(data || []);
      } catch (error: Error) {
        toast.error("Failed to load custom categories");
      }
    };

    if (open) {
      fetchCustomCategories();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to add events");
        return;
      }

      const { error } = await supabase.from("events").insert({
        user_id: user.id,
        title: title.trim(),
        date: selectedDate.toISOString().split("T")[0],
        time: time || null,
        category: category || null,
        reminder,
      });

      if (error) throw error;

      toast.success("Event added successfully!");
      onEventAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add event");
    } finally {
      setLoading(false);
    }
  };

    const defaultCategories = ["Work", "Personal", "Meeting", "Appointment", "Other"];
  const allCategories = [...defaultCategories, ...customCategories.map(cc => cc.name)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add Event
            {selectedDate && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => {
                  const customCat = customCategories.find(cc => cc.name === cat);
                  const color = customCat ? customCat.color : getCategoryColor(cat, customCategories);
                  return (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: color }} 
                        />
                        {cat}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="reminder">Enable Reminder</Label>
            <Switch
              id="reminder"
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
              {loading ? "Adding..." : "Add Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
