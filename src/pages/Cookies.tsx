import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaceholderPage from "./PlaceholderPage";

const Cookies = () => {
  return (
    <PlaceholderPage
      title="Cookie Policy"
      description="Understand how cookies support performance, security, and analytics."
      primaryAction={{ label: "Read Privacy Policy", to: "/privacy" }}
      secondaryAction={{ label: "Read Terms", to: "/terms" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Essential cookies</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Required for authentication, session persistence, and core platform
            functionality.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytics cookies</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Used to understand usage patterns and improve platform performance.
          </CardContent>
        </Card>
      </div>
    </PlaceholderPage>
  );
};

export default Cookies;
