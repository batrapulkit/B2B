import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-8 bg-background">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">Sidebar Navigation</h2>
            <p className="text-muted-foreground">This is the main navigation sidebar for the Triponic platform.</p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
