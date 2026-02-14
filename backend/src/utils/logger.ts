type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const formatLogEntry = (entry: LogEntry): string => {
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${dataStr}`;
};

export const logger = {
  info: (message: string, data?: unknown) => {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: 'info',
      message,
      data,
    };
    console.log(formatLogEntry(entry));
  },

  warn: (message: string, data?: unknown) => {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: 'warn',
      message,
      data,
    };
    console.warn(formatLogEntry(entry));
  },

  error: (message: string, data?: unknown) => {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: 'error',
      message,
      data,
    };
    console.error(formatLogEntry(entry));
  },

  debug: (message: string, data?: unknown) => {
    if (process.env.DEBUG === 'true') {
      const entry: LogEntry = {
        timestamp: formatTimestamp(),
        level: 'debug',
        message,
        data,
      };
      console.debug(formatLogEntry(entry));
    }
  },
};
