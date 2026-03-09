import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { serviceCategories } from "@/lib/mockData";

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-secondary-foreground mb-4">
            Our Services
          </h1>
          <p className="text-lg text-secondary-foreground/80 max-w-2xl mx-auto">
            Explore all the services provided by Kakamega County Government. Click on any service to submit a request.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-background flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
