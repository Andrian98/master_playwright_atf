import {Page, Locator, expect} from "@playwright/test";

export class AccountOverviewPage {

    private readonly page: Page;
    private readonly logOutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.logOutButton = page.getByRole('link', { name: 'Log Out' });
    }

    async isPageLoaded() {
        await expect(this.logOutButton).toBeVisible();
    }
}