import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
}

const ServiceCard = ({ title, description, icon: Icon, category }: ServiceCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
          <Icon className="h-6 w-6 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
        </div>
        <CardTitle className="text-lg font-semibold text-card-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link to={`/submit-request?category=${encodeURIComponent(category)}`}>
          <Button variant="ghost" size="sm" className="group/btn p-0 h-auto text-primary hover:text-primary/80">
            Request Service
            <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
