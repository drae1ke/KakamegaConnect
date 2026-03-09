import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  value: string;
  label: string;
  icon: LucideIcon;
}

const StatsCard = ({ value, label, icon: Icon }: StatsCardProps) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-center">
      <div className="w-12 h-12 rounded-full bg-accent mx-auto mb-3 flex items-center justify-center">
        <Icon className="h-6 w-6 text-accent-foreground" />
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

export default StatsCard;
