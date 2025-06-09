import { properties, leads, type Property, type Lead, type InsertProperty, type InsertLead } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private leads: Map<number, Lead>;
  private currentPropertyId: number;
  private currentLeadId: number;

  constructor() {
    this.properties = new Map();
    this.leads = new Map();
    this.currentPropertyId = 1;
    this.currentLeadId = 1;
    
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
}

export const storage = new MemStorage();
