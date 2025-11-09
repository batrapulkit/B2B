import AIPlannerPage from '../AIPlannerPage';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AIPlannerPageExample() {
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
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="text-sm text-muted-foreground">AI Planner View</div>
          </header>
          <main className="flex-1 overflow-auto p-8 bg-background">
            <AIPlannerPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
