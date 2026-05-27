import {APIResponse} from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import {logger} from "./logger";
import {getApiEvidenceDir} from "./evidenceManager";
import {LastRequestData} from "../api/clients/BankApiClient";

export const captureApiFailureEvidence = async (response: APIResponse, testName: string, requestData: LastRequestData): Promise<string> => {
    const sanitizedName = testName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
    const fileName = `api-fail_${sanitizedName}_${timestamp}.txt`;

    const targetFolder = getApiEvidenceDir();
    const filePath = path.join(targetFolder, fileName);

    const responseBody = await response.text().catch(e =>
        `[Could not parse response body: ${e instanceof Error ? e.message : String(e)}]`
    );

    const logContent = [
        `===================================================================`,
        `FAILED API TRANSACTION EVIDENCE`,
        `Timestamp: ${now.toLocaleString('en-US', { timeZone: 'Europe/Chisinau' })}`,
        `Test Case: ${testName}`,
        `===================================================================`,
        `\n--- HTTP REQUEST ---`,
        `${requestData.method.toUpperCase()} ${requestData.url}`,
        `Headers:\n${JSON.stringify(requestData.headers, null, 2)}`,
        `Payload:\n${requestData.postData ? requestData.postData : '[No Request Payload]'}`,
        `\n--- HTTP RESPONSE ---`,
        `Status: ${response.status()} ${response.statusText()}`,
        `Headers:\n${JSON.stringify(response.headers(), null, 2)}`,
        `Body:\n${responseBody}`,
        `===================================================================`
    ].join('\n');

    fs.writeFileSync(filePath, logContent, 'utf-8');
    logger.error(`API Failure evidence captured: ${filePath}`);

    return filePath;
};