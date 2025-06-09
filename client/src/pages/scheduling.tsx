import { Header } from "@/components/header";
import { VoiceScheduler } from "@/components/voice-scheduler";
import { SchedulingDashboard } from "@/components/scheduling-dashboard";
import { ShowingCalendar } from "@/components/showing-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Scheduling() {
  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Scheduling Management" 
        subtitle="Manage property showings and agent availability" 
      />
      
      <main className="p-6 overflow-y-auto h-full">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="voice">Voice Scheduler</TabsTrigger>
            <TabsTrigger value="calendar">Book Showing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <SchedulingDashboard />
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <VoiceScheduler />
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <ShowingCalendar />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}