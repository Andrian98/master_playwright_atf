import {test} from '@playwright/test';
import {LoginPage} from '../../pages/LoginPage';
import {users} from '../../test-data/users';
import {environment} from '../../config/environment';
import {SideMenu} from "../../pages/components/SideMenu";
import {logger} from "../../utils/logger";
import {captureCheckpoint} from "../../utils/evidenceHelper";

test.describe('Login Functionality', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    let loginPage: LoginPage;

    test.beforeEach(async ({page}, testInfo) => {
        logger.info(`UI test started: ${testInfo.title}`);
        loginPage = new LoginPage(page);

        await test.step('Open login page', async () => {
            await page.goto(`${environment.baseUrl}${environment.loginPath}`);
            await loginPage.isPageLoaded();
            logger.info('Login page loaded');
        });
    });

    test.afterEach(async ({}, testInfo) => {
        if (testInfo.status === testInfo.expectedStatus) {
            logger.info(`UI test finished successfully: ${testInfo.title}`);
        } else {
            logger.error(`UI test finished with status ${testInfo.status}: ${testInfo.title}`);
        }
    });

    test('validate successful login', async ({page}, testInfo) => {
        const sideMenu = new SideMenu(page);

        await test.step('Submit valid login credentials', async () => {
            await loginPage.login(users.validUser.username, users.validUser.password);
        });

        await test.step('Validate successful login state', async () => {
            await sideMenu.isLoaded();
            logger.info(`Successful login validation passed for user: ${users.validUser.username}`);
            await captureCheckpoint(page, 'Successful Login State', 'ui', testInfo);
        });
    });

    test('validate failed login', async ({page}, testInfo) => {
        await test.step('Submit invalid login credentials', async () => {
            await loginPage.login(users.invalidUser.username, users.invalidUser.password);
        });

        await test.step('Validate failed login message', async () => {
            await loginPage.validateFailedLogin();
            logger.info(`Failed login validation passed for user: ${users.invalidUser.username}`);
            await captureCheckpoint(page, 'Failed Login Message', 'ui', testInfo);
        });
    });
});
