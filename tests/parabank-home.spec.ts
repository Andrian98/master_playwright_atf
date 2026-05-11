import {test} from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';
import {AccountOverviewPage} from '../pages/AccountOverviewPage';
import {users} from '../test-data/users';

test('validate successful login', async ({page}) => {

    const loginPage = new LoginPage(page);
    const accountOverviewPage = new AccountOverviewPage(page);

    await page.goto('https://parabank.parasoft.com/parabank/index.htm');
    await loginPage.isPageLoaded();
    await loginPage.login(users.validUser.username, users.validUser.password);
    await accountOverviewPage.isPageLoaded();
});

test('validate failed login', async ({page}) => {
    const loginPage = new LoginPage(page);
    await page.goto('https://parabank.parasoft.com/parabank/index.htm');
    await loginPage.login(users.invalidUser.username, users.invalidUser.password);
    await loginPage.validateFailedLogin();

})
