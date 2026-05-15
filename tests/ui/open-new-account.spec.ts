import {test} from "@playwright/test";
import {OpenNewAccountPage} from "../../pages/OpenNewAccountPage";
import {SideMenu} from "../../pages/components/SideMenu";
import {AccountOverviewPage} from "../../pages/AccountOverviewPage";
import {logger} from "../../utils/logger";
import {environment} from "../../config/environment";


test.describe('Open New Account Functionality', () => {

    test('should open a new checking account', async ({page}) => {
        const openNewAccountPage = new OpenNewAccountPage(page);
        const sideMenu = new SideMenu(page);
        const accountOverviewPage = new AccountOverviewPage(page);

        await page.goto(`${environment.baseUrl}${environment.openNewAccountPath}`);
        await openNewAccountPage.isPageLoaded();
        const newAccountId = await openNewAccountPage.openNewAccount();
        logger.info(`New account created: ${newAccountId}`);

        await sideMenu.navigateToAccountsOverview();
        await accountOverviewPage.isPageLoaded();
        await accountOverviewPage.validateAccountExists(newAccountId);
        logger.info(`Account overview page exists: ${newAccountId}`);

    });

});