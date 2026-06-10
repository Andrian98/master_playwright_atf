import {test} from '@playwright/test';
import {LoginPage} from '../../pages/LoginPage';
import {users} from '../../test-data/users';
import {environment} from '../../config/environment';
import {SideMenu} from "../../pages/components/SideMenu";
import {logger} from "../../utils/logger";

test.describe('Login Functionality', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    let loginPage: LoginPage;

    test.beforeEach(async ({page}, testInfo) => {
        logger.info(`UI test started: ${testInfo.title}`);
        loginPage = new LoginPage(page);
        await page.goto(`${environment.baseUrl}${environment.loginPath}`);
        await loginPage.isPageLoaded();
        logger.info('Login page loaded');
    });

    test.afterEach(async ({}, testInfo) => {
        if (testInfo.status === testInfo.expectedStatus) {
            logger.info(`UI test finished successfully: ${testInfo.title}`);
        } else {
            logger.error(`UI test finished with status ${testInfo.status}: ${testInfo.title}`);
        }
    });

    test('validate successful login', async ({page}) => {
        const sideMenu = new SideMenu(page);
        await loginPage.login(users.validUser.username, users.validUser.password);
        await sideMenu.isLoaded();
        logger.info(`Successful login validation passed for user: ${users.validUser.username}`);
    });

    test('validate failed login', async () => {
        await loginPage.login(users.invalidUser.username, users.invalidUser.password);
        await loginPage.validateFailedLogin();
        logger.info(`Failed login validation passed for user: ${users.invalidUser.username}`);
    });
});
