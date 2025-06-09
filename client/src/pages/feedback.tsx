import { useState } from "react";
import { MessageSquare, Users, Calendar, TrendingUp } from "lucide-react";
import { Header } from "@/components/header";
import { FeedbackQuestionnaire } from "@/components/feedback-questionnaire";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Feedback() {
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [sessionType, setSessionType] = useState<'discovery' | 'post_tour'>('discovery');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.leads.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const selectedLead = leads.find(lead => lead.id === selectedLeadId);
  const selectedProperty = properties.find(property => property.id === selectedPropertyId);

  const handleStartQuestionnaire = () => {
    if (!selectedLeadId) return;
    setShowQuestionnaire(true);
  };

  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    setSelectedLeadId(null);
    setSelectedPropertyId(null);
  };

  if (showQuestionnaire && selectedLeadId) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header 
          title="AI Feedback Questionnaire" 
          subtitle="Intelligent lead discovery and post-tour feedback" 
        />
        
        <main className="p-6 overflow-y-auto h-full">
          <div className="max-w-4xl mx-auto">
            <FeedbackQuestionnaire
              leadId={selectedLeadId}
              propertyId={selectedPropertyId || undefined}
              sessionType={sessionType}
              onComplete={handleQuestionnaireComplete}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="AI Feedback System" 
        subtitle="Engage leads with intelligent discovery questions and post-tour feedback" 
      />
      
      <main className="p-6 overflow-y-auto h-full">
        <div className="space-y-6">
          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Discovery Sessions</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {leads.filter(lead => lead.status === 'new').length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">New leads ready for discovery</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Post-Tour Feedback</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {leads.filter(lead => lead.status === 'toured').length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Leads who completed tours</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">AI Insights</p>
                    <p className="text-3xl font-bold text-foreground mt-1">85%</p>
                    <p className="text-sm text-muted-foreground mt-1">Response engagement rate</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questionnaire Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start AI Questionnaire
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Engage leads with personalized discovery questions or post-tour feedback using AI-powered conversations
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Lead
                  </label>
                  <Select value={selectedLeadId?.toString()} onValueChange={(value) => setSelectedLeadId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{lead.name} - {lead.email}</span>
                            <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="ml-2">
                              {lead.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Property (Optional)
                  </label>
                  <Select value={selectedPropertyId?.toString()} onValueChange={(value) => setSelectedPropertyId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific property</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name} - ${property.rent}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Session Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-colors ${sessionType === 'discovery' ? 'ring-2 ring-primary bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSessionType('discovery')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Discovery Questions</h4>
                          <p className="text-sm text-muted-foreground">For new leads to understand preferences, budget, and timeline</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${sessionType === 'post_tour' ? 'ring-2 ring-primary bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSessionType('post_tour')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Post-Tour Feedback</h4>
                          <p className="text-sm text-muted-foreground">For leads who completed a property tour</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {selectedLead && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedLead.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                      <p className="text-sm text-primary font-medium mt-1">
                        Status: {selectedLead.status} • Source: {selectedLead.source || 'Direct'}
                      </p>
                      {selectedProperty && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Property: {selectedProperty.name} (${selectedProperty.rent}/mo)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleStartQuestionnaire}
                disabled={!selectedLeadId}
                className="w-full bg-primary hover:bg-blue-600"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start AI Questionnaire
              </Button>
            </CardContent>
          </Card>

          {/* Feature Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Feedback Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Discovery Questions</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Intelligently discovers lead preferences and needs</li>
                    <li>• Cleverly uncovers budget range without being pushy</li>
                    <li>• Naturally asks about move-in timeline</li>
                    <li>• Builds interest in scheduling property tours</li>
                    <li>• Adapts questions based on previous responses</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Post-Tour Feedback</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Captures detailed tour experience feedback</li>
                    <li>• Gauges interest level and likelihood to proceed</li>
                    <li>• Identifies concerns and objections</li>
                    <li>• Understands decision timeline</li>
                    <li>• Provides insights for follow-up strategies</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Multiple Response Methods</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Leads can respond via voice (speech-to-text), typed text, dropdown selections, or emoji reactions. 
                      The AI adapts to their preferred method while always providing a text backup option.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}