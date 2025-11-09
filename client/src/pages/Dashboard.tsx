import { DashboardKPICard } from "@/components/DashboardKPICard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Plane, TrendingUp, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: itineraries, isLoading: itinerariesLoading } = useQuery({
    queryKey: ["/api/itineraries"],
  });

  const recentItineraries = itineraries?.slice(0, 3) || [];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <Button data-testid="button-new-itinerary">
          <Plus className="w-4 h-4 mr-2" />
          New Itinerary
        </Button>
      </div>

      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardKPICard
            title="Total Revenue"
            value={`$${analytics?.totalRevenue?.toLocaleString() || '0'}`}
            icon={DollarSign}
            iconColor="text-green-600"
          />
          <DashboardKPICard
            title="Active Clients"
            value={analytics?.activeClients?.toString() || '0'}
            icon={Users}
            iconColor="text-blue-600"
          />
          <DashboardKPICard
            title="Trips Planned"
            value={analytics?.totalTrips?.toString() || '0'}
            icon={Plane}
            iconColor="text-purple-600"
          />
          <DashboardKPICard
            title="Conversion Rate"
            value={analytics?.conversionRate || '0%'}
            icon={TrendingUp}
            iconColor="text-orange-600"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-semibold">Recent Itineraries</h2>
          <Button variant="outline" data-testid="button-view-all-itineraries">View All</Button>
        </div>
        {itinerariesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : recentItineraries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItineraries.map((itinerary: any) => (
              <ItineraryCard
                key={itinerary.id}
                id={itinerary.id}
                destination={itinerary.destination}
                imageUrl={itinerary.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"}
                duration={`${Math.ceil((new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`}
                travelers={itinerary.travelers}
                budget={`$${parseFloat(itinerary.budget || '0').toLocaleString()}`}
                clientName="Client Name"
                status={itinerary.status}
                startDate={format(new Date(itinerary.startDate), 'MMM dd, yyyy')}
                onView={(id) => console.log('View itinerary:', id)}
                onEdit={(id) => console.log('Edit itinerary:', id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No itineraries yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
