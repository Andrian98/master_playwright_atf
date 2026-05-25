import * as path from 'path';
import {Locator, Page} from "@playwright/test";
import * as fs from 'fs';
import {logger} from "./logger";


const EVIDENCE_DIRECTORY = path.join(process.cwd(), 'test-results', 'evidence');

export const captureCheckpoint = async (target: Page | Locator, checkpointName: string) => {
    if (!fs.existsSync(EVIDENCE_DIRECTORY)) {
        fs.mkdirSync(EVIDENCE_DIRECTORY, {recursive: true});
    }

    const sanitizedName = checkpointName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${sanitizedName}_${timestamp}.png`;
    const filePath = path.join(EVIDENCE_DIRECTORY, fileName);

    const isPage = 'context' in target;

    await target.screenshot({
        path: filePath,
        type: 'png',
        fullPage: isPage,
    });
    logger.info(`Evidence captured: ${filePath}`);
    return filePath;
}