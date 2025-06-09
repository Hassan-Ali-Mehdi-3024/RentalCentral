import { useState } from "react";
import { Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Property, Lead } from "@shared/schema";

interface ShowingCalendarProps {
  propertyId?: number;
  leadId?: number;
}

export function ShowingCalendar({ propertyId, leadId }: ShowingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(propertyId || 0);
  const [selectedLeadId, setSelectedLeadId] = useState<number>(leadId || 0);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
    enabled: !propertyId
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.leads.getAll(),
    enabled: !leadId
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/schedules", selectedPropertyId],
    queryFn: () => api.schedules.getAll(selectedPropertyId || undefined),
    enabled: !!selectedPropertyId
  });

  const requestShowingMutation = useMutation({
    mutationFn: (data: {
      propertyId: number;
      leadId: number;
      requestedDate: string;
      requestedTime: string;
    }) => {
      // If we have guest info but no leadId, we'd create a lead first
      // For this demo, we'll use the selected lead or create a simple one
      return api.showingRequests.create({
        propertyId: data.propertyId,
        leadId: data.leadId,
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime,
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showing-requests"] });
      toast({
        title: "Showing Request Submitted",
        description: "Your showing request has been submitted. We'll contact you soon with confirmation.",
      });
      setSelectedDate(undefined);
      setSelectedTime("");
      setGuestName("");
      setGuestEmail("");
    },
    onError: () => {
      toast({
        title: "Request Failed",
        description: "Failed to submit showing request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  // Generate available time slots based on agent schedules
  const getAvailableTimeSlots = () => {
    if (!selectedDate || !schedules.length) return [];

    const dayOfWeek = selectedDate.getDay();
    const relevantSchedules = schedules.filter(
      schedule => schedule.dayOfWeek === dayOfWeek && schedule.isActive
    );

    const timeSlots: string[] = [];
    relevantSchedules.forEach(schedule => {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      // Generate 30-minute slots
      for (let time = startTime; time < endTime; time += 30) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
      }
    });

    return Array.from(new Set(timeSlots)).sort();
  };

  const handleSubmitRequest = () => {
    if (!selectedPropertyId || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a property, date, and time.",
        variant: "destructive",
      });
      return;
    }

    let finalLeadId = selectedLeadId;
    
    // If no lead selected but we have guest info, we'd create a lead first
    // For demo, we'll use the first available lead or show an error
    if (!finalLeadId && leads.length > 0) {
      finalLeadId = leads[0].id;
    } else if (!finalLeadId) {
      toast({
        title: "No Lead Information",
        description: "Please provide contact information or select a lead.",
        variant: "destructive",
      });
      return;
    }

    const requestedDate = selectedDate.toISOString().split('T')[0];
    
    requestShowingMutation.mutate({
      propertyId: selectedPropertyId,
      leadId: finalLeadId,
      requestedDate,
      requestedTime: selectedTime
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Schedule Property Showing
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Book a time to view this property with our agent
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Property Selection */}
        {!propertyId && (
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Select Property
            </Label>
            <Select value={selectedPropertyId?.toString()} onValueChange={(value) => setSelectedPropertyId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{property.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Property Info */}
        {selectedProperty && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <img 
                src={selectedProperty.imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100"} 
                alt={selectedProperty.name}
                className="w-16 h-12 object-cover rounded"
              />
              <div>
                <h4 className="font-semibold text-foreground">{selectedProperty.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
                <p className="text-sm text-primary font-medium">${selectedProperty.rent}/mo • {selectedProperty.bedrooms}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {!leadId && (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestName" className="text-sm font-medium text-foreground mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="guestEmail" className="text-sm font-medium text-foreground mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        )}

        {/* Lead Selection (for internal use) */}
        {!leadId && leads.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Select Lead (Internal)
            </Label>
            <Select value={selectedLeadId?.toString()} onValueChange={(value) => setSelectedLeadId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{lead.name} - {lead.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Selection */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Select Date
          </Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
            className="rounded-md border"
          />
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Available Times
            </Label>
            {availableTimeSlots.length > 0 ? (
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{time}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                No available times for this date. Please select a different date or contact us directly.
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmitRequest}
          disabled={!selectedPropertyId || !selectedDate || !selectedTime || requestShowingMutation.isPending}
          className="w-full bg-primary hover:bg-blue-600"
        >
          {requestShowingMutation.isPending ? "Submitting..." : "Request Showing"}
        </Button>
      </CardContent>
    </Card>
  );
}