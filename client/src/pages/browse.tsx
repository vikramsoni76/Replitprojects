import { Navbar } from "@/components/navbar";
import { useListings } from "@/hooks/use-listings";
import { MachineCard } from "@/components/machine-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, FilterX } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/use-page-title";

export default function Browse() {
  usePageTitle("Browse Used Embroidery Machines");
  const { data: listings, isLoading } = useListings({ status: 'approved' });
  const [searchTerm, setSearchTerm] = useState("");
  const [headFilter, setHeadFilter] = useState("all");

  // Client-side filtering for simplicity in this version
  const filteredListings = listings?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHeads = headFilter === "all" || item.heads.toString() === headFilter;
    
    return matchesSearch && matchesHeads;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Browse Inventory</h1>
            <p className="text-muted-foreground">Find the perfect machine for your production needs</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search machines..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={headFilter} onValueChange={setHeadFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by Heads" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Heads</SelectItem>
                <SelectItem value="1">1 Head</SelectItem>
                <SelectItem value="2">2 Heads</SelectItem>
                <SelectItem value="4">4 Heads</SelectItem>
                <SelectItem value="6">6 Heads</SelectItem>
                <SelectItem value="8">8 Heads</SelectItem>
                <SelectItem value="12">12 Heads</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || headFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setSearchTerm(""); setHeadFilter("all"); }}
                title="Clear filters"
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings?.map((listing) => (
              <MachineCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {!isLoading && filteredListings?.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-muted-foreground">No machines found matching your filters.</h3>
            <Button 
              variant="link" 
              onClick={() => { setSearchTerm(""); setHeadFilter("all"); }}
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
