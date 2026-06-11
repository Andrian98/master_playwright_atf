import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {getMetricsDir} from "./evidenceManager";
import {logger} from "./logger";

type CpuSnapshot = {
    idle: number;
    total: number;
};

type ResourceMetric = {
    timestamp: string;
    cpuUsagePercent: number | null;
    totalMemoryMb: number;
    usedMemoryMb: number;
    freeMemoryMb: number;
    memoryUsagePercent: number;
    processRssMb: number;
    processHeapUsedMb: number;
};

type ResourceSummary = {
    startedAt: string;
    finishedAt: string;
    sampleCount: number;
    averageCpuUsagePercent: number | null;
    maxCpuUsagePercent: number | null;
    maxMemoryUsagePercent: number;
    maxUsedMemoryMb: number;
    maxProcessRssMb: number;
    summary: string;
    metricsCsvPath: string;
    metricsJsonPath: string;
};

const MONITOR_INTERVAL_MS = 1000;

const metrics: ResourceMetric[] = [];
let timer: NodeJS.Timeout | null = null;
let previousCpuSnapshot: CpuSnapshot | null = null;
let metricsDir: string | null = null;
let startedAt: string | null = null;

const round = (value: number, fractionDigits = 2): number => Number(value.toFixed(fractionDigits));

const bytesToMb = (bytes: number): number => round(bytes / 1024 / 1024);

const getCpuSnapshot = (): CpuSnapshot => {
    return os.cpus().reduce<CpuSnapshot>(
        (snapshot, cpu) => {
            const total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
            return {
                idle: snapshot.idle + cpu.times.idle,
                total: snapshot.total + total,
            };
        },
        {idle: 0, total: 0}
    );
};

const calculateCpuUsage = (currentSnapshot: CpuSnapshot): number | null => {
    if (!previousCpuSnapshot) {
        previousCpuSnapshot = currentSnapshot;
        return null;
    }

    const idleDifference = currentSnapshot.idle - previousCpuSnapshot.idle;
    const totalDifference = currentSnapshot.total - previousCpuSnapshot.total;
    previousCpuSnapshot = currentSnapshot;

    if (totalDifference <= 0) {
        return null;
    }

    return round(((totalDifference - idleDifference) / totalDifference) * 100);
};

const captureResourceMetric = (): ResourceMetric => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const processMemory = process.memoryUsage();

    return {
        timestamp: new Date().toISOString(),
        cpuUsagePercent: calculateCpuUsage(getCpuSnapshot()),
        totalMemoryMb: bytesToMb(totalMemory),
        usedMemoryMb: bytesToMb(usedMemory),
        freeMemoryMb: bytesToMb(freeMemory),
        memoryUsagePercent: round((usedMemory / totalMemory) * 100),
        processRssMb: bytesToMb(processMemory.rss),
        processHeapUsedMb: bytesToMb(processMemory.heapUsed),
    };
};

const csvValue = (value: string | number | null): string => value === null ? '' : String(value);

const buildCsv = (): string => {
    const header = [
        'timestamp',
        'cpuUsagePercent',
        'totalMemoryMb',
        'usedMemoryMb',
        'freeMemoryMb',
        'memoryUsagePercent',
        'processRssMb',
        'processHeapUsedMb',
    ];

    const rows = metrics.map(metric => [
        metric.timestamp,
        csvValue(metric.cpuUsagePercent),
        metric.totalMemoryMb,
        metric.usedMemoryMb,
        metric.freeMemoryMb,
        metric.memoryUsagePercent,
        metric.processRssMb,
        metric.processHeapUsedMb,
    ].join(','));

    return [header.join(','), ...rows].join(os.EOL);
};

const getMetricFilePaths = () => {
    const activeMetricsDir = metricsDir || getMetricsDir();
    return {
        csvPath: path.join(activeMetricsDir, 'system-metrics.csv'),
        jsonPath: path.join(activeMetricsDir, 'system-metrics.json'),
        summaryPath: path.join(activeMetricsDir, 'system-metrics-summary.json'),
    };
};

const persistMetrics = (): void => {
    const {csvPath, jsonPath} = getMetricFilePaths();
    fs.writeFileSync(csvPath, buildCsv(), 'utf-8');
    fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), 'utf-8');
};

const createSummary = (finishedAt: string): ResourceSummary => {
    const {csvPath, jsonPath} = getMetricFilePaths();
    const cpuSamples = metrics
        .map(metric => metric.cpuUsagePercent)
        .filter((value): value is number => value !== null);

    const averageCpuUsagePercent = cpuSamples.length > 0
        ? round(cpuSamples.reduce((sum, value) => sum + value, 0) / cpuSamples.length)
        : null;

    const maxCpuUsagePercent = cpuSamples.length > 0 ? Math.max(...cpuSamples) : null;
    const maxMemoryUsagePercent = metrics.length > 0 ? Math.max(...metrics.map(metric => metric.memoryUsagePercent)) : 0;
    const maxUsedMemoryMb = metrics.length > 0 ? Math.max(...metrics.map(metric => metric.usedMemoryMb)) : 0;
    const maxProcessRssMb = metrics.length > 0 ? Math.max(...metrics.map(metric => metric.processRssMb)) : 0;
    const averageCpuText = averageCpuUsagePercent === null ? 'not available' : `${averageCpuUsagePercent}%`;
    const maxCpuText = maxCpuUsagePercent === null ? 'not available' : `${maxCpuUsagePercent}%`;
    const summary = `During this run, the system had about ${averageCpuText} average CPU usage, peaked at ${maxCpuText} CPU, used up to about ${maxUsedMemoryMb} MB RAM (${maxMemoryUsagePercent}%), and the Playwright Node runner process reached about ${maxProcessRssMb} MB RAM.`;

    return {
        startedAt: startedAt || finishedAt,
        finishedAt,
        sampleCount: metrics.length,
        averageCpuUsagePercent,
        maxCpuUsagePercent,
        maxMemoryUsagePercent,
        maxUsedMemoryMb,
        maxProcessRssMb,
        summary,
        metricsCsvPath: csvPath,
        metricsJsonPath: jsonPath,
    };
};

export const startResourceMonitor = (): string => {
    if (timer) {
        return metricsDir || getMetricsDir();
    }

    metricsDir = getMetricsDir();
    startedAt = new Date().toISOString();
    previousCpuSnapshot = null;
    metrics.length = 0;
    metrics.push(captureResourceMetric());
    persistMetrics();

    timer = setInterval(() => {
        metrics.push(captureResourceMetric());
        persistMetrics();
    }, MONITOR_INTERVAL_MS);

    timer.unref();
    logger.info(`Resource monitor started. Metrics directory: ${metricsDir}`);
    return metricsDir;
};

export const stopResourceMonitor = (): ResourceSummary => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    metrics.push(captureResourceMetric());
    persistMetrics();

    const finishedAt = new Date().toISOString();
    const summary = createSummary(finishedAt);
    const {summaryPath} = getMetricFilePaths();
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    logger.info(`Resource monitor stopped. Summary saved: ${summaryPath}`);
    return summary;
};
