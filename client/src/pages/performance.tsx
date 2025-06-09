import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Calendar, MapPin, Users, Eye, Edit3, Save, X, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, LineChart, Line } from "recharts";

export default function Performance() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const { data: performanceData } = useQuery({
    queryKey: ["/api/performance", selectedPropertyId],
    queryFn: () => selectedPropertyId ? api.performance.getPropertyPerformance(selectedPropertyId) : Promise.resolve(null),
    enabled: !!selectedPropertyId
  });

  const updateSummaryMutation = useMutation({
    mutationFn: (data: { propertyId: number; category: string; summary: string }) =>
      api.performance.updateSummary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      setEditingCategory(null);
      toast({
        title: "Summary Updated",
        description: "Feedback summary has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const handleEditSummary = (category: string, currentText: string) => {
    setEditingCategory(category);
    setEditText(currentText);
  };

  const handleSaveSummary = () => {
    if (selectedPropertyId && editingCategory) {
      updateSummaryMutation.mutate({
        propertyId: selectedPropertyId,
        category: editingCategory,
        summary: editText
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditText("");
  };

  // Process data for rental income comparison chart
  const rentalIncomeData = performanceData?.prospects?.map((prospect: any) => {
    const vacantDate = new Date(performanceData.property.vacantDate);
    const moveInDate = new Date(prospect.proposedMoveInDate);
    const yearEndDate = new Date(vacantDate);
    yearEndDate.setFullYear(yearEndDate.getFullYear() + 1);
    
    const daysVacant = Math.max(0, (moveInDate.getTime() - vacantDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysOccupied = Math.max(0, (yearEndDate.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalRental = (prospect.discoveredBudget || 0) * (daysOccupied / 30); // Approximate monthly calculation
    
    return {
      name: prospect.name,
      moveInDate: moveInDate.getTime(),
      proposedRent: prospect.discoveredBudget || 0,
      daysVacant,
      totalRental: Math.round(totalRental),
      moveInDateFormatted: moveInDate.toLocaleDateString()
    };
  }) || [];

  // Process inquiry and tour data
  const inquiryData = performanceData?.inquiries?.map((inquiry: any) => ({
    date: inquiry.date,
    inquiries: inquiry.count,
    tours: inquiry.tours || 0
  })) || [];

  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Performance Summary" 
        subtitle="Property performance analytics and feedback insights" 
      />
      
      <main className="p-6 overflow-y-auto h-full">
        <div className="space-y-6">
          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Property Performance Analysis</CardTitle>
              <p className="text-muted-foreground text-sm">
                Analyze prospect feedback, rental income potential, and property performance metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Property for Analysis
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

          {selectedPropertyId && performanceData && (
            <>
              {/* Property Overview */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={selectedProperty?.imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100"} 
                      alt={selectedProperty?.name}
                      className="w-24 h-18 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{selectedProperty?.name}</h3>
                      <p className="text-muted-foreground">{selectedProperty?.address}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">Listed: ${selectedProperty?.rent}/mo</Badge>
                        <Badge variant="outline">Vacant since: {performanceData.property.vacantDate}</Badge>
                        <Badge variant="outline">{performanceData.prospects?.length || 0} prospects</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Income Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Prospect Rental Income Comparison
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Compare total rental income potential by prospect move-in date and proposed rent
                  </p>
                </CardHeader>
                <CardContent>
                  {rentalIncomeData.length > 0 ? (
                    <>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart data={rentalIncomeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="moveInDate"
                              type="number"
                              scale="time"
                              domain={['dataMin', 'dataMax']}
                              tickFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <YAxis 
                              dataKey="proposedRent"
                              label={{ value: 'Proposed Monthly Rent ($)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              formatter={(value, name) => [
                                name === 'proposedRent' ? `$${value}/mo` : value,
                                name === 'proposedRent' ? 'Proposed Rent' : name
                              ]}
                              labelFormatter={(value) => `Move-in: ${new Date(value).toLocaleDateString()}`}
                            />
                            <Legend />
                            <Scatter 
                              dataKey="proposedRent" 
                              fill="#2B6CB0" 
                              name="Monthly Rent"
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Prospect Summary Table */}
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-foreground mb-4">Annual Rental Income Comparison</h4>
                        <div className="space-y-3">
                          {rentalIncomeData
                            .sort((a, b) => b.totalRental - a.totalRental)
                            .map((prospect, index) => (
                            <div key={prospect.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-400'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{prospect.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Move-in: {prospect.moveInDateFormatted} • ${prospect.proposedRent}/mo
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-foreground">${prospect.totalRental.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">
                                  {prospect.daysVacant} days vacant
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No prospect rental data available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inquiry and Tour Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Daily Inquiries & Tours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {inquiryData.length > 0 ? (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={inquiryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="inquiries" fill="#2B6CB0" name="Inquiries" />
                            <Bar dataKey="tours" fill="#059669" name="Tours" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No inquiry data available yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-5 w-5 text-primary" />
                          <span className="font-medium">Total Inquiries</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          {performanceData.metrics?.totalInquiries || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-secondary" />
                          <span className="font-medium">Tours Completed</span>
                        </div>
                        <span className="text-2xl font-bold text-secondary">
                          {performanceData.metrics?.totalTours || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-accent" />
                          <span className="font-medium">Conversion Rate</span>
                        </div>
                        <span className="text-2xl font-bold text-accent">
                          {performanceData.metrics?.conversionRate || "0%"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Avg. Proposed Rent</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">
                          ${performanceData.metrics?.averageProposedRent || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Categorized Feedback Summary
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Agent-editable summaries of prospect feedback by category
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {performanceData.feedbackCategories?.map((category: any) => (
                      <div key={category.name} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground flex items-center">
                            {category.icon && <span className="mr-2">{category.icon}</span>}
                            {category.name}
                          </h4>
                          {editingCategory === category.name ? (
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={handleSaveSummary}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditSummary(category.name, category.summary)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {editingCategory === category.name ? (
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[100px]"
                            placeholder="Enter feedback summary..."
                          />
                        ) : (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              {category.summary || "No feedback summary available yet."}
                            </p>
                          </div>
                        )}
                        
                        {category.highlights && category.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {category.highlights.map((highlight: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="col-span-2 text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No feedback categories available yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!selectedPropertyId && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select a Property</h3>
                  <p className="text-muted-foreground">
                    Choose a property above to view detailed performance analytics and feedback insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}