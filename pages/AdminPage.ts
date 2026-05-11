import {Page, Locator, expect} from "@playwright/test";

export class AdminPage {
    private readonly initializeDatabaseButton: Locator;
    private readonly cleanDatabaseButton: Locator;
    private readonly jmsStartupButton: Locator;
    private readonly databaseCleanedMessage: Locator;
    private readonly databaseInitializedMessage: Locator;

    constructor(page: Page) {
        this.initializeDatabaseButton = page.getByRole('button', {name: 'Initialize'});
        this.cleanDatabaseButton = page.getByRole('button', {name: 'Clean'});
        this.jmsStartupButton = page.getByRole('button', {name: 'Startup'});
        this.databaseCleanedMessage = page.getByText('Database Cleaned');
        this.databaseInitializedMessage = page.getByText('Database Initialized');
    }

    async initializeDatabase() {
        await this.cleanDatabaseButton.click();
        await expect(this.databaseCleanedMessage).toBeVisible();
        await this.initializeDatabaseButton.click();
        await expect(this.databaseInitializedMessage).toBeVisible();

        if (await this.jmsStartupButton.isVisible()) {
            await this.jmsStartupButton.click();
        }
    }
}