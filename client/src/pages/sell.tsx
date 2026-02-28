import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { ListingForm } from "@/components/listing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Redirect, useLocation } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";

export default function SellPage() {
  usePageTitle("Sell Your Machine");
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card data-testid="sell-form-card">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Sell Your Machine</CardTitle>
            <CardDescription>
              Fill in the details below and upload photos of your embroidery machine. Your listing will be reviewed by our team before it goes live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListingForm
              onSuccess={() => {
                setLocation("/dashboard");
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
