// Stealth configuration for Playwright to avoid detection

export const stealthConfig = {
  // User-Agent rotation
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  ],

  // Viewport sizes to rotate
  viewports: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
  ],

  // Browser launch arguments for stealth
  launchArgs: [
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],

  // Context options
  contextOptions: {
    acceptDownloads: false,
    javaScriptEnabled: true,
    locale: 'en-US',
    timezoneId: 'UTC',
    permissions: ['geolocation'],
    geolocation: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
  },

  // Request delay to avoid rate limiting (ms)
  requestDelay: {
    min: 2000,
    max: 5000,
  },

  // Timeout settings
  timeout: {
    navigation: 60000, // 60 seconds
    action: 30000, // 30 seconds
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 5000,
  },
};

// Generate random user agent
export function getRandomUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * stealthConfig.userAgents.length);
  return stealthConfig.userAgents[randomIndex];
}

// Generate random viewport
export function getRandomViewport(): { width: number; height: number } {
  const randomIndex = Math.floor(Math.random() * stealthConfig.viewports.length);
  return stealthConfig.viewports[randomIndex];
}

// Generate random delay
export function getRandomDelay(): number {
  const { min, max } = stealthConfig.requestDelay;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
