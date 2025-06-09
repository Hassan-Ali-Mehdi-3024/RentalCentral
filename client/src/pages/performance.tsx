import { useState } from "react";
import { BarChart3, DollarSign, MessageSquare, TrendingUp } from "lucide-react";
import { Header } from "@/components/header";
import { RentalIncomeChart } from "@/components/rental-income-chart";
import { FeedbackCategories } from "@/components/feedback-categories";
import { InquiryTracking } from "@/components/inquiry-tracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Performance() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["/api/performance", selectedPropertyId],
    queryFn: () => selectedPropertyId ? api.performance.getPropertyPerformance(selectedPropertyId) : null,
    enabled: !!selectedPropertyId
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  // Sample data for demonstration - in production this would come from the API
  const sampleProspects = selectedPropertyId ? [
    {
      leadId: 1,
      leadName: "Sarah Johnson",
      proposedRent: 2200,
      moveInDate: "2025-07-15",
      vacancyDate: "2025-06-01",
      totalRentalIncome: 24200,
      monthsOfRent: 11
    },
    {
      leadId: 2,
      leadName: "Michael Chen",
      proposedRent: 2100,
      moveInDate: "2025-06-15",
      vacancyDate: "2025-06-01",
      totalRentalIncome: 25200,
      monthsOfRent: 12
    },
    {
      leadId: 3,
      leadName: "Emily Rodriguez",
      proposedRent: 2300,
      moveInDate: "2025-08-01",
      vacancyDate: "2025-06-01",
      totalRentalIncome: 23000,
      monthsOfRent: 10
    }
  ] : [];

  const sampleFeedbackCategories = selectedPropertyId ? [
    {
      category: 'price',
      summaryText: 'Most prospects find the pricing competitive for the area. Several mentioned it aligns with similar properties they\'ve viewed. A few suggested the rent could be slightly lower given some needed updates.',
      isEdited: true,
      editedBy: 'Agent Smith',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      responses: [
        'The price seems fair for what you get',
        'A bit high compared to other places I\'ve seen',
        'Good value for the location'
      ]
    },
    {
      category: 'amenities',
      summaryText: 'The in-unit laundry and updated kitchen are major selling points. However, several prospects mentioned wanting a dishwasher and air conditioning. The pool and fitness center received positive feedback.',
      isEdited: false,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-purple-600',
      responses: [
        'Love the in-unit washer and dryer',
        'Kitchen looks recently updated',
        'Would prefer if it had a dishwasher',
        'The pool area is really nice'
      ]
    },
    {
      category: 'location',
      summaryText: 'Excellent location feedback with proximity to public transit and downtown being highlighted. Some concerns about parking availability and street noise during peak hours.',
      isEdited: true,
      editedBy: 'Agent Smith',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-blue-600',
      responses: [
        'Great location, close to everything',
        'Love being near the metro station',
        'Parking seems limited',
        'Can be noisy during rush hour'
      ]
    }
  ] : [];

  const sampleInquiryData = selectedPropertyId ? [
    { date: '2025-01-01', inquiries: 5, tours: 2, dayName: 'Wednesday' },
    { date: '2025-01-02', inquiries: 8, tours: 3, dayName: 'Thursday' },
    { date: '2025-01-03', inquiries: 12, tours: 5, dayName: 'Friday' },
    { date: '2025-01-04', inquiries: 15, tours: 7, dayName: 'Saturday' },
    { date: '2025-01-05', inquiries: 10, tours: 4, dayName: 'Sunday' },
    { date: '2025-01-06', inquiries: 6, tours: 2, dayName: 'Monday' },
    { date: '2025-01-07', inquiries: 9, tours: 4, dayName: 'Tuesday' }
  ] : [];

  const totalInquiries = sampleInquiryData.reduce((sum, day) => sum + day.inquiries, 0);
  const totalTours = sampleInquiryData.reduce((sum, day) => sum + day.tours, 0);
  const conversionRate = totalInquiries > 0 ? Math.round((totalTours / totalInquiries) * 100) : 0;

  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Performance Summary" 
        subtitle="Comprehensive property analytics and rental income projections" 
      />
      
      <main className="p-6 overflow-y-auto h-full">
        <div className="space-y-6">
          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Property Performance Dashboard
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Analyze feedback data, rental income projections, and inquiry metrics for data-driven tenant selection
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="max-w-md">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Property for Analysis
                </label>
                <Select value={selectedPropertyId?.toString()} onValueChange={(value) => setSelectedPropertyId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{property.name}</span>
                          <Badge variant="outline" className="ml-2">
                            ${property.rent}/mo
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedProperty && (
            <>
              {/* Property Overview */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={selectedProperty.imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100"} 
                      alt={selectedProperty.name}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{selectedProperty.name}</h3>
                      <p className="text-muted-foreground">{selectedProperty.address}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">{selectedProperty.bedrooms}</Badge>
                        <Badge className="bg-primary">${selectedProperty.rent}/month</Badge>
                        <Badge variant={selectedProperty.available ? "default" : "secondary"}>
                          {selectedProperty.available ? "Available" : "Occupied"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics Tabs */}
              <Tabs defaultValue="income" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="income">Rental Income Analysis</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback Categories</TabsTrigger>
                  <TabsTrigger value="inquiries">Inquiry Tracking</TabsTrigger>
                </TabsList>
                
                <TabsContent value="income" className="space-y-6">
                  <RentalIncomeChart
                    propertyId={selectedPropertyId}
                    propertyName={selectedProperty.name}
                    currentRent={parseInt(selectedProperty.rent)}
                    vacancyDate="2025-06-01" // This would come from performance data
                    prospects={sampleProspects}
                  />
                </TabsContent>
                
                <TabsContent value="feedback" className="space-y-6">
                  <FeedbackCategories
                    propertyId={selectedPropertyId}
                    categories={sampleFeedbackCategories}
                  />
                </TabsContent>
                
                <TabsContent value="inquiries" className="space-y-6">
                  <InquiryTracking
                    propertyId={selectedPropertyId}
                    propertyName={selectedProperty.name}
                    dailyData={sampleInquiryData}
                    totalInquiries={totalInquiries}
                    totalTours={totalTours}
                    conversionRate={conversionRate}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}

          {!selectedPropertyId && (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Property Performance Analytics
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select a property above to view comprehensive analytics including rental income projections, 
                  categorized feedback summaries, and inquiry tracking metrics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">Income Analysis</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Compare total rental income across prospects
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">Feedback Categories</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Organized insights by price, amenities, location
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">Inquiry Metrics</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Daily and weekly inquiry and tour tracking
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}