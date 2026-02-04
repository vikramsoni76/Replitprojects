import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth";
import nodemailer from "nodemailer";

// Simple email sender
async function sendEmail(to: string, subject: string, text: string) {
  // Try to configure transporter if env vars exist
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Embroidery Marketplace" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  } else {
    console.log("SMTP not configured. Skipping email.");
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
  }
}

const ADMIN_EMAIL = "vikramsoni76@gmail.com";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Listings
  app.get(api.listings.list.path, async (req, res) => {
    const status = req.query.status as string | undefined;
    const sellerId = req.query.sellerId as string | undefined;
    const listings = await storage.getListings(status, sellerId);
    res.json(listings);
  });

  app.get(api.listings.get.path, async (req, res) => {
    const listing = await storage.getListing(Number(req.params.id));
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing);
  });

  app.post(api.listings.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.listings.create.input.parse(req.body);
      // @ts-ignore
      const userId = req.user.claims.sub;
      
      const listing = await storage.createListing({
        ...input,
        sellerId: userId,
      });
      
      // Notify admin about new listing?
      await sendEmail(
        ADMIN_EMAIL,
        "New Listing Pending Approval",
        `A new listing "${listing.title}" has been posted and is waiting for approval.`
      );

      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.listings.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.listings.update.input.parse(req.body);
      const existing = await storage.getListing(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // @ts-ignore
      const userId = req.user.claims.sub;
      // @ts-ignore
      const userEmail = req.user.claims.email;
      
      const isAdmin = userEmail === ADMIN_EMAIL;
      const isOwner = existing.sellerId === userId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Only admin can change status
      if (input.status && !isAdmin) {
         delete input.status;
      }

      const updated = await storage.updateListing(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.listings.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getListing(id);
    
    if (!existing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // @ts-ignore
    const userId = req.user.claims.sub;
    // @ts-ignore
    const userEmail = req.user.claims.email;
    
    const isAdmin = userEmail === ADMIN_EMAIL;
    const isOwner = existing.sellerId === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteListing(id);
    res.status(204).send();
  });

  // Leads
  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      
      const listing = await storage.getListing(lead.listingId);
      if (listing) {
        // Send email to Admin as requested: "sends email to vikramsoni76@gmail.com with buyer name/email/phone + full machine/seller details."
        const seller = await storage.getUser(listing.sellerId);
        
        const emailBody = `
          New Interest in Machine: ${listing.title}
          
          Buyer Details:
          Name: ${lead.buyerName}
          Email: ${lead.buyerEmail}
          Phone: ${lead.buyerPhone}
          
          Machine Details:
          Title: ${listing.title}
          Specs: ${listing.heads} Heads, ${listing.needles} Needles, Area: ${listing.area}, Year: ${listing.year}
          Price/Desc: ${listing.description}
          
          Seller ID: ${listing.sellerId}
          ${seller ? `Seller Name: ${seller.firstName} ${seller.lastName}` : ''}
          ${seller ? `Seller Email: ${seller.email}` : ''}
        `;

        await sendEmail(ADMIN_EMAIL, `New Lead for ${listing.title}`, emailBody);
      }

      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.leads.list.path, isAuthenticated, async (req, res) => {
    // @ts-ignore
    const userEmail = req.user.claims.email;
    const isAdmin = userEmail === ADMIN_EMAIL;
    
    if (!isAdmin) {
      // Sellers can only see leads for their listings? 
      // Current requirement only mentions Admin manages leads.
      // But let's allow admin for now.
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    const leads = await storage.getLeads();
    res.json(leads);
  });

  // Seed Data
  if ((await storage.getListings()).length === 0) {
    console.log("Seeding database...");
    const demoSellerId = "demo-seller"; // This won't map to a real user unless one logs in with this ID, but good for display
    
    await storage.createListing({
      title: "Tajima TMAR-K1506C",
      description: "Excellent condition, 2018 model. Includes all hoops and cap driver. Maintained regularly.",
      heads: 6,
      needles: 15,
      area: "450x360",
      year: 2018,
      photos: ["https://images.unsplash.com/photo-1626222880035-7c0506828551?auto=format&fit=crop&q=80&w=800"],
      video: "",
      sellerId: demoSellerId,
      status: "approved"
    });

    await storage.createListing({
      title: "Barudan BEKT-S1501CBII",
      description: "Single head workhorse. 2020 model. Low hours. Great for startups.",
      heads: 1,
      needles: 15,
      area: "330x500",
      year: 2020,
      photos: ["https://images.unsplash.com/photo-1549643503-4696142c6762?auto=format&fit=crop&q=80&w=800"],
      video: "",
      sellerId: demoSellerId,
      status: "approved"
    });
    
    await storage.createListing({
      title: "SWF K-Series 4 Head",
      description: "Good runner, needs minor timing adjustment on head 3. Priced to sell.",
      heads: 4,
      needles: 12,
      area: "400x450",
      year: 2015,
      photos: ["https://images.unsplash.com/photo-1512534591409-516a75f8f844?auto=format&fit=crop&q=80&w=800"],
      video: "",
      sellerId: demoSellerId,
      status: "approved"
    });
  }

  return httpServer;
}
