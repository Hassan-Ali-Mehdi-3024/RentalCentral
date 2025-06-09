import { apiRequest } from "./queryClient";
import type { 
  Property, 
  Lead, 
  InsertProperty, 
  InsertLead,
  AgentSchedule,
  InsertAgentSchedule,
  ShowingRequest,
  InsertShowingRequest,
  ScheduledShowing,
  InsertScheduledShowing
} from "@shared/schema";

export const api = {
  // Properties
  properties: {
    getAll: (): Promise<Property[]> => 
      fetch("/api/properties", { credentials: "include" }).then(res => res.json()),
    
    get: (id: number): Promise<Property> =>
      fetch(`/api/properties/${id}`, { credentials: "include" }).then(res => res.json()),
    
    getById: (id: number): Promise<Property> =>
      fetch(`/api/properties/${id}`, { credentials: "include" }).then(res => res.json()),
    
    create: (property: InsertProperty): Promise<Property> =>
      apiRequest("POST", "/api/properties", property).then(res => res.json()),
    
    update: (id: number, updates: Partial<InsertProperty>): Promise<Property> =>
      apiRequest("PATCH", `/api/properties/${id}`, updates).then(res => res.json()),
    
    delete: (id: number): Promise<void> =>
      apiRequest("DELETE", `/api/properties/${id}`).then(() => {}),
    
    import: (file: File): Promise<{ message: string; filename: string; size: number }> => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch("/api/properties/import", {
        method: "POST",
        body: formData,
        credentials: "include"
      }).then(res => res.json());
    }
  },

  // Leads
  leads: {
    getAll: (propertyId?: number): Promise<Lead[]> => {
      const url = propertyId ? `/api/leads?propertyId=${propertyId}` : "/api/leads";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
    
    get: (id: number): Promise<Lead> =>
      fetch(`/api/leads/${id}`, { credentials: "include" }).then(res => res.json()),
    
    getById: (id: number): Promise<Lead> =>
      fetch(`/api/leads/${id}`, { credentials: "include" }).then(res => res.json()),
    
    create: (lead: InsertLead): Promise<Lead> =>
      apiRequest("POST", "/api/leads", lead).then(res => res.json()),
    
    update: (id: number, updates: Partial<InsertLead>): Promise<Lead> =>
      apiRequest("PATCH", `/api/leads/${id}`, updates).then(res => res.json()),
    
    delete: (id: number): Promise<void> =>
      apiRequest("DELETE", `/api/leads/${id}`).then(() => {}),
    
    assign: (leadId: number, propertyId: number | null): Promise<Lead> =>
      apiRequest("PATCH", `/api/leads/${leadId}/assign`, { propertyId }).then(res => res.json())
  },

  // Dashboard
  dashboard: {
    getStats: (): Promise<{
      totalProperties: number;
      activeLeads: number;
      conversionRate: string;
      monthlyRevenue: string;
    }> =>
      fetch("/api/dashboard/stats", { credentials: "include" }).then(res => res.json())
  },

  // Agent Schedules
  schedules: {
    getAll: (propertyId?: number): Promise<AgentSchedule[]> => {
      const url = propertyId ? `/api/schedules?propertyId=${propertyId}` : "/api/schedules";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
    
    create: (schedule: InsertAgentSchedule): Promise<AgentSchedule> =>
      apiRequest("POST", "/api/schedules", schedule).then(res => res.json()),
      
    processVoiceCommand: (transcript: string, propertyId?: number): Promise<{
      message: string;
      transcript: string;
      schedules: AgentSchedule[];
    }> =>
      apiRequest("POST", "/api/voice-schedule", { transcript, propertyId }).then(res => res.json())
  },

  // Showing Requests
  showingRequests: {
    getAll: (propertyId?: number): Promise<ShowingRequest[]> => {
      const url = propertyId ? `/api/showing-requests?propertyId=${propertyId}` : "/api/showing-requests";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
    
    create: (request: InsertShowingRequest): Promise<ShowingRequest> =>
      apiRequest("POST", "/api/showing-requests", request).then(res => res.json())
  },

  // Scheduled Showings
  showings: {
    getAll: (propertyId?: number): Promise<ScheduledShowing[]> => {
      const url = propertyId ? `/api/showings?propertyId=${propertyId}` : "/api/showings";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
    
    create: (showing: InsertScheduledShowing): Promise<ScheduledShowing> =>
      apiRequest("POST", "/api/showings", showing).then(res => res.json()),
      
    getPopularTimes: (propertyId: number): Promise<{ time: string; count: number; date: string }[]> =>
      fetch(`/api/properties/${propertyId}/popular-times`, { credentials: "include" }).then(res => res.json())
  },

  // Feedback System
  feedback: {
    startSession: (data: { leadId: number; propertyId: number; sessionType: string }): Promise<{
      sessionId: number;
      initialQuestions: any[];
    }> =>
      apiRequest("POST", "/api/feedback/start-session", data).then(res => res.json()),
      
    submitResponse: (data: {
      sessionId: number;
      questionId: string;
      responseMethod: string;
      responseValue: string;
      responseText?: string;
    }): Promise<{
      nextQuestion?: any;
      isComplete?: boolean;
      summary?: any;
    }> =>
      apiRequest("POST", "/api/feedback/submit-response", data).then(res => res.json()),
      
    getSessions: (leadId?: number): Promise<any[]> => {
      const url = leadId ? `/api/feedback/sessions?leadId=${leadId}` : "/api/feedback/sessions";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
    
    getResponses: (sessionId: number): Promise<any[]> =>
      fetch(`/api/feedback/sessions/${sessionId}/responses`, { credentials: "include" }).then(res => res.json())
  },

  // Performance Analytics
  performance: {
    getPropertyPerformance: (propertyId: number): Promise<{
      property: any;
      prospects: any[];
      inquiries: any[];
      metrics: any;
      feedbackCategories: any[];
    }> =>
      fetch(`/api/performance/property/${propertyId}`, { credentials: "include" }).then(res => res.json()),
      
    updateSummary: (data: { propertyId: number; category: string; summary: string }): Promise<any> =>
      apiRequest("PUT", "/api/performance/summary", data).then(res => res.json())
  }
};
