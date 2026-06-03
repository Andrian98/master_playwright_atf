import {test} from "../../fixtures/appFixtures";
import {logger} from "../../utils/logger";
import {environment} from "../../config/environment";
import {accountData, loanData} from "../../test-data/input-data";
import {captureCheckpoint} from "../../utils/evidenceHelper";


test.describe('Account Operations', () => {
    test.describe.configure({mode: 'serial'});

    test('should open a new checking account', async ({page, openNewAccountPage, accountOverviewPage, sideMenu}) => {
        await page.goto(`${environment.baseUrl}${environment.openNewAccountPath}`);
        await openNewAccountPage.isPageLoaded();
        const newAccountId = await openNewAccountPage.openNewAccount();
        logger.info(`New account created: ${newAccountId}`);

        await sideMenu.navigateToAccountsOverview();
        await accountOverviewPage.isPageLoaded();
        await accountOverviewPage.validateAccountExists(newAccountId);
        logger.info(`Account overview page exists: ${newAccountId}`);
        await captureCheckpoint(page, `New Account ${newAccountId} Created`);
    });

    test('transfer funds from one account to another account', async ({page, accountOverviewPage, sideMenu, transferFundsPage}) => {
        await page.goto(`${environment.baseUrl}${environment.accountOverviewPath}`);
        await accountOverviewPage.isPageLoaded();
        const accountIds = await accountOverviewPage.getAccountIds();
        if (accountIds.length < 2) {
            throw new Error('At least two accounts are required to perform a transfer.');
        }

        await sideMenu.navigateToTransferFunds();
        await transferFundsPage.isPageLoaded();
        await transferFundsPage.transferFunds(accountData.checking.initialDeposit, accountIds[0]!, accountIds[1]!);
        await transferFundsPage.validateTransferSuccess(accountData.checking.initialDeposit, accountIds[0]!, accountIds[1]!);
        logger.info(`Transferred ${accountData.checking.initialDeposit} from account ${accountIds[0]} to account ${accountIds[1]}`);
        await captureCheckpoint(page, `Transferred ${accountData.checking.initialDeposit} from ${accountIds[0]} to ${accountIds[1]}`);
    });

    test('successfully apply for a loan', async ({page, accountOverviewPage, sideMenu, requestLoanPage}) => {
        await page.goto(`${environment.baseUrl}${environment.accountOverviewPath}`);
        await accountOverviewPage.isPageLoaded();
        const accountIds = await accountOverviewPage.getAccountIds();
        if (accountIds.length < 1) {
            throw new Error('At least one account is required to request a loan.');
        }

        await sideMenu.navigateToRequestLoan();
        await requestLoanPage.isPageLoaded();
        await requestLoanPage.requestLoan(loanData.validLoanRequest.amount, loanData.validLoanRequest.downPayment, accountIds[0]!);
        const newLoanId = await requestLoanPage.validateLoanApproved();
        logger.info(`Loan approved with new account ID: ${newLoanId}`);
        await captureCheckpoint(page, `Loan Approved with Account ${newLoanId}`);
    });
});