import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

interface ZillowProperty {
  zpid: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipcode: string;
  };
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  homeStatus: string;
  homeType: string;
  photos?: Array<{
    url: string;
  }>;
  hdpUrl: string;
  rentZestimate?: number;
  zestimate?: number;
}

interface ProcessedProperty {
  propertyId: string;
  fullAddress: string;
  listingStatus: string;
  price: number;
  beds?: number;
  baths?: number;
  squareFootage?: number;
  primaryPhotoUrl?: string;
  listingPermalink: string;
  rentEstimate?: number;
  valueEstimate?: number;
}

export class ZillowIntegration {
  private apiKey: string;
  private baseUrl = 'https://zillow-com1.p.rapidapi.com';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Zillow API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchPropertiesByLocation(location: string = 'Los Angeles, CA'): Promise<ProcessedProperty[]> {
    try {
      // Test with a simple property details request first
      console.log(`Searching for properties in: ${location}`);
      
      // Try to get a specific property by address for testing
      const searchParams: Record<string, string> = {
        address: location
      };

      const searchResults = await this.makeRequest('/property', searchParams);
      
      // Handle both single property and array responses
      if (!searchResults) {
        console.warn('No search results returned');
        return [];
      }

      const properties: ProcessedProperty[] = [];

      // Handle single property response
      if (searchResults.zpid || searchResults.address) {
        const processed = this.processProperty(searchResults);
        if (processed) {
          properties.push(processed);
        }
      }
      // Handle array of properties
      else if (searchResults.props && Array.isArray(searchResults.props)) {
        for (const property of searchResults.props) {
          try {
            const processed = this.processProperty(property);
            if (processed) {
              properties.push(processed);
            }
          } catch (error) {
            console.error(`Error processing property ${property.zpid}:`, error);
          }
        }
      }
      // Handle search results with different structure
      else if (searchResults.results && Array.isArray(searchResults.results)) {
        for (const property of searchResults.results) {
          try {
            const processed = this.processProperty(property);
            if (processed) {
              properties.push(processed);
            }
          } catch (error) {
            console.error(`Error processing property:`, error);
          }
        }
      }

      console.log(`Processed ${properties.length} properties from search results`);
      return properties;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  async getPropertyDetails(zpid: string): Promise<ProcessedProperty | null> {
    try {
      const details = await this.makeRequest('/property', { zpid });
      return this.processProperty(details);
    } catch (error) {
      console.error(`Error getting property details for ${zpid}:`, error);
      return null;
    }
  }

  private processProperty(property: ZillowProperty): ProcessedProperty | null {
    if (!property.zpid || !property.address) {
      return null;
    }

    const fullAddress = [
      property.address.streetAddress,
      property.address.city,
      property.address.state,
      property.address.zipcode
    ].filter(Boolean).join(', ');

    return {
      propertyId: property.zpid,
      fullAddress,
      listingStatus: this.normalizeStatus(property.homeStatus),
      price: property.price || property.zestimate || 0,
      beds: property.bedrooms,
      baths: property.bathrooms,
      squareFootage: property.livingArea,
      primaryPhotoUrl: property.photos?.[0]?.url,
      listingPermalink: property.hdpUrl,
      rentEstimate: property.rentZestimate,
      valueEstimate: property.zestimate
    };
  }

  private normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'FOR_SALE': 'For Sale',
      'FOR_RENT': 'For Rent',
      'SOLD': 'Sold',
      'OFF_MARKET': 'Off Market',
      'PENDING': 'Pending',
      'CONTINGENT': 'Contingent',
      'RECENTLY_SOLD': 'Recently Sold'
    };

    return statusMap[status] || status;
  }

  async savePropertiesToFile(properties: ProcessedProperty[], format: 'json' | 'csv' = 'json'): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `zillow-properties-${timestamp}.${format}`;
    const filepath = path.join(process.cwd(), 'data', filename);

    // Ensure data directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });

    if (format === 'json') {
      await fs.writeFile(filepath, JSON.stringify(properties, null, 2));
    } else {
      const csvContent = this.convertToCSV(properties);
      await fs.writeFile(filepath, csvContent);
    }

    return filepath;
  }

  private convertToCSV(properties: ProcessedProperty[]): string {
    if (properties.length === 0) return '';

    const headers = [
      'PropertyID',
      'FullAddress',
      'ListingStatus',
      'Price',
      'Beds',
      'Baths',
      'SquareFootage',
      'PrimaryPhotoURL',
      'ListingPermalink',
      'RentEstimate',
      'ValueEstimate'
    ];

    const rows = properties.map(prop => [
      prop.propertyId,
      `"${prop.fullAddress}"`,
      prop.listingStatus,
      prop.price,
      prop.beds || '',
      prop.baths || '',
      prop.squareFootage || '',
      prop.primaryPhotoUrl || '',
      prop.listingPermalink,
      prop.rentEstimate || '',
      prop.valueEstimate || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  async syncWithDatabase(properties: ProcessedProperty[], storage: any): Promise<number> {
    let syncedCount = 0;

    for (const property of properties) {
      try {
        // Check if property already exists
        const existingProperties = await storage.getProperties();
        const exists = existingProperties.find((p: any) => 
          p.zillowId === property.propertyId || 
          p.address === property.fullAddress
        );

        if (!exists) {
          // Create new property in our system
          await storage.createProperty({
            name: property.fullAddress.split(',')[0], // Use street address as name
            address: property.fullAddress,
            rent: property.price,
            bedrooms: property.beds || 0,
            bathrooms: property.baths || 0,
            squareFootage: property.squareFootage || 0,
            amenities: [],
            photos: property.primaryPhotoUrl ? [property.primaryPhotoUrl] : [],
            isAvailable: property.listingStatus === 'For Rent' || property.listingStatus === 'For Sale',
            zillowId: property.propertyId,
            zillowUrl: property.listingPermalink,
            listingStatus: property.listingStatus,
            rentEstimate: property.rentEstimate,
            valueEstimate: property.valueEstimate,
            lastSyncedAt: new Date()
          });
          syncedCount++;
        } else {
          // Update existing property with latest Zillow data
          await storage.updateProperty(exists.id, {
            rent: property.price,
            isAvailable: property.listingStatus === 'For Rent' || property.listingStatus === 'For Sale',
            listingStatus: property.listingStatus,
            rentEstimate: property.rentEstimate,
            valueEstimate: property.valueEstimate,
            lastSyncedAt: new Date()
          });
        }
      } catch (error) {
        console.error(`Error syncing property ${property.propertyId}:`, error);
      }
    }

    return syncedCount;
  }
}

export async function fetchZillowProperties(
  apiKey: string,
  location: string = 'Los Angeles, CA',
  syncToDatabase: boolean = true,
  storage?: any
): Promise<{ properties: ProcessedProperty[]; savedPath?: string; syncedCount?: number }> {
  const zillow = new ZillowIntegration(apiKey);

  try {
    console.log(`Fetching properties from Zillow for location: ${location}...`);
    const properties = await zillow.searchPropertiesByLocation(location);

    console.log(`Retrieved ${properties.length} properties from Zillow`);

    // Save to file
    const savedPath = await zillow.savePropertiesToFile(properties, 'json');
    console.log(`Properties saved to: ${savedPath}`);

    // Sync to database if requested
    let syncedCount = 0;
    if (syncToDatabase && storage) {
      syncedCount = await zillow.syncWithDatabase(properties, storage);
      console.log(`Synced ${syncedCount} new properties to database`);
    }

    return { properties, savedPath, syncedCount };
  } catch (error) {
    console.error('Failed to fetch Zillow properties:', error);
    throw error;
  }
}