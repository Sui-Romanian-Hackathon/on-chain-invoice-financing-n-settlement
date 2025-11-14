import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, DollarSign, Clock, TrendingUp, Plus } from "lucide-react";


type CardProps = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string | number;
  description: string;
  highlight?: boolean;
};

const cards: Record<string, CardProps> = {
  totalInvoices: {
    title: "Total Invoices",
    icon: FileText,
    value: 24,
    description: "8 active, 16 settled",
  },
  totalFinanced: {
    title: "Total Financed",
    icon: DollarSign,
    value: "$450K",
    description: "Lifetime value",
  },
  pendingAmount: {
    title: "Pending Amount",
    icon: Clock,
    value: "$125K",
    description: "8 active invoices",
  },
  avgDiscount: {
    title: "Avg. Discount",
    icon: TrendingUp,
    value: "4.2%",
    description: "Better than average",
    highlight: true,
  },
};

const StatsOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {Object.values(cards).map(
        ({ title, icon: Icon, value, description, highlight }) => (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {title}
              </CardDescription>
              <CardTitle
                className={`text-3xl ${highlight ? "text-primary" : ""}`}
              >
                {value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default StatsOverview;
