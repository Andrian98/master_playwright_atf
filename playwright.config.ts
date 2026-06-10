import {defineConfig, devices} from '@playwright/test';
import {environment} from "./config/environment";

const isHeadless = process.env.HEADLESS !== 'false';

export default defineConfig({
    globalSetup: require.resolve('./global-setup'),
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    reporter: [
        ['html', {open: 'on-failure'}],
        ['list'],
    ],

    use: {
        baseURL: environment.baseUrl,
        storageState: environment.authStatePath,
        headless: isHeadless,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],
});
