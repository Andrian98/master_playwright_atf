const REDACTED = '[REDACTED]';

const sensitiveKeyPatterns = [
    'authorization',
    'cookie',
    'password',
    'secret',
    'token',
    'apikey',
    'api-key',
    'x-api-key',
];

const isSensitiveKey = (key: string): boolean => {
    const normalizedKey = key.toLowerCase();
    return sensitiveKeyPatterns.some(pattern => normalizedKey.includes(pattern));
};

const redactValue = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(item => redactValue(item));
    }

    if (value && typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((redactedObject, [key, objectValue]) => {
            redactedObject[key] = isSensitiveKey(key) ? REDACTED : redactValue(objectValue);
            return redactedObject;
        }, {});
    }

    return value;
};

export const redactUrl = (url: string): string => {
    return url.replace(/\/login\/([^/?#]+)\/([^/?#]+)/g, '/login/$1/[REDACTED]');
};

export const redactHeaders = (headers: Record<string, string>): Record<string, string> => {
    return Object.entries(headers).reduce<Record<string, string>>((redactedHeaders, [key, value]) => {
        redactedHeaders[key] = isSensitiveKey(key) ? REDACTED : value;
        return redactedHeaders;
    }, {});
};

export const redactText = (value: string | null): string | null => {
    if (value === null) {
        return null;
    }

    try {
        return JSON.stringify(redactValue(JSON.parse(value)), null, 2);
    } catch {
        return value
            .replace(/((?:password|token|secret|apiKey|apikey|authorization|cookie)\s*[:=]\s*)("[^"]*"|[^,&\s}]+)/gi, `$1${REDACTED}`)
            .replace(/(\/login\/[^/?#]+\/)([^/?#\s]+)/g, `$1${REDACTED}`);
    }
};
