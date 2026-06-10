import {expect, test} from "../../fixtures/appFixtures";
import {users} from "../../test-data/users";
import {logger} from "../../utils/logger";
import {Customer} from "../../api/models/Customer";
import {executeApiValidationWithEvidence} from "../../utils/apiAssertionHelper";


test.describe('Login API functionality', () => {

    test.beforeEach(async ({}, testInfo) => {
        logger.info(`API test started: ${testInfo.title}`);
    });

    test.afterEach(async ({}, testInfo) => {
        if (testInfo.status === testInfo.expectedStatus) {
            logger.info(`API test finished successfully: ${testInfo.title}`);
        } else {
            logger.error(`API test finished with status ${testInfo.status}: ${testInfo.title}`);
        }
    });

    test('login with valid credentials', async ({accountApiService}, testInfo) => {
        const response = await test.step('Submit valid API login request', async () => {
            return await accountApiService.login(users.validUser.username, users.validUser.password);
        });

        await test.step('Validate successful API login response', async () => {
            await executeApiValidationWithEvidence(testInfo, accountApiService, async () => {
                expect(response.status()).toBe(200);
                const responseJson: Customer = await response.json();
                expect(responseJson.firstName).toBe(users.registerUser.firstName);
                expect(responseJson.lastName).toBe(users.registerUser.lastName);
                expect(responseJson.ssn).toBe(users.registerUser.ssn);
                logger.info(`API login response validation passed for user: ${users.validUser.username}`);
            });
        });
    });

    test('login with invalid credentials', async ({accountApiService}, testInfo) => {
        const response = await test.step('Submit invalid API login request', async () => {
            return await accountApiService.login(users.invalidUser.username, users.invalidUser.password);
        });

        const responseText = await test.step('Read invalid API login response body', async () => {
            return await response.text();
        });

        await test.step('Validate invalid API login response', async () => {
            await executeApiValidationWithEvidence(testInfo, accountApiService, () => {
                expect(response.status()).toBe(400);
                expect(responseText).toContain('Invalid username and/or password');
                logger.info(`Invalid API login response validation passed for user: ${users.invalidUser.username}`);
            });
        });
    });
});
