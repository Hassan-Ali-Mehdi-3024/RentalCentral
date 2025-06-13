import { useState, useEffect } from "react";
import { User, Camera, Building, Shield, Save, Upload } from "lucide-react";
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
import type { UserProfile, InsertUserProfile } from "@shared/schema";

const profileSchema = z.object({
  isLicensedAgent: z.boolean(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  profileImageUrl: z.string().optional(),
  
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
  { value: "WY", label: "Wyoming" }
];

const PROPERTY_TYPES = [
  "Single Family Home",
  "Multi-Family",
  "Apartment Complex",
  "Condo",
  "Townhouse",
  "Commercial",
  "Office Building",
  "Retail Space",
  "Warehouse",
  "Mixed Use"
];

const SPECIALTIES = [
  "Residential Sales",
  "Commercial Real Estate",
  "Property Management",
  "Investment Properties",
  "Luxury Homes",
  "First-Time Buyers",
  "Relocation Services",
  "Short Sales",
  "Foreclosures",
  "New Construction"
];

export default function Profile() {
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  
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
      profileImageUrl: "",
      licenseNumber: "",
      licenseState: "",
      licenseExpiration: "",
      brokerageName: "",
      brokerageAddress: "",
      brokeragePhone: "",
      yearsExperience: 0,
      specialties: [],
      companyName: "",
      businessAddress: "",
      numberOfProperties: 0,
      propertyTypes: [],
    }
  });

  const { watch, setValue, register, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();
  const isLicensedAgent = watchedValues.isLicensedAgent;

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        isLicensedAgent: profile.isLicensedAgent || false,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        website: profile.website || "",
        profileImageUrl: profile.profileImageUrl || "",
        licenseNumber: profile.licenseNumber || "",
        licenseState: profile.licenseState || "",
        licenseExpiration: profile.licenseExpiration || "",
        brokerageName: profile.brokerageName || "",
        brokerageAddress: profile.brokerageAddress || "",
        brokeragePhone: profile.brokeragePhone || "",
        yearsExperience: profile.yearsExperience || 0,
        specialties: (typeof profile.specialties === 'string' ? JSON.parse(profile.specialties) : profile.specialties) || [],
        companyName: profile.companyName || "",
        businessAddress: profile.businessAddress || "",
        numberOfProperties: profile.numberOfProperties || 0,
        propertyTypes: (typeof profile.propertyTypes === 'string' ? JSON.parse(profile.propertyTypes) : profile.propertyTypes) || [],
      });
      
      setSelectedPropertyTypes((typeof profile.propertyTypes === 'string' ? JSON.parse(profile.propertyTypes) : profile.propertyTypes) || []);
      setSelectedSpecialties((typeof profile.specialties === 'string' ? JSON.parse(profile.specialties) : profile.specialties) || []);
      setProfileImage(profile.profileImageUrl || "");
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: InsertUserProfile) => api.profile.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    // Convert arrays to JSON strings for storage
    const profileData: any = {
      ...data,
      userId: "user-123", // Mock user ID for demo
      propertyTypes: JSON.stringify(selectedPropertyTypes),
      specialties: JSON.stringify(selectedSpecialties),
      profileImageUrl: profileImage,
    };
    
    updateProfileMutation.mutate(profileData);
  };

  const handlePropertyTypeToggle = (type: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, upload to cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        setValue("profileImageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <Header title="Profile Settings" subtitle="Manage your account information" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <Header title="Profile Settings" subtitle="Manage your account information and professional details" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => document.getElementById('profile-image')?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a professional photo to help clients recognize you
                </p>
              </div>
            </div>

            {/* License Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <Label htmlFor="isLicensedAgent" className="text-base font-medium">
                    Licensed Real Estate Agent
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Are you a licensed real estate professional?
                  </p>
                </div>
              </div>
              <Switch
                id="isLicensedAgent"
                checked={isLicensedAgent}
                onCheckedChange={(checked) => setValue("isLicensedAgent", checked)}
              />
            </div>

            {isLicensedAgent && (
              <Badge className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Licensed Professional
              </Badge>
            )}
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
                  {...register("firstName")}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell clients about your experience and expertise"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register("website")}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Licensed Agent Information */}
        {isLicensedAgent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Licensed Agent Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    {...register("licenseNumber")}
                    placeholder="Enter your license number"
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.licenseNumber.message}</p>
                  )}
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
                  {errors.licenseState && (
                    <p className="text-sm text-red-600 mt-1">{errors.licenseState.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseExpiration">License Expiration</Label>
                  <Input
                    id="licenseExpiration"
                    type="date"
                    {...register("licenseExpiration")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    {...register("yearsExperience", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="brokerageName">Brokerage Name *</Label>
                <Input
                  id="brokerageName"
                  {...register("brokerageName")}
                  placeholder="Enter your brokerage name"
                />
                {errors.brokerageName && (
                  <p className="text-sm text-red-600 mt-1">{errors.brokerageName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="brokerageAddress">Brokerage Address</Label>
                <Textarea
                  id="brokerageAddress"
                  {...register("brokerageAddress")}
                  placeholder="Enter your brokerage address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="brokeragePhone">Brokerage Phone</Label>
                <Input
                  id="brokeragePhone"
                  type="tel"
                  {...register("brokeragePhone")}
                  placeholder="Enter brokerage phone number"
                />
              </div>

              <div>
                <Label>Specialties</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select your areas of expertise
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SPECIALTIES.map((specialty) => (
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
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  {...register("companyName")}
                  placeholder="Enter your company name (if applicable)"
                />
              </div>

              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  {...register("businessAddress")}
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
                  {...register("numberOfProperties", { valueAsNumber: true })}
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={updateProfileMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}