import { Header } from "@/components/header";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Cloud, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  Users, 
  Calendar,
  Settings,
  Link as LinkIcon,
  Download
} from "lucide-react";

const INTEGRATION_PLATFORMS = [
  {
    id: "zillow",
    name: "Zillow Rental Manager",
    description: "Sync properties and leads from Zillow's rental platform",
    icon: Building,
    status: "available",
    features: ["Property listings", "Lead management", "Rental applications"]
  },
  {
    id: "appfolio",
    name: "AppFolio",
    description: "Connect your AppFolio property management software",
    icon: Cloud,
    status: "available", 
    features: ["Property portfolio", "Tenant data", "Maintenance requests"]
  },
  {
    id: "buildium",
    name: "Buildium",
    description: "Import from Buildium property management platform",
    icon: Building,
    status: "available",
    features: ["Properties", "Leases", "Accounting data"]
  },
  {
    id: "rentspree",
    name: "RentSpree",
    description: "Sync leads and applications from RentSpree",
    icon: Users,
    status: "available",
    features: ["Lead tracking", "Applications", "Showings"]
  },
  {
    id: "cozy",
    name: "Cozy (Apartments.com)",
    description: "Connect with Cozy property management tools",
    icon: Cloud,
    status: "available",
    features: ["Listings", "Applications", "Rent collection"]
  }
];

export default function Import() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("integrations");
  const [integrations, setIntegrations] = useState<{[key: string]: any}>({});
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleApiKeySubmit = async (platformId: string, apiKey: string, additionalData?: any) => {
    setIsConnecting(platformId);
    
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => ({
        ...prev,
        [platformId]: {
          connected: true,
          apiKey: apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4),
          lastSync: new Date().toISOString(),
          ...additionalData
        }
      }));

      toast({
        title: "Integration Connected",
        description: `Successfully connected to ${INTEGRATION_PLATFORMS.find(p => p.id === platformId)?.name}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleSync = async (platformId: string) => {
    setIsConnecting(platformId);
    
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIntegrations(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          lastSync: new Date().toISOString()
        }
      }));

      toast({
        title: "Sync Complete",
        description: "Properties and leads have been updated from your connected platform.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = (platformId: string) => {
    setIntegrations(prev => {
      const updated = { ...prev };
      delete updated[platformId];
      return updated;
    });

    toast({
      title: "Integration Disconnected",
      description: `Disconnected from ${INTEGRATION_PLATFORMS.find(p => p.id === platformId)?.name}`,
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header 
        title="Data Integration Hub" 
        subtitle="Connect your property management platforms and automate data synchronization"
      />
      
      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "integrations" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("integrations")}
            className="flex items-center space-x-2"
          >
            <LinkIcon className="w-4 h-4" />
            <span>API Integrations</span>
          </Button>
          <Button
            variant={activeTab === "manual" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("manual")}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Manual Import</span>
          </Button>
        </div>

        {/* API Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Object.keys(integrations).length}
                      </p>
                      <p className="text-sm text-gray-600">Connected Platforms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">Auto-Sync</p>
                      <p className="text-sm text-gray-600">Every 15 minutes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">Real-time</p>
                      <p className="text-sm text-gray-600">Lead Capture</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Platforms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {INTEGRATION_PLATFORMS.map((platform) => {
                const integration = integrations[platform.id];
                const isConnected = !!integration?.connected;
                const isLoading = isConnecting === platform.id;

                return (
                  <Card key={platform.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <platform.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{platform.name}</CardTitle>
                            <p className="text-sm text-gray-600">{platform.description}</p>
                          </div>
                        </div>
                        <Badge variant={isConnected ? "default" : "secondary"}>
                          {isConnected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Features */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {platform.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Connection Form or Status */}
                      {!isConnected ? (
                        <ApiKeyForm
                          platformId={platform.id}
                          onSubmit={handleApiKeySubmit}
                          isLoading={isLoading}
                        />
                      ) : (
                        <ConnectedStatus
                          integration={integration}
                          onSync={() => handleSync(platform.id)}
                          onDisconnect={() => handleDisconnect(platform.id)}
                          isLoading={isLoading}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Import Tab */}
        {activeTab === "manual" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual File Import</CardTitle>
                <p className="text-sm text-gray-600">
                  Upload CSV files containing property or lead data for one-time imports
                </p>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>

            {/* Import Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Download Templates</CardTitle>
                <p className="text-sm text-gray-600">
                  Use these CSV templates to format your data correctly
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="w-5 h-5" />
                      <span className="font-medium">Properties Template</span>
                    </div>
                    <p className="text-sm text-gray-600 text-left">
                      Template for importing property listings, addresses, and rental details
                    </p>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Leads Template</span>
                    </div>
                    <p className="text-sm text-gray-600 text-left">
                      Template for importing prospect contact information and preferences
                    </p>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// API Key Form Component
function ApiKeyForm({ 
  platformId, 
  onSubmit, 
  isLoading 
}: { 
  platformId: string; 
  onSubmit: (platformId: string, apiKey: string, additionalData?: any) => void; 
  isLoading: boolean; 
}) {
  const [apiKey, setApiKey] = useState("");
  const [additionalFields, setAdditionalFields] = useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(platformId, apiKey, additionalFields);
    }
  };

  // Platform-specific additional fields
  const getAdditionalFields = () => {
    switch (platformId) {
      case "zillow":
        return [
          { key: "partnerId", label: "Partner ID", required: true },
          { key: "listingFeedId", label: "Listing Feed ID", required: false }
        ];
      case "appfolio":
        return [
          { key: "databaseId", label: "Database ID", required: true }
        ];
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`apiKey-${platformId}`}>API Key</Label>
        <Input
          id={`apiKey-${platformId}`}
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          required
        />
      </div>

      {getAdditionalFields().map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`${field.key}-${platformId}`}>
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={`${field.key}-${platformId}`}
            value={additionalFields[field.key] || ""}
            onChange={(e) => setAdditionalFields(prev => ({
              ...prev,
              [field.key]: e.target.value
            }))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        </div>
      ))}

      <Button 
        type="submit" 
        disabled={isLoading || !apiKey.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Key className="w-4 h-4 mr-2" />
            Connect Platform
          </>
        )}
      </Button>
    </form>
  );
}

// Connected Status Component
function ConnectedStatus({ 
  integration, 
  onSync, 
  onDisconnect, 
  isLoading 
}: { 
  integration: any; 
  onSync: () => void; 
  onDisconnect: () => void; 
  isLoading: boolean; 
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span>Successfully connected</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">API Key:</span>
          <span className="font-mono">{integration.apiKey}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Last Sync:</span>
          <span>{new Date(integration.lastSync).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={onSync} 
          disabled={isLoading}
          size="sm"
          className="flex-1"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>
        
        <Button 
          onClick={onDisconnect} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}
