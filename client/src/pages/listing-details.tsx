import { Navbar } from "@/components/navbar";
import { useListing } from "@/hooks/use-listings";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateLead } from "@/hooks/use-leads";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import { Check, Mail, Phone, User, Calendar, Gauge, Grid3X3, Maximize } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const leadFormSchema = insertLeadSchema.extend({
  buyerPhone: z.string().min(10, "Valid phone number required"),
});

export default function ListingDetails() {
  const [, params] = useRoute("/listing/:id");
  const listingId = params ? parseInt(params.id) : 0;
  const { data: listing, isLoading } = useListing(listingId);
  const createLeadMutation = useCreateLead();
  const [open, setOpen] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      listingId,
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
    }
  });

  const onSubmitLead = (data: any) => {
    createLeadMutation.mutate({ ...data, listingId }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  if (isLoading) return <DetailsSkeleton />;
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Listing not found</div>;

  const mainPhoto = listing.photos?.[0] || "https://images.unsplash.com/photo-1620288627223-537a2d246215?q=80&w=600";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Images */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border shadow-sm bg-muted">
              <img src={mainPhoto} alt={listing.title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {listing.photos?.map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border cursor-pointer hover:ring-2 ring-primary">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Details */}
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-display font-bold leading-tight">{listing.title}</h1>
              {listing.status === 'sold' && <Badge variant="destructive" className="text-sm">SOLD</Badge>}
            </div>

            <p className="text-muted-foreground mt-2 text-lg">
              Listing #{listing.id}
            </p>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-4 mb-8">
              <SpecItem icon={<Gauge />} label="Heads" value={listing.heads} />
              <SpecItem icon={<Grid3X3 />} label="Needles" value={listing.needles} />
              <SpecItem icon={<Calendar />} label="Year" value={listing.year} />
              <SpecItem icon={<Maximize />} label="Area" value={listing.area} />
            </div>

            <div className="bg-muted/30 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full text-lg h-14" disabled={listing.status === 'sold'}>
                  {listing.status === 'sold' ? "Currently Unavailable" : "I'm Interested"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Contact Seller</DialogTitle>
                  <DialogDescription>
                    Fill out this form and we'll connect you directly with the seller of this machine.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmitLead)} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" {...form.register("buyerName")} placeholder="John Doe" />
                    </div>
                    {form.formState.errors.buyerName && <p className="text-red-500 text-xs">{form.formState.errors.buyerName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" {...form.register("buyerEmail")} placeholder="john@company.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" {...form.register("buyerPhone")} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={createLeadMutation.isPending}>
                      {createLeadMutation.isPending ? "Sending..." : "Send Request"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              Your contact details will be sent securely to the platform admin for verification before connecting you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <div className="grid grid-cols-2 gap-4 my-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
