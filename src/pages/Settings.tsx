import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Settings = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Manage security, notifications, and account preferences.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base font-medium">{user?.email ?? "Unavailable"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={profile?.email_verified ? "secondary" : "outline"}>
                    {profile?.email_verified ? "Email verified" : "Email unverified"}
                  </Badge>
                  <Badge variant={profile?.two_factor_enabled ? "secondary" : "outline"}>
                    {profile?.two_factor_enabled ? "2FA enabled" : "2FA disabled"}
                  </Badge>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  For security changes like password updates or enabling 2FA,
                  visit the security center in the support hub.
                </div>
                <Button variant="outline" asChild>
                  <Link to="/help">Go to security help</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={profile?.notification_preferences?.email ? "secondary" : "outline"}>
                    Email alerts
                  </Badge>
                  <Badge variant={profile?.notification_preferences?.push ? "secondary" : "outline"}>
                    Push alerts
                  </Badge>
                  <Badge variant={profile?.notification_preferences?.in_app ? "secondary" : "outline"}>
                    In-app alerts
                  </Badge>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Preferences will be synced once you update your profile.
                </div>
                <Button asChild>
                  <Link to="/profile">Review profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
