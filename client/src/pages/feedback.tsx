import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { FeedbackQuestionnaire } from "@/components/feedback-questionnaire";
import { MessageSquare, Users, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { api } from "@/lib/api";

export default function Feedback() {
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [sessionType, setSessionType] = useState<'discovery' | 'post_tour'>('discovery');

  const { data: leads = [] } = useQuery({
    queryKey: ['/api/leads'],
  });

  const { data: feedbackSessions = [] } = useQuery({
    queryKey: ['/api/feedback/sessions'],
  });

  const activeSessions = feedbackSessions.filter(session => session.status === 'active');
  const completedSessions = feedbackSessions.filter(session => session.status === 'completed');

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeLabel = (type: string) => {
    return type === 'discovery' ? 'Discovery Questions' : 'Post-Tour Survey';
  };

  const startNewSession = (leadId: number, type: 'discovery' | 'post_tour') => {
    setSelectedLeadId(leadId);
    setSessionType(type);
  };

  if (selectedLeadId) {
    return (
      <div className="flex-1 p-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedLeadId(null)}
            className="mb-4"
          >
            ← Back to Feedback Dashboard
          </Button>
        </div>
        <FeedbackQuestionnaire
          leadId={selectedLeadId}
          sessionType={sessionType}
          onComplete={() => setSelectedLeadId(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <Header 
        title="AI Feedback System" 
        subtitle="Engage leads with discovery questions and post-tour surveys" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{completedSessions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">3.2 min</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="new-sessions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new-sessions">Start New Session</TabsTrigger>
          <TabsTrigger value="active-sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="completed-sessions">Completed Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="new-sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Start New Feedback Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {leads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No leads available. Add leads to start feedback sessions.
                  </p>
                ) : (
                  leads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{lead.name}</h4>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <p className="text-sm text-muted-foreground">Status: {lead.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startNewSession(lead.id, 'discovery')}
                          >
                            Discovery Questions
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => startNewSession(lead.id, 'post_tour')}
                          >
                            Post-Tour Survey
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Feedback Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No active sessions. Start a new session to begin collecting feedback.
                  </p>
                ) : (
                  activeSessions.map((session) => {
                    const lead = leads.find(l => l.id === session.leadId);
                    return (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{lead?.name || 'Unknown Lead'}</h4>
                            <p className="text-sm text-muted-foreground">{lead?.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getSessionStatusColor(session.status)}>
                                {session.status}
                              </Badge>
                              <Badge variant="outline">
                                {getSessionTypeLabel(session.sessionType)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Question {session.currentQuestionIndex + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLeadId(session.leadId);
                                setSessionType(session.sessionType as 'discovery' | 'post_tour');
                              }}
                            >
                              Continue Session
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed-sessions">
          <Card>
            <CardHeader>
              <CardTitle>Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No completed sessions yet.
                  </p>
                ) : (
                  completedSessions.map((session) => {
                    const lead = leads.find(l => l.id === session.leadId);
                    return (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{lead?.name || 'Unknown Lead'}</h4>
                            <p className="text-sm text-muted-foreground">{lead?.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getSessionStatusColor(session.status)}>
                                {session.status}
                              </Badge>
                              <Badge variant="outline">
                                {getSessionTypeLabel(session.sessionType)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Completed {new Date(session.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // View session results
                                console.log('View session:', session.id);
                              }}
                            >
                              View Results
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}