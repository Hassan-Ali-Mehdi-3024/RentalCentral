import { useState, useRef } from "react";
import { User, Camera, Building, Shield, Save, X } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";

const profileSchema = z.object({
  isLicensedAgent: z.boolean(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  
  // Licensed Agent Fields
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  licenseExpiration: z.string().optional(),
  brokerageName: z.string().optional(),
  brokerageAddress: z.string().optional(),
  brokeragePhone: z.string().optional(),
  yearsExperience: z.number().optional(),
  specialties: z.array(z.string()).optional(),
  
  // Property Owner Fields
  companyName: z.string().optional(),
  businessAddress: z.string().optional(),
  numberOfProperties: z.number().optional(),
  propertyTypes: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const AGENT_SPECIALTIES = [
  "Residential Sales",
  "Commercial Real Estate",
  "Luxury Properties",
  "First-Time Buyers",
  "Investment Properties",
  "Property Management",
  "Relocation Services",
  "New Construction",
  "Foreclosures & REOs",
  "Land Development"
];

const PROPERTY_TYPES = [
  "Single Family Homes",
  "Condominiums",
  "Townhouses",
  "Apartments",
  "Commercial Buildings",
  "Mixed-Use Properties",
  "Vacation Rentals",
  "Student Housing",
  "Senior Living",
  "Industrial Properties"
];

export default function Profile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: () => api.profile.get(),
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      isLicensedAgent: false,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      website: "",
      licenseNumber: "",
      licenseState: "",
      licenseExpiration: "",
      brokerageName: "",
      brokerageAddress: "",
      brokeragePhone: "",
      yearsExperience: 0,
      companyName: "",
      businessAddress: "",
      numberOfProperties: 0,
    }
  });

  const { watch, setValue } = form;
  const isLicensedAgent = watch("isLicensedAgent");

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        isLicensedAgent: profile.isLicensedAgent || false,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        website: profile.website || "",
        licenseNumber: profile.licenseNumber || "",
        licenseState: profile.licenseState || "",
        licenseExpiration: profile.licenseExpiration || "",
        brokerageName: profile.brokerageName || "",
        brokerageAddress: profile.brokerageAddress || "",
        brokeragePhone: profile.brokeragePhone || "",
        yearsExperience: profile.yearsExperience || 0,
        companyName: profile.companyName || "",
        businessAddress: profile.businessAddress || "",
        numberOfProperties: profile.numberOfProperties || 0,
      });
      
      setProfileImage(profile.profileImageUrl || null);
      setSelectedSpecialties(profile.specialties ? JSON.parse(profile.specialties) : []);
      setSelectedPropertyTypes(profile.propertyTypes ? JSON.parse(profile.propertyTypes) : []);
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      const profileData = {
        ...data,
        specialties: JSON.stringify(selectedSpecialties),
        propertyTypes: JSON.stringify(selectedPropertyTypes),
        profileImageUrl: profileImage,
      };
      return api.profile.update(profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handlePropertyTypeToggle = (type: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header title="Profile Settings" subtitle="Manage your professional profile" />
        <main className="p-6 overflow-y-auto h-full">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Header title="Profile Settings" subtitle="Manage your professional profile" />
      
      <main className="p-6 overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image and Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {getInitials(watch("firstName"), watch("lastName"))}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a professional photo that will be displayed on your profile
                    </p>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Professional Role</Label>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={isLicensedAgent}
                      onCheckedChange={(checked) => setValue("isLicensedAgent", checked)}
                    />
                    <div className="flex items-center space-x-2">
                      {isLicensedAgent ? (
                        <>
                          <Shield className="h-5 w-5 text-primary" />
                          <span className="font-medium">Licensed Real Estate Agent</span>
                          <Badge className="bg-primary">Licensed</Badge>
                        </>
                      ) : (
                        <>
                          <Building className="h-5 w-5 text-secondary" />
                          <span className="font-medium">Property Owner</span>
                          <Badge variant="secondary">Owner</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isLicensedAgent 
                      ? "Select this if you have a real estate license and represent clients in property transactions."
                      : "Select this if you own rental properties and manage them directly."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="Enter your first name"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Enter your last name"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Enter your email address"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    {...form.register("bio")}
                    placeholder="Write a brief professional bio..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...form.register("website")}
                    placeholder="https://your-website.com"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Licensed Agent Information */}
            {isLicensedAgent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Licensed Agent Information
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        {...form.register("licenseNumber")}
                        placeholder="Enter your license number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="licenseState">License State *</Label>
                      <Select value={watch("licenseState") || ""} onValueChange={(value) => setValue("licenseState", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseExpiration">License Expiration</Label>
                      <Input
                        id="licenseExpiration"
                        type="date"
                        {...form.register("licenseExpiration")}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="yearsExperience">Years of Experience</Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        {...form.register("yearsExperience", { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="brokerageName">Brokerage Name *</Label>
                    <Input
                      id="brokerageName"
                      {...form.register("brokerageName")}
                      placeholder="Enter your brokerage name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brokerageAddress">Brokerage Address</Label>
                    <Textarea
                      id="brokerageAddress"
                      {...form.register("brokerageAddress")}
                      placeholder="Enter the full brokerage address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="brokeragePhone">Brokerage Phone</Label>
                    <Input
                      id="brokeragePhone"
                      type="tel"
                      {...form.register("brokeragePhone")}
                      placeholder="Enter brokerage phone number"
                    />
                  </div>

                  <div>
                    <Label>Specialties</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select your areas of expertise (you can select multiple)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {AGENT_SPECIALTIES.map((specialty) => (
                        <div
                          key={specialty}
                          className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                            selectedSpecialties.includes(specialty)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSpecialtyToggle(specialty)}
                        >
                          <span className="text-sm">{specialty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Owner Information */}
            {!isLicensedAgent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Property Owner Information
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      {...form.register("companyName")}
                      placeholder="Enter your company or business name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      {...form.register("businessAddress")}
                      placeholder="Enter your business address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="numberOfProperties">Number of Properties</Label>
                    <Input
                      id="numberOfProperties"
                      type="number"
                      min="0"
                      {...form.register("numberOfProperties", { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Property Types</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select the types of properties you own or manage
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PROPERTY_TYPES.map((type) => (
                        <div
                          key={type}
                          className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                            selectedPropertyTypes.includes(type)
                              ? "bg-secondary text-secondary-foreground border-secondary"
                              : "bg-background border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handlePropertyTypeToggle(type)}
                        >
                          <span className="text-sm">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                <X className="h-4 w-4 mr-2" />
                Reset Changes
              </Button>
              
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}