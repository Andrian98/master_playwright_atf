import {expect, test} from "../../fixtures/appFixtures";
import {users} from "../../test-data/users";
import {accountData} from "../../test-data/input-data";
import {logger} from "../../utils/logger";
import {Account} from "../../api/models/Account";
import {executeApiValidationWithEvidence} from "../../utils/apiAssertionHelper";


test.describe('Account API functionality', () => {
    let customerId: number;

    test.beforeEach(async ({accountApiService}) => {
        await test.step('Resolve valid customer ID', async () => {
            customerId = await accountApiService.getCustomerId(users.validUser.username, users.validUser.password);
            logger.info(`Customer ID resolved for account API test: ${customerId}`);
        });
    });

    test('create account with valid details', async ({accountApiService}, testInfo) => {
        const fromAccountId = await test.step('Get source account for new account creation', async () => {
            return await accountApiService.getFirstAccountId(customerId);
        });

        const response = await test.step('Create checking account through API', async () => {
            return await accountApiService.createAccount(customerId, accountData.apiChecking.type, fromAccountId);
        });

        await test.step('Validate account creation response', async () => {
            await executeApiValidationWithEvidence(testInfo, accountApiService, async () => {
                expect(response.status()).toBe(200);
                const newAccountData: Account = await response.json();
                expect(newAccountData.customerId).toBe(customerId);
                expect(newAccountData.type).toBe(accountData.apiChecking.label);
                expect(newAccountData.balance).toBe(0);
                expect(newAccountData.id).toBeDefined();
                logger.info(`Create account response validation passed for new ${accountData.apiChecking.label} account ID: ${newAccountData.id}`);
            });
        });
    });

    test('user cannot create an account with the invalid id', async ({accountApiService}, testInfo) => {
        const fromAccountId = await test.step('Get source account for invalid account creation', async () => {
            return await accountApiService.getFirstAccountId(customerId);
        });

        const invalidCustomerId = accountData.invalidCustomerId.customerId;

        const response = await test.step('Create account with invalid customer ID', async () => {
            return await accountApiService.createAccount(invalidCustomerId, accountData.apiChecking.type, fromAccountId);
        });

        const responseText = await test.step('Read invalid account creation response body', async () => {
            return await response.text();
        });

        await test.step('Validate invalid customer account creation response', async () => {
            await executeApiValidationWithEvidence(testInfo, accountApiService, async () => {
                expect(response.status()).toBe(400);
                expect(responseText).toContain(`Could not create new account for customer ${invalidCustomerId} from account ${fromAccountId}`);
                logger.info(`Invalid customer account creation validation passed for customer ID: ${invalidCustomerId}`);
            });
        });
    });
});
