import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { serviceCategories, subcounties, wards } from "@/lib/mockData";
import { complaints as complaintsApi, ApiError } from "@/lib/api";

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  phoneNumber: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15),
  email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Please select a category"),
  subcounty: z.string().min(1, "Please select a sub-county"),
  ward: z.string().min(1, "Please select a ward"),
  location: z
    .string()
    .min(5, "Please provide a specific location")
    .max(200),
  description: z
    .string()
    .min(20, "Please provide more details (at least 20 characters)")
    .max(1000),
});

type FormData = z.infer<typeof formSchema>;

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedSubcounty, setSelectedSubcounty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      category: "",
      subcounty: "",
      ward: "",
      location: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await complaintsApi.submit({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        // Backend expects a 'title' field — derive one from category
        title: `${data.category} Complaint`,
        category: data.category,
        description: data.description,
        location: {
          ward: data.ward,
          subcounty: data.subcounty,
          specificLocation: data.location,
        },
      });

      setTrackingNumber(response.data.trackingNumber);
      setSubmitted(true);
      toast.success("Complaint submitted successfully!");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubcountyChange = (value: string) => {
    setSelectedSubcounty(value);
    form.setValue("subcounty", value);
    form.setValue("ward", "");
  };

  // ── Success screen ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16 bg-background">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto text-center">
              <CardHeader>
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-foreground">
                  Complaint Filed!
                </CardTitle>
                <CardDescription>
                  Your complaint has been received and logged
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-accent p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Your Tracking Number
                  </p>
                  <p className="text-2xl font-mono font-bold text-primary">
                    {trackingNumber}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save this tracking number to monitor the status of your
                  complaint. Our team will investigate and take appropriate
                  action.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate("/track")}>
                    Track Complaint
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      form.reset();
                    }}
                  >
                    Submit Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-secondary-foreground mb-3">
            File a Complaint
          </h1>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto">
            Help us improve our services by reporting issues, poor service
            delivery, or any concerns you may have.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
              <CardDescription>
                Please provide detailed information about your complaint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="0700 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complaint Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complaint category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceCategories.map((service) => (
                              <SelectItem
                                key={service.id}
                                value={service.category}
                              >
                                {service.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subcounty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub-County *</FormLabel>
                          <Select
                            onValueChange={handleSubcountyChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub-county" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subcounties.map((sc) => (
                                <SelectItem key={sc} value={sc}>
                                  {sc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ward *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedSubcounty}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ward" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedSubcounty &&
                                wards[
                                  selectedSubcounty as keyof typeof wards
                                ]?.map((ward) => (
                                  <SelectItem key={ward} value={ward}>
                                    {ward}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Location *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Kakamega District Hospital, Main Gate"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complaint Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your complaint in detail. Include dates, names if applicable, and what resolution you expect..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitComplaint;