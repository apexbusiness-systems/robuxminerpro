import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">
              Review your account details and mining performance at a glance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base font-medium">{user?.email ?? "Unavailable"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Display name</p>
                  <p className="text-base font-medium">
                    {profile?.display_name ?? "Set a display name in settings"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {profile?.subscription_tier ?? "Free"} tier
                  </Badge>
                  <Badge variant="outline">
                    Mining power: {profile?.mining_power ?? 0}
                  </Badge>
                </div>
                <Button asChild>
                  <Link to="/settings">Manage settings</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mining summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Robux</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {profile?.total_robux?.toLocaleString() ?? "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last activity</p>
                  <p className="text-base font-medium">
                    {profile?.last_login
                      ? new Date(profile.last_login).toLocaleString()
                      : "No recent activity"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Keep your profile complete to unlock higher mining tiers and
                  mentoring perks.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
