import { DashboardKPICard } from '../DashboardKPICard';
import { DollarSign, Users, Plane, TrendingUp } from 'lucide-react';

export default function DashboardKPICardExample() {
  return (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-bold mb-6">Dashboard KPI Cards</h2>
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
    </div>
  );
}
