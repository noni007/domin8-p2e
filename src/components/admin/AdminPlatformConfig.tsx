
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type PlatformConfig = Tables<'platform_config'>;

export const AdminPlatformConfig = () => {
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .order('key');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast({
        title: "Error",
        description: "Failed to load platform configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: string, value: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_config')
        .update({ value: value })
        .eq('key', key);

      if (error) throw error;

      setConfigs(prev => prev.map(config => 
        config.key === key ? { ...config, value } : config
      ));

      toast({
        title: "Success",
        description: "Configuration updated successfully"
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getDisplayValue = (value: any) => {
    if (typeof value === 'string') {
      return value.replace(/"/g, '');
    }
    return String(value);
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-500" />
          Platform Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {configs.map((config) => (
            <div key={config.id} className="space-y-2">
              <Label htmlFor={config.key} className="text-gray-300">
                {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Label>
              {config.description && (
                <p className="text-xs text-gray-500">{config.description}</p>
              )}
              <div className="flex space-x-2">
                <Input
                  id={config.key}
                  defaultValue={getDisplayValue(config.value)}
                  className="bg-black/20 border-gray-600 text-white"
                  onBlur={(e) => {
                    if (e.target.value !== getDisplayValue(config.value)) {
                      updateConfig(config.key, e.target.value);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById(config.key) as HTMLInputElement;
                    updateConfig(config.key, input.value);
                  }}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
