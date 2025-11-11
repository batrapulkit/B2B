import React, { useMemo, useState } from "react";
import {
  DollarSign,
  Users,
  Plane,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  X,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import { useClientsStore } from "../stores/useClientsStore";


export default function Dashboard() {
  const { clients, addClient, updateClient, deleteClient } = useClientsStore();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Prospect",
  });

  // Stats auto-update based on shared store data
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const totalTrips = clients.reduce((sum, c) => sum + (c.trips || 0), 0);
    const converted = clients.filter((c) => c.status === "Converted").length;
    const conversionRate =
      clients.length > 0
        ? ((converted / clients.length) * 100).toFixed(1)
        : "0.0";
    return { totalRevenue, totalTrips, totalClients: clients.length, conversionRate };
  }, [clients]);

  const kpis = [
    { icon: DollarSign, label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}` },
    { icon: Users, label: "Clients", value: stats.totalClients.toString() },
    { icon: Plane, label: "Trips Managed", value: stats.totalTrips.toString() },
    { icon: TrendingUp, label: "Conversion Rate", value: `${stats.conversionRate}%` },
  ];

  // Add or Edit client handler
  const handleSubmit = () => {
    if (!form.name || !form.email) return alert("Name and email are required.");
    if (editingClient) {
      updateClient(editingClient, form);
      setEditingClient(null);
    } else {
      addClient({ ...form });
    }
    setForm({ name: "", email: "", phone: "", company: "", status: "Prospect" });
    setShowModal(false);
  };

  const startEdit = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setEditingClient(client.id);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      company: client.company || "",
      status: client.status,
    });
    setShowModal(true);
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-100 p-10 pr-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Triponic Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage clients and monitor performance insights.
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="flex justify-between items-center bg-white border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition"
            >
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{kpi.value}</h3>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* Clients Table */}
      <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
            <p className="text-sm text-gray-500">Add, edit, and track client information.</p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingClient(null);
              setForm({ name: "", email: "", phone: "", company: "", status: "Prospect" });
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Company</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No clients yet — add one to get started.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-900">{c.name}</td>
                    <td className="p-3 text-gray-600">{c.email}</td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.status === "Converted"
                            ? "bg-emerald-100 text-emerald-700"
                            : c.status === "Hot Lead"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{c.company || "—"}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => startEdit(c.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add/Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editingClient ? "Edit Client" : "Add New Client"}
            </h3>
            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option>Prospect</option>
                <option>Warm Lead</option>
                <option>Hot Lead</option>
                <option>Converted</option>
              </select>
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold mt-3 hover:opacity-90"
              >
                {editingClient ? "Save Changes" : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
