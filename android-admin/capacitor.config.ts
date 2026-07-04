import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tappy.admin',
  appName: 'Tappy Admin',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#6366F1',
  },
  server: {
    androidScheme: 'https',
  },
}

export default config
