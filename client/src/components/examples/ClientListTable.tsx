import { ClientListTable } from '../ClientListTable';

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
];

export default function ClientListTableExample() {
  return (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-bold mb-6">CRM Client Management</h2>
      <ClientListTable
        clients={mockClients}
        onClientClick={(id) => console.log('Client clicked:', id)}
      />
    </div>
  );
}
