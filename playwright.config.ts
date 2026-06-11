import {defineConfig, devices} from '@playwright/test';
import {environment} from "./config/environment";

const isHeadless = process.env.HEADLESS !== 'false';
const browserProject = process.env.BROWSER_PROJECT || 'chromium';
const browserProjects = [
    {
        name: 'chromium',
        use: {...devices['Desktop Chrome']},
    },
    {
        name: 'firefox',
        use: {...devices['Desktop Firefox']},
    },
    {
        name: 'webkit',
        use: {...devices['Desktop Safari']},
    },
];

const selectedProjects = browserProject === 'all'
    ? browserProjects
    : browserProjects.filter(project => project.name === browserProject);

if (selectedProjects.length === 0) {
    throw new Error(`Unsupported BROWSER_PROJECT value: ${browserProject}. Supported values: chromium, firefox, webkit, all.`);
}

export default defineConfig({
    globalSetup: require.resolve('./global-setup'),
    globalTeardown: require.resolve('./global-teardown'),
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
    projects: selectedProjects,
});
