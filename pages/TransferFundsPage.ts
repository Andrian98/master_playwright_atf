import {expect, Locator, Page} from "@playwright/test";


export class TransferFundsPage{

    private readonly transferFundsTitle: Locator;
    private readonly fromAccountDropdown: Locator;
    private readonly toAccountDropdown: Locator;
    private readonly amountField: Locator;
    private readonly transferButton: Locator;
    private readonly transferCompleteTitle: Locator;
    private readonly amountResult: Locator;
    private readonly fromAccountResult: Locator;
    private readonly toAccountResult: Locator;

    constructor(page: Page) {
        this.transferFundsTitle = page.getByRole('heading', {name: 'Transfer Funds'});
        this.fromAccountDropdown = page.locator('#fromAccountId');
        this.toAccountDropdown = page.locator('#toAccountId');
        this.amountField = page.locator('#amount');
        this.transferButton = page.getByRole('button', {name: 'Transfer'});
        this.transferCompleteTitle = page.getByRole('heading', {name: 'Transfer Complete!'});
        this.amountResult = page.locator('#amountResult');
        this.fromAccountResult = page.locator('#fromAccountIdResult');
        this.toAccountResult = page.locator('#toAccountIdResult');
    }

    async isPageLoaded() {
        await expect(this.transferFundsTitle).toBeVisible();
        await expect(this.fromAccountDropdown).toBeVisible();
        await expect(this.toAccountDropdown).toBeVisible();
        await expect(this.amountField).toBeVisible();
        await expect(this.transferButton).toBeVisible();
    }

    async transferFunds(amount: string, fromAccountId: string, toAccountId: string): Promise<void> {
        await this.fromAccountDropdown.selectOption({label: fromAccountId});
        await this.toAccountDropdown.selectOption({label: toAccountId});
        await this.amountField.fill(amount);
        await this.transferButton.click();
    }

    async validateTransferSuccess(amount: string, fromAccountId: string, toAccountId: string) {
        await expect(this.transferCompleteTitle).toBeVisible();
        await expect(this.fromAccountResult).toContainText(fromAccountId);
        await expect(this.toAccountResult).toContainText(toAccountId);
        await expect(this.amountResult).toContainText(`$${amount}`);
    }
}