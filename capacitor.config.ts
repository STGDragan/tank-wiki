
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.206d40b3c61340b8b74092ad42e373ed',
  appName: 'tank-wiki',
  webDir: 'dist',
  server: {
    url: 'https://206d40b3-c613-40b8-b740-92ad42e373ed.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
