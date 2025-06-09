import { apiRequest } from "./queryClient";
import type { Property, Lead, InsertProperty, InsertLead } from "@shared/schema";

export const api = {
  // Properties
  properties: {
    getAll: (): Promise<Property[]> => 
      fetch("/api/properties", { credentials: "include" }).then(res => res.json()),
    
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
  }
};
