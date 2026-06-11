import {test} from "../../fixtures/appFixtures";
import {logger} from "../../utils/logger";
import {environment} from "../../config/environment";
import {accountData, loanData} from "../../test-data/input-data";
import {captureCheckpoint} from "../../utils/evidenceHelper";


test.describe('Account Operations', () => {
    test.describe.configure({mode: 'serial'});

    test('should open a new checking account', async ({page, openNewAccountPage, accountOverviewPage, sideMenu}, testInfo) => {
        await test.step('Open new account page', async () => {
            await page.goto(`${environment.baseUrl}${environment.openNewAccountPath}`);
            await openNewAccountPage.isPageLoaded();
            logger.info('Open New Account page loaded');
        });

        const newAccountId = await test.step('Create new checking account', async () => {
            const accountId = await openNewAccountPage.openNewAccount();
            logger.info(`New account created: ${accountId}`);
            return accountId;
        });

        await test.step('Validate new account in account overview', async () => {
            await sideMenu.navigateToAccountsOverview();
            await accountOverviewPage.isPageLoaded();
            logger.info('Account Overview page loaded');

            await accountOverviewPage.validateAccountExists(newAccountId);
            logger.info(`Account overview validation passed for account: ${newAccountId}`);
        });

        await test.step('Capture new account evidence', async () => {
            await captureCheckpoint(page, `New Account ${newAccountId} Created`, 'ui', testInfo);
        });
    });

    test('transfer funds from one account to another account', async ({page, accountOverviewPage, sideMenu, transferFundsPage}, testInfo) => {
        await test.step('Open account overview page', async () => {
            await page.goto(`${environment.baseUrl}${environment.accountOverviewPath}`);
            await accountOverviewPage.isPageLoaded();
            logger.info('Account Overview page loaded');
        });

        const accountIds = await test.step('Get accounts eligible for transfer', async () => {
            const ids = await accountOverviewPage.getAccountIds();
            if (ids.length < 2) {
                throw new Error('At least two accounts are required to perform a transfer.');
            }
            logger.info(`Transfer prerequisites passed with ${ids.length} available accounts`);
            return ids;
        });

        await test.step('Open transfer funds page', async () => {
            await sideMenu.navigateToTransferFunds();
            await transferFundsPage.isPageLoaded();
            logger.info('Transfer Funds page loaded');
        });

        await test.step('Submit funds transfer', async () => {
            await transferFundsPage.transferFunds(accountData.checking.initialDeposit, accountIds[0]!, accountIds[1]!);
        });

        await test.step('Validate transfer success and capture evidence', async () => {
            await transferFundsPage.validateTransferSuccess(accountData.checking.initialDeposit, accountIds[0]!, accountIds[1]!);
            logger.info(`Transfer validation passed for amount ${accountData.checking.initialDeposit} from account ${accountIds[0]} to account ${accountIds[1]}`);
            await captureCheckpoint(page, `Transferred ${accountData.checking.initialDeposit} from ${accountIds[0]} to ${accountIds[1]}`, 'ui', testInfo);
        });
    });

    test('successfully apply for a loan', async ({page, accountOverviewPage, sideMenu, requestLoanPage}, testInfo) => {
        await test.step('Open account overview page', async () => {
            await page.goto(`${environment.baseUrl}${environment.accountOverviewPath}`);
            await accountOverviewPage.isPageLoaded();
            logger.info('Account Overview page loaded');
        });

        const accountIds = await test.step('Get account eligible for loan request', async () => {
            const ids = await accountOverviewPage.getAccountIds();
            if (ids.length < 1) {
                throw new Error('At least one account is required to request a loan.');
            }
            logger.info(`Loan prerequisites passed with ${ids.length} available accounts`);
            return ids;
        });

        await test.step('Open request loan page', async () => {
            await sideMenu.navigateToRequestLoan();
            await requestLoanPage.isPageLoaded();
            logger.info('Request Loan page loaded');
        });

        await test.step('Submit loan request', async () => {
            await requestLoanPage.requestLoan(loanData.validLoanRequest.amount, loanData.validLoanRequest.downPayment, accountIds[0]!);
        });

        await test.step('Validate loan approval and capture evidence', async () => {
            const newLoanId = await requestLoanPage.validateLoanApproved();
            logger.info(`Loan approval validation passed with new account ID: ${newLoanId}`);
            await captureCheckpoint(page, `Loan Approved with Account ${newLoanId}`, 'ui', testInfo);
        });
    });
});
