import { defineConfig, devices } from '@playwright/test';

// Testes no navegador contra o site já montado (npm run build). O servidor sobe sozinho.
export default defineConfig({
  testDir: 'testes',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:3100', trace: 'off' },
  webServer: { command: 'npx next start -p 3100', url: 'http://localhost:3100', reuseExistingServer: false, timeout: 60_000 },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'] } },
    { name: 'computador', use: { viewport: { width: 1280, height: 900 } } },
  ],
});
