import { useState } from "react";
import { Header } from "@/components/header";
import { FeedbackQuestionnaire } from "@/components/feedback-questionnaire";
import { PostTourScheduler } from "@/components/post-tour-scheduler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Clock, MessageSquare, Mail, Phone, Users, TrendingUp, Calendar } from "lucide-react";
import { api } from "@/lib/api";

export default function Feedback() {
  const [selectedLeadId, setSelectedLeadId] = useState<number | undefined>();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [sessionType, setSessionType] = useState<"discovery" | "post_tour">("discovery");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.leads.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const { data: feedbackSessions = [] } = useQuery({
    queryKey: ["/api/feedback/sessions"],
    queryFn: () => api.feedback.getSessions(),
  });

  const handleStartQuestionnaire = () => {
    if (selectedLeadId && selectedPropertyId) {
      setShowQuestionnaire(true);
    }
  };

  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    setSelectedLeadId(undefined);
    setSelectedPropertyId(undefined);
  };

  const activeSessions = feedbackSessions.filter((session: any) => session.status === "active").length;
  const completedSessions = feedbackSessions.filter((session: any) => session.status === "completed").length;
  const avgInterestLevel = feedbackSessions.length > 0 
    ? (feedbackSessions.reduce((sum: number, session: any) => sum + (session.interestLevel || 0), 0) / feedbackSessions.length).toFixed(1)
    : "0.0";

  if (showQuestionnaire && selectedLeadId && selectedPropertyId) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header 
          title="Feedback Questionnaire" 
          subtitle="AI-powered lead discovery and post-tour feedback" 
        />
        
        <main className="p-6 overflow-y-auto h-full">
          <div className="max-w-4xl mx-auto">
            <FeedbackQuestionnaire
              leadId={selectedLeadId}
              propertyId={selectedPropertyId}
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
        title="Feedback Management" 
        subtitle="AI-powered lead discovery and post-tour feedback system" 
      />
      
      <main className="p-6 overflow-y-auto h-full">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Active Sessions</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{activeSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{completedSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Avg Interest</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{avgInterestLevel}/10</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Leads</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{leads.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Start New Questionnaire */}
          <Card>
            <CardHeader>
              <CardTitle>Start New Feedback Session</CardTitle>
              <p className="text-muted-foreground text-sm">
                Begin an AI-powered questionnaire to discover lead preferences or gather post-tour feedback
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          {lead.name} - {lead.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Property
                  </label>
                  <Select value={selectedPropertyId?.toString()} onValueChange={(value) => setSelectedPropertyId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Session Type
                  </label>
                  <Select value={sessionType} onValueChange={(value: "discovery" | "post_tour") => setSessionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery Questions</SelectItem>
                      <SelectItem value="post_tour">Post-Tour Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleStartQuestionnaire}
                disabled={!selectedLeadId || !selectedPropertyId}
                className="w-full bg-primary hover:bg-blue-600"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start AI Questionnaire
              </Button>
            </CardContent>
          </Card>

          {/* Post-Tour Survey Scheduler */}
          {selectedLeadId && selectedPropertyId && sessionType === "post_tour" && (
            <Card>
              <CardHeader>
                <CardTitle>Automated Post-Tour Survey</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Schedule automated feedback survey to be sent 1 hour after tour completion
                </p>
              </CardHeader>
              <CardContent>
                <PostTourScheduler
                  leadId={selectedLeadId}
                  propertyId={selectedPropertyId}
                  leadEmail={leads.find(l => l.id === selectedLeadId)?.email}
                  leadPhone={leads.find(l => l.id === selectedLeadId)?.phone}
                  onScheduled={() => {
                    setSelectedLeadId(undefined);
                    setSelectedPropertyId(undefined);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackSessions.length > 0 ? (
                <div className="space-y-3">
                  {feedbackSessions.slice(0, 5).map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          session.status === "completed" ? "bg-green-500" : 
                          session.status === "active" ? "bg-blue-500" : 
                          session.status === "scheduled" ? "bg-orange-500" : "bg-gray-400"
                        }`}></div>
                        <div>
                          <p className="font-medium text-foreground">
                            Lead #{session.leadId} - {session.sessionType === "discovery" ? "Discovery" : "Post-Tour"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.status === "completed" ? "Completed" : 
                             session.status === "scheduled" ? "Scheduled" : "In Progress"} • 
                            {session.interestLevel && ` Interest: ${session.interestLevel}/10`}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback sessions yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Start your first AI questionnaire above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}