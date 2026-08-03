import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.koikoiblog.app',
  appName: 'Koikoi Blog',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    allowNavigation: ['blog-2y55.onrender.com']
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
