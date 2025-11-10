import { create } from 'zustand'

type Client = {
  name: string
  email: string
  status: string
  lastContact: string
}

type ClientsState = {
  clients: Client[]
  addClient: (client: Client) => void
}

export const useClientsStore = create<ClientsState>((set) => ({
  clients: [
    { name: 'Olivia Jones', email: 'olivia@travelex.com', status: 'Hot Lead', lastContact: '2 days ago' },
    { name: 'Raj Patel', email: 'raj@tripnexus.ca', status: 'Converted', lastContact: '1 week ago' },
  ],
  addClient: (client) =>
    set((state) => ({
      clients: [...state.clients, client],
    })),
}))
