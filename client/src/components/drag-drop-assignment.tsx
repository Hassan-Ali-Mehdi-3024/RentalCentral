import { useState } from "react";
import { GripVertical, Users, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Lead, Property } from "@shared/schema";

export function DragDropAssignment() {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.leads.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const assignLeadMutation = useMutation({
    mutationFn: ({ leadId, propertyId }: { leadId: number; propertyId: number | null }) =>
      api.leads.assign(leadId, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Lead assigned successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unassignedLeads = leads.filter(lead => !lead.propertyId);
  
  const getLeadCountForProperty = (propertyId: number) => {
    return leads.filter(lead => lead.propertyId === propertyId).length;
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.setData("text/plain", lead.id.toString());
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, propertyId: number) => {
    e.preventDefault();
    
    if (draggedLead) {
      assignLeadMutation.mutate({
        leadId: draggedLead.id,
        propertyId,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Lead Assignment
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Drag leads to assign them to specific properties
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unassigned Leads */}
          <div>
            <h4 className="font-medium text-foreground mb-4 flex items-center">
              <Users className="h-4 w-4 mr-2 text-accent" />
              Unassigned Leads ({unassignedLeads.length})
            </h4>
            <div className="space-y-3">
              {unassignedLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground drag-handle" />
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.preferences || "No preferences specified"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{lead.source}</span>
                </div>
              ))}
              
              {unassignedLeads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No unassigned leads</p>
                </div>
              )}
            </div>
          </div>

          {/* Property Assignment Areas */}
          <div>
            <h4 className="font-medium text-foreground mb-4 flex items-center">
              <Building className="h-4 w-4 mr-2 text-primary" />
              Available Properties
            </h4>
            <div className="space-y-4">
              {properties.map((property) => {
                const leadCount = getLeadCountForProperty(property.id);
                
                return (
                  <div
                    key={property.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, property.id)}
                    className="drop-zone hover:border-primary"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-foreground">{property.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {property.bedrooms}, ${property.rent}/mo
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {leadCount} assigned
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Drop leads here to assign
                    </p>
                  </div>
                );
              })}
              
              {properties.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No properties available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
