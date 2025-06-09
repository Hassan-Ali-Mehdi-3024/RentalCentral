import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPropertySchema, 
  insertLeadSchema,
  insertAgentScheduleSchema,
  insertShowingRequestSchema,
  insertScheduledShowingSchema,
  type InsertProperty,
  type Property,
  type InsertLead,
  type Lead,
  type InsertAgentSchedule,
  type AgentSchedule,
  type InsertShowingRequest,
  type ShowingRequest,
  type InsertScheduledShowing,
  type ScheduledShowing
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import OpenAI from "openai";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, updates);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProperty(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Leads routes
  app.get("/api/leads", async (req, res) => {
    try {
      const { propertyId } = req.query;
      
      let leads;
      if (propertyId) {
        leads = await storage.getLeadsByProperty(parseInt(propertyId as string));
      } else {
        leads = await storage.getLeads();
      }
      
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(id, updates);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLead(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Lead assignment
  app.patch("/api/leads/:id/assign", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { propertyId } = req.body;
      
      const lead = await storage.assignLeadToProperty(leadId, propertyId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign lead" });
    }
  });

  // Bulk property import
  app.post("/api/properties/import", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // For now, just return success - in a real implementation,
      // you would parse the CSV/Excel file and create properties
      res.json({ 
        message: "Import started successfully",
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to import properties" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      const leads = await storage.getLeads();
      
      const totalProperties = properties.length;
      const activeLeads = leads.filter(lead => lead.status !== 'closed').length;
      const assignedLeads = leads.filter(lead => lead.propertyId !== null).length;
      const conversionRate = leads.length > 0 ? ((assignedLeads / leads.length) * 100).toFixed(1) : "0";
      
      res.json({
        totalProperties,
        activeLeads,
        conversionRate: `${conversionRate}%`,
        monthlyRevenue: "$42,350" // This would be calculated from actual rental data
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Agent Schedules routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const { propertyId } = req.query;
      const schedules = await storage.getAgentSchedules(propertyId ? parseInt(propertyId as string) : undefined);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const validatedData = insertAgentScheduleSchema.parse(req.body);
      const schedule = await storage.createAgentSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  // Showing Requests routes
  app.get("/api/showing-requests", async (req, res) => {
    try {
      const { propertyId } = req.query;
      const requests = await storage.getShowingRequests(propertyId ? parseInt(propertyId as string) : undefined);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showing requests" });
    }
  });

  app.post("/api/showing-requests", async (req, res) => {
    try {
      const validatedData = insertShowingRequestSchema.parse(req.body);
      const request = await storage.createShowingRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid showing request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create showing request" });
    }
  });

  app.get("/api/properties/:id/popular-times", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const popularTimes = await storage.getPopularShowingTimes(propertyId);
      res.json(popularTimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular showing times" });
    }
  });

  // Scheduled Showings routes
  app.get("/api/showings", async (req, res) => {
    try {
      const { propertyId } = req.query;
      const showings = await storage.getScheduledShowings(propertyId ? parseInt(propertyId as string) : undefined);
      res.json(showings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showings" });
    }
  });

  app.post("/api/showings", async (req, res) => {
    try {
      const validatedData = insertScheduledShowingSchema.parse(req.body);
      const showing = await storage.createScheduledShowing(validatedData);
      
      // When a showing is scheduled, update related showing requests to confirmed
      const requests = await storage.getShowingRequests(showing.propertyId);
      const matchingRequests = requests.filter(r => 
        r.requestedDate === showing.showingDate && 
        r.requestedTime === showing.showingTime &&
        r.status === "pending"
      );
      
      for (const request of matchingRequests) {
        await storage.updateShowingRequest(request.id, { status: "confirmed" });
      }
      
      res.status(201).json(showing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid showing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create showing" });
    }
  });

  // Voice command processing for agent schedules
  app.post("/api/voice-schedule", async (req, res) => {
    try {
      const { transcript, propertyId } = req.body;
      
      if (!transcript) {
        return res.status(400).json({ message: "No transcript provided" });
      }

      // Use OpenAI to parse the voice command
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a scheduling assistant for a real estate agent. Parse voice commands to extract scheduling preferences. 
            
            Return JSON with this structure:
            {
              "schedules": [
                {
                  "dayOfWeek": number, // 0=Sunday, 1=Monday, etc.
                  "startTime": "HH:MM", // 24-hour format
                  "endTime": "HH:MM", // 24-hour format
                  "propertyId": number
                }
              ]
            }
            
            Common phrases:
            - "weekends" = Saturday (6) and Sunday (0)
            - "weekdays" = Monday (1) through Friday (5)
            - Convert times like "2 PM" to "14:00"
            - If no specific property mentioned, use the provided propertyId`
          },
          {
            role: "user",
            content: `Parse this scheduling request: "${transcript}". Property ID: ${propertyId || 'not specified'}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const parsedSchedule = JSON.parse(response.choices[0].message.content);
      
      // Create the schedules in the database
      const createdSchedules = [];
      for (const schedule of parsedSchedule.schedules) {
        const created = await storage.createAgentSchedule({
          propertyId: schedule.propertyId || propertyId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: true
        });
        createdSchedules.push(created);
      }

      res.json({
        message: "Schedule created successfully",
        transcript,
        schedules: createdSchedules
      });
    } catch (error) {
      console.error("Voice schedule error:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
