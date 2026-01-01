import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaceholderPage from "./PlaceholderPage";

const Contact = () => {
  return (
    <PlaceholderPage
      title="Contact"
      description="Reach our support team for account, billing, or platform questions."
      primaryAction={{ label: "View Status", to: "/status" }}
      secondaryAction={{ label: "Return Home", to: "/" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Support hours</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Monday–Friday · 9:00–18:00 UTC. Critical incidents are monitored
            24/7.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response targets</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Standard: 1 business day · Priority: 4 hours · Critical: 60 minutes.
          </CardContent>
        </Card>
      </div>
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Include your account email, region, and a concise description of the
        impact to help us triage quickly.
      </div>
    </PlaceholderPage>
  );
};

export default Contact;
