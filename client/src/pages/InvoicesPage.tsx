import { InvoiceListTable } from "@/components/InvoiceListTable";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const formattedInvoices = invoices?.map((invoice: any) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientName: "Client",
    destination: "Trip",
    amount: `$${parseFloat(invoice.amount).toLocaleString()}`,
    status: invoice.status,
    date: format(new Date(invoice.createdAt), 'MMM dd, yyyy'),
    dueDate: format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Invoices</h1>
        <p className="text-muted-foreground mt-1">Create and manage invoices with integrated payment processing.</p>
      </div>

      {isLoading ? (
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      ) : (
        <InvoiceListTable
          invoices={formattedInvoices}
          onInvoiceClick={(id) => console.log('View invoice:', id)}
        />
      )}
    </div>
  );
}
