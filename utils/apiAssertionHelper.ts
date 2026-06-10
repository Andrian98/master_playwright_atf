import {TestInfo} from "@playwright/test";
import {AccountApiService} from "../api/services/AccountApiService";
import {captureApiFailureEvidence} from "./apiEvidenceHelper";
import {logger} from "./logger";

export const executeApiValidationWithEvidence = async (testInfo: TestInfo, service: AccountApiService, validationCallback: () => Promise<void> | void): Promise<void> => {
    logger.info(`API validation started: ${testInfo.title}`);

    try {
        await validationCallback();
        logger.info(`API validation passed: ${testInfo.title}`);
    } catch (assertionError) {
        logger.error(`API validation failed: ${testInfo.title}`);
        const apiClient = service.apiClient;
        const lastResponse = apiClient.getLastResponse();
        const lastRequestData = apiClient.getLastRequestData();

        if (lastResponse && lastRequestData) {
            await captureApiFailureEvidence(lastResponse, testInfo.title, lastRequestData);
        }
        throw assertionError; // Re-throw to accurately fail the test runner
    }
};
