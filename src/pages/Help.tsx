import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaceholderPage from "./PlaceholderPage";

const Help = () => {
  return (
    <PlaceholderPage
      title="Help Center"
      description="Get fast answers, troubleshooting tips, and escalation paths."
      primaryAction={{ label: "Contact Support", to: "/contact" }}
      secondaryAction={{ label: "Review Status", to: "/status" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Common issues</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Login recovery, payout timing, and verification guidance curated by
            the support team.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incident updates</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            View ongoing incidents, postmortems, and maintenance windows from
            the status page.
          </CardContent>
        </Card>
      </div>
    </PlaceholderPage>
  );
};

export default Help;
