import { useState, useRef } from "react";
import { MessageSquare, Mic, MicOff, Smile, ChevronDown, Send, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Lead, Property, FeedbackSession } from "@shared/schema";

interface FeedbackQuestionnaireProps {
  leadId: number;
  propertyId?: number;
  sessionType: 'discovery' | 'post_tour';
  onComplete?: () => void;
}

interface QuestionData {
  text: string;
  type: 'open' | 'pricing' | 'timeline' | 'interest' | 'preference';
  responseOptions?: string[];
  emojiOptions?: string[];
}

export function FeedbackQuestionnaire({ leadId, propertyId, sessionType, onComplete }: FeedbackQuestionnaireProps) {
  const [currentResponse, setCurrentResponse] = useState("");
  const [responseMethod, setResponseMethod] = useState<'text' | 'voice' | 'dropdown' | 'emoji'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lead } = useQuery({
    queryKey: ["/api/leads", leadId],
    queryFn: () => api.leads.getById(leadId),
  });

  const { data: property } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: () => propertyId ? api.properties.getById(propertyId) : Promise.resolve(null),
    enabled: !!propertyId
  });

  const { data: session } = useQuery({
    queryKey: ["/api/feedback-sessions", sessionId],
    queryFn: () => sessionId ? api.feedback.getSession(sessionId) : Promise.resolve(null),
    enabled: !!sessionId
  });

  const startSessionMutation = useMutation({
    mutationFn: () => api.feedback.createSession({
      leadId,
      propertyId: propertyId || null,
      sessionType,
      status: "active",
      preferredResponseMethod: responseMethod,
      currentQuestionIndex: 0,
      sessionData: JSON.stringify({ responses: [] })
    }),
    onSuccess: (newSession) => {
      setSessionId(newSession.id);
      generateNextQuestion(newSession.id, []);
    }
  });

  const submitResponseMutation = useMutation({
    mutationFn: (data: { sessionId: number; response: string; questionText: string }) =>
      api.feedback.submitResponse({
        sessionId: data.sessionId,
        questionText: data.questionText,
        responseText: data.response,
        responseMethod,
        aiGeneratedQuestion: true,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() })
      }),
    onSuccess: () => {
      if (sessionId && currentQuestion) {
        generateNextQuestion(sessionId, [
          { question: currentQuestion.text, response: currentResponse, method: responseMethod }
        ]);
      }
      setCurrentResponse("");
    }
  });

  const generateQuestionMutation = useMutation({
    mutationFn: (data: { sessionId: number; context: any[] }) =>
      api.feedback.generateQuestion(data.sessionId, data.context),
    onSuccess: (questionData) => {
      if (questionData.completed) {
        setIsCompleted(true);
        if (onComplete) onComplete();
        return;
      }
      setCurrentQuestion(questionData.question);
    }
  });

  const generateNextQuestion = (sessionId: number, previousResponses: any[]) => {
    generateQuestionMutation.mutate({ sessionId, context: previousResponses });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        // In a real implementation, you'd send this to a speech-to-text service
        // For demo, we'll use browser's speech recognition
      };

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCurrentResponse(transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => {
          toast({
            title: "Speech Recognition Error",
            description: "Please try typing your response instead.",
            variant: "destructive",
          });
          setIsRecording(false);
        };

        recognition.start();
        setIsRecording(true);
      }

      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice responses.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitResponse = () => {
    if (!currentResponse.trim() || !sessionId || !currentQuestion) {
      return;
    }

    submitResponseMutation.mutate({
      sessionId,
      response: currentResponse.trim(),
      questionText: currentQuestion.text
    });
  };

  const startFeedbackSession = () => {
    startSessionMutation.mutate();
  };

  const emojiOptions = ['😍', '😊', '😐', '😕', '😞', '👍', '👎', '❤️', '⭐', '💰'];

  if (isCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-muted-foreground">
            We appreciate you taking the time to share your thoughts. 
            {sessionType === 'discovery' ? 
              " We'll be in touch soon to schedule your tour." : 
              " Your feedback helps us improve our service."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!sessionId) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            {sessionType === 'discovery' ? 'Property Discovery' : 'Tour Feedback'}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {sessionType === 'discovery' 
              ? `Hi ${lead?.name}! Let's find out what you're looking for in your next home.`
              : `Hi ${lead?.name}! We'd love to hear about your tour experience.`
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {property && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <img 
                  src={property.imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100"} 
                  alt={property.name}
                  className="w-16 h-12 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{property.name}</h4>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                  <p className="text-sm text-primary font-medium">${property.rent}/mo</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              How would you prefer to respond?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant={responseMethod === 'text' ? 'default' : 'outline'}
                onClick={() => setResponseMethod('text')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <MessageSquare className="h-5 w-5 mb-1" />
                <span className="text-xs">Type</span>
              </Button>
              <Button
                variant={responseMethod === 'voice' ? 'default' : 'outline'}
                onClick={() => setResponseMethod('voice')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Mic className="h-5 w-5 mb-1" />
                <span className="text-xs">Voice</span>
              </Button>
              <Button
                variant={responseMethod === 'dropdown' ? 'default' : 'outline'}
                onClick={() => setResponseMethod('dropdown')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <ChevronDown className="h-5 w-5 mb-1" />
                <span className="text-xs">Options</span>
              </Button>
              <Button
                variant={responseMethod === 'emoji' ? 'default' : 'outline'}
                onClick={() => setResponseMethod('emoji')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Smile className="h-5 w-5 mb-1" />
                <span className="text-xs">Emojis</span>
              </Button>
            </div>
          </div>

          <Button
            onClick={startFeedbackSession}
            disabled={startSessionMutation.isPending}
            className="w-full bg-primary hover:bg-blue-600"
          >
            {startSessionMutation.isPending ? "Starting..." : "Start Questionnaire"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating your next question...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Question {session?.currentQuestionIndex ? session.currentQuestionIndex + 1 : 1}
          </div>
          {currentQuestion.type === 'pricing' && <DollarSign className="h-5 w-5 text-green-600" />}
          {currentQuestion.type === 'timeline' && <Calendar className="h-5 w-5 text-blue-600" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-foreground font-medium">{currentQuestion.text}</p>
        </div>

        {responseMethod === 'text' && (
          <div>
            <Textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
            />
          </div>
        )}

        {responseMethod === 'voice' && (
          <div className="text-center space-y-4">
            <Button
              onClick={isRecording ? () => setIsRecording(false) : startRecording}
              className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-600'} px-8 py-4`}
              disabled={submitResponseMutation.isPending}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            {currentResponse && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Your response:</p>
                <p className="text-foreground">{currentResponse}</p>
              </div>
            )}
          </div>
        )}

        {responseMethod === 'dropdown' && currentQuestion.responseOptions && (
          <Select value={currentResponse} onValueChange={setCurrentResponse}>
            <SelectTrigger>
              <SelectValue placeholder="Select your response" />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.responseOptions.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {responseMethod === 'emoji' && (
          <div className="grid grid-cols-5 gap-3">
            {emojiOptions.map((emoji, index) => (
              <Button
                key={index}
                variant={currentResponse === emoji ? 'default' : 'outline'}
                onClick={() => setCurrentResponse(emoji)}
                className="text-2xl p-4 h-auto"
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        {/* Always show text input as backup */}
        {responseMethod !== 'text' && (
          <div>
            <Input
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Or type your response here..."
              className="w-full"
            />
          </div>
        )}

        <Button
          onClick={handleSubmitResponse}
          disabled={!currentResponse.trim() || submitResponseMutation.isPending}
          className="w-full bg-primary hover:bg-blue-600"
        >
          <Send className="h-4 w-4 mr-2" />
          {submitResponseMutation.isPending ? "Submitting..." : "Submit Response"}
        </Button>
      </CardContent>
    </Card>
  );
}