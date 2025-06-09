import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Mail, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

interface PostTourSchedulerProps {
  leadId: number;
  propertyId: number;
  leadEmail?: string;
  leadPhone?: string;
  onScheduled?: () => void;
}

export function PostTourScheduler({ 
  leadId, 
  propertyId, 
  leadEmail, 
  leadPhone, 
  onScheduled 
}: PostTourSchedulerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScheduled, setIsScheduled] = useState(false);

  const schedulePostTourSurvey = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/feedback/schedule-post-tour", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          propertyId,
          email: leadEmail,
          phone: leadPhone,
          delayMinutes: 60 // 1 hour delay
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule post-tour survey");
      }

      return response.json();
    },
    onSuccess: () => {
      setIsScheduled(true);
      toast({
        title: "Survey Scheduled",
        description: "Post-tour feedback survey will be sent in 1 hour via email and SMS",
      });
      onScheduled?.();
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: "Unable to schedule post-tour survey. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isScheduled) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Survey Scheduled</h4>
              <p className="text-sm text-green-700">
                Feedback survey will be sent in 1 hour to:
              </p>
              <div className="flex space-x-4 mt-2">
                {leadEmail && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <Mail className="w-3 h-3" />
                    <span>{leadEmail}</span>
                  </div>
                )}
                {leadPhone && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <MessageSquare className="w-3 h-3" />
                    <span>{leadPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Schedule Post-Tour Survey</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Automatically send feedback survey 1 hour after the tour via email and SMS
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Survey Questions Preview:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Rate your interest (1-10)?</div>
            <div>• What did you like most?</div>
            <div>• Any concerns?</div>
            <div>• Ideal move-in date?</div>
            <div>• What monthly rent would make you apply?</div>
            <div>• Any questions for us?</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Delivery Methods:</h4>
          <div className="flex space-x-2">
            {leadEmail && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </Badge>
            )}
            {leadPhone && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>SMS</span>
              </Badge>
            )}
            {!leadEmail && !leadPhone && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">No contact information available</span>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={() => schedulePostTourSurvey.mutate()}
          disabled={schedulePostTourSurvey.isPending || (!leadEmail && !leadPhone)}
          className="w-full"
        >
          {schedulePostTourSurvey.isPending ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-pulse" />
              Scheduling...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Schedule Survey (1 Hour Delay)
            </>
          )}
        </Button>

        {(!leadEmail && !leadPhone) && (
          <p className="text-xs text-gray-500 text-center">
            Add email or phone number to the lead to enable automated surveys
          </p>
        )}
      </CardContent>
    </Card>
  );
}