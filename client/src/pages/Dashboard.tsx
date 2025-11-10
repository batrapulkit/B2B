import { useState } from "react";
import { useClientsStore } from "@/stores/useClientsStore";
import { useLocation } from "wouter";
import {
  Bell,
  Search,
  UserPlus,
  X,
  ArrowUpRight,
  DollarSign,
  Users,
  Plane,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { clients, addClient } = useClientsStore();
  const [, setLocation] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    status: "Prospect",
  });

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) return;
    addClient({ ...newClient, lastContact: "just now" });
    setNewClient({ name: "", email: "", status: "Prospect" });
    setShowModal(false);
    setLocation("/clients");
  };

  const kpis = [
    {
      icon: DollarSign,
      label: "Monthly Revenue",
      value: "$128,400",
      trend: "+12.5%",
      subtitle: "vs last month",
    },
    {
      icon: Users,
      label: "Active Clients",
      value: "432",
      trend: "+5.2%",
      subtitle: "18 new this month",
    },
    {
      icon: Plane,
      label: "Trips Managed",
      value: "1,245",
      trend: "+8.3%",
      subtitle: "This quarter",
    },
    {
      icon: Briefcase,
      label: "Avg. Deal Size",
      value: "$4,290",
      trend: "+15.8%",
      subtitle: "Growing steadily",
    },
  ];

  const recentActivities = [
    {
      type: "success",
      message: "New client onboarded: Acme Corp",
      time: "2h ago",
      icon: CheckCircle2,
    },
    {
      type: "warning",
      message: "Invoice #2847 overdue",
      time: "4h ago",
      icon: AlertCircle,
    },
    {
      type: "success",
      message: "Trip completed for Tesla Inc.",
      time: "6h ago",
      icon: Star,
    },
  ];

  return (
    <SidebarProvider>
      <div className="app-root">
        {/* Sidebar */}
        <div className="app-sidebar">
          <AppSidebar />
        </div>

        {/* Main Dashboard Area */}
        <div className="app-main bg-gray-50 text-gray-900">
          {/* Header */}
          <header className="app-header">
            <div className="flex items-center gap-3 w-full max-w-lg">
              <div className="relative flex-1">
                <Input
                  placeholder="Search clients, trips, invoices..."
                  className="w-full pl-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-indigo-200"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full relative transition">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center">
                  PB
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Pulkit Batra</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="app-content px-8 py-6">
            <motion.main
              className="flex flex-col gap-8 h-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Welcome */}
              <div>
                <h1 className="text-2xl font-bold mb-1">Welcome back, Pulkit 👋</h1>
                <p className="text-gray-600 text-sm">
                  Here’s what’s happening across your agency.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <kpi.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        <ArrowUpRight className="h-3 w-3" />
                        {kpi.trend}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {kpi.value}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{kpi.subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Activity + Clients */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      View all
                    </button>
                  </div>
                  <div className="panel-scroll no-scrollbar flex-1 space-y-3">
                    {recentActivities.map((act, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            act.type === "success"
                              ? "bg-emerald-50 text-emerald-600"
                              : act.type === "warning"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <act.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {act.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3" />
                            {act.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CRM Table */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Client Pipeline
                    </h3>
                    <Button
                      onClick={() => setShowModal(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-xl"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Client
                    </Button>
                  </div>
                  <div className="panel-scroll no-scrollbar flex-1">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-2 text-gray-500 uppercase text-xs">
                            Client
                          </th>
                          <th className="text-left py-2 px-2 text-gray-500 uppercase text-xs">
                            Email
                          </th>
                          <th className="text-left py-2 px-2 text-gray-500 uppercase text-xs">
                            Status
                          </th>
                          <th className="text-left py-2 px-2 text-gray-500 uppercase text-xs">
                            Last Contact
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {clients.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium text-gray-900">
                              {c.name}
                            </td>
                            <td className="py-2 px-2 text-gray-600">
                              {c.email}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  c.status === "Converted"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : c.status === "Warm Lead"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-gray-500">
                              {c.lastContact}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.main>
          </div>
        </div>

        {/* Add Client Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-2xl font-bold mb-4">Add New Client</h3>
              <div className="space-y-5">
                <input
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Full Name"
                  className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  placeholder="Email Address"
                  type="email"
                  className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-200"
                />
                <select
                  value={newClient.status}
                  onChange={(e) =>
                    setNewClient({ ...newClient, status: e.target.value })
                  }
                  className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-200"
                >
                  <option>Prospect</option>
                  <option>Warm Lead</option>
                  <option>Converted</option>
                </select>
                <Button
                  onClick={handleAddClient}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 rounded-xl"
                >
                  Add Client
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
