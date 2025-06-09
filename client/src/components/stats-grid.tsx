import { Building, Users, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const statIcons = {
  totalProperties: Building,
  activeLeads: Users,
  conversionRate: TrendingUp,
  monthlyRevenue: DollarSign,
};

const statColors = {
  totalProperties: "bg-blue-50 text-primary",
  activeLeads: "bg-green-50 text-secondary",
  conversionRate: "bg-orange-50 text-accent",
  monthlyRevenue: "bg-green-50 text-secondary",
};

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.dashboard.getStats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsData = [
    {
      key: "totalProperties",
      label: "Total Properties",
      value: stats.totalProperties,
      change: "+12%",
    },
    {
      key: "activeLeads",
      label: "Active Leads",
      value: stats.activeLeads,
      change: "+8%",
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      value: stats.conversionRate,
      change: "+3.2%",
    },
    {
      key: "monthlyRevenue",
      label: "Monthly Revenue",
      value: stats.monthlyRevenue,
      change: "+15.3%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat) => {
        const Icon = statIcons[stat.key as keyof typeof statIcons];
        const colorClass = statColors[stat.key as keyof typeof statColors];
        
        return (
          <Card key={stat.key} className="shadow-sm border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-secondary flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
