import {Page, Locator, expect} from "@playwright/test";

export class AccountOverviewPage {

    private readonly page: Page;
    private readonly accountsOverviewTitle: Locator;
    private readonly accountTable: Locator;
    private readonly accountLinks: Locator;
    private readonly totalRow: Locator;

    constructor(page: Page) {
        this.page = page;
        this.accountsOverviewTitle = page.getByRole('heading', {name: 'Accounts Overview'});
        this.accountTable = page.locator('#accountTable');
        this.accountLinks = page.locator('#accountTable tbody a');
        this.totalRow = page.getByText("Total");
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