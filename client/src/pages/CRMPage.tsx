import { ClientListTable } from "@/components/ClientListTable";

//todo: remove mock functionality
const mockClients = [
  {
    id: "1",
    name: "Michael Chen",
    email: "michael.chen@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Inc",
    status: "active" as const,
    trips: 12,
    revenue: "$45,600"
  },
  {
    id: "2",
    name: "Emma Rodriguez",
    email: "emma.r@globalventures.com",
    phone: "+1 (555) 234-5678",
    company: "Global Ventures",
    status: "active" as const,
    trips: 8,
    revenue: "$32,400"
  },
  {
    id: "3",
    name: "James Wilson",
    email: "j.wilson@startuplab.io",
    phone: "+1 (555) 345-6789",
    company: "Startup Lab",
    status: "lead" as const,
    trips: 0,
    revenue: "$0"
  },
  {
    id: "4",
    name: "Sarah Thompson",
    email: "sarah.t@consulting.com",
    phone: "+1 (555) 456-7890",
    company: "Thompson Consulting",
    status: "active" as const,
    trips: 15,
    revenue: "$58,900"
  },
  {
    id: "5",
    name: "David Martinez",
    email: "d.martinez@innovate.com",
    phone: "+1 (555) 567-8901",
    company: "Innovate Solutions",
    status: "active" as const,
    trips: 6,
    revenue: "$28,300"
  },
];

export default function CRMPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">CRM & Client Management</h1>
        <p className="text-muted-foreground mt-1">Manage your clients, leads, and corporate accounts.</p>
      </div>

      <ClientListTable
        clients={mockClients}
        onClientClick={(id) => console.log('Navigate to client:', id)}
      />
    </div>
  );
}
