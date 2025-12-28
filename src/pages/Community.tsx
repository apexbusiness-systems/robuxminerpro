import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlaceholderPage from "./PlaceholderPage";

const Community = () => {
  return (
    <PlaceholderPage
      title="Community"
      description="Connect with the community, attend sessions, and share best practices."
      primaryAction={{ label: "Browse Events", to: "/events" }}
      secondaryAction={{ label: "Meet the Mentor", to: "/mentor" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Join live walkthroughs led by the mentor team and community
            moderators.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trusted resources</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Official safety tips, earning guidance, and announcements to keep
            miners informed.
          </CardContent>
        </Card>
      </div>
    </PlaceholderPage>
  );
};

export default Community;
