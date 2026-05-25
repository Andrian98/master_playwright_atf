import {expect, test} from "../../fixtures/appFixtures";
import {users} from "../../test-data/users";
import {logger} from "../../utils/logger";
import {Customer} from "../../api/models/Customer";


test.describe('Login API functionality', () => {

    test('login with valid credentials', async ({accountApiService}) => {
        const response = await accountApiService.login(users.validUser.username, users.validUser.password);
        expect(response.status()).toBe(200);
        const responseJson: Customer = await response.json();
        expect(responseJson.firstName).toBe(users.registerUser.firstName);
        expect(responseJson.lastName).toBe(users.registerUser.lastName);
        expect(responseJson.ssn).toBe(users.registerUser.ssn);
        logger.info(`API login successful for user: ${users.validUser.username}`);
    });

    test('login with invalid credentials', async ({accountApiService}) => {
        const response = await accountApiService.login(users.invalidUser.username, users.invalidUser.password);
        expect(response.status()).toBe(400);
        const responseText = await response.text();
        expect(responseText).toContain('Invalid username and/or password');
        logger.info(`API login failed as expected for user: ${users.invalidUser.username}`);
    });
});