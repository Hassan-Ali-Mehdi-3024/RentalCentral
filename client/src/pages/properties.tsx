import { useState } from "react";
import { Plus, Search, Filter, X, Upload, Home, DollarSign, MapPin, Calendar } from "lucide-react";
import { Header } from "@/components/header";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { InsertProperty } from "@shared/schema";

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  bedrooms: z.string().min(1, "Number of bedrooms is required"),
  bathrooms: z.string().min(1, "Number of bathrooms is required"),
  squareFeet: z.string().optional(),
  rent: z.string().min(1, "Monthly rent is required"),
  deposit: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  available: z.boolean(),
  propertyType: z.string().min(1, "Property type is required"),
  amenities: z.array(z.string()).optional(),
  petPolicy: z.string().optional(),
  parkingSpaces: z.string().optional(),
  leaseTerms: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const PROPERTY_TYPES = [
  "Single Family Home",
  "Apartment",
  "Condo",
  "Townhouse",
  "Studio",
  "Duplex",
  "Multi-Family",
  "Commercial"
];

const AMENITIES = [
  "Air Conditioning",
  "Heating",
  "Washer/Dryer",
  "Dishwasher",
  "Garage",
  "Pool",
  "Gym/Fitness Center",
  "Balcony/Patio",
  "Fireplace",
  "Walk-in Closet",
  "Hardwood Floors",
  "Carpet",
  "Tile Floors",
  "Updated Kitchen",
  "Updated Bathroom"
];

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyImage, setPropertyImage] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.leads.getAll(),
  });

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address: "",
      bedrooms: "",
      bathrooms: "",
      squareFeet: "",
      rent: "",
      deposit: "",
      description: "",
      imageUrl: "",
      available: true,
      propertyType: "",
      amenities: [],
      petPolicy: "",
      parkingSpaces: "",
      leaseTerms: "",
    }
  });

  const createPropertyMutation = useMutation({
    mutationFn: (data: InsertProperty) => api.properties.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property created",
        description: "Your property has been successfully added.",
      });
      setIsModalOpen(false);
      form.reset();
      setSelectedAmenities([]);
      setPropertyImage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    const propertyData: InsertProperty = {
      ...data,
      imageUrl: propertyImage,
    };
    createPropertyMutation.mutate(propertyData);
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPropertyImage(result);
        form.setValue("imageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLeadCountForProperty = (propertyId: number) => {
    return leads.filter(lead => lead.propertyId === propertyId).length;
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header title="Properties" subtitle="Manage your rental property listings" />
        <main className="p-6 overflow-y-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-20 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
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
      <Header title="Properties" subtitle="Manage your rental property listings" />
      
      <main className="p-6 overflow-y-auto h-full">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search properties..."
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
              <Button className="bg-primary hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Add New Property
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Property Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Property Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {propertyImage ? (
                          <div className="relative">
                            <img
                              src={propertyImage}
                              alt="Property preview"
                              className="w-32 h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => {
                                setPropertyImage("");
                                form.setValue("imageUrl", "");
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            <Upload className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('property-image')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                        <input
                          id="property-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload a high-quality photo of your property
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Property Name *</Label>
                        <Input
                          id="name"
                          {...form.register("name")}
                          placeholder="e.g., Sunset Apartments"
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="propertyType">Property Type *</Label>
                        <Select onValueChange={(value) => form.setValue("propertyType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPERTY_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.propertyType && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.propertyType.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        {...form.register("address")}
                        placeholder="e.g., 123 Main St, City, State ZIP"
                      />
                      {form.formState.errors.address && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.address.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Describe your property, its features, and what makes it special..."
                        rows={4}
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms *</Label>
                        <Select onValueChange={(value) => form.setValue("bedrooms", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Beds" />
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
                        {form.formState.errors.bedrooms && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.bedrooms.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="bathrooms">Bathrooms *</Label>
                        <Select onValueChange={(value) => form.setValue("bathrooms", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Baths" />
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
                        {form.formState.errors.bathrooms && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.bathrooms.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="squareFeet">Square Feet</Label>
                        <Input
                          id="squareFeet"
                          {...form.register("squareFeet")}
                          placeholder="e.g., 1200"
                          type="number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                        <Select onValueChange={(value) => form.setValue("parkingSpaces", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Parking" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            <SelectItem value="1">1 Space</SelectItem>
                            <SelectItem value="2">2 Spaces</SelectItem>
                            <SelectItem value="3+">3+ Spaces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing and Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Pricing & Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="rent">Monthly Rent *</Label>
                        <Input
                          id="rent"
                          {...form.register("rent")}
                          placeholder="e.g., $2,500"
                        />
                        {form.formState.errors.rent && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.rent.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="deposit">Security Deposit</Label>
                        <Input
                          id="deposit"
                          {...form.register("deposit")}
                          placeholder="e.g., $2,500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="available">Availability</Label>
                        <Select 
                          defaultValue="true"
                          onValueChange={(value) => form.setValue("available", value === "true")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Available Now</SelectItem>
                            <SelectItem value="false">Not Available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="petPolicy">Pet Policy</Label>
                        <Select onValueChange={(value) => form.setValue("petPolicy", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pet policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No Pets">No Pets</SelectItem>
                            <SelectItem value="Cats Only">Cats Only</SelectItem>
                            <SelectItem value="Dogs Only">Dogs Only</SelectItem>
                            <SelectItem value="Cats and Dogs">Cats and Dogs</SelectItem>
                            <SelectItem value="All Pets Welcome">All Pets Welcome</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="leaseTerms">Lease Terms</Label>
                        <Select onValueChange={(value) => form.setValue("leaseTerms", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lease term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Month-to-Month">Month-to-Month</SelectItem>
                            <SelectItem value="6 Months">6 Months</SelectItem>
                            <SelectItem value="12 Months">12 Months</SelectItem>
                            <SelectItem value="18 Months">18 Months</SelectItem>
                            <SelectItem value="24 Months">24 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select all amenities and features that apply to this property
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {AMENITIES.map((amenity) => (
                        <div
                          key={amenity}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAmenities.includes(amenity)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleAmenityToggle(amenity)}
                        >
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                    {selectedAmenities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Selected amenities:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedAmenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
                    disabled={createPropertyMutation.isPending}
                    className="bg-primary hover:bg-blue-600"
                  >
                    {createPropertyMutation.isPending ? "Creating..." : "Create Property"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              leadCount={getLeadCountForProperty(property.id)}
            />
          ))}
        </div>

        {filteredProperties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No properties found matching your search." : "No properties found."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
