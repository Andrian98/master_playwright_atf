import {Page, Locator, expect} from '@playwright/test';
import {users} from '../test-data/users';


export class RegisterPage {
    private readonly page: Page;
    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly addressField: Locator;
    private readonly cityField: Locator;
    private readonly stateField: Locator;
    private readonly zipCodeField: Locator;
    private readonly phoneNumberField: Locator;
    private readonly ssnField: Locator;
    private readonly usernameField: Locator;
    private readonly passwordField: Locator;
    private readonly confirmPasswordField: Locator;
    private readonly registerButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameField = page.locator('#customer\\.firstName');
        this.lastNameField = page.locator('#customer\\.lastName');
        this.addressField = page.locator('#customer\\.address\\.street');
        this.cityField = page.locator('#customer\\.address\\.city');
        this.stateField = page.locator('#customer\\.address\\.state');
        this.zipCodeField = page.locator('#customer\\.address\\.zipCode');
        this.phoneNumberField = page.locator('#customer\\.phoneNumber');
        this.ssnField = page.locator('#customer\\.ssn');
        this.usernameField = page.locator('#customer\\.username');
        this.passwordField = page.locator('#customer\\.password');
        this.confirmPasswordField = page.locator('#repeatedPassword');
        this.registerButton = page.getByRole('button', {name: 'Register'});
    }

    async register(user: typeof users.registerUser) {
        await this.firstNameField.fill(user.firstName);
        await this.lastNameField.fill(user.lastName);
        await this.addressField.fill(user.address);
        await this.cityField.fill(user.city);
        await this.stateField.fill(user.state);
        await this.zipCodeField.fill(user.zipCode);
        await this.phoneNumberField.fill(user.phoneNumber);
        await this.ssnField.fill(user.ssn);
        await this.usernameField.fill(user.username);
        await this.passwordField.fill(user.password);
        await this.confirmPasswordField.fill(user.confirmPassword);
        await this.registerButton.click();
    }
}