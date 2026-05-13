import {Page, Locator, expect} from "@playwright/test";

export class AdminPage {
    private readonly initializeDatabaseButton: Locator;
    private readonly cleanDatabaseButton: Locator;
    private readonly jmsStartupButton: Locator;
    private readonly databaseCleanedMessage: Locator;
    private readonly databaseInitializedMessage: Locator;
    private readonly dataAccessModeJDBC: Locator;
    private readonly webServiceSOAP: Locator;
    private readonly webServiceRest: Locator;
    private readonly loanProcessorService: Locator;
    private readonly initBalance: Locator;
    private readonly minBalance: Locator;
    private readonly loanProvider: Locator;
    private readonly loanProcessor: Locator;
    private readonly threshold: Locator;
    private readonly submitButton: Locator;
    private readonly settingSavedMessage: Locator;

    constructor(page: Page) {
        this.initializeDatabaseButton = page.getByRole('button', {name: 'Initialize'});
        this.cleanDatabaseButton = page.getByRole('button', {name: 'Clean'});
        this.jmsStartupButton = page.getByRole('button', {name: 'Startup'});
        this.databaseCleanedMessage = page.getByText('Database Cleaned');
        this.databaseInitializedMessage = page.getByText('Database Initialized');
        this.dataAccessModeJDBC = page.locator('#accessMode4');
        this.webServiceSOAP = page.locator('#soapEndpoint');
        this.webServiceRest = page.locator('#restEndpoint');
        this.loanProcessorService = page.locator('#endpoint');
        this.initBalance = page.locator('#initialBalance');
        this.minBalance = page.locator('#minimumBalance');
        this.loanProvider = page.locator('#loanProvider');
        this.loanProcessor = page.locator('#loanProcessor');
        this.threshold = page.locator('#loanProcessorThreshold');
        this.submitButton = page.getByRole('button', {name: 'Submit'});
        this.settingSavedMessage = page.getByText('Settings saved successfully.');
    }

    async initializeAdminSetup() {
        await this.cleanDatabaseButton.click();
        await expect(this.databaseCleanedMessage).toBeVisible();
        await this.initializeDatabaseButton.click();
        await expect(this.databaseInitializedMessage).toBeVisible();

        if (await this.jmsStartupButton.isVisible()) {
            await this.jmsStartupButton.click();
        }
        await this.dataAccessModeJDBC.check();
        await expect(this.dataAccessModeJDBC).toBeChecked();
        await this.webServiceSOAP.clear();
        await expect(this.webServiceSOAP).toHaveValue('');
        await this.webServiceRest.clear();
        await expect(this.webServiceRest).toHaveValue('');
        await  this.loanProcessorService.clear();
        await expect(this.loanProcessorService).toHaveValue('');
        await this.initBalance.clear();
        await this.initBalance.fill('5150.50');
        await expect(this.initBalance).toHaveValue('5150.50');
        await this.minBalance.clear();
        await this.minBalance.fill('100.00');
        await expect(this.minBalance).toHaveValue('100.00');
        await this.loanProvider.selectOption('ws');
        await expect(this.loanProvider).toHaveValue('ws');
        await this.loanProcessor.selectOption('Available Funds');
        await expect(this.loanProcessor).toHaveValue('funds');
        await this.threshold.clear();
        await this.threshold.fill('20');
        await expect(this.threshold).toHaveValue('20');
        await this.submitButton.click();
        await expect(this.settingSavedMessage).toBeVisible();
    }
}