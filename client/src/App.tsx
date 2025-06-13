import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import Leads from "@/pages/leads";
import Scheduling from "@/pages/scheduling";
import Feedback from "@/pages/feedback";
import Performance from "@/pages/performance";
import Profile from "@/pages/profile";
import Import from "@/pages/import";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const isLoginPage = location === '/login';
  const isAuthenticated = localStorage.getItem('auth_token');

  // Redirect to login if not authenticated and not already on login page
  if (!isAuthenticated && !isLoginPage) {
    return (
      <Switch>
        <Route path="*" component={() => {
          window.location.href = '/login';
          return null;
        }} />
      </Switch>
    );
  }

  // Show login page without navigation
  if (isLoginPage) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
      </Switch>
    );
  }

  // Show authenticated app with navigation
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/properties" component={Properties} />
          <Route path="/leads" component={Leads} />
          <Route path="/scheduling" component={Scheduling} />
          <Route path="/feedback" component={Feedback} />
          <Route path="/performance" component={Performance} />
          <Route path="/profile" component={Profile} />
          <Route path="/import" component={Import} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
