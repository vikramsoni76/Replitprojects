import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useListings, useDeleteListing, useUpdateListing } from "@/hooks/use-listings";
import { useLeads } from "@/hooks/use-leads";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingForm } from "@/components/listing-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePageTitle } from "@/hooks/use-page-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Redirect } from "wouter";

export default function Dashboard() {
  usePageTitle("Dashboard");
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Redirect to="/auth" />;

  const isAdmin = user?.isAdmin === true || user?.email === "vikramsoni76@gmail.com";
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and view inquiries.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
              </DialogHeader>
              <ListingForm onSuccess={() => document.querySelector('[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="listings">
          <TabsList className="mb-8">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            {isAdmin && <TabsTrigger value="leads">All Leads</TabsTrigger>}
          </TabsList>

          <TabsContent value="listings">
            <ListingsManager sellerId={isAdmin ? undefined : user?.id} isAdmin={isAdmin} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="leads">
              <LeadsViewer />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function ListingsManager({ sellerId, isAdmin }: { sellerId?: string, isAdmin: boolean }) {
  const { data: listings, isLoading } = useListings(sellerId ? { sellerId } : {});
  const deleteMutation = useDeleteListing();
  const updateMutation = useUpdateListing();
  const [editingId, setEditingId] = useState<number | null>(null);

  if (isLoading) return <div>Loading listings...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAdmin ? "All Listings" : "Your Listings"}</CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Manage all marketplace inventory." 
            : "View and edit your machine listings."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings?.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <StatusBadge status={listing.status} />
                </TableCell>
                <TableCell className="font-medium">{listing.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {listing.heads}H / {listing.needles}N / {listing.year}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(listing.createdAt || "").toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {isAdmin && listing.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Approve"
                        data-testid={`button-approve-${listing.id}`}
                        onClick={() => updateMutation.mutate({ id: listing.id, status: "approved" })}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Reject"
                        data-testid={`button-reject-${listing.id}`}
                        onClick={() => updateMutation.mutate({ id: listing.id, status: "rejected" })}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <Dialog open={editingId === listing.id} onOpenChange={(open) => !open && setEditingId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Edit" data-testid={`button-edit-${listing.id}`} onClick={() => setEditingId(listing.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Listing</DialogTitle>
                      </DialogHeader>
                      <ListingForm 
                        initialData={listing} 
                        onSuccess={() => setEditingId(null)} 
                      />
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                    data-testid={`button-delete-${listing.id}`}
                    onClick={() => {
                      if(confirm("Are you sure you want to delete this listing?")) {
                        deleteMutation.mutate(listing.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {listings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No listings found. Create one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LeadsViewer() {
  const { data: leads, isLoading } = useLeads();

  if (isLoading) return <div>Loading leads...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inquiries & Leads</CardTitle>
        <CardDescription>Potential buyers interested in listings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Interested In (ID)</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.buyerName}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{lead.buyerEmail}</span>
                    <span className="text-muted-foreground">{lead.buyerPhone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <a href={`/listing/${lead.listingId}`} className="text-primary hover:underline">
                    Listing #{lead.listingId}
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(lead.createdAt || "").toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    sold: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
      {status.toUpperCase()}
    </span>
  );
}
