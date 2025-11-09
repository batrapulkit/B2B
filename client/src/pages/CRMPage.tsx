import { ClientListTable } from "@/components/ClientListTable";
import { useQuery } from "@tanstack/react-query";

export default function CRMPage() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const formattedClients = clients?.map((client: any) => ({
    ...client,
    trips: 0,
    revenue: "$0",
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">CRM & Client Management</h1>
        <p className="text-muted-foreground mt-1">Manage your clients, leads, and corporate accounts.</p>
      </div>

      {isLoading ? (
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      ) : (
        <ClientListTable
          clients={formattedClients}
          onClientClick={(id) => console.log('Navigate to client:', id)}
        />
      )}
    </div>
  );
}
