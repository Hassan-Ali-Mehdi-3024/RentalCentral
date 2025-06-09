import { useState, useRef } from "react";
import { Mic, MicOff, Volume2, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Property } from "@shared/schema";

export function VoiceScheduler() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.properties.getAll(),
  });

  const voiceCommandMutation = useMutation({
    mutationFn: ({ transcript, propertyId }: { transcript: string; propertyId?: number }) =>
      api.schedules.processVoiceCommand(transcript, propertyId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule Created",
        description: `Created ${data.schedules.length} schedule(s) from your voice command.`,
      });
      setTranscript("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process voice command. Please try again.",
        variant: "destructive",
      });
    },
  });

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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // For demo purposes, we'll use Web Speech API for transcription
        // In production, you'd send the audio to a speech-to-text service
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTranscript(transcript);
          };

          recognition.onerror = () => {
            toast({
              title: "Speech Recognition Error",
              description: "Please try typing your schedule instead.",
              variant: "destructive",
            });
          };

          recognition.start();
        } else {
          toast({
            title: "Speech Recognition Not Supported",
            description: "Please type your schedule manually.",
            variant: "destructive",
          });
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice commands.",
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

  const processVoiceCommand = () => {
    if (!transcript.trim()) {
      toast({
        title: "No Command",
        description: "Please record or type a scheduling command first.",
        variant: "destructive",
      });
      return;
    }

    voiceCommandMutation.mutate({
      transcript: transcript.trim(),
      propertyId: selectedPropertyId
    });
  };

  const exampleCommands = [
    "Schedule open houses for weekends from 2 PM to 4 PM",
    "Set availability Monday through Friday 10 AM to 6 PM",
    "Available Saturdays and Sundays 1 PM to 5 PM",
    "Schedule showings Tuesday and Thursday 3 PM to 7 PM"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="h-5 w-5 mr-2" />
          Voice Schedule Assistant
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Use voice commands to set your ideal showing schedule
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Property Selection */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Select Property (Optional)
          </label>
          <Select value={selectedPropertyId?.toString()} onValueChange={(value) => setSelectedPropertyId(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="All properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Recording */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-600'}`}
              disabled={voiceCommandMutation.isPending}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            
            {transcript && (
              <Button
                onClick={processVoiceCommand}
                disabled={voiceCommandMutation.isPending}
                className="bg-secondary hover:bg-green-600"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {voiceCommandMutation.isPending ? "Processing..." : "Create Schedule"}
              </Button>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-2">
                <Volume2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Voice Command:</p>
                  <p className="text-sm text-muted-foreground mt-1">{transcript}</p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Or type your schedule manually:
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type your scheduling preferences here..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Example Commands */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Example Commands
          </h4>
          <div className="space-y-2">
            {exampleCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => setTranscript(command)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-muted-foreground"
              >
                "{command}"
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}