import {AdminPage} from "../pages/AdminPage";
import {RegisterPage} from "../pages/RegisterPage";
import {test} from "@playwright/test";
import {environment} from "../config/environment";
import {users} from "../test-data/users";

test.describe('Preconditions before test execution', () => {


    test('initialize admin database', async ({page}) => {
        const adminPage = new AdminPage(page);
        await page.goto(`${environment.baseUrl}${environment.adminPath}`);
        await adminPage.initializeDatabase();

        const registerPage = new RegisterPage(page);
        await page.goto(`${environment.baseUrl}${environment.registerPath}`);
        await registerPage.register(users.registerUser);
        await registerPage.validateSuccessfulRegistration(users.registerUser.username);
    });

    // test('register user', async ({page}) => {
    //     const registerPage = new RegisterPage(page);
    //     await page.goto(`${environment.baseUrl}${environment.registerPath}`);
    //     await registerPage.register(users.registerUser);
    // });
});


