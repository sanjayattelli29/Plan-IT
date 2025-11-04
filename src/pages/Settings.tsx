import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserPreferences {
  theme: string;
  notifications_enabled: boolean;
  default_view: string;
}

interface CustomCategory {
  id: string;
  name: string;
  color: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    notifications_enabled: true,
    default_view: "calendar",
  });
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(true);

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
      fetchPreferences();
      fetchCategories();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setPreferences(data);
      }
    } catch (error: any) {
      console.error("Error fetching preferences");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error("Failed to load categories");
    }
  };

  const savePreferences = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: currentUser.id,
          ...preferences,
        });

      if (error) throw error;
      toast.success("Preferences saved");
    } catch (error: any) {
      toast.error("Failed to save preferences");
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error } = await supabase.from("custom_categories").insert({
        user_id: currentUser.id,
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });

      if (error) throw error;
      toast.success("Category added");
      setNewCategoryName("");
      setNewCategoryColor("#3b82f6");
      fetchCategories();
    } catch (error: any) {
      toast.error("Failed to add category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Category deleted");
      fetchCategories();
    } catch (error: any) {
      toast.error("Failed to delete category");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} currentPage="settings" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and categories</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={user.email || ""} disabled className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, theme: value })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select
                  value={preferences.default_view}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, default_view: value })
                  }
                >
                  <SelectTrigger id="default-view">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="reminders">Reminders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders for upcoming events
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences.notifications_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notifications_enabled: checked })
                  }
                />
              </div>

              <Button onClick={savePreferences}>Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Categories</CardTitle>
              <CardDescription>Create custom categories for your events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <Input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-20"
                />
                <Button onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No custom categories yet
                  </p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-6 w-6 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
