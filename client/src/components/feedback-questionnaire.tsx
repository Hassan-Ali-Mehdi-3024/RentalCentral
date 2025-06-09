import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, Type, ChevronDown, Smile, Send, SkipForward } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [responseMethod, setResponseMethod] = useState<'text' | 'voice' | 'dropdown' | 'emoji'>('text');
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredMethod, setPreferredMethod] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Discovery questions for new leads
  const discoveryQuestions: QuestionData[] = [
    {
      text: "What type of property are you looking for?",
      type: 'preference',
      responseOptions: ["Studio", "1 Bedroom", "2 Bedroom", "3+ Bedroom", "House", "Condo"],
      emojiOptions: ["🏠", "🏢", "🏡", "🏘️"]
    },
    {
      text: "When are you hoping to move in?",
      type: 'timeline',
      responseOptions: ["Immediately", "Within 1 month", "Within 2-3 months", "3+ months", "Flexible"],
      emojiOptions: ["🚀", "📅", "⏰", "🔄"]
    },
    {
      text: "What's your budget range for monthly rent?",
      type: 'pricing',
      responseOptions: ["Under $1,500", "$1,500-$2,500", "$2,500-$3,500", "$3,500+", "Flexible"],
      emojiOptions: ["💵", "💰", "💳", "🏦"]
    },
    {
      text: "What amenities are most important to you?",
      type: 'preference',
      responseOptions: ["Parking", "Pet-friendly", "Gym/Fitness", "Pool", "In-unit laundry", "Balcony/Patio"],
      emojiOptions: ["🅿️", "🐕", "🏋️", "🏊", "🧺", "🌿"]
    },
    {
      text: "How interested are you in scheduling a tour?",
      type: 'interest',
      responseOptions: ["Very interested", "Somewhat interested", "Maybe later", "Not interested"],
      emojiOptions: ["😍", "🙂", "🤔", "😐"]
    }
  ];

  // Post-tour questions with AI-powered follow-ups
  const postTourQuestions: QuestionData[] = [
    {
      text: "How would you rate your overall tour experience?",
      type: 'interest',
      responseOptions: ["Excellent", "Good", "Fair", "Poor"],
      emojiOptions: ["😍", "😊", "😐", "😞"]
    },
    {
      text: "What did you like most about the property?",
      type: 'preference',
      emojiOptions: ["✨", "🏠", "🌟", "👍"]
    },
    {
      text: "Is there anything that concerns you about this property?",
      type: 'open',
      emojiOptions: ["🤔", "😟", "❓", "💭"]
    },
    {
      text: "Based on what you saw, what rent would you consider fair for this unit?",
      type: 'pricing',
      responseOptions: ["As listed", "10% less", "15% less", "20% less", "Would need significant reduction"],
      emojiOptions: ["💰", "💵", "💳", "🤷"]
    },
    {
      text: "If you were to move forward, when would be your ideal move-in date?",
      type: 'timeline',
      responseOptions: ["Immediately", "Within 2 weeks", "Within 1 month", "1-2 months", "Not ready to commit"],
      emojiOptions: ["🚀", "📅", "⏰", "🤷"]
    }
  ];

  // Generate AI follow-up questions based on responses
  const generateFollowUpQuestions = (responses: string[]): QuestionData[] => {
    const followUps: QuestionData[] = [];
    
    // Check if interest level is unclear and pricing wasn't mentioned
    const hasUnclearInterest = responses.some(r => 
      r.toLowerCase().includes('maybe') || 
      r.toLowerCase().includes('not sure') ||
      r.toLowerCase().includes('somewhat') ||
      r.toLowerCase().includes('think about')
    );
    
    const hasPricingInfo = responses.some(r => 
      r.toLowerCase().includes('$') || 
      r.toLowerCase().includes('price') || 
      r.toLowerCase().includes('rent') ||
      r.toLowerCase().includes('budget')
    );

    // Always ask pricing question if interest is unclear and no pricing mentioned
    if (hasUnclearInterest && !hasPricingInfo) {
      followUps.push({
        text: "What monthly rent amount would make you more interested in this property?",
        type: 'pricing',
        responseOptions: ["$100 less", "$200 less", "$300+ less", "Price isn't the main issue"],
        emojiOptions: ["💰", "💵", "💳", "🤷"]
      });
    }

    // Ask about move-in timeline if not clearly stated
    const hasTimelineInfo = responses.some(r => 
      r.toLowerCase().includes('month') || 
      r.toLowerCase().includes('week') ||
      r.toLowerCase().includes('immediately') ||
      r.toLowerCase().includes('date')
    );

    if (!hasTimelineInfo) {
      followUps.push({
        text: "When would you realistically be able to move in?",
        type: 'timeline',
        responseOptions: ["This month", "Next month", "2-3 months", "More than 3 months", "Very flexible"],
        emojiOptions: ["🚀", "📅", "⏰", "🔄"]
      });
    }

    return followUps;
  };

  // Initialize session and questions
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      try {
        // Create new feedback session
        const session = await api.feedback.createSession({
          leadId,
          propertyId: propertyId || null,
          sessionType,
          status: 'active',
          preferredResponseMethod: null,
          currentQuestionIndex: 0,
          sessionData: JSON.stringify({ responses: [] })
        });
        
        setSessionId(session.id);
        
        // Set initial questions based on session type
        const initialQuestions = sessionType === 'discovery' ? discoveryQuestions : postTourQuestions;
        setQuestions(initialQuestions);
      } catch (error) {
        console.error('Error initializing session:', error);
        toast({
          title: "Error",
          description: "Failed to start feedback session.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [leadId, propertyId, sessionType]);

  const createResponseMutation = useMutation({
    mutationFn: api.feedback.submitResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: number; updates: any }) =>
      api.feedback.updateSession(sessionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    }
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Voice recognition setup
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentResponse(transcript);
      setIsListening(false);
      
      // Set preferred method to voice after first use
      if (!preferredMethod) {
        setPreferredMethod('voice');
        setResponseMethod('voice');
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice recognition error",
        description: "Please try again or use text input.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleResponseMethodChange = (method: 'text' | 'voice' | 'dropdown' | 'emoji') => {
    setResponseMethod(method);
    if (!preferredMethod) {
      setPreferredMethod(method);
    }
  };

  const submitResponse = async () => {
    if (!currentResponse.trim() || !sessionId) return;

    try {
      // Save response
      await createResponseMutation.mutateAsync({
        sessionId,
        questionText: currentQuestion.text,
        responseText: currentResponse,
        responseMethod
      });

      const newResponses = [...responses, currentResponse];
      setResponses(newResponses);

      // Check if we're at the minimum question count and need follow-ups
      const isAtMinimumQuestions = newResponses.length >= 5;
      const isLastQuestion = currentQuestionIndex === questions.length - 1;

      if (isLastQuestion && isAtMinimumQuestions) {
        // Generate follow-up questions if needed
        const followUps = generateFollowUpQuestions(newResponses);
        if (followUps.length > 0) {
          setQuestions([...questions, ...followUps]);
        }
      }

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1 || (isLastQuestion && isAtMinimumQuestions)) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setCurrentResponse("");
        
        // Update session progress
        await updateSessionMutation.mutateAsync({
          sessionId,
          updates: {
            currentQuestionIndex: nextIndex,
            preferredResponseMethod: preferredMethod || responseMethod,
            sessionData: JSON.stringify({ responses: newResponses })
          }
        });

        // Adapt response method based on preference
        if (preferredMethod && preferredMethod !== 'text') {
          setResponseMethod(preferredMethod as 'text' | 'voice' | 'dropdown' | 'emoji');
        }
      } else {
        // Complete session
        await updateSessionMutation.mutateAsync({
          sessionId,
          updates: {
            status: 'completed',
            sessionData: JSON.stringify({ responses: newResponses, completedAt: new Date().toISOString() })
          }
        });

        toast({
          title: "Feedback completed",
          description: "Thank you for your responses! We'll follow up with you soon.",
        });

        onComplete?.();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setCurrentResponse(emoji);
  };

  const handleDropdownChange = (value: string) => {
    setCurrentResponse(value);
  };

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Preparing your questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Session completed. Thank you for your feedback!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {sessionType === 'discovery' ? 'Discovery Questions' : 'Post-Tour Survey'}
          </CardTitle>
          <Badge variant="outline">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          
          {/* Response Method Selector */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={responseMethod === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleResponseMethodChange('text')}
            >
              <Type className="h-4 w-4 mr-1" />
              Type
            </Button>
            <Button
              variant={responseMethod === 'voice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleResponseMethodChange('voice')}
            >
              <Mic className="h-4 w-4 mr-1" />
              Voice
            </Button>
            {currentQuestion.responseOptions && (
              <Button
                variant={responseMethod === 'dropdown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleResponseMethodChange('dropdown')}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Select
              </Button>
            )}
            {currentQuestion.emojiOptions && (
              <Button
                variant={responseMethod === 'emoji' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleResponseMethodChange('emoji')}
              >
                <Smile className="h-4 w-4 mr-1" />
                Emoji
              </Button>
            )}
          </div>

          {/* Response Input */}
          {responseMethod === 'text' && (
            <Textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[100px]"
            />
          )}

          {responseMethod === 'voice' && (
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Button
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={isListening ? 'animate-pulse' : ''}
              >
                <Mic className="h-5 w-5 mr-2" />
                {isListening ? 'Listening...' : 'Click to speak'}
              </Button>
              {currentResponse && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">You said:</p>
                  <p className="font-medium">{currentResponse}</p>
                </div>
              )}
            </div>
          )}

          {responseMethod === 'dropdown' && currentQuestion.responseOptions && (
            <Select value={currentResponse} onValueChange={handleDropdownChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {currentQuestion.responseOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {responseMethod === 'emoji' && currentQuestion.emojiOptions && (
            <div className="grid grid-cols-4 gap-4">
              {currentQuestion.emojiOptions.map((emoji, index) => (
                <Button
                  key={emoji}
                  variant={currentResponse === emoji ? 'default' : 'outline'}
                  className="text-2xl h-16"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}

          {/* Text input always available */}
          {responseMethod !== 'text' && (
            <div className="mt-4">
              <Textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Or type your response here..."
                className="min-h-[60px]"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setCurrentResponse(responses[currentQuestionIndex - 1] || "");
              }
            }}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentResponse("Skipped");
                submitResponse();
              }}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
            <Button
              onClick={submitResponse}
              disabled={!currentResponse.trim() || createResponseMutation.isPending}
            >
              <Send className="h-4 w-4 mr-1" />
              {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}