import { AnalyticsChart } from '../AnalyticsChart';

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

export default function AnalyticsChartExample() {
  return (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
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
    </div>
  );
}
