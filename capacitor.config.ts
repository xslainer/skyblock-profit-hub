import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.754aed332fd64874b7e4916dafd28509',
  appName: 'skyblock-profit-hub',
  webDir: 'dist',
  server: {
    url: 'https://754aed33-2fd6-4874-b7e4-916dafd28509.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;