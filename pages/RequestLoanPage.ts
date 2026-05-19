import {expect, Locator, Page} from "@playwright/test";

export class RequestLoanPage {
    private readonly applyForLoanTitle: Locator;
    private readonly loanAmountField: Locator;
    private readonly downPaymentField: Locator;
    private readonly fromAccountDropdown: Locator;
    private readonly applyNowButton: Locator;
    private readonly loanProcessedTitle: Locator;
    private readonly loanApprovedMessage: Locator;
    private readonly loanStatus: Locator;
    private readonly newAccountId: Locator;

    constructor(page: Page) {
        this.applyForLoanTitle = page.getByRole('heading', {name: 'Apply for a Loan'});
        this.loanAmountField = page.locator('#amount');
        this.downPaymentField = page.locator('#downPayment');
        this.fromAccountDropdown = page.locator('#fromAccountId');
        this.applyNowButton = page.getByRole('button', {name: 'Apply Now'});
        this.loanProcessedTitle = page.getByRole('heading', {name: 'Loan Request Processed'});
        this.loanApprovedMessage = page.getByText('Congratulations, your loan has been approved.');
        this.loanStatus = page.locator('#loanStatus');
        this.newAccountId = page.locator('#newAccountId');
    }

    async isPageLoaded() {
        await expect(this.applyForLoanTitle).toBeVisible();
        await expect(this.loanAmountField).toBeVisible();
        await expect(this.downPaymentField).toBeVisible();
        await expect(this.fromAccountDropdown).toBeVisible();
        await expect(this.applyNowButton).toBeVisible();
    }

    async requestLoan(loanAmount: string, downPayment: string, fromAccountId: string): Promise<void> {
        await this.isPageLoaded();
        await this.loanAmountField.fill(loanAmount);
        await this.downPaymentField.fill(downPayment);
        await this.fromAccountDropdown.selectOption({label: fromAccountId});
        await this.applyNowButton.click();
    }

    async validateLoanApproved(): Promise<string> {
        await expect(this.loanProcessedTitle).toBeVisible();
        await expect(this.loanStatus).toContainText('Approved');
        await expect(this.loanApprovedMessage).toBeVisible();
        const newLoanId = await this.newAccountId.textContent();
        if (!newLoanId) {
            throw new Error('Loan was approved but new account ID could not be read.');
        }
        return newLoanId.trim();
    }
}