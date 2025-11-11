import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface ClientStore {
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  clearClients: () => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (client) => {
        const newClient = {
          ...client,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set({ clients: [newClient, ...get().clients] });
      },

      updateClient: (id, updates) => {
        set({
          clients: get().clients.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      deleteClient: (id) => {
        set({ clients: get().clients.filter((c) => c.id !== id) });
      },

      clearClients: () => set({ clients: [] }),
    }),
    {
      name: "triponic_clients", // localStorage key
    }
  )
);
