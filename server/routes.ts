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
  insertUserProfileSchema,
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
  type InsertFeedbackSession,
  type FeedbackSession,
  type InsertFeedbackResponse,
  type FeedbackResponse,
  type InsertUserProfile,
  type UserProfile
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

  // Feedback Sessions routes
  app.post("/api/feedback/sessions", async (req, res) => {
    try {
      const sessionData = insertFeedbackSessionSchema.parse(req.body);
      const session = await storage.createFeedbackSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create feedback session" });
      }
    }
  });

  app.get("/api/feedback/sessions", async (req, res) => {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const sessions = await storage.getFeedbackSessions(leadId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/feedback/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getFeedbackSession(id);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.patch("/api/feedback/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateFeedbackSession(id, updates);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Feedback Responses routes
  app.post("/api/feedback/responses", async (req, res) => {
    try {
      const responseData = insertFeedbackResponseSchema.parse(req.body);
      const response = await storage.createFeedbackResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid response data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create feedback response" });
      }
    }
  });

  // AI Question Generation with OpenAI
  app.post("/api/feedback/generate-questions", async (req, res) => {
    try {
      const { sessionType, leadId, propertyId, previousResponses, currentQuestionIndex } = req.body;
      
      // Use OpenAI to generate intelligent follow-up questions
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const systemPrompt = sessionType === 'discovery' 
        ? `You are an AI assistant helping with lead discovery questions for a real estate property. Generate short, concise questions (max 10 words) that help understand what the prospect is looking for. Focus on preferences, timeline, budget, and interest level. Always ask about pricing if interest seems unclear.`
        : `You are an AI assistant helping with post-tour feedback for a real estate property. Generate short, concise questions (max 10 words) that gather feedback about the tour experience. Always ask about pricing willingness and move-in timeline if responses are unclear.`;

      const userPrompt = `Previous responses: ${previousResponses.join(', ')}. Generate 1-2 follow-up questions as JSON array with format: [{"text": "question", "type": "pricing|timeline|interest|preference|open", "responseOptions": ["option1", "option2"], "emojiOptions": ["😀", "🤔"]}]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.7
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
      res.json({ questions: result.questions || [] });
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: "Failed to generate questions", questions: [] });
    }
  });

  // AI Question Generation route
  app.post("/api/feedback/generate-question", async (req, res) => {
    try {
      const { sessionId, context } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const session = await storage.getFeedbackSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const responses = await storage.getFeedbackResponses(sessionId);
      const currentIndex = session.currentQuestionIndex;

      // Use OpenAI to generate intelligent follow-up questions
      const systemPrompt = session.sessionType === 'discovery' 
        ? `You are a property management discovery assistant. Your goal is to understand what the prospect is looking for in their next rental home and encourage them to schedule a tour. Ask engaging questions to discover their preferences, budget, timeline, and specific needs. IMPORTANT: You must cleverly ask about their budget/price range and move-in timeline without being too direct. Make it conversational.

Key objectives:
1. Understand their housing preferences (size, location, amenities)
2. Discover their budget range (ask creatively - "What monthly payment fits comfortably in your budget?" or "What price range are you considering?")
3. Learn their timeline (ask naturally - "When are you hoping to move?" or "What's your ideal move-in timeframe?")
4. Build interest in scheduling a tour
5. Keep questions engaging and conversational

Previous responses: ${JSON.stringify(responses.map(r => ({ question: r.questionText, answer: r.responseText })))}

Generate the next question as JSON with this structure:
{
  "question": {
    "text": "Your question here",
    "type": "open|pricing|timeline|interest|preference",
    "responseOptions": ["option1", "option2"] // only for dropdown responses
  },
  "completed": false
}

If you've gathered sufficient information (preferences, budget hint, timeline, and interest), set completed: true.`
        : `You are a property management feedback assistant collecting post-tour feedback. Your goal is to understand the prospect's experience and gauge their interest level. Ask about their tour experience, what they liked/disliked, and their likelihood to move forward.

Key objectives:
1. Understand their tour experience
2. Learn what they liked and didn't like
3. Gauge their interest level
4. If they seem interested, understand their decision timeline
5. If not interested, understand their concerns

Previous responses: ${JSON.stringify(responses.map(r => ({ question: r.questionText, answer: r.responseText })))}

Generate the next question as JSON with this structure:
{
  "question": {
    "text": "Your question here",
    "type": "open|experience|interest|timeline|concerns",
    "responseOptions": ["option1", "option2"] // only for dropdown responses  
  },
  "completed": false
}

If you've gathered sufficient feedback, set completed: true.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate the next question for this feedback session. Current question index: ${currentIndex}. Session type: ${session.sessionType}.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const questionData = JSON.parse(response.choices[0].message.content || '{"completed": true}');

      // Update session with new question index
      if (!questionData.completed) {
        await storage.updateFeedbackSession(sessionId, {
          currentQuestionIndex: currentIndex + 1
        });
      } else {
        await storage.updateFeedbackSession(sessionId, {
          status: "completed"
        });
      }

      res.json({
        question: questionData.question,
        completed: questionData.completed,
        message: questionData.completed ? "Feedback session completed" : "Next question generated"
      });
    } catch (error) {
      console.error('Question generation error:', error);
      res.status(500).json({ error: "Failed to generate question" });
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

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      // For demo purposes, using a default user ID
      const userId = "demo-user-123";
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        // Create a default profile if none exists
        const defaultProfile = {
          userId,
          isLicensedAgent: false,
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com"
        };
        const newProfile = await storage.createUserProfile(defaultProfile);
        return res.json(newProfile);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profile = await storage.createUserProfile(req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      // For demo purposes, using a default user ID
      const userId = "demo-user-123";
      const profile = await storage.updateUserProfile(userId, req.body);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Property Syndication API routes
  app.post("/api/syndication/test-connection", async (req, res) => {
    try {
      const { platform, apiKey } = req.body;
      
      if (!platform || !apiKey) {
        return res.status(400).json({ error: "Platform and API key required" });
      }

      // Simulate API connection test based on platform
      const testResult = await testPlatformConnection(platform, apiKey);
      
      res.json({
        success: testResult.success,
        message: testResult.message,
        connectionDetails: testResult.details
      });
    } catch (error) {
      console.error("Connection test error:", error);
      res.status(500).json({ error: "Failed to test connection" });
    }
  });

  app.post("/api/syndication/sync", async (req, res) => {
    try {
      const { platform, apiKey, syncType = "full" } = req.body;
      
      if (!platform || !apiKey) {
        return res.status(400).json({ error: "Platform and API key required" });
      }

      // Simulate data sync from external platform
      const syncResult = await syncPlatformData(platform, apiKey, syncType);
      
      // Save synced properties to storage
      if (syncResult.properties?.length > 0) {
        await storage.createProperties(syncResult.properties);
      }

      // Save synced leads to storage
      if (syncResult.leads?.length > 0) {
        for (const lead of syncResult.leads) {
          await storage.createLead(lead);
        }
      }

      res.json({
        success: true,
        message: `Successfully synced ${syncResult.properties?.length || 0} properties and ${syncResult.leads?.length || 0} leads`,
        propertiesCount: syncResult.properties?.length || 0,
        leadsCount: syncResult.leads?.length || 0,
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  });

  app.get("/api/syndication/connections", async (req, res) => {
    try {
      // Return connection status for all platforms
      const connections = [
        {
          id: "zillow",
          name: "Zillow Rental Manager",
          status: "connected",
          lastSync: "2 hours ago",
          propertiesCount: 12,
          leadsCount: 34
        },
        {
          id: "yardi",
          name: "Yardi Voyager",
          status: "disconnected",
          lastSync: null,
          propertiesCount: 0,
          leadsCount: 0
        }
        // Add more connections as needed
      ];
      
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  // Webhook endpoint for real-time updates
  app.post("/api/webhooks/properties", async (req, res) => {
    try {
      const { platform, event, data } = req.body;
      
      // Process webhook based on event type
      switch (event) {
        case "property.created":
        case "property.updated":
          if (data.property) {
            const property = await storage.createProperty({
              name: data.property.name,
              address: data.property.address,
              bedrooms: data.property.bedrooms,
              rent: data.property.rent,
              description: data.property.description,
              imageUrl: data.property.imageUrl,
              available: data.property.available
            });
            console.log(`Webhook: Property ${event} from ${platform}`, property);
          }
          break;
          
        case "lead.created":
          if (data.lead) {
            const lead = await storage.createLead({
              name: data.lead.name,
              email: data.lead.email,
              phone: data.lead.phone,
              propertyId: data.lead.propertyId,
              status: data.lead.status || "new",
              notes: data.lead.notes
            });
            console.log(`Webhook: Lead created from ${platform}`, lead);
          }
          break;
          
        default:
          console.log(`Webhook: Unknown event ${event} from ${platform}`);
      }
      
      res.json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for property syndication
async function testPlatformConnection(platform: string, apiKey: string) {
  // Simulate API connection test based on platform
  const platformConfigs = {
    zillow: {
      endpoint: "https://api.zillow.com/v1/properties",
      headers: { "Authorization": `Bearer ${apiKey}` }
    },
    yardi: {
      endpoint: "https://api.yardi.com/properties",
      headers: { "X-API-Key": apiKey }
    },
    appfolio: {
      endpoint: "https://api.appfolio.com/v1/properties",
      headers: { "Authorization": `Token ${apiKey}` }
    },
    buildium: {
      endpoint: "https://api.buildium.com/v1/properties",
      headers: { "Authorization": `Bearer ${apiKey}` }
    }
  };

  const config = platformConfigs[platform as keyof typeof platformConfigs];
  
  if (!config) {
    return {
      success: false,
      message: `Platform ${platform} not supported`,
      details: null
    };
  }

  // Simulate API test - in production this would make actual HTTP requests
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully connected to ${platform}`,
        details: {
          endpoint: config.endpoint,
          authenticated: true,
          permissions: ["read_properties", "read_leads"]
        }
      });
    }, 1500);
  });
}

async function syncPlatformData(platform: string, apiKey: string, syncType: string) {
  // Simulate data sync from external platforms
  const sampleData = {
    zillow: {
      properties: [
        {
          name: "Modern Downtown Loft",
          address: "456 Tech Blvd, San Francisco, CA 94105",
          bedrooms: "1",
          rent: "$3200",
          description: "Luxury loft with city views and modern amenities",
          imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
          available: true
        },
        {
          name: "Family Home in Suburbs",
          address: "789 Oak Street, Palo Alto, CA 94301",
          bedrooms: "3",
          rent: "$4500",
          description: "Spacious family home with garden and garage",
          imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
          available: true
        }
      ],
      leads: [
        {
          name: "Jennifer Chen",
          email: "jennifer.chen@email.com",
          phone: "+1 (555) 987-6543",
          status: "interested",
          notes: "Looking for 1-bedroom in downtown area, budget $3000-3500"
        },
        {
          name: "Michael Rodriguez",
          email: "m.rodriguez@email.com", 
          phone: "+1 (555) 456-7890",
          status: "qualified",
          notes: "Family of 4, needs 3+ bedrooms, move-in ASAP"
        }
      ]
    },
    yardi: {
      properties: [
        {
          name: "Corporate Housing Complex",
          address: "101 Business Park Dr, Austin, TX 78701",
          bedrooms: "2",
          rent: "$2800",
          description: "Professional housing with business center and gym",
          imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
          available: true
        }
      ],
      leads: [
        {
          name: "Sarah Thompson",
          email: "sarah.t@company.com",
          phone: "+1 (555) 234-5678",
          status: "new",
          notes: "Corporate relocation, flexible on price"
        }
      ]
    },
    appfolio: {
      properties: [
        {
          name: "Beachside Apartment",
          address: "123 Ocean View Ave, Santa Monica, CA 90401",
          bedrooms: "2",
          rent: "$3800",
          description: "Ocean view apartment with balcony and parking",
          imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
          available: true
        }
      ],
      leads: [
        {
          name: "David Park",
          email: "david.park@email.com",
          phone: "+1 (555) 345-6789",
          status: "touring",
          notes: "Scheduled for viewing this weekend, very interested"
        }
      ]
    }
  };

  const platformData = sampleData[platform as keyof typeof sampleData];
  
  if (!platformData) {
    return {
      properties: [],
      leads: []
    };
  }

  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(platformData);
    }, 2000);
  });
}
