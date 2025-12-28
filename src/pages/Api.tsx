import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaceholderPage from "./PlaceholderPage";

const Api = () => {
  return (
    <PlaceholderPage
      title="API Documentation"
      description="Integrate securely with RobuxMinerPro data and workflows."
      primaryAction={{ label: "Request Access", to: "/contact" }}
      secondaryAction={{ label: "Read Docs", to: "/docs" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use OAuth and scoped API keys to access mining data and user
            insights.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rate limits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Production limits are tuned per plan with burst protection to keep
            traffic stable.
          </CardContent>
        </Card>
      </div>
    </PlaceholderPage>
  );
};

export default Api;
