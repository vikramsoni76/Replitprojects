import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export * from "./models/auth";

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerId: text("seller_id").notNull(), // Links to auth users.id
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Specs
  heads: integer("heads").notNull(),
  needles: integer("needles").notNull(),
  area: text("area").notNull(), // Embroidery area
  year: integer("year").notNull(),
  // Media
  photos: text("photos").array().notNull(),
  video: text("video"),
  // Status
  status: text("status", { enum: ["pending", "approved", "rejected", "sold"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  listing: one(listings, {
    fields: [leads.listingId],
    references: [listings.id],
  }),
}));

export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  sellerId: true, 
  status: true, 
  createdAt: true 
});

export const insertLeadSchema = createInsertSchema(leads).omit({ 
  id: true, 
  createdAt: true 
});

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
