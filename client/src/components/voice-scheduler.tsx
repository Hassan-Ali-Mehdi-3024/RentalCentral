import { useState, useRef } from "react";
import { Mic, MicOff, Volume2, Calendar, Clock, Play, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Property } from "@shared/schema";

export function VoiceScheduler() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [recordingTime, setRecordingTime] = useState(0);
  const [createdSchedules, setCreatedSchedules] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
      setCreatedSchedules(data.schedules || []);
      setShowSuccess(true);
      toast({
        title: "Schedule Created Successfully",
        description: `Added ${data.schedules?.length || 0} time slots to your availability calendar.`,
      });
      
      // Auto-close modal after success
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Processing Error",
        description: "Unable to process your voice schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTranscript("");
    setRecordingTime(0);
    setCreatedSchedules([]);
    setShowSuccess(false);
    setSelectedPropertyId(undefined);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Start recording timer
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Clear the recording timer
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        
        // Use Web Speech API for transcription
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTranscript(transcript);
            
            // Auto-process the voice command after a brief delay
            setTimeout(() => {
              processVoiceCommand();
            }, 500);
          };

          recognition.onerror = () => {
            toast({
              title: "Speech Recognition Error",
              description: "Please try speaking clearly or type your schedule manually.",
              variant: "destructive",
            });
          };

          recognition.start();
        } else {
          toast({
            title: "Speech Recognition Not Available",
            description: "Please type your schedule in the text area below.",
            variant: "destructive",
          });
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record your schedule.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const processVoiceCommand = () => {
    if (!transcript.trim()) {
      toast({
        title: "No Schedule Command",
        description: "Please record your availability or type it manually.",
        variant: "destructive",
      });
      return;
    }

    voiceCommandMutation.mutate({
      transcript: transcript.trim(),
      propertyId: selectedPropertyId
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatScheduleTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const exampleCommands = [
    "Available weekends from 2 PM to 4 PM for showings",
    "Set my schedule Monday through Friday 10 AM to 6 PM", 
    "I'm available Saturdays and Sundays 1 PM to 5 PM",
    "Schedule showings Tuesday and Thursday 3 PM to 7 PM"
  ];

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-blue-600" 
          onClick={() => {
            setIsModalOpen(true);
            resetForm();
          }}
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice Scheduler
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Schedule Assistant
          </DialogTitle>
          <DialogDescription>
            Record your availability schedule for property showings using voice commands
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success State */}
          {showSuccess && createdSchedules.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">Schedule Created Successfully!</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Added {createdSchedules.length} time slots to your availability calendar:
              </p>
              <div className="space-y-2">
                {createdSchedules.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {getDayName(schedule.dayOfWeek)}
                    </Badge>
                    <span className="text-sm text-green-700">
                      {formatScheduleTime(schedule.startTime)} - {formatScheduleTime(schedule.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Property (Optional)
            </label>
            <Select 
              value={selectedPropertyId?.toString()} 
              onValueChange={(value) => setSelectedPropertyId(value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Apply to all properties" />
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

          {/* Voice Recording Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record Your Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recording Controls */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="lg"
                    className={`w-24 h-24 rounded-full ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-primary hover:bg-blue-600'
                    }`}
                    disabled={voiceCommandMutation.isPending}
                  >
                    {isRecording ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                  
                  {isRecording && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <span className="text-sm font-medium text-red-600">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isRecording ? "Recording your schedule..." : "Click to start recording"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRecording 
                      ? "Speak clearly about your available times" 
                      : "Press and hold to record your availability"
                    }
                  </p>
                </div>
              </div>

              {/* Voice Transcript */}
              {transcript && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Volume2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Recorded Schedule:</p>
                      <p className="text-sm text-muted-foreground mt-1">{transcript}</p>
                    </div>
                  </div>
                  
                  {!voiceCommandMutation.isPending && !showSuccess && (
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={processVoiceCommand}
                        className="bg-secondary hover:bg-green-600"
                        size="sm"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {voiceCommandMutation.isPending && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                  <span className="text-sm">Processing your schedule...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Input Alternative */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Or Type Your Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Type your availability schedule here (e.g., 'Available weekdays 9 AM to 5 PM')"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              
              {transcript && !voiceCommandMutation.isPending && !showSuccess && (
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={processVoiceCommand}
                    className="bg-secondary hover:bg-green-600"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Example Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Example Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {exampleCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => setTranscript(command)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm border border-gray-200"
                  >
                    <span className="text-muted-foreground">"</span>
                    <span className="text-foreground">{command}</span>
                    <span className="text-muted-foreground">"</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </Button>
          {!showSuccess && transcript && !voiceCommandMutation.isPending && (
            <Button
              onClick={processVoiceCommand}
              className="bg-secondary hover:bg-green-600"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}