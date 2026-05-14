import {Locator, Page} from "@playwright/test";

export class SideMenu {

    private readonly openNewAccountLink: Locator;
    private readonly accountsOverviewLink: Locator;
    private readonly transferFundsLink: Locator;
    private readonly requestLoanLink: Locator;
    private readonly logoutLink: Locator;

    constructor(page: Page) {
        this.openNewAccountLink = page.getByRole('link', {name: 'Open New Account'});
        this.accountsOverviewLink = page.getByRole('link', {name: 'Accounts Overview'});
        this.transferFundsLink = page.getByRole('link', {name: 'Transfer Funds'});
        this.requestLoanLink = page.getByRole('link', {name: 'Request Loan'});
        this.logoutLink = page.getByRole('link', {name: 'Log Out'});
    }

    async navigateToOpenNewAccount() {
        await this.openNewAccountLink.click();
    }

    async navigateToAccountsOverview() {
        await this.accountsOverviewLink.click();
    }

    async navigateToTransferFunds() {
        await this.transferFundsLink.click();
    }

    async navigateToRequestLoan() {
        await this.requestLoanLink.click();
    }

    async logout() {
        await this.logoutLink.click();
    }
}