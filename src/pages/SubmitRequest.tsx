import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, CheckCircle } from "lucide-react";
import { serviceCategories, subcounties, wards, addSubmission } from "@/lib/mockData";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phoneNumber: z.string().min(10, "Enter a valid phone number").max(15),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  category: z.string().min(1, "Please select a category"),
  subcounty: z.string().min(1, "Please select a sub-county"),
  ward: z.string().min(1, "Please select a ward"),
  location: z.string().min(5, "Please provide a specific location").max(200),
  description: z.string().min(20, "Please provide more details (at least 20 characters)").max(1000),
});

type FormData = z.infer<typeof formSchema>;

const SubmitRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedSubcounty, setSelectedSubcounty] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      category: searchParams.get("category") || "",
      subcounty: "",
      ward: "",
      location: "",
      description: "",
    },
  });

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      form.setValue("category", category);
    }
  }, [searchParams, form]);

  const onSubmit = (data: FormData) => {
    const submission = addSubmission({
      category: data.category,
      subcounty: data.subcounty,
      ward: data.ward,
      location: data.location,
      description: data.description,
      type: "request",
    });

    setTrackingNumber(submission.trackingNumber);
    setSubmitted(true);
    toast.success("Service request submitted successfully!");
  };

  const handleSubcountyChange = (value: string) => {
    setSelectedSubcounty(value);
    form.setValue("subcounty", value);
    form.setValue("ward", "");
  };

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
                <CardTitle className="text-2xl text-foreground">Request Submitted!</CardTitle>
                <CardDescription>Your service request has been received</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-accent p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Your Tracking Number</p>
                  <p className="text-2xl font-mono font-bold text-primary">{trackingNumber}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save this tracking number to monitor the status of your request. You can track it anytime using our tracking page.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate("/track")}>Track Request</Button>
                  <Button variant="outline" onClick={() => { setSubmitted(false); form.reset(); }}>
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-secondary-foreground mb-3">
            Submit Service Request
          </h1>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto">
            Fill out the form below to request a county service. We'll process your request and keep you updated.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Please provide accurate information to help us serve you better</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Service Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceCategories.map((service) => (
                              <SelectItem key={service.id} value={service.category}>
                                {service.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subcounty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub-County *</FormLabel>
                          <Select onValueChange={handleSubcountyChange} value={field.value}>
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
                                wards[selectedSubcounty as keyof typeof wards]?.map((ward) => (
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
                          <Input placeholder="e.g., Near Kakamega Primary School, along Kisumu Road" {...field} />
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
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your service request in detail..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full">
                    Submit Request
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

export default SubmitRequest;
