import { useEffect, useState } from "react";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: "Prospect" | "Warm Lead" | "Hot Lead" | "Converted";
  revenue?: number;
  trips?: number;
  createdAt: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("triponic_clients");
    if (stored) setClients(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("triponic_clients", JSON.stringify(clients));
  }, [clients]);

  const addClient = (client: Omit<Client, "id" | "createdAt">) => {
    const newClient = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return { clients, addClient, updateClient, deleteClient };
}
