import { Navbar } from "@/components/navbar";
import { useListings } from "@/hooks/use-listings";
import { MachineCard } from "@/components/machine-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Users,
  Search,
  PhoneCall,
  Handshake,
  ClipboardList,
  Camera,
  BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/use-page-title";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const BRANDS = ["Tajima", "Barudan", "SWF", "Brother", "ZSK", "Happy", "High Quality Chinese Machines"];

const STATS = [
  { value: "500+", label: "Machines Listed" },
  { value: "1,200+", label: "Happy Buyers" },
  { value: "15+", label: "States Covered" },
  { value: "₹0", label: "Commission Charged" },
];

const BUYER_STEPS = [
  {
    icon: Search,
    step: "1",
    title: "Browse Verified Listings",
    desc: "Filter by brand, heads, price, and location. Every listing includes full specs and photos.",
  },
  {
    icon: PhoneCall,
    step: "2",
    title: "Connect Directly with Sellers",
    desc: "No middleman. Contact sellers directly to ask questions and negotiate.",
  },
  {
    icon: Handshake,
    step: "3",
    title: "Close the Deal",
    desc: "Inspect the machine, agree on terms, and close at your own pace.",
  },
];

const SELLER_STEPS = [
  {
    icon: ClipboardList,
    step: "1",
    title: "Create Your Listing",
    desc: "Fill in machine details — model, year, heads, working area, and asking price.",
  },
  {
    icon: Camera,
    step: "2",
    title: "Add Photos & Video",
    desc: "Upload clear photos and an optional video to attract serious buyers faster.",
  },
  {
    icon: BadgeCheck,
    step: "3",
    title: "Get Verified & Go Live",
    desc: "We review and approve your listing. Buyers start reaching out immediately.",
  },
];

const WHY_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Listings Only",
    desc: "Every listing is reviewed by our team before going live — no spam, no fake machines.",
  },
  {
    icon: CheckCircle2,
    title: "Zero Commission",
    desc: "We charge nothing on the sale. What you negotiate is what you keep.",
  },
  {
    icon: Zap,
    title: "Fast & Direct",
    desc: "Buyers connect directly with sellers — no agents, no delays, no hidden steps.",
  },
  {
    icon: Users,
    title: "India-Focused Community",
    desc: "Built specifically for the Indian embroidery industry — local pricing, local context.",
  },
];

export default function Home() {
  usePageTitle();
  const { data: listings, isLoading } = useListings({ status: "approved" });
  const featuredListings = listings?.slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EmbMarket",
    url: "https://embmarket.replit.app",
    description: "India's trusted marketplace for used embroidery machines",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://embmarket.replit.app/browse?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 py-28 sm:py-36">
        <div className="absolute inset-0 z-0">
          <img
            src="https://pixabay.com/get/g74f030deabb9f7caa5b80da4815afeb7d62df5f831481cf6a78dcb7715f1c92d76c865ffd892bde226fae0642cc581656047b83825aa970ce67fa841f0462d67_1280.jpg"
            alt="Embroidery Factory"
            className="h-full w-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/85 to-slate-900/40" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                India's Trusted Embroidery Machine Marketplace
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.1)}
              className="text-4xl font-display font-bold tracking-tight text-white sm:text-6xl leading-tight"
            >
              Buy & Sell Premium{" "}
              <span className="text-primary">Used Embroidery</span> Machines
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="mt-6 text-lg leading-8 text-slate-300 max-w-xl"
            >
              Connect directly with verified sellers across India. No commission,
              no middleman — just transparent deals on industrial embroidery equipment.
            </motion.p>

            <motion.div
              {...fadeUp(0.3)}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link href="/browse">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 shadow-lg shadow-primary/25"
                  data-testid="button-hero-browse"
                >
                  Browse Inventory <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-12 border-white/20 text-white hover:bg-white/10 hover:text-white"
                  data-testid="button-hero-sell"
                >
                  List Your Machine
                </Button>
              </Link>
            </motion.div>

            {/* Inline Stats */}
            <motion.div
              {...fadeUp(0.4)}
              className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-display font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Brands Strip ─────────────────────────────────── */}
      <section className="bg-slate-800 border-y border-slate-700 py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest shrink-0">
              Brands Available
            </p>
            {BRANDS.map((brand) => (
              <span
                key={brand}
                className="text-slate-300 font-display font-semibold text-sm tracking-wide"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why EmbMarket ────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-display font-bold">Why EmbMarket?</h2>
            <p className="text-muted-foreground mt-3">
              We built the marketplace we always wished existed for the Indian embroidery industry.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-y">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Machinery</h2>
              <p className="text-muted-foreground mt-2">Recently added top-tier equipment</p>
            </div>
            <Link href="/browse">
              <Button variant="ghost" className="hidden sm:flex" data-testid="link-view-all">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredListings?.map((listing) => (
                <MachineCard key={listing.id} listing={listing} />
              ))}
              {(!featuredListings || featuredListings.length === 0) && (
                <div className="col-span-3 text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                  <p className="text-muted-foreground text-lg">No listings available at the moment.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 sm:hidden">
            <Link href="/browse">
              <Button className="w-full" data-testid="button-view-all-mobile">
                View All Inventory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-display font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-3">
              Simple steps whether you're buying or selling.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Buyers */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                  For Buyers
                </span>
              </div>
              <div className="space-y-6">
                {BUYER_STEPS.map(({ icon: Icon, step, title, desc }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < BUYER_STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-2 mb-0" style={{ minHeight: 24 }} />
                      )}
                    </div>
                    <div className="pb-6">
                      <h3 className="font-semibold text-base">{title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link href="/browse">
                <Button className="mt-2" data-testid="button-how-browse">
                  Start Browsing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Sellers */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  For Sellers
                </span>
              </div>
              <div className="space-y-6">
                {SELLER_STEPS.map(({ icon: Icon, step, title, desc }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < SELLER_STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: 24 }} />
                      )}
                    </div>
                    <div className="pb-6">
                      <h3 className="font-semibold text-base">{title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link href="/sell">
                <Button variant="outline" className="mt-2" data-testid="button-how-sell">
                  List Your Machine <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Split CTA ────────────────────────────────────── */}
      <section className="py-0 border-t">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Buyer CTA */}
          <div className="bg-primary px-8 py-16 flex flex-col items-start justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-3">
              Looking to Buy?
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-snug max-w-sm">
              Find your next machine from verified sellers across India.
            </h2>
            <p className="text-primary-foreground/80 mt-3 text-sm max-w-xs leading-relaxed">
              Browse 500+ listings with full specs, photos, and direct seller contact.
            </p>
            <Link href="/browse" className="mt-6">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                data-testid="button-cta-browse"
              >
                Browse Inventory <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Seller CTA */}
          <div className="bg-slate-900 px-8 py-16 flex flex-col items-start justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Looking to Sell?
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-snug max-w-sm">
              Reach thousands of serious buyers with zero commission.
            </h2>
            <p className="text-slate-400 mt-3 text-sm max-w-xs leading-relaxed">
              List your machine in minutes. Get verified, go live, and start receiving inquiries.
            </p>
            <Link href="/sell" className="mt-6">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                data-testid="button-cta-sell"
              >
                List Your Machine <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer Contact ────────────────────────────────── */}
      <section className="bg-slate-50 border-t py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-xl font-display font-bold">Have Questions or Feedback?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We're here to help — whether you're buying, selling, or just exploring.
            </p>
            <Link href="/contact">
              <Button
                variant="outline"
                className="mt-5"
                data-testid="button-home-contact"
              >
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
