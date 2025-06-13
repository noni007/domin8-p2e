
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

interface FeatureFlags {
  feature_tournament_registration: boolean;
  feature_wallet_payments: boolean;
  feature_team_creation: boolean;
  feature_friend_system: boolean;
  feature_notifications: boolean;
  feature_admin_dashboard: boolean;
  feature_email_notifications: boolean;
  feature_file_uploads: boolean;
  feature_maintenance_mode: boolean;
}

export const useFeatureFlags = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [flags, setFlags] = useState<FeatureFlags>({
    feature_tournament_registration: true,
    feature_wallet_payments: true,
    feature_team_creation: true,
    feature_friend_system: true,
    feature_notifications: true,
    feature_admin_dashboard: true,
    feature_email_notifications: false,
    feature_file_uploads: false,
    feature_maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('key, value')
        .like('key', 'feature_%');

      if (error) throw error;

      const flagsObject: Partial<FeatureFlags> = {};
      data?.forEach((config) => {
        const key = config.key as keyof FeatureFlags;
        flagsObject[key] = config.value === 'true' || config.value === true;
      });

      setFlags(prev => ({ ...prev, ...flagsObject }));
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    // If maintenance mode is enabled, only admins can access features
    if (flags.feature_maintenance_mode && !isAdmin) {
      return false;
    }
    return flags[feature];
  };

  const toggleFeature = async (feature: keyof FeatureFlags, enabled: boolean) => {
    if (!isAdmin) return false;

    try {
      const { error } = await supabase
        .from('platform_config')
        .update({ value: enabled.toString() })
        .eq('key', feature);

      if (error) throw error;

      setFlags(prev => ({ ...prev, [feature]: enabled }));
      return true;
    } catch (error) {
      console.error('Error toggling feature:', error);
      return false;
    }
  };

  return {
    flags,
    loading,
    isFeatureEnabled,
    toggleFeature,
    refreshFlags: fetchFeatureFlags
  };
};
