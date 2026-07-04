import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tappy.user',
  appName: 'Tappy',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#10B981',
  },
  server: {
    androidScheme: 'https',
  },
}

export default config
