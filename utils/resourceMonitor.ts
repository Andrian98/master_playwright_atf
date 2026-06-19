import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {environment} from "../config/environment";
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
    metricsHtmlReportPath: string;
};

type ChartSeries = {
    label: string;
    color: string;
    values: Array<number | null>;
};

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

const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const formatPercent = (value: number | null): string => value === null ? 'N/A' : `${value}%`;

const formatMb = (value: number): string => `${value} MB`;

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
        htmlPath: path.join(activeMetricsDir, 'system-metrics-report.html'),
    };
};

const persistMetrics = (): void => {
    const {csvPath, jsonPath} = getMetricFilePaths();
    fs.writeFileSync(csvPath, buildCsv(), 'utf-8');
    fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), 'utf-8');
};

const createSummary = (finishedAt: string): ResourceSummary => {
    const {csvPath, jsonPath, htmlPath} = getMetricFilePaths();
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
        metricsHtmlReportPath: htmlPath,
    };
};

const buildLineChart = (title: string, yAxisLabel: string, series: ChartSeries[]): string => {
    const width = 900;
    const height = 280;
    const padding = {
        top: 24,
        right: 24,
        bottom: 48,
        left: 72,
    };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const sampleCount = Math.max(metrics.length, ...series.map(item => item.values.length));
    const numericValues = series.flatMap(item => item.values).filter((value): value is number => value !== null);
    const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 0;
    const yMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 1;

    const x = (index: number): number => {
        if (sampleCount <= 1) {
            return padding.left + plotWidth / 2;
        }
        return padding.left + (index / (sampleCount - 1)) * plotWidth;
    };
    const y = (value: number): number => padding.top + plotHeight - (value / yMax) * plotHeight;

    const chartLines = series.map(item => {
        const points: string[] = [];
        item.values.forEach((value, index) => {
            if (value === null) {
                return;
            }
            points.push(`${round(x(index))},${round(y(value))}`);
        });

        if (points.length === 0) {
            return '';
        }

        return `<polyline class="chart-line" points="${points.join(' ')}" stroke="${item.color}" />`;
    }).join('\n');

    const legendItems = series.map((item, index) => {
        const legendX = padding.left + index * 180;
        return `
            <g class="legend-item" transform="translate(${legendX}, ${height - 18})">
                <rect width="12" height="12" fill="${item.color}" rx="2"></rect>
                <text x="18" y="10">${escapeHtml(item.label)}</text>
            </g>
        `;
    }).join('\n');

    return `
        <section class="chart-card">
            <h2>${escapeHtml(title)}</h2>
            <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
                <line class="axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotHeight}"></line>
                <line class="axis" x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight}"></line>
                <line class="grid" x1="${padding.left}" y1="${padding.top}" x2="${padding.left + plotWidth}" y2="${padding.top}"></line>
                <line class="grid" x1="${padding.left}" y1="${padding.top + plotHeight / 2}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight / 2}"></line>
                <text class="axis-label" x="${padding.left - 12}" y="${padding.top + 4}" text-anchor="end">${round(yMax)}</text>
                <text class="axis-label" x="${padding.left - 12}" y="${padding.top + plotHeight / 2 + 4}" text-anchor="end">${round(yMax / 2)}</text>
                <text class="axis-label" x="${padding.left - 12}" y="${padding.top + plotHeight + 4}" text-anchor="end">0</text>
                <text class="axis-title" x="18" y="${padding.top + plotHeight / 2}" transform="rotate(-90 18 ${padding.top + plotHeight / 2})">${escapeHtml(yAxisLabel)}</text>
                <text class="axis-label" x="${padding.left}" y="${padding.top + plotHeight + 24}" text-anchor="middle">start</text>
                <text class="axis-label" x="${padding.left + plotWidth}" y="${padding.top + plotHeight + 24}" text-anchor="middle">end</text>
                ${chartLines}
                ${legendItems}
            </svg>
        </section>
    `;
};

const buildMetricCard = (label: string, value: string): string => {
    return `
        <article class="metric-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        </article>
    `;
};

const buildMetricsReportHtml = (summary: ResourceSummary): string => {
    const generatedAt = new Date().toISOString();
    const cpuChart = buildLineChart('CPU Usage Over Time', 'CPU %', [
        {
            label: 'System CPU',
            color: '#2563eb',
            values: metrics.map(metric => metric.cpuUsagePercent),
        },
    ]);
    const memoryPercentChart = buildLineChart('System Memory Usage Over Time', 'Memory %', [
        {
            label: 'System Memory',
            color: '#16a34a',
            values: metrics.map(metric => metric.memoryUsagePercent),
        },
    ]);
    const memoryMbChart = buildLineChart('Memory Consumption Over Time', 'Memory MB', [
        {
            label: 'Used System RAM',
            color: '#9333ea',
            values: metrics.map(metric => metric.usedMemoryMb),
        },
        {
            label: 'Node Runner RSS',
            color: '#dc2626',
            values: metrics.map(metric => metric.processRssMb),
        },
        {
            label: 'Node Heap Used',
            color: '#f59e0b',
            values: metrics.map(metric => metric.processHeapUsedMb),
        },
    ]);

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>System Metrics Report</title>
    <style>
        body {
            margin: 0;
            background: #f6f7f9;
            color: #172033;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.45;
        }

        main {
            max-width: 1080px;
            margin: 0 auto;
            padding: 32px 24px 48px;
        }

        h1 {
            margin: 0 0 8px;
            font-size: 30px;
        }

        h2 {
            margin: 0 0 16px;
            font-size: 20px;
        }

        .subtitle {
            margin: 0 0 24px;
            color: #526071;
        }

        .notice {
            margin: 0 0 24px;
            padding: 12px 14px;
            border-left: 4px solid #2563eb;
            background: #eaf1ff;
            border-radius: 4px;
            color: #25364d;
        }

        .summary {
            margin: 0 0 24px;
            padding: 16px;
            background: #ffffff;
            border: 1px solid #dce2ea;
            border-radius: 6px;
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
        }

        .metric-card {
            padding: 14px;
            background: #ffffff;
            border: 1px solid #dce2ea;
            border-radius: 6px;
        }

        .metric-card span {
            display: block;
            margin-bottom: 6px;
            color: #526071;
            font-size: 13px;
        }

        .metric-card strong {
            font-size: 20px;
        }

        .chart-card {
            margin-bottom: 20px;
            padding: 18px;
            background: #ffffff;
            border: 1px solid #dce2ea;
            border-radius: 6px;
        }

        svg {
            width: 100%;
            height: auto;
            display: block;
        }

        .axis {
            stroke: #7d8998;
            stroke-width: 1;
        }

        .grid {
            stroke: #d8dee8;
            stroke-width: 1;
            stroke-dasharray: 4 4;
        }

        .chart-line {
            fill: none;
            stroke-width: 2.5;
            stroke-linejoin: round;
            stroke-linecap: round;
        }

        .axis-label,
        .legend-item text {
            fill: #526071;
            font-size: 12px;
        }

        .axis-title {
            fill: #344256;
            font-size: 12px;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <main>
        <h1>System Metrics Report</h1>
        <p class="subtitle">Generated at ${escapeHtml(generatedAt)}. Samples captured: ${summary.sampleCount}.</p>
        <p class="notice">These metrics describe the test runner machine where Playwright executed. They do not represent server-side resource usage for the application under test.</p>
        <section class="summary">
            <h2>Run Summary</h2>
            <p>${escapeHtml(summary.summary)}</p>
        </section>
        <section class="metric-grid">
            ${buildMetricCard('Average CPU', formatPercent(summary.averageCpuUsagePercent))}
            ${buildMetricCard('Max CPU', formatPercent(summary.maxCpuUsagePercent))}
            ${buildMetricCard('Max Memory Usage', `${summary.maxMemoryUsagePercent}%`)}
            ${buildMetricCard('Max Used RAM', formatMb(summary.maxUsedMemoryMb))}
            ${buildMetricCard('Max Node Runner RSS', formatMb(summary.maxProcessRssMb))}
            ${buildMetricCard('Sample Count', String(summary.sampleCount))}
        </section>
        ${cpuChart}
        ${memoryPercentChart}
        ${memoryMbChart}
    </main>
</body>
</html>`;
};

const persistHtmlReport = (summary: ResourceSummary): void => {
    const {htmlPath} = getMetricFilePaths();
    fs.writeFileSync(htmlPath, buildMetricsReportHtml(summary), 'utf-8');
};

export const startResourceMonitor = (): string => {
    if (!environment.resourceMonitoring.enabled) {
        logger.info('Resource monitor is disabled by configuration.');
        return getMetricsDir();
    }

    if (environment.resourceMonitoring.source !== 'local') {
        throw new Error(`Unsupported resource monitoring source: ${environment.resourceMonitoring.source}`);
    }

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
    }, environment.resourceMonitoring.intervalMs);

    timer.unref();
    logger.info(`Resource monitor started. Source: ${environment.resourceMonitoring.source}. Interval: ${environment.resourceMonitoring.intervalMs}ms. Metrics directory: ${metricsDir}`);
    return metricsDir;
};

export const stopResourceMonitor = (): ResourceSummary | null => {
    if (!environment.resourceMonitoring.enabled) {
        logger.info('Resource monitor stop skipped because monitoring is disabled.');
        return null;
    }

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
    persistHtmlReport(summary);

    logger.info(`Resource monitor stopped. Summary saved: ${summaryPath}`);
    return summary;
};
