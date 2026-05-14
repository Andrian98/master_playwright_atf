import {expect, Locator, Page} from "@playwright/test";

export class OpenNewAccountPage {

    private readonly accountTypeDropdown: Locator;
    private readonly fromAccountDropdown: Locator;
    private readonly openNewAccountButton: Locator;
    private readonly newAccountId: Locator;
    private readonly accountCreatedSuccessMessage: Locator;

    constructor(page: Page) {
        this.accountTypeDropdown = page.locator('#type');
        this.fromAccountDropdown = page.locator('#fromAccountId');
        this.openNewAccountButton = page.getByRole('button', {name: 'Open New Account'});
        this.newAccountId = page.locator('#newAccountId');
        this.accountCreatedSuccessMessage = page.locator('#openAccountResult');
    }

    async isPageLoaded() {
        await expect(this.accountTypeDropdown).toBeVisible();
        await expect(this.fromAccountDropdown).toBeVisible();
        await expect(this.openNewAccountButton).toBeVisible();
    }

    async openNewAccount() {
        await this.accountTypeDropdown.selectOption({label: 'CHECKING'});
        await this.fromAccountDropdown.selectOption({index: 0});
        await this.openNewAccountButton.click();
        await expect(this.accountCreatedSuccessMessage).toBeVisible();
        await expect(this.newAccountId).toBeVisible();
    }
}