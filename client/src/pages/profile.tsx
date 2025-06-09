import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, MapPin, Phone, Mail, Building, FileText, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  profileImageUrl: z.string().optional(),
  isLicensedAgent: z.boolean(),
  // Licensed agent fields
  licenseNumber: z.string().optional(),
  brokerageName: z.string().optional(),
  brokerageAddress: z.string().optional(),
  brokeragePhone: z.string().optional(),
  licenseState: z.string().optional(),
  // Non-licensed owner fields
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  yearsInBusiness: z.number().optional(),
  numberOfProperties: z.number().optional(),
  propertyTypes: z.string().optional(),
}).refine((data) => {
  if (data.isLicensedAgent) {
    return data.licenseNumber && data.brokerageName && data.licenseState;
  } else {
    return data.businessName;
  }
}, {
  message: "Required fields must be filled based on license type",
  path: ["isLicensedAgent"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const PROPERTY_TYPES = [
  "Single Family Homes", "Condominiums", "Townhouses", "Apartments", 
  "Duplexes", "Commercial Properties", "Vacation Rentals", "Student Housing"
];

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "John",
      lastName: "Doe", 
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      profileImageUrl: "",
      isLicensedAgent: false,
      businessName: "",
      businessAddress: "",
      yearsInBusiness: 0,
      numberOfProperties: 0,
    },
  });

  const isLicensedAgent = form.watch("isLicensedAgent");

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // In a real app, this would call the API
      console.log("Profile data:", { ...data, propertyTypes: selectedPropertyTypes });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = () => {
    // In a real app, this would handle image upload
    toast({
      title: "Feature Coming Soon",
      description: "Image upload functionality will be available soon.",
    });
  };

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profile Settings" subtitle="Manage your account information and preferences" />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={form.watch("profileImageUrl") || ""} />
                  <AvatarFallback className="text-lg">
                    {form.watch("firstName")?.[0]}{form.watch("lastName")?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                    onClick={handleImageUpload}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {form.watch("firstName")} {form.watch("lastName")}
                </h1>
                <p className="text-gray-600">{form.watch("email")}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant={isLicensedAgent ? "default" : "secondary"}>
                    {isLicensedAgent ? "Licensed Real Estate Agent" : "Property Owner"}
                  </Badge>
                  {!isEditing && (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>Phone</span>
                  </Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License Type Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Professional Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Switch
                  id="isLicensedAgent"
                  checked={isLicensedAgent}
                  onCheckedChange={(checked) => form.setValue("isLicensedAgent", checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="isLicensedAgent" className="text-sm font-medium">
                  I am a licensed real estate agent
                </Label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {isLicensedAgent 
                  ? "You'll need to provide your license information and brokerage details." 
                  : "You'll provide information about your property portfolio and business."}
              </p>
            </CardContent>
          </Card>

          {/* Licensed Agent Information */}
          {isLicensedAgent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Real Estate License Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number *</Label>
                    <Input
                      id="licenseNumber"
                      {...form.register("licenseNumber")}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="Enter your license number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licenseState">License State *</Label>
                    <Select 
                      value={form.watch("licenseState")} 
                      onValueChange={(value) => form.setValue("licenseState", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokerageName">Brokerage Name *</Label>
                  <Input
                    id="brokerageName"
                    {...form.register("brokerageName")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Enter your brokerage name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokerageAddress" className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Brokerage Address</span>
                  </Label>
                  <Textarea
                    id="brokerageAddress"
                    {...form.register("brokerageAddress")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Enter complete brokerage address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokeragePhone">Brokerage Phone</Label>
                  <Input
                    id="brokeragePhone"
                    {...form.register("brokeragePhone")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Brokerage phone number"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Owner Information */}
          {!isLicensedAgent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Property Portfolio Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    {...form.register("businessName")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Your business or property management company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress" className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Business Address</span>
                  </Label>
                  <Textarea
                    id="businessAddress"
                    {...form.register("businessAddress")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Enter your business address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness" className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Years in Business</span>
                    </Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      {...form.register("yearsInBusiness", { valueAsNumber: true })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numberOfProperties">Number of Properties</Label>
                    <Input
                      id="numberOfProperties"
                      type="number"
                      {...form.register("numberOfProperties", { valueAsNumber: true })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Property Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={selectedPropertyTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => isEditing && togglePropertyType(type)}
                        disabled={!isEditing}
                        className="justify-start text-xs"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Select the types of properties you manage or own.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}