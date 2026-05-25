import {test as base} from "@playwright/test";
import {OpenNewAccountPage} from "../pages/OpenNewAccountPage";
import {AccountOverviewPage} from "../pages/AccountOverviewPage";
import {SideMenu} from "../pages/components/SideMenu";
import {TransferFundsPage} from "../pages/TransferFundsPage";
import {RequestLoanPage} from "../pages/RequestLoanPage";


export type UiFixtures = {
    openNewAccountPage: OpenNewAccountPage;
    accountOverviewPage: AccountOverviewPage;
    sideMenu: SideMenu;
    transferFundsPage: TransferFundsPage;
    requestLoanPage: RequestLoanPage;
};

export const uiFixtures = base.extend<UiFixtures>({
    openNewAccountPage: async ({page}, use) => {
        await use(new OpenNewAccountPage(page));
    },
    accountOverviewPage: async ({page}, use) => {
        await use(new AccountOverviewPage(page));
    },
    sideMenu: async ({page}, use) => {
        await use(new SideMenu(page));
    },
    transferFundsPage: async ({page}, use) => {
        await use(new TransferFundsPage(page));
    },
    requestLoanPage: async ({page}, use) => {
        await use(new RequestLoanPage(page));
    },
});