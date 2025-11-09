import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import CRMPage from "@/pages/CRMPage";
import InvoicesPage from "@/pages/InvoicesPage";
import AIPlannerPage from "@/pages/AIPlannerPage";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home"; // ✅ create a simple home
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.FC }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Component /> : <Redirect to="/signin" />;
}

function MainLayout() {
  const { user } = useAuth();

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="text-sm text-muted-foreground">
                Triponic Enterprise Platform
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Welcome, </span>
                  <span className="font-medium">{user.firstName || user.email}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/signout'}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8 bg-background">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/planner" component={AIPlannerPage} />
              <Route path="/clients" component={CRMPage} />
              <Route path="/invoices" component={InvoicesPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* ✅ Public routes */}
          <Route path="/" component={Home} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />

          {/* ✅ Protected area */}
          <Route path="/dashboard" component={() => <ProtectedRoute component={MainLayout} />} />

          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
