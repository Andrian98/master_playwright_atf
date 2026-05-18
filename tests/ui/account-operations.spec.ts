import {test} from "@playwright/test";
import {OpenNewAccountPage} from "../../pages/OpenNewAccountPage";
import {SideMenu} from "../../pages/components/SideMenu";
import {AccountOverviewPage} from "../../pages/AccountOverviewPage";
import {logger} from "../../utils/logger";
import {environment} from "../../config/environment";
import {TransferFundsPage} from "../../pages/TransferFundsPage";


test.describe('Account Operations', () => {
    test.describe.configure({mode: 'serial'});
    let openNewAccountPage: OpenNewAccountPage;
    let accountOverviewPage: AccountOverviewPage;
    test.beforeEach(async ({page}) => {
        openNewAccountPage = new OpenNewAccountPage(page);
        accountOverviewPage = new AccountOverviewPage(page);
    });


    test('should open a new checking account', async ({page}) => {
        const sideMenu = new SideMenu(page);

        await page.goto(`${environment.baseUrl}${environment.openNewAccountPath}`);
        await openNewAccountPage.isPageLoaded();
        const newAccountId = await openNewAccountPage.openNewAccount();
        logger.info(`New account created: ${newAccountId}`);

        await sideMenu.navigateToAccountsOverview();
        await accountOverviewPage.isPageLoaded();
        await accountOverviewPage.validateAccountExists(newAccountId);
        logger.info(`Account overview page exists: ${newAccountId}`);
    });

    test('transfer funds from one account to another account', async ({page}) => {
        const transferFundsPage = new TransferFundsPage(page);

        await page.goto(`${environment.baseUrl}${environment.accountOverviewPath}`);
        await accountOverviewPage.isPageLoaded();
        const accountIds = await accountOverviewPage.getAccountIds();
        if (accountIds.length < 2) {
            throw new Error('At least two accounts are required to perform a transfer.');
        }

        await page.goto(`${environment.baseUrl}${environment.transferFundsPath}`);
        await transferFundsPage.isPageLoaded();
        await transferFundsPage.transferFunds('100', accountIds[0], accountIds[1]);
        await transferFundsPage.validateTransferSuccess('100', accountIds[0], accountIds[1]);
        logger.info(`Transferred $100 from account ${accountIds[0]} to account ${accountIds[1]}`);
    });
});