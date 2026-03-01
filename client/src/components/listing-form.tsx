import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema, type InsertListing, type Listing } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateListing, useUpdateListing } from "@/hooks/use-listings";
import { Loader2, Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertListingSchema.extend({
  heads: z.coerce.number().min(1, "Must have at least 1 head"),
  needles: z.coerce.number().min(1, "Must have at least 1 needle"),
  year: z.coerce.number().min(1980).max(new Date().getFullYear() + 1),
  photos: z.any(),
});

type FormValues = z.infer<typeof formSchema>;

interface ListingFormProps {
  initialData?: Listing;
  onSuccess?: () => void;
}

export function ListingForm({ initialData, onSuccess }: ListingFormProps) {
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();
  const isEditing = !!initialData;
  const { toast } = useToast();

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(initialData?.photos || []);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>(initialData?.video || "");
  const [isUploading, setIsUploading] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      photos: initialData.photos,
    } : {
      title: "",
      description: "",
      heads: 1,
      needles: 9,
      area: "400x450",
      year: new Date().getFullYear(),
      photos: [],
      video: "",
    },
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length + photoPreviews.length > 10) {
      toast({ title: "Maximum 10 photos allowed", variant: "destructive" });
      return;
    }
    setPhotoFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    const existingCount = initialData?.photos?.length || 0;
    if (index < existingCount) {
      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingCount;
      setPhotoFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Video must be under 10MB", variant: "destructive" });
        return;
      }
      setVideoFile(file);
      setVideoPreview(file.name);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to upload files");
    }
    const data = await res.json();
    return data.urls;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsUploading(true);
      let photoUrls: string[] = [];
      const existingPhotos = initialData?.photos || [];
      const keptExisting = photoPreviews.filter((p) => existingPhotos.includes(p));
      
      if (photoFiles.length > 0) {
        const uploadedUrls = await uploadFiles(photoFiles);
        photoUrls = [...keptExisting, ...uploadedUrls];
      } else {
        photoUrls = keptExisting.length > 0 ? keptExisting : photoPreviews.filter((p) => !p.startsWith("data:"));
      }

      if (photoUrls.length === 0) {
        toast({ title: "Please add at least one photo", variant: "destructive" });
        setIsUploading(false);
        return;
      }

      let videoUrl = values.video || "";
      if (videoFile) {
        const uploadedVideoUrls = await uploadFiles([videoFile]);
        videoUrl = uploadedVideoUrls[0] || "";
      }

      const apiValues = {
        ...values,
        photos: photoUrls,
        video: videoUrl,
      };

      if (isEditing && initialData) {
        updateMutation.mutate(
          { id: initialData.id, ...apiValues },
          { onSuccess }
        );
      } else {
        createMutation.mutate(apiValues as any, { onSuccess });
      }
    } catch (err) {
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Machine Title</FormLabel>
              <FormControl>
                <Input data-testid="input-listing-title" placeholder="e.g. 2018 Tajima 6-Head Embroidery Machine" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="heads"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Heads</FormLabel>
                <FormControl>
                  <Input type="number" data-testid="input-listing-heads" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="needles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Needles per Head</FormLabel>
                <FormControl>
                  <Input type="number" data-testid="input-listing-needles" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year of Manufacture</FormLabel>
                <FormControl>
                  <Input type="number" data-testid="input-listing-year" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Embroidery Area (mm)</FormLabel>
                <FormControl>
                  <Input data-testid="input-listing-area" placeholder="e.g. 450x500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea 
                  data-testid="input-listing-description"
                  placeholder="Describe condition, included accessories, maintenance history, price..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Machine Photos *</FormLabel>
          <FormDescription className="mb-3">
            Upload up to 10 photos of your machine. Show front, back, control panel, and any accessories.
          </FormDescription>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg border overflow-hidden group" data-testid={`photo-preview-${index}`}>
                <img
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`button-remove-photo-${index}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photoPreviews.length < 10 && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                data-testid="button-add-photos"
              >
                <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Add Photo</span>
              </button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        <div>
          <FormLabel>Machine Video (Optional)</FormLabel>
          <FormDescription className="mb-3">
            Upload a short video showing the machine running, or paste a YouTube link.
          </FormDescription>
          {videoPreview ? (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30" data-testid="video-preview">
              <Video className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate flex-1">{videoPreview}</span>
              <button
                type="button"
                onClick={removeVideo}
                className="text-red-500 hover:text-red-700"
                data-testid="button-remove-video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => videoInputRef.current?.click()}
                data-testid="button-upload-video"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Video
              </Button>
              <FormField
                control={form.control}
                name="video"
                render={({ field }) => (
                  <Input
                    data-testid="input-listing-video-url"
                    placeholder="Or paste YouTube/video URL"
                    className="flex-1"
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
            </div>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-listing">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Uploading files..." : isEditing ? "Update Listing" : "Submit for Approval"}
        </Button>
      </form>
    </Form>
  );
}
