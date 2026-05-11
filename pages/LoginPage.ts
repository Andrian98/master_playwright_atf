import {Page, Locator, expect} from "@playwright/test";

export class LoginPage {
    private readonly page: Page;
    private readonly usernameField: Locator;
    private readonly passwordField: Locator;
    private readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameField = page.locator('input[name="username"]');
        this.passwordField = page.locator('input[name="password"]');
        this.loginButton = page.getByRole('button', {name: 'Log In'});
    }

    async login(username: string, password: string) {
        await this.usernameField.fill(username);
        await this.passwordField.fill(password);
        await this.loginButton.click();
    }

    async isPageLoaded() {
        await expect(this.usernameField).toBeVisible();
        await expect(this.passwordField).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }
}