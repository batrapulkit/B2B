import { InvoiceListTable } from "@/components/InvoiceListTable";

//todo: remove mock functionality
const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    clientName: "Michael Chen",
    destination: "Paris, France",
    amount: "$8,450",
    status: "paid" as const,
    date: "Jan 15, 2024",
    dueDate: "Feb 15, 2024"
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    clientName: "Emma Rodriguez",
    destination: "Tokyo, Japan",
    amount: "$12,300",
    status: "pending" as const,
    date: "Jan 20, 2024",
    dueDate: "Feb 20, 2024"
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    clientName: "Sarah Thompson",
    destination: "Bali, Indonesia",
    amount: "$6,750",
    status: "overdue" as const,
    date: "Dec 10, 2023",
    dueDate: "Jan 10, 2024"
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    clientName: "James Wilson",
    destination: "Barcelona, Spain",
    amount: "$9,200",
    status: "paid" as const,
    date: "Jan 25, 2024",
    dueDate: "Feb 25, 2024"
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    clientName: "David Martinez",
    destination: "Dubai, UAE",
    amount: "$15,600",
    status: "pending" as const,
    date: "Feb 1, 2024",
    dueDate: "Mar 1, 2024"
  },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Invoices</h1>
        <p className="text-muted-foreground mt-1">Create and manage invoices with integrated payment processing.</p>
      </div>

      <InvoiceListTable
        invoices={mockInvoices}
        onInvoiceClick={(id) => console.log('View invoice:', id)}
      />
    </div>
  );
}
