import {AccountApiService} from "../api/services/AccountApiService";
import {BankApiClient} from "../api/clients/BankApiClient";
import {test as base} from "@playwright/test";


export type ApiFixtures = {
    accountApiService: AccountApiService;
};

export const test = base.extend<ApiFixtures>(
    {
        accountApiService: async ({request}, use) => {
            const apiClient = new BankApiClient(request);
            const apiService = new AccountApiService(apiClient);
            await use(apiService);
        }
    });

export {expect} from "@playwright/test";