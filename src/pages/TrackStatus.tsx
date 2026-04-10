import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { complaints as complaintsApi, serviceRequests, TrackingResult, ApiError } from "@/lib/api";

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-review": "bg-orange-100 text-orange-800 border-orange-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-secondary text-secondary-foreground border-border",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  "in-review": "Under Review",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",
};

// ── Component ───────────────────────────────────────────────────────────────

const TrackStatus = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingNumber.trim();
    if (!query) return;

    setIsLoading(true);
    setResult(null);
    setNotFound(false);
    setErrorMessage("");

    try {
      // Try complaints first, then service applications
      if (query.startsWith("CMP")) {
        const res = await complaintsApi.track(query);
        setResult(res.data);
      } else {
        // Service application tracking returns a different shape —
        // adapt it to match TrackingResult for display
        const res = await serviceRequests.track(query);
        const d = res.data as Record<string, unknown>;
        setResult({
          trackingNumber: (d.applicationNumber as string) ?? query,
          status: (d.status as TrackingResult["status"]) ?? "pending",
          title: (d.serviceName as string) ?? "Service Application",
          category: (d.category as string) ?? "",
          description: (d.remarks as string) ?? "",
          location: { ward: "", subcounty: "" },
          submittedAt: (d.submittedAt as string) ?? new Date().toISOString(),
          lastUpdated: (d.lastUpdated as string) ?? new Date().toISOString(),
        });
      }
      setSearched(true);
    } catch (err) {
      setSearched(true);
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Could not reach the server. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const statusColor = result ? STATUS_COLORS[result.status] ?? STATUS_COLORS.pending : "";
  const statusLabel = result ? STATUS_LABELS[result.status] ?? result.status : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-secondary-foreground mb-3">
            Track Your Request
          </h1>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto">
            Enter your tracking number to check the status of your service
            request or complaint
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Search bar */}
          <Card className="max-w-xl mx-auto mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., CMP/2026/123456)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  className="flex-1 font-mono"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error state */}
          {searched && errorMessage && (
            <Card className="max-w-xl mx-auto border-destructive/50">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Error
                  </h3>
                  <p className="text-muted-foreground">{errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not found */}
          {searched && notFound && !errorMessage && (
            <Card className="max-w-xl mx-auto border-destructive/50">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Not Found
                  </h3>
                  <p className="text-muted-foreground">
                    No request found with tracking number &ldquo;{trackingNumber}&rdquo;.
                    Please check the number and try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="font-mono">{result.trackingNumber}</span>
                    </CardTitle>
                    <CardDescription>
                      Submitted on{" "}
                      {format(new Date(result.submittedAt), "PPP 'at' p")}
                    </CardDescription>
                  </div>
                  <Badge className={statusColor}>{statusLabel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timeline */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-4">
                    Status Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                      <div>
                        <p className="font-medium text-foreground">Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(result.submittedAt), "PPP 'at' p")}
                        </p>
                      </div>
                    </div>
                    {result.status !== "pending" && (
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 ${
                            result.status === "resolved"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            Under Review
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Being processed
                            {result.assignedTo
                              ? ` by ${result.assignedTo.department}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    )}
                    {result.status === "resolved" && result.resolvedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                        <div>
                          <p className="font-medium text-foreground">
                            Resolved
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(result.resolvedAt), "PPP")}
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
                      <p className="text-sm text-muted-foreground">
                        Category
                      </p>
                      <p className="font-medium text-foreground">
                        {result.category}
                      </p>
                    </div>
                  </div>
                  {(result.location.ward || result.location.subcounty) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium text-foreground">
                          {[result.location.ward, result.location.subcounty]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {result.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Description
                    </p>
                    <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                      {result.description}
                    </p>
                  </div>
                )}

                {result.feedback && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Feedback from County
                    </p>
                    <p className="text-foreground bg-green-50 border border-green-200 p-3 rounded-lg">
                      {result.feedback}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last updated:{" "}
                    {format(new Date(result.lastUpdated), "PPP 'at' p")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help text */}
          {!searched && !isLoading && (
            <div className="text-center text-muted-foreground max-w-md mx-auto">
              <p className="mb-4">
                Your tracking number was provided when you submitted your
                request or complaint. Complaint numbers start with{" "}
                <strong>CMP/</strong> and application numbers start with{" "}
                <strong>APP/</strong>.
              </p>
              <p className="text-sm">
                Can&rsquo;t find your tracking number? Contact our support team
                for assistance.
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