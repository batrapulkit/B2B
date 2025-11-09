import { DashboardKPICard } from "@/components/DashboardKPICard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Plane, TrendingUp, Plus } from "lucide-react";

//todo: remove mock functionality
const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
];

const destinationsData = [
  { destination: "Paris", bookings: 45 },
  { destination: "Tokyo", bookings: 38 },
  { destination: "Bali", bookings: 52 },
  { destination: "Barcelona", bookings: 41 },
  { destination: "Dubai", bookings: 35 },
];

const recentItineraries = [
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

export default function Dashboard() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardKPICard
          title="Total Revenue"
          value="$284,500"
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <DashboardKPICard
          title="Active Clients"
          value="1,248"
          change="+8.2% from last month"
          changeType="positive"
          icon={Users}
          iconColor="text-blue-600"
        />
        <DashboardKPICard
          title="Trips Planned"
          value="342"
          change="+15.3% from last month"
          changeType="positive"
          icon={Plane}
          iconColor="text-purple-600"
        />
        <DashboardKPICard
          title="Conversion Rate"
          value="68.4%"
          change="+2.1% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Monthly Revenue"
          data={revenueData}
          type="line"
          dataKey="revenue"
          xAxisKey="month"
          color="hsl(var(--primary))"
        />
        <AnalyticsChart
          title="Top Destinations"
          data={destinationsData}
          type="bar"
          dataKey="bookings"
          xAxisKey="destination"
          color="hsl(var(--chart-1))"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-semibold">Recent Itineraries</h2>
          <Button variant="outline" data-testid="button-view-all-itineraries">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              {...itinerary}
              onView={(id) => console.log('View itinerary:', id)}
              onEdit={(id) => console.log('Edit itinerary:', id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
