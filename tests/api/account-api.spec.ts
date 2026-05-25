import {expect, test} from "../../fixtures/apiFixtures";
import {users} from "../../test-data/users";
import {accountData} from "../../test-data/input-data";
import {logger} from "../../utils/logger";
import {Account} from "../../api/models/Account";


test.describe('Account API functionality', () => {
    let customerId: number;

    test.beforeEach(async ({accountApiService}) => {
        customerId = await accountApiService.getCustomerId(users.validUser.username, users.validUser.password);
    });

    test('create account with valid details', async ({accountApiService}) => {
        const fromAccountId = await accountApiService.getFirstAccountId(customerId);
        const response = await accountApiService.createAccount(customerId, accountData.apiChecking.type, fromAccountId);
        expect(response.status()).toBe(200);
        const newAccountData: Account = await response.json();
        expect(newAccountData.customerId).toBe(customerId);
        expect(newAccountData.type).toBe(accountData.apiChecking.label);
        expect(newAccountData.balance).toBe(0);
        expect(newAccountData.id).toBeDefined();
        logger.info(`Successfully created new ${accountData.apiChecking.label} account with ID: ${newAccountData.id}`);
    });

    test('user cannot create an account with the invalid id', async ({accountApiService}) => {
        const fromAccountId = await accountApiService.getFirstAccountId(customerId);
        const invalidCustomerId = accountData.invalidCustomerId.customerId;
        const response = await accountApiService.createAccount(invalidCustomerId, accountData.apiChecking.type, fromAccountId);
        expect(response.status()).toBe(400);
        const responseText = await response.text();
        expect(responseText).toContain(`Could not create new account for customer ${invalidCustomerId} from account ${fromAccountId}`);
        logger.info(`Account creation failed as expected with invalid customer ID: ${invalidCustomerId}`);
    });
});