
-- Insert initial feature flags into platform_config table
INSERT INTO public.platform_config (key, value, description) VALUES
('feature_tournament_registration', 'true', 'Enable/disable tournament registration functionality'),
('feature_wallet_payments', 'true', 'Enable/disable wallet payment system'),
('feature_team_creation', 'true', 'Enable/disable team creation and management'),
('feature_friend_system', 'true', 'Enable/disable friend requests and social features'),
('feature_notifications', 'true', 'Enable/disable in-app notifications'),
('feature_admin_dashboard', 'true', 'Enable/disable admin dashboard access'),
('feature_email_notifications', 'false', 'Enable/disable email notification system'),
('feature_file_uploads', 'false', 'Enable/disable file upload capabilities'),
('feature_maintenance_mode', 'false', 'Enable maintenance mode to disable all user actions'),
('email_tournament_registration', 'true', 'Send email when user registers for tournament'),
('email_match_scheduled', 'true', 'Send email when match is scheduled'),
('email_tournament_status', 'true', 'Send email when tournament status changes'),
('email_match_results', 'true', 'Send email when match results are posted'),
('email_achievement_unlock', 'true', 'Send email when user unlocks achievement'),
('system_max_tournaments_per_user', '10', 'Maximum tournaments a user can create'),
('system_max_participants_per_tournament', '64', 'Maximum participants allowed per tournament'),
('system_tournament_registration_buffer_hours', '2', 'Hours before tournament start that registration closes')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();
