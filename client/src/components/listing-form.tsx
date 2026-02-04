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
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Extend schema for form validation
const formSchema = insertListingSchema.extend({
  heads: z.coerce.number().min(1, "Must have at least 1 head"),
  needles: z.coerce.number().min(1, "Must have at least 1 needle"),
  year: z.coerce.number().min(1980).max(new Date().getFullYear() + 1),
  photos: z.string().transform((str) => str.split(',').map(s => s.trim()).filter(Boolean)), // Simple comma separation for MVP
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      photos: initialData.photos.join(', '), // Join back to string for input
    } : {
      title: "",
      description: "",
      heads: 1,
      needles: 9,
      area: "400x450",
      year: new Date().getFullYear(),
      photos: "", // Changed from array to string for input handling
      video: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    // Transform photos string array to actual array for API
    const apiValues = {
      ...values,
      photos: Array.isArray(values.photos) ? values.photos : [values.photos],
    };

    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, ...apiValues },
        { onSuccess }
      );
    } else {
      createMutation.mutate(apiValues as any, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2018 Tajima 6-Head Embroidery Machine" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input placeholder="e.g. 450x500" {...field} />
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
                  placeholder="Describe condition, included accessories, maintenance history..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo URLs (Comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="http://example.com/img1.jpg, http://example.com/img2.jpg" {...field} />
              </FormControl>
              <FormDescription>
                For MVP, please paste direct image links separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="video"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Listing" : "Create Listing"}
        </Button>
      </form>
    </Form>
  );
}
