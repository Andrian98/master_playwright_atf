import {expect, test} from "@playwright/test";
import {AccountApiService} from "../../api/services/AccountApiService";
import {BankApiClient} from "../../api/clients/BankApiClient";
import {users} from "../../test-data/users";
import {logger} from "../../utils/logger";


test.describe('Login API functionality', () => {
    let accountApiService: AccountApiService;

    test.beforeEach(async ({request}) => {
        accountApiService = new AccountApiService(new BankApiClient(request));
    });

    test('login with valid credentials', async () => {
        const response = await accountApiService.login(users.validUser.username, users.validUser.password);
        expect(response.status()).toBe(200);
        const responseJson = await response.json();
        expect(responseJson.firstName).toBe(users.registerUser.firstName);
        expect(responseJson.lastName).toBe(users.registerUser.lastName);
        expect(responseJson.ssn).toBe(users.registerUser.ssn);
        logger.info(`API login successful for user: ${users.validUser.username}`);
    });

    test('login with invalid credentials', async () => {
        const response = await accountApiService.login(users.invalidUser.username, users.invalidUser.password);
        expect(response.status()).toBe(400);
        const responseText = await response.text();
        expect(responseText).toContain('Invalid username and/or password');
        logger.info(`API login failed as expected for user: ${users.invalidUser.username}`);
    });
});