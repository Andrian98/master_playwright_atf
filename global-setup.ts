import {chromium} from "@playwright/test";
import {AdminPage} from "./pages/AdminPage";
import {environment} from "./config/environment";
import {RegisterPage} from "./pages/RegisterPage";
import {users} from "./test-data/users";
import {SideMenu} from "./pages/components/SideMenu";
import {initializeMasterDir} from "./utils/evidenceManager";
import {initializeLogger, logger} from "./utils/logger";
import {startResourceMonitor} from "./utils/resourceMonitor";


export default async function globalSetup() {
    process.env.ACTIVE_RUN_DIR = initializeMasterDir();
    initializeLogger();
    startResourceMonitor();
    logger.info('Global setup started');
    logger.info(`Evidence directory initialized: ${process.env.ACTIVE_RUN_DIR}`);

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const adminPage = new AdminPage(page);
    const registerPage = new RegisterPage(page);
    const sideMenu = new SideMenu(page);

    await page.goto(`${environment.baseUrl}${environment.adminPath}`);
    await adminPage.initializeAdminSetup();
    logger.info('Admin setup completed');

    await page.goto(`${environment.baseUrl}${environment.registerPath}`);
    await registerPage.register(users.registerUser);
    await registerPage.validateSuccessfulRegistration(users.registerUser.username);
    logger.info(`User registration completed for username: ${users.registerUser.username}`);

    await sideMenu.isLoaded();
    await context.storageState({path: environment.authStatePath});
    logger.info(`Auth state saved: ${environment.authStatePath}`);

    await context.close();
    await browser.close();
    logger.info('Global setup finished');

}
