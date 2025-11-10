import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SignedIn, SignedOut, RedirectToSignIn, useClerk, useUser } from "@clerk/clerk-react";

// Pages
import Dashboard from "@/pages/Dashboard";
import CRMPage from "@/pages/CRMPage";
import InvoicesPage from "@/pages/InvoicesPage";
import AIPlannerPage from "@/pages/AIPlannerPage";
import ItinerariesPage from "@/pages/ItinerariesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import SignInPage from "@/pages/SignIn";
import SignUpPage from "@/pages/SignUp";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// ---------------- Protected Route ----------------
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/signin" />
      </SignedOut>
    </>
  );
}

// ---------------- Main Layout ----------------
function MainLayout() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          {/* Header */}
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
                  <span className="font-medium">
                    {user.fullName || user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut(() => (window.location.href = "/signin"))}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          {/* Inner Routes */}
          <main className="flex-1 overflow-auto p-8 bg-background">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/planner" component={AIPlannerPage} />
              <Route path="/itineraries" component={ItinerariesPage} />
              <Route path="/clients" component={CRMPage} />
              <Route path="/invoices" component={InvoicesPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// ---------------- App Root ----------------
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={Home} />
          <Route path="/signin" component={SignInPage} />
          <Route path="/signup" component={SignUpPage} />

          {/* Protected Section */}
          <Route path="*">
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          </Route>

          {/* 404 Fallback */}
          <Route component={NotFound} />
        </Switch>

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
