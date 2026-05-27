import {TestInfo} from "@playwright/test";
import {AccountApiService} from "../api/services/AccountApiService";
import {captureApiFailureEvidence} from "./apiEvidenceHelper";

export const executeApiValidationWithEvidence = async (testInfo: TestInfo, service: AccountApiService, validationCallback: () => Promise<void> | void): Promise<void> => {
    try {
        await validationCallback();
    } catch (assertionError) {
        const apiClient = service.apiClient;
        const lastResponse = apiClient.getLastResponse();
        const lastRequestData = apiClient.getLastRequestData();

        if (lastResponse && lastRequestData) {
            await captureApiFailureEvidence(lastResponse, testInfo.title, lastRequestData);
        }
        throw assertionError; // Re-throw to accurately fail the test runner
    }
};