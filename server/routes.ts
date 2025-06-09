import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPropertySchema, 
  insertLeadSchema,
  insertAgentScheduleSchema,
  insertShowingRequestSchema,
  insertScheduledShowingSchema,
  insertFeedbackSessionSchema,
  insertFeedbackResponseSchema,
  insertLeadInteractionSchema,
  type InsertProperty,
  type Property,
  type InsertLead,
  type Lead,
  type InsertAgentSchedule,
  type AgentSchedule,
  type InsertShowingRequest,
  type ShowingRequest,
  type InsertScheduledShowing,
  type ScheduledShowing,
  type FeedbackSession,
  type InsertFeedbackSession,
  type FeedbackResponse,
  type InsertFeedbackResponse,
  type LeadInteraction,
  type InsertLeadInteraction
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

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
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
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      const schedules = await storage.getAgentSchedules(propertyId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const scheduleData = insertAgentScheduleSchema.parse(req.body);
      const schedule = await storage.createAgentSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid schedule data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create schedule" });
      }
    }
  });

  // Voice command processing route
  app.post("/api/voice-schedule", async (req, res) => {
    try {
      const { transcript, propertyId } = req.body;
      
      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ error: "Transcript is required" });
      }

      // Process voice command with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a property management scheduling assistant. Parse the user's voice command and extract scheduling information. Return a JSON object with an array of schedules. Each schedule should have:
            - dayOfWeek: number (0=Sunday, 1=Monday, etc.)
            - startTime: string (HH:MM format)
            - endTime: string (HH:MM format)
            - isActive: boolean
            - propertyId: number or null
            
            If no specific property is mentioned and propertyId is provided, use that propertyId. Otherwise use null for all properties.
            
            Example response:
            {
              "schedules": [
                {
                  "dayOfWeek": 6,
                  "startTime": "14:00",
                  "endTime": "16:00",
                  "isActive": true,
                  "propertyId": null
                }
              ]
            }`
          },
          {
            role: "user",
            content: transcript
          }
        ],
        response_format: { type: "json_object" }
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content || '{"schedules": []}');
      const schedules: AgentSchedule[] = [];

      // Create schedules from parsed response
      for (const scheduleData of parsedResponse.schedules) {
        const schedule = await storage.createAgentSchedule({
          dayOfWeek: scheduleData.dayOfWeek,
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          isActive: scheduleData.isActive,
          propertyId: propertyId || scheduleData.propertyId
        });
        schedules.push(schedule);
      }

      res.json({
        message: `Created ${schedules.length} schedule(s) from voice command`,
        transcript,
        schedules
      });
    } catch (error) {
      console.error('Voice command processing error:', error);
      res.status(500).json({ error: "Failed to process voice command" });
    }
  });

  // Showing Requests routes
  app.get("/api/showing-requests", async (req, res) => {
    try {
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      const requests = await storage.getShowingRequests(propertyId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch showing requests" });
    }
  });

  app.post("/api/showing-requests", async (req, res) => {
    try {
      const requestData = insertShowingRequestSchema.parse(req.body);
      const request = await storage.createShowingRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create showing request" });
      }
    }
  });

  // Scheduled Showings routes
  app.get("/api/showings", async (req, res) => {
    try {
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      const showings = await storage.getScheduledShowings(propertyId);
      res.json(showings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scheduled showings" });
    }
  });

  app.post("/api/showings", async (req, res) => {
    try {
      const showingData = insertScheduledShowingSchema.parse(req.body);
      const showing = await storage.createScheduledShowing(showingData);
      res.status(201).json(showing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid showing data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create scheduled showing" });
      }
    }
  });

  // Popular showing times analytics
  app.get("/api/properties/:id/popular-times", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const popularTimes = await storage.getPopularShowingTimes(propertyId);
      res.json(popularTimes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular times" });
    }
  });

  // AI-Powered Feedback System Routes
  app.post("/api/feedback/start-session", async (req, res) => {
    try {
      const { leadId, propertyId, sessionType } = req.body;
      
      if (!leadId || !propertyId || !sessionType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create feedback session
      const session = await storage.createFeedbackSession({
        leadId,
        propertyId,
        sessionType,
        status: "active",
        currentQuestionIndex: 0
      });

      // Generate initial questions using AI
      const lead = await storage.getLead(leadId);
      const property = await storage.getProperty(propertyId);
      
      const initialQuestions = await generateInitialQuestions(sessionType, lead, property);
      
      // Log interaction
      await storage.createLeadInteraction({
        leadId,
        interactionType: "feedback_started",
        description: `Started ${sessionType} feedback session for ${property?.name}`,
        metadata: JSON.stringify({ sessionId: session.id, sessionType })
      });

      res.json({
        sessionId: session.id,
        initialQuestions
      });
    } catch (error) {
      console.error('Start session error:', error);
      res.status(500).json({ error: "Failed to start feedback session" });
    }
  });

  app.post("/api/feedback/submit-response", async (req, res) => {
    try {
      const { sessionId, questionId, responseMethod, responseValue, responseText } = req.body;
      
      if (!sessionId || !questionId || !responseMethod || !responseValue) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const session = await storage.getFeedbackSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Save response
      const response = await storage.createFeedbackResponse({
        sessionId,
        questionId,
        questionText: "", // Will be populated by AI
        responseMethod,
        responseValue,
        responseText
      });

      // Get all previous responses for context
      const allResponses = await storage.getFeedbackResponses(sessionId);
      const lead = await storage.getLead(session.leadId);
      const property = await storage.getProperty(session.propertyId);

      // Generate next question using AI
      const aiResult = await generateNextQuestion(
        session, 
        allResponses, 
        responseValue, 
        lead, 
        property
      );

      // Update session with discovered information
      const sessionUpdates: Partial<InsertFeedbackSession> = {
        currentQuestionIndex: session.currentQuestionIndex + 1
      };

      if (aiResult.discoveredBudget) {
        sessionUpdates.discoveredBudget = aiResult.discoveredBudget;
      }
      if (aiResult.proposedMoveInDate) {
        sessionUpdates.proposedMoveInDate = aiResult.proposedMoveInDate;
      }
      if (aiResult.interestLevel) {
        sessionUpdates.interestLevel = aiResult.interestLevel;
      }
      if (aiResult.preferredResponseMethod) {
        sessionUpdates.preferredResponseMethod = aiResult.preferredResponseMethod;
      }

      if (aiResult.isComplete) {
        sessionUpdates.status = "completed";
        sessionUpdates.completedAt = new Date().toISOString() as any;
      }

      await storage.updateFeedbackSession(sessionId, sessionUpdates);

      res.json({
        nextQuestion: aiResult.nextQuestion,
        isComplete: aiResult.isComplete,
        summary: aiResult.summary
      });
    } catch (error) {
      console.error('Submit response error:', error);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  app.get("/api/feedback/sessions", async (req, res) => {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const sessions = await storage.getFeedbackSessions(leadId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback sessions" });
    }
  });

  app.get("/api/feedback/sessions/:sessionId/responses", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const responses = await storage.getFeedbackResponses(sessionId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session responses" });
    }
  });

  // Helper function to generate initial questions
  async function generateInitialQuestions(sessionType: string, lead: any, property: any) {
    const prompt = sessionType === "discovery" 
      ? `Generate 1-2 initial discovery questions for a new rental lead. The lead is ${lead?.name} interested in ${property?.name}. Focus on understanding their needs, timeline, and budget preferences. Return JSON with: {questions: [{id: string, text: string, type: "open"|"budget"|"move_in_date", options?: string[], emoji_options?: string[]}]}`
      : `Generate 1-2 initial post-tour feedback questions for a rental prospect who just toured ${property?.name}. Focus on their impressions and interest level. Return JSON with: {questions: [{id: string, text: string, type: "open"|"interest_level", options?: string[], emoji_options?: string[]}]}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a property management assistant specializing in lead qualification and feedback collection. Generate engaging, conversational questions that feel natural and encourage detailed responses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      return result.questions || [];
    } catch (error) {
      console.error('AI question generation error:', error);
      // Fallback questions
      return sessionType === "discovery" 
        ? [{
            id: "initial_needs",
            text: "Hi! I'd love to learn more about what you're looking for in your next home. Could you tell me about your ideal living situation?",
            type: "open"
          }]
        : [{
            id: "tour_impression",
            text: "Thanks for touring with us today! What were your first impressions of the property?",
            type: "open",
            emoji_options: ["😍", "😊", "😐", "😕"]
          }];
    }
  }

  // Helper function to generate next question based on response
  async function generateNextQuestion(session: any, responses: any[], latestResponse: string, lead: any, property: any) {
    const responseContext = responses.map(r => `Q: ${r.questionText} A: ${r.responseValue}`).join("\n");
    
    const prompt = `
    Context: ${session.sessionType} session for ${property?.name} with lead ${lead?.name}
    Previous responses: ${responseContext}
    Latest response: ${latestResponse}
    
    Analyze the conversation and:
    1. Determine if budget or move-in date info was revealed
    2. Generate the next logical question that builds on their response
    3. If they seem interested but haven't revealed budget/timeline, craft a question to discover this naturally
    4. Decide if the session should continue or conclude
    
    Return JSON: {
      "nextQuestion": {id: string, text: string, type: string, options?: string[], emoji_options?: string[]},
      "discoveredBudget": number|null,
      "proposedMoveInDate": "YYYY-MM-DD"|null,
      "interestLevel": 1-10|null,
      "isComplete": boolean,
      "summary": string|null
    }`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at reading between the lines in prospect conversations. Extract key information like budget hints, timeline preferences, and interest levels. Generate follow-up questions that naturally uncover what the prospect would be willing to pay and when they'd like to move."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{"nextQuestion": null, "isComplete": true}');
    } catch (error) {
      console.error('AI next question generation error:', error);
      return {
        nextQuestion: null,
        isComplete: true,
        summary: "Thank you for your feedback!"
      };
    }
  }

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
