import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useListings, useUpdateListing } from "@/hooks/use-listings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Redirect } from "wouter";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Redirect to="/auth" />;
  
  // Basic check - real app would use backend role
  if (user?.email !== "vikramsoni76@gmail.com") {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p>You must be an administrator to view this page.</p>
        <Button onClick={() => window.location.href = "/"}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Admin Console</h1>
        <PendingListings />
      </div>
    </div>
  );
}

function PendingListings() {
  const { data: listings, isLoading } = useListings({ status: 'pending' });
  const updateMutation = useUpdateListing();

  const handleApprove = (id: number) => {
    updateMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: number) => {
    updateMutation.mutate({ id, status: 'rejected' });
  };

  if (isLoading) return <div>Loading pending listings...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Review new listings before they go live.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Specs</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings?.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <div className="font-medium">{listing.title}</div>
                  <div className="text-xs text-muted-foreground truncate w-64">{listing.description}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {listing.heads}H / {listing.needles}N<br />
                  {listing.year}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  User #{listing.sellerId.substring(0, 8)}...
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleApprove(listing.id)}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(listing.id)}
                    disabled={updateMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {listings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No pending listings to review.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
