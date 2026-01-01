import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
  children?: ReactNode;
  primaryAction?: {
    label: string;
    to: string;
  };
  secondaryAction?: {
    label: string;
    to: string;
  };
}

const PlaceholderPage = ({
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
}: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              RobuxMinerPro
            </p>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="mt-3 text-muted-foreground">{description}</p>
          </div>

          {children}

          <div className="flex flex-wrap gap-3">
            {primaryAction && (
              <Button asChild>
                <Link to={primaryAction.to}>{primaryAction.label}</Link>
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" asChild>
                <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
