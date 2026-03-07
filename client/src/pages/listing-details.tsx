import { Navbar } from "@/components/navbar";
import { useListing } from "@/hooks/use-listings";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateLead } from "@/hooks/use-leads";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import { Check, Mail, Phone, User, Calendar, Gauge, Grid3X3, Maximize, Share2, Copy, ExternalLink, Play, X } from "lucide-react";
import { SiWhatsapp, SiFacebook, SiTelegram } from "react-icons/si";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const leadFormSchema = insertLeadSchema.extend({
  buyerPhone: z.string().min(10, "Valid phone number required"),
});

export default function ListingDetails() {
  const [, params] = useRoute("/listing/:id");
  const listingId = params ? parseInt(params.id) : 0;
  const { data: listing, isLoading } = useListing(listingId);
  usePageTitle(listing ? `${listing.title} - Used Embroidery Machine` : "Machine Details");
  const createLeadMutation = useCreateLead();
  const [open, setOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      listingId,
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
    }
  });

  const videoUrl = listing?.video || "";
  const hasVideo = videoUrl.length > 0;

  const videoEmbedUrl = useMemo(() => {
    if (!videoUrl) return "";
    const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    return videoUrl;
  }, [videoUrl]);

  const isYouTube = /youtube\.com|youtu\.be/.test(videoUrl);
  const youtubeThumb = useMemo(() => {
    const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg` : "";
  }, [videoUrl]);

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

  const photos = listing.photos?.length ? listing.photos : ["https://images.unsplash.com/photo-1620288627223-537a2d246215?q=80&w=600"];
  const mainPhoto = photos[selectedPhotoIndex] || photos[0];

  const listingUrl = `${window.location.origin}/listing/${listing.id}`;
  const shareText = `Check out this ${listing.title} - ${listing.heads} head, ${listing.needles} needle embroidery machine (${listing.year}) on EmbMarket!`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(listingUrl);
    const encodedText = encodeURIComponent(shareText);

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(listingUrl).then(() => {
        toast({ title: "Link copied!", description: "Listing link has been copied to your clipboard." });
      });
      return;
    }

    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border shadow-sm bg-muted relative">
              {showVideo ? (
                <>
                  {isYouTube ? (
                    <iframe
                      src={videoEmbedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      data-testid="video-player"
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      className="w-full h-full object-contain bg-black"
                      controls
                      autoPlay
                      data-testid="video-player"
                    />
                  )}
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-3 right-3 bg-black/70 text-white rounded-full p-2 hover:bg-black/90 transition-colors z-10"
                    data-testid="button-close-video"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <img
                  src={mainPhoto}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-all duration-300"
                  data-testid="img-main-photo"
                />
              )}
            </div>
            {(photos.length > 1 || hasVideo) && (
              <div className="grid grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 hover:opacity-90 ${
                      !showVideo && i === selectedPhotoIndex
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => { setSelectedPhotoIndex(i); setShowVideo(false); }}
                    data-testid={`thumbnail-photo-${i}`}
                  >
                    <img src={photo} alt={`${listing.title} photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {hasVideo && (
                  <div
                    className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 hover:opacity-90 relative ${
                      showVideo
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setShowVideo(true)}
                    data-testid="thumbnail-video"
                  >
                    {youtubeThumb ? (
                      <img src={youtubeThumb} alt="Video thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-2">
                        <Play className="h-6 w-6 text-slate-900 fill-slate-900" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl font-display font-bold leading-tight" data-testid="text-listing-title">{listing.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                {listing.status === 'sold' && <Badge variant="destructive" className="text-sm">SOLD</Badge>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" data-testid="button-share">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-background border shadow-lg" align="end">
                    <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="cursor-pointer" data-testid="share-whatsapp">
                      <SiWhatsapp className="mr-2 h-4 w-4 text-green-500" />
                      <span>WhatsApp</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer" data-testid="share-facebook">
                      <SiFacebook className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Facebook</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("telegram")} className="cursor-pointer" data-testid="share-telegram">
                      <SiTelegram className="mr-2 h-4 w-4 text-sky-500" />
                      <span>Telegram</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer" data-testid="share-copy-link">
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                <Button size="lg" className="w-full text-lg h-14" disabled={listing.status === 'sold'} data-testid="button-interested">
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
                      <Input className="pl-9" {...form.register("buyerName")} placeholder="John Doe" data-testid="input-buyer-name" />
                    </div>
                    {form.formState.errors.buyerName && <p className="text-red-500 text-xs">{form.formState.errors.buyerName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" {...form.register("buyerEmail")} placeholder="john@company.com" data-testid="input-buyer-email" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" {...form.register("buyerPhone")} placeholder="+91 98765 43210" data-testid="input-buyer-phone" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={createLeadMutation.isPending} data-testid="button-send-request">
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
