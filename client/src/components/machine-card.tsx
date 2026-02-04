import { Link } from "wouter";
import { type Listing } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Gauge, Calendar, Grid3X3 } from "lucide-react";

interface MachineCardProps {
  listing: Listing;
}

export function MachineCard({ listing }: MachineCardProps) {
  // Use first photo or placeholder
  const mainPhoto = listing.photos && listing.photos.length > 0 
    ? listing.photos[0] 
    : "https://images.unsplash.com/photo-1620288627223-537a2d246215?q=80&w=600&auto=format&fit=crop"; 
    // ^ Industrial machine placeholder

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img 
          src={mainPhoto} 
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          {listing.status === 'sold' && (
            <Badge variant="destructive" className="font-bold">SOLD</Badge>
          )}
          {listing.status === 'approved' && (
            <Badge className="bg-primary/90 hover:bg-primary">AVAILABLE</Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-display text-lg font-bold leading-tight line-clamp-2 min-h-[3rem]">
            {listing.title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
          Machine ID: #{listing.id.toString().padStart(4, '0')}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-2 flex-grow">
        <div className="grid grid-cols-2 gap-3 text-sm mt-2">
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{listing.heads} Heads</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
            <Grid3X3 className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{listing.needles} Needles</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{listing.year}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md truncate">
             <span className="font-medium text-foreground truncate">{listing.area}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link href={`/listing/${listing.id}`} className="w-full">
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Details
            <Eye className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
