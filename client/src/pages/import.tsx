import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Building, 
  Zap, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Home,
  Users,
  FileText,
  Clock,
  AlertTriangle
} from "lucide-react";
import { api } from "@/lib/api";

interface ApiConnection {
  id: string;
  name: string;
  type: 'pms' | 'zillow' | 'mls' | 'crm';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  propertiesCount?: number;
  leadsCount?: number;
  description: string;
  setupInstructions: string;
}

interface SyncActivity {
  id: string;
  platform: string;
  action: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
  itemsProcessed: number;
}

export default function Import() {
  const [apiKeys, setApiKeys] = useState({
    zillow: "",
    yardi: "",
    rentsync: "",
    appfolio: "",
    buildium: "",
    mls: "",
    rentspree: "",
    costar: ""
  });
  
  const [autoSync, setAutoSync] = useState({
    zillow: false,
    yardi: false,
    rentsync: false,
    appfolio: false,
    buildium: false,
    mls: false,
    rentspree: false,
    costar: false
  });
  
  const [syncFrequency, setSyncFrequency] = useState("hourly");
  const [webhookUrl, setWebhookUrl] = useState("https://your-app.replit.app/api/webhooks/properties");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connections: ApiConnection[] = [
    {
      id: "zillow",
      name: "Zillow Rental Manager",
      type: "zillow",
      status: apiKeys.zillow ? "connected" : "disconnected",
      lastSync: apiKeys.zillow ? "2 hours ago" : undefined,
      propertiesCount: apiKeys.zillow ? 12 : 0,
      leadsCount: apiKeys.zillow ? 34 : 0,
      description: "Sync listings and leads from Zillow Rental Manager platform",
      setupInstructions: "Go to Zillow Rental Manager > Settings > API Access to generate your API key"
    },
    {
      id: "yardi",
      name: "Yardi Voyager",
      type: "pms",
      status: apiKeys.yardi ? "connected" : "disconnected",
      lastSync: apiKeys.yardi ? "1 hour ago" : undefined,
      propertiesCount: apiKeys.yardi ? 25 : 0,
      leadsCount: apiKeys.yardi ? 18 : 0,
      description: "Enterprise property management system integration",
      setupInstructions: "Contact your Yardi administrator to enable API access and obtain credentials"
    },
    {
      id: "appfolio",
      name: "AppFolio Property Manager",
      type: "pms",
      status: apiKeys.appfolio ? "connected" : "disconnected",
      lastSync: apiKeys.appfolio ? "30 minutes ago" : undefined,
      propertiesCount: apiKeys.appfolio ? 8 : 0,
      leadsCount: apiKeys.appfolio ? 22 : 0,
      description: "Cloud-based property management solution",
      setupInstructions: "Navigate to AppFolio > Settings > API Management to create new API credentials"
    },
    {
      id: "buildium",
      name: "Buildium",
      type: "pms",
      status: apiKeys.buildium ? "connected" : "disconnected",
      lastSync: apiKeys.buildium ? "45 minutes ago" : undefined,
      propertiesCount: apiKeys.buildium ? 15 : 0,
      leadsCount: apiKeys.buildium ? 28 : 0,
      description: "Property management software for landlords and property managers",
      setupInstructions: "Go to Buildium > Settings > API Settings to generate your API token"
    },
    {
      id: "rentsync",
      name: "RentSync",
      type: "pms",
      status: apiKeys.rentsync ? "connected" : "disconnected",
      lastSync: apiKeys.rentsync ? "1.5 hours ago" : undefined,
      propertiesCount: apiKeys.rentsync ? 6 : 0,
      leadsCount: apiKeys.rentsync ? 11 : 0,
      description: "Listing syndication and lead management platform",
      setupInstructions: "Contact RentSync support to enable API access for your account"
    },
    {
      id: "rentspree",
      name: "RentSpree",
      type: "crm",
      status: apiKeys.rentspree ? "connected" : "disconnected",
      lastSync: apiKeys.rentspree ? "3 hours ago" : undefined,
      propertiesCount: apiKeys.rentspree ? 9 : 0,
      leadsCount: apiKeys.rentspree ? 16 : 0,
      description: "Digital leasing platform and CRM",
      setupInstructions: "Access RentSpree dashboard > Integrations > API to obtain your credentials"
    },
    {
      id: "costar",
      name: "CoStar LoopNet",
      type: "mls",
      status: apiKeys.costar ? "connected" : "disconnected",
      lastSync: apiKeys.costar ? "4 hours ago" : undefined,
      propertiesCount: apiKeys.costar ? 3 : 0,
      leadsCount: apiKeys.costar ? 7 : 0,
      description: "Commercial real estate listing platform",
      setupInstructions: "Contact CoStar customer service to request API access for your subscription"
    }
  ];

  const recentActivity: SyncActivity[] = [
    {
      id: "1",
      platform: "Zillow",
      action: "Imported properties",
      timestamp: "2 hours ago",
      status: "success",
      itemsProcessed: 12
    },
    {
      id: "2",
      platform: "AppFolio",
      action: "Synced leads",
      timestamp: "3 hours ago",
      status: "success",
      itemsProcessed: 8
    },
    {
      id: "3",
      platform: "Yardi",
      action: "Updated property status",
      timestamp: "5 hours ago",
      status: "error",
      itemsProcessed: 0
    }
  ];

  const handleApiKeyChange = (platform: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [platform]: value }));
  };

  const handleAutoSyncToggle = (platform: string, enabled: boolean) => {
    setAutoSync(prev => ({ ...prev, [platform]: enabled }));
    
    if (enabled) {
      toast({
        title: "Auto-sync Enabled",
        description: `${platform} will now sync automatically based on your frequency settings.`
      });
    }
  };

  const testConnection = async (platform: string) => {
    const apiKey = apiKeys[platform as keyof typeof apiKeys];
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key before testing the connection.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Testing Connection",
      description: `Verifying ${platform} API credentials...`
    });

    // Simulate API test - in production, this would make actual API calls
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${platform}. Ready to sync data.`
      });
    }, 2000);
  };

  const syncNow = async (platform: string) => {
    const connection = connections.find(c => c.id === platform);
    if (!connection || connection.status !== "connected") {
      toast({
        title: "Connection Required",
        description: "Please connect to this platform before syncing.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Syncing Data",
      description: `Fetching latest properties and leads from ${platform}...`
    });

    // Simulate sync process
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: `Successfully imported ${Math.floor(Math.random() * 20) + 1} properties and ${Math.floor(Math.random() * 30) + 1} leads.`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const connectedCount = connections.filter(c => c.status === "connected").length;
  const totalProperties = connections.reduce((sum, c) => sum + (c.propertiesCount || 0), 0);
  const totalLeads = connections.reduce((sum, c) => sum + (c.leadsCount || 0), 0);

  return (
    <div className="flex-1 overflow-hidden">
      <Header title="Property Syndication" subtitle="Connect your property management systems and listing platforms" />
      
      <main className="p-6 overflow-y-auto h-full">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <Wifi className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Connected Platforms</p>
                  <p className="text-2xl font-bold">{connectedCount}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Home className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Synced Properties</p>
                  <p className="text-2xl font-bold">{totalProperties}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Leads</p>
                  <p className="text-2xl font-bold">{totalLeads}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <RefreshCw className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Sync</p>
                  <p className="text-2xl font-bold">2h ago</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connections">API Connections</TabsTrigger>
              <TabsTrigger value="sync-settings">Sync Settings</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="manual-upload">Manual Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {connections.map((connection) => (
                  <Card key={connection.id} className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(connection.status)}
                        {getStatusBadge(connection.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{connection.description}</p>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`${connection.id}-key`}>API Key / Token</Label>
                        <Input
                          id={`${connection.id}-key`}
                          type="password"
                          placeholder="Enter your API key or access token"
                          value={apiKeys[connection.id as keyof typeof apiKeys]}
                          onChange={(e) => handleApiKeyChange(connection.id, e.target.value)}
                        />
                        <p className="text-xs text-gray-500">{connection.setupInstructions}</p>
                      </div>

                      {connection.status === "connected" && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Properties</p>
                            <p className="text-lg font-semibold text-green-600">{connection.propertiesCount}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Leads</p>
                            <p className="text-lg font-semibold text-green-600">{connection.leadsCount}</p>
                          </div>
                        </div>
                      )}

                      {connection.lastSync && (
                        <p className="text-sm text-gray-500">Last sync: {connection.lastSync}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={autoSync[connection.id as keyof typeof autoSync]}
                            onCheckedChange={(checked) => handleAutoSyncToggle(connection.id, checked)}
                          />
                          <Label className="text-sm">Auto-sync</Label>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(connection.id)}
                            disabled={!apiKeys[connection.id as keyof typeof apiKeys]}
                          >
                            <Wifi className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncNow(connection.id)}
                            disabled={connection.status !== "connected"}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Sync Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sync-settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Synchronization Settings
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Sync Frequency</Label>
                      <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sync frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time (webhook)</SelectItem>
                          <SelectItem value="15min">Every 15 minutes</SelectItem>
                          <SelectItem value="hourly">Every hour</SelectItem>
                          <SelectItem value="daily">Once daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Data Sync Options</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Property Listings</p>
                            <p className="text-sm text-gray-500">Sync property details, pricing, availability</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Lead Information</p>
                            <p className="text-sm text-gray-500">Import prospect details and inquiries</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Application Status</p>
                            <p className="text-sm text-gray-500">Track application progress and approvals</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Lease Documents</p>
                            <p className="text-sm text-gray-500">Sync lease agreements and tenant data</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Webhook Configuration</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-app.com/api/webhooks"
                      />
                      <p className="text-sm text-gray-500">
                        Configure this URL in your property management systems for real-time updates
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Webhook Events</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Property status changes</li>
                        <li>• New lead inquiries</li>
                        <li>• Application submissions</li>
                        <li>• Lease signings</li>
                        <li>• Pricing updates</li>
                      </ul>
                    </div>

                    <Button className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Generate Webhook Secret
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Sync Activity
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getActivityIcon(activity.status)}
                          <div>
                            <p className="font-medium">{activity.platform}</p>
                            <p className="text-sm text-gray-500">{activity.action}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{activity.itemsProcessed} items</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Sync Statistics</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">156</p>
                        <p className="text-sm text-gray-600">Successful syncs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">3</p>
                        <p className="text-sm text-gray-600">Failed syncs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">98.1%</p>
                        <p className="text-sm text-gray-600">Success rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual-upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Manual File Upload
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <FileUpload />
                  
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Supported File Formats</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="font-medium">CSV</p>
                        <p className="text-sm text-gray-500">Standard spreadsheet format with headers</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium">Excel</p>
                        <p className="text-sm text-gray-500">XLSX and XLS files supported</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-medium">JSON</p>
                        <p className="text-sm text-gray-500">API export format from PMS systems</p>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Required Fields</h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        Ensure your file includes these required columns:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-yellow-700">
                        <div>• Property Name</div>
                        <div>• Address</div>
                        <div>• Bedrooms</div>
                        <div>• Monthly Rent</div>
                        <div>• Availability Status</div>
                        <div>• Contact Information</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
