import { Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  leadCount?: number;
}

export function PropertyCard({ property, leadCount = 0 }: PropertyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <img 
            src={property.imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100"} 
            alt={property.name}
            className="property-image"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{property.name}</h4>
            <p className="text-sm text-muted-foreground">{property.address}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-muted-foreground flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {property.bedrooms}
              </span>
              <span className="text-sm font-semibold text-primary">
                ${property.rent}/mo
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant="secondary" className="text-xs">
              {leadCount} {leadCount === 1 ? 'lead' : 'leads'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
