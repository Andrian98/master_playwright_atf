import * as path from 'path';
import * as fs from 'fs';

const BASE_EVIDENCE_DIR = path.join(process.cwd(), 'evidence');

const getLocalTimestampParts = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Chisinau',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hourCycle: 'h23' // Guarantees pure 24-hour structure (00-23) across all OS platforms
    });
    const parts = formatter.formatToParts(now);
    const getValue = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)!.value;

    const year = getValue('year');
    const month = getValue('month');
    const day = getValue('day');
    const hour = getValue('hour');
    const minute = getValue('minute');
    const second = getValue('second');
    return {
        dateStamp: `${year}-${month}-${day}`,
        timeStamp: `${year}-${month}-${day}_${hour}-${minute}-${second}`
    };
};

const enforceRetentionPolicy = (currentDateStamp: string) => {
    if (!fs.existsSync(BASE_EVIDENCE_DIR)) return;
    let daysDir = fs.readdirSync(BASE_EVIDENCE_DIR).filter(item => fs.statSync(path.join(BASE_EVIDENCE_DIR, item)).isDirectory()).sort();
    if (!daysDir.includes(currentDateStamp)) {
        daysDir.push(currentDateStamp);
        daysDir.sort(); // Re-sort after adding current date if it wasn't present
    }
    while (daysDir.length > 2) {
        const oldestDayDir = daysDir.shift();
        if (oldestDayDir && oldestDayDir !== currentDateStamp) {
            fs.rmSync(path.join(BASE_EVIDENCE_DIR, oldestDayDir), {recursive: true, force: true});
        }
    }

    const activeDayDir = path.join(BASE_EVIDENCE_DIR, currentDateStamp);
    if (!fs.existsSync(activeDayDir)) return;
    const runDirs = fs.readdirSync(activeDayDir).filter(item => fs.statSync(path.join(activeDayDir, item)).isDirectory() && item.startsWith('run-')).sort();
    while (runDirs.length >= 5) {
        const oldestRun = runDirs.shift();
        if (oldestRun) {
            fs.rmSync(path.join(activeDayDir, oldestRun), {recursive: true, force: true});
        }
    }
};

export const initializeMasterDir = (): string => {
    const {dateStamp, timeStamp} = getLocalTimestampParts();
    enforceRetentionPolicy(dateStamp);
    const runDir = path.join(BASE_EVIDENCE_DIR, dateStamp, `run-${timeStamp}`);
    if (!fs.existsSync(runDir)) {
        fs.mkdirSync(runDir, {recursive: true});
    }
    return runDir;
};

export const getLogsDir = () => {
    const masterRunDir = process.env.ACTIVE_RUN_DIR || BASE_EVIDENCE_DIR;
    const logsPath = path.join(masterRunDir, 'logs');
    if (!fs.existsSync(logsPath)) {
        fs.mkdirSync(logsPath, {recursive: true});
    }
    return logsPath;
};

export const getScreenshotsDir = (domain: 'ui' | 'api'): string => {
    const masterRunDir = process.env.ACTIVE_RUN_DIR || BASE_EVIDENCE_DIR;
    const screenshotsPath = path.join(masterRunDir, domain, 'screenshots');
    if (!fs.existsSync(screenshotsPath)) {
        fs.mkdirSync(screenshotsPath, {recursive: true});
    }
    return screenshotsPath;
};

export const getApiEvidenceDir = (): string => {
    const masterRunDir = process.env.ACTIVE_RUN_DIR || BASE_EVIDENCE_DIR;
    const apiFailuresPath = path.join(masterRunDir, 'api', 'failures');
    if (!fs.existsSync(apiFailuresPath)) {
        fs.mkdirSync(apiFailuresPath, { recursive: true });
    }
    return apiFailuresPath;
};