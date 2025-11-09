import { InvoiceListTable } from '../InvoiceListTable';

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
];

export default function InvoiceListTableExample() {
  return (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-bold mb-6">Invoice Management</h2>
      <InvoiceListTable
        invoices={mockInvoices}
        onInvoiceClick={(id) => console.log('Invoice clicked:', id)}
      />
    </div>
  );
}
