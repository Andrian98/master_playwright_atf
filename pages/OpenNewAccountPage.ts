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

    async openNewAccount(): Promise<string> {
        await this.accountTypeDropdown.selectOption({label: 'CHECKING'});
        await this.fromAccountDropdown.selectOption({index: 0});
        await this.openNewAccountButton.click();
        await expect(this.accountCreatedSuccessMessage).toBeVisible();
        await expect(this.accountCreatedSuccessMessage).toContainText('Congratulations, your account is now open.');
        await expect(this.newAccountId).toBeVisible();

        const newId = await this.newAccountId.textContent();
        if (!newId) {
            throw new Error("Account was created but ID could not be read from the page.");
        }
        return newId.trim();
    }
}