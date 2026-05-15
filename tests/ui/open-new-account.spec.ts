import {test} from "@playwright/test";
import {OpenNewAccountPage} from "../../pages/OpenNewAccountPage";
import {LoginPage} from "../../pages/LoginPage";
import {environment} from "../../config/environment";
import {users} from "../../test-data/users";
import {SideMenu} from "../../pages/components/SideMenu";
import {AccountOverviewPage} from "../../pages/AccountOverviewPage";
import {logger} from "../../utils/logger";


test.describe('Open New Account Functionality', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({page}) => {
        loginPage = new LoginPage(page);
        await page.goto(`${environment.baseUrl}${environment.loginPath}`);
        await loginPage.isPageLoaded();
    });

    test('should open a new checking account', async ({page}) => {
        await loginPage.login(users.validUser.username, users.validUser.password);

        const sideMenu = new SideMenu(page);
        await sideMenu.navigateToOpenNewAccount();

        const openNewAccountPage = new OpenNewAccountPage(page);
        await openNewAccountPage.isPageLoaded();
        const newAccountId = await openNewAccountPage.openNewAccount();
        logger.info(`New account created: ${newAccountId}`);

        await sideMenu.navigateToAccountsOverview();
        const accountOverviewPage = new AccountOverviewPage(page);
        await accountOverviewPage.isPageLoaded();
        await accountOverviewPage.validateAccountExists(newAccountId);
        logger.info(`Account overview page exists: ${newAccountId}`);

    });

});