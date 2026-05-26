import * as path from 'path';
import {Locator, Page} from "@playwright/test";
import {logger} from "./logger";
import {getScreenshotsDir} from "./evidenceManager";

export const captureCheckpoint = async (target: Page | Locator, checkpointName: string, domain: 'ui' | 'api' = 'ui') => {
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
    logger.info(`Evidence captured: ${filePath}`);
    return filePath;
};