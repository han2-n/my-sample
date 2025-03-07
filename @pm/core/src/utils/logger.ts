export interface LoggerOptions {
  level: 'debug' | 'error' | 'info' | 'warn';
  prefix?: string;
}

export function createLogger(options: LoggerOptions) {
  const { level, prefix = '[Plugin]' } = options;

  // Log level priority
  const logLevels = {
    debug: 0,
    error: 3,
    info: 1,
    warn: 2,
  };

  const minLevel = logLevels[level];

  return {
    debug(message: string, ...args: any[]) {
      if (logLevels.debug >= minLevel) {
        console.debug(`${prefix} ${message}`, ...args);
      }
    },

    error(message: string, ...args: any[]) {
      if (logLevels.error >= minLevel) {
        console.error(`${prefix} ${message}`, ...args);
      }
    },

    info(message: string, ...args: any[]) {
      if (logLevels.info >= minLevel) {
        console.info(`${prefix} ${message}`, ...args);
      }
    },

    warn(message: string, ...args: any[]) {
      if (logLevels.warn >= minLevel) {
        console.warn(`${prefix} ${message}`, ...args);
      }
    },
  };
}
