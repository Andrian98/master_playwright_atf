import {test} from "../../fixtures/appFixtures";
import {logger} from "../../utils/logger";
import {environment} from "../../config/environment";
import {accountData, loanData} from "../../test-data/input-data";
import {captureCheckpoint} from "../../utils/evidenceHelper";


test.describe('Account Operations', () => {
    test.describe.configure({mode: 'serial'});

    test.beforeEach(async ({}, testInfo) => {
        logger.info(`UI test started: ${testInfo.title}`);
    });

    test.afterEach(async ({}, testInfo) => {
        if (testInfo.status === testInfo.expectedStatus) {
            logger.info(`UI test finished successfully: ${testInfo.title}`);
        } else {
            logger.error(`UI test finished with status ${testInfo.status}: ${testInfo.title}`);
        }
    });

    test('should open a new checking account', async ({page, openNewAccountPage, accountOverviewPage, sideMenu}) => {
        await page.goto(`${environment.baseUrl}${environment.openNewAccountPath}`);
        await openNewAccountPage.isPageLoaded();
        logger.info('Open New Account page loaded');

        const newAccountId = await openNewAccountPage.openNewAccount();
        logger.info(`New account created: ${newAccountId}`);

        await sideMenu.navigateToAccountsOverview();
        await accountOverviewPage.isPageLoaded();
        logger.info('Account Overview page loaded');

        await accountOverviewPage.validateAccountExists(newAccountId);
        logger.info(`Account overview validation passed for account: ${newAccountId}`);
        await captureCheckpoint(page, `New Account ${newAccountId} Created`);
    });

    test('transfer funds from one account to another account', async ({page, accountOverviewPage, sideMenu, transferFundsPage}) => {
        await page.goto(`${environment.baseUrl}${environment.accountOverviewPath}`);
        await accountOverviewPage.isPageLoaded();
        logger.info('Account Overview page loaded');

        const accountIds = await accountOverviewPage.getAccountIds();
        if (accountIds.length < 2) {
            throw new Error('At least two accounts are required to perform a transfer.');
        }
        logger.info(`Transfer prerequisites passed with ${accountIds.length} available accounts`);

        await sideMenu.navigateToTransferFunds();
        await transferFundsPage.isPageLoaded();
        logger.info('Transfer Funds page loaded');

        await transferFundsPage.transferFunds(accountData.checking.initialDeposit, accountIds[0]!, accountIds[1]!);
        await transferFundsPage.validateTransferSuccess(accountData.checking.initialDeposit, accountIds[0]!, accountIds[1]!);
        logger.info(`Transfer validation passed for amount ${accountData.checking.initialDeposit} from account ${accountIds[0]} to account ${accountIds[1]}`);
        await captureCheckpoint(page, `Transferred ${accountData.checking.initialDeposit} from ${accountIds[0]} to ${accountIds[1]}`);
    });

    test('successfully apply for a loan', async ({page, accountOverviewPage, sideMenu, requestLoanPage}) => {
        await page.goto(`${environment.baseUrl}${environment.accountOverviewPath}`);
        await accountOverviewPage.isPageLoaded();
        logger.info('Account Overview page loaded');

        const accountIds = await accountOverviewPage.getAccountIds();
        if (accountIds.length < 1) {
            throw new Error('At least one account is required to request a loan.');
        }
        logger.info(`Loan prerequisites passed with ${accountIds.length} available accounts`);

        await sideMenu.navigateToRequestLoan();
        await requestLoanPage.isPageLoaded();
        logger.info('Request Loan page loaded');

        await requestLoanPage.requestLoan(loanData.validLoanRequest.amount, loanData.validLoanRequest.downPayment, accountIds[0]!);
        const newLoanId = await requestLoanPage.validateLoanApproved();
        logger.info(`Loan approval validation passed with new account ID: ${newLoanId}`);
        await captureCheckpoint(page, `Loan Approved with Account ${newLoanId}`);
    });
});
