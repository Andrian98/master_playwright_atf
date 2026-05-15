import {test} from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';
import {users} from '../test-data/users';
import {environment} from '../config/environment';
import {SideMenu} from "../pages/components/SideMenu";

test.describe('Login Functionality', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({page}) => {
        loginPage = new LoginPage(page);
        await page.goto(`${environment.baseUrl}${environment.loginPath}`);
        await loginPage.isPageLoaded();
    });

    test('validate successful login', async ({page}) => {
        await loginPage.login(users.validUser.username, users.validUser.password);
        const sideMenu = new SideMenu(page);
        await sideMenu.isLoaded();
    });

    test('validate failed login', async ({page}) => {
        await loginPage.login(users.invalidUser.username, users.invalidUser.password);
        await loginPage.validateFailedLogin();
    });
});
