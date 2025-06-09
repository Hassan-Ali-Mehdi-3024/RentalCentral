import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@shared/schema";

interface LeadCardProps {
  lead: Lead;
}

const statusColors = {
  new: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  qualified: "bg-green-100 text-green-800",
  viewing: "bg-purple-100 text-purple-800",
  closed: "bg-gray-100 text-gray-800",
};

export function LeadCard({ lead }: LeadCardProps) {
  const statusColor = statusColors[lead.status as keyof typeof statusColors] || statusColors.new;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{lead.name}</h4>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
              {lead.phone && (
                <p className="text-xs text-muted-foreground">{lead.phone}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge className={`text-xs font-medium ${statusColor}`}>
              {lead.status}
            </Badge>
            {lead.source && (
              <p className="text-xs text-muted-foreground mt-1">{lead.source}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
