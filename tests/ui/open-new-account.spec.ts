import {test} from "@playwright/test";
import {OpenNewAccountPage} from "../../pages/OpenNewAccountPage";
import {LoginPage} from "../../pages/LoginPage";
import {environment} from "../../config/environment";
import {users} from "../../test-data/users";
import {SideMenu} from "../../pages/components/SideMenu";


test.describe('Open New Account Functionality', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({page}) => {
        loginPage = new LoginPage(page);
        await page.goto(`${environment.baseUrl}${environment.loginPath}`);
        await loginPage.isPageLoaded();
    });

    test('should open a new checking account', async ({page}) => {
        await loginPage.login(users.validUser.username, users.validUser.password);

        const sideMenu = new SideMenu(page);
        await sideMenu.navigateToOpenNewAccount();

        const openNewAccountPage = new OpenNewAccountPage(page);
        await openNewAccountPage.isPageLoaded();
        await openNewAccountPage.openNewAccount();
    });

});