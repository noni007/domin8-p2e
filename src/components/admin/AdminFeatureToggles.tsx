
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, AlertTriangle, RefreshCw } from "lucide-react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const AdminFeatureToggles = () => {
  const { flags, loading, toggleFeature, refreshFlags } = useFeatureFlags();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (feature: keyof typeof flags, enabled: boolean) => {
    setUpdating(feature);
    try {
      const success = await toggleFeature(feature, enabled);
      if (success) {
        toast({
          title: "Feature Updated",
          description: `${feature.replace('feature_', '').replace('_', ' ')} has been ${enabled ? 'enabled' : 'disabled'}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update feature flag",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating feature:', error);
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const getFeatureDescription = (feature: string) => {
    const descriptions: Record<string, string> = {
      feature_tournament_registration: "Allows users to register for tournaments",
      feature_wallet_payments: "Enables wallet and payment functionality",
      feature_team_creation: "Allows users to create and join teams",
      feature_friend_system: "Enables friend requests and social features",
      feature_notifications: "Shows in-app notifications to users",
      feature_admin_dashboard: "Provides access to admin dashboard",
      feature_email_notifications: "Sends email notifications for key events",
      feature_file_uploads: "Allows users to upload files and images",
      feature_maintenance_mode: "Disables platform for non-admin users"
    };
    return descriptions[feature] || "Feature toggle";
  };

  const getCriticalFeatures = () => {
    return ['feature_maintenance_mode', 'feature_tournament_registration', 'feature_wallet_payments'];
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading feature flags...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-500" />
            Feature Toggles
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshFlags}
            className="border-blue-400 text-blue-400"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {flags.feature_maintenance_mode && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-400 font-semibold">Maintenance Mode Active</span>
              </div>
              <p className="text-red-300 text-sm mt-1">
                Platform is currently in maintenance mode. Only admins can access features.
              </p>
            </div>
          )}

          {Object.entries(flags).map(([feature, enabled]) => {
            const isCritical = getCriticalFeatures().includes(feature);
            const isUpdating = updating === feature;
            
            return (
              <div key={feature} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Label htmlFor={feature} className="text-gray-300 font-medium">
                      {feature.replace('feature_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    {isCritical && (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                        Critical
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {getFeatureDescription(feature)}
                  </p>
                </div>
                <Switch
                  id={feature}
                  checked={enabled}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => handleToggle(feature as keyof typeof flags, checked)}
                  className="ml-4"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
