import {Page, Locator, expect} from "@playwright/test";

export class AccountOverviewPage {

    private readonly accountsOverviewTitle: Locator;
    private readonly accountTable: Locator;
    private readonly accountLinks: Locator;

    constructor(page: Page) {
        this.accountsOverviewTitle = page.getByRole('heading', {name: 'Accounts Overview'});
        this.accountTable = page.locator('#accountTable');
        this.accountLinks = page.locator('#accountTable tbody a');
    }

    async isPageLoaded() {
        await expect(this.accountsOverviewTitle).toBeVisible();
        await expect(this.accountTable).toBeVisible();
        await expect(this.accountLinks.first()).toBeVisible();
    }

    async validateAccountExists(accountID: string) {
        await expect(this.accountTable).toBeVisible();
        await expect(this.accountTable.getByText(accountID)).toBeVisible();
    }

    async getAccountIds(): Promise<string[]> {
        await expect(this.accountLinks.first()).toBeVisible();
        const accountIds = await this.accountLinks.allInnerTexts();

        return accountIds.map(id => id.trim());
    }
}