import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountOverviewPage } from '../pages/AccountOverviewPage';

test('validate successful login', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const accountOverviewPage = new AccountOverviewPage(page);

  await page.goto('https://parabank.parasoft.com/parabank/index.htm');

  await loginPage.isPageLoaded();
  await loginPage.login('perf-user', 'perf-user123');

  await accountOverviewPage.isPageLoaded();
});
