import * as path from 'path';
import {Locator, Page, TestInfo} from "@playwright/test";
import {logger} from "./logger";
import {getScreenshotsDir} from "./evidenceManager";
import {environment} from "../config/environment";

export const captureCheckpoint = async (
    target: Page | Locator,
    checkpointName: string,
    domain: 'ui' | 'api' = 'ui',
    testInfo?: TestInfo
) => {
    if (!environment.captureCheckpointScreenshots) {
        logger.info(`Evidence screenshot skipped by configuration: ${checkpointName}`);
        return null;
    }

    const sanitizedName = checkpointName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Chisinau',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };
    const localTimeStr = now.toLocaleTimeString('en-US', options).replace(/:/g, '-').trim();
    const fileName = `${sanitizedName}_${localTimeStr}.png`;
    const targetFolder = getScreenshotsDir(domain);
    const filePath = path.join(targetFolder, fileName);
    const isPage = 'context' in target;

    await target.screenshot({
        path: filePath,
        type: 'png',
        fullPage: isPage,
    });

    if (testInfo) {
        await testInfo.attach(checkpointName, {
            path: filePath,
            contentType: 'image/png',
        });
        logger.info(`Evidence attached to HTML report: ${checkpointName}`);
    }

    logger.info(`Evidence captured: ${filePath}`);
    return filePath;
};
