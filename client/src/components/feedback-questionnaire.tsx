import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, MessageSquare, Smile, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Lead, Property } from "@shared/schema";

interface FeedbackQuestionnaireProps {
  leadId: number;
  propertyId: number;
  sessionType: "discovery" | "post_tour";
  onComplete?: () => void;
}

interface Question {
  id: string;
  text: string;
  type: "open" | "budget" | "move_in_date" | "interest_level" | "follow_up";
  options?: string[];
  emoji_options?: string[];
}

export function FeedbackQuestionnaire({ leadId, propertyId, sessionType, onComplete }: FeedbackQuestionnaireProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [responseMethod, setResponseMethod] = useState<"voice" | "text" | "dropdown" | "emoji">("text");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lead } = useQuery({
    queryKey: ["/api/leads", leadId],
    queryFn: () => api.leads.get(leadId),
  });

  const { data: property } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: () => api.properties.get(propertyId),
  });

  const startSessionMutation = useMutation({
    mutationFn: (data: { leadId: number; propertyId: number; sessionType: string }) =>
      api.feedback.startSession(data),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setQuestions(data.initialQuestions);
      setCurrentQuestionIndex(0);
    },
  });

  const submitResponseMutation = useMutation({
    mutationFn: (data: {
      sessionId: number;
      questionId: string;
      responseMethod: string;
      responseValue: string;
      responseText?: string;
    }) => api.feedback.submitResponse(data),
    onSuccess: (data) => {
      if (data.nextQuestion) {
        const newQuestions = [...questions];
        if (currentQuestionIndex + 1 >= newQuestions.length) {
          newQuestions.push(data.nextQuestion);
        }
        setQuestions(newQuestions);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentResponse("");
      } else {
        // Session complete
        toast({
          title: "Feedback Complete",
          description: "Thank you for your feedback! We'll be in touch soon.",
        });
        onComplete?.();
      }
      setIsProcessing(false);
    },
    onError: () => {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (leadId && propertyId && !sessionId) {
      startSessionMutation.mutate({ leadId, propertyId, sessionType });
    }
  }, [leadId, propertyId, sessionType, sessionId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Use Web Speech API for transcription
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setCurrentResponse(transcript);
            setResponseMethod("voice");
          };

          recognition.onerror = () => {
            toast({
              title: "Speech Recognition Error",
              description: "Please try typing your response instead.",
              variant: "destructive",
            });
          };

          recognition.start();
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access or use text input.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitResponse = () => {
    if (!sessionId || !currentResponse.trim() || isProcessing) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setIsProcessing(true);
    const newResponses = [...responses, currentResponse];
    setResponses(newResponses);

    submitResponseMutation.mutate({
      sessionId,
      questionId: currentQuestion.id,
      responseMethod,
      responseValue: currentResponse,
      responseText: responseMethod === "voice" ? currentResponse : undefined,
    });
  };

  const handleEmojiResponse = (emoji: string) => {
    setCurrentResponse(emoji);
    setResponseMethod("emoji");
  };

  const handleDropdownResponse = (value: string) => {
    setCurrentResponse(value);
    setResponseMethod("dropdown");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  if (!sessionId || !currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Starting your feedback session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          {sessionType === "discovery" ? "Tell Us About Your Needs" : "How Was Your Tour?"}
        </CardTitle>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length > 0 ? questions.length : "?"}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Property Context */}
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

        {/* Current Question */}
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-lg font-medium text-foreground">{currentQuestion.text}</p>
          </div>

          {/* Response Methods */}
          <div className="space-y-4">
            {/* Voice Recording */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-600'}`}
                disabled={isProcessing}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Response
                  </>
                )}
              </Button>
              
              {responseMethod === "voice" && currentResponse && (
                <div className="flex-1 p-2 bg-green-50 rounded text-sm">
                  Voice: "{currentResponse}"
                </div>
              )}
            </div>

            {/* Emoji Options */}
            {currentQuestion.emoji_options && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Quick Response:</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.emoji_options.map((emoji, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleEmojiResponse(emoji)}
                      className={`text-2xl p-3 ${currentResponse === emoji && responseMethod === "emoji" ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Dropdown Options */}
            {currentQuestion.options && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Select an option:</p>
                <Select value={responseMethod === "dropdown" ? currentResponse : ""} onValueChange={handleDropdownResponse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Text Input */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Or type your response:</p>
              <Textarea
                value={responseMethod === "text" ? currentResponse : ""}
                onChange={(e) => {
                  setCurrentResponse(e.target.value);
                  setResponseMethod("text");
                }}
                placeholder="Type your response here..."
                className="w-full"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitResponse}
              disabled={!currentResponse.trim() || isProcessing}
              className="w-full bg-primary hover:bg-blue-600"
            >
              <Send className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Submit Response"}
            </Button>
          </div>
        </div>

        {/* Previous Responses */}
        {responses.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-medium text-foreground mb-3">Previous Responses:</h4>
            <div className="space-y-2">
              {responses.map((response, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Q{index + 1}:</span> {response}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}