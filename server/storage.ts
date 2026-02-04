import { db } from "./db";
import { listings, leads, type Listing, type InsertListing, type Lead, type InsertLead, users } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Listings
  getListings(status?: string, sellerId?: string): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  createListing(listing: InsertListing & { sellerId: string }): Promise<Listing>;
  updateListing(id: number, updates: Partial<Listing>): Promise<Listing>;
  deleteListing(id: number): Promise<void>;
  
  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(listingId?: number): Promise<Lead[]>;
  
  // Helpers
  getUser(id: string): Promise<typeof users.$inferSelect | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getListings(status?: string, sellerId?: string): Promise<Listing[]> {
    let query = db.select().from(listings);
    const filters = [];
    
    if (status) {
      filters.push(eq(listings.status, status as any));
    }
    if (sellerId) {
      filters.push(eq(listings.sellerId, sellerId));
    }
    
    if (filters.length > 0) {
      // @ts-ignore
      return await query.where(and(...filters)).orderBy(desc(listings.createdAt));
    }
    
    return await query.orderBy(desc(listings.createdAt));
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async createListing(insertListing: InsertListing & { sellerId: string }): Promise<Listing> {
    const [listing] = await db.insert(listings).values(insertListing).returning();
    return listing;
  }

  async updateListing(id: number, updates: Partial<Listing>): Promise<Listing> {
    const [updated] = await db.update(listings).set(updates).where(eq(listings.id, id)).returning();
    return updated;
  }

  async deleteListing(id: number): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLeads(listingId?: number): Promise<Lead[]> {
    if (listingId) {
      return await db.select().from(leads).where(eq(leads.listingId, listingId)).orderBy(desc(leads.createdAt));
    }
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getUser(id: string) {
    return authStorage.getUser(id);
  }
}

export const storage = new DatabaseStorage();
