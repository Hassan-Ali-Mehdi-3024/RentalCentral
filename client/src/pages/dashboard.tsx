import { Upload, UserPlus, RotateCw, Download } from "lucide-react";
import { Header } from "@/components/header";
import { StatsGrid } from "@/components/stats-grid";
import { PropertyCard } from "@/components/property-card";
import { LeadCard } from "@/components/lead-card";
import { DragDropAssignment } from "@/components/drag-drop-assignment";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.leads.getAll(),
  });

  const getLeadCountForProperty = (propertyId: number) => {
    return leads.filter(lead => lead.propertyId === propertyId).length;
  };

  const recentProperties = properties.slice(0, 3);
  const recentLeads = leads.slice(0, 4);

  const handleQuickAction = (action: string) => {
    const messages = {
      import: "Import process started!",
      addLead: "New lead form opened!",
      assign: "Auto-assignment completed!",
      export: "Export started!",
    };
    
    toast({
      title: "Action Completed",
      description: messages[action as keyof typeof messages] || "Action completed!",
    });
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Dashboard Overview" 
        subtitle="Manage your rental properties and leads efficiently" 
      />
      
      <main className="p-6 overflow-y-auto h-full">
        {/* Stats Cards */}
        <StatsGrid />

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/import">
                <Button className="bg-primary hover:bg-primary/90">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Properties
                </Button>
              </Link>
              <Button 
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => handleQuickAction("addLead")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Lead
              </Button>
              <Button 
                className="bg-accent hover:bg-accent/90"
                onClick={() => handleQuickAction("assign")}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Auto-Assign Leads
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleQuickAction("export")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties and Leads Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Properties Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Properties</CardTitle>
                <Link href="/properties">
                  <Button variant="link" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    leadCount={getLeadCountForProperty(property.id)}
                  />
                ))}
                
                {recentProperties.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No properties found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leads Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Leads</CardTitle>
                <Link href="/leads">
                  <Button variant="link" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                
                {recentLeads.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No leads found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Assignment Section */}
        <DragDropAssignment />

        {/* Import Section */}
        <div className="mt-8">
          <FileUpload />
        </div>
      </main>
    </div>
  );
}
