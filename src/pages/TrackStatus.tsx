import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, MapPin, FileText, AlertCircle } from "lucide-react";
import { findByTrackingNumber, ServiceRequest } from "@/lib/mockData";
import { format } from "date-fns";

const statusColors: Record<ServiceRequest["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-secondary text-secondary-foreground border-border",
};

const statusLabels: Record<ServiceRequest["status"], string> = {
  pending: "Pending Review",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const TrackStatus = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<ServiceRequest | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    const found = findByTrackingNumber(trackingNumber.trim());
    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
    setSearched(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-secondary-foreground mb-3">
            Track Your Request
          </h1>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto">
            Enter your tracking number to check the status of your service request or complaint
          </p>
        </div>
      </section>

      {/* Search Section */}
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., KC12345678)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  className="flex-1 font-mono"
                />
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Track
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && notFound && (
            <Card className="max-w-xl mx-auto border-destructive/50">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Not Found</h3>
                  <p className="text-muted-foreground">
                    No request or complaint found with tracking number "{trackingNumber}". Please check the number and try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="font-mono">{result.trackingNumber}</span>
                      <Badge variant="outline" className="capitalize">
                        {result.type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Submitted on {format(new Date(result.createdAt), "PPP 'at' p")}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[result.status]}>
                    {statusLabels[result.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Timeline */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-4">Status Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                      <div>
                        <p className="font-medium text-foreground">Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(result.createdAt), "PPP 'at' p")}
                        </p>
                      </div>
                    </div>
                    {result.status !== "pending" && (
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${result.status === "in-progress" ? "bg-blue-500" : "bg-primary"}`} />
                        <div>
                          <p className="font-medium text-foreground">Under Review</p>
                          <p className="text-sm text-muted-foreground">Your {result.type} is being processed</p>
                        </div>
                      </div>
                    )}
                    {(result.status === "resolved" || result.status === "closed") && (
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                        <div>
                          <p className="font-medium text-foreground">Resolved</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(result.updatedAt), "PPP")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium text-foreground">{result.category}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{result.ward}, {result.subcounty}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground bg-muted/50 p-3 rounded-lg">{result.description}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {format(new Date(result.updatedAt), "PPP 'at' p")}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Text */}
          {!searched && (
            <div className="text-center text-muted-foreground max-w-md mx-auto">
              <p className="mb-4">
                Your tracking number was provided when you submitted your request or complaint. 
                It starts with "KC" followed by 8 digits.
              </p>
              <p className="text-sm">
                Can't find your tracking number? Contact our support team for assistance.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackStatus;
