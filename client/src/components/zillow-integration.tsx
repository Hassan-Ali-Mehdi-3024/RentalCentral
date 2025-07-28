import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Download, TestTube, MapPin, DollarSign, Home, Bed, Bath, Square } from "lucide-react";

interface ZillowProperty {
  propertyId: string;
  fullAddress: string;
  listingStatus: string;
  price: number;
  beds?: number;
  baths?: number;
  squareFootage?: number;
  primaryPhotoUrl?: string;
  listingPermalink: string;
  rentEstimate?: number;
  valueEstimate?: number;
}

interface ZillowSyncResult {
  success: boolean;
  message: string;
  propertiesCount: number;
  syncedCount?: number;
  savedPath?: string;
  timestamp: string;
  properties?: ZillowProperty[];
  sampleProperty?: ZillowProperty;
  totalProperties?: number;
}

export default function ZillowIntegration() {
  const [location, setLocation] = useState("Los Angeles, CA");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Test Zillow API connection
  const testMutation = useMutation({
    mutationFn: async (): Promise<ZillowSyncResult> => {
      const response = await fetch("/api/zillow/test");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to test Zillow connection");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test Successful",
        description: `Found ${data.totalProperties || 0} properties. API is working correctly.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync properties from Zillow
  const syncMutation = useMutation({
    mutationFn: async (): Promise<ZillowSyncResult> => {
      const response = await fetch("/api/zillow/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to sync properties");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Completed",
        description: `Retrieved ${data.propertiesCount} properties, synced ${data.syncedCount || 0} new ones to database.`,
      });
      // Invalidate properties cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch properties by location
  const fetchMutation = useMutation({
    mutationFn: async (searchLocation: string): Promise<ZillowSyncResult> => {
      const response = await fetch(`/api/zillow/properties?location=${encodeURIComponent(searchLocation)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to fetch properties");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Properties Retrieved",
        description: `Found ${data.count || 0} properties for the specified location.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fetch Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLocationSearch = () => {
    if (!location.trim()) {
      toast({
        title: "Invalid Location",
        description: "Please enter a valid location or address.",
        variant: "destructive",
      });
      return;
    }
    fetchMutation.mutate(location);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'for sale': return 'bg-green-100 text-green-800';
      case 'for rent': return 'bg-blue-100 text-blue-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'off market': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Zillow Property Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect to your Zillow account to automatically retrieve and sync property listings.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Testing Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              {testMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Test Connection
            </Button>
            
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="flex items-center gap-2"
            >
              {syncMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Sync All Properties
            </Button>
          </div>

          <Separator />

          {/* Location Search Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Search Properties by Location</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter city, state, or address (e.g., Los Angeles, CA)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <Button
                onClick={handleLocationSearch}
                disabled={fetchMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                {fetchMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Results Display */}
          {(testMutation.data || syncMutation.data || fetchMutation.data) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Results</h4>
                
                {testMutation.data && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <TestTube className="h-4 w-4" />
                      <span className="font-medium">Connection Test Results</span>
                    </div>
                    <p className="text-sm text-green-700">{testMutation.data.message}</p>
                    {testMutation.data.sampleProperty && (
                      <div className="mt-3 text-xs text-green-600">
                        <strong>Sample Property:</strong> {testMutation.data.sampleProperty.fullAddress}
                      </div>
                    )}
                  </div>
                )}

                {syncMutation.data && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <Download className="h-4 w-4" />
                      <span className="font-medium">Sync Results</span>
                    </div>
                    <p className="text-sm text-blue-700">{syncMutation.data.message}</p>
                    <div className="mt-2 text-xs text-blue-600">
                      <div>Retrieved: {syncMutation.data.propertiesCount} properties</div>
                      <div>Synced: {syncMutation.data.syncedCount || 0} new properties</div>
                      {syncMutation.data.savedPath && (
                        <div>Saved to: {syncMutation.data.savedPath}</div>
                      )}
                    </div>
                  </div>
                )}

                {fetchMutation.data && fetchMutation.data.properties && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-800">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Properties Found ({fetchMutation.data.count})</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {fetchMutation.data.properties.slice(0, 4).map((property, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h5 className="font-medium text-sm line-clamp-2">
                                  {property.fullAddress}
                                </h5>
                                <Badge className={getStatusColor(property.listingStatus)}>
                                  {property.listingStatus}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {property.price > 0 && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{formatCurrency(property.price)}</span>
                                  </div>
                                )}
                                {property.beds && (
                                  <div className="flex items-center gap-1">
                                    <Bed className="h-3 w-3" />
                                    <span>{property.beds}</span>
                                  </div>
                                )}
                                {property.baths && (
                                  <div className="flex items-center gap-1">
                                    <Bath className="h-3 w-3" />
                                    <span>{property.baths}</span>
                                  </div>
                                )}
                                {property.squareFootage && (
                                  <div className="flex items-center gap-1">
                                    <Square className="h-3 w-3" />
                                    <span>{property.squareFootage.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {(property.rentEstimate || property.valueEstimate) && (
                                <div className="text-xs text-muted-foreground">
                                  {property.rentEstimate && (
                                    <div>Rent Est: {formatCurrency(property.rentEstimate)}</div>
                                  )}
                                  {property.valueEstimate && (
                                    <div>Value Est: {formatCurrency(property.valueEstimate)}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {fetchMutation.data.count > 4 && (
                      <p className="text-sm text-muted-foreground">
                        Showing 4 of {fetchMutation.data.count} properties found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}