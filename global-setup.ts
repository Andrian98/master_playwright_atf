import {chromium} from "@playwright/test";
import {AdminPage} from "./pages/AdminPage";
import {environment} from "./config/environment";
import {RegisterPage} from "./pages/RegisterPage";
import {users} from "./test-data/users";


export default async function globalSetup() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const adminPage = new AdminPage(page);
    const registerPage = new RegisterPage(page);
    await page.goto(`${environment.baseUrl}${environment.adminPath}`);
    await adminPage.initializeAdminSetup();
    await page.goto(`${environment.baseUrl}${environment.registerPath}`);
    await registerPage.register(users.registerUser);
    await registerPage.validateSuccessfulRegistration(users.registerUser.username);


    await browser.close();

}