import { 
  properties, 
  leads, 
  agentSchedules,
  showingRequests,
  scheduledShowings,
  feedbackSessions,
  feedbackResponses,
  type Property, 
  type Lead, 
  type InsertProperty, 
  type InsertLead,
  type AgentSchedule,
  type InsertAgentSchedule,
  type ShowingRequest,
  type InsertShowingRequest,
  type ScheduledShowing,
  type InsertScheduledShowing,
  type FeedbackSession,
  type InsertFeedbackSession,
  type FeedbackResponse,
  type InsertFeedbackResponse,
  type UserProfile,
  type InsertUserProfile
} from "@shared/schema";

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  getLeadsByProperty(propertyId: number): Promise<Lead[]>;
  assignLeadToProperty(leadId: number, propertyId: number | null): Promise<Lead | undefined>;
  
  // Bulk operations
  createProperties(properties: InsertProperty[]): Promise<Property[]>;
  
  // Agent Schedules
  getAgentSchedules(propertyId?: number): Promise<AgentSchedule[]>;
  createAgentSchedule(schedule: InsertAgentSchedule): Promise<AgentSchedule>;
  updateAgentSchedule(id: number, updates: Partial<InsertAgentSchedule>): Promise<AgentSchedule | undefined>;
  deleteAgentSchedule(id: number): Promise<boolean>;
  
  // Showing Requests
  getShowingRequests(propertyId?: number): Promise<ShowingRequest[]>;
  createShowingRequest(request: InsertShowingRequest): Promise<ShowingRequest>;
  updateShowingRequest(id: number, updates: Partial<InsertShowingRequest>): Promise<ShowingRequest | undefined>;
  getPopularShowingTimes(propertyId: number): Promise<{ time: string; count: number; date: string }[]>;
  
  // Scheduled Showings
  getScheduledShowings(propertyId?: number): Promise<ScheduledShowing[]>;
  createScheduledShowing(showing: InsertScheduledShowing): Promise<ScheduledShowing>;
  updateScheduledShowing(id: number, updates: Partial<InsertScheduledShowing>): Promise<ScheduledShowing | undefined>;
  deleteScheduledShowing(id: number): Promise<boolean>;
  
  // Feedback Sessions
  getFeedbackSessions(leadId?: number): Promise<FeedbackSession[]>;
  createFeedbackSession(session: InsertFeedbackSession): Promise<FeedbackSession>;
  updateFeedbackSession(id: number, updates: Partial<InsertFeedbackSession>): Promise<FeedbackSession | undefined>;
  getFeedbackSession(id: number): Promise<FeedbackSession | undefined>;
  
  // Feedback Responses
  getFeedbackResponses(sessionId: number): Promise<FeedbackResponse[]>;
  createFeedbackResponse(response: InsertFeedbackResponse): Promise<FeedbackResponse>;
  
  // User Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private leads: Map<number, Lead>;
  private agentSchedules: Map<number, AgentSchedule>;
  private showingRequests: Map<number, ShowingRequest>;
  private scheduledShowings: Map<number, ScheduledShowing>;
  private feedbackSessions: Map<number, FeedbackSession>;
  private feedbackResponses: Map<number, FeedbackResponse>;
  private userProfiles: Map<string, UserProfile>;
  private currentPropertyId: number;
  private currentLeadId: number;
  private currentScheduleId: number;
  private currentRequestId: number;
  private currentShowingId: number;
  private currentFeedbackSessionId: number;
  private currentFeedbackResponseId: number;
  private currentUserProfileId: number;

  constructor() {
    this.properties = new Map();
    this.leads = new Map();
    this.agentSchedules = new Map();
    this.showingRequests = new Map();
    this.scheduledShowings = new Map();
    this.feedbackSessions = new Map();
    this.feedbackResponses = new Map();
    this.userProfiles = new Map();
    this.currentPropertyId = 1;
    this.currentLeadId = 1;
    this.currentScheduleId = 1;
    this.currentRequestId = 1;
    this.currentShowingId = 1;
    this.currentFeedbackSessionId = 1;
    this.currentFeedbackResponseId = 1;
    this.currentUserProfileId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample properties
    const sampleProperties = [
      {
        name: "Sunset Apartments",
        address: "123 Main St, Downtown",
        bedrooms: "2 Bed",
        rent: "1850.00",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100",
        description: "Modern apartment with city views",
        available: true,
      },
      {
        name: "Oak Hill House",
        address: "456 Oak St, Suburbs",
        bedrooms: "4 Bed",
        rent: "2950.00",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100",
        description: "Luxury family home with large yard",
        available: true,
      },
      {
        name: "City View Studio",
        address: "789 High St, Midtown",
        bedrooms: "Studio",
        rent: "1350.00",
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100",
        description: "Compact studio with modern amenities",
        available: true,
      },
    ];

    sampleProperties.forEach(prop => {
      const property: Property = { 
        ...prop, 
        id: this.currentPropertyId++,
        imageUrl: prop.imageUrl || null,
        description: prop.description || null,
        available: prop.available ?? true
      };
      this.properties.set(property.id, property);
    });

    // Sample leads
    const sampleLeads = [
      {
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        phone: "+1 (555) 123-4567",
        status: "new",
        source: "Zillow",
        preferences: "Looking for 2BR apartment",
        propertyId: 1,
      },
      {
        name: "Mike Chen",
        email: "mike.chen@email.com",
        phone: "+1 (555) 987-6543",
        status: "contacted",
        source: "Apartments.com",
        preferences: "Family home needed",
        propertyId: 2,
      },
      {
        name: "Emma Davis",
        email: "emma.davis@email.com",
        phone: "+1 (555) 456-7890",
        status: "qualified",
        source: "Website",
        preferences: "Studio or 1BR",
        propertyId: 3,
      },
      {
        name: "Alex Rodriguez",
        email: "alex.r@email.com",
        phone: "+1 (555) 321-9876",
        status: "viewing",
        source: "Rent.com",
        preferences: "Downtown location preferred",
        propertyId: 1,
      },
      {
        name: "Jessica Miller",
        email: "jessica.m@email.com",
        phone: "+1 (555) 111-2222",
        status: "new",
        source: "Zillow",
        preferences: "Looking for 2BR, Budget: $2000",
        propertyId: null,
      },
      {
        name: "David Park",
        email: "david.p@email.com",
        phone: "+1 (555) 333-4444",
        status: "new",
        source: "Website",
        preferences: "Looking for Studio, Budget: $1500",
        propertyId: null,
      },
    ];

    sampleLeads.forEach(lead => {
      const newLead: Lead = { 
        ...lead, 
        id: this.currentLeadId++,
        source: lead.source || null,
        status: lead.status || "new",
        phone: lead.phone || null,
        preferences: lead.preferences || null,
        propertyId: lead.propertyId || null
      };
      this.leads.set(newLead.id, newLead);
    });
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = { 
      ...insertProperty, 
      id,
      imageUrl: insertProperty.imageUrl || null,
      description: insertProperty.description || null,
      available: insertProperty.available ?? true
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = { 
      ...insertLead, 
      id,
      status: insertLead.status || "new",
      phone: insertLead.phone || null,
      source: insertLead.source || null,
      preferences: insertLead.preferences || null,
      propertyId: insertLead.propertyId || null
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  async getLeadsByProperty(propertyId: number): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(lead => lead.propertyId === propertyId);
  }

  async assignLeadToProperty(leadId: number, propertyId: number | null): Promise<Lead | undefined> {
    const lead = this.leads.get(leadId);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, propertyId };
    this.leads.set(leadId, updatedLead);
    return updatedLead;
  }

  async createProperties(insertProperties: InsertProperty[]): Promise<Property[]> {
    const createdProperties: Property[] = [];
    
    for (const insertProperty of insertProperties) {
      const property = await this.createProperty(insertProperty);
      createdProperties.push(property);
    }
    
    return createdProperties;
  }

  // Agent Schedules
  async getAgentSchedules(propertyId?: number): Promise<AgentSchedule[]> {
    const schedules = Array.from(this.agentSchedules.values());
    return propertyId 
      ? schedules.filter(schedule => schedule.propertyId === propertyId)
      : schedules;
  }

  async createAgentSchedule(insertSchedule: InsertAgentSchedule): Promise<AgentSchedule> {
    const id = this.currentScheduleId++;
    const schedule: AgentSchedule = { 
      ...insertSchedule, 
      id,
      isActive: insertSchedule.isActive ?? true
    };
    this.agentSchedules.set(id, schedule);
    return schedule;
  }

  async updateAgentSchedule(id: number, updates: Partial<InsertAgentSchedule>): Promise<AgentSchedule | undefined> {
    const schedule = this.agentSchedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, ...updates };
    this.agentSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteAgentSchedule(id: number): Promise<boolean> {
    return this.agentSchedules.delete(id);
  }

  // Showing Requests
  async getShowingRequests(propertyId?: number): Promise<ShowingRequest[]> {
    const requests = Array.from(this.showingRequests.values());
    return propertyId 
      ? requests.filter(request => request.propertyId === propertyId)
      : requests;
  }

  async createShowingRequest(insertRequest: InsertShowingRequest): Promise<ShowingRequest> {
    const id = this.currentRequestId++;
    const request: ShowingRequest = { 
      ...insertRequest, 
      id,
      status: insertRequest.status || "pending",
      createdAt: new Date()
    };
    this.showingRequests.set(id, request);
    return request;
  }

  async updateShowingRequest(id: number, updates: Partial<InsertShowingRequest>): Promise<ShowingRequest | undefined> {
    const request = this.showingRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.showingRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getPopularShowingTimes(propertyId: number): Promise<{ time: string; count: number; date: string }[]> {
    const requests = Array.from(this.showingRequests.values())
      .filter(request => request.propertyId === propertyId && request.status === "pending");
    
    const timeMap = new Map<string, { count: number; dates: Set<string> }>();
    
    requests.forEach(request => {
      const key = request.requestedTime;
      if (!timeMap.has(key)) {
        timeMap.set(key, { count: 0, dates: new Set() });
      }
      const entry = timeMap.get(key)!;
      entry.count++;
      entry.dates.add(request.requestedDate);
    });

    return Array.from(timeMap.entries())
      .map(([time, data]) => ({
        time,
        count: data.count,
        date: Array.from(data.dates)[0] // Most common date for this time
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Scheduled Showings
  async getScheduledShowings(propertyId?: number): Promise<ScheduledShowing[]> {
    const showings = Array.from(this.scheduledShowings.values());
    return propertyId 
      ? showings.filter(showing => showing.propertyId === propertyId)
      : showings;
  }

  async createScheduledShowing(insertShowing: InsertScheduledShowing): Promise<ScheduledShowing> {
    const id = this.currentShowingId++;
    const showing: ScheduledShowing = { 
      ...insertShowing, 
      id,
      duration: insertShowing.duration || 30,
      status: insertShowing.status || "scheduled",
      createdAt: new Date()
    };
    this.scheduledShowings.set(id, showing);
    return showing;
  }

  async updateScheduledShowing(id: number, updates: Partial<InsertScheduledShowing>): Promise<ScheduledShowing | undefined> {
    const showing = this.scheduledShowings.get(id);
    if (!showing) return undefined;
    
    const updatedShowing = { ...showing, ...updates };
    this.scheduledShowings.set(id, updatedShowing);
    return updatedShowing;
  }

  async deleteScheduledShowing(id: number): Promise<boolean> {
    return this.scheduledShowings.delete(id);
  }

  // Feedback Sessions
  async getFeedbackSessions(leadId?: number): Promise<FeedbackSession[]> {
    const sessions = Array.from(this.feedbackSessions.values());
    if (leadId) {
      return sessions.filter(session => session.leadId === leadId);
    }
    return sessions;
  }

  async createFeedbackSession(insertSession: InsertFeedbackSession): Promise<FeedbackSession> {
    const session: FeedbackSession = {
      id: this.currentFeedbackSessionId++,
      leadId: insertSession.leadId,
      propertyId: insertSession.propertyId || null,
      sessionType: insertSession.sessionType,
      status: insertSession.status || 'active',
      preferredResponseMethod: insertSession.preferredResponseMethod || null,
      currentQuestionIndex: insertSession.currentQuestionIndex || 0,
      sessionData: insertSession.sessionData || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.feedbackSessions.set(session.id, session);
    return session;
  }

  async updateFeedbackSession(id: number, updates: Partial<InsertFeedbackSession>): Promise<FeedbackSession | undefined> {
    const session = this.feedbackSessions.get(id);
    if (!session) return undefined;

    const updatedSession: FeedbackSession = {
      ...session,
      ...updates,
      updatedAt: new Date()
    };
    this.feedbackSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getFeedbackSession(id: number): Promise<FeedbackSession | undefined> {
    return this.feedbackSessions.get(id);
  }

  // Feedback Responses
  async getFeedbackResponses(sessionId: number): Promise<FeedbackResponse[]> {
    const responses = Array.from(this.feedbackResponses.values());
    return responses.filter(response => response.sessionId === sessionId);
  }

  async createFeedbackResponse(insertResponse: InsertFeedbackResponse): Promise<FeedbackResponse> {
    const response: FeedbackResponse = {
      id: this.currentFeedbackResponseId++,
      sessionId: insertResponse.sessionId,
      questionText: insertResponse.questionText,
      responseText: insertResponse.responseText || null,
      responseMethod: insertResponse.responseMethod,
      aiGeneratedQuestion: insertResponse.aiGeneratedQuestion || false,
      metadata: insertResponse.metadata || null,
      createdAt: new Date(),
    };
    this.feedbackResponses.set(response.id, response);
    return response;
  }

  // User Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(userId);
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const profile: UserProfile = {
      id: this.currentUserProfileId++,
      userId: insertProfile.userId,
      isLicensedAgent: insertProfile.isLicensedAgent,
      firstName: insertProfile.firstName,
      lastName: insertProfile.lastName,
      email: insertProfile.email,
      phone: insertProfile.phone || null,
      profileImageUrl: insertProfile.profileImageUrl || null,
      licenseNumber: insertProfile.licenseNumber || null,
      licenseState: insertProfile.licenseState || null,
      licenseExpiration: insertProfile.licenseExpiration || null,
      brokerageName: insertProfile.brokerageName || null,
      brokerageAddress: insertProfile.brokerageAddress || null,
      brokeragePhone: insertProfile.brokeragePhone || null,
      yearsExperience: insertProfile.yearsExperience || null,
      specialties: insertProfile.specialties || null,
      companyName: insertProfile.companyName || null,
      businessAddress: insertProfile.businessAddress || null,
      numberOfProperties: insertProfile.numberOfProperties || null,
      propertyTypes: insertProfile.propertyTypes || null,
      bio: insertProfile.bio || null,
      website: insertProfile.website || null,
      socialMediaLinks: insertProfile.socialMediaLinks || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.userProfiles.set(profile.userId, profile);
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existingProfile = this.userProfiles.get(userId);
    if (!existingProfile) return undefined;
    
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.userProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }
}

export const storage = new MemStorage();
