import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.54dfdd974a5848ffbaa17369bdbd1cb8',
  appName: 'domin8-p2e',
  webDir: 'dist',
  server: {
    url: 'https://54dfdd97-4a58-48ff-baa1-7369bdbd1cb8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;