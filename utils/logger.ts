import {createLogger, format, transports} from 'winston';
import {getLogsDir} from "./evidenceManager";
import * as path from 'path';

const customFormat = format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.printf(({timestamp, level, message}) => {
        return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    })
);

const getLogFilePath = (): string => path.join(getLogsDir(), 'test-run.log');

const createFileTransport = (filePath: string) => new transports.File({filename: filePath});

let activeLogFilePath: string | null = null;
let fileTransport: ReturnType<typeof createFileTransport> | null = null;

export const logger = createLogger({
    level: 'info',
    format: customFormat,
    transports: [
        new transports.Console({
            format: customFormat
        }),
    ]
});

export const initializeLogger = (): string => {
    const logFilePath = getLogFilePath();

    if (activeLogFilePath === logFilePath) {
        return logFilePath;
    }

    if (fileTransport) {
        logger.remove(fileTransport);
    }

    fileTransport = createFileTransport(logFilePath);
    logger.add(fileTransport);
    activeLogFilePath = logFilePath;

    return logFilePath;
};

if (process.env.ACTIVE_RUN_DIR) {
    initializeLogger();
}
