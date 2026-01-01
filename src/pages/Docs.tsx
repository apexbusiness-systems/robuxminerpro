import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaceholderPage from "./PlaceholderPage";

const Docs = () => {
  return (
    <PlaceholderPage
      title="Documentation"
      description="Browse the core guides for onboarding, security, and product usage."
      primaryAction={{ label: "Go to Help Center", to: "/help" }}
      secondaryAction={{ label: "View Status", to: "/status" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Account setup, onboarding checklist, and first-week milestones for
            new miners.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security &amp; compliance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Authentication flows, account hardening, and platform safety
            guidance.
          </CardContent>
        </Card>
      </div>
    </PlaceholderPage>
  );
};

export default Docs;
