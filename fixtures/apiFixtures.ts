import {AccountApiService} from "../api/services/AccountApiService";
import {BankApiClient} from "../api/clients/BankApiClient";
import {test as base} from "@playwright/test";
import {captureApiFailureEvidence} from "../utils/apiEvidenceHelper";


export type ApiFixtures = {
    accountApiService: AccountApiService;
};

export const apiFixtures = base.extend<ApiFixtures>(
    {
        accountApiService: async ({request}, use, testInfo) => {
            const apiClient = new BankApiClient(request);
            const apiService = new AccountApiService(apiClient);
            await use(apiService);

            if (testInfo.status !== testInfo.expectedStatus) {
                const lastResponse = apiClient.getLastResponse?.();
                const lastRequestData = apiClient.getLastRequestData?.();

                if (lastResponse && lastRequestData) {
                    await captureApiFailureEvidence(lastResponse, testInfo.title, lastRequestData);
                }
            }
        }
    });