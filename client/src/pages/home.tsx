import { Navbar } from "@/components/navbar";
import { useListings } from "@/hooks/use-listings";
import { MachineCard } from "@/components/machine-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Factory, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: listings, isLoading } = useListings({ status: 'approved' });

  // Filter for featured (just take first 3 for now)
  const featuredListings = listings?.slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 z-0">
          {/* Industrial background image from Unsplash */}
          <img 
            src="https://pixabay.com/get/g74f030deabb9f7caa5b80da4815afeb7d62df5f831481cf6a78dcb7715f1c92d76c865ffd892bde226fae0642cc581656047b83825aa970ce67fa841f0462d67_1280.jpg" 
            alt="Embroidery Factory" 
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-display font-bold tracking-tight text-white sm:text-6xl"
            >
              Premium Used <span className="text-primary">Embroidery</span> Machinery
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg leading-8 text-slate-300"
            >
              Buy and sell top-quality commercial embroidery machines. 
              Verified listings, transparent specs, and direct connections to sellers.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex items-center gap-x-6"
            >
              <Link href="/browse">
                <Button size="lg" className="text-lg px-8 h-14">
                  Browse Inventory
                </Button>
              </Link>
              <Link href="/auth" className="text-sm font-semibold leading-6 text-white hover:text-primary transition-colors">
                Sell Your Machine <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="bg-slate-50 border-y py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Verified Sellers</h3>
                <p className="text-sm text-muted-foreground">Quality assurance checks</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Factory className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Major Brands</h3>
                <p className="text-sm text-muted-foreground">Tajima, Barudan, Brother & more</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Best Prices</h3>
                <p className="text-sm text-muted-foreground">Direct seller-to-buyer deals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Machinery</h2>
              <p className="text-muted-foreground mt-2">Recently added top-tier equipment</p>
            </div>
            <Link href="/browse">
              <Button variant="ghost" className="hidden sm:flex">
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
              <Button className="w-full">View All Inventory</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
