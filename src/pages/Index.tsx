import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">TimeScape</span>
          </div>
          <Button onClick={() => navigate("/auth")}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </nav>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Manage Your Time,
            <br />
            <span className="text-primary">Effortlessly</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            TimeScape is your calendar-based productivity companion. Schedule events, set reminders, and stay organized with an intuitive interface.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Calendar</h3>
              <p className="text-muted-foreground">
                View your schedule at a glance with our intuitive monthly calendar view
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Event Management</h3>
              <p className="text-muted-foreground">
                Add, edit, and organize events with customizable categories and times
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Never miss an important event with customizable reminder notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
