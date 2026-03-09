import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, MessageSquare, Search, CheckCircle, Users, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import StatsCard from "@/components/StatsCard";
import { serviceCategories } from "@/lib/mockData";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 to-secondary/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-secondary-foreground mb-6 leading-tight">
              Kakamega County Service Portal
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground/90 mb-8">
              Your gateway to county services. Submit requests, file complaints, and track their status - all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/submit-request">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <FileText className="mr-2 h-5 w-5" />
                  Submit Request
                </Button>
              </Link>
              <Link to="/submit-complaint">
                <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  File Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-accent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatsCard value="2,500+" label="Requests Resolved" icon={CheckCircle} />
            <StatsCard value="12" label="Sub-Counties" icon={Users} />
            <StatsCard value="8" label="Service Categories" icon={FileText} />
            <StatsCard value="24hrs" label="Average Response" icon={Clock} />
          </div>
        </div>
      </section>

      {/* Track Status CTA */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="bg-primary/10 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Track Your Request</h3>
                <p className="text-muted-foreground">Enter your tracking number to check the status of your request or complaint</p>
              </div>
            </div>
            <Link to="/track">
              <Button className="whitespace-nowrap">
                Track Status
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the various county services available to you and submit requests directly through our portal
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to get your service request or complaint addressed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Choose Service", desc: "Select the service category that matches your need" },
              { step: "2", title: "Fill Details", desc: "Provide location and describe your request" },
              { step: "3", title: "Get Tracking ID", desc: "Receive a unique tracking number for your request" },
              { step: "4", title: "Track Progress", desc: "Monitor the status until resolution" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
