import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, authStorage } from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth";
import { hashPassword } from "./replit_integrations/auth/replitAuth";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadedFiles, insertContactMessageSchema } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype.split("/")[1]);
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

async function sendEmail(to: string, subject: string, text: string) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
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

function getUserId(req: any): string {
  return req.user?.claims?.sub || req.user?.id || "";
}

function getUserEmail(req: any): string {
  return req.user?.claims?.email || "";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", (req, res) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.resolve(uploadDir, req.path.replace(/^\//, ""));
    if (!filePath.startsWith(path.resolve(uploadDir))) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const fileId = Number(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, fileId));
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      const buffer = Buffer.from(file.data, "base64");
      res.set("Content-Type", file.mimetype);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.send(buffer);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  app.post("/api/upload", isAuthenticated, upload.array("files", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const urls: string[] = [];
      for (const file of files) {
        const base64Data = file.buffer.toString("base64");
        const [inserted] = await db.insert(uploadedFiles).values({
          filename: file.originalname,
          mimetype: file.mimetype,
          data: base64Data,
        }).returning();
        urls.push(`/api/files/${inserted.id}`);
      }
      res.json({ urls });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

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
      const userId = getUserId(req);
      
      const listing = await storage.createListing({
        ...input,
        sellerId: userId,
      });
      
      const seller = await storage.getUser(userId);
      const sellerName = seller ? `${seller.firstName || ""} ${seller.lastName || ""}`.trim() : "Unknown";
      const sellerEmail = seller?.email || "N/A";
      const sellerMobile = seller?.mobile || "N/A";

      const photosList = listing.photos.map((p, i) => `  Photo ${i + 1}: ${p.startsWith("/") ? `(uploaded file) ${p}` : p}`).join("\n");

      await sendEmail(
        ADMIN_EMAIL,
        "New Listing Pending Approval",
        `A new listing has been posted and is waiting for your approval.\n\nMachine Details:\n  Title: ${listing.title}\n  Description: ${listing.description}\n  Heads: ${listing.heads}\n  Needles: ${listing.needles}\n  Area: ${listing.area}\n  Year: ${listing.year}\n  Video: ${listing.video || "None"}\n\nPhotos:\n${photosList}\n\nSeller Details:\n  Name: ${sellerName}\n  Email: ${sellerEmail}\n  Mobile: ${sellerMobile}\n  Address: ${seller?.address || "N/A"}`
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

      const userId = getUserId(req);
      const userEmail = getUserEmail(req);
      const user = await storage.getUser(userId);
      
      const isAdmin = userEmail === ADMIN_EMAIL || user?.isAdmin === true;
      const isOwner = existing.sellerId === userId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }

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

    const userId = getUserId(req);
    const userEmail = getUserEmail(req);
    const user = await storage.getUser(userId);
    
    const isAdmin = userEmail === ADMIN_EMAIL || user?.isAdmin === true;
    const isOwner = existing.sellerId === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteListing(id);
    res.status(204).send();
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      
      const listing = await storage.getListing(lead.listingId);
      if (listing) {
        const seller = await storage.getUser(listing.sellerId);
        
        const emailBody = `New Interest in Machine: ${listing.title}\n\nBuyer Details:\n  Name: ${lead.buyerName}\n  Email: ${lead.buyerEmail}\n  Phone: ${lead.buyerPhone}\n\nMachine Details:\n  Title: ${listing.title}\n  Specs: ${listing.heads} Heads, ${listing.needles} Needles, Area: ${listing.area}, Year: ${listing.year}\n  Description: ${listing.description}\n\nSeller:\n  ${seller ? `Name: ${seller.firstName} ${seller.lastName}` : `ID: ${listing.sellerId}`}\n  ${seller?.email ? `Email: ${seller.email}` : ""}\n  ${seller?.mobile ? `Mobile: ${seller.mobile}` : ""}`;

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

  app.get(api.leads.list.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const userEmail = getUserEmail(req);
    const user = await storage.getUser(userId);
    const isAdmin = userEmail === ADMIN_EMAIL || user?.isAdmin === true;
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const input = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(input);

      const emailBody = `New Contact Form Submission\n\nFrom: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone || "Not provided"}\nSubject: ${input.subject}\n\nMessage:\n${input.message}`;
      await sendEmail(ADMIN_EMAIL, `Contact: ${input.subject}`, emailBody);

      res.status(201).json(message);
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

  app.get("/api/contact", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const userEmail = getUserEmail(req);
    const user = await storage.getUser(userId);
    const isAdmin = userEmail === ADMIN_EMAIL || user?.isAdmin === true;
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    const messages = await storage.getContactMessages();
    res.json(messages);
  });

  const existingAdmin = await authStorage.getUserByUsername("Admin");
  if (!existingAdmin) {
    const hashedPw = await hashPassword("Antman@1976");
    await authStorage.upsertUser({
      id: "admin-id",
      username: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPw,
      isAdmin: true,
      firstName: "Admin",
      lastName: "User"
    });
  } else if (!existingAdmin.email || (existingAdmin.password && !existingAdmin.password.startsWith("$2"))) {
    const hashedPw = await hashPassword("Antman@1976");
    await authStorage.upsertUser({
      id: existingAdmin.id,
      username: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPw,
      isAdmin: true,
      firstName: existingAdmin.firstName || "Admin",
      lastName: existingAdmin.lastName || "User"
    });
  }

  if ((await storage.getListings()).length === 0) {
    console.log("Seeding database...");
    const demoSellerId = "demo-seller";
    
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

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const listings = await storage.getListings("approved");
      const baseUrl = "https://embmarket.replit.app";
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/browse", priority: "0.9", changefreq: "daily" },
        { url: "/sell", priority: "0.7", changefreq: "monthly" },
        { url: "/contact", priority: "0.5", changefreq: "monthly" },
      ];
      const today = new Date().toISOString().split("T")[0];
      const urls = [
        ...staticPages.map(
          (p) => `
    <url>
      <loc>${baseUrl}${p.url}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`
        ),
        ...listings.map(
          (l) => `
    <url>
      <loc>${baseUrl}/listing/${l.id}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
        ),
      ].join("");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
      res.setHeader("Content-Type", "application/xml");
      res.send(xml);
    } catch {
      res.status(500).send("Error generating sitemap");
    }
  });

  return httpServer;
}
