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

          <div className="mt-32 max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">About the Developer</h2>
              <div className="flex justify-center space-x-4 mb-8">
                <Button variant="outline" size="lg" onClick={() => window.open('https://linkedin.com/in/attelli-sanjay-kumar', '_blank')}>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.open('https://github.com/sanjayattelli29', '_blank')}>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  GitHub
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.open('https://designwithsanjay2.netlify.app', '_blank')}>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21l-8-8 8-8 8 8-8 8z"/>
                  </svg>
                  Portfolio
                </Button>
              </div>

              <div className="bg-card border rounded-xl p-8 text-left space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">ATTELLI SANJAY KUMAR</h3>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <a href="mailto:attellisanjay29@gmail.com" className="flex items-center hover:text-primary">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      attellisanjay29@gmail.com
                    </a>
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      +91 8919200290
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Quick Summary</h4>
                  <p className="text-muted-foreground">
                    Passionate Software Developer skilled in Python, Data Structures and Algorithms. Interested in building scalable SaaS
                    and Gen AI applications with a focus on problem-solving and efficiency.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Education</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium">VNR VJIET Engineering College</h5>
                      <p className="text-muted-foreground">Bachelor of Technology - Information Technology • CGPA: 8.51</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Sri Chaitanya Intermediate College</h5>
                      <p className="text-muted-foreground">Higher Secondary Education - MPC • CGPA: 9.31</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Sri Chaitanya School</h5>
                      <p className="text-muted-foreground">Secondary School Education - SSC • CGPA: 10</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
