import { useClientsStore } from '@/stores/useClientsStore'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { useLocation } from 'wouter'

export default function ClientsPage() {
  const { clients } = useClientsStore()
  const [, setLocation] = useLocation()

  return (
    <motion.div
      className="flex flex-col flex-1 w-full min-h-screen bg-gray-50 p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm">
            View and manage all your clients in one place.
          </p>
        </div>
        <Button
          onClick={() => setLocation('/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            No clients yet. Click “Add Client” to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="border-b border-gray-200 text-gray-500 bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="px-4">{c.email}</td>
                    <td className="px-4 text-indigo-600">{c.status}</td>
                    <td className="px-4 text-gray-500">{c.lastContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
