import { useState } from "react";
import { Plus, Search, Filter, User, Phone, Mail, Home, Calendar, DollarSign, Users, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { LeadCard } from "@/components/lead-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { InsertLead } from "@shared/schema";

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.string().min(1, "Status is required"),
  source: z.string().min(1, "Lead source is required"),
  budget: z.string().optional(),
  desiredMoveInDate: z.string().optional(),
  currentLocation: z.string().optional(),
  householdSize: z.string().optional(),
  employmentStatus: z.string().optional(),
  notes: z.string().optional(),
  preferredBedrooms: z.string().optional(),
  preferredBathrooms: z.string().optional(),
  petOwner: z.string().optional(),
  smokingStatus: z.string().optional(),
  propertyId: z.number().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Touring",
  "Application Submitted",
  "Approved",
  "Rejected",
  "Closed Won",
  "Closed Lost"
];

const LEAD_SOURCES = [
  "Website",
  "Zillow",
  "Apartments.com",
  "Craigslist",
  "Facebook",
  "Instagram",
  "Google Ads",
  "Referral",
  "Walk-in",
  "Phone Call",
  "Email",
  "Other"
];

const EMPLOYMENT_STATUSES = [
  "Full-time",
  "Part-time",
  "Self-employed",
  "Unemployed",
  "Student",
  "Retired",
  "Other"
];

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.leads.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "New",
      source: "",
      budget: "",
      desiredMoveInDate: "",
      currentLocation: "",
      householdSize: "",
      employmentStatus: "",
      notes: "",
      preferredBedrooms: "",
      preferredBathrooms: "",
      petOwner: "",
      smokingStatus: "",
      propertyId: undefined,
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: InsertLead) => api.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead created",
        description: "New lead has been successfully added.",
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    const leadData: InsertLead = {
      ...data,
      propertyId: data.propertyId || null,
    };
    createLeadMutation.mutate(leadData);
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchTerm))
  );

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header title="Leads" subtitle="Manage your rental property leads" />
        <main className="p-6 overflow-y-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Header title="Leads" subtitle="Manage your rental property leads" />
      
      <main className="p-6 overflow-y-auto h-full">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Add New Lead
                </DialogTitle>
                <DialogDescription>
                  Add a new rental prospect with their contact information and preferences.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          {...form.register("name")}
                          placeholder="e.g., John Smith"
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            {...form.register("email")}
                            placeholder="john@example.com"
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            {...form.register("phone")}
                            placeholder="(555) 123-4567"
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.phone && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="currentLocation">Current Location</Label>
                        <Input
                          id="currentLocation"
                          {...form.register("currentLocation")}
                          placeholder="e.g., New York, NY"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Lead Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="status">Status *</Label>
                        <Select onValueChange={(value) => form.setValue("status", value)} defaultValue="New">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.status && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.status.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="source">Lead Source *</Label>
                        <Select onValueChange={(value) => form.setValue("source", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_SOURCES.map((source) => (
                              <SelectItem key={source} value={source}>
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.source && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.source.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="propertyId">Interested Property</Label>
                        <Select onValueChange={(value) => form.setValue("propertyId", parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No specific property</SelectItem>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rental Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Rental Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="preferredBedrooms">Bedrooms</Label>
                        <Select onValueChange={(value) => form.setValue("preferredBedrooms", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Studio">Studio</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5+">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="preferredBathrooms">Bathrooms</Label>
                        <Select onValueChange={(value) => form.setValue("preferredBathrooms", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="1.5">1.5</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="2.5">2.5</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="3.5">3.5</SelectItem>
                            <SelectItem value="4+">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="budget">Budget Range</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="budget"
                            {...form.register("budget")}
                            placeholder="e.g., $2,000-$2,500"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="desiredMoveInDate">Move-in Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="desiredMoveInDate"
                            type="date"
                            {...form.register("desiredMoveInDate")}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="householdSize">Household Size</Label>
                        <Select onValueChange={(value) => form.setValue("householdSize", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 person</SelectItem>
                            <SelectItem value="2">2 people</SelectItem>
                            <SelectItem value="3">3 people</SelectItem>
                            <SelectItem value="4">4 people</SelectItem>
                            <SelectItem value="5+">5+ people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="employmentStatus">Employment</Label>
                        <Select onValueChange={(value) => form.setValue("employmentStatus", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {EMPLOYMENT_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="petOwner">Pet Owner</Label>
                        <Select onValueChange={(value) => form.setValue("petOwner", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No">No pets</SelectItem>
                            <SelectItem value="Cat">Cat owner</SelectItem>
                            <SelectItem value="Dog">Dog owner</SelectItem>
                            <SelectItem value="Multiple">Multiple pets</SelectItem>
                            <SelectItem value="Other">Other pets</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="smokingStatus">Smoking Status</Label>
                        <Select onValueChange={(value) => form.setValue("smokingStatus", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Non-smoker">Non-smoker</SelectItem>
                            <SelectItem value="Smoker">Smoker</SelectItem>
                            <SelectItem value="Occasional">Occasional smoker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="notes">Notes & Comments</Label>
                      <Textarea
                        id="notes"
                        {...form.register("notes")}
                        placeholder="Add any additional information about this lead, their requirements, preferences, or conversation notes..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createLeadMutation.isPending}
                    className="bg-secondary hover:bg-green-600"
                  >
                    {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>

        {filteredLeads.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No leads found matching your search." : "No leads found."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
