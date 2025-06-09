import { useState } from "react";
import { Calendar, Clock, TrendingUp, Users, Plus, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Property } from "@shared/schema";

export function SchedulingDashboard() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const { data: showingRequests = [] } = useQuery({
    queryKey: ["/api/showing-requests", selectedPropertyId],
    queryFn: () => api.showingRequests.getAll(selectedPropertyId),
  });

  const { data: scheduledShowings = [] } = useQuery({
    queryKey: ["/api/showings", selectedPropertyId],
    queryFn: () => api.showings.getAll(selectedPropertyId),
  });

  const { data: popularTimes = [] } = useQuery({
    queryKey: ["/api/properties", selectedPropertyId, "popular-times"],
    queryFn: () => selectedPropertyId ? api.showings.getPopularTimes(selectedPropertyId) : Promise.resolve([]),
    enabled: !!selectedPropertyId
  });

  const { data: agentSchedules = [] } = useQuery({
    queryKey: ["/api/schedules", selectedPropertyId],
    queryFn: () => api.schedules.getAll(selectedPropertyId),
  });

  const scheduleShowingMutation = useMutation({
    mutationFn: (data: {
      propertyId: number;
      showingDate: string;
      showingTime: string;
      duration: number;
    }) => api.showings.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/showings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/showing-requests"] });
      
      // Get leads for this property to notify them
      const propertyLeads = showingRequests
        .filter(req => req.propertyId === data.propertyId && req.status === "pending")
        .map(req => req.leadId);
      
      toast({
        title: "Open House Scheduled",
        description: `Scheduled for ${data.showingDate} at ${data.showingTime}. ${propertyLeads.length} leads will be notified.`,
      });
      
      setSelectedDate("");
      setSelectedTime("");
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule showing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const pendingRequests = showingRequests.filter(req => req.status === "pending");
  const upcomingShowings = scheduledShowings.filter(showing => 
    new Date(`${showing.showingDate}T${showing.showingTime}`) > new Date()
  );

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleScheduleShowing = () => {
    if (!selectedPropertyId || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a property, date, and time.",
        variant: "destructive",
      });
      return;
    }

    scheduleShowingMutation.mutate({
      propertyId: selectedPropertyId,
      showingDate: selectedDate,
      showingTime: selectedTime,
      duration: 30
    });
  };

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Scheduling Dashboard
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Manage property showings and view demand analytics
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Property
            </label>
            <Select value={selectedPropertyId?.toString()} onValueChange={(value) => setSelectedPropertyId(parseInt(value))}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Choose a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedPropertyId && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Pending Requests</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{pendingRequests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Scheduled Showings</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{upcomingShowings.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Agent Availability</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{agentSchedules.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Most Requested Times
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Times when prospects most want to view this property
              </p>
            </CardHeader>
            <CardContent>
              {popularTimes.length > 0 ? (
                <div className="space-y-3">
                  {popularTimes.slice(0, 5).map((timeData, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{formatTime(timeData.time)}</p>
                          <p className="text-sm text-muted-foreground">{timeData.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {timeData.count} {timeData.count === 1 ? 'request' : 'requests'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No showing requests yet for this property.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Schedule New Showing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Schedule Open House
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Create an open house showing based on demand
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Date
                  </label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose date" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((date) => {
                        const dateObj = new Date(date);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                        const formattedDate = dateObj.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        });
                        return (
                          <SelectItem key={date} value={date}>
                            {dayName}, {formattedDate}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Time
                  </label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time" />
                    </SelectTrigger>
                    <SelectContent>
                      {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleScheduleShowing}
                disabled={!selectedDate || !selectedTime || scheduleShowingMutation.isPending}
                className="w-full bg-primary hover:bg-blue-600"
              >
                <Bell className="h-4 w-4 mr-2" />
                {scheduleShowingMutation.isPending ? "Scheduling..." : "Schedule & Notify Leads"}
              </Button>
            </CardContent>
          </Card>

          {/* Agent Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Your Availability Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {agentSchedules.length > 0 ? (
                <div className="space-y-2">
                  {agentSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getDayName(schedule.dayOfWeek)}</span>
                        <span className="text-muted-foreground">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>
                      <Badge variant={schedule.isActive ? "default" : "secondary"}>
                        {schedule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No availability schedule set. Use the voice scheduler to set your preferences.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}