import { ItineraryCard } from '../ItineraryCard';

const mockItineraries = [
  {
    id: "1",
    destination: "Paris, France",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    duration: "7 days",
    travelers: 2,
    budget: "$8,450",
    clientName: "Michael Chen",
    status: "confirmed" as const,
    startDate: "Mar 15, 2024"
  },
  {
    id: "2",
    destination: "Tokyo, Japan",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    duration: "10 days",
    travelers: 1,
    budget: "$12,300",
    clientName: "Emma Rodriguez",
    status: "draft" as const,
    startDate: "Apr 2, 2024"
  },
  {
    id: "3",
    destination: "Bali, Indonesia",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    duration: "5 days",
    travelers: 4,
    budget: "$6,750",
    clientName: "Sarah Thompson",
    status: "completed" as const,
    startDate: "Jan 10, 2024"
  },
];

export default function ItineraryCardExample() {
  return (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-bold mb-6">Trip Itineraries</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockItineraries.map((itinerary) => (
          <ItineraryCard
            key={itinerary.id}
            {...itinerary}
            onView={(id) => console.log('View itinerary:', id)}
            onEdit={(id) => console.log('Edit itinerary:', id)}
          />
        ))}
      </div>
    </div>
  );
}
