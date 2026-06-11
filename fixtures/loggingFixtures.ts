import {test as base} from "@playwright/test";
import {logger} from "../utils/logger";

type TestExecutionLoggingFixtures = {
    testExecutionLogger: void;
};

const getTestType = (filePath: string): string => {
    const normalizedPath = filePath.replace(/\\/g, '/');

    if (normalizedPath.includes('/tests/api/')) {
        return 'API';
    }

    if (normalizedPath.includes('/tests/ui/')) {
        return 'UI';
    }

    return 'Playwright';
};

export const loggingFixtures = base.extend<TestExecutionLoggingFixtures>({
    testExecutionLogger: [async ({}, use, testInfo) => {
        const testType = getTestType(testInfo.file);
        logger.info(`${testType} test started: ${testInfo.title}`);

        await use();

        if (testInfo.status === testInfo.expectedStatus) {
            logger.info(`${testType} test finished successfully: ${testInfo.title}`);
        } else {
            logger.error(`${testType} test finished with status ${testInfo.status}: ${testInfo.title}`);
        }
    }, {auto: true}],
});
