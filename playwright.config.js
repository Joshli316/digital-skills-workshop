const { defineConfig } = require('@playwright/test');
const path = require('path');

// `serve` lives wherever @playwright/test is installed. We don't want a local
// node_modules in this repo (would inflate wrangler deploys), so resolve from
// NODE_PATH (set by the test runner).
const serveBin = require.resolve('serve/build/main.js', {
  paths: (process.env.NODE_PATH || '').split(path.delimiter),
});

module.exports = defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3047' },
  webServer: {
    command: `node "${serveBin}" . -p 3047`,
    port: 3047,
    reuseExistingServer: !process.env.CI,
  },
});
